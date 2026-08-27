import React, { useEffect, useCallback, useMemo } from "react";
import { useHardware } from "../HardwareContext";
import { useObservable, observer } from "@legendapp/state/react";
import { computed } from "@legendapp/state";
import { toast } from "sonner";
import ConfirmDialog from "./ConfirmDialog";

// 🛰️ [ATOMIC] Industrial Credit Blades
import { CreditHeader } from "./credit/CreditHeader";
import { CreditMetrics } from "./credit/CreditMetrics";
import { CreditTable } from "./credit/CreditTable";
import { CreditModals } from "./credit/CreditModals";

export default function CreditManagement() {
  const hardware = useHardware();
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
    inventoryState$,
    financeState$
  } = hardware;

  // 🛰️ [VANGUARD] Zero-Render UI Pulse
  const ui$ = useObservable({
    searchQuery: "",
    recoveredToday: 0,
    isProfileModalOpen: false,
    isEditing: false,
    isHistoryModalOpen: false,
    isPaymentModalOpen: false,
    isDetailsModalOpen: false,
    isSubmitting: false,
    isHistoryLoading: false,
    openMetric: null as string | null,
    paymentHistory: [] as any[],
    selectedCustomer: null as any,
    formData: {
      name: "",
      phone: "",
      creditLimit: "",
      guarantorInfo: "",
    },
    paymentData: {
      amount: "",
      paymentMethod: "CASH_TRANSACTION",
      reference: "",
    },
    confirmConfig: {
      isOpen: false,
      title: "",
      message: "",
      confirmText: "",
      type: "danger" as "danger" | "warning" | "info",
      onConfirm: () => {},
    }
  });

  // 🛰️ [INTELLIGENCE] Computed Financial Horizon
  const customers$ = financeState$.customers;
  
  const totalOutstanding$ = useMemo(() => computed(() => 
    (customers$.get() || []).reduce((acc: number, c: any) => acc + (c.balance || 0), 0)
  ), [customers$]);

  const criticalDebtors$ = useMemo(() => computed(() => 
    (customers$.get() || []).filter((c: any) => (c.balance || 0) > (c.creditLimit || 0) * 0.8).length
  ), [customers$]);

  const customerCount$ = useMemo(() => computed(() => 
    (customers$.get() || []).length
  ), [customers$]);

  useEffect(() => {
    getDailyDebtRecovered().then(val => ui$.recoveredToday.set(val));
  }, [getDailyDebtRecovered]);

  // 🛰️ [PROTOCOL] Operation Handlers
  const handleOpenNew = useCallback(() => {
    ui$.isEditing.set(false);
    ui$.selectedCustomer.set(null);
    ui$.formData.set({ name: "", phone: "", creditLimit: "", guarantorInfo: "" });
    ui$.isProfileModalOpen.set(true);
  }, []);

  const handleEditProfile = useCallback((customer: any) => {
    ui$.isEditing.set(true);
    ui$.selectedCustomer.set(customer);
    ui$.formData.set({
      name: customer.name,
      phone: customer.phone,
      creditLimit: customer.creditLimit.toString(),
      guarantorInfo: customer.guarantorInfo || "",
    });
    ui$.isProfileModalOpen.set(true);
  }, []);

  const handleRecordPayment = useCallback((customer: any) => {
    ui$.selectedCustomer.set(customer);
    ui$.paymentData.set({ amount: "", paymentMethod: "CASH_TRANSACTION", reference: "" });
    ui$.isPaymentModalOpen.set(true);
  }, []);

  const handleViewHistory = useCallback(async (customer: any) => {
    ui$.selectedCustomer.set(customer);
    ui$.paymentHistory.set([]);
    ui$.isHistoryModalOpen.set(true);
    ui$.isHistoryLoading.set(true);
    try {
      const payments = await getCustomerPayments(customer.id);
      ui$.paymentHistory.set(payments);
    } finally {
      ui$.isHistoryLoading.set(false);
    }
  }, []);

  const handleViewDetails = useCallback((customer: any) => {
    ui$.selectedCustomer.set(customer);
    ui$.isDetailsModalOpen.set(true);
  }, []);

  const onProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = ui$.formData.get();
    if (!data.name) return toast.error("CUSTOMER_NAME_REQUIRED");
    if (!data.phone) return toast.error("PHONE_NUMBER_REQUIRED");
    if (!data.creditLimit || Number(data.creditLimit) <= 0) return toast.error("INVALID_CREDIT_LIMIT");

    ui$.isSubmitting.set(true);
    try {
      if (ui$.isEditing.get() && ui$.selectedCustomer.get()) {
        await updateCustomer(ui$.selectedCustomer.get().id, {
          name: data.name,
          phone: data.phone,
          creditLimit: Number(data.creditLimit),
          guarantorInfo: data.guarantorInfo,
        });
      } else {
        await addCustomer({
          name: data.name,
          phone: data.phone,
          email: "",
          creditLimit: Number(data.creditLimit),
          guarantorInfo: data.guarantorInfo,
        });
      }
      ui$.isProfileModalOpen.set(false);
    } finally {
      ui$.isSubmitting.set(false);
    }
  };

  const onPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const customer = ui$.selectedCustomer.get();
    const data = ui$.paymentData.get();
    if (!customer) return;
    if (!activeShift) return toast.error("TERMINAL_CLOSED // OPEN_SHIFT_TO_PROCESS_PAYMENTS");
    if (!data.amount || Number(data.amount) <= 0) return toast.error("INVALID_PAYMENT_AMOUNT");

    ui$.isSubmitting.set(true);
    try {
      await recordPayment(
        customer.id,
        Number(data.amount),
        data.paymentMethod.toLowerCase().replace("_", "-"),
        data.reference,
        "",
        activeShift.id,
      );
      getDailyDebtRecovered().then(val => ui$.recoveredToday.set(val));
      ui$.isPaymentModalOpen.set(false);
    } finally {
      ui$.isSubmitting.set(false);
    }
  };

  const handleReverse = (id: string) => {
    ui$.confirmConfig.set({
      isOpen: true,
      title: "AUTHORIZE_PAYMENT_REVERSAL",
      message: "WARNING: You are about to strictly reverse this customer payment. This action will restore the outstanding debt balance and invalidate the transaction record for recent audits. Continue?",
      confirmText: "REVERSE_PAYMENT",
      type: "danger",
      onConfirm: () => executeReverse(id)
    });
  };

  const executeReverse = async (id: string) => {
    ui$.isSubmitting.set(true);
    try {
      await deleteCustomerPayment(id);
      const customer = ui$.selectedCustomer.get();
      if (customer) {
        const payments = await getCustomerPayments(customer.id);
        ui$.paymentHistory.set(payments);
      }
      getDailyDebtRecovered().then(val => ui$.recoveredToday.set(val));
      toast.success("PAYMENT_REVERSED");
      ui$.confirmConfig.isOpen.set(false);
    } finally {
      ui$.isSubmitting.set(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 h-full flex flex-col overflow-hidden">
      <CreditHeader 
        ui$={ui$}
        customerCount$={customerCount$}
        isOffline$={hardware.identityState$.isOffline}
        onOpenNew={handleOpenNew}
      />

      <CreditMetrics 
        ui$={ui$}
        totalOutstanding$={totalOutstanding$}
        criticalDebtors$={criticalDebtors$}
        recoveredToday$={ui$.recoveredToday}
      />

      <CreditTable 
        customers$={customers$}
        ui$={ui$}
        isOffline$={hardware.identityState$.isOffline}
        onRecordPayment={handleRecordPayment}
        onViewHistory={handleViewHistory}
        onViewDetails={handleViewDetails}
        onEditProfile={handleEditProfile}
      />

      <CreditModals 
        ui$={ui$}
        activeShift={activeShift}
        isOffline$={hardware.identityState$.isOffline}
        onProfileSubmit={onProfileSubmit}
        onPaymentSubmit={onPaymentSubmit}
        onReverse={handleReverse}
      />

      <ObserverConfirmDialog ui$={ui$} />
    </div>
  );
}

// ⚡ [ATOMIC] Isolated Handshake Blade
const ObserverConfirmDialog = observer(({ ui$ }: any) => {
  const config = ui$.confirmConfig.get();
  return (
    <ConfirmDialog
      isOpen={config.isOpen}
      onClose={() => ui$.confirmConfig.isOpen.set(false)}
      onConfirm={config.onConfirm}
      title={config.title}
      message={config.message}
      confirmText={config.confirmText}
      type={config.type}
    />
  );
});
