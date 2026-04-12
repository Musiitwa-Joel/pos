import { registryPool, getTenantPool } from "./packages/server/config/config.js";

async function ultimateDiscovery() {
    console.log("📡 [Vanguard HQ] Initiating Ultimate Institutional Discovery...");
    try {
        const [dbs] = await registryPool.query("SHOW DATABASES");
        const candidates = dbs.map(d => Object.values(d)[0])
                             .filter(db => !["information_schema", "mysql", "performance_schema", "phpmyadmin", "tredpos_registry"].includes(db));
        
        for (const dbName of candidates) {
            try {
                const pool = getTenantPool(dbName);
                const [settings] = await pool.query("SELECT setting_value FROM system_settings WHERE (setting_key = 'COMPANY_NAME' OR setting_key = 'storeName') LIMIT 1");
                const bName = settings[0]?.setting_value || "Unnamed Terminal";
                
                const [users] = await pool.query("SELECT email FROM users WHERE email = 'musiitwajoel@gmail.com' LIMIT 1");
                const hasUser = users.length > 0 ? "✅ MATCH" : "❌";
                
                console.log(` - [${dbName}] Business: ${bName} | User Search: ${hasUser}`);
                
                if (hasUser === "✅ MATCH") {
                    console.log(`🚀 [Vanguard HQ] TARGET IDENTIFIED: ${dbName} is the home of Mukono General.`);
                    
                    // Surgical Ре-mapping
                    const [tRows] = await registryPool.query("SELECT id FROM tenants WHERE db_name = ?", [dbName]);
                    if (tRows.length > 0) {
                        await registryPool.query("UPDATE tenants SET owner_email = 'musiitwajoel@gmail.com', name = 'Mukono General' WHERE id = ?", [tRows[0].id]);
                        console.log("✅ [Vanguard HQ] Identity Synchronization Successful.");
                    } else {
                        console.log(`⚠️ [Vanguard HQ] Node ${dbName} not in registry. Registering now...`);
                        await registryPool.query("INSERT INTO tenants (name, db_name, owner_email, status) VALUES (?, ?, ?, ?)", 
                            ['Mukono General', dbName, 'musiitwajoel@gmail.com', 'active']);
                        console.log("✅ [Vanguard HQ] Node Registration and Mapping Complete.");
                    }
                    process.exit(0);
                }
            } catch (err) {
                // skip broken/unrelated DBs
            }
        }
        console.error("❌ [Vanguard HQ] Mukono General not found in any recognizable node.");
        process.exit(1);
    } catch (err) {
        console.error("❌ [Vanguard HQ] Discovery Failed:", err.message);
        process.exit(1);
    }
}
ultimateDiscovery();
