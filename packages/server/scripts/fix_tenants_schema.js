import { registryPool } from '../config/config.js';

async function fixTenantsSchema() {
  console.log("🚀 [Vanguard Hub] Starting Institutional Schema Normalization...");

  try {
    // 🛠️ 1. Adding 'plan_id' column
    const [planIdCol] = await registryPool.query("SHOW COLUMNS FROM tenants LIKE 'plan_id'");
    if (planIdCol.length === 0) {
      console.log("- Patching 'tenants' table: Adding 'plan_id'...");
      await registryPool.query("ALTER TABLE tenants ADD COLUMN plan_id VARCHAR(50) AFTER owner_email");
    }

    // 🛠️ 2. Normalizing 'payment_status' enum
    console.log("- Patching 'tenants' table: Normalizing 'payment_status'...");
    await registryPool.query("ALTER TABLE tenants MODIFY COLUMN payment_status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending'");

    // 🛠️ 3. Normalizing 'status' enum
    console.log("- Patching 'tenants' table: Normalizing 'status'...");
    await registryPool.query("ALTER TABLE tenants MODIFY COLUMN status ENUM('active', 'suspended', 'provisioning') DEFAULT 'active'");

    // 🛠️ 4. Adding 'physical_location' column if missing
    const [locCol] = await registryPool.query("SHOW COLUMNS FROM tenants LIKE 'physical_location'");
    if (locCol.length === 0) {
      console.log("- Patching 'tenants' table: Adding 'physical_location'...");
      await registryPool.query("ALTER TABLE tenants ADD COLUMN physical_location VARCHAR(255) AFTER name");
    }

    console.log("✅ [Vanguard Hub] Schema Normalization Complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ [Vanguard Hub] Schema Patch Failure:", err.message);
    process.exit(1);
  }
}

fixTenantsSchema();
