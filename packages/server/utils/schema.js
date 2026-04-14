export const INVENTORY_SCHEMA_SQL = [
  `
    CREATE TABLE IF NOT EXISTS suppliers (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      contact VARCHAR(255),
      phone VARCHAR(50),
      email VARCHAR(255),
      balance DECIMAL(15,2) DEFAULT 0.00,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
  `
    CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        price DECIMAL(10,2) NOT NULL,
        cost_price DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        min_stock INT NOT NULL DEFAULT 5,
        unit VARCHAR(50) NOT NULL,
        barcode VARCHAR(100),
        supplier_id VARCHAR(36),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_supplier (supplier_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
  `
    CREATE TABLE IF NOT EXISTS inventory_transactions (
        id VARCHAR(36) PRIMARY KEY,
        product_id VARCHAR(36) NOT NULL,
        type VARCHAR(50) NOT NULL, 
        quantity INT NOT NULL,     
        unit_cost DECIMAL(10,2),   
        reference_id VARCHAR(36),  
        notes TEXT,
        created_by VARCHAR(36),    
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_product (product_id),
        INDEX idx_type (type),
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
  `
    CREATE TABLE IF NOT EXISTS sales (
      id VARCHAR(36) PRIMARY KEY,
      total DECIMAL(15,2) NOT NULL,
      subtotal DECIMAL(15,2) NOT NULL,
      tax DECIMAL(15,2) DEFAULT 0.00,
      discount DECIMAL(15,2) DEFAULT 0.00,
      payment_method VARCHAR(50) NOT NULL,
      customer_id VARCHAR(36),
      cashier_id VARCHAR(36),
      shift_id VARCHAR(36),
      promo_id VARCHAR(36),
      promo_name VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_created_at (created_at),
      INDEX idx_shift (shift_id),
      INDEX idx_cashier (cashier_id),
      INDEX idx_customer (customer_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
  `
    CREATE TABLE IF NOT EXISTS sale_items (
      id VARCHAR(36) PRIMARY KEY,
      sale_id VARCHAR(36) NOT NULL,
      product_id VARCHAR(36) NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      unit_cost DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id),
      INDEX idx_sale (sale_id),
      INDEX idx_product (product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
  `
    CREATE TABLE IF NOT EXISTS customers (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      email VARCHAR(255),
      credit_limit DECIMAL(15,2) DEFAULT 0.00,
      balance DECIMAL(15,2) DEFAULT 0.00,
      guarantor_info TEXT,
      last_payment_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_name (name),
      INDEX idx_phone (phone)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
  `
    CREATE TABLE IF NOT EXISTS customer_payments (
      id VARCHAR(36) PRIMARY KEY,
      customer_id VARCHAR(36) NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      payment_method VARCHAR(50) DEFAULT 'cash',
      reference VARCHAR(100),
      notes TEXT,
      recorded_by VARCHAR(36),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_customer (customer_id),
      INDEX idx_date (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
  `
    CREATE TABLE IF NOT EXISTS expenses (
      id VARCHAR(36) PRIMARY KEY,
      date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      category VARCHAR(100) NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      description TEXT,
      status VARCHAR(20) DEFAULT 'ACTIVE',
      authorized_by VARCHAR(36),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_date (date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
  `
    CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        action VARCHAR(255) NOT NULL,
        target VARCHAR(255) NOT NULL,
        old_value TEXT,
        new_value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_action (action),
        INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `,
  `
    CREATE TABLE IF NOT EXISTS sale_returns (
        id VARCHAR(36) PRIMARY KEY,
        sale_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36) NOT NULL,
        quantity INT NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        reason TEXT,
        authorized_by VARCHAR(36),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales(id),
        INDEX idx_sale (sale_id),
        INDEX idx_product (product_id),
        INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
  `
    CREATE TABLE IF NOT EXISTS cashier_shifts (
        id VARCHAR(36) PRIMARY KEY,
        cashier_id VARCHAR(36) NOT NULL,
        start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        end_time DATETIME,
        opening_cash DECIMAL(15,2) NOT NULL,
        expected_cash DECIMAL(15,2),
        actual_cash DECIMAL(15,2),
        variance DECIMAL(15,2),
        status VARCHAR(20) DEFAULT 'OPEN',
        INDEX idx_cashier (cashier_id),
        INDEX idx_status (status),
        INDEX idx_start (start_time)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
  `
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `
];
