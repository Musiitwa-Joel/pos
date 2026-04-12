import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hardware'
  });

  console.log('--- Database Migration: Historical Cost Tracking ---');

  try {
    // Check if column exists
    const [columns] = await connection.query("SHOW COLUMNS FROM sale_items LIKE 'unit_cost'");
    
    if (columns.length === 0) {
      console.log('Adding unit_cost column to sale_items...');
      await connection.query("ALTER TABLE sale_items ADD COLUMN unit_cost DECIMAL(10,2) AFTER unit_price");
      
      // Populate existing records with current cost as fallback
      console.log('Back-filling existing records with current cost prices...');
      await connection.query(`
        UPDATE sale_items si
        JOIN products p ON si.product_id = p.id
        SET si.unit_cost = p.cost_price
        WHERE si.unit_cost IS NULL OR si.unit_cost = 0
      `);
      
      console.log('SUCCESS: unit_cost column added and back-filled.');
    } else {
      console.log('SKIP: unit_cost column already exists.');
    }
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      console.log('SKIP: sale_items table does not exist yet. Automatic schema creation will handle it.');
    } else {
      console.error('ERROR during migration:', err.message);
    }
  } finally {
    await connection.end();
  }
}

migrate();
