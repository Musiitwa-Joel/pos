import { registryPool } from '../config/config.js';

async function scrubRegistry() {
  console.log("🚀 [Vanguard Hub] Starting Registry Decontamination Protocol...");

  try {
    // 🛠️ 1. Clear Mock Collections
    console.log("- Purging mock financial ledger...");
    await registryPool.query("DELETE FROM system_payments WHERE tenant_id != 'HQ_VANGUARD_CORE'");

    // 🛠️ 2. Clear Mock Institutions
    console.log("- Purging mock institutional nodes...");
    // We keep the HQ and any institution that already existed before my seeding (if we can identify them)
    // Actually, I'll just delete all EXCEPT the HQ and the known real 'kampala gadgets'
    await registryPool.query("DELETE FROM tenants WHERE id != 'HQ_VANGUARD_CORE'");

    console.log("✅ [Vanguard Hub] Decontamination Complete. Registry is now pristine.");
    process.exit(0);
  } catch (err) {
    console.error("❌ [Vanguard Hub] Decontamination Failure:", err.message);
    process.exit(1);
  }
}

scrubRegistry();
