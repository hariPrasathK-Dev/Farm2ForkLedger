const { ethers } = require("ethers");
const { getPool } = require("../database/connection");
const logger = require("../utils/logger");

class BlockchainIndexer {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.BESU_RPC_URL || "http://localhost:8545"
    );
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.contractABI = require("../../deployments/SupplyChain.json").abi;
    this.contract = new ethers.Contract(
      this.contractAddress,
      this.contractABI,
      this.provider
    );
    this.isRunning = false;
    this.lastProcessedBlock = 0;
  }

  async start() {
    if (this.isRunning) {
      logger.warn("Indexer is already running");
      return;
    }

    try {
      this.isRunning = true;
      logger.info("Starting blockchain indexer...");

      // Get the latest block number from database
      await this.loadLastProcessedBlock();

      // Start listening for new events
      this.setupEventListeners();

      // Process historical events if needed
      await this.processHistoricalEvents();

      logger.info("Blockchain indexer started successfully");
    } catch (error) {
      logger.error("Failed to start indexer:", error);
      this.isRunning = false;
      throw error;
    }
  }

  async stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    this.contract.removeAllListeners();
    logger.info("Blockchain indexer stopped");
  }

  async loadLastProcessedBlock() {
    try {
      const pool = getPool();

      // Create indexer_state table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS indexer_state (
          id SERIAL PRIMARY KEY,
          last_processed_block INTEGER NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const result = await pool.query(
        "SELECT last_processed_block FROM indexer_state ORDER BY id DESC LIMIT 1"
      );

      if (result.rows.length > 0) {
        this.lastProcessedBlock = result.rows[0].last_processed_block;
      } else {
        // Initialize with current block - 100 to catch recent events
        const currentBlock = await this.provider.getBlockNumber();
        this.lastProcessedBlock = Math.max(0, currentBlock - 100);

        // Insert initial state
        await pool.query(
          "INSERT INTO indexer_state (last_processed_block) VALUES ($1)",
          [this.lastProcessedBlock]
        );
      }

      logger.info(`Indexer starting from block: ${this.lastProcessedBlock}`);
    } catch (error) {
      logger.error("Error loading last processed block:", error);
      throw error;
    }
  }

  async updateLastProcessedBlock(blockNumber) {
    try {
      const pool = getPool();
      await pool.query(
        "UPDATE indexer_state SET last_processed_block = $1, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM indexer_state ORDER BY id DESC LIMIT 1)",
        [blockNumber]
      );
      this.lastProcessedBlock = blockNumber;
    } catch (error) {
      logger.error("Error updating last processed block:", error);
    }
  }

  setupEventListeners() {
    // Listen for ItemCreated events
    this.contract.on(
      "ItemCreated",
      async (itemId, owner, productId, lotCode, timestamp, event) => {
        try {
          await this.handleItemCreated(
            itemId,
            owner,
            productId,
            lotCode,
            timestamp,
            event
          );
        } catch (error) {
          logger.error("Error handling ItemCreated event:", error);
        }
      }
    );

    // Listen for ItemStateChanged events
    this.contract.on(
      "ItemStateChanged",
      async (
        itemId,
        newStatus,
        actor,
        location,
        temperature,
        timestamp,
        event
      ) => {
        try {
          await this.handleItemStateChanged(
            itemId,
            newStatus,
            actor,
            location,
            temperature,
            timestamp,
            event
          );
        } catch (error) {
          logger.error("Error handling ItemStateChanged event:", error);
        }
      }
    );

    // Listen for ItemsConsumed events
    this.contract.on(
      "ItemsConsumed",
      async (itemIds, newItemId, actor, timestamp, event) => {
        try {
          await this.handleItemsConsumed(
            itemIds,
            newItemId,
            actor,
            timestamp,
            event
          );
        } catch (error) {
          logger.error("Error handling ItemsConsumed event:", error);
        }
      }
    );

    // Listen for ItemOwnershipTransferred events
    this.contract.on(
      "ItemOwnershipTransferred",
      async (itemId, previousOwner, newOwner, timestamp, event) => {
        try {
          await this.handleOwnershipTransferred(
            itemId,
            previousOwner,
            newOwner,
            timestamp,
            event
          );
        } catch (error) {
          logger.error("Error handling ItemOwnershipTransferred event:", error);
        }
      }
    );

    logger.info("Event listeners set up successfully");
  }

  async processHistoricalEvents() {
    try {
      const currentBlock = await this.provider.getBlockNumber();

      if (this.lastProcessedBlock >= currentBlock) {
        logger.info("No historical events to process");
        return;
      }

      logger.info(
        `Processing historical events from block ${
          this.lastProcessedBlock + 1
        } to ${currentBlock}`
      );

      // Process in chunks to avoid overwhelming the RPC
      const chunkSize = 1000;
      for (
        let fromBlock = this.lastProcessedBlock + 1;
        fromBlock <= currentBlock;
        fromBlock += chunkSize
      ) {
        const toBlock = Math.min(fromBlock + chunkSize - 1, currentBlock);

        await this.processBlockRange(fromBlock, toBlock);
        await this.updateLastProcessedBlock(toBlock);

        logger.info(`Processed blocks ${fromBlock} to ${toBlock}`);
      }

      logger.info("Historical event processing completed");
    } catch (error) {
      logger.error("Error processing historical events:", error);
    }
  }

  async processBlockRange(fromBlock, toBlock) {
    const filter = {
      address: this.contractAddress,
      fromBlock,
      toBlock,
    };

    const logs = await this.provider.getLogs(filter);

    for (const log of logs) {
      try {
        const parsedLog = this.contract.interface.parseLog(log);
        await this.processEvent(parsedLog, log);
      } catch (error) {
        logger.error("Error processing log:", error);
      }
    }
  }

  async processEvent(parsedLog, rawLog) {
    const { name, args } = parsedLog;

    switch (name) {
      case "ItemCreated":
        await this.handleItemCreated(
          args.itemId,
          args.owner,
          args.productId,
          args.lotCode,
          args.timestamp,
          rawLog
        );
        break;
      case "ItemStateChanged":
        await this.handleItemStateChanged(
          args.itemId,
          args.newStatus,
          args.actor,
          args.location,
          args.temperature,
          args.timestamp,
          rawLog
        );
        break;
      case "ItemsConsumed":
        await this.handleItemsConsumed(
          args.itemIds,
          args.newItemId,
          args.actor,
          args.timestamp,
          rawLog
        );
        break;
      case "ItemOwnershipTransferred":
        await this.handleOwnershipTransferred(
          args.itemId,
          args.previousOwner,
          args.newOwner,
          args.timestamp,
          rawLog
        );
        break;
    }
  }

  async handleItemCreated(itemId, owner, productId, lotCode, timestamp, event) {
    try {
      const pool = getPool();

      // Insert into items table
      await pool.query(
        `
        INSERT INTO items (item_id, product_id, lot_code, current_owner, creation_date)
        VALUES ($1, $2, $3, $4, to_timestamp($5))
        ON CONFLICT (item_id) DO NOTHING
      `,
        [itemId, productId, lotCode, owner, timestamp.toString()]
      );

      // Add to history
      await pool.query(
        `
        INSERT INTO item_history (item_id, status, actor, timestamp, location, temperature_celsius)
        VALUES ($1, $2, $3, to_timestamp($4), $5, $6)
      `,
        [itemId, "CREATED", owner, timestamp.toString(), "", null]
      );

      logger.info(`Indexed ItemCreated: ${itemId} (${lotCode})`);
    } catch (error) {
      logger.error("Error handling ItemCreated:", error);
    }
  }

  async handleItemStateChanged(
    itemId,
    newStatus,
    actor,
    location,
    temperature,
    timestamp,
    event
  ) {
    try {
      const pool = getPool();

      // Convert status enum to string
      const statusMap = [
        "CREATED",
        "IN_TRANSIT",
        "RECEIVED",
        "CONSUMED",
        "RECALLED",
      ];
      const statusString = statusMap[newStatus] || "UNKNOWN";

      // Convert temperature from integer back to decimal
      const tempCelsius =
        temperature !== 0 ? (temperature / 100).toFixed(2) : null;

      // Add to history
      await pool.query(
        `
        INSERT INTO item_history (item_id, status, actor, timestamp, location, temperature_celsius)
        VALUES ($1, $2, $3, to_timestamp($4), $5, $6)
      `,
        [
          itemId,
          statusString,
          actor,
          timestamp.toString(),
          location,
          tempCelsius,
        ]
      );

      logger.info(`Indexed ItemStateChanged: ${itemId} -> ${statusString}`);
    } catch (error) {
      logger.error("Error handling ItemStateChanged:", error);
    }
  }

  async handleItemsConsumed(itemIds, newItemId, actor, timestamp, event) {
    try {
      const pool = getPool();

      // Insert parent-child relationships
      for (const parentId of itemIds) {
        await pool.query(
          `
          INSERT INTO item_parents (item_id, parent_item_id)
          VALUES ($1, $2)
          ON CONFLICT (item_id, parent_item_id) DO NOTHING
        `,
          [newItemId, parentId]
        );
      }

      logger.info(
        `Indexed ItemsConsumed: ${itemIds.length} items consumed for ${newItemId}`
      );
    } catch (error) {
      logger.error("Error handling ItemsConsumed:", error);
    }
  }

  async handleOwnershipTransferred(
    itemId,
    previousOwner,
    newOwner,
    timestamp,
    event
  ) {
    try {
      const pool = getPool();

      // Update current owner in items table
      await pool.query(
        `
        UPDATE items 
        SET current_owner = $1, updated_at = to_timestamp($2)
        WHERE item_id = $3
      `,
        [newOwner, timestamp.toString(), itemId]
      );

      logger.info(
        `Indexed OwnershipTransferred: ${itemId} from ${previousOwner} to ${newOwner}`
      );
    } catch (error) {
      logger.error("Error handling OwnershipTransferred:", error);
    }
  }
}

// Start indexer if this file is run directly
if (require.main === module) {
  const { connectDatabase } = require("../database/connection");

  async function startIndexer() {
    try {
      await connectDatabase();

      const indexer = new BlockchainIndexer();
      await indexer.start();

      // Graceful shutdown
      process.on("SIGTERM", async () => {
        logger.info("Received SIGTERM, shutting down indexer...");
        await indexer.stop();
        process.exit(0);
      });

      process.on("SIGINT", async () => {
        logger.info("Received SIGINT, shutting down indexer...");
        await indexer.stop();
        process.exit(0);
      });
    } catch (error) {
      logger.error("Failed to start indexer:", error);
      process.exit(1);
    }
  }

  startIndexer();
}

module.exports = BlockchainIndexer;
