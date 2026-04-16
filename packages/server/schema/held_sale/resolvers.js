import { v7 as uuidv7 } from "uuid";

export default {
  Query: {
    heldSales: async (_, __, { db }) => {
      try {
        const [rows] = await db.query("SELECT * FROM held_sales ORDER BY created_at DESC");
        return rows.map(r => ({
          id: r.id,
          cart: typeof r.cart === 'string' ? r.cart : JSON.stringify(r.cart),
          customerId: r.customer_id,
          discount: parseFloat(r.discount || 0),
          cashierId: r.cashier_id,
          createdAt: r.created_at ? r.created_at.toISOString() : null
        }));
      } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
          try {
            await db.query(`
              CREATE TABLE IF NOT EXISTS held_sales (
                id VARCHAR(36) PRIMARY KEY,
                cart JSON NOT NULL,
                customer_id VARCHAR(36),
                discount DECIMAL(15,2) DEFAULT 0.00,
                cashier_id VARCHAR(36) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_cashier (cashier_id),
                INDEX idx_customer (customer_id),
                INDEX idx_created (created_at)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            return [];
          } catch (createErr) {
            console.error('[heldSales] Auto-Provisioning Failure:', createErr.message);
          }
        }
        console.error('[heldSales Query] Operational Failure:', err.message);
        return [];
      }
    }
  },

  Mutation: {
    holdSale: async (_, { cart, customerId, discount, cashierId }, { db }) => {
      const id = uuidv7();
      try {
        await db.query(
          "INSERT INTO held_sales (id, cart, customer_id, discount, cashier_id) VALUES (?, ?, ?, ?, ?)",
          [id, cart, customerId || null, discount || 0, cashierId]
        );
        
        const [rows] = await db.query("SELECT * FROM held_sales WHERE id = ?", [id]);
        const r = rows[0];
        
        return {
          id: r.id,
          cart: typeof r.cart === 'string' ? r.cart : JSON.stringify(r.cart),
          customerId: r.customer_id,
          discount: parseFloat(r.discount || 0),
          cashierId: r.cashier_id,
          createdAt: r.created_at ? r.created_at.toISOString() : null
        };
      } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
          try {
            await db.query(`
              CREATE TABLE IF NOT EXISTS held_sales (
                id VARCHAR(36) PRIMARY KEY,
                cart JSON NOT NULL,
                customer_id VARCHAR(36),
                discount DECIMAL(15,2) DEFAULT 0.00,
                cashier_id VARCHAR(36) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_cashier (cashier_id),
                INDEX idx_customer (customer_id),
                INDEX idx_created (created_at)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            // Retry the insertion once after successful auto-provisioning
            await db.query(
              "INSERT INTO held_sales (id, cart, customer_id, discount, cashier_id) VALUES (?, ?, ?, ?, ?)",
              [id, cart, customerId || null, discount || 0, cashierId]
            );
            const [rows] = await db.query("SELECT * FROM held_sales WHERE id = ?", [id]);
            const r = rows[0];
            return {
              id: r.id,
              cart: typeof r.cart === 'string' ? r.cart : JSON.stringify(r.cart),
              customerId: r.customer_id,
              discount: parseFloat(r.discount || 0),
              cashierId: r.cashier_id,
              createdAt: r.created_at ? r.created_at.toISOString() : null
            };
          } catch (retryErr) {
            console.error('[holdSale] Auto-Provisioning/Retry Failure:', retryErr.message);
          }
        }
        console.error('[holdSale Mutation] Operational Failure:', err.message);
        throw new Error("TRANSACTION_PARKING_FAILED: Could not serialize cart to database.");
      }
    },

    deleteHeldSale: async (_, { id }, { db }) => {
      try {
        const [result] = await db.query("DELETE FROM held_sales WHERE id = ?", [id]);
        return result.affectedRows > 0;
      } catch (err) {
        console.error('[deleteHeldSale Mutation] Operational Failure:', err.message);
        return false;
      }
    }
  }
};
