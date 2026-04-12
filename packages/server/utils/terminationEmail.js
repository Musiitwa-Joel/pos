export const buildDetailedTerminationEmail = ({
  contract,
  recipientName,
  humanTerminationDate,
  terminationReason,
}) => {
  const fmt = (v) => (v === null || v === undefined ? "-" : String(v));
  const formatCurrency = (amt, cur = contract?.currency || "") => {
    if (amt === null || amt === undefined) return "-";
    try {
      const n = Number(amt);
      return `${cur} ${Number.isFinite(n) ? n.toLocaleString() : amt}`;
    } catch (e) {
      return `${cur} ${amt}`;
    }
  };

  // Simple renderers for allowances/deductions/benefits/responsibilities
  const renderList = (items) => {
    try {
      const parsed = typeof items === "string" ? JSON.parse(items) : items;
      if (!parsed) return "<li>None</li>";
      if (Array.isArray(parsed))
        return parsed.map((x) => `<li>${fmt(x)}</li>`).join("");
      if (typeof parsed === "object")
        return Object.entries(parsed)
          .map(
            ([k, v]) =>
              `<li><strong>${fmt(k)}:</strong> ${formatCurrency(v)}</li>`
          )
          .join("");
      return `<li>${fmt(parsed)}</li>`;
    } catch (e) {
      return `<li>${fmt(items)}</li>`;
    }
  };

  const allowancesList = renderList(contract.allowances);
  const deductionsList = renderList(contract.deductions);

  const benefitsList = (() => {
    try {
      const b = contract.benefits
        ? Array.isArray(contract.benefits)
          ? contract.benefits
          : JSON.parse(contract.benefits)
        : [];
      if (Array.isArray(b) && b.length)
        return b.map((x) => `<li>${fmt(x)}</li>`).join("");
      return "<li>None</li>";
    } catch (e) {
      return `<li>${fmt(contract.benefits)}</li>`;
    }
  })();

  const responsibilitiesList = (() => {
    try {
      if (!contract.job_responsibilities) return "<li>None</li>";
      const jr =
        typeof contract.job_responsibilities === "string"
          ? (function () {
              try {
                const p = JSON.parse(contract.job_responsibilities);
                return Array.isArray(p) ? p : [contract.job_responsibilities];
              } catch (e) {
                return contract.job_responsibilities
                  .split(/\r?\n/)
                  .map((s) => s.trim())
                  .filter(Boolean);
              }
            })()
          : Array.isArray(contract.job_responsibilities)
            ? contract.job_responsibilities
            : [String(contract.job_responsibilities)];
      if (Array.isArray(jr) && jr.length)
        return jr.map((r) => `<li>${fmt(r)}</li>`).join("");
      return "<li>None</li>";
    } catch (e) {
      return `<li>${fmt(contract.job_responsibilities)}</li>`;
    }
  })();

  // Clause templates fallback
  const clausesHtml =
    contract._clausesHtml || '<div style="margin-bottom:8px">-</div>';

  const displayStatus = "Terminated";

  const bodyHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #222; line-height: 1.5; font-size: 14px;">
      <h2 style="color:#b22222;">Notice of Termination</h2>
      <p>Dear <strong>${recipientName || "Staff Member"}</strong>,</p>
      <p>We regret to inform you that your <strong>${fmt(contract.contract_type || "employment contract")}</strong> has been <strong style="text-transform:uppercase">${displayStatus}</strong>.</p>

      <h3>Contract summary</h3>
      <table cellpadding="6" cellspacing="0" border="0" style="width:100%;max-width:720px;border-collapse:collapse;margin-bottom:12px;font-size:13px;">
        <tr><td style="width:170px;font-weight:600">Contract No:</td><td>${fmt(contract.contract_number)}</td></tr>
        <tr><td style="font-weight:600">Employee:</td><td>${fmt(contract.employee_name || recipientName)}</td></tr>
        <tr><td style="font-weight:600">Position:</td><td>${fmt(contract.position)}</td></tr>
        <tr><td style="font-weight:600">Department:</td><td>${fmt(contract.department)}</td></tr>
        <tr><td style="font-weight:600">Start Date:</td><td>${fmt(contract.start_date)}</td></tr>
        <tr><td style="font-weight:600">End Date:</td><td>${fmt(contract.end_date)}</td></tr>
        <tr><td style="font-weight:600">Termination Date:</td><td>${fmt(humanTerminationDate)}</td></tr>
      </table>

      <div style="display:flex;gap:24px;flex-wrap:wrap;margin-bottom:12px">
        <div style="flex:1;min-width:220px">
          <h4 style="margin-bottom:6px">Compensation</h4>
          <div style="font-size:13px;color:#333">
            <p style="margin:4px 0"><strong>Basic Salary:</strong> ${formatCurrency(contract.salary)}</p>
            <p style="margin:4px 0"><strong>Gross Salary:</strong> ${formatCurrency(contract.gross_salary)}</p>
            <p style="margin:4px 0"><strong>Net Salary:</strong> ${formatCurrency(contract.net_salary)}</p>
          </div>
        </div>
        <div style="flex:1;min-width:220px">
          <h4 style="margin-bottom:6px">Benefits & Deductions</h4>
          <div style="font-size:13px;color:#333">
            <div><strong>Benefits:</strong><ul style="margin:6px 0;padding-left:18px">${benefitsList}</ul></div>
            <div><strong>Allowances:</strong><ul style="margin:6px 0;padding-left:18px">${allowancesList}</ul></div>
            <div><strong>Deductions:</strong><ul style="margin:6px 0;padding-left:18px">${deductionsList}</ul></div>
          </div>
        </div>
      </div>

      <h4>Key responsibilities</h4>
      <ul style="padding-left:18px;margin-bottom:12px">${responsibilitiesList}</ul>

      <h4>Relevant contract clauses</h4>
      <div style="font-size:13px;color:#333;margin-bottom:12px">
        ${clausesHtml}
      </div>

      ${terminationReason ? `<p><strong>Reason for termination:</strong> ${terminationReason}</p>` : ""}

      <p style="margin-top:18px">If you have any questions, reply to this email or contact HR at <a href=\"mailto:hr@company.com\">hr@company.com</a>.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:10px 0" />
      <small style="color:#666">This is an automated message from HR - Contracts.</small>
    </div>
  `;

  return { subject: `Contract terminated`, html: bodyHtml };
};

export default { buildDetailedTerminationEmail };
