import { db } from "../config/config.js";
import { v7 as uuidv7 } from "uuid";

const VERIFICATION_TABLE = "results_upload_verification_codes";

let tableEnsured = false;

/**
 * Ensure the verification codes table exists
 */
export const ensureVerificationTable = async () => {
  if (tableEnsured) return;

  const createTableSql = `
    CREATE TABLE IF NOT EXISTS ${VERIFICATION_TABLE} (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      code VARCHAR(6) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      used_at DATETIME NULL,
      is_used TINYINT(1) DEFAULT 0,
      context JSON NULL,
      INDEX idx_user_id (user_id),
      INDEX idx_code (code),
      INDEX idx_expires_at (expires_at)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await db.execute(createTableSql);
  tableEnsured = true;
};

/**
 * Generate a random 6-digit verification code
 * @returns {string} 6-digit code
 */
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create a verification record in the database
 * @param {string} userId - User ID
 * @param {string} code - 6-digit verification code
 * @param {number} expiryMinutes - Minutes until expiry (default 10)
 * @param {object} context - Optional context data
 * @returns {Promise<string>} Record ID
 */
export const createVerificationRecord = async (
  userId,
  code,
  expiryMinutes = 10,
  context = null
) => {
  await ensureVerificationTable();

  const id = uuidv7();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  const sql = `
    INSERT INTO ${VERIFICATION_TABLE} (
      id, user_id, code, expires_at, context
    ) VALUES (?, ?, ?, ?, ?)
  `;

  await db.execute(sql, [
    id,
    userId,
    code,
    expiresAt,
    context ? JSON.stringify(context) : null,
  ]);

  return id;
};

/**
 * Validate a verification code for a user
 * @param {string} userId - User ID
 * @param {string} code - 6-digit verification code
 * @returns {Promise<{valid: boolean, recordId?: string, message?: string}>}
 */
export const validateVerificationCode = async (userId, code) => {
  await ensureVerificationTable();

  const sql = `
    SELECT id, expires_at, is_used, used_at
    FROM ${VERIFICATION_TABLE}
    WHERE user_id = ? AND code = ?
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const [rows] = await db.execute(sql, [userId, code]);

  if (rows.length === 0) {
    return { valid: false, message: "Invalid verification code" };
  }

  const record = rows[0];

  if (record.is_used) {
    return { valid: false, message: "Verification code has already been used" };
  }

  const now = new Date();
  const expiresAt = new Date(record.expires_at);

  if (now > expiresAt) {
    return { valid: false, message: "Verification code has expired" };
  }

  return { valid: true, recordId: record.id };
};

/**
 * Mark a verification code as used
 * @param {string} recordId - Verification record ID
 * @returns {Promise<void>}
 */
export const markCodeAsUsed = async (recordId) => {
  await ensureVerificationTable();

  const sql = `
    UPDATE ${VERIFICATION_TABLE}
    SET is_used = 1, used_at = NOW()
    WHERE id = ?
  `;

  await db.execute(sql, [recordId]);
};

/**
 * Generate a verification token (session token for verified users)
 * This is a UUID that can be stored in memory or a cache
 * @returns {string} UUID token
 */
export const generateVerificationToken = () => {
  return uuidv7();
};

/**
 * Clean up expired verification codes (maintenance task)
 * @param {number} olderThanHours - Delete codes older than X hours (default 24)
 * @returns {Promise<number>} Number of deleted records
 */
export const cleanupExpiredCodes = async (olderThanHours = 24) => {
  await ensureVerificationTable();

  const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

  const sql = `
    DELETE FROM ${VERIFICATION_TABLE}
    WHERE expires_at < ?
  `;

  const [result] = await db.execute(sql, [cutoffDate]);
  return result.affectedRows || 0;
};
