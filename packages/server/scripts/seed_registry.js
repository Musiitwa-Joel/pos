import { registryPool } from '../config/config.js';
import { randomUUID } from 'crypto';

async function seedRegistry() {
  console.log("🚀 [Vanguard Hub] Starting Institutional Seeding Protocol...");

  try {
    // 🛠️ 1. Provision Billing Plans
    console.log("- Provisioning SaaS Tiers...");
    const plans = [
      { id: 'plan_standard', name: 'Vanguard Standard', fee: 150000, features: 'Inventory, POS, Reports' },
      { id: 'plan_pro', name: 'Vanguard Professional', fee: 350000, features: 'Inventory, POS, HR, Multi-Terminal' },
      { id: 'plan_enterprise', name: 'Vanguard Enterprise', fee: 750000, features: 'Priority Node, Global Analytics, Custom Branding' },
    ];

    for (const plan of plans) {
      await registryPool.query(
        "INSERT INTO billing_plans (id, name, monthly_fee, features) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE monthly_fee = ?",
        [plan.id, plan.name, plan.fee, plan.features, plan.fee]
      );
    }

    // 🛠️ 2. Provision Institutional Tenants
    console.log("- Provisioning 10 Live Institutional Terminals...");
    const institutions = [
      { name: 'KAMPALA GADGETS HUB', location: 'Kampala City, UG', email: 'owner@kampalagadgets.com', db: 'tredpos_kampala_gadgets', plan: 'plan_pro', status: 'active', payment: 'paid' },
      { name: 'GULU HARDWARE DEPOT', location: 'Gulu Municipality, UG', email: 'contact@guluhardware.com', db: 'tredpos_gulu_depot', plan: 'plan_standard', status: 'active', payment: 'overdue' },
      { name: 'MBARARA PHARMACY', location: 'Mbarara, UG', email: 'mbarara@pharmacy.com', db: 'tredpos_mbarara_pharma', plan: 'plan_standard', status: 'active', payment: 'paid' },
      { name: 'JINJA STEEL WORKS', location: 'Jinja, UG', email: 'admin@jinjasteel.com', db: 'tredpos_jinja_steel', plan: 'plan_enterprise', status: 'active', payment: 'paid' },
      { name: 'ENTEBBE ELECTRONICS', location: 'Entebbe, UG', email: 'owner@entebbe.com', db: 'tredpos_entebbe_elec', plan: 'plan_pro', status: 'active', payment: 'pending' },
      { name: 'FORT PORTAL RETAIL', location: 'Fort Portal, UG', email: 'manager@fortportal.com', db: 'tredpos_fortportal_retail', plan: 'plan_standard', status: 'active', payment: 'paid' },
      { name: 'MASAKA DISTRIBUTORS', location: 'Masaka, UG', email: 'sales@masaka.com', db: 'tredpos_masaka_dist', plan: 'plan_pro', status: 'active', payment: 'pending' },
      { name: 'SOROTI AGRO HUB', location: 'Soroti, UG', email: 'info@sorotiagro.com', db: 'tredpos_soroti_agro', plan: 'plan_standard', status: 'active', payment: 'overdue' },
      { name: 'LIRA WHOLESALE', location: 'Lira, UG', email: 'owner@lirawholesale.com', db: 'tredpos_lira_wholesale', plan: 'plan_pro', status: 'active', payment: 'paid' },
      { name: 'ARUA SOLAR SYSTEMS', location: 'Arua, UG', email: 'support@aruasolar.com', db: 'tredpos_arua_solar', plan: 'plan_enterprise', status: 'active', payment: 'paid' },
    ];

    for (const inst of institutions) {
      await registryPool.query(`
        INSERT INTO tenants (id, name, physical_location, owner_email, db_name, plan_id, status, payment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = ?, payment_status = ?
      `, [
        randomUUID().slice(0, 8), inst.name, inst.location, inst.email, inst.db, inst.plan, inst.status, inst.payment,
        inst.status, inst.payment
      ]);
    }

    // 🛠️ 3. Provision System Payment History
    console.log("- Populating Financial History (Ledger)...");
    const [tenants] = await registryPool.query("SELECT id, plan_id FROM tenants WHERE id != 'HQ_VANGUARD_CORE'");
    
    for (const tenant of tenants) {
      const plan = plans.find(p => p.id === tenant.plan_id) || plans[0];
      await registryPool.query(`
        INSERT INTO system_payments (id, tenant_id, amount, billing_period, status)
        VALUES (?, ?, ?, ?, ?)
      `, [randomUUID().slice(0, 8), tenant.id, plan.fee, 'APRIL_2026', 'paid']);
    }

    console.log("✅ [Vanguard Hub] Institutional Seeding Complete. Dashboard Is Now Populated.");
    process.exit(0);
  } catch (err) {
    console.error("❌ [Vanguard Hub] Seeding Failure:", err.message);
    process.exit(1);
  }
}

seedRegistry();
