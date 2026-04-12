import { db } from './packages/server/config/config.js';

async function check() {
  try {
    const [rows] = await db.query("SELECT id, name, start_date, end_date, is_active, product_ids FROM promotions WHERE is_active = 1");
    console.log('All Active Promotions:', JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
}

check();
