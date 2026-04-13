import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingDown,
  Calendar,
  Tag,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowRight,
  Save,
  Edit2,
  Trash2,
  Printer,
  Download,
  Loader2,
} from "lucide-react";
import { useHardware } from "../HardwareContext";
import { Expense } from "../types";
import {
  formatCurrency,
  cn,
  getLocalDateString,
  getLocalFirstDayOfMonthString,
} from "../lib/utils";
import Modal from "./Modal";
import Select from "./Select";
import { toast } from "sonner";
import DatePicker from "./DatePicker";

export default function Expenses() {
  const {
    expenses,
    addExpense,
    deleteExpense,
    currentUser,
    refreshExpenses,
    settings,
    isOffline,
  } = useHardware();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Security Protocols
  const [expensePendingId, setExpensePendingId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const today = getLocalDateString();
  const firstDayOfMonth = getLocalFirstDayOfMonthString();
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);

  // Sync with server on date change
  useEffect(() => {
    refreshExpenses(startDate, endDate);
  }, [startDate, endDate]);

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "Utilities",
    date: today,
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) return toast.error("DESCRIPTION_REQUIRED");
    if (!formData.amount || Number(formData.amount) <= 0)
      return toast.error("INVALID_AMOUNT");

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const fullDate = `${formData.date}T${timeStr}`;

    setIsSubmitting(true);
    try {
      await addExpense({
        ...formData,
        date: fullDate,
        amount: parseFloat(formData.amount),
      });

      setIsAddingExpense(false);
      setFormData({
        description: "",
        amount: "",
        category: "Utilities",
        date: today,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      toast.info("EDIT_NOT_IMPLEMENTED_ON_SERVER_YET");
      setEditingExpense(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    "Utilities",
    "Rent",
    "Wages",
    "Maintenance",
    "Supplies",
    "Marketing",
    "Other",
  ];

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const filteredExpenses = expenses.filter(
    (e) =>
      e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Stats Calculations
  const monthlyBurnRate = totalExpenses; // Since we filter by current month by default
  const categoryTotals = expenses.reduce(
    (acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const largestCategory =
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "NONE";

  const handlePrintPDF = () => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "100%";
    iframe.style.bottom = "100%";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const companyName =
      settings.COMPANY_NAME || settings.company_name || "SYSTEM_OPERATOR";
    const companyLocation = settings.LOCATION || "Main Branch";
    const companyInitials = companyName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);

    const stampHtml = `
      <div style="position: fixed; top: 20px; right: 100px; width: 130px; height: 130px; border: 5px double #DC2626; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: rotate(-12deg); color: #DC2626; font-family: sans-serif; z-index: 100; pointer-events: none; opacity: 0.8;">
        <span style="font-size: 9pt; font-weight: bold;">OFFICIAL_LEDGER</span>
        <span style="font-size: 15pt; font-weight: 900; background: #DC2626; color: white; padding: 2px 6px; margin: 4px 0; border-radius: 2px;">VERIFIED</span>
        <span style="font-size: 8pt; font-weight: bold;">${companyInitials}</span>
      </div>
    `;

    const tableRows = filteredExpenses
      .map(
        (exp) => `
      <tr>
        <td style="font-family: monospace; font-size: 9pt;">${new Date(exp.date).toLocaleDateString()}</td>
        <td><span style="text-transform: uppercase; font-size: 8pt; font-weight: bold;">${exp.category}</span></td>
        <td>${exp.description}</td>
        <td style="font-family: monospace;">${exp.authorizedBy || "SYS_ADMIN"}</td>
        <td style="text-align: right; color: #DC2626; font-weight: bold;">-${formatCurrency(exp.amount)}</td>
      </tr>
    `,
      )
      .join("");

    const htmlContent = `
      <html>
        <head>
          <title>Expense Ledger - ${companyName}</title>
          <style>
            @page { size: landscape; margin: 15mm; }
            body { font-family: sans-serif; margin: 0; padding: 0; color: black; }
            .header { border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; position: relative; }
            .brand h1 { font-size: 24pt; margin: 0; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f0f0f0; border: 1px solid #000; padding: 8px; text-align: left; font-size: 9pt; }
            td { border: 1px solid #ccc; padding: 8px; font-size: 10pt; }
            .totals { text-align: right; margin-top: 30px; font-size: 16pt; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
          </style>
        </head>
        <body>
          ${stampHtml}
          <div class="header">
            <div>
              <h1>${companyName}</h1>
              <p>${companyLocation}</p>
              <p style="font-weight: bold; margin-top: 5px;">Operation Expenditure Ledger</p>
            </div>
            <div style="text-align: right; font-size: 9pt;">
              <p><b>GEN_PERIOD:</b> ${startDate} to ${endDate}</p>
              <p><b>RECORDS:</b> ${filteredExpenses.length}</p>
              <p><b>REPORT_ID:</b> EXP_${Date.now().toString(16).toUpperCase()}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>CATEGORY</th>
                <th>DESCRIPTION</th>
                <th>AUTHORIZED_BY</th>
                <th style="text-align: right;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
          <div class="totals">
            <span style="font-size: 10pt; font-weight: normal; margin-right: 20px;">CUMULATIVE_EXPENDITURE:</span>
            ${formatCurrency(totalExpenses)}
          </div>
          <div style="margin-top: 50px; border-top: 1px solid #000; width: 250px; text-align: center; font-family: monospace; font-size: 8pt; padding-top: 5px;">
            FINANCIAL_CONTROLLER_SIGNATURE
          </div>
        </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
  };

  return (
    <div className="h-full flex flex-col p-6 gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-[var(--text-main)]">
            Expense Ledger
          </h1>
          <p className="text-xs text-slate-900 dark:text-slate-500 font-mono mt-1 uppercase tracking-tighter">
            OPERATIONAL_COST_TRACKING // {expenses.length}_LOGS_DETECTION
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-2">
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              label="FROM"
            />
            <ArrowRight
              size={10}
              className="text-slate-900 dark:text-slate-500"
            />
            <DatePicker value={endDate} onChange={setEndDate} label="TO" />
          </div>
          <button
            onClick={() => setIsAddingExpense(true)}
            disabled={isOffline}
            className={cn(
              "btn-industrial btn-primary flex items-center gap-2",
              isOffline &&
                "opacity-80 dark:opacity-50 grayscale cursor-not-allowed",
            )}
          >
            <Plus size={14} />
            {isOffline ? "OFFLINE_LOCKED" : "RECORD_EXPENDITURE"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="industrial-panel p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-steel/30 flex items-center justify-center text-brand-accent">
            <TrendingDown size={20} />
          </div>
          <div>
            <div className="text-[8px] font-display text-slate-900 dark:text-slate-500 uppercase">
              Current_Burn_Rate
            </div>
            <div className="text-lg font-display text-[var(--text-main)]">
              {formatCurrency(monthlyBurnRate)}
            </div>
          </div>
        </div>
        <div className="industrial-panel p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-steel/30 flex items-center justify-center text-brand-accent">
            <Tag size={20} />
          </div>
          <div>
            <div className="text-[8px] font-display text-slate-900 dark:text-slate-500 uppercase">
              Top_Drain_Category
            </div>
            <div className="text-lg font-display text-[var(--text-main)]">
              {largestCategory.toUpperCase()}
            </div>
          </div>
        </div>
        <div className="industrial-panel p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-steel/30 flex items-center justify-center text-warning">
            <Calendar size={20} />
          </div>
          <div>
            <div className="text-[8px] font-display text-slate-900 dark:text-slate-500 uppercase">
              Period_Coverage
            </div>
            <div className="text-lg font-display text-[var(--text-main)] font-mono text-[10px]">
              {new Date(startDate).toLocaleDateString()}++
            </div>
          </div>
        </div>
        <div className="industrial-panel p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-steel/30 flex items-center justify-center text-success">
            <ArrowUpRight size={20} />
          </div>
          <div>
            <div className="text-[8px] font-display text-slate-900 dark:text-slate-500 uppercase">
              Data_Integrity
            </div>
            <div className="text-lg font-display text-success uppercase text-[10px]">
              Verified_System
            </div>
          </div>
        </div>
      </div>

      <div className="industrial-panel flex-1 flex flex-col overflow-hidden">
        <div className="industrial-panel-header">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-display uppercase tracking-widest">
              TRANSACTION_HISTORY
            </span>
            <div className="relative">
              <Search
                className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-900 dark:text-slate-500"
                size={12}
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="FILTER_LEDGER..."
                className="terminal-input pl-8 py-1 text-[10px] w-48"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrintPDF}
              disabled={filteredExpenses.length === 0}
              className={cn(
                "btn-industrial btn-outline py-1 px-3 text-[8px] flex items-center gap-1 transition-all duration-300",
                filteredExpenses.length === 0 && "opacity-40 blur-[1.5px] grayscale cursor-not-allowed pointer-events-none"
              )}
            >
              <Printer size={10} /> PRINT_LEDGER
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>CATEGORY</th>
                <th>DESCRIPTION</th>
                <th>AUTH_BY</th>
                <th className="text-right">AMOUNT</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="group">
                    <td className="font-mono text-slate-800 dark:text-slate-400 text-[10px]">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td>
                      <span className="px-2 py-0.5 bg-brand-steel/30 border border-brand-steel text-[9px] font-display text-[var(--text-main)] opacity-70">
                        {expense.category.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-[var(--text-main)] opacity-90 text-[11px]">
                      {expense.description}
                    </td>
                    <td className="font-mono text-[10px] text-slate-900 dark:text-slate-500">
                      {expense.authorizedBy || "SYS_ADMIN"}
                    </td>
                    <td className="font-mono text-danger text-[11px]">
                      -{formatCurrency(expense.amount)}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingExpense(expense)}
                          className="p-1 text-slate-900 dark:text-slate-500 hover:text-brand-accent transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setExpensePendingId(expense.id);
                            setIsConfirmModalOpen(true);
                          }}
                          className="p-1 text-slate-900 dark:text-slate-500 hover:text-danger transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-slate-900 dark:text-slate-500 font-display text-[10px]"
                  >
                    NO_EXPENSE_RECORDS_FOUND
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-black/20 border-t border-[var(--glass-border)] flex justify-between items-center no-print">
          <span className="text-[9px] font-display text-slate-900 dark:text-slate-500">
            AGGREGATE_TOTAL_FOR_PERIOD
          </span>
          <span className="text-sm font-display text-danger font-bold">
            {formatCurrency(totalExpenses)}
          </span>
        </div>
      </div>

      {/* Record Expenditure Modal */}
      <Modal
        isOpen={isAddingExpense}
        onClose={() => setIsAddingExpense(false)}
        title="RECORD_NEW_EXPENDITURE"
      >
        <form className="space-y-4" onSubmit={handleAddSubmit} noValidate>
          <div className="space-y-1">
            <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
              Description
            </label>
            <input
              type="text"
              className="terminal-input w-full p-2 text-xs"
              placeholder="ENTER_EXPENSE_DETAILS..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
                Amount (UGX)
              </label>
              <input
                type="number"
                className="terminal-input w-full p-2 text-xs"
                placeholder="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Select
                label="Category"
                options={categories}
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
              Date
            </label>
            <DatePicker
              value={formData.date}
              onChange={(v) => setFormData({ ...formData, date: v })}
              className="w-full"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "btn-industrial btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4",
              isSubmitting && "opacity-80 dark:opacity-50 cursor-wait",
            )}
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {isSubmitting ? "PROCESSING..." : "COMMIT_EXPENDITURE"}
          </button>
        </form>
      </Modal>

      {/* Edit Expense Modal */}
      <Modal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        title={`EDIT_EXPENDITURE // REF_${editingExpense?.id}`}
      >
        <form className="space-y-4" onSubmit={handleEditSubmit} noValidate>
          <div className="space-y-1">
            <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
              Description
            </label>
            <input
              type="text"
              className="terminal-input w-full p-2 text-xs"
              defaultValue={editingExpense?.description}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
                Amount (UGX)
              </label>
              <input
                type="number"
                className="terminal-input w-full p-2 text-xs"
                defaultValue={editingExpense?.amount}
              />
            </div>
            <div className="space-y-1">
              <Select
                label="Category"
                options={categories}
                value={editingExpense?.category || ""}
                onChange={(val) => {
                  if (editingExpense)
                    setEditingExpense({ ...editingExpense, category: val });
                }}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "btn-industrial btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4",
              isSubmitting && "opacity-80 dark:opacity-50 cursor-wait",
            )}
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {isSubmitting ? "PROCESSING..." : "UPDATE_EXPENDITURE_DATA"}
          </button>
        </form>
      </Modal>
      {/* Security Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsConfirmModalOpen(false);
            setExpensePendingId(null);
          }
        }}
        title="AUTHORIZED_EXPENSE_PURGE"
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          <div className="p-4 bg-danger/5 border border-danger/20 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center text-danger">
              <TrendingDown size={24} />
            </div>
            <div>
              <h3 className="text-xs font-display uppercase tracking-widest text-danger">
                LEDGER_DELETION_REQUISITION
              </h3>
              <p className="text-[10px] text-slate-900 dark:text-slate-500 mt-1 font-mono leading-relaxed">
                PURGING_EXPENSE_RECORD:{" "}
                <span className="text-black font-bold">
                  #{expensePendingId?.slice(0, 8)}
                </span>
                <br />
                THIS COMMAND WILL PERMANENTLY REMOVE THE ENTRY FROM THE LEDGER.
                THIS ACTION IS LOGGED.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={async () => {
                if (!expensePendingId) return;
                setIsSubmitting(true);
                try {
                  await deleteExpense(expensePendingId);
                  setIsConfirmModalOpen(false);
                  setExpensePendingId(null);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
              className="btn-industrial bg-danger text-white py-4 font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0px_0px_rgba(220,38,38,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-80 dark:opacity-50"
            >
              {isSubmitting ? "PURGING..." : "AUTHORIZE_PURGE"}
            </button>
            <button
              onClick={() => {
                setIsConfirmModalOpen(false);
                setExpensePendingId(null);
              }}
              disabled={isSubmitting}
              className="btn-industrial btn-outline py-3 text-[10px] uppercase font-bold"
            >
              ABORT_COMMAND
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
