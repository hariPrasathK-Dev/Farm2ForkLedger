const { Pool } = require("pg");
const logger = require("../utils/logger");

let pool;

const connectDatabase = async () => {
  try {
    pool = new Pool({
      user: process.env.DB_USER || "richs_user",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "richs_pizza_traceability",
      password: process.env.DB_PASSWORD || "richs_password",
      port: process.env.DB_PORT || 5432,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Test the connection
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();

    logger.info("Database connection established successfully");
    return pool;
  } catch (error) {
    logger.error("Database connection failed:", error);
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error("Database not connected. Call connectDatabase() first.");
  }
  return pool;
};

const closeDatabase = async () => {
  if (pool) {
    await pool.end();
    logger.info("Database connection closed");
  }
};

module.exports = {
  connectDatabase,
  getPool,
  closeDatabase,
};
