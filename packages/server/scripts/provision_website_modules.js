import { registryPool } from "../config/config.js";

async function migrate() {
  console.log("[Registry Migration] Initializing Website Expansion Infrastructure...");
  
  const tables = [
    {
      name: "platform_reviews",
      sql: `
        CREATE TABLE IF NOT EXISTS platform_reviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(255),
          company VARCHAR(255),
          content TEXT NOT NULL,
          rating INT DEFAULT 5,
          impact VARCHAR(255),
          avatar_url TEXT,
          is_featured BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,
      columns: [
        { name: 'impact', type: 'VARCHAR(255) AFTER rating' }
      ]
    },
    {
      name: "platform_updates",
      sql: `
        CREATE TABLE IF NOT EXISTS platform_updates (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          summary TEXT,
          content TEXT NOT NULL,
          image_url TEXT,
          category VARCHAR(50) DEFAULT 'ANNOUNCEMENT',
          published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `
    },
    {
      name: "platform_case_studies",
      sql: `
        CREATE TABLE IF NOT EXISTS platform_case_studies (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          client_name VARCHAR(255),
          industry VARCHAR(100),
          summary TEXT,
          content TEXT NOT NULL,
          results TEXT,
          metric VARCHAR(100),
          metric_label VARCHAR(100),
          image_url TEXT,
          is_featured BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,
      columns: [
        { name: 'metric', type: 'VARCHAR(100) AFTER results' },
        { name: 'metric_label', type: 'VARCHAR(100) AFTER metric' }
      ]
    },
    {
      name: "platform_about_sections",
      sql: `
        CREATE TABLE IF NOT EXISTS platform_about_sections (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(255),
          content TEXT NOT NULL,
          image_url TEXT,
          icon_name VARCHAR(50),
          order_index INT DEFAULT 0,
          section_type VARCHAR(50) DEFAULT 'GENERAL',
          is_active BOOLEAN DEFAULT TRUE,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,
      columns: [
        { name: 'subtitle', type: 'VARCHAR(150) AFTER title' },
        { name: 'icon_name', type: 'VARCHAR(50) AFTER image_url' }
      ]
    },
    {
      name: "platform_jobs",
      sql: `
        CREATE TABLE IF NOT EXISTS platform_jobs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          department VARCHAR(100) NOT NULL,
          location VARCHAR(100) DEFAULT 'Remote',
          type VARCHAR(50) DEFAULT 'Full-time',
          color_code VARCHAR(50) DEFAULT 'bg-neo-orange',
          description TEXT NOT NULL,
          requirements TEXT,
          order_index INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,
      columns: [
        { name: 'color_code', type: 'VARCHAR(50) AFTER type' },
        { name: 'order_index', type: 'INT DEFAULT 0 AFTER requirements' }
      ]
    },
    {
      name: "platform_careers_perks",
      sql: `
        CREATE TABLE IF NOT EXISTS platform_careers_perks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          icon_name VARCHAR(50) DEFAULT 'Zap',
          order_index INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `
    },
    {
      name: "platform_blog_posts",
      sql: `
        CREATE TABLE IF NOT EXISTS platform_blog_posts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          author VARCHAR(255) NOT NULL,
          category VARCHAR(100),
          excerpt TEXT,
          content LONGTEXT NOT NULL,
          image_url TEXT,
          is_draft BOOLEAN DEFAULT TRUE,
          published_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `
    },
    {
      name: "platform_features",
      sql: `
        CREATE TABLE IF NOT EXISTS platform_features (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          icon VARCHAR(50) DEFAULT 'Zap',
          color VARCHAR(50) DEFAULT 'bg-neo-orange',
          order_index INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `
    },
    {
      name: "platform_press_releases",
      sql: `
        CREATE TABLE IF NOT EXISTS platform_press_releases (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          source VARCHAR(255),
          link TEXT,
          excerpt TEXT,
          published_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `
    },
    {
      name: "platform_changelogs",
      sql: `
        CREATE TABLE IF NOT EXISTS platform_changelogs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          version VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          category ENUM('FEATURE', 'FIX', 'SECURITY', 'ARCHITECTURE') NOT NULL DEFAULT 'FEATURE',
          content TEXT NOT NULL,
          released_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `
    }
  ];

  for (const table of tables) {
    try {
      await registryPool.execute(table.sql);
      console.log(`[Registry Migration] SUCCESS: '${table.name}' provisioned.`);

      // Audit and inject missing forensic columns
      if (table.columns) {
        for (const col of table.columns) {
          try {
            // INFORMATION_SCHEMA is more reliable for programmatic audits
            const [existingCols] = await registryPool.execute(
              `SELECT COLUMN_NAME 
               FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = ? AND COLUMN_NAME = ?`, 
              [table.name, col.name]
            );
            
            if (existingCols.length === 0) {
              await registryPool.execute(`ALTER TABLE ${table.name} ADD COLUMN ${col.name} ${col.type}`);
              console.log(`[Registry Migration] TELEMETRY_INJECTED: '${table.name}.${col.name}' added.`);
            }
          } catch (colErr) {
            console.error(`[Registry Migration] COLUMN_FAILURE for '${table.name}.${col.name}':`, colErr.message);
          }
        }
      }
    } catch (err) {
      console.error(`[Registry Migration] FAILURE for '${table.name}':`, err.message);
    }
  }

  console.log("[Registry Migration] Website Expansion Hub Stabilized.");
  process.exit(0);
}

migrate();
