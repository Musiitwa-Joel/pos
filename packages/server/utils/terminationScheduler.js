import { db } from "../config/config.js";
import sendMail from "./mailer.js";
import { buildDetailedTerminationEmail } from "./terminationEmail.js";

// Simple in-process termination scheduler. Not resilient to process restarts.
// It stores timers in memory and exposes API to schedule and cancel terminations.

const timers = new Map();

export const scheduleTermination = async ({ contractId, executeAt }) => {
  // clear any existing timer
  if (timers.has(contractId)) {
    clearTimeout(timers.get(contractId));
    timers.delete(contractId);
  }

  // Node's setTimeout maximum safe delay is ~2^31-1 ms (~24.8 days).
  // If the delay is larger, schedule in chunks to avoid overflow.
  const MAX_TIMEOUT = 2147483647; // ~24.8 days in ms
  let remaining = Math.max(0, executeAt - Date.now());

  const scheduleChunk = () => {
    const chunk = Math.min(remaining, MAX_TIMEOUT);
    const t = setTimeout(async () => {
      remaining -= chunk;
      if (remaining > 0) {
        // still more to wait; schedule next chunk
        scheduleChunk();
        return;
      }
      // Final execution
      try {
        const dt = new Date(executeAt);
        const dtDateOnly = dt.toISOString().split("T")[0];

        // Update DB: set status to 'rejected' and termination_date
        const nowForDb = new Date()
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        await db.execute(
          `UPDATE contracts SET status = ?, termination_date = ?, updated_at = ? WHERE id = ?`,
          ["rejected", dtDateOnly, nowForDb, contractId]
        );

        // Fetch contract and employee details
        const [cRows] = await db.execute(
          `SELECT * FROM contracts WHERE id = ? LIMIT 1`,
          [contractId]
        );
        const contract = cRows && cRows[0];
        if (!contract) return;

        const [empRows] = await db.execute(
          `SELECT email, surname, other_names FROM employees WHERE id = ? LIMIT 1`,
          [contract.employee_id]
        );
        const emp = empRows && empRows[0];
        if (!emp || !emp.email) return;

        const recipientEmail = emp.email;
        const recipientName =
          `${emp.other_names || ""} ${emp.surname || ""}`.trim() ||
          contract.employee_name ||
          "Employee";

        // Load clause templates (if any) for inclusion in the email
        try {
          const [tplRows] = await db.execute(
            `SELECT id, name, type, content FROM clause_templates WHERE deleted = 0 AND is_active = 1 ORDER BY updated_at DESC`
          );
          if (tplRows && tplRows.length) {
            contract._clausesHtml = tplRows
              .map((t) => {
                const title = t.name || t.type || "Clause";
                return `<h5 style="margin-bottom:6px">${title}</h5><div style="margin-bottom:8px">${t.content}</div>`;
              })
              .join("");
          }
        } catch (tplErr) {
          // ignore clause template load errors; builder will fallback
        }

        const humanDate = dt.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const { subject, html } = buildDetailedTerminationEmail({
          contract,
          recipientName,
          humanTerminationDate: humanDate,
          terminationReason: contract.termination_reason,
        });

        try {
          const info = await sendMail({
            to: recipientEmail,
            subject,
            html,
            fromName: "HR - Contracts",
          });
          try {
            const nodemailer = (await import("nodemailer")).default;
            const preview = nodemailer.getTestMessageUrl(info);
            if (preview) console.log("[mailer] termination preview:", preview);
          } catch (e) {
            // ignore preview errors
          }
        } catch (mailErr) {
          console.error(
            "[terminationScheduler] failed to send termination email:",
            mailErr?.message || mailErr
          );
        }
      } catch (e) {
        console.error(
          "[terminationScheduler] failed to apply termination:",
          e?.message || e
        );
      } finally {
        timers.delete(contractId);
      }
    }, chunk);

    // store the current timer so it can be cancelled
    timers.set(contractId, t);
  };

  // kick off the chunked scheduling
  scheduleChunk();
};

export const cancelTermination = (contractId) => {
  if (timers.has(contractId)) {
    clearTimeout(timers.get(contractId));
    timers.delete(contractId);
  }
};

export default { scheduleTermination, cancelTermination };
