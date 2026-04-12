import { registryPool } from './packages/server/config/config.js';

async function check() {
  try {
    const [plans] = await registryPool.query("SELECT * FROM billing_plans");
    console.log("Plans available:", JSON.stringify(plans, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

check();
