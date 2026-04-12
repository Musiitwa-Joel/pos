import { db } from './packages/server/config/config.js';

try {
  const [rows] = await db.query("SELECT * FROM products");
  console.log("Found raw rows:", rows.length);
  
  rows.forEach(r => {
    const missing = [];
    if (!r.id) missing.push('id');
    if (!r.name) missing.push('name');
    if (r.price === null) missing.push('price');
    if (r.cost_price === null) missing.push('cost_price');
    if (r.stock === null) missing.push('stock');
    if (r.unit === null) missing.push('unit');
    
    if (missing.length > 0) {
      console.log(`Product ${r.id || 'NO_ID'} is missing required fields: ${missing.join(', ')}`);
    }
  });

  const [cols] = await db.query("DESCRIBE products;");
  console.log("Columns:", JSON.stringify(cols.map(c => ({ field: c.Field, type: c.Type, null: c.Null })), null, 2));

  process.exit(0);
} catch (err) {
  console.error("Diagnostic failed:", err.message);
  process.exit(1);
}
