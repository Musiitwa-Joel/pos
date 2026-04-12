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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Select from "./Select";
import { toast } from "sonner";

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
        status: status as "present" | "absent" | "late" | "excused",
      });
      setIsAttendanceModalOpen(false);
      setAttendanceEmployee(null);
    } catch (err) {
      // toast already handled
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
                  <button className="btn-industrial btn-primary w-full py-4 font-bold tracking-widest text-xs">
                    DISBURSE PAYROLL
                  </button>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {isAddModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-main)]/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="industrial-panel w-full max-w-md"
                >
                  <div className="industrial-panel-header">
                    <h2 className="text-sm font-display">Staff Onboarding</h2>
                    <button
                      onClick={() => setIsAddModalOpen(false)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                  <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-display text-[var(--text-muted)] uppercase">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="terminal-input w-full"
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
                      <div className="space-y-1">
                        <Select
                          label="Assigned Role"
                          options={roles.map((r) => r.name)}
                          value={newEmployee.role}
                          onChange={(val) =>
                            setNewEmployee({ ...newEmployee, role: val })
                          }
                          placeholder="SELECT_ROLE..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
                          Base Salary (UGX)
                        </label>
                        <input
                          type="number"
                          className="terminal-input w-full p-2.5 text-xs"
                          value={newEmployee.salary}
                          onChange={(e) =>
                            setNewEmployee({
                              ...newEmployee,
                              salary: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-display text-[var(--text-muted)] uppercase">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="terminal-input w-full"
                        value={newEmployee.phone}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            phone: e.target.value,
                          })
                        }
                        placeholder="+256..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-display text-[var(--text-muted)] uppercase">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="terminal-input w-full"
                        value={newEmployee.email}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            email: e.target.value,
                          })
                        }
                        placeholder="EMAIL@KIYINJI.COM..."
                      />
                    </div>
                    <div className="pt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="btn-industrial btn-outline flex-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(
                          "btn-industrial btn-primary flex-1 flex items-center justify-center gap-2",
                          isSubmitting &&
                            "opacity-80 dark:opacity-50 cursor-wait",
                        )}
                      >
                        {isSubmitting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : null}
                        {isSubmitting ? "PROCESSING..." : "Complete Onboarding"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

            {/* Edit Employee Modal */}
            {isEditModalOpen && editingEmployee && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-main)]/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="industrial-panel w-full max-w-md"
                >
                  <div className="industrial-panel-header border-brand-accent/30 bg-brand-accent/5">
                    <h2 className="text-sm font-display text-brand-accent">
                      Edit Staff Details
                    </h2>
                    <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                  <form onSubmit={handleEditEmployee} className="p-6 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-display text-[var(--text-muted)] uppercase">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="terminal-input w-full"
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
                      <div className="space-y-1">
                        <Select
                          label="Staff Role"
                          options={roles.map((r) => r.name)}
                          value={editingEmployee.role}
                          onChange={(val) =>
                            setEditingEmployee({
                              ...editingEmployee,
                              role: val,
                            })
                          }
                          placeholder="SELECT_ROLE..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">
                          Monthly Salary (UGX)
                        </label>
                        <input
                          type="number"
                          className="terminal-input w-full p-2.5 text-xs"
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
                    <div className="space-y-1">
                      <label className="text-[9px] font-display text-[var(--text-muted)] uppercase">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="terminal-input w-full"
                        value={editingEmployee.phone}
                        onChange={(e) =>
                          setEditingEmployee({
                            ...editingEmployee,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-display text-[var(--text-muted)] uppercase">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="terminal-input w-full"
                        value={editingEmployee.email}
                        onChange={(e) =>
                          setEditingEmployee({
                            ...editingEmployee,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="pt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="btn-industrial btn-outline flex-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(
                          "btn-industrial btn-primary flex-1 flex items-center justify-center gap-2",
                          isSubmitting &&
                            "opacity-80 dark:opacity-50 cursor-wait",
                        )}
                      >
                        {isSubmitting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : null}
                        {isSubmitting ? "UPDATING..." : "Update Records"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

            {/* Attendance Recording Modal */}
            {isAttendanceModalOpen && attendanceEmployee && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-main)]/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="industrial-panel w-full max-w-sm"
                >
                  <div className="industrial-panel-header border-success/30 bg-success/5">
                    <div className="flex flex-col">
                      <h2 className="text-sm font-display text-success">
                        Record Attendance
                      </h2>
                      <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase">
                        {attendanceEmployee.name}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAttendanceModalOpen(false)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                  <div className="p-6 grid grid-cols-1 gap-3">
                    <button
                      onClick={() => handleRecordAttendance("present")}
                      className="btn-industrial btn-outline border-success/30 hover:bg-success/10 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-success" />
                        <span className="font-display text-[10px] uppercase">
                          Mark Present
                        </span>
                      </div>
                      <span className="text-[8px] font-mono text-[var(--text-muted)] group-hover:text-success">
                        ON TIME
                      </span>
                    </button>
                    <button
                      onClick={() => handleRecordAttendance("late")}
                      className="btn-industrial btn-outline border-warning/30 hover:bg-warning/10 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-warning" />
                        <span className="font-display text-[10px] uppercase">
                          Mark Late
                        </span>
                      </div>
                      <span className="text-[8px] font-mono text-[var(--text-muted)] group-hover:text-warning">
                        DELAYED
                      </span>
                    </button>
                    <button
                      onClick={() => handleRecordAttendance("absent")}
                      className="btn-industrial btn-outline border-danger/30 hover:bg-danger/10 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <XCircle size={16} className="text-danger" />
                        <span className="font-display text-[10px] uppercase">
                          Mark Absent
                        </span>
                      </div>
                      <span className="text-[8px] font-mono text-[var(--text-muted)] group-hover:text-danger">
                        MISSED
                      </span>
                    </button>

                    <div className="mt-4 pt-4 border-t border-brand-steel flex justify-center">
                      <button
                        onClick={() => setIsAttendanceModalOpen(false)}
                        className="text-[9px] font-display text-[var(--text-muted)] uppercase hover:text-[var(--text-main)] transition-colors"
                      >
                        Close Window
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
