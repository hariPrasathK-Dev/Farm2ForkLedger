const express = require("express");
const { body, validationResult } = require("express-validator");
const { ethers } = require("ethers");
const logger = require("../utils/logger");

const router = express.Router();

// Initialize ethers provider and contract
const provider = new ethers.JsonRpcProvider(
  process.env.BESU_RPC_URL || "http://localhost:8545"
);

// Contract ABI and address (loaded from deployment artifacts)
const contractABI = require("../../deployments/SupplyChain.json").abi;
const contractAddress = process.env.CONTRACT_ADDRESS;

if (!contractAddress) {
  logger.error("CONTRACT_ADDRESS environment variable not set");
  process.exit(1);
}

const contract = new ethers.Contract(contractAddress, contractABI, provider);

/**
 * POST /api/transactions/create
 * Creates a new ingredient on the blockchain
 */
router.post(
  "/create",
  [
    body("productId")
      .isLength({ min: 1 })
      .withMessage("Product ID is required"),
    body("lotCode").isLength({ min: 1 }).withMessage("Lot code is required"),
    body("location").isLength({ min: 1 }).withMessage("Location is required"),
    body("privateKey")
      .isLength({ min: 1 })
      .withMessage("Private key is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { productId, lotCode, location, privateKey, privateFor } = req.body;

      // Create wallet from private key
      const wallet = new ethers.Wallet(privateKey, provider);
      const contractWithSigner = contract.connect(wallet);

      // Prepare transaction
      const txData = contractWithSigner.interface.encodeFunctionData(
        "createIngredient",
        [productId, lotCode, location]
      );

      let tx;
      if (privateFor && privateFor.length > 0) {
        // Private transaction
        tx = await wallet.sendTransaction({
          to: contractAddress,
          data: txData,
          privateFor: privateFor,
        });
      } else {
        // Public transaction
        tx = await contractWithSigner.createIngredient(
          productId,
          lotCode,
          location
        );
      }

      logger.info(`Transaction submitted: ${tx.hash}`);

      res.json({
        status: "pending",
        transactionHash: tx.hash,
        message: "Ingredient creation transaction submitted",
      });
    } catch (error) {
      logger.error("Error creating ingredient:", error);
      res.status(500).json({
        error: "Transaction Failed",
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/transactions/combine
 * Combines existing ingredients into a new product
 */
router.post(
  "/combine",
  [
    body("newProductId")
      .isLength({ min: 1 })
      .withMessage("New product ID is required"),
    body("newLotCode")
      .isLength({ min: 1 })
      .withMessage("New lot code is required"),
    body("parentItemIds")
      .isArray({ min: 1 })
      .withMessage("Parent item IDs must be a non-empty array"),
    body("location").isLength({ min: 1 }).withMessage("Location is required"),
    body("privateKey")
      .isLength({ min: 1 })
      .withMessage("Private key is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        newProductId,
        newLotCode,
        parentItemIds,
        location,
        privateKey,
        privateFor,
      } = req.body;

      // Create wallet from private key
      const wallet = new ethers.Wallet(privateKey, provider);
      const contractWithSigner = contract.connect(wallet);

      // Prepare transaction
      const txData = contractWithSigner.interface.encodeFunctionData(
        "combineItems",
        [newProductId, newLotCode, parentItemIds, location]
      );

      let tx;
      if (privateFor && privateFor.length > 0) {
        // Private transaction
        tx = await wallet.sendTransaction({
          to: contractAddress,
          data: txData,
          privateFor: privateFor,
        });
      } else {
        // Public transaction
        tx = await contractWithSigner.combineItems(
          newProductId,
          newLotCode,
          parentItemIds,
          location
        );
      }

      logger.info(`Transaction submitted: ${tx.hash}`);

      res.json({
        status: "pending",
        transactionHash: tx.hash,
        message: "Item combination transaction submitted",
      });
    } catch (error) {
      logger.error("Error combining items:", error);
      res.status(500).json({
        error: "Transaction Failed",
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/transactions/ship
 * Ships an item to a new owner
 */
router.post(
  "/ship",
  [
    body("itemId").isLength({ min: 1 }).withMessage("Item ID is required"),
    body("receiver")
      .isEthereumAddress()
      .withMessage("Valid receiver address is required"),
    body("location").isLength({ min: 1 }).withMessage("Location is required"),
    body("temperature").isNumeric().withMessage("Temperature must be a number"),
    body("privateKey")
      .isLength({ min: 1 })
      .withMessage("Private key is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        itemId,
        receiver,
        location,
        temperature,
        privateKey,
        privateFor,
      } = req.body;

      // Create wallet from private key
      const wallet = new ethers.Wallet(privateKey, provider);
      const contractWithSigner = contract.connect(wallet);

      // Convert temperature to integer (multiply by 100)
      const tempInt = Math.round(temperature * 100);

      // Prepare transaction
      const txData = contractWithSigner.interface.encodeFunctionData(
        "shipItem",
        [itemId, receiver, location, tempInt]
      );

      let tx;
      if (privateFor && privateFor.length > 0) {
        // Private transaction
        tx = await wallet.sendTransaction({
          to: contractAddress,
          data: txData,
          privateFor: privateFor,
        });
      } else {
        // Public transaction
        tx = await contractWithSigner.shipItem(
          itemId,
          receiver,
          location,
          tempInt
        );
      }

      logger.info(`Transaction submitted: ${tx.hash}`);

      res.json({
        status: "pending",
        transactionHash: tx.hash,
        message: "Item shipment transaction submitted",
      });
    } catch (error) {
      logger.error("Error shipping item:", error);
      res.status(500).json({
        error: "Transaction Failed",
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/transactions/receive
 * Confirms receipt of an item
 */
router.post(
  "/receive",
  [
    body("itemId").isLength({ min: 1 }).withMessage("Item ID is required"),
    body("location").isLength({ min: 1 }).withMessage("Location is required"),
    body("temperature").isNumeric().withMessage("Temperature must be a number"),
    body("privateKey")
      .isLength({ min: 1 })
      .withMessage("Private key is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { itemId, location, temperature, privateKey, privateFor } =
        req.body;

      // Create wallet from private key
      const wallet = new ethers.Wallet(privateKey, provider);
      const contractWithSigner = contract.connect(wallet);

      // Convert temperature to integer (multiply by 100)
      const tempInt = Math.round(temperature * 100);

      // Prepare transaction
      const txData = contractWithSigner.interface.encodeFunctionData(
        "receiveItem",
        [itemId, location, tempInt]
      );

      let tx;
      if (privateFor && privateFor.length > 0) {
        // Private transaction
        tx = await wallet.sendTransaction({
          to: contractAddress,
          data: txData,
          privateFor: privateFor,
        });
      } else {
        // Public transaction
        tx = await contractWithSigner.receiveItem(itemId, location, tempInt);
      }

      logger.info(`Transaction submitted: ${tx.hash}`);

      res.json({
        status: "pending",
        transactionHash: tx.hash,
        message: "Item receipt transaction submitted",
      });
    } catch (error) {
      logger.error("Error receiving item:", error);
      res.status(500).json({
        error: "Transaction Failed",
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/transactions/:txHash/status
 * Gets the status of a transaction
 */
router.get("/:txHash/status", async (req, res) => {
  try {
    const { txHash } = req.params;

    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return res.json({ status: "pending" });
    }

    const status = receipt.status === 1 ? "success" : "failed";

    res.json({
      status,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      logs: receipt.logs,
    });
  } catch (error) {
    logger.error("Error fetching transaction status:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch transaction status",
    });
  }
});

module.exports = router;
