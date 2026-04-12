import mysql from "mysql2/promise";

const port = process.env.PORT || 9000;
const host = process.env.DB_HOST || "localhost";
const baseUrl = `http://${host}:${port}/logos/`;
const imagesUrl = `http://${host}:2222`;
const test = "testing123";
const MAX_RESULTS = 1000;

const DEFAULT_DB_NAME = process.env.DB_NAME || "tred_hardware";
const pools = new Map();

// Helper to create a pool for any database
const createPool = (databaseName) => {
  return mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    database: databaseName,
    password: process.env.DB_PASSWORD || "",
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    connectTimeout: 10000,
  });
};

// Default Institutional Pool (Legacy/Global)
const db = createPool(DEFAULT_DB_NAME);

// Dedicated HSM v2.4 Registry Hub Pool (Metadata isolation)
const registryPool = createPool("tredpos_registry");

/**
 * 🏛️ Infrastructure Configuration Registry
 * Fetches global settings from the database with environment fallbacks.
 */
let dbConfig = {};
try {
  const [rows] = await registryPool.query("SELECT setting_key, setting_value FROM system_settings");
  dbConfig = Object.fromEntries(rows.map(r => [r.setting_key.toUpperCase(), r.setting_value]));
} catch (err) {
  console.warn("[Config Hub] Database not ready, using environment defaults.");
}

const getConfig = (key, fallback) => {
  return dbConfig[key] || process.env[key] || fallback;
};

// Exported configuration with DB priority
const PRIVATE_KEY = getConfig("PRIVATE_KEY", "tredpos_standard_node@2025");
const GOOGLE_CLIENT_ID = getConfig("GOOGLE_CLIENT_ID", "");
const SMTP_USER = getConfig("SMTP_USER", "tredumollc@gmail.com");
const SMTP_PASS = getConfig("SMTP_PASS", "zyki wbba ffeh ohlb");
const FROM_EMAIL = getConfig("FROM_EMAIL", "tredumollc@gmail.com");

// Dynamic Institutional Router
export const getTenantPool = (dbName) => {
  if (!dbName || dbName === DEFAULT_DB_NAME) return db;
  if (!pools.has(dbName)) {
    console.log(`[TredPOS Router] Initializing Connection Buffer for: ${dbName}`);
    pools.set(dbName, createPool(dbName));
  }
  return pools.get(dbName);
};

// Verify master connection
try {
  const connection = await db.getConnection();
  console.log("Database connection established successfully");
  connection.release();
} catch (error) {
  console.error("Database connection failed:", error.message);
}

export {
  baseUrl,
  port,
  db,
  registryPool,
  host,
  MAX_RESULTS,
  imagesUrl,
  PRIVATE_KEY,
  GOOGLE_CLIENT_ID,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL
};
