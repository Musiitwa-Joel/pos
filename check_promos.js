import { db } from './packages/server/config/config.js';

async function check() {
  try {
    const [rows] = await db.query("SELECT * FROM promotions WHERE name LIKE '%WATER%' OR product_ids LIKE '%WATER%'");
    console.log('Found Promotions:', JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
}

check();
