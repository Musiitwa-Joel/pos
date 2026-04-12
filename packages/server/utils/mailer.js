import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { promises as fsPromises } from "fs";
import path from "path";

// Initialize dotenv/config once
dotenv.config(); 

// SMTP configuration read from environment variables.
const FROM_NAME = process.env.FROM_NAME || "TREDPOS Industries";
const FROM_EMAIL = process.env.FROM_EMAIL || "tredumollc@gmail.com";

import { db } from "../config/config.js";

// Helper to fetch setting from DB
const getDbSetting = async (key, dbPool = null) => {
  const activePool = dbPool || db;
  try {
    const [rows] = await activePool.query("SELECT setting_value FROM system_settings WHERE setting_key = ?", [key]);
    return rows.length > 0 ? rows[0].setting_value : null;
  } catch (e) {
    return null;
  }
};

const createTransporter = async (dbPool = null) => {
  // Try DB settings first from the provided institutional pool
  const dbHost = await getDbSetting("SMTP_HOST", dbPool);
  const dbPort = await getDbSetting("SMTP_PORT", dbPool);
  const dbUser = await getDbSetting("SMTP_USER", dbPool);
  const dbPass = await getDbSetting("SMTP_PASS", dbPool);

  const host = dbHost || process.env.SMTP_HOST;
  const port = dbPort ? Number(dbPort) : (process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : null);
  const user = dbUser || process.env.SMTP_USER;
  const pass = dbPass || process.env.SMTP_PASS;

  if (host && port && user && pass) {
    console.log(`[mailer] Initializing SMTP for ${dbPool ? 'Institutional Cluster' : 'Default Shell'} at ${host}:${port}`);
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }

  // 🧩 Fallback to Ethereal test account
  try {
    const testAcc = await nodemailer.createTestAccount();
    const t = nodemailer.createTransport({
      host: testAcc.smtp.host,
      port: testAcc.smtp.port,
      secure: testAcc.smtp.secure,
      auth: {
        user: testAcc.user,
        pass: testAcc.pass,
      },
    });
    console.log(
      "[mailer] No SMTP configured — using Ethereal test account."
    );
    return t;
  } catch (err) {
    console.warn(
      "[mailer] Failed to create Ethereal account — falling back to file-backed transport:",
      err?.message || err
    );

    // Directory under the server package where emails will be saved
    const outDir = path.resolve(process.cwd(), "tmp", "emails");

    // Fallback: Save emails to disk if SMTP fails
    return {
      sendMail: async (mailOptions) => {
        try {
          await fsPromises.mkdir(outDir, { recursive: true });
          const id = Date.now();
          const short = Math.random().toString(36).slice(2, 8);
          const filename = path.join(outDir, `${id}-${short}.html`);

          const body =
            mailOptions.html ||
            mailOptions.text ||
            JSON.stringify(mailOptions, null, 2);
          await fsPromises.writeFile(
            filename,
            `<!-- Saved by mailer fallback -->\n` + body,
            "utf8"
          );
          console.log(`[mailer] Saved email to file: ${filename}`);
          return { accepted: [mailOptions.to], messageId: `file-${id}` };
        } catch (writeErr) {
          console.error(
            "[mailer] Failed to write email file fallback:",
            writeErr?.message || writeErr
          );
          return { accepted: [mailOptions.to], messageId: "stub" };
        }
      },
    };
  }
};

// 🧩 Institutional Transporter Repository
// Caches SMTP connections per institutional cluster to avoid redundant handshakes
const transporters = new Map();

const getTransporter = async (dbPool = null) => {
  // Use 'default' key if no pool provided (legacy/root behavior)
  let clusterKey = 'default';
  if (dbPool && dbPool.pool && dbPool.pool.config && dbPool.pool.config.connectionConfig) {
      clusterKey = dbPool.pool.config.connectionConfig.database || 'default';
  }

  if (!transporters.has(clusterKey)) {
    console.log(`[mailer] Spawning dedicated transporter for cluster: ${clusterKey}`);
    transporters.set(clusterKey, createTransporter(dbPool));
  }
  return transporters.get(clusterKey);
};

// Default warm-up for the root cluster
(async () => {
  try {
    const t = await getTransporter(); // Uses global db by internal default
    if (t.verify) {
      await t.verify();
      console.log("[mailer] Default SMTP connection verified ✅");
    }
  } catch (err) {
    console.warn("[mailer] Root warm-up failed:", err?.message || err);
  }
})();

export const sendMail = async ({
  to,
  subject,
  html,
  text,
  fromName,
  fromEmail,
  from,
  cc,
  bcc,
  attachments,
  db = null, // 🛡️ Institutional Pool Injection
}) => {
  if (!to) {
    console.warn("[mailer] no recipient provided, skipping send");
    return null;
  }

  // Normalize recipients
  const toHeader = Array.isArray(to) ? to.join(", ") : String(to);

  // Build From header
  let finalFrom;
  if (from) {
    finalFrom = from;
  } else {
    const rawName = fromName ?? FROM_NAME;
    const email = fromEmail ?? FROM_EMAIL;
    const nameCandidate =
      rawName &&
      String(rawName).trim() &&
      !["undefined", "null"].includes(String(rawName).trim().toLowerCase())
        ? String(rawName).trim()
        : null;
    finalFrom = nameCandidate ? `${nameCandidate} <${email}>` : String(email);
  }

  try {
    const mailOptions = {
      from: finalFrom,
      to: toHeader,
      subject,
      text: text || undefined,
      html: html || undefined,
    };

    if (cc) mailOptions.cc = Array.isArray(cc) ? cc.join(", ") : String(cc);
    if (bcc)
      mailOptions.bcc = Array.isArray(bcc) ? bcc.join(", ") : String(bcc);
    if (Array.isArray(attachments) && attachments.length) {
      mailOptions.attachments = attachments
        .map((item) => {
          if (!item) {
            return null;
          }
          const attachment = { ...item };
          if (attachment.content && !(attachment.content instanceof Buffer)) {
            attachment.content = Buffer.isBuffer(attachment.content)
              ? attachment.content
              : Buffer.from(String(attachment.content), "base64");
          }
          return attachment;
        })
        .filter(Boolean);
    }

    // Ensure transporter is ready
    // Resolve institutional transporter if provided
    const resolvedTransporter = await getTransporter(db);
    const info = await resolvedTransporter.sendMail(mailOptions);

    // Show preview link for Ethereal
    try {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log("[mailer] Preview URL:", preview);
    } catch {
      // ignore
    }

    return info;
  } catch (error) {
    console.error("[mailer] sendMail error:", error?.message || error);
    throw error;
  }
};

export default sendMail;
