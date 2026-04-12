import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  CreditCard,
  AlertCircle,
  TrendingUp,
  History,
  UserCheck,
  Save,
  Edit,
  Info,
  Loader2,
  UserPlus,
  Trash2,
} from "lucide-react";
import { useHardware } from "../HardwareContext";
import { formatCurrency, cn } from "../lib/utils";
import { Customer } from "../types";
import Modal from "./Modal";
import Select from "./Select";
import { toast } from "sonner";

export default function CreditManagement() {
  const {
    customers,
    addCustomer,
    updateCustomer,
    recordPayment,
    deleteCustomerPayment,
    getCustomerPayments,
    getDailyDebtRecovered,
    isOffline,
    activeShift,
  } = useHardware();
  const [searchQuery, setSearchQuery] = useState("");
  const [recoveredToday, setRecoveredToday] = useState(0);

  useEffect(() => {
    getDailyDebtRecovered().then(setRecoveredToday);
  }, [getDailyDebtRecovered]);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(
    null,
  );

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [openMetric, setOpenMetric] = useState<
    "outstanding" | "risk" | "recovered" | null
  >(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    creditLimit: "",
    guarantorInfo: "",
  });

  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMethod: "CASH_TRANSACTION",
    reference: "",
  });

  const openNewProfile = () => {
    setIsEditing(false);
    setSelectedCustomer(null);
    setFormData({ name: "", phone: "", creditLimit: "", guarantorInfo: "" });
    setIsProfileModalOpen(true);
  };

  const openEditProfile = (customer: Customer) => {
    setIsEditing(true);
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      creditLimit: customer.creditLimit.toString(),
      guarantorInfo: customer.guarantorInfo || "",
    });
    setIsProfileModalOpen(true);
  };

  const openHistory = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setPaymentHistory([]);
    setIsHistoryModalOpen(true);
    setIsHistoryLoading(true);
    try {
      const payments = await getCustomerPayments(customer.id);
      setPaymentHistory(payments);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const openDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error("CUSTOMER_NAME_REQUIRED");
    if (!formData.phone) return toast.error("PHONE_NUMBER_REQUIRED");
    if (!formData.creditLimit || Number(formData.creditLimit) <= 0)
      return toast.error("INVALID_CREDIT_LIMIT");

    setIsSubmitting(true);
    try {
      if (isEditing && selectedCustomer) {
        await updateCustomer(selectedCustomer.id, {
          name: formData.name,
          phone: formData.phone,
          creditLimit: Number(formData.creditLimit),
          guarantorInfo: formData.guarantorInfo,
        });
      } else {
        await addCustomer({
          name: formData.name,
          phone: formData.phone,
          email: "",
          creditLimit: Number(formData.creditLimit),
          guarantorInfo: formData.guarantorInfo,
        });
      }
      setIsProfileModalOpen(false);
      setFormData({ name: "", phone: "", creditLimit: "", guarantorInfo: "" });
      setSelectedCustomer(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    if (!activeShift)
      return toast.error("TERMINAL_CLOSED // OPEN_SHIFT_TO_PROCESS_PAYMENTS");
    if (!paymentData.amount || Number(paymentData.amount) <= 0)
      return toast.error("INVALID_PAYMENT_AMOUNT");

    setIsSubmitting(true);
    try {
      await recordPayment(
        selectedCustomer.id,
        Number(paymentData.amount),
        paymentData.paymentMethod.toLowerCase().replace("_", "-"),
        paymentData.reference,
        "", // notes
        activeShift.id,
      );
      // Refresh daily stat after a new payment is recorded
      getDailyDebtRecovered().then(setRecoveredToday);
      setIsPaymentModalOpen(false);
      setPaymentData({
        amount: "",
        paymentMethod: "CASH_TRANSACTION",
        reference: "",
      });
      setSelectedCustomer(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingPaymentId(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deletingPaymentId || !selectedCustomer) return;
    setIsSubmitting(true);
    try {
      await deleteCustomerPayment(deletingPaymentId);
      const payments = await getCustomerPayments(selectedCustomer.id);
      setPaymentHistory(payments);
      getDailyDebtRecovered().then(setRecoveredToday);
      toast.success("PAYMENT_REVERSED");
      setIsDeleteModalOpen(false);
    } finally {
      setIsSubmitting(false);
      setDeletingPaymentId(null);
    }
  };

  const totalOutstanding = customers.reduce((acc, c) => acc + c.balance, 0);
  const criticalDebtors = customers.filter(
    (c) => c.balance > c.creditLimit * 0.8,
  ).length;

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery),
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 md:h-full flex flex-col overflow-y-auto md:overflow-hidden custom-scrollbar">
      <div className="flex justify-between items-center shrink-0 border-b border-brand-steel/10 pb-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg sm:text-2xl font-display text-[var(--text-main)] uppercase tracking-tight">
            Credit // Intel
          </h1>
          <p className="text-[8px] text-slate-900 dark:text-slate-500 font-mono uppercase tracking-[0.2em] opacity-90 dark:opacity-60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
            Registry: {customers.length}
          </p>
        </div>
        <button
          onClick={openNewProfile}
          disabled={isOffline}
          className={cn(
            "btn-industrial btn-primary w-full md:w-auto px-3 py-2 sm:py-2.5 flex items-center justify-center gap-2 font-black tracking-widest text-[9px] uppercase",
            isOffline &&
              "opacity-80 dark:opacity-50 grayscale cursor-not-allowed",
          )}
        >
          <UserPlus size={14} />
          <span className="ml-1">{isOffline ? "LOCKED" : "NEW_PROFILE"}</span>
        </button>
      </div>

      {/* Summary Cards */}
      {/* Metric Horizon Scrollable */}
      {/* Metrics: mobile accordion (md:hidden) and grid for md+ */}
      <div className="md:hidden space-y-2 -mx-4 px-4">
        <div className="industrial-panel p-2 bg-danger/5 border-danger/20">
          <button
            className="w-full flex items-center justify-between"
            onClick={() =>
              setOpenMetric(openMetric === "outstanding" ? null : "outstanding")
            }
          >
            <div className="flex items-center gap-2">
              <div className="p-1 bg-brand-dark border border-danger/20 text-danger scale-90">
                <CreditCard size={14} />
              </div>
              <div className="text-[9px] font-display uppercase tracking-widest">
                Total_Receivables
              </div>
            </div>
            <div className="text-sm font-mono">
              {openMetric === "outstanding" ? "▾" : "▸"}
            </div>
          </button>
          {openMetric === "outstanding" && (
            <div className="mt-2">
              <div className="text-sm font-display text-[var(--text-main)]">
                {formatCurrency(totalOutstanding)}
              </div>
            </div>
          )}
        </div>

        <div className="industrial-panel p-2 bg-warning/5 border-warning/20">
          <button
            className="w-full flex items-center justify-between"
            onClick={() => setOpenMetric(openMetric === "risk" ? null : "risk")}
          >
            <div className="flex items-center gap-2">
              <div className="p-1 bg-brand-dark border border-warning/20 text-warning scale-90">
                <AlertCircle size={14} />
              </div>
              <div className="text-[9px] font-display uppercase tracking-widest">
                Critical_Profiles
              </div>
            </div>
            <div className="text-sm font-mono">
              {openMetric === "risk" ? "▾" : "▸"}
            </div>
          </button>
          {openMetric === "risk" && (
            <div className="mt-2">
              <div className="text-sm font-display text-[var(--text-main)]">
                {criticalDebtors}{" "}
                <span className="text-[8px] opacity-90">ACCTS</span>
              </div>
            </div>
          )}
        </div>

        <div className="industrial-panel p-2 bg-success/5 border-success/20">
          <button
            className="w-full flex items-center justify-between"
            onClick={() =>
              setOpenMetric(openMetric === "recovered" ? null : "recovered")
            }
          >
            <div className="flex items-center gap-2">
              <div className="p-1 bg-brand-dark border border-success/20 text-success scale-90">
                <TrendingUp size={14} />
              </div>
              <div className="text-[9px] font-display uppercase tracking-widest">
                Recovered_Today
              </div>
            </div>
            <div className="text-sm font-mono">
              {openMetric === "recovered" ? "▾" : "▸"}
            </div>
          </button>
          {openMetric === "recovered" && (
            <div className="mt-2">
              <div className="text-sm font-display text-[var(--text-main)]">
                {formatCurrency(recoveredToday)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="hidden md:grid md:grid-cols-3 gap-3 overflow-x-auto no-scrollbar pb-2 md:-mx-6 md:px-6 shrink-0 mask-linear-right">
        {/* Metric Card: Outstanding */}
        <div className="industrial-panel p-3 bg-danger/5 border-danger/20 min-w-[160px] flex-1">
          <div className="flex justify-between items-start mb-2">
            <div className="p-1 bg-brand-dark border border-danger/20 text-danger scale-90">
              <CreditCard size={14} />
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
          </div>
          <p className="text-[7px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest mb-0.5">
            Total_Receivables
          </p>
          <h3 className="text-sm font-display text-[var(--text-main)] tracking-widest">
            {formatCurrency(totalOutstanding)}
          </h3>
        </div>

        {/* Metric Card: Risk */}
        <div className="industrial-panel p-3 bg-warning/5 border-warning/20 min-w-[160px] flex-1">
          <div className="flex justify-between items-start mb-2">
            <div className="p-1 bg-brand-dark border border-warning/20 text-warning scale-90">
              <AlertCircle size={14} />
            </div>
            <span className="text-[7px] font-display text-warning uppercase font-black tracking-tighter">
              RISK
            </span>
          </div>
          <p className="text-[7px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest mb-0.5">
            Critical_Profiles
          </p>
          <h3 className="text-sm font-display text-[var(--text-main)] tracking-widest">
            {criticalDebtors}{" "}
            <span className="text-[8px] opacity-90 dark:opacity-60">ACCTS</span>
          </h3>
        </div>

        {/* Metric Card: Recovery */}
        <div className="industrial-panel p-3 bg-success/5 border-success/20 min-w-[160px] flex-1">
          <div className="flex justify-between items-start mb-2">
            <div className="p-1 bg-brand-dark border border-success/20 text-success scale-90">
              <TrendingUp size={14} />
            </div>
            <span className="text-[7px] font-display text-success uppercase font-black tracking-tighter">
              FLOW
            </span>
          </div>
          <p className="text-[7px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest mb-0.5">
            Recovered_Today
          </p>
          <h3 className="text-sm font-display text-[var(--text-main)] tracking-widest">
            {formatCurrency(recoveredToday)}
          </h3>
        </div>
      </div>

      {/* Customer List / Ledger Horizon */}
      <div className="industrial-panel flex-none md:flex-1 flex flex-col md:overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-brand-steel/10 bg-black/5 items-stretch sm:items-center flex-none">
          <span className="text-[10px] font-display uppercase tracking-widest text-slate-900 dark:text-slate-500 hidden sm:inline">
            CREDIT_LEDGER
          </span>
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-accent/50"
              size={14}
            />
            <input
              type="text"
              placeholder="FILTER_DEBTOR_REGISTRY..."
              className="terminal-input w-full pl-10 h-10 text-[9px] uppercase font-mono tracking-widest bg-transparent border-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-none md:flex-1 md:overflow-y-auto custom-scrollbar">
          {/* Desktop Table View */}
          <table className="data-table hidden md:table">
            <thead>
              <tr>
                <th>CUSTOMER_PROFILE</th>
                <th>CREDIT_LIMIT</th>
                <th>CURRENT_BALANCE</th>
                <th>UTILIZATION</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => {
                const utilization =
                  (customer.balance / customer.creditLimit) * 100;
                return (
                  <tr
                    key={customer.id}
                    className="group transition-colors hover:bg-brand-steel/5"
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-steel/30 flex items-center justify-center text-xs font-display text-slate-800 dark:text-slate-400 font-bold uppercase">
                          {customer.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-display text-[var(--text-main)] font-bold tracking-tight uppercase">
                            {customer.name}
                          </span>
                          <span className="text-[9px] text-slate-900 dark:text-slate-500 font-mono font-bold">
                            CONTACT: {customer.phone}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-400">
                        {formatCurrency(customer.creditLimit)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={cn(
                          "text-xs font-mono font-bold",
                          customer.balance > 0 ? "text-danger" : "text-success",
                        )}
                      >
                        {formatCurrency(customer.balance)}
                      </span>
                    </td>
                    <td>
                      <div className="w-40 space-y-1">
                        <div className="flex justify-between text-[8px] font-mono text-slate-900 dark:text-slate-500">
                          <span>{utilization.toFixed(1)}%</span>
                          <span className="font-bold">
                            {formatCurrency(
                              customer.creditLimit - customer.balance,
                            )}{" "}
                            LEFT
                          </span>
                        </div>
                        <div className="h-1 w-full bg-brand-dark border border-brand-steel overflow-hidden shadow-inner">
                          <div
                            className={cn(
                              "h-full transition-all duration-500",
                              utilization > 90
                                ? "bg-danger"
                                : utilization > 70
                                  ? "bg-warning"
                                  : "bg-brand-accent",
                            )}
                            style={{ width: `${Math.min(100, utilization)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsPaymentModalOpen(true);
                          }}
                          disabled={isOffline}
                          className={cn(
                            "p-1.5 text-slate-900 dark:text-slate-500 hover:text-success hover:bg-brand-steel/30 transition-all border border-brand-steel/30 rounded",
                            isOffline && "opacity-30 cursor-not-allowed",
                          )}
                          title={isOffline ? "Sync Required" : "Record Payment"}
                        >
                          <CreditCard size={14} />
                        </button>
                        <button
                          onClick={() => openHistory(customer)}
                          className="p-1.5 text-slate-900 dark:text-slate-500 hover:text-brand-accent hover:bg-brand-steel/30 transition-all border border-brand-steel/30 rounded"
                          title="Payment History"
                        >
                          <History size={14} />
                        </button>
                        <button
                          onClick={() => openDetails(customer)}
                          className="p-1.5 text-slate-900 dark:text-slate-500 hover:text-[var(--text-main)] hover:bg-brand-steel/30 transition-all border border-brand-steel/30 rounded"
                          title="View Details"
                        >
                          <UserCheck size={14} />
                        </button>
                        <button
                          onClick={() => openEditProfile(customer)}
                          disabled={isOffline}
                          className={cn(
                            "p-1.5 text-slate-900 dark:text-slate-500 hover:text-[var(--text-main)] hover:bg-brand-steel/30 transition-all border border-brand-steel/30 rounded",
                            isOffline && "opacity-30 cursor-not-allowed",
                          )}
                          title={isOffline ? "Sync Required" : "Edit Customer"}
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile Credit Health Card Stack: Nano Architecture */}
          <div className="md:hidden p-2 space-y-2 pb-32">
            {filteredCustomers.map((customer) => {
              const utilization =
                (customer.balance / customer.creditLimit) * 100;
              return (
                <div
                  key={customer.id}
                  className="industrial-panel p-2 sm:p-3 bg-[var(--bg-panel)] flex flex-col gap-2 sm:gap-2.5 border-brand-steel/20 hover:border-brand-accent/50 active:scale-[0.99] transition-all"
                >
                  {/* Row 1: Profile + Status */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                      <h3 className="text-[10px] font-display font-black text-[var(--text-main)] uppercase tracking-tight truncate max-w-[140px]">
                        {customer.name}
                      </h3>
                    </div>
                    {utilization > 80 ? (
                      <span className="text-[7px] font-display text-danger font-black uppercase tracking-widest animate-pulse">
                        CRITICAL_EXPOSURE
                      </span>
                    ) : (
                      <span className="text-[7px] font-display text-success uppercase font-bold tracking-widest opacity-90 dark:opacity-60">
                        STABLE_ACCOUNT
                      </span>
                    )}
                  </div>

                  {/* Row 2: Tactical Metrics & Utilization */}
                  <div className="bg-black/10 p-2 border border-brand-steel/10 rounded-sm">
                    <div className="flex justify-between items-end mb-1.5">
                      <span
                        className={cn(
                          "text-[11px] font-mono font-black",
                          customer.balance > customer.creditLimit * 0.7
                            ? "text-danger"
                            : "text-brand-accent",
                        )}
                      >
                        {formatCurrency(customer.balance)}
                      </span>
                      <span className="text-[8px] font-mono text-slate-900 dark:text-slate-500">
                        {utilization.toFixed(0)}%_USED
                      </span>
                    </div>
                    <div className="h-1 w-full bg-black/20 overflow-hidden rounded-full">
                      <div
                        className={cn(
                          "h-full transition-all duration-700",
                          utilization > 90
                            ? "bg-danger"
                            : utilization > 70
                              ? "bg-warning"
                              : "bg-brand-accent shadow-[0_0_8px_rgba(var(--brand-accent-rgb),0.4)]",
                        )}
                        style={{ width: `${Math.min(100, utilization)}%` }}
                      />
                    </div>
                  </div>

                  {/* Row 3: Action Stream */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      <span className="text-[7px] font-mono text-slate-900 dark:text-slate-500 bg-brand-steel/10 px-1 py-0.5 rounded-sm">
                        {customer.phone}
                      </span>
                      <span className="text-[7px] font-mono text-slate-900 dark:text-slate-500 bg-brand-steel/10 px-1 py-0.5 rounded-sm">
                        LIM:{" "}
                        {formatCurrency(customer.creditLimit).replace(
                          "USH",
                          "",
                        )}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsPaymentModalOpen(true);
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-brand-accent/10 text-brand-accent border border-brand-accent/20 rounded active:bg-brand-accent active:text-white transition-all shadow-sm"
                      >
                        <CreditCard size={12} />
                      </button>
                      <button
                        onClick={() => openHistory(customer)}
                        className="w-8 h-8 flex items-center justify-center bg-brand-steel/10 text-slate-900 dark:text-slate-500 border border-brand-steel/20 rounded active:scale-95"
                      >
                        <History size={12} />
                      </button>
                      <button
                        onClick={() => openEditProfile(customer)}
                        className="w-8 h-8 flex items-center justify-center bg-brand-steel/10 text-slate-900 dark:text-slate-500 border border-brand-steel/20 rounded active:scale-95"
                      >
                        <Edit size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit/New Credit Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title={
          isEditing
            ? `EDIT_CREDIT_PROFILE // ${selectedCustomer?.name}`
            : "ESTABLISH_NEW_CREDIT_PROFILE"
        }
      >
        <form className="space-y-4" onSubmit={handleProfileSubmit} noValidate>
          <div className="space-y-1">
            <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
              Customer Name
            </label>
            <input
              type="text"
              className="terminal-input w-full p-2 text-xs"
              placeholder="ENTER_FULL_NAME..."
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
                Phone Number
              </label>
              <input
                type="tel"
                className="terminal-input w-full p-2 text-xs"
                placeholder="+256..."
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
                Credit Limit (UGX)
              </label>
              <input
                type="number"
                className="terminal-input w-full p-2 text-xs"
                placeholder="5,000,000"
                value={formData.creditLimit}
                onChange={(e) =>
                  setFormData({ ...formData, creditLimit: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
              Guarantor Info
            </label>
            <input
              type="text"
              className="terminal-input w-full p-2 text-xs"
              placeholder="NAME_AND_CONTACT..."
              value={formData.guarantorInfo}
              onChange={(e) =>
                setFormData({ ...formData, guarantorInfo: e.target.value })
              }
            />
          </div>
          <div className="p-3 bg-brand-steel/10 border border-brand-steel text-[9px] font-mono text-slate-800 dark:text-slate-400 break-all">
            BY_COMMITTING_THIS_PROFILE_YOU_ACKNOWLEDGE_THE_CREDIT_RISK_AND_ENFORCE_SYSTEM_TERMS.
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
              <UserPlus size={14} />
            )}
            {isSubmitting
              ? isEditing
                ? "UPDATING..."
                : "AUTHORIZING..."
              : isEditing
                ? "UPDATE_CREDIT_PROFILE"
                : "AUTHORIZE_CREDIT_FACILITY"}
          </button>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`RECORD_DEBT_REPAYMENT // ${selectedCustomer?.name}`}
      >
        <form className="space-y-4" onSubmit={handlePaymentSubmit} noValidate>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-brand-steel/10 border border-brand-steel mb-4 gap-4">
            <div>
              <div className="text-[8px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest mb-1">
                Current_Outstanding
              </div>
              <div className="text-xl font-display text-danger font-black">
                {formatCurrency(selectedCustomer?.balance || 0)}
              </div>
            </div>
            <div className="w-full sm:w-px h-px sm:h-8 bg-brand-steel/20 hidden sm:block" />
            <div className="sm:text-right">
              <div className="text-[8px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest mb-1">
                Credit_Limit
              </div>
              <div className="text-lg font-display text-[var(--text-main)] opacity-70 font-bold">
                {formatCurrency(selectedCustomer?.creditLimit || 0)}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
              Payment Amount (UGX)
            </label>
            <input
              type="number"
              className="terminal-input w-full p-2 text-xs"
              placeholder="ENTER_AMOUNT..."
              required
              value={paymentData.amount}
              onChange={(e) =>
                setPaymentData({ ...paymentData, amount: e.target.value })
              }
            />
          </div>

          <Select
            label="Payment Method"
            options={[
              { label: "CASH_TRANSACTION", value: "CASH_TRANSACTION" },
              { label: "MOBILE_MONEY", value: "MOBILE_MONEY" },
              { label: "BANK_TRANSFER", value: "BANK_TRANSFER" },
              { label: "CHEQUE_DEPOSIT", value: "CHEQUE_DEPOSIT" },
            ]}
            value={paymentData.paymentMethod}
            onChange={(val) =>
              setPaymentData({ ...paymentData, paymentMethod: val })
            }
          />

          <div className="space-y-1">
            <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
              Reference / Receipt #
            </label>
            <input
              type="text"
              className="terminal-input w-full p-2 text-xs"
              placeholder="REF_ID..."
              value={paymentData.reference}
              onChange={(e) =>
                setPaymentData({ ...paymentData, reference: e.target.value })
              }
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
              <CreditCard size={14} />
            )}
            {isSubmitting ? "PROCESSING_REPAYMENT..." : "PROCESS_REPAYMENT"}
          </button>

          {!activeShift && (
            <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/30 rounded text-[10px] font-mono text-danger uppercase animate-pulse mt-4">
              <AlertCircle size={14} />
              SYSTEM_LOCKED :: PLEASE_START_SHIFT_TO_RECOVER_DEBT
            </div>
          )}
        </form>
      </Modal>

      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`PAYMENT_HISTORY // ${selectedCustomer?.name}`}
      >
        <div className="space-y-4 max-h-[70vh] sm:max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar min-h-[200px]">
          {isHistoryLoading ? (
            <div className="h-40 flex flex-col items-center justify-center text-slate-900 dark:text-slate-500 gap-3 grayscale opacity-80 dark:opacity-50">
              <Loader2 className="animate-spin" size={32} strokeWidth={1} />
              <p className="text-[9px] font-display tracking-[0.2em] uppercase">
                Searching_Records...
              </p>
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="text-center p-8 text-slate-900 dark:text-slate-500 text-xs font-display">
              NO_PAYMENT_RECORDS_FOUND
            </div>
          ) : (
            <div className="space-y-2">
              {paymentHistory.map((pay) => (
                <div
                  key={pay.id}
                  className="p-3 sm:p-4 border border-brand-steel/50 bg-brand-dark flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 transition-all hover:border-brand-steel group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-[var(--text-main)] font-display uppercase tracking-widest">
                      {pay.paymentMethod.replace(/-/g, "_")}
                    </div>
                    <div className="text-[9px] text-slate-900 dark:text-slate-500 font-mono mt-1">
                      {new Date(pay.createdAt).toLocaleString()}
                    </div>
                    {pay.reference && (
                      <div className="text-[8px] text-brand-accent mt-1 bg-brand-accent/10 px-1 inline-block truncate max-w-full">
                        REF: {pay.reference}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-brand-steel/10 sm:border-t-0 pt-2 sm:pt-0">
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-success">
                        +{formatCurrency(pay.amount)}
                      </div>
                    </div>
                    <button
                      onClick={() => confirmDelete(pay.id)}
                      className="p-2 text-slate-900 dark:text-slate-500 hover:text-danger hover:bg-danger/10 transition-colors rounded border border-transparent hover:border-danger/20"
                      title="Delete & Rollback"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={`CUSTOMER_PROFILE_DETAILS // ${selectedCustomer?.name}`}
        maxWidth="max-w-lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 border border-brand-steel/50 bg-[var(--bg-main)]/30 shadow-sm">
              <div className="w-16 h-16 bg-brand-steel/20 border border-brand-steel/40 flex items-center justify-center text-2xl font-display text-brand-accent">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-display text-[var(--text-main)]">
                  {selectedCustomer.name}
                </h3>
                <p className="text-[10px] font-mono text-slate-900 dark:text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-2">
                  <span className="opacity-80 dark:opacity-50">
                    SYSTEM_ID_REF:
                  </span>{" "}
                  {selectedCustomer.id}
                </p>
                <p className="text-base font-mono font-bold text-brand-accent mt-1">
                  {selectedCustomer.phone}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-brand-steel/50 bg-[var(--panel-bg)] shadow-inner group">
                <div className="text-[9px] font-display text-slate-900 dark:text-slate-500 mb-1 opacity-90 dark:opacity-60 uppercase tracking-widest group-hover:opacity-100 transition-opacity">
                  CUMULATIVE_DEBT_BALANCE
                </div>
                <div
                  className={cn(
                    "text-xl sm:text-2xl font-mono font-bold tracking-tight",
                    selectedCustomer.balance > 0
                      ? "text-danger"
                      : "text-success",
                  )}
                >
                  {formatCurrency(selectedCustomer.balance)}
                </div>
              </div>
              <div className="p-4 border border-brand-steel/50 bg-[var(--panel-bg)] shadow-inner group">
                <div className="text-[9px] font-display text-slate-900 dark:text-slate-500 mb-1 opacity-90 dark:opacity-60 uppercase tracking-widest group-hover:opacity-100 transition-opacity">
                  AUTHORIZED_CREDIT_LIMIT
                </div>
                <div className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-[var(--text-main)] opacity-80">
                  {formatCurrency(selectedCustomer.creditLimit)}
                </div>
              </div>
            </div>

            <div className="p-4 border border-brand-steel bg-[var(--panel-bg)] border-l-4 border-l-brand-accent">
              <div className="text-[9px] font-display text-slate-900 dark:text-slate-500 mb-2">
                GUARANTOR_INFORMATION
              </div>
              <div className="text-sm font-mono text-slate-300">
                {selectedCustomer.guarantorInfo || (
                  <span className="text-slate-900 dark:text-slate-500 italic">
                    NO DATA PROVIDED
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[9px] font-mono text-slate-900 dark:text-slate-500 bg-brand-steel/10 p-4 border border-brand-steel/20">
              <div className="flex flex-col gap-1">
                <span className="text-slate-800 dark:text-slate-400 uppercase tracking-widest opacity-90 dark:opacity-60">
                  REGISTRY_CREATED
                </span>{" "}
                <span className="font-bold text-[var(--text-main)]">
                  {selectedCustomer.createdAt
                    ? new Date(selectedCustomer.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-800 dark:text-slate-400 uppercase tracking-widest opacity-90 dark:opacity-60">
                  LAST_REPAYMENT
                </span>{" "}
                <span className="font-bold text-[var(--text-main)]">
                  {selectedCustomer.lastPaymentDate
                    ? new Date(
                        selectedCustomer.lastPaymentDate,
                      ).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Industrial Rollback Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="CRITICAL_AUTHORIZATION // ROLLBACK_RECOVERY"
      >
        <div className="space-y-4">
          <div className="p-4 bg-danger/5 border border-danger/20 rounded">
            <div className="flex items-center gap-3 text-danger mb-2">
              <AlertCircle size={18} />
              <span className="text-[10px] font-display font-bold uppercase tracking-widest">
                Permanent_Action_Warning
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-800 dark:text-slate-400 leading-relaxed uppercase">
              You are about to ROLLBACK this recovery transaction. This will
              DELETE the payment record and RE-INSTATE the debt to the
              customer's balance.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="btn-industrial py-4 sm:py-2 text-[9px] uppercase tracking-widest font-black text-slate-900 dark:text-slate-500 border border-brand-steel/20"
            >
              NEGATE_ROLLBACK
            </button>
            <button
              onClick={executeDelete}
              disabled={isSubmitting}
              className="btn-industrial btn-danger py-4 sm:py-2 text-[9px] uppercase tracking-widest font-black flex items-center justify-center gap-2 shadow-lg"
            >
              {isSubmitting ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} className="rotate-45" />
              )}
              CONFIRM_REVERSAL
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
