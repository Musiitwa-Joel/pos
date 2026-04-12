import { registryPool } from './packages/server/config/config.js';

async function check() {
  try {
    const [tenants] = await registryPool.query("SELECT id, name, plan_id FROM tenants WHERE name LIKE '%Mukono General%'");
    console.log("Tenants found:", JSON.stringify(tenants, null, 2));
    
    if (tenants.length > 0 && tenants[0].plan_id) {
       const [plans] = await registryPool.query("SELECT * FROM billing_plans WHERE id = ?", [tenants[0].plan_id]);
       console.log("Associated Plan:", JSON.stringify(plans, null, 2));
    } else {
       console.log("No plan_id found for this tenant.");
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

check();
