const express = require("express");
const { body, param, validationResult } = require("express-validator");
const { getPool } = require("../database/connection");
const logger = require("../utils/logger");

const router = express.Router();

/**
 * GET /api/traceability/:lotCode
 * Retrieves the full traceability tree for a product lot code
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

      // Get the main item
      const itemQuery = `
      SELECT item_id, product_id, lot_code, current_owner, creation_date
      FROM items 
      WHERE lot_code = $1
    `;

      const itemResult = await pool.query(itemQuery, [lotCode]);

      if (itemResult.rows.length === 0) {
        return res.status(404).json({
          error: "Item not found",
          message: `No item found with lot code: ${lotCode}`,
        });
      }

      const mainItem = itemResult.rows[0];

      // Build the traceability tree recursively
      const traceabilityTree = await buildTraceabilityTree(
        pool,
        mainItem.item_id
      );

      // Get item history
      const historyQuery = `
      SELECT status, actor, timestamp, location, temperature_celsius
      FROM item_history 
      WHERE item_id = $1 
      ORDER BY timestamp ASC
    `;

      const historyResult = await pool.query(historyQuery, [mainItem.item_id]);

      res.json({
        item: mainItem,
        traceabilityTree,
        history: historyResult.rows,
      });
    } catch (error) {
      logger.error("Error fetching traceability data:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve traceability information",
      });
    }
  }
);

/**
 * Recursively builds the traceability tree for an item
 */
async function buildTraceabilityTree(pool, itemId) {
  // Get the item details
  const itemQuery = `
    SELECT item_id, product_id, lot_code, current_owner, creation_date
    FROM items 
    WHERE item_id = $1
  `;

  const itemResult = await pool.query(itemQuery, [itemId]);

  if (itemResult.rows.length === 0) {
    return null;
  }

  const item = itemResult.rows[0];

  // Get parent items
  const parentsQuery = `
    SELECT parent_item_id
    FROM item_parents 
    WHERE item_id = $1
  `;

  const parentsResult = await pool.query(parentsQuery, [itemId]);

  // Recursively build parent trees
  const parents = [];
  for (const parent of parentsResult.rows) {
    const parentTree = await buildTraceabilityTree(pool, parent.parent_item_id);
    if (parentTree) {
      parents.push(parentTree);
    }
  }

  return {
    ...item,
    parents,
  };
}

/**
 * GET /api/traceability/item/:itemId/tree
 * Gets the full ingredient tree for a specific item ID
 */
router.get(
  "/item/:itemId/tree",
  [param("itemId").isLength({ min: 1 }).withMessage("Item ID is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { itemId } = req.params;
      const pool = getPool();

      const traceabilityTree = await buildTraceabilityTree(pool, itemId);

      if (!traceabilityTree) {
        return res.status(404).json({
          error: "Item not found",
          message: `No item found with ID: ${itemId}`,
        });
      }

      res.json({ traceabilityTree });
    } catch (error) {
      logger.error("Error building traceability tree:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to build traceability tree",
      });
    }
  }
);

module.exports = router;
