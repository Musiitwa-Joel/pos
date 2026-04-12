import { db } from './packages/server/config/config.js';

try {
  const [tables] = await db.query("SHOW TABLES;");
  console.log("Tables in database:", JSON.stringify(tables, null, 2));
  
  if (tables.some(t => Object.values(t).includes('products'))) {
    const [count] = await db.query("SELECT COUNT(*) as cnt FROM products;");
    console.log("Product count:", count[0].cnt);
    
    const [status] = await db.query("SHOW TABLE STATUS WHERE Name = 'products';");
    console.log("Product table engine:", status[0].Engine);
  } else {
    console.log("Product table DOES NOT EXIST!");
  }
  process.exit(0);
} catch (err) {
  console.error("Diagnostic error:", err.message);
  process.exit(1);
}
