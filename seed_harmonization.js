import { registryPool } from './packages/server/config/config.js';

async function seed() {
  try {
    const [rows] = await registryPool.query("SELECT config_value FROM website_config WHERE config_key = 'pricing_plans' LIMIT 1");
    if (rows.length === 0) {
      console.log("No config found. Use editor first.");
      return;
    }
    
    const data = JSON.parse(rows[0].config_value);
    const rawPrice = data.basePrice || "0";
    const isK = rawPrice.toLowerCase().includes('k');
    const numericPrice = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) * (isK ? 1000 : 1);
    const serialFeatures = data.features.map(f => f.title).join(', ');

    console.log(`Syncing Plan: ${data.planName} (${numericPrice} USH)`);

    await registryPool.query(
        `INSERT INTO billing_plans (id, name, monthly_fee, features, created_at)
         VALUES ('plan_power', ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE name = ?, monthly_fee = ?, features = ?`,
        [data.planName, numericPrice, serialFeatures, data.planName, numericPrice, serialFeatures]
    );

    console.log("Updating Mukono General Hardware to Unified Tier...");
    await registryPool.query("UPDATE tenants SET plan_id = 'plan_power' WHERE name LIKE '%Mukono General%'");
    
    console.log("Success.");
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

seed();
