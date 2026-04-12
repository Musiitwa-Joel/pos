const mysql = require('mysql2/promise');
require('dotenv').config();

async function debug() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    timezone: 'Z'
  });

  try {
    console.log('--- LATEST SALE ---');
    const [sales] = await connection.query(`
      SELECT s.*, GROUP_CONCAT(CONCAT(si.quantity, 'x ', p.name, ' @ ', si.unit_price) SEPARATOR ', ') as items
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN products p ON si.product_id = p.id
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT 1
    `);
    console.log(JSON.stringify(sales[0], null, 2));

    console.log('\n--- LATEST RETURN ---');
    const [returns] = await connection.query(`
      SELECT sr.*, p.name as product_name, s.payment_method
      FROM sale_returns sr
      JOIN products p ON sr.product_id = p.id
      JOIN sales s ON sr.sale_id = s.id
      ORDER BY sr.created_at DESC
      LIMIT 1
    `);
    console.log(JSON.stringify(returns[0], null, 2));

    console.log('\n--- RECENT COMPLETED SHIFTS (Consistency Check) ---');
    const [shifts] = await connection.query(`
      SELECT * FROM cashier_shifts 
      ORDER BY start_time DESC 
      LIMIT 3
    `);
    console.log(JSON.stringify(shifts, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

debug();
