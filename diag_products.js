import { db } from './packages/server/config/config.js';

try {
  const [rows] = await db.query("SELECT * FROM products ORDER BY created_at DESC");
  console.log("Found raw rows:", rows.length);
  
  const mapped = rows.map(r => {
    try {
      return {
        ...r,
        id: r.id,
        name: r.name,
        category: r.category,
        price: parseFloat(r.price),
        costPrice: parseFloat(r.cost_price),
        stock: r.stock,
        minStock: r.min_stock,
        unit: r.unit,
        barcode: r.barcode,
        supplierId: r.supplier_id,
        createdAt: r.created_at ? (typeof r.created_at === 'string' ? r.created_at : r.created_at.toISOString()) : null,
        updatedAt: r.updated_at ? (typeof r.updated_at === 'string' ? r.updated_at : r.updated_at.toISOString()) : null,
      };
    } catch (e) {
      console.log("Failed to map row:", r.id, e.message);
      return null;
    }
  });
  
  console.log("Mapped rows count:", mapped.filter(Boolean).length);
  process.exit(0);
} catch (err) {
  console.error("Query failed:", err.message);
  process.exit(1);
}
