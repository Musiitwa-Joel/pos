import express from 'express';
import multer from 'multer';
import * as xlsx from 'xlsx';
import { db } from '../config/config.js';
import { v7 as uuidv7 } from 'uuid';
import { INVENTORY_SCHEMA_SQL } from '../utils/schema.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');

const router = express.Router();
const upload = multer({ dest: uploadsDir });

// Helper to sanitize header matching
const findColumn = (headers, targets) => {
  return headers.find(h => targets.some(t => h.toLowerCase().includes(t.toLowerCase())));
};

const ensureTables = async (conn) => {
  for (const sql of INVENTORY_SCHEMA_SQL) {
    await conn.query(sql);
  }
};

router.post('/upload', upload.single('file'), async (req, res) => {
  const conn = await db.getConnection();
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    await ensureTables(conn);

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) return res.status(400).json({ error: 'File is empty' });

    const headers = Object.keys(data[0]);
    const colName = findColumn(headers, ['name', 'product', 'item']);
    const colPrice = findColumn(headers, ['sales price', 'price', 'selling price', 'selling']);
    const colCost = findColumn(headers, ['purchase price', 'cost', 'cost price', 'purchase']);
    const colStock = findColumn(headers, ['stock', 'initial stock', 'qty', 'quantity']);
    const colCategory = findColumn(headers, ['category', 'type', 'group']);
    const colUnit = findColumn(headers, ['unit', 'measure', 'uom']);
    const colBarcode = findColumn(headers, ['barcode', 'sku', 'code']);

    if (!colName || !colPrice || !colCost) {
      return res.status(400).json({ 
        error: 'Missing required columns. Please ensure your file has Name, Cost, and Sales Price.' 
      });
    }

    // Start Transaction for Atomicity: ALL or NOTHING
    await conn.beginTransaction();

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const row of data) {
      try {
        const id = uuidv7();
        const productName = row[colName];
        if (!productName) throw new Error('Product name missing');
        
        const costPrice = parseFloat(row[colCost]);
        const salesPrice = parseFloat(row[colPrice]);
        if (isNaN(costPrice) || isNaN(salesPrice)) throw new Error('Invalid numeric pricing values');

        const stockValue = parseInt(row[colStock]) || 0;
        const category = row[colCategory] || 'GENERAL';
        const unit = row[colUnit] || 'PCS';
        const barcode = row[colBarcode] || null;

        await conn.query(
          "INSERT INTO products (id, name, category, price, cost_price, stock, min_stock, unit, barcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [id, productName, category, salesPrice, costPrice, stockValue, 5, unit, barcode]
        );

        if (stockValue > 0) {
          const txId = uuidv7();
          await conn.query(
            "INSERT INTO inventory_transactions (id, product_id, type, quantity, unit_cost, notes) VALUES (?, ?, ?, ?, ?, ?)",
            [txId, id, 'initial_stock', stockValue, costPrice, 'Imported from file']
          );
        }

        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Row ${results.success + results.failed}: ${err.message}`);
        throw new Error(`ABORTING_UPLOAD: ${err.message} at row ${results.success + results.failed}`);
      }
    }

    await conn.commit();
    res.json({ 
      message: 'Upload successful', 
      successCount: results.success,
      failCount: 0,
      errors: [] 
    });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: error.message.includes('ABORTING_UPLOAD') ? error.message : 'Internal server error during upload',
      rolledBack: true 
    });
  } finally {
    if (conn) conn.release();
  }
});

router.post('/upload-suppliers', upload.single('file'), async (req, res) => {
  const conn = await db.getConnection();
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    await ensureTables(conn);

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) return res.status(400).json({ error: 'File is empty' });

    const headers = Object.keys(data[0]);
    const colName = findColumn(headers, ['name', 'business', 'supplier', 'vendor']);
    const colContact = findColumn(headers, ['contact', 'person', 'manager']);
    const colPhone = findColumn(headers, ['phone', 'mobile', 'tel']);
    const colEmail = findColumn(headers, ['email', 'mail']);
    const colBalance = findColumn(headers, ['balance', 'debt', 'outstanding']);

    if (!colName || !colPhone) {
      return res.status(400).json({ 
        error: 'Missing required columns. Please ensure your file has Name and Phone Number.' 
      });
    }

    await conn.beginTransaction();
    const results = { success: 0, failed: 0, errors: [] };

    for (const row of data) {
      try {
        const id = uuidv7();
        const name = row[colName];
        if (!name) throw new Error('Supplier name missing');

        const contact = row[colContact] || '';
        const phone = String(row[colPhone] || '');
        const email = row[colEmail] || '';
        const balance = parseFloat(row[colBalance]) || 0;

        await conn.query(
          "INSERT INTO suppliers (id, name, contact, phone, email, balance) VALUES (?, ?, ?, ?, ?, ?)",
          [id, name, contact, phone, email, balance]
        );
        results.success++;
      } catch (err) {
        results.failed++;
        throw new Error(`ABORTING_UPLOAD: ${err.message} at row ${results.success + results.failed}`);
      }
    }

    await conn.commit();
    res.json({ message: 'Upload successful', successCount: results.success });
  } catch (error) {
    console.error('### SUPPLIER_UPLOAD_CRASH ###', error);
    if (conn) await conn.rollback();
    res.status(500).json({ 
      error: error.message.includes('ABORTING_UPLOAD') ? error.message : 'Internal server error during supplier upload',
      systemError: error.message 
    });
  } finally {
    if (conn) conn.release();
  }
});

export default router;
