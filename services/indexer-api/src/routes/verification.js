const express = require("express");
const { param, validationResult } = require("express-validator");
const { ethers } = require("ethers");
const { getPool } = require("../database/connection");
const logger = require("../utils/logger");

const router = express.Router();

/**
 * Verifies database data against blockchain data for a specific item
 */
async function verifyAgainstBlockchain(itemId) {
  try {
    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(
      process.env.BESU_RPC_URL || "http://localhost:8545"
    );
    const contractABI = require("../../deployments/SupplyChain.json").abi;
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractABI,
      provider
    );

    // Get item from blockchain
    const blockchainItem = await contract.getItem(itemId);

    // Get item from database
    const pool = getPool();
    const dbResult = await pool.query(
      "SELECT * FROM items WHERE item_id = $1",
      [itemId]
    );

    if (dbResult.rows.length === 0) {
      return {
        verified: false,
        error: "Item not found in database",
        discrepancies: ["Database record missing"],
      };
    }

    const dbItem = dbResult.rows[0];

    // Compare critical fields
    const verification = {
      verified: true,
      discrepancies: [],
      blockchainData: {
        itemId: blockchainItem.itemId,
        lotCode: blockchainItem.lotCode,
        productId: blockchainItem.productId,
        currentOwner: blockchainItem.currentOwner,
        creationDate: blockchainItem.creationDate.toString(),
        status: blockchainItem.status,
      },
      databaseData: {
        itemId: dbItem.item_id,
        lotCode: dbItem.lot_code,
        productId: dbItem.product_id,
        currentOwner: dbItem.current_owner,
        creationDate: Math.floor(
          new Date(dbItem.creation_date).getTime() / 1000
        ).toString(),
      },
      trustScore: 100,
    };

    // Check for discrepancies
    if (blockchainItem.lotCode !== dbItem.lot_code) {
      verification.verified = false;
      verification.discrepancies.push("Lot code mismatch detected");
      verification.trustScore -= 30;
    }

    if (blockchainItem.productId !== dbItem.product_id) {
      verification.verified = false;
      verification.discrepancies.push("Product ID mismatch detected");
      verification.trustScore -= 25;
    }

    if (
      blockchainItem.currentOwner.toLowerCase() !==
      dbItem.current_owner.toLowerCase()
    ) {
      verification.verified = false;
      verification.discrepancies.push("Current owner mismatch detected");
      verification.trustScore -= 40;
    }

    // Verify creation date (allow 1 second tolerance for timestamp differences)
    const blockchainTimestamp = parseInt(
      blockchainItem.creationDate.toString()
    );
    const databaseTimestamp = Math.floor(
      new Date(dbItem.creation_date).getTime() / 1000
    );

    if (Math.abs(blockchainTimestamp - databaseTimestamp) > 1) {
      verification.verified = false;
      verification.discrepancies.push("Creation date mismatch detected");
      verification.trustScore -= 20;
    }

    // Ensure trust score doesn't go below 0
    verification.trustScore = Math.max(0, verification.trustScore);

    return verification;
  } catch (error) {
    logger.error("Blockchain verification failed:", error);
    return {
      verified: false,
      error: `Blockchain verification unavailable: ${error.message}`,
      discrepancies: ["Unable to connect to blockchain for verification"],
      trustScore: 0,
    };
  }
}

/**
 * GET /api/verification/:lotCode
 * Verifies a lot code against the blockchain
 */
router.get(
  "/:lotCode",
  [param("lotCode").isLength({ min: 1 }).withMessage("Lot code is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { lotCode } = req.params;
      const pool = getPool();

      // Get item ID from lot code
      const itemResult = await pool.query(
        "SELECT item_id FROM items WHERE lot_code = $1",
        [lotCode]
      );

      if (itemResult.rows.length === 0) {
        return res.status(404).json({
          error: "Item not found",
          message: `No item found with lot code: ${lotCode}`,
        });
      }

      const itemId = itemResult.rows[0].item_id;
      const verification = await verifyAgainstBlockchain(itemId);

      res.json({
        lotCode,
        itemId,
        verification,
        verificationTime: new Date().toISOString(),
        message: verification.verified
          ? "Data successfully verified against blockchain"
          : "Verification failed - discrepancies detected",
      });
    } catch (error) {
      logger.error("Verification endpoint error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Verification process failed",
      });
    }
  }
);

/**
 * GET /api/verification/batch/:lotCodes
 * Verifies multiple lot codes at once
 */
router.get(
  "/batch/:lotCodes",
  [
    param("lotCodes")
      .isLength({ min: 1 })
      .withMessage("Lot codes are required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const lotCodes = req.params.lotCodes.split(",");
      const pool = getPool();

      const verificationResults = [];

      for (const lotCode of lotCodes) {
        try {
          const itemResult = await pool.query(
            "SELECT item_id FROM items WHERE lot_code = $1",
            [lotCode.trim()]
          );

          if (itemResult.rows.length === 0) {
            verificationResults.push({
              lotCode: lotCode.trim(),
              verification: {
                verified: false,
                error: "Item not found",
                trustScore: 0,
              },
            });
            continue;
          }

          const itemId = itemResult.rows[0].item_id;
          const verification = await verifyAgainstBlockchain(itemId);

          verificationResults.push({
            lotCode: lotCode.trim(),
            itemId,
            verification,
          });
        } catch (error) {
          logger.error(`Verification failed for lot code ${lotCode}:`, error);
          verificationResults.push({
            lotCode: lotCode.trim(),
            verification: {
              verified: false,
              error: error.message,
              trustScore: 0,
            },
          });
        }
      }

      // Calculate overall trust score
      const validResults = verificationResults.filter(
        (r) => r.verification.trustScore !== undefined
      );
      const overallTrustScore =
        validResults.length > 0
          ? Math.round(
              validResults.reduce(
                (sum, r) => sum + r.verification.trustScore,
                0
              ) / validResults.length
            )
          : 0;

      res.json({
        results: verificationResults,
        summary: {
          totalItems: lotCodes.length,
          verifiedItems: verificationResults.filter(
            (r) => r.verification.verified
          ).length,
          failedItems: verificationResults.filter(
            (r) => !r.verification.verified
          ).length,
          overallTrustScore,
        },
        verificationTime: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Batch verification endpoint error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Batch verification process failed",
      });
    }
  }
);

/**
 * GET /api/verification/test
 * Test endpoint to verify blockchain connection and contract interaction
 */
router.get("/test", async (req, res) => {
  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.BESU_RPC_URL || "http://localhost:8545"
    );

    // Test blockchain connection
    const blockNumber = await provider.getBlockNumber();

    // Test contract connection
    const contractABI = require("../../deployments/SupplyChain.json").abi;
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractABI,
      provider
    );

    // Try to call a simple contract function
    const adminRole = await contract.ADMIN_ROLE();

    res.json({
      status: "success",
      blockchain: {
        connected: true,
        currentBlock: blockNumber,
        rpcUrl: process.env.BESU_RPC_URL || "http://localhost:8545",
      },
      contract: {
        connected: true,
        address: process.env.CONTRACT_ADDRESS,
        adminRole: adminRole,
      },
      verification: {
        available: true,
        message: "Verification system is ready",
      },
    });
  } catch (error) {
    logger.error("Verification test failed:", error);
    res.status(500).json({
      status: "error",
      error: error.message,
      verification: {
        available: false,
        message: "Verification system unavailable",
      },
    });
  }
});

module.exports = router;
