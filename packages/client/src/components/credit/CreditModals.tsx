import React from "react";
import { UserPlus, CreditCard, History, Trash2, Loader2, AlertCircle, Save, AlertTriangle } from "lucide-react";
import { observer } from "@legendapp/state/react";
import Modal from "../Modal";
import Select from "../Select";
import { formatCurrency, cn } from "../../lib/utils";

// ⚡ [ATOMIC] High-Performance Reactive Field
const CreditField = observer(({ observable$, ...props }: any) => {
  const value = observable$.get();
  return (
    <input
      {...props}
      className={cn("terminal-input w-full p-2 text-xs", props.className)}
      value={value}
      onChange={(e) => observable$.set(e.target.value)}
    />
  );
});

// 🛰️ [ATOMIC] Profile Modal Blade
const ProfileModal = observer(({ ui$, isOffline$, onSubmit }: any) => {
  const isEditing = ui$.isEditing.get();
  const isOpen = ui$.isProfileModalOpen.get();
  const isSubmitting = ui$.isSubmitting.get();
  const isOffline = isOffline$.get();

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => ui$.isProfileModalOpen.set(false)}
      title={isEditing ? "EDIT_CREDIT_PROFILE" : "ESTABLISH_NEW_CREDIT_PROFILE"}
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div className="space-y-1">
          <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">Customer Name</label>
          <CreditField observable$={ui$.formData.name} placeholder="ENTER_FULL_NAME..." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">Phone Number</label>
            <CreditField observable$={ui$.formData.phone} placeholder="+256..." />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">Credit Limit (UGX)</label>
            <CreditField observable$={ui$.formData.creditLimit} type="number" placeholder="5,000,000" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">Guarantor Info</label>
          <CreditField observable$={ui$.formData.guarantorInfo} placeholder="NAME_AND_CONTACT..." />
        </div>
        <div className="p-3 bg-brand-steel/10 border border-brand-steel text-[9px] font-mono text-slate-800 dark:text-slate-400 break-all">
          BY_COMMITTING_THIS_PROFILE_YOU_ACKNOWLEDGE_THE_CREDIT_RISK_AND_ENFORCE_SYSTEM_TERMS.
        </div>
        <button
          type="submit"
          disabled={isSubmitting || isOffline}
          className={cn(
            "btn-industrial btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4",
            isSubmitting && "opacity-80 dark:opacity-50 cursor-wait",
          )}
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
          {isSubmitting ? "TRANSMITTING..." : isEditing ? "UPDATE_CREDIT_PROFILE" : "AUTHORIZE_CREDIT_FACILITY"}
        </button>
      </form>
    </Modal>
  );
});

// 🛰️ [ATOMIC] Payment Modal Blade
const PaymentModal = observer(({ ui$, activeShift, isOffline$, onSubmit }: any) => {
  const isOpen = ui$.isPaymentModalOpen.get();
  const selectedCustomer = ui$.selectedCustomer.get();
  const isSubmitting = ui$.isSubmitting.get();
  const isOffline = isOffline$.get();

  if (!isOpen || !selectedCustomer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => ui$.isPaymentModalOpen.set(false)}
      title={`RECORD_DEBT_REPAYMENT // ${selectedCustomer.name}`}
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-brand-steel/10 border border-brand-steel mb-4 gap-4">
          <div>
            <div className="text-[8px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest mb-1">Current_Outstanding</div>
            <div className="text-xl font-display text-danger font-black">{formatCurrency(selectedCustomer.balance)}</div>
          </div>
          <div className="w-full sm:w-px h-px sm:h-8 bg-brand-steel/20 hidden sm:block" />
          <div className="sm:text-right">
            <div className="text-[8px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest mb-1">Credit_Limit</div>
            <div className="text-lg font-display text-[var(--text-main)] opacity-70 font-bold">{formatCurrency(selectedCustomer.creditLimit)}</div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">Payment Amount (UGX)</label>
          <CreditField observable$={ui$.paymentData.amount} type="number" placeholder="ENTER_AMOUNT..." />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">Payment Method</label>
          <Select
            label="Method"
            value={ui$.paymentData.paymentMethod.get()}
            onChange={(val) => ui$.paymentData.paymentMethod.set(val)}
            options={[
              { label: "CASH_TRANSACTION", value: "CASH_TRANSACTION" },
              { label: "MOBILE_MONEY", value: "MOBILE_MONEY" },
              { label: "BANK_TRANSFER", value: "BANK_TRANSFER" },
              { label: "CHEQUE_DEPOSIT", value: "CHEQUE_DEPOSIT" },
            ]}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">Reference / Receipt #</label>
          <CreditField observable$={ui$.paymentData.reference} placeholder="REF_ID..." />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isOffline || !activeShift}
          className={cn(
            "btn-industrial btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4",
            (isSubmitting || isOffline || !activeShift) && "opacity-80 dark:opacity-50",
          )}
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
          {isSubmitting ? "PROCESSING_REPAYMENT..." : "PROCESS_REPAYMENT"}
        </button>

        {!activeShift && !isOffline && (
          <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/30 rounded text-[10px] font-mono text-danger uppercase animate-pulse mt-4">
            <AlertCircle size={14} />
            SYSTEM_LOCKED :: PLEASE_START_SHIFT_TO_RECOVER_DEBT
          </div>
        )}
      </form>
    </Modal>
  );
});

// 🛰️ [ATOMIC] History Modal Blade
const HistoryModal = observer(({ ui$, onReverse }: any) => {
  const isOpen = ui$.isHistoryModalOpen.get();
  const selectedCustomer = ui$.selectedCustomer.get();
  const history = ui$.paymentHistory.get();
  const loading = ui$.isHistoryLoading.get();

  if (!isOpen || !selectedCustomer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => ui$.isHistoryModalOpen.set(false)}
      title={`PAYMENT_HISTORY // ${selectedCustomer.name}`}
    >
      <div className="space-y-4 max-h-[70vh] sm:max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar min-h-[200px]">
        {loading ? (
          <div className="h-40 flex flex-col items-center justify-center text-slate-900 dark:text-slate-500 gap-3 grayscale opacity-80 dark:opacity-50">
            <Loader2 className="animate-spin" size={32} strokeWidth={1} />
            <p className="text-[9px] font-display tracking-[0.2em] uppercase">Searching_Records...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center p-8 text-slate-900 dark:text-slate-500 text-xs font-display">NO_PAYMENT_RECORDS_FOUND</div>
        ) : (
          <div className="space-y-2">
            {history.map((pay: any) => (
              <div key={pay.id} className="p-3 sm:p-4 border border-brand-steel/50 bg-brand-dark flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 transition-all hover:border-brand-steel group">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-[var(--text-main)] font-display uppercase tracking-widest">{pay.paymentMethod.replace(/-/g, "_")}</div>
                  <div className="text-[9px] text-slate-900 dark:text-slate-500 font-mono mt-1">{new Date(pay.createdAt).toLocaleString()}</div>
                  {pay.reference && <div className="text-[8px] text-brand-accent mt-1 bg-brand-accent/10 px-1 inline-block truncate max-w-full">REF: {pay.reference}</div>}
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-brand-steel/10 sm:border-t-0 pt-2 sm:pt-0">
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-success">+{formatCurrency(pay.amount)}</div>
                  </div>
                  <button
                    onClick={() => onReverse(pay.id)}
                    className="p-2 text-slate-900 dark:text-slate-500 hover:text-danger hover:bg-danger/10 transition-colors rounded border border-transparent hover:border-danger/20"
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
  );
});

// 🛰️ [ATOMIC] Details Modal Blade
const DetailsModal = observer(({ ui$ }: any) => {
  const isOpen = ui$.isDetailsModalOpen.get();
  const selectedCustomer = ui$.selectedCustomer.get();

  if (!isOpen || !selectedCustomer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => ui$.isDetailsModalOpen.set(false)}
      title={`CUSTOMER_PROFILE_DETAILS // ${selectedCustomer.name}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 border border-brand-steel/50 bg-[var(--bg-main)]/30 shadow-sm">
          <div className="w-16 h-16 bg-brand-steel/20 border border-brand-steel/40 flex items-center justify-center text-2xl font-display text-brand-accent">
            {selectedCustomer.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-display text-[var(--text-main)]">{selectedCustomer.name}</h3>
            <p className="text-[10px] font-mono text-slate-900 dark:text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-2">
              <span className="opacity-80 dark:opacity-50">SYSTEM_ID_REF:</span> {selectedCustomer.id}
            </p>
            <p className="text-base font-mono font-bold text-brand-accent mt-1">{selectedCustomer.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border border-brand-steel/50 bg-[var(--panel-bg)] shadow-inner group">
            <div className="text-[9px] font-display text-slate-900 dark:text-slate-500 mb-1 opacity-90 dark:opacity-60 uppercase tracking-widest group-hover:opacity-100 transition-opacity">CUMULATIVE_DEBT_BALANCE</div>
            <div className={cn("text-xl sm:text-2xl font-mono font-bold tracking-tight", selectedCustomer.balance > 0 ? "text-danger" : "text-success")}>
              {formatCurrency(selectedCustomer.balance)}
            </div>
          </div>
          <div className="p-4 border border-brand-steel/50 bg-[var(--panel-bg)] shadow-inner group">
            <div className="text-[9px] font-display text-slate-900 dark:text-slate-500 mb-1 opacity-90 dark:opacity-60 uppercase tracking-widest group-hover:opacity-100 transition-opacity">AUTHORIZED_CREDIT_LIMIT</div>
            <div className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-[var(--text-main)] opacity-80">{formatCurrency(selectedCustomer.creditLimit)}</div>
          </div>
        </div>

        <div className="p-4 border border-brand-steel bg-[var(--panel-bg)] border-l-4 border-l-brand-accent">
          <div className="text-[9px] font-display text-slate-900 dark:text-slate-500 mb-2">GUARANTOR_INFORMATION</div>
          <div className="text-sm font-mono text-slate-300">
            {selectedCustomer.guarantorInfo || <span className="text-slate-900 dark:text-slate-500 italic">NO DATA PROVIDED</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[9px] font-mono text-slate-900 dark:text-slate-500 bg-brand-steel/10 p-4 border border-brand-steel/20">
          <div className="flex flex-col gap-1">
            <span className="text-slate-800 dark:text-slate-400 uppercase tracking-widest opacity-90 dark:opacity-60">REGISTRY_CREATED</span>
            <span className="font-bold text-[var(--text-main)]">{selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : "N/A"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-slate-800 dark:text-slate-400 uppercase tracking-widest opacity-90 dark:opacity-60">LAST_REPAYMENT</span>
            <span className="font-bold text-[var(--text-main)]">{selectedCustomer.lastPaymentDate ? new Date(selectedCustomer.lastPaymentDate).toLocaleDateString() : "N/A"}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
});

// 🛰️ [VANGUARD] Credit Operation Suite:
export const CreditModals = ({ ui$, activeShift, isOffline$, onProfileSubmit, onPaymentSubmit, onReverse }: any) => {
  return (
    <>
      <ProfileModal ui$={ui$} isOffline$={isOffline$} onSubmit={onProfileSubmit} />
      <PaymentModal ui$={ui$} activeShift={activeShift} isOffline$={isOffline$} onSubmit={onPaymentSubmit} />
      <HistoryModal ui$={ui$} onReverse={onReverse} />
      <DetailsModal ui$={ui$} />
    </>
  );
};
