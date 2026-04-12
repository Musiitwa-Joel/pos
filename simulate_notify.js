import { notifySaleToAdmin } from './packages/server/utils/sale_notifier.js';
import { db } from './packages/server/config/config.js';

async function runSimulation() {
  console.log("Starting Cashier Label Simulation...");
  try {
    const [sales] = await db.query("SELECT * FROM sales ORDER BY created_at DESC LIMIT 1");
    if (sales.length === 0) {
       console.log("No sales found.");
       process.exit(0);
    }
    const sale = sales[0];
    
    // Simulate cashierId from an existing user
    const [users] = await db.query("SELECT id, username FROM users LIMIT 1");
    const user = users[0];
    
    console.log(`Using Cashier: ${user.username} (ID: ${user.id})`);
    
    sale.cashierName = user.username.split('@')[0].toUpperCase();
    sale.paymentMethod = sale.payment_method;
    
    const [items] = await db.query("SELECT * FROM sale_items WHERE sale_id = ?", [sale.id]);
    sale.items = items.map(i => ({
      productName: "Simulated Bar",
      quantity: i.quantity,
      unitPrice: i.unit_price,
      remainingStock: 50
    }));

    await notifySaleToAdmin(sale);
    
    console.log("Simulation finished successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Simulation FAILURE:", err);
    process.exit(1);
  }
}

runSimulation();
