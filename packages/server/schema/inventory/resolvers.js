import { getTenantPool } from "../../config/config.js";
import { v7 as uuidv7 } from "uuid";
import { INVENTORY_SCHEMA_SQL } from "../../utils/schema.js";
import { notifySaleToAdmin } from "../../utils/sale_notifier.js";

// In-memory cache for idempotency (prevents duplicate sales from burst clicks)
const recentSalesCache = new Map();
const IDEMPOTENCY_WINDOW = 5000; // 5 seconds

// Helper to cleanup stale cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of recentSalesCache.entries()) {
    if (now - timestamp > IDEMPOTENCY_WINDOW) recentSalesCache.delete(key);
  }
}, 30000);

const recordAudit = async (db, userId, action, target, oldValue = null, newValue = null) => {
  try {
    // 🛡️ Schema Self-Healing for Audit Logs
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        action VARCHAR(255) NOT NULL,
        target VARCHAR(255) NOT NULL,
        old_value TEXT,
        new_value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_action (action)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    if (!userId) {
      console.warn(`[recordAudit] Missing userId for action: ${action}. Defaulting to SYSTEM.`);
    }

    await db.query(
      "INSERT INTO audit_logs (id, user_id, action, target, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)",
      [uuidv7(), userId || 'SYSTEM', action, target, oldValue, newValue]
    );
  } catch (err) {
    console.error('[recordAudit] Critical Logging Failure:', err.message);
  }
};

export default {
  Supplier: {
    totalOrders: async (parent, __, { db }) => {
      try {
        const [rows] = await db.query(`
          SELECT COUNT(*) as count 
          FROM inventory_transactions it
          JOIN products p ON it.product_id = p.id
          WHERE p.supplier_id = ? AND it.type = 'purchase'
        `, [parent.id]);
        return rows[0].count;
      } catch (err) {
        if(err.code === 'ER_NO_SUCH_TABLE') return 0;
        throw err;
      }
    },
    lastDelivery: async (parent, __, { db }) => {
      try {
        const [rows] = await db.query(`
          SELECT MAX(it.created_at) as last_date 
          FROM inventory_transactions it
          JOIN products p ON it.product_id = p.id
          WHERE p.supplier_id = ? AND it.type = 'purchase'
        `, [parent.id]);
        return rows[0].last_date ? rows[0].last_date.toISOString() : null;
      } catch (err) {
        if(err.code === 'ER_NO_SUCH_TABLE') return null;
        throw err;
      }
    },
    reliabilityScore: async (parent, __, { db }) => {
      try {
        // Factor 1: Recency (40pts) — how recently did they last deliver?
        const [lastDeliveryRows] = await db.query(`
          SELECT MAX(it.created_at) as last_date
          FROM inventory_transactions it
          JOIN products p ON it.product_id = p.id
          WHERE p.supplier_id = ? AND it.type = 'purchase'
        `, [parent.id]);

        const lastDeliveryDate = lastDeliveryRows[0]?.last_date;
        let recencyScore = 0;
        if (lastDeliveryDate) {
          const daysSince = (Date.now() - new Date(lastDeliveryDate).getTime()) / (1000 * 60 * 60 * 24);
          // Full 40pts if delivered within 30 days, scales down to 0 at 180 days
          recencyScore = Math.max(0, 40 - (daysSince / 180) * 40);
        }

        // Factor 2: Order Frequency (40pts) — how many orders in the last 90 days?
        const [frequencyRows] = await db.query(`
          SELECT COUNT(DISTINCT DATE(it.created_at)) as order_days
          FROM inventory_transactions it
          JOIN products p ON it.product_id = p.id
          WHERE p.supplier_id = ?
            AND it.type = 'purchase'
            AND it.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
        `, [parent.id]);

        const orderDays = frequencyRows[0]?.order_days || 0;
        // Full 40pts for 6+ unique order days in 90 days, scales linearly
        const frequencyScore = Math.min(40, (orderDays / 6) * 40);

        // Factor 3: Stock Health (20pts) — ratio of non-critical products
        const [stockRows] = await db.query(`
          SELECT
            COUNT(*) as total,
            SUM(CASE WHEN stock <= min_stock THEN 1 ELSE 0 END) as critical_count
          FROM products
          WHERE supplier_id = ?
        `, [parent.id]);

        let stockScore = 20; // default full score if no products yet
        if (stockRows[0]?.total > 0) {
          const criticalRatio = stockRows[0].critical_count / stockRows[0].total;
          stockScore = Math.round((1 - criticalRatio) * 20);
        }

        const totalScore = recencyScore + frequencyScore + stockScore;
        return Math.min(100, Math.max(0, parseFloat(totalScore.toFixed(1))));
      } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') return 0;
        console.error('reliabilityScore error:', err);
        return 0;
      }
    }
  },
  Product: {
    lastSaleDate: async (parent, __, { db }) => {
      try {
        const [rows] = await db.query(`
          SELECT MAX(created_at) as last_date 
          FROM inventory_transactions 
          WHERE product_id = ? AND type = 'sale'
        `, [parent.id]);
        return rows[0].last_date ? rows[0].last_date.toISOString() : null;
      } catch (err) {
        if(err.code === 'ER_NO_SUCH_TABLE') return null;
        throw err;
      }
    },
    daysSinceLastSale: async (parent, __, { db }) => {
      try {
        const [rows] = await db.query(`
          SELECT MAX(created_at) as last_date 
          FROM inventory_transactions 
          WHERE product_id = ? AND type = 'sale'
        `, [parent.id]);
        if (!rows[0].last_date) return null;
        // Use calendar-day difference: strip time component from both dates
        const lastDate = new Date(rows[0].last_date);
        const today = new Date();
        const lastDay = Date.UTC(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
        const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        const diffDays = Math.round((todayDay - lastDay) / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
      } catch (err) {
        if(err.code === 'ER_NO_SUCH_TABLE') return null;
        throw err;
      }
    }
  },
  Query: {
    products: async (_, __, { db }) => {
      try {
        const [rows] = await db.query("SELECT * FROM products ORDER BY created_at DESC");
        return rows.map(r => ({
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
          createdAt: r.created_at ? r.created_at.toISOString() : null,
          updatedAt: r.updated_at ? r.updated_at.toISOString() : null,
        }));
      } catch(err) {
        if(err.code === 'ER_NO_SUCH_TABLE') return [];
        console.error('Products resolver error:', err);
        throw err;
      }
    },
    product: async (_, { id }, { db }) => {
      const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
      if(rows.length === 0) return null;
      const r = rows[0];
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
          createdAt: r.created_at ? r.created_at.toISOString() : null,
          updatedAt: r.updated_at ? r.updated_at.toISOString() : null,
      };
    },
    inventoryTransactions: async (_, { productId, startDate, endDate }, { db }) => {
      try {
        let query = "SELECT * FROM inventory_transactions";
        let params = [];
        const conditions = [];

        if (productId) {
          conditions.push("product_id = ?");
          params.push(productId);
        }

        if (startDate) {
          conditions.push("created_at >= ?");
          params.push(startDate);
        }

        if (endDate) {
          const end = endDate.length <= 10 ? `${endDate} 23:59:59` : endDate;
          conditions.push("created_at <= ?");
          params.push(end);
        }

        if (conditions.length > 0) {
          query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY created_at DESC";
        const [rows] = await db.query(query, params);
        
        return rows.map(r => ({
          id: r.id,
          productId: r.product_id,
          type: r.type,
          quantity: r.quantity,
          unitCost: r.unit_cost ? parseFloat(r.unit_cost) : null,
          referenceId: r.reference_id,
          notes: r.notes,
          createdBy: r.created_by,
          createdAt: r.created_at ? r.created_at.toISOString() : null,
        }));
      } catch(err) {
        if(err.code === 'ER_NO_SUCH_TABLE') return [];
        throw err;
      }
    },
    suppliers: async (_, __, { db }) => {
      try {
        const [rows] = await db.query("SELECT * FROM suppliers ORDER BY created_at DESC");
        return rows.map(r => ({
          ...r,
          id: r.id,
          name: r.name,
          contact: r.contact,
          phone: r.phone,
          email: r.email,
          balance: parseFloat(r.balance),
          createdAt: r.created_at ? r.created_at.toISOString() : null,
          updatedAt: r.updated_at ? r.updated_at.toISOString() : null,
        }));
      } catch(err) {
        if(err.code === 'ER_NO_SUCH_TABLE') return [];
        throw err;
      }
    },
    supplier: async (_, { id }, { db }) => {
      const [rows] = await db.query("SELECT * FROM suppliers WHERE id = ?", [id]);
      if(rows.length === 0) return null;
      const r = rows[0];
      return {
          ...r,
          id: r.id,
          name: r.name,
          contact: r.contact,
          phone: r.phone,
          email: r.email,
          balance: parseFloat(r.balance),
          createdAt: r.created_at ? r.created_at.toISOString() : null,
          updatedAt: r.updated_at ? r.updated_at.toISOString() : null,
          updatedAt: r.updated_at ? r.updated_at.toISOString() : null,
      };
    },
    promotions: async (_, __, { db }) => {
      try {
        const [rows] = await db.query("SELECT * FROM promotions ORDER BY created_at DESC");
        return rows.map(r => {
          let productIds = [];
          try {
            if (r.product_ids) productIds = typeof r.product_ids === 'string' ? JSON.parse(r.product_ids) : r.product_ids;
          } catch(e) {}
          return {
            id: r.id,
            name: r.name,
            type: r.type,
            value: parseFloat(r.value),
            startDate: r.start_date instanceof Date ? r.start_date.toISOString() : r.start_date,
            endDate: r.end_date instanceof Date ? r.end_date.toISOString() : r.end_date,
            isActive: Boolean(r.is_active),
            productIds,
            createdAt: r.created_at ? r.created_at.toISOString() : null,
            updatedAt: r.updated_at ? r.updated_at.toISOString() : null,
          };
        });
      } catch(err) {
        if(err.code === 'ER_NO_SUCH_TABLE') return [];
        throw err;
      }
    },
    sales: async (_, { startDate, endDate, search }, { db }) => {
      try {
        // 🛡️ Schema Self-Healing for Queries
        try {
          await db.query("ALTER TABLE sales ADD COLUMN shift_id VARCHAR(36) AFTER cashier_id");
        } catch (e) { /* ignore */ }
        
        let sql = "SELECT * FROM sales";
        let params = [];
        const conditions = [];
 
        if (startDate && startDate.trim() !== "") {
          conditions.push("DATE(created_at) >= ?");
          params.push(startDate);
        }
        if (endDate && endDate.trim() !== "") {
          const end = endDate.length <= 10 ? endDate : endDate.split('T')[0];
          conditions.push("DATE(created_at) <= ?");
          params.push(end);
        }
        if (search) {
          conditions.push("(id LIKE ? OR payment_method LIKE ?)");
          params.push(`%${search}%`, `%${search}%`);
        }
 
        if (conditions.length > 0) {
          sql += " WHERE " + conditions.join(" AND ");
        }
 
        sql += " ORDER BY created_at DESC LIMIT 500";
        
        const [rows] = await db.query(sql, params);
        return rows.map(r => ({ 
          ...r, 
          id: r.id, 
          total: parseFloat(r.total), 
          subtotal: parseFloat(r.subtotal),
          discount: parseFloat(r.discount || 0),
          tax: parseFloat(r.tax || 0),
          paymentMethod: r.payment_method,
          customerId: r.customer_id,
          cashierId: r.cashier_id,
          promoId: r.promo_id,
          promoName: r.promo_name,
          createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : (r.created_at || new Date().toISOString())
        }));
      } catch (err) {
        console.error('Sales query error:', err);
        return [];
      }
    },
    customers: async (_, __, { db }) => {
      try {
        const [rows] = await db.query("SELECT * FROM customers ORDER BY balance DESC");
        return rows.map(r => ({
          id: r.id, name: r.name, phone: r.phone, email: r.email,
          creditLimit: parseFloat(r.credit_limit || 0),
          balance: parseFloat(r.balance || 0),
          guarantorInfo: r.guarantor_info,
          lastPaymentDate: r.last_payment_date ? r.last_payment_date.toISOString() : null,
          createdAt: r.created_at?.toISOString(),
          updatedAt: r.updated_at?.toISOString(),
        }));
      } catch(err) { if(err.code === 'ER_NO_SUCH_TABLE') return []; throw err; }
    },
    customer: async (_, { id }, { db }) => {
      try {
        const [rows] = await db.query("SELECT * FROM customers WHERE id = ?", [id]);
        if (!rows.length) return null;
        const r = rows[0];
        return { id: r.id, name: r.name, phone: r.phone, email: r.email, creditLimit: parseFloat(r.credit_limit || 0), balance: parseFloat(r.balance || 0), guarantorInfo: r.guarantor_info, lastPaymentDate: r.last_payment_date?.toISOString() || null, createdAt: r.created_at?.toISOString(), updatedAt: r.updated_at?.toISOString() };
      } catch(err) { if(err.code === 'ER_NO_SUCH_TABLE') return null; throw err; }
    },
    customerPayments: async (_, { customerId }, { db }) => {
      try {
        const [rows] = await db.query("SELECT * FROM customer_payments WHERE customer_id = ? ORDER BY created_at DESC", [customerId]);
        return rows.map(r => ({
          id: r.id, customerId: r.customer_id, amount: parseFloat(r.amount),
          paymentMethod: r.payment_method, reference: r.reference,
          notes: r.notes, recordedBy: r.recorded_by,
          createdAt: r.created_at?.toISOString(),
        }));
      } catch(err) { if(err.code === 'ER_NO_SUCH_TABLE') return []; throw err; }
    },
    dailyDebtRecovered: async (_, __, { db }) => {
      try {
        const [rows] = await db.query("SELECT SUM(amount) as total FROM customer_payments WHERE DATE(created_at) = CURDATE()");
        return parseFloat(rows[0]?.total || 0);
      } catch(err) {
        if(err.code === 'ER_NO_SUCH_TABLE') return 0;
        throw err;
      }
    },
    expenses: async (_, { startDate, endDate, search }, { db }) => {
      try {
        let sql = "SELECT * FROM expenses";
        let params = [];
        const conditions = [];

        if (startDate && startDate.trim() !== "") {
          conditions.push("date >= ?");
          params.push(startDate);
        }
        if (endDate && endDate.trim() !== "") {
          const end = endDate.length <= 10 ? `${endDate} 23:59:59` : endDate;
          conditions.push("date <= ?");
          params.push(end);
        }
        if (search) {
          conditions.push("(category LIKE ? OR description LIKE ?)");
          params.push(`%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) sql += " WHERE " + conditions.join(" AND ");
        sql += " ORDER BY date DESC";

        const [rows] = await db.query(sql, params);
        return rows.map(r => ({
          id: r.id,
          date: r.date instanceof Date ? r.date.toISOString() : (r.date || new Date().toISOString()),
          category: r.category,
          amount: parseFloat(r.amount),
          description: r.description,
          authorizedBy: r.authorized_by,
          createdAt: r.created_at?.toISOString()
        }));
      } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') return [];
        console.error('Expenses resolver error:', err);
        return [];
      }
    },
    auditLogs: async (_, { startDate, endDate }, { db }) => {
      try {
        await db.query("CREATE TABLE IF NOT EXISTS audit_logs (id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(36) NOT NULL, action VARCHAR(255) NOT NULL, target VARCHAR(255) NOT NULL, old_value TEXT, new_value TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, INDEX idx_user (user_id), INDEX idx_action (action)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");

        let sql = `
          SELECT al.*, u.username 
          FROM audit_logs al 
          LEFT JOIN users u ON al.user_id = u.id
        `;
        let params = [];
        const conditions = [];

        if (startDate && startDate.trim() !== "") {
          conditions.push("al.created_at >= ?");
          params.push(startDate);
        }
        if (endDate && endDate.trim() !== "") {
          const end = endDate.length <= 10 ? `${endDate} 23:59:59` : endDate;
          conditions.push("al.created_at <= ?");
          params.push(end);
        }

        if (conditions.length > 0) {
          sql += " WHERE " + conditions.join(" AND ");
        }

        sql += " ORDER BY al.created_at DESC";
        const [rows] = await db.query(sql, params);
        return rows.map(r => ({ 
          ...r, 
          userId: r.user_id, 
          oldValue: r.old_value, 
          newValue: r.new_value, 
          createdAt: r.created_at?.toISOString(),
          user: r.username ? { username: r.username.split('@')[0].toUpperCase() } : { username: 'SYSTEM' }
        }));
      } catch (err) { 
        console.error('auditLogs resolver error:', err);
        return []; 
      }
    },
    saleReturns: async (_, { startDate, endDate }, { db }) => {
      try {
        // 🛡️ Schema Self-Healing for Queries
        try {
          await db.query("ALTER TABLE sale_returns ADD COLUMN shift_id VARCHAR(36) AFTER authorized_by");
        } catch (e) { /* ignore */ }
        
        let sql = "SELECT * FROM sale_returns";
        let params = [];
        const conditions = [];

        if (startDate && startDate.trim() !== "") {
          conditions.push("created_at >= ?");
          params.push(startDate);
        }
        if (endDate && endDate.trim() !== "") {
          const end = endDate.length <= 10 ? `${endDate} 23:59:59` : endDate;
          conditions.push("created_at <= ?");
          params.push(end);
        }

        if (conditions.length > 0) {
          sql += " WHERE " + conditions.join(" AND ");
        }

        sql += " ORDER BY created_at DESC";
        const [rows] = await db.query(sql, params);
        return rows.map(r => ({ ...r, saleId: r.sale_id, productId: r.product_id, authorizedBy: r.authorized_by, shiftId: r.shift_id, createdAt: r.created_at?.toISOString() }));
      } catch (err) { 
        console.error('saleReturns resolver error:', err);
        return []; 
      }
    },
    cashierShifts: async (_, { startDate, endDate }, { db }) => {
      try {
        // 🛡️ Schema Self-Healing for Queries
        // Ensure sales and sale_returns are also healed here since shifts calculation depends on them
        try { await db.query("ALTER TABLE sales ADD COLUMN shift_id VARCHAR(36) AFTER cashier_id"); } catch (e) {}
        try { await db.query("ALTER TABLE sale_returns ADD COLUMN shift_id VARCHAR(36) AFTER authorized_by"); } catch (e) {}
        
        let sql = "SELECT * FROM cashier_shifts";
        let params = [];
        const conditions = [];

        if (startDate && startDate.trim() !== "") {
          const start = startDate.length <= 10 ? `${startDate} 00:00:00` : startDate;
          const end = (endDate && endDate.trim() !== "") ? (endDate.length <= 10 ? `${endDate} 23:59:59` : endDate) : start;
          
          conditions.push("(start_time <= ? AND (end_time IS NULL OR end_time >= ?))");
          params.push(end, start);
        }

        if (conditions.length > 0) {
          sql += " WHERE " + conditions.join(" AND ");
        }

        sql += " ORDER BY start_time DESC";
        const [rows] = await db.query(sql, params);
        return rows.map(r => ({ 
          ...r, 
          cashierId: r.cashier_id, 
          shiftId: r.shift_id,
          startTime: r.start_time?.toISOString(), 
          endTime: r.end_time?.toISOString(),
          openingCash: parseFloat(r.opening_cash),
          expectedCash: parseFloat(r.expected_cash || 0),
          actualCash: parseFloat(r.actual_cash || 0),
          variance: parseFloat(r.variance || 0)
        }));
      } catch (err) { 
        console.error('cashierShifts resolver error:', err);
        return []; 
      }
    },
    activeShift: async (_, { cashierId }, { db }) => {
      try {
        const [rows] = await db.query("SELECT * FROM cashier_shifts WHERE cashier_id = ? AND status = 'OPEN'", [cashierId]);
        if (rows.length === 0) return null;
        const r = rows[0];
        return { 
          ...r, 
          cashierId: r.cashier_id, 
          startTime: r.start_time?.toISOString(), 
          openingCash: parseFloat(r.opening_cash) 
        };
      } catch (err) { return null; }
    },
    getShiftExpected: async (_, { id }, { db }) => {
      try {
        const [shiftRows] = await db.query("SELECT * FROM cashier_shifts WHERE id = ?", [id]);
        if (shiftRows.length === 0) throw new Error("Shift not found");
        const shift = shiftRows[0];

        // 💰 TOTAL SALES: Strict Shift ID Match
        const [salesRows] = await db.query(
          "SELECT SUM(total) as total FROM sales WHERE shift_id = ? AND payment_method = 'cash'",
          [id]
        );
        const salesTotal = parseFloat(salesRows[0].total || 0);

        // 🔄 TOTAL RETURNS: Strict Shift ID Match
        const [returnsRows] = await db.query(
          "SELECT SUM(amount) as total FROM sale_returns WHERE shift_id = ?",
          [id]
        );
        const returnsTotal = parseFloat(returnsRows[0].total || 0);

        // 💳 DEBT RECOVERY: Strict Shift ID Match
        const [recoveryRows] = await db.query(
          `SELECT SUM(amount) as total FROM customer_payments 
           WHERE shift_id = ? AND (payment_method = 'cash' OR payment_method = 'cash-transaction')`,
          [id]
        );
        const recoveryTotal = parseFloat(recoveryRows[0]?.total || 0);

        const expectedCash = parseFloat(shift.opening_cash) + salesTotal + recoveryTotal - returnsTotal;

        return { 
          ...shift, 
          id, 
          startTime: shift.start_time?.toISOString(), 
          openingCash: parseFloat(shift.opening_cash),
          expectedCash,
          recoveryTotal,
          refundsTotal: returnsTotal
        };
      } catch (err) {
        console.error('getShiftExpected error:', err);
        throw err;
      }
    },
    getProfitReport: async (_, { startDate, endDate }, { db }) => {
      try {
        if (!startDate || !endDate || startDate.trim() === "" || endDate.trim() === "") {
           return { dateTrends: [], productPerformance: [] };
        }

        // Normalize Start Date: ensure YYYY-MM-DD format (if T is present, replace with space)
        const start = startDate.includes('T') ? startDate.split('T')[0] : startDate;
        // Normalize End Date: ensure YYYY-MM-DD 23:59:59 format for strict daily filtering
        const rawEnd = endDate.includes('T') ? endDate.split('T')[0] : endDate;
        const normalizedEnd = `${rawEnd} 23:59:59`;


        // 1. Date-based Trends
        const [dateRows] = await db.query(`
          SELECT 
            DATE(s.created_at) as date,
            SUM(si.quantity * si.unit_price) as revenue,
            SUM(si.quantity * si.unit_cost) as cost,
            SUM(si.quantity * (si.unit_price - si.unit_cost)) as profit
          FROM sales s
          JOIN sale_items si ON s.id = si.sale_id
          WHERE s.created_at BETWEEN ? AND ?
          GROUP BY DATE(s.created_at)
          ORDER BY date ASC
        `, [start, normalizedEnd]);

        // 2. Product-based Performance
        const [productRows] = await db.query(`
          SELECT 
            p.id,
            p.name,
            SUM(si.quantity) as qty,
            SUM(si.quantity * si.unit_price) as revenue,
            SUM(si.quantity * si.unit_cost) as cost,
            SUM(si.quantity * (si.unit_price - si.unit_cost)) as profit
          FROM sales s
          JOIN sale_items si ON s.id = si.sale_id
          JOIN products p ON si.product_id = p.id
          WHERE s.created_at BETWEEN ? AND ?
          GROUP BY p.id, p.name
          ORDER BY profit DESC
        `, [start, normalizedEnd]);

        return {
          dateTrends: dateRows.map(r => ({
            date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
            revenue: parseFloat(r.revenue || 0),
            cost: parseFloat(r.cost || 0),
            profit: parseFloat(r.profit || 0)
          })),
          productPerformance: productRows.map(r => ({
            id: r.id,
            name: r.name,
            qty: parseInt(r.qty || 0),
            revenue: parseFloat(r.revenue || 0),
            cost: parseFloat(r.cost || 0),
            profit: parseFloat(r.profit || 0)
          }))
        };
      } catch (err) {
        console.error('getProfitReport error:', err);
        return { dateTrends: [], productPerformance: [] };
      }
    },
    allCustomerPayments: async (_, { startDate, endDate }, { db }) => {
      try {
        let sql = "SELECT * FROM customer_payments";
        let params = [];
        const conditions = [];

        if (startDate && startDate.trim() !== "") {
          conditions.push("created_at >= ?");
          params.push(startDate);
        }
        if (endDate && endDate.trim() !== "") {
          const end = endDate.length <= 10 ? `${endDate} 23:59:59` : endDate;
          conditions.push("created_at <= ?");
          params.push(end);
        }

        if (conditions.length > 0) sql += " WHERE " + conditions.join(" AND ");
        sql += " ORDER BY created_at DESC";

        const [rows] = await db.query(sql, params);
        return rows.map(r => ({
          id: r.id, customerId: r.customer_id, amount: parseFloat(r.amount),
          paymentMethod: r.payment_method, reference: r.reference,
          notes: r.notes, recordedBy: r.recorded_by, shiftId: r.shift_id,
          createdAt: r.created_at?.toISOString(),
        }));
      } catch(err) { if(err.code === 'ER_NO_SUCH_TABLE') return []; throw err; }
    },
  },
  Expense: {
    authorizedBy: async (parent, __, { db }) => {
      const aid = parent.authorized_by || parent.authorizedBy;
      if (!aid || aid === 'SYSTEM_AUTO' || aid === 'unknown') return aid || 'SYS_ADMIN';
      try {
        const [uRows] = await db.query("SELECT username FROM users WHERE id = ?", [aid]);
        if (uRows.length > 0) return (uRows[0].username.split('@')[0]).toUpperCase();
        return aid;
      } catch (err) {
        console.error('Expense authorizedBy error:', err);
        return aid;
      }
    }
  },
  Sale: {
    items: async (parent, __, { db }) => {
      try {
        const [rows] = await db.query(`
          SELECT si.*, p.name as product_name, p.cost_price as current_cost
          FROM sale_items si
          LEFT JOIN products p ON si.product_id = p.id
          WHERE si.sale_id = ?
        `, [parent.id]);
        return rows.map(r => ({
          id: r.id,
          saleId: r.sale_id,
          productId: r.product_id,
          productName: r.product_name,
          quantity: r.quantity,
          unitPrice: parseFloat(r.unit_price),
          costPrice: r.unit_cost ? parseFloat(r.unit_cost) : (r.current_cost ? parseFloat(r.current_cost) : 0),
          remainingStock: r.remaining_stock != null ? parseInt(r.remaining_stock) : null
        }));
      } catch (err) {
        console.error('Sale items resolver error:', err);
        return [];
      }
    },
    cashierName: async (parent, __, { db }) => {
      const cid = parent.cashierId || parent.cashier_id;
      if (!cid || cid === 'unknown') return 'SYSTEM_AUTO';
      try {
        const [uRows] = await db.query("SELECT username FROM users WHERE id = ?", [cid]);
        if (uRows.length > 0) return (uRows[0].username.split('@')[0]).toUpperCase();
        return cid; // fallback to ID
      } catch (e) { return cid; }
    },
    shiftId: (parent) => parent.shiftId || parent.shift_id
  },
  SaleItem: {
    returnedQuantity: async (parent, __, { db }) => {
      try {
        const saleId = parent.saleId || parent.sale_id;
        const productId = parent.productId || parent.product_id;
        
        if (!saleId || !productId) return 0;

        const [rows] = await db.query(
          "SELECT SUM(quantity) as count FROM sale_returns WHERE sale_id = ? AND product_id = ?",
          [saleId, productId]
        );
        return rows[0]?.count ? Number(rows[0].count) : 0;
      } catch (err) {
        console.error('SaleItem returnedQuantity error:', err);
        return 0;
      }
    },
    remainingStock: (parent) => parent.remainingStock || parent.remaining_stock
  },
  CashierShift: {
    cashierName: async (parent, __, { db }) => {
      const cid = parent.cashierId || parent.cashier_id;
      if (!cid || cid === 'unknown') return 'SYSTEM_AUTO';
      try {
        const [uRows] = await db.query("SELECT username FROM users WHERE id = ?", [cid]);
        if (uRows.length > 0) return (uRows[0].username.split('@')[0]).toUpperCase();
        return cid; // fallback to ID
      } catch (e) { return cid; }
    }
  },
  Mutation: {
    initializeInventoryDatabase: async (_, __, { db }) => {
      try {
        for (const sql of INVENTORY_SCHEMA_SQL) {
          await db.query(sql);
        }
        return "Inventory database initialized successfully";
      } catch (error) {
        throw new Error(`Failed to initialize Inventory database: ${error.message}`);
      }
    },
    addProduct: async (_, args, { db, user }) => {
      const { name, category, price, costPrice, initialStock, minStock, unit, barcode, supplierId } = args;
      const id = uuidv7();
      const finalStock = initialStock || 0;

      for (const sql of INVENTORY_SCHEMA_SQL) {
        await db.query(sql);
      }

      await db.query(
        "INSERT INTO products (id, name, category, price, cost_price, stock, min_stock, unit, barcode, supplier_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, name, category || null, price, costPrice, finalStock, minStock || 5, unit, barcode || null, supplierId || null]
      );

      // Record initial stock transaction
      if (finalStock > 0) {
        const txId = uuidv7();
        await db.query(
          "INSERT INTO inventory_transactions (id, product_id, type, quantity, unit_cost, notes) VALUES (?, ?, ?, ?, ?, ?)",
          [txId, id, 'initial_stock', finalStock, costPrice, 'Initial stock entry']
        );
      }

      const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
      const r = rows[0];
      return {
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
          createdAt: r.created_at ? r.created_at.toISOString() : null,
          updatedAt: r.updated_at ? r.updated_at.toISOString() : null,
      };
    },
    updateProduct: async (_, args, { db }) => {
      const { id, ...updates } = args;
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      if (fields.length === 0) throw new Error("No fields provided for update");

      const setClause = fields.map(f => {
        let dbField = f.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        return `${dbField} = ?`;
      }).join(", ");

      await db.query(`UPDATE products SET ${setClause} WHERE id = ?`, [...values, id]);

      const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
      const r = rows[0];
      return {
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
          createdAt: r.created_at ? r.created_at.toISOString() : null,
          updatedAt: r.updated_at ? r.updated_at.toISOString() : null,
      };
    },
    adjustStock: async (_, args, { db }) => {
      const { productId, quantity, type, notes } = args;
      // Adjust stock in products table
      const [productRows] = await db.query("SELECT * FROM products WHERE id = ?", [productId]);
      if (productRows.length === 0) throw new Error("Product not found");
      const product = productRows[0];

      const newStock = product.stock + quantity;
      if (newStock < 0) throw new Error("Insufficient stock");

      await db.query("UPDATE products SET stock = ? WHERE id = ?", [newStock, productId]);

      // Record transaction
      const txId = uuidv7();
      await db.query(
        "INSERT INTO inventory_transactions (id, product_id, type, quantity, unit_cost, notes) VALUES (?, ?, ?, ?, ?, ?)",
        [txId, productId, type, quantity, product.cost_price, notes || null]
      );

      const [updatedRows] = await db.query("SELECT * FROM products WHERE id = ?", [productId]);
      const r = updatedRows[0];
      return {
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
          createdAt: r.created_at ? r.created_at.toISOString() : null,
          updatedAt: r.updated_at ? r.updated_at.toISOString() : null,
      };
    },
    deleteProduct: async (_, { id }, { db }) => {
      await db.query("DELETE FROM inventory_transactions WHERE product_id = ?", [id]);
      await db.query("DELETE FROM products WHERE id = ?", [id]);
      return id;
    },
    addSupplier: async (_, args, { db }) => {
      const { name, contact, phone, email } = args;
      const id = uuidv7();

      // Ensure tables exist natively using MyISAM self-healing
      for (const sql of INVENTORY_SCHEMA_SQL) {
        await db.query(sql);
      }

      await db.query(
        "INSERT INTO suppliers (id, name, contact, phone, email) VALUES (?, ?, ?, ?, ?)",
        [id, name, contact || null, phone || null, email || null]
      );

      const [rows] = await db.query("SELECT * FROM suppliers WHERE id = ?", [id]);
      const r = rows[0];
      return {
          id: r.id,
          name: r.name,
          contact: r.contact,
          phone: r.phone,
          email: r.email,
          balance: parseFloat(r.balance),
          createdAt: r.created_at ? r.created_at.toISOString() : null,
          updatedAt: r.updated_at ? r.updated_at.toISOString() : null,
      };
    },
    updateSupplier: async (_, args, { db }) => {
      const { id, ...updates } = args;
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      if (fields.length === 0) throw new Error("No fields provided for update");

      const setClause = fields.map(f => `${f.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)} = ?`).join(", ");
      await db.query(`UPDATE suppliers SET ${setClause} WHERE id = ?`, [...values, id]);

      const [rows] = await db.query("SELECT * FROM suppliers WHERE id = ?", [id]);
      const r = rows[0];
      return {
          id: r.id,
          name: r.name,
          contact: r.contact,
          phone: r.phone,
          email: r.email,
          balance: parseFloat(r.balance),
          createdAt: r.created_at ? r.created_at.toISOString() : null,
          updatedAt: r.updated_at ? r.updated_at.toISOString() : null,
      };
    },
    deleteSupplier: async (_, { id }, { db }) => {
      await db.query("DELETE FROM suppliers WHERE id = ?", [id]);
      return id;
    },
    addSale: async (_, args, { db, user }) => {
      const { total, subtotal, tax, discount, paymentMethod, customerId, cashierId, shiftId, items, promoId, promoName, clientTxId } = args;
      
      // 🛡️ IDEMPOTENCY GUARD: Use Client-side ID first, fallback to content-fingerprint
      const fingerprint = clientTxId || JSON.stringify({ 
        items: items.map(i => ({ id: i.id, q: i.quantity })), 
        total, 
        cashierId 
      });
      
      const existingResult = recentSalesCache.get(fingerprint);
      if (existingResult) {
        console.log(`[resolvers] Duplicate sale detected for fingerprint. Returning cached result.`);
        return existingResult;
      }

      const saleId = uuidv7();

      // 🛡️ Schema Self-Healing (Outside Transaction)
      // ALTER TABLE causes implicit commit in MySQL, must never be inside a transaction
      try {
        await db.query("ALTER TABLE sales ADD COLUMN promo_id TEXT AFTER cashier_id");
      } catch (e) { 
        try { await db.query("ALTER TABLE sales MODIFY COLUMN promo_id TEXT"); } catch(ee) {}
      }
      try {
        await db.query("ALTER TABLE sales ADD COLUMN promo_name VARCHAR(512) AFTER promo_id");
      } catch (e) { 
        try { await db.query("ALTER TABLE sales MODIFY COLUMN promo_name VARCHAR(512)"); } catch(ee) {}
      }
      try {
        await db.query("ALTER TABLE sale_items ADD COLUMN remaining_stock INT AFTER unit_cost");
      } catch (e) { /* ignore if column exists */ }
      try {
        await db.query("ALTER TABLE sales ADD COLUMN shift_id VARCHAR(36) AFTER cashier_id");
      } catch (e) { /* ignore if column exists */ }

      // Start transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Enforce Credit Limit Policy
        if (paymentMethod === 'credit' && customerId) {
          const [cRows] = await connection.query("SELECT name, balance, credit_limit FROM customers WHERE id = ?", [customerId]);
          if (cRows.length > 0) {
            const currentBalance = parseFloat(cRows[0].balance || 0);
            const limit = parseFloat(cRows[0].credit_limit || 0);
            if ((currentBalance + total) > limit) {
              throw new Error(`CREDIT_LIMIT_EXCEEDED: Transaction rejected. ${cRows[0].name} only has an available credit allowance of ${(limit - currentBalance).toLocaleString()} UGX, but the sale total is ${total.toLocaleString()} UGX.`);
            }
          } else {
            throw new Error("CREDIT_SALE_FAILED: Selected customer profile not found.");
          }
        }

        // 1. Create Sale record
        await connection.query(
          "INSERT INTO sales (id, total, subtotal, tax, discount, payment_method, customer_id, cashier_id, shift_id, promo_id, promo_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [saleId, total, subtotal, tax || 0, discount || 0, paymentMethod, customerId || null, cashierId || null, shiftId || null, promoId || null, promoName || null]
        );

        const processedItems = [];

        // 2. Process items and adjust stock
        for (const item of items) {
          const itemId = uuidv7();
          const txId = uuidv7();

          // Get current stock
          const [productRows] = await connection.query("SELECT * FROM products WHERE id = ?", [item.id]);
          const product = productRows[0];
          const newStock = product.stock - item.quantity;

          // Record Item with Stock Snapshot
          await connection.query(
            "INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, remaining_stock) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [itemId, saleId, item.id, item.quantity, item.price, product.cost_price, newStock]
          );

          // Adjust Stock
          await connection.query("UPDATE products SET stock = ? WHERE id = ?", [newStock, item.id]);

          // Record Transaction log
          await connection.query(
            "INSERT INTO inventory_transactions (id, product_id, type, quantity, unit_cost, reference_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [txId, item.id, 'sale', -item.quantity, product.cost_price, saleId, `Sale ${saleId}`]
          );

          processedItems.push({
            id: itemId,
            saleId: saleId, // Added missing saleId!
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            remainingStock: newStock
          });
        }
        // 1. Fetch Cashier Name
        let cashierName = 'ADMIN-PC';
        if (cashierId) {
          const [uRows] = await connection.query("SELECT username FROM users WHERE id = ?", [cashierId]);
          if (uRows.length > 0) {
            cashierName = uRows[0].username.split('@')[0].toUpperCase();
          }
        }

        // 3. If credit sale, update customer balance
        if (paymentMethod === 'credit' && customerId) {
          try {
            await connection.query(
              "UPDATE customers SET balance = balance + ?, updated_at = NOW() WHERE id = ?",
              [total, customerId]
            );
          } catch(err) {
            // customers table may not exist yet — non-fatal
            console.warn('[addSale] Could not update customer balance:', err.message);
          }
        }

        await connection.commit();

        // 🛡️ Audit: Manual Discounts or Promotion Usage
        if (discount > 0) {
          const action = promoId ? 'PROMOTION_REDEEMED' : 'MANUAL_DISCOUNT_APPLIED';
          const details = promoId ? `Promo: ${promoName} (${discount} UGX)` : `Manual override: ${discount} UGX`;
          await recordAudit(db, user?.id, action, `Sale_#${saleId.slice(-8).toUpperCase()}`, null, details);
        }

        const result = {
          id: saleId,
          total,
          subtotal,
          tax,
          discount,
          paymentMethod,
          customerId,
          cashierId,
          shiftId,
          cashierName,
          promoId,
          promoName,
          items: processedItems,
          createdAt: new Date().toISOString()
        };

        // 🛡️ Cache result for idempotency guard
        recentSalesCache.set(fingerprint, result);

        // 🚀 TRIGGER INSTITUTIONAL EMAIL NOTIFICATION (ASYNC)
        notifySaleToAdmin(db, result).catch(err => console.error("[resolvers] Notify error:", err));
        
        return result;

      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    },
    addCustomer: async (_, args, { db }) => {
      const { name, phone, email, creditLimit, guarantorInfo } = args;
      const id = uuidv7();
      for (const sql of INVENTORY_SCHEMA_SQL) { try { await db.query(sql); } catch(e) {} }
      await db.query(
        "INSERT INTO customers (id, name, phone, email, credit_limit, guarantor_info) VALUES (?, ?, ?, ?, ?, ?)",
        [id, name, phone || null, email || null, creditLimit || 0, guarantorInfo || null]
      );
      const [rows] = await db.query("SELECT * FROM customers WHERE id = ?", [id]);
      const r = rows[0];
      return { id: r.id, name: r.name, phone: r.phone, email: r.email, creditLimit: parseFloat(r.credit_limit || 0), balance: parseFloat(r.balance || 0), guarantorInfo: r.guarantor_info, lastPaymentDate: null, createdAt: r.created_at?.toISOString(), updatedAt: r.updated_at?.toISOString() };
    },
    updateCustomer: async (_, args, { db }) => {
      const { id, ...updates } = args;
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      if (fields.length === 0) throw new Error('No fields provided for update');
      const setClause = fields.map(f => `${f.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)} = ?`).join(', ');
      await db.query(`UPDATE customers SET ${setClause}, updated_at = NOW() WHERE id = ?`, [...values, id]);
      const [rows] = await db.query("SELECT * FROM customers WHERE id = ?", [id]);
      const r = rows[0];
      return { id: r.id, name: r.name, phone: r.phone, email: r.email, creditLimit: parseFloat(r.credit_limit || 0), balance: parseFloat(r.balance || 0), guarantorInfo: r.guarantor_info, lastPaymentDate: r.last_payment_date?.toISOString(), createdAt: r.created_at?.toISOString(), updatedAt: r.updated_at?.toISOString() };
    },
    deleteCustomer: async (_, { id }, { db }) => {
      await db.query("DELETE FROM customer_payments WHERE customer_id = ?", [id]);
      await db.query("DELETE FROM customers WHERE id = ?", [id]);
      return id;
    },
    recordPayment: async (_, args, { db, user }) => {
      const { customerId, amount, paymentMethod, reference, notes, shiftId } = args;
      const paymentId = uuidv7();
      const recordedBy = user?.id || null;

      // 🛡️ Schema Self-Healing for Payments
      try {
        await db.query("ALTER TABLE customer_payments ADD COLUMN shift_id VARCHAR(36) AFTER recorded_by");
      } catch (e) { /* ignore */ }

      // Insert payment record
      await db.query(
        "INSERT INTO customer_payments (id, customer_id, amount, payment_method, reference, notes, recorded_by, shift_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [paymentId, customerId, amount, paymentMethod || 'cash', reference || null, notes || null, recordedBy, shiftId || null]
      );

      // Reduce customer outstanding balance
      await db.query(
        "UPDATE customers SET balance = GREATEST(0, balance - ?), last_payment_date = NOW(), updated_at = NOW() WHERE id = ?",
        [amount, customerId]
      );

      const [rows] = await db.query("SELECT * FROM customer_payments WHERE id = ?", [paymentId]);
      const r = rows[0];
      return { id: r.id, customerId: r.customer_id, amount: parseFloat(r.amount), paymentMethod: r.payment_method, reference: r.reference, notes: r.notes, recordedBy: r.recorded_by, shiftId: r.shift_id, createdAt: r.created_at?.toISOString() };
    },
    deleteCustomerPayment: async (_, { id }, { db }) => {
      // 1. Find the payment amount and customer
      const [payments] = await db.query("SELECT * FROM customer_payments WHERE id = ?", [id]);
      if (payments.length === 0) return false;
      const payment = payments[0];

      // 2. Add the amount back to the customer balance
      await db.query(
        "UPDATE customers SET balance = balance + ?, updated_at = NOW() WHERE id = ?",
        [parseFloat(payment.amount), payment.customer_id]
      );

      // 3. Delete the payment record
      await db.query("DELETE FROM customer_payments WHERE id = ?", [id]);

      return true;
    },
    addExpense: async (_, args, { db, user }) => {
      const { category, amount, description, date } = args;
      const id = uuidv7();
      const authorizedBy = user?.id || 'SYSTEM_AUTO';

      // Self-healing schema check
      for (const sql of INVENTORY_SCHEMA_SQL) {
        try { await db.query(sql); } catch (e) { }
      }

      await db.query(
        "INSERT INTO expenses (id, category, amount, description, date, authorized_by) VALUES (?, ?, ?, ?, ?, ?)",
        [id, category, amount, description || null, date || new Date(), authorizedBy]
      );

      const [rows] = await db.query("SELECT * FROM expenses WHERE id = ?", [id]);
      const r = rows[0];
      return {
        id: r.id,
        category: r.category,
        amount: parseFloat(r.amount),
        description: r.description,
        date: r.date instanceof Date ? r.date.toISOString() : (r.date || new Date().toISOString()),
        authorizedBy: r.authorized_by,
        createdAt: r.created_at?.toISOString()
      };
    },
    deleteExpense: async (_, { id }, { db }) => {
      await db.query("DELETE FROM expenses WHERE id = ?", [id]);
      return id;
    },
    updateExpense: async (_, args, { db }) => {
      const { id, ...updates } = args;
      const fields = [];
      const params = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          params.push(value);
        }
      });

      if (fields.length > 0) {
        params.push(id);
        await db.query(`UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`, params);
      }

      const [rows] = await db.query("SELECT * FROM expenses WHERE id = ?", [id]);
      const r = rows[0];
      return {
        id: r.id,
        category: r.category,
        amount: parseFloat(r.amount),
        description: r.description,
        date: r.date instanceof Date ? r.date.toISOString() : (r.date || new Date().toISOString()),
        authorizedBy: r.authorized_by,
        createdAt: r.created_at?.toISOString(),
        updatedAt: r.updated_at?.toISOString()
      };
    },
    addSystemLog: async (_, args, { db, user }) => {
      const { action, target, oldValue, newValue } = args;
      const id = uuidv7();
      const userId = user?.id || 'SYSTEM_AUTO';
      await db.query(
        "INSERT INTO audit_logs (id, user_id, action, target, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)",
        [id, userId, action, target, oldValue, newValue]
      );
      return { id, userId, action, target, oldValue, newValue, createdAt: new Date().toISOString() };
    },
    recordReturn: async (_, args, { db, user }) => {
      const { saleId, productId, quantity, amount, reason, shiftId, date } = args;
      const id = uuidv7();
      const authorizedBy = user?.id || 'SYSTEM_AUTO';
      const returnDate = date || new Date().toISOString();

      const connection = await db.getConnection();
      
      // 🛡️ Schema Self-Healing for Returns
      try {
        await connection.query("ALTER TABLE sale_returns ADD COLUMN shift_id VARCHAR(36) AFTER authorized_by");
      } catch (e) { /* ignore if column exists */ }
      
      await connection.beginTransaction();
      try {
        // 0. Fetch Sale details for balance reconciliation
        const [saleRows] = await connection.query("SELECT payment_method, customer_id FROM sales WHERE id = ?", [saleId]);
        const sale = saleRows[0];

        // 1. Record Return
        await connection.query(
          "INSERT INTO sale_returns (id, sale_id, product_id, quantity, amount, reason, authorized_by, shift_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [id, saleId, productId, quantity, amount, reason, authorizedBy, shiftId || null, returnDate]
        );

        // 2. Adjust Stock back up
        await connection.query("UPDATE products SET stock = stock + ? WHERE id = ?", [quantity, productId]);

        // 3. Balance Reconciliation (Credit Sales)
        if (sale && sale.payment_method === 'credit' && sale.customer_id) {
          await connection.query(
            "UPDATE customers SET balance = balance - ? WHERE id = ?",
            [amount, sale.customer_id]
          );
        }

        // 4. Record Inventory Transaction
        await connection.query(
          "INSERT INTO inventory_transactions (id, product_id, type, quantity, notes, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [uuidv7(), productId, 'return', quantity, `Return from Sale ${saleId}: ${reason}`, saleId, returnDate]
        );

        await connection.commit();
        
        // 🛡️ Audit: Sales Return
        recordAudit(db, authorizedBy, 'SALE_RETURN', productId, `Qty: ${quantity} on Sale #${saleId}`, `Refund: ${amount} UGX | Date: ${new Date(returnDate).toLocaleDateString()} | Reason: ${reason}`);

        return { id, saleId, productId, quantity, amount, reason, authorizedBy, shiftId, createdAt: returnDate };
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    },
    addPromotion: async (_, args, { db, user }) => {
      const { name, type, value, startDate, endDate, productIds } = args;
      const id = uuidv7();
      
      try {
        // Self-heal: ensure table exists before inserting
        await db.query(`
          CREATE TABLE IF NOT EXISTS promotions (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL,
            value DECIMAL(15,2) NOT NULL,
            start_date DATETIME NOT NULL,
            end_date DATETIME NOT NULL,
            is_active TINYINT(1) DEFAULT 1,
            product_ids JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_active (is_active),
            INDEX idx_dates (start_date, end_date)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // mysql2 interprets DATETIME as LOCAL server time, so we must store local time, not bare UTC
        const toMySQLDate = (iso) => {
          const d = new Date(iso);
          const pad = (n) => String(n).padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        };

        await db.query(
          "INSERT INTO promotions (id, name, type, value, start_date, end_date, product_ids) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [id, name, type, value, toMySQLDate(startDate), toMySQLDate(endDate), JSON.stringify(productIds || [])]
        );

        // 🛡️ Audit: Promotion Creation
        recordAudit(db, user?.id, 'CREATE_PROMOTION', name, null, `Type: ${type}, Value: ${value}`);

        return { id, name, type, value, startDate, endDate, isActive: true, productIds: productIds || [] };
      } catch(err) {
        throw new Error("Failed to add promotion: " + err.message);
      }
    },
    updatePromotion: async (_, args, { db, user }) => {
      const { id, name, type, value, startDate, endDate, isActive, productIds } = args;
      const updates = [];
      const params = [];
      const toMySQLDate = (iso) => {
        const d = new Date(iso);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      };

      if (name !== undefined) { updates.push("name = ?"); params.push(name); }
      if (type !== undefined) { updates.push("type = ?"); params.push(type); }
      if (value !== undefined) { updates.push("value = ?"); params.push(value); }
      if (startDate !== undefined) { updates.push("start_date = ?"); params.push(toMySQLDate(startDate)); }
      if (endDate !== undefined) { updates.push("end_date = ?"); params.push(toMySQLDate(endDate)); }
      if (isActive !== undefined) { updates.push("is_active = ?"); params.push(isActive ? 1 : 0); }
      if (productIds !== undefined) { updates.push("product_ids = ?"); params.push(JSON.stringify(productIds)); }
      
      const [oldRows] = await db.query("SELECT * FROM promotions WHERE id = ?", [id]);
      if (oldRows.length === 0) throw new Error("Promotion not found");
      const oldPromo = oldRows[0];

      if (updates.length > 0) {
        params.push(id);
        await db.query(`UPDATE promotions SET ${updates.join(", ")} WHERE id = ?`, params);
      }
      
      const [rows] = await db.query("SELECT * FROM promotions WHERE id = ?", [id]);
      const r = rows[0];

      // 🛡️ Audit: Detect if this was mostly an extension
      const isExtension = endDate !== undefined && updates.length === 1;
      const auditAction = isExtension ? 'PROMOTION_EXTENDED' : 'UPDATE_PROMOTION';
      const auditOld = isExtension ? `Expires: ${new Date(oldPromo.end_date).toLocaleString()}` : 'Config updated';
      const auditNew = isExtension ? `Extended until: ${new Date(r.end_date).toLocaleString()}` : `Value: ${r.value} ${r.type}`;

      recordAudit(db, user?.id, auditAction, r.name, auditOld, auditNew);

      return {
        id: r.id, name: r.name, type: r.type, value: parseFloat(r.value),
        startDate: r.start_date.toISOString(), endDate: r.end_date.toISOString(),
        isActive: Boolean(r.is_active),
        productIds: typeof r.product_ids === 'string' ? JSON.parse(r.product_ids) : r.product_ids
      };
    },
    deletePromotion: async (_, { id }, { db, user }) => {
      // Fetch name for audit before delete
      const [rows] = await db.query("SELECT name FROM promotions WHERE id = ?", [id]);
      const name = rows[0]?.name || 'Unknown Promo';
      
      await db.query("DELETE FROM promotions WHERE id = ?", [id]);
      
        // 🛡️ Audit
      recordAudit(db, user?.id, 'DELETE_PROMOTION', name, null, null);
      
      return id;
    },
    togglePromotion: async (_, { id }, { db, user }) => {
      await db.query("UPDATE promotions SET is_active = NOT is_active WHERE id = ?", [id]);
      const [rows] = await db.query("SELECT * FROM promotions WHERE id = ?", [id]);
      const r = rows[0];

      // 🛡️ Audit
      recordAudit(db, user?.id, 'TOGGLE_PROMOTION', r.name, null, r.is_active ? 'Reactivated' : 'Deactivated');

      return {
        id: r.id, name: r.name, type: r.type, value: parseFloat(r.value),
        startDate: r.start_date.toISOString(), endDate: r.end_date.toISOString(),
        isActive: Boolean(r.is_active),
        productIds: typeof r.product_ids === 'string' ? JSON.parse(r.product_ids) : r.product_ids
      };
    },
    openShift: async (_, { openingCash }, { db, user }) => {
      const id = uuidv7();
      const cashierId = user?.id || 'unknown';
      await db.query(
        "INSERT INTO cashier_shifts (id, cashier_id, opening_cash, status) VALUES (?, ?, ?, 'OPEN')",
        [id, cashierId, openingCash]
      );
      return { id, cashierId, startTime: new Date().toISOString(), openingCash, status: 'OPEN' };
    },
    closeShift: async (_, { id, actualCash }, { db }) => {
      const [shiftRows] = await db.query("SELECT * FROM cashier_shifts WHERE id = ?", [id]);
      if (shiftRows.length === 0) throw new Error("Shift not found");
      const shift = shiftRows[0];
      
      // 💰 TOTAL SALES: Strict ID Match (No more time guessing)
      const [salesRows] = await db.query(
        "SELECT SUM(total) as total FROM sales WHERE shift_id = ? AND payment_method = 'cash'",
        [id]
      );
      const salesTotal = parseFloat(salesRows[0].total || 0);

      // 🔄 TOTAL RETURNS: Strict ID Match
      const [returnsRows] = await db.query(
        "SELECT SUM(amount) as total FROM sale_returns WHERE shift_id = ?",
        [id]
      );
      const returnsTotal = parseFloat(returnsRows[0].total || 0);

      // 💳 DEBT RECOVERY: Strict ID Match
      const [recoveryRows] = await db.query(
        `SELECT SUM(amount) as total FROM customer_payments 
         WHERE shift_id = ? AND (payment_method = 'cash' OR payment_method = 'cash-transaction')`,
        [id]
      );
      const recoveryTotal = parseFloat(recoveryRows[0]?.total || 0);

      // 📱 DIGITAL SALES: Strict ID Match
      const [digitalSalesRows] = await db.query(
        `SELECT SUM(total) as total FROM sales 
         WHERE shift_id = ? AND (payment_method = 'bank' OR payment_method = 'mobile_money')`,
        [id]
      );
      const digitalTotal = parseFloat(digitalSalesRows[0]?.total || 0);

      // 💳 CREDIT ISSUED: Strict ID Match
      const [creditSalesRows] = await db.query(
        "SELECT SUM(total) as total FROM sales WHERE shift_id = ? AND payment_method = 'credit'",
        [id]
      );
      const creditTotal = parseFloat(creditSalesRows[0]?.total || 0);

      // Final expected total calculation
      const expectedCash = parseFloat(shift.opening_cash) + salesTotal + recoveryTotal - returnsTotal;
      const variance = actualCash - expectedCash;

      await db.query(
        "UPDATE cashier_shifts SET end_time = NOW(), expected_cash = ?, actual_cash = ?, variance = ?, status = 'CLOSED' WHERE id = ?",
        [expectedCash, actualCash, variance, id]
      );
      
      return { 
        ...shift, 
        id, 
        endTime: new Date().toISOString(), 
        expectedCash, 
        actualCash, 
        variance, 
        digitalTotal,
        creditTotal,
        recoveryTotal,
        refundsTotal: returnsTotal,
        status: 'CLOSED' 
      };
    }
  }
};
