import { db } from './packages/server/config/config.js';
import { INVENTORY_SCHEMA_SQL } from './packages/server/utils/schema.js';

async function syncSchema() {
  console.log("Checking database schema...");
  try {
    for (const sql of INVENTORY_SCHEMA_SQL) {
      await db.query(sql);
    }
    console.log("Database schema synchronized successfully (InnoDB tables ensure data integrity).");
    process.exit(0);
  } catch (err) {
    console.error("Schema sync failed:", err.message);
    process.exit(1);
  }
}

syncSchema();
