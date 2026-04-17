import { registryPool } from "../../../utils/registry.js";
import { sendMail } from "../../../utils/mailer.js";

const resolvers = {
  Query: {
    getContactInquiries: async () => {
      try {
        const [rows] = await registryPool.query(
          "SELECT * FROM platform_inquiries ORDER BY created_at DESC"
        );
        return rows;
      } catch (err) {
        console.error("[Contact Hub] Fetch error:", err);
        throw new Error("Failed to retrieve transmissions.");
      }
    },
    getContactConfig: async () => {
      try {
        const [rows] = await registryPool.query("SELECT * FROM website_config WHERE config_key IN ('support_email', 'support_phone')");
        const config = { support_email: 'ops@tredpos.com', support_phone: '+44 (0) 20 7946 0123' };
        rows.forEach(row => {
          if (row.config_key === 'support_email') config.support_email = row.config_value;
          if (row.config_key === 'support_phone') config.support_phone = row.config_value;
        });
        return config;
      } catch (err) {
        console.error("[Contact Hub] Fetch Config Error:", err);
        throw new Error("Failed to retrieve configuration.");
      }
    },
  },
  Mutation: {
    submitContactInquiry: async (_, { input }) => {
      try {
        const { name, email, subject, message } = input;
        const [result] = await registryPool.query(
          "INSERT INTO platform_inquiries (name, email, subject, message, status) VALUES (?, ?, ?, ?, 'pending')",
          [name, email, subject || 'General Inquiry', message]
        );

        // Fetch dynamically configured operations email
        let adminEmail = process.env.OPS_EMAIL || 'ops@tredpos.com';
        try {
          const [rows] = await registryPool.query("SELECT config_value FROM website_config WHERE config_key = 'support_email'");
          if (rows.length > 0 && rows[0].config_value) {
            adminEmail = rows[0].config_value;
          }
        } catch (e) {
          console.warn("[Contact Hub] Could not fetch global config for email routing, falling back to default.", e.message);
        }

        // Dispatch SMTP Notification
        try {
          await sendMail({
            to: adminEmail,
            subject: `[VANGUARD INQUIRY] ${subject || 'General Inquiry'}`,
            text: `Vanguard Contact System Notification
=========================================
SENDER: ${name} <${email}>
SUBJECT: ${subject}
TIMESTAMP: ${new Date().toLocaleString('en-GB')}

PAYLOAD:
${message}
=========================================
Please review inside the HQ Dashboard.`,
            db: registryPool // Using registry pool for settings
          });
        } catch (mailErr) {
          console.warn("[Contact Hub] Email dispatch failed, but transmission saved:", mailErr.message);
        }

        const [inquiry] = await registryPool.query(
          "SELECT * FROM platform_inquiries WHERE id = ?",
          [result.insertId]
        );
        return inquiry[0];
      } catch (err) {
        console.error("[Contact Hub] Submit error:", err);
        throw new Error("Failed to deploy transmission.");
      }
    },
    deleteContactInquiry: async (_, { id }) => {
      try {
        await registryPool.query("DELETE FROM platform_inquiries WHERE id = ?", [id]);
        return true;
      } catch (err) {
        console.error("[Contact Hub] Delete error:", err);
        throw new Error("Failed to decommission node.");
      }
    },
    markInquiryRead: async (_, { id }) => {
      try {
        await registryPool.query(
          "UPDATE platform_inquiries SET status = 'read' WHERE id = ?",
          [id]
        );
        const [inquiry] = await registryPool.query(
          "SELECT * FROM platform_inquiries WHERE id = ?",
          [id]
        );
        return inquiry[0];
      } catch (err) {
        console.error("[Contact Hub] Update error:", err);
        throw new Error("Failed to update status.");
      }
    },
    updateContactConfig: async (_, { input }) => {
      try {
        const { support_email, support_phone } = input;
        
        if (support_email !== undefined) {
          await registryPool.query(
            "INSERT INTO website_config (config_key, config_value) VALUES ('support_email', ?) ON DUPLICATE KEY UPDATE config_value = ?",
            [support_email, support_email]
          );
        }
        
        if (support_phone !== undefined) {
          await registryPool.query(
            "INSERT INTO website_config (config_key, config_value) VALUES ('support_phone', ?) ON DUPLICATE KEY UPDATE config_value = ?",
            [support_phone, support_phone]
          );
        }
        
        return { support_email, support_phone };
      } catch (err) {
        console.error("[Contact Hub] Update Config error:", err);
        throw new Error("Failed to update global channels.");
      }
    }
  }
};

export default resolvers;
