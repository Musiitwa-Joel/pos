import React, { useState } from "react";
import { useHardware } from "../HardwareContext";
import { cn, formatCurrency } from "../lib/utils";
import {
  Users,
  UserPlus,
  Clock,
  Calendar,
  Search,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  UserCheck,
  UserX,
  UserMinus,
  Edit2,
  ClipboardCheck,
  CheckSquare,
  RefreshCw,
  Loader2,
  User,
  Mail,
  Phone,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Select from "./Select";
import Modal from "./Modal";
import { toast } from "sonner";
import ConfirmDialog from "./ConfirmDialog";

export default function HRModule() {
  const {
    employees,
    attendance,
    roles,
    addEmployee,
    updateEmployee,
    recordAttendance,
    refreshEmployees,
    loading,
    isOffline,
  } = useHardware();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "directory" | "attendance" | "payroll"
  >("directory");
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceEmployee, setAttendanceEmployee] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Form states
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
    salary: 0,
  });

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.role || !newEmployee.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Initializing onboarding sequence...");

    try {
      // Step 1: Simulated progress for UX
      setTimeout(
        () => toast.loading("Creating employee record...", { id: toastId }),
        800,
      );
      setTimeout(
        () =>
          toast.loading("Generating secure system credentials...", {
            id: toastId,
          }),
        1600,
      );
      setTimeout(
        () =>
          toast.loading("Dispatching welcome & security emails...", {
            id: toastId,
          }),
        2400,
      );

      await addEmployee({
        ...newEmployee,
        status: "active",
      });

      toast.success(
        "Onboarding complete: Staff records and security credentials initialized",
        { id: toastId },
      );
      setIsAddModalOpen(false);
      setNewEmployee({ name: "", role: "", phone: "", email: "", salary: 0 });
    } catch (err: any) {
      toast.error(`Onboarding failed: ${err.message}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleUpdateStatus = async (
    id: string,
    status: "active" | "on_leave" | "terminated",
  ) => {
    const employee = employees.find(e => e.id === id);
    
    if (status === 'terminated') {
      setConfirmConfig({
        isOpen: true,
        title: "AUTHORIZE_PERSONNEL_TERMINATION",
        message: `WARNING: You are about to strictly terminate the employment record for ${employee?.name || 'this individual'}. This action will revoke all institutional access and security credentials. Are you absolutely certain?`,
        onConfirm: async () => {
          try {
            await updateEmployee(id, { status });
            setActiveEmployeeId(null);
            toast.success("Personnel termination sequence complete.");
          } catch (err) {}
        },
        confirmText: "CONFIRM_TERMINATION",
        type: "danger"
      });
      return;
    }

    try {
      await updateEmployee(id, { status });
      setActiveEmployeeId(null);
    } catch (err) {
      // toast already handled in context
    }
  };

  const handleRecordAttendance = async (status: string) => {
    if (!attendanceEmployee) return;
    try {
      await recordAttendance({
        employeeId: attendanceEmployee.id,
        checkIn: new Date().toISOString(),
        status: status as "present" | "absent" | "late" | "excused",
      });
      toast.success(`Attendance marked: ${status.toUpperCase()} for ${attendanceEmployee.name}`);
      setIsAttendanceModalOpen(false);
      setAttendanceEmployee(null);
    } catch (err: any) {
      toast.error(`Recording attendance failed: ${err.message}`);
    }
  };

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    setIsSubmitting(true);
    try {
      await updateEmployee(editingEmployee.id, {
        name: editingEmployee.name,
        role: editingEmployee.role,
        phone: editingEmployee.phone,
        email: editingEmployee.email,
        salary: editingEmployee.salary,
      });
      setIsEditModalOpen(false);
      setEditingEmployee(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === "active").length,
    onLeave: employees.filter((e) => e.status === "on_leave").length,
    monthlyPayroll: employees.reduce((acc, curr) => acc + curr.salary, 0),
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto md:overflow-hidden overflow-x-hidden gap-6 px-4 py-4 sm:py-6 custom-scrollbar pb-20 md:pb-0">
      {/* Center container to provide horizontal boundaries on narrow screens */}
      <div className="mx-auto w-full max-w-[1200px] px-4">
        {/* Header & Stats */}
        {/* Header & Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-display text-[var(--text-main)] uppercase tracking-tight">
              Human Resources
            </h1>
            <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest opacity-70">
              Personnel & Performance Management
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => refreshEmployees(false)}
              disabled={loading || isOffline}
              className={cn(
                "flex-1 sm:flex-none btn-industrial py-3 sm:py-2 flex items-center justify-center gap-2 text-[9px] sm:text-[10px] uppercase font-black px-4 whitespace-nowrap",
                isOffline &&
                  "opacity-80 dark:opacity-50 grayscale cursor-not-allowed",
              )}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              disabled={isOffline}
              className={cn(
                "flex-1 sm:flex-none btn-industrial btn-primary py-3 sm:py-2.5 flex items-center justify-center gap-2 font-black tracking-widest text-[9px] sm:text-[10px] uppercase px-4 whitespace-nowrap",
                isOffline &&
                  "opacity-80 dark:opacity-50 grayscale cursor-not-allowed",
              )}
            >
              <UserPlus size={14} />
              Onboard Staff
            </button>
          </div>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 shrink-0 w-full">
            {[
              {
                label: "Total Staff",
                value: stats.total,
                icon: Users,
                color: "text-brand-accent",
              },
              {
                label: "Active Now",
                value: stats.active,
                icon: CheckCircle2,
                color: "text-success",
              },
              {
                label: "On Leave",
                value: stats.onLeave,
                icon: AlertCircle,
                color: "text-warning",
              },
              {
                label: "Monthly Payroll",
                value: stats.monthlyPayroll.toLocaleString(),
                icon: DollarSign,
                color: "text-brand-accent",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="industrial-panel p-3 sm:p-4 flex items-center gap-4 min-w-[160px]"
              >
                <div className={`${stat.color} shrink-0`}>
                  <stat.icon size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-display text-[var(--text-muted)] uppercase truncate tracking-widest mb-0.5">
                    {stat.label}
                  </p>
                  <p className="text-lg font-mono font-bold text-[var(--text-main)] truncate">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        {/* Mobile: select picker; Desktop: tab buttons */}
        <div className="sm:hidden p-2">
          <select
            aria-label="HR Tabs"
            className="w-full terminal-input text-[9px] uppercase font-display"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
          >
            <option value="directory">Directory</option>
            <option value="attendance">Attendance</option>
            <option value="payroll">Payroll</option>
          </select>
        </div>

        <div className="hidden sm:flex border-b border-brand-steel overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: "directory", label: "Directory", icon: Users },
            { id: "attendance", label: "Attendance", icon: Clock },
            { id: "payroll", label: "Payroll", icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 font-display text-[9px] uppercase tracking-widest transition-all relative flex-none ${
                activeTab === tab.id
                  ? "text-brand-accent font-black"
                  : "text-slate-900 dark:text-slate-500 hover:text-[var(--text-main)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon size={12} />
                {tab.label}
              </div>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabHR"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent shadow-[0_0_10px_rgba(var(--brand-accent-rgb),0.5)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="md:flex-1 md:overflow-hidden">
          {activeTab === "directory" && (
            <div className="flex flex-col md:h-full gap-4">
              <div className="industrial-panel md:flex-1 flex flex-col md:overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-brand-steel/10 bg-black/5 items-stretch sm:items-center shrink-0">
                  <span className="text-[10px] font-display uppercase tracking-widest text-slate-900 dark:text-slate-500 hidden sm:inline">
                    STAFF_DIRECTORY
                  </span>
                  <div className="relative flex-1 sm:max-w-xs">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-accent/50"
                      size={14}
                    />
                    <input
                      type="text"
                      placeholder="FIND_PERSONNEL..."
                      className="terminal-input w-full pl-10 h-10 text-[9px] uppercase font-mono tracking-widest bg-transparent border-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="md:flex-1 md:overflow-y-auto custom-scrollbar">
                  {/* Desktop Data Table (wrapped for horizontal scroll) */}
                  <div className="overflow-x-auto">
                    <table className="data-table hidden lg:table">
                      <thead>
                        <tr>
                          <th>Staff Member</th>
                          <th>Role</th>
                          <th>Contact</th>
                          <th>Joined</th>
                          <th>Salary</th>
                          <th>Status</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmployees.map((emp) => (
                          <tr
                            key={emp.id}
                            className="group hover:bg-brand-steel/5 transition-colors"
                          >
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-brand-steel/20 flex items-center justify-center font-display text-xs border border-brand-steel/20">
                                  {emp.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </div>
                                <div className="flex flex-col text-left">
                                  <span className="font-bold text-xs uppercase tracking-tight">
                                    {emp.name}
                                  </span>
                                  <span className="text-[8px] text-slate-900 dark:text-slate-500 font-mono uppercase">
                                    {emp.id}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="text-[10px] font-display text-brand-accent uppercase tracking-widest">
                                {emp.role}
                              </span>
                            </td>
                            <td>
                              <div className="flex flex-col text-[9px] font-mono">
                                <span className="font-bold">{emp.phone}</span>
                                <span className="text-slate-900 dark:text-slate-500 lowercase">
                                  {emp.email}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="text-[10px] font-mono text-slate-800 dark:text-slate-400">
                                {new Date(emp.joinedDate).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="font-mono text-[10px] font-bold text-slate-800 dark:text-slate-400">
                              {formatCurrency(emp.salary)}
                            </td>
                            <td>
                              <div
                                className={`px-2 py-1 text-[10px] font-display uppercase font-bold border inline-block ${
                                  emp.status === "active"
                                    ? "bg-success/5 text-success border-success/20"
                                    : emp.status === "on_leave"
                                      ? "bg-warning/5 text-warning border-warning/20"
                                      : "bg-danger/5 text-danger border-danger/20"
                                }`}
                              >
                                {emp.status.replace("_", " ")}
                              </div>
                            </td>
                            <td className="text-right relative">
                              <button
                                onClick={() =>
                                  setActiveEmployeeId(
                                    activeEmployeeId === emp.id ? null : emp.id,
                                  )
                                }
                                className={`p-1.5 hover:bg-brand-steel/10 transition-all border border-brand-steel/10 ${activeEmployeeId === emp.id ? "bg-brand-steel/20 text-brand-accent" : "text-slate-900 dark:text-slate-500"}`}
                              >
                                <MoreVertical size={14} />
                              </button>

                              <AnimatePresence>
                                {activeEmployeeId === emp.id && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-[100]"
                                      onClick={() => setActiveEmployeeId(null)}
                                    />
                                    <motion.div
                                      initial={{
                                        opacity: 0,
                                        scale: 0.95,
                                        y: -10,
                                      }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                      className="absolute right-0 top-full mt-1 w-48 bg-brand-dark border border-brand-steel shadow-2xl z-[101] overflow-hidden text-left"
                                    >
                                      <div className="flex flex-col py-1">
                                        <button
                                          onClick={() => {
                                            setEditingEmployee(emp);
                                            setIsEditModalOpen(true);
                                            setActiveEmployeeId(null);
                                          }}
                                          className="flex items-center gap-3 px-4 py-2 hover:bg-brand-steel/10 text-[10px] font-display uppercase transition-colors"
                                        >
                                          <Edit2 size={12} /> Edit Records
                                        </button>
                                        <button
                                          onClick={() => {
                                            setAttendanceEmployee(emp);
                                            setIsAttendanceModalOpen(true);
                                            setActiveEmployeeId(null);
                                          }}
                                          className="flex items-center gap-3 px-4 py-2 hover:bg-brand-steel/10 text-[10px] font-display uppercase transition-colors text-success"
                                        >
                                          <ClipboardCheck size={12} /> Log
                                          Attendance
                                        </button>
                                      </div>
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Personnel Card Stack (High-Density) */}
                  <div className="md:hidden p-2 space-y-2 pb-32">
                    {filteredEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        className="industrial-panel p-2 sm:p-3 flex flex-col gap-2 sm:gap-3"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-brand-dark/20 flex items-center justify-center font-display text-[10px] border border-brand-steel/10 font-bold shrink-0">
                              {emp.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <h3 className="text-[11px] font-display font-bold text-[var(--text-main)] uppercase tracking-tight truncate">
                                {emp.name}
                              </h3>
                              <span className="text-[8px] font-mono text-[var(--text-muted)] uppercase truncate leading-none">
                                {emp.role}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 text-[8px] font-display uppercase font-bold border shrink-0 ${
                              emp.status === "active"
                                ? "bg-success/5 text-success border-success/20"
                                : emp.status === "on_leave"
                                  ? "bg-warning/5 text-warning border-warning/20"
                                  : "bg-danger/5 text-danger border-danger/20"
                            }`}
                          >
                            {emp.status.replace("_", " ")}
                          </span>
                        </div>

                        <div className="border-t border-brand-steel/5 pt-2 flex flex-col gap-0.5">
                          <p className="text-[8px] font-mono text-slate-900 dark:text-slate-500 uppercase tracking-tighter truncate">
                            ID: {emp.id.substring(0, 12)}...
                          </p>
                          <p className="text-[8px] font-mono text-slate-900 dark:text-slate-500 uppercase tracking-tighter">
                            TEL: {emp.phone}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setAttendanceEmployee(emp);
                              setIsAttendanceModalOpen(true);
                            }}
                            className="flex-1 btn-industrial py-2 text-[9px] font-black uppercase bg-success/5 text-success border border-success/20"
                          >
                            Attendance
                          </button>
                          <button
                            onClick={() => {
                              setEditingEmployee(emp);
                              setIsEditModalOpen(true);
                            }}
                            className="flex-1 btn-industrial py-2 text-[9px] font-black uppercase bg-brand-accent/5 text-brand-accent border border-brand-accent/20"
                          >
                            Edit Records
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="industrial-panel md:flex-1 md:overflow-auto">
              <div className="md:flex-1 md:overflow-y-auto custom-scrollbar p-0">
                {/* Desktop Attendance Table */}
                <table className="data-table hidden lg:table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Staff Member</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th className="text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-20 text-[var(--text-muted)] font-mono uppercase text-xs tracking-widest opacity-40"
                        >
                          NO_RECORDS_FOR_PERIOD
                        </td>
                      </tr>
                    ) : (
                      attendance
                        .slice()
                        .reverse()
                        .map((record) => {
                          const emp = employees.find(
                            (e) => e.id === record.employeeId,
                          );
                          return (
                            <tr
                              key={record.id}
                              className="hover:bg-brand-steel/5 transition-colors"
                            >
                              <td>
                                <span className="text-[10px] font-mono text-slate-800 dark:text-slate-400">
                                  {new Date(record.date).toLocaleDateString()}
                                </span>
                              </td>
                              <td>
                                <div className="flex flex-col text-left">
                                  <span className="text-xs font-bold uppercase tracking-tight">
                                    {emp?.name || "UNKNOWN_PERSONNEL"}
                                  </span>
                                  <span className="text-[8px] text-slate-900 dark:text-slate-500 font-mono">
                                    {record.employeeId}
                                  </span>
                                </div>
                              </td>
                              <td className="font-mono text-[10px]">
                                {new Date(record.checkIn).toLocaleTimeString()}
                              </td>
                              <td className="font-mono text-[10px] font-bold">
                                {record.checkOut
                                  ? new Date(
                                      record.checkOut,
                                    ).toLocaleTimeString()
                                  : "--:--"}
                              </td>
                              <td className="text-right">
                                <span
                                  className={`px-2 py-0.5 text-[9px] font-display uppercase font-black ${
                                    record.status === "present"
                                      ? "bg-success/10 text-success border border-success/30"
                                      : record.status === "late"
                                        ? "bg-warning/10 text-warning border border-warning/30"
                                        : "bg-danger/10 text-danger border border-danger/30"
                                  }`}
                                >
                                  {record.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>

                {/* Mobile Attendance Nodes */}
                <div className="md:hidden p-2 space-y-2 pb-32">
                  {attendance.length === 0 ? (
                    <div className="p-12 text-center text-[10px] font-mono text-slate-900 dark:text-slate-500 uppercase tracking-widest">
                      No_System_Logs
                    </div>
                  ) : (
                    attendance
                      .slice()
                      .reverse()
                      .map((record) => {
                        const emp = employees.find(
                          (e) => e.id === record.employeeId,
                        );
                        return (
                          <div
                            key={record.id}
                            className="industrial-panel p-3 bg-black/10 flex justify-between items-center border-brand-steel/10"
                          >
                            <div className="flex flex-col gap-0.5">
                              <h4 className="text-[10px] font-display font-black text-slate-300 uppercase tracking-tight">
                                {emp?.name || "SYS_PERSONNEL"}
                              </h4>
                              <div className="flex gap-2 text-[8px] font-mono text-slate-900 dark:text-slate-500 uppercase tracking-tighter">
                                <span>
                                  {new Date(record.date).toLocaleDateString()}
                                </span>
                                <span>//</span>
                                <span>
                                  {new Date(record.checkIn).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </span>
                              </div>
                            </div>
                            <span
                              className={cn(
                                "px-2 py-0.5 text-[7px] font-display font-black uppercase rounded-[2px]",
                                record.status === "present"
                                  ? "text-success bg-success/10"
                                  : "text-warning bg-warning/10",
                              )}
                            >
                              {record.status}
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "payroll" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="industrial-panel p-6 overflow-y-auto">
                <h3 className="text-[10px] font-display text-[var(--text-muted)] uppercase mb-6">
                  Salary Distribution
                </h3>
                <div className="space-y-4">
                  {employees.map((emp) => (
                    <div key={emp.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                          {emp.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-brand-accent">
                          {formatCurrency(emp.salary)}
                        </span>
                      </div>
                      <div className="h-1 bg-brand-steel/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(emp.salary / stats.monthlyPayroll) * 100}%`,
                          }}
                          className="h-full bg-brand-accent shadow-[0_0_8px_rgba(var(--brand-accent-rgb),0.3)]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="industrial-panel p-6">
                <h3 className="text-[10px] font-display text-[var(--text-muted)] uppercase mb-6">
                  Payroll Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-brand-steel/10 pb-2">
                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                      Monthly Payroll
                    </span>
                    <span className="text-xl font-mono font-bold">
                      {formatCurrency(stats.monthlyPayroll)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-brand-steel/10 pb-2">
                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                      Tax Withholding
                    </span>
                    <span className="text-xl font-mono font-bold text-brand-accent">
                      0.00 <span className="text-[9px] opacity-40">UGX</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-success/5 p-4 border border-success/20">
                    <span className="text-[10px] font-mono text-success uppercase font-bold">
                      Net Total
                    </span>
                    <span className="text-2xl font-mono font-bold text-success">
                      {formatCurrency(stats.monthlyPayroll)}
                    </span>
                  </div>
                  <button 
                    onClick={() => setConfirmConfig({
                      isOpen: true,
                      title: "AUTHORIZE_PAYROLL_DISBURSEMENT",
                      message: `You are about to trigger the monthly payroll disbursement of ${formatCurrency(stats.monthlyPayroll)}. This will generate financial ledger entries for ${employees.length} personnel. Continue?`,
                      onConfirm: () => {
                        toast.success("Payroll disbursement initialized.");
                      },
                      confirmText: "EXECUTE_DISBURSEMENT",
                      type: "info"
                    })}
                    className="btn-industrial btn-primary w-full py-4 font-bold tracking-widest text-xs"
                  >
                    DISBURSE PAYROLL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Staff Onboarding Modal */}
          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title={
              <div className="flex items-center gap-2">
                <UserPlus size={16} className="text-brand-accent shrink-0" />
                <span className="text-sm font-display uppercase tracking-wider text-slate-100 font-bold">Staff Onboarding</span>
              </div>
            }
            maxWidth="max-w-xl"
          >
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-display text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                  <User size={14} className="text-brand-accent shrink-0" />
                  Full Legal Name <span className="text-brand-accent">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="terminal-input w-full p-2.5 text-xs bg-black/40 border border-brand-steel/40 text-slate-100 placeholder:text-slate-500 focus:border-brand-accent rounded-sm"
                  value={newEmployee.name}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      name: e.target.value,
                    })
                  }
                  placeholder="ENTER FULL NAME..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Select
                    label="Assigned Role *"
                    options={roles && roles.length > 0 ? roles.map((r) => r.name) : ["ADMIN", "MANAGER", "CASHIER", "STAFF"]}
                    value={newEmployee.role}
                    onChange={(val) =>
                      setNewEmployee({ ...newEmployee, role: val })
                    }
                    placeholder="SELECT_ROLE..."
                    className="text-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-display text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                    <DollarSign size={14} className="text-brand-accent shrink-0" />
                    Base Monthly Salary (UGX)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="terminal-input w-full p-2.5 text-xs bg-black/40 border border-brand-steel/40 text-slate-100 placeholder:text-slate-500 focus:border-brand-accent rounded-sm"
                    value={newEmployee.salary || ""}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        salary: Number(e.target.value),
                      })
                    }
                    placeholder="500,000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-display text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                  <Phone size={14} className="text-brand-accent shrink-0" />
                  Phone Number <span className="text-brand-accent">*</span>
                </label>
                <input
                  type="tel"
                  required
                  className="terminal-input w-full p-2.5 text-xs bg-black/40 border border-brand-steel/40 text-slate-100 placeholder:text-slate-500 focus:border-brand-accent rounded-sm"
                  value={newEmployee.phone}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      phone: e.target.value,
                    })
                  }
                  placeholder="+256 700 000000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-display text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                  <Mail size={14} className="text-brand-accent shrink-0" />
                  Email Address (System Login)
                </label>
                <input
                  type="email"
                  className="terminal-input w-full p-2.5 text-xs bg-black/40 border border-brand-steel/40 text-slate-100 placeholder:text-slate-500 focus:border-brand-accent rounded-sm"
                  value={newEmployee.email}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      email: e.target.value,
                    })
                  }
                  placeholder="EMAIL@KIYINJI.COM..."
                />
                <p className="text-[10px] font-mono text-slate-400">
                  System credentials and onboarding instructions will be provisioned for this account.
                </p>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-industrial btn-outline flex-1 py-2.5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "btn-industrial btn-primary flex-1 py-2.5 text-xs flex items-center justify-center gap-2 font-bold tracking-wider",
                    isSubmitting && "opacity-80 dark:opacity-50 cursor-wait",
                  )}
                >
                  {isSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <UserPlus size={14} />
                  )}
                  {isSubmitting ? "PROCESSING..." : "COMPLETE ONBOARDING"}
                </button>
              </div>
            </form>
          </Modal>

          {/* Edit Employee Modal */}
          {editingEmployee && (
            <Modal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              title={
                <div className="flex items-center gap-2">
                  <Edit2 size={16} className="text-brand-accent shrink-0" />
                  <span className="text-sm font-display uppercase tracking-wider text-slate-100 font-bold">Edit Staff Records</span>
                </div>
              }
              maxWidth="max-w-xl"
            >
              <form onSubmit={handleEditEmployee} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-display text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                    <User size={14} className="text-brand-accent shrink-0" />
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    className="terminal-input w-full p-2.5 text-xs bg-black/40 border border-brand-steel/40 text-slate-100 placeholder:text-slate-500 focus:border-brand-accent rounded-sm"
                    value={editingEmployee.name}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Select
                      label="Staff Role"
                      options={roles && roles.length > 0 ? roles.map((r) => r.name) : ["ADMIN", "MANAGER", "CASHIER", "STAFF"]}
                      value={editingEmployee.role}
                      onChange={(val) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          role: val,
                        })
                      }
                      placeholder="SELECT_ROLE..."
                      className="text-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-display text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                      <DollarSign size={14} className="text-brand-accent shrink-0" />
                      Monthly Salary (UGX)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="terminal-input w-full p-2.5 text-xs bg-black/40 border border-brand-steel/40 text-slate-100 placeholder:text-slate-500 focus:border-brand-accent rounded-sm"
                      value={editingEmployee.salary}
                      onChange={(e) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          salary: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-display text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                    <Phone size={14} className="text-brand-accent shrink-0" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    className="terminal-input w-full p-2.5 text-xs bg-black/40 border border-brand-steel/40 text-slate-100 placeholder:text-slate-500 focus:border-brand-accent rounded-sm"
                    value={editingEmployee.phone}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-display text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                    <Mail size={14} className="text-brand-accent shrink-0" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="terminal-input w-full p-2.5 text-xs bg-black/40 border border-brand-steel/40 text-slate-100 placeholder:text-slate-500 focus:border-brand-accent rounded-sm"
                    value={editingEmployee.email || ""}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="btn-industrial btn-outline flex-1 py-2.5 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "btn-industrial btn-primary flex-1 py-2.5 text-xs flex items-center justify-center gap-2 font-bold tracking-wider",
                      isSubmitting && "opacity-80 dark:opacity-50 cursor-wait",
                    )}
                  >
                    {isSubmitting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    {isSubmitting ? "UPDATING..." : "UPDATE RECORDS"}
                  </button>
                </div>
              </form>
            </Modal>
          )}

          {/* Attendance Recording Modal */}
          {attendanceEmployee && (
            <Modal
              isOpen={isAttendanceModalOpen}
              onClose={() => setIsAttendanceModalOpen(false)}
              title={
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-success shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-display uppercase tracking-wider text-slate-100 font-bold">Record Attendance</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{attendanceEmployee.name}</span>
                  </div>
                </div>
              }
              maxWidth="max-w-md"
            >
              <div className="grid grid-cols-1 gap-3 py-2">
                <button
                  onClick={() => handleRecordAttendance("present")}
                  className="btn-industrial btn-outline border-success/40 bg-success/5 hover:bg-success/15 p-3 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-success" />
                    <span className="font-display text-xs font-bold uppercase text-slate-100 group-hover:text-success">
                      Mark Present
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-success font-bold uppercase bg-success/10 px-2 py-0.5 border border-success/30 rounded-xs">
                    ON TIME
                  </span>
                </button>

                <button
                  onClick={() => handleRecordAttendance("late")}
                  className="btn-industrial btn-outline border-warning/40 bg-warning/5 hover:bg-warning/15 p-3 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-warning" />
                    <span className="font-display text-xs font-bold uppercase text-slate-100 group-hover:text-warning">
                      Mark Late
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-warning font-bold uppercase bg-warning/10 px-2 py-0.5 border border-warning/30 rounded-xs">
                    DELAYED
                  </span>
                </button>

                <button
                  onClick={() => handleRecordAttendance("absent")}
                  className="btn-industrial btn-outline border-danger/40 bg-danger/5 hover:bg-danger/15 p-3 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <XCircle size={18} className="text-danger" />
                    <span className="font-display text-xs font-bold uppercase text-slate-100 group-hover:text-danger">
                      Mark Absent
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-danger font-bold uppercase bg-danger/10 px-2 py-0.5 border border-danger/30 rounded-xs">
                    MISSED
                  </span>
                </button>

                <div className="mt-4 pt-3 border-t border-brand-steel/30 flex justify-center">
                  <button
                    onClick={() => setIsAttendanceModalOpen(false)}
                    className="text-xs font-display text-slate-400 uppercase hover:text-slate-200 transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </div>
      
      {/* 🛡️ Institutional Confirmation Handshake Area */}
      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        type={confirmConfig.type}
      />
    </div>
  );
}
