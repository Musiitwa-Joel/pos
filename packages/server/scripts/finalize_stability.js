import { registryPool, initializeRegistry } from '../utils/registry.js';

async function finalize() {
  console.log("🚀 [Vanguard Hub] Finalizing Registry Stability Protocol...");
  try {
    // 🛠️ 1. Drop old mismatched tables
    console.log("- Dropping mismatched metadata tables...");
    await registryPool.query("DROP TABLE IF EXISTS system_settings");
    await registryPool.query("DROP TABLE IF EXISTS roles");

    // 🛠️ 2. Run Initialize to recreate correctly
    console.log("- Initializing compliant schemas...");
    await initializeRegistry();

    // 🛠️ 3. Fix any existing nulls
    console.log("- Hydrating legacy node owner emails...");
    await registryPool.query("UPDATE tenants SET owner_email = 'legacy-terminal@tredpos.com' WHERE owner_email IS NULL");

    console.log("✅ [Vanguard Hub] Final Stability reached. 100% Platform Synchronization.");
    process.exit(0);
  } catch (err) {
    console.error("❌ [Vanguard Hub] Finalization Failure:", err.message);
    process.exit(1);
  }
}

finalize();
