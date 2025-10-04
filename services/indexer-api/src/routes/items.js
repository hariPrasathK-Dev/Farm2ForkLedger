const express = require("express");
const { param, query, validationResult } = require("express-validator");
const { getPool } = require("../database/connection");
const logger = require("../utils/logger");

const router = express.Router();

/**
 * GET /api/items/:itemId
 * Gets item details and history for a specific item ID
 */
router.get(
  "/:itemId",
  [param("itemId").isLength({ min: 1 }).withMessage("Item ID is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { itemId } = req.params;
      const pool = getPool();

      // Get item details
      const itemQuery = `
      SELECT item_id, product_id, lot_code, current_owner, creation_date
      FROM items 
      WHERE item_id = $1
    `;

      const itemResult = await pool.query(itemQuery, [itemId]);

      if (itemResult.rows.length === 0) {
        return res.status(404).json({
          error: "Item not found",
          message: `No item found with ID: ${itemId}`,
        });
      }

      const item = itemResult.rows[0];

      // Get item history
      const historyQuery = `
      SELECT status, actor, timestamp, location, temperature_celsius
      FROM item_history 
      WHERE item_id = $1 
      ORDER BY timestamp ASC
    `;

      const historyResult = await pool.query(historyQuery, [itemId]);

      // Get parent items
      const parentsQuery = `
      SELECT p.parent_item_id, i.product_id, i.lot_code, i.current_owner
      FROM item_parents p
      JOIN items i ON p.parent_item_id = i.item_id
      WHERE p.item_id = $1
    `;

      const parentsResult = await pool.query(parentsQuery, [itemId]);

      res.json({
        item,
        history: historyResult.rows,
        parents: parentsResult.rows,
      });
    } catch (error) {
      logger.error("Error fetching item details:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve item information",
      });
    }
  }
);

/**
 * GET /api/items
 * Gets a paginated list of items with optional filtering
 */
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("owner")
      .optional()
      .isEthereumAddress()
      .withMessage("Owner must be a valid Ethereum address"),
    query("productId")
      .optional()
      .isLength({ min: 1 })
      .withMessage("Product ID cannot be empty"),
    query("status")
      .optional()
      .isIn(["CREATED", "IN_TRANSIT", "RECEIVED", "CONSUMED", "RECALLED"])
      .withMessage("Invalid status"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const { owner, productId, status } = req.query;

      const pool = getPool();

      // Build query with filters
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      if (owner) {
        whereConditions.push(`current_owner = $${paramIndex++}`);
        queryParams.push(owner);
      }

      if (productId) {
        whereConditions.push(`product_id ILIKE $${paramIndex++}`);
        queryParams.push(`%${productId}%`);
      }

      // Note: Status filtering would require joining with latest history entry
      // For simplicity, we'll skip this in the basic implementation

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM items ${whereClause}`;
      const countResult = await pool.query(countQuery, queryParams);
      const totalItems = parseInt(countResult.rows[0].count);

      // Get items with pagination
      const itemsQuery = `
      SELECT item_id, product_id, lot_code, current_owner, creation_date
      FROM items 
      ${whereClause}
      ORDER BY creation_date DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

      queryParams.push(limit, offset);
      const itemsResult = await pool.query(itemsQuery, queryParams);

      const totalPages = Math.ceil(totalItems / limit);

      res.json({
        items: itemsResult.rows,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      logger.error("Error fetching items list:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve items list",
      });
    }
  }
);

/**
 * GET /api/items/owner/:address
 * Gets all items owned by a specific address
 */
router.get(
  "/owner/:address",
  [
    param("address")
      .isEthereumAddress()
      .withMessage("Valid Ethereum address is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { address } = req.params;
      const pool = getPool();

      const itemsQuery = `
      SELECT item_id, product_id, lot_code, current_owner, creation_date
      FROM items 
      WHERE current_owner = $1
      ORDER BY creation_date DESC
    `;

      const itemsResult = await pool.query(itemsQuery, [address]);

      res.json({
        owner: address,
        items: itemsResult.rows,
        count: itemsResult.rows.length,
      });
    } catch (error) {
      logger.error("Error fetching items by owner:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve items by owner",
      });
    }
  }
);

module.exports = router;
