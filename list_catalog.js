import { registryPool } from "./packages/server/config/config.js";

async function listAll() {
    console.log("📡 [Vanguard HQ] Fetching Complete Database Catalog...");
    try {
        const [dbs] = await registryPool.query("SHOW DATABASES");
        dbs.forEach(db => console.log(` - ${db[Object.keys(db)[0]]}`));
        process.exit(0);
    } catch (err) {
        console.error("❌ [Vanguard HQ] Catalog Retrieval Failed:", err.message);
        process.exit(1);
    }
}
listAll();
