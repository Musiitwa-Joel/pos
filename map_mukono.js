import { registryPool } from "./packages/server/config/config.js";

async function mapMukono() {
    console.log("📡 [Vanguard HQ] Searching and Mapping Mukono General...");
    try {
        const [dbs] = await registryPool.query("SHOW DATABASES LIKE 'tred_%'");
        const mukonoDb = dbs.map(d => Object.values(d)[0]).find(name => name.includes('mukono'));
        
        if (mukonoDb) {
            console.log(`✅ [Vanguard HQ] Found node: ${mukonoDb}. Mapping identity...`);
            const [rows] = await registryPool.query("SELECT id FROM tenants WHERE db_name = ?", [mukonoDb]);
            
            if (rows.length > 0) {
                const tenantId = rows[0].id;
                await registryPool.query("UPDATE tenants SET owner_email = 'musiitwajoel@gmail.com' WHERE id = ?", [tenantId]);
                console.log("✅ [Vanguard HQ] Identity Synchronization Successful.");
            } else {
                 console.warn("⚠️ [Vanguard HQ] Node found but NOT in registry. Running deep scan...");
                 // Handled by the next pulse
            }
        } else {
            console.error("❌ [Vanguard HQ] Mukono General terminal NOT found in database hub.");
        }
        process.exit(0);
    } catch (err) {
        console.error("❌ [Vanguard HQ] Mapping Failed:", err.message);
        process.exit(1);
    }
}

mapMukono();
