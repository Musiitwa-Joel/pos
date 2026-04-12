import { registryPool } from '../config/config.js';

async function discoverEcosystem() {
  console.log("🚀 [Vanguard Hub] Starting Global Ecosystem Discovery...");

  try {
    const [rows] = await registryPool.query("SHOW DATABASES WHERE `Database` LIKE 'tredpos_%' AND `Database` != 'tredpos_registry'");
    
    if (rows.length === 0) {
      console.log("⚠️ [Vanguard Hub] Analysis: No legacy institutional databases found.");
    } else {
      console.log(`✅ [Vanguard Hub] Discovery: Found ${rows.length} legacy node(s):`);
      rows.forEach(r => console.log(` - ${r.Database}`));
    }
    
    process.exit(0);
  } catch (err) {
    console.error("❌ [Vanguard Hub] Discovery Failure:", err.message);
    process.exit(1);
  }
}

discoverEcosystem();
