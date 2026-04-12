import { registryPool } from "./packages/server/config/config.js";

async function findMukono() {
    console.log("📡 [Vanguard HQ] Searching for Mukono General terminal...");
    try {
        const [dbs] = await registryPool.query("SHOW DATABASES LIKE 'tred_%'");
        console.log("📂 [Vanguard HQ] DISCOVERED TRED NODES:");
        dbs.forEach(db => console.log(` - ${db[Object.keys(db)[0]]}`));
        process.exit(0);
    } catch (err) {
        console.error("❌ [Vanguard HQ] Discovery Failed:", err.message);
        process.exit(1);
    }
}

findMukono();
