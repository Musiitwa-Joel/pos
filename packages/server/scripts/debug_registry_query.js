import { registryPool } from '../config/config.js';

async function debugQuery() {
  console.log("🚀 [Vanguard Hub] Debugging Institutional Matrix Query...");

  try {
    const [rows] = await registryPool.query(`
      SELECT 
          t.*,
          p.name as plan_name,
          p.monthly_fee as plan_fee,
          (SELECT MAX(payment_date) FROM system_payments WHERE tenant_id = t.id) as last_payment_date
      FROM tenants t
      LEFT JOIN billing_plans p ON t.plan_id = p.id
      ORDER BY t.created_at DESC
    `);
    
    console.log(`✅ [Vanguard Hub] Success: Found ${rows.length} row(s) in result set.`);
    rows.forEach(r => console.log(` - ID: ${r.id} | Name: ${r.name} | DB: ${r.db_name}`));
    
    process.exit(0);
  } catch (err) {
    console.error("❌ [Vanguard Hub] Query Failure:", err.message);
    process.exit(1);
  }
}

debugQuery();
