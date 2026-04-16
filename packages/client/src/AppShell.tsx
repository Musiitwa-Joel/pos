import React, { useState, useEffect, useRef, useMemo } from "react";
import { flushSync } from "react-dom";
import {
  LayoutGrid,
  Globe,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Command as CommandIcon,
  CreditCard,
  Truck,
  Receipt,
  DollarSign,
  Sun,
  Moon,
  ChevronRight,
  ChevronLeft,
  UserCog,
  RotateCcw,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import logoIcon from "../assets/SVG/tredpos1.svg";
import { useHardware } from "./HardwareContext";
import { cn } from "./lib/utils";
import { toast } from "sonner";
import TopLoader from "./components/TopLoader";
import { API_BASE_URL } from "./HardwareContext";

// 🏗️ Deferred Module Loading (Code Splitting)
const Dashboard = React.lazy(() => import("./components/Dashboard"));
const POS = React.lazy(() => import("./components/POS"));
const Inventory = React.lazy(() => import("./components/Inventory"));
const CreditManagement = React.lazy(() => import("./components/CreditManagement"));
const SalesLogs = React.lazy(() => import("./components/SalesLogs"));
const Suppliers = React.lazy(() => import("./components/Suppliers"));
const Expenses = React.lazy(() => import("./components/Expenses"));
const HRModule = React.lazy(() => import("./components/HRModule"));
const SettingsView = React.lazy(() => import("./components/SettingsView"));
const Reports = React.lazy(() => import("./components/Reports"));
const ReturnsManagement = React.lazy(() => import("./components/ReturnsManagement"));

// 👑 HQ Modules (Deferred)
const BillingHub = React.lazy(() => import("./components/hq/BillingHub"));
const InstitutionRegistry = React.lazy(() => import("./components/hq/InstitutionRegistry"));
const WebsiteManager = React.lazy(() => import("./components/hq/WebsiteManager"));
const GlobalReports = React.lazy(() => import("./components/hq/GlobalReports"));
const SystemAudit = React.lazy(() => import("./components/hq/SystemAudit"));
const InfrastructureHub = React.lazy(() => import("./components/hq/InfrastructureHub"));
import SuspensionOverlay from "./components/auth/SuspensionOverlay";
import LogoLoader from "./components/LogoLoader";

type View =
  | "dashboard"
  | "pos"
  | "inventory"
  | "credit"
  | "sales"
  | "suppliers"
  | "expenses"
  | "settings"
  | "hr"
  | "reports"
  | "returns"
  | "billing"
  | "institutions"
  | "website"
  | "global_reports"
  | "audit"
  | "institutional_reports";

function SidebarButton({
  item,
  currentView,
  setCurrentView,
  isSidebarExpanded,
}: {
  item: any;
  currentView: string;
  setCurrentView: (v: View) => void;
  isSidebarExpanded: boolean;
}) {
  const isActive = currentView === item.id;
  return (
    <button
      onClick={() => setCurrentView(item.id)}
      title={!isSidebarExpanded ? item.label : undefined}
      className={cn(
        "flex items-center transition-all relative group overflow-hidden border-l-2",
        isSidebarExpanded
          ? "w-full px-4 py-3 gap-4"
          : "w-12 h-12 justify-center mx-auto",
        isActive
          ? "bg-brand-accent/10 border-brand-accent text-brand-accent shadow-[inset_4px_0_0_0_#F97316]"
          : "border-transparent text-slate-500 hover:text-slate-200 hover:bg-brand-steel/20",
        item.id === "expenses" && "hidden lg:flex",
      )}
    >
      <item.icon
        size={18}
        className={cn(
          "shrink-0 transition-colors",
          isActive && "text-brand-accent",
        )}
      />
      {isSidebarExpanded && (
        <div className="flex flex-col items-start overflow-hidden leading-tight">
          <span className="text-[10px] font-display whitespace-nowrap uppercase tracking-normal">
            {item.label}
          </span>
          <span className="text-[7px] font-mono opacity-50">
            CMD + {item.shortcut}
          </span>
        </div>
      )}
      {!isSidebarExpanded && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-brand-steel text-[9px] font-display text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-brand-accent/20">
          {item.label} [CMD + {item.shortcut}]
        </div>
      )}
    </button>
  );
}

export default function AppShell() {
  const {
    currentUser,
    logout,
    loading,
    loadingStatus,
    settings,
    refreshInventory,
    refreshEmployees,
    refreshSuppliers,
    updateProfilePicture,
  } = useHardware();

  // 🔒 Institutional Suspension Enforcement
  // If the tenant is suspended, block all access EXCEPT for Vanguard HQ staff (CEOs)
  if (
    currentUser?.tenantStatus === "suspended" &&
    currentUser?.role !== "hq-ceo"
  ) {
    return <SuspensionOverlay />;
  }
  const isHqCeo = currentUser?.role === "hq-ceo";
  const [currentView, setCurrentView] = useState<View>(
    isHqCeo ? "billing" : "dashboard",
  );
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light";
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [commandQuery, setCommandQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateProfilePicture(file);
      e.target.value = '';
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // 👑 Vanguard Protocol: Ensure CEO defaults to administrative context
    if (isHqCeo && currentView === "dashboard") {
      setCurrentView("billing");
    }

    return () => clearInterval(timer);
  }, [isHqCeo, currentView]);

  const handleSetView = (view: View) => {
    if (view === currentView) return;
    setCurrentView(view);

    // Background sync on view switch (Connected to the server)
    if (view === "inventory") refreshInventory();
    if (view === "hr") refreshEmployees();
    if (view === "suppliers") refreshSuppliers();
  };

  const handleLogout = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 800)), {
      loading: "Terminating session...",
      success: () => {
        logout();
        return "Session terminated.";
      },
      error: "Logout failed",
    });
  };

  useEffect(() => {
    localStorage.setItem("theme", isLightMode ? "light" : "dark");
    document.documentElement.classList.toggle("light", isLightMode);
  }, [isLightMode]);

  // 🏷️ Dynamic Institutional Navigation
  const navItems = useMemo(() => {
    return isHqCeo
      ? [
        {
          id: "billing",
          label: "Collections HQ",
          icon: LayoutGrid,
          shortcut: "C",
        },
        {
          id: "institutions",
          label: "B2B Registry",
          icon: Globe,
          shortcut: "I",
        },
        { id: "website", label: "Manage Website", icon: Zap, shortcut: "W" },
        {
          id: "global_reports",
          label: "Global Reports",
          icon: BarChart3,
          shortcut: "R",
        },
        { id: "audit", label: "Security Logs", icon: Receipt, shortcut: "A" },
        {
          id: "settings",
          label: "Global Config",
          icon: SettingsIcon,
          shortcut: "G",
        },
      ]
      : [
        {
          id: "dashboard",
          label: "Intelligence",
          icon: LayoutDashboard,
          shortcut: "R",
        },
        { id: "pos", label: "Terminal", icon: ShoppingCart, shortcut: "P" },
        { id: "inventory", label: "Inventory", icon: Package, shortcut: "I" },
        { id: "credit", label: "Credit", icon: Users, shortcut: "U" },
        { id: "hr", label: "Human Resources", icon: UserCog, shortcut: "H" },
        { id: "sales", label: "Audit", icon: Receipt, shortcut: "L" },
        { id: "reports", label: "Analytics", icon: BarChart3, shortcut: "B" },
        { id: "suppliers", label: "Suppliers", icon: Truck, shortcut: "S" },
        { id: "expenses", label: "Expenses", icon: DollarSign, shortcut: "E" },
        { id: "returns", label: "Returns Hub", icon: RotateCcw, shortcut: "T" },
      ];
  }, [isHqCeo]);

  // 🏷️ [HSM v2.4] Forensic RBAC Filtering
  const authorizedNavItems = useMemo(() => {
    if (isHqCeo || currentUser?.role?.toUpperCase() === 'ADMIN') return navItems;
    const authorized = currentUser?.authorizedModules || [];
    return navItems.filter(item => authorized.includes(item.id));
  }, [navItems, currentUser, isHqCeo]);

  // 🛡️ [Vanguard Protocol] Security Redirect Logic
  // Automatically lands the user in their primary authorized module if currentView is unauthorized
  useEffect(() => {
    if (!currentUser || isHqCeo || currentUser.role?.toUpperCase() === 'ADMIN') return;

    const authorizedIds = currentUser.authorizedModules || [];
    const isActuallyAuthorized = authorizedIds.includes(currentView);
    
    if (!isActuallyAuthorized && authorizedIds.length > 0) {
      // Find the first module in the logical navItems order that the user is actually authorized for
      const firstAvailable = navItems.find(item => authorizedIds.includes(item.id as any));
      
      if (firstAvailable) {
        // console.log(`[TredPOS Security] Re-aligning landing view to hierarchy: ${firstAvailable.id}`);
        setCurrentView(firstAvailable.id as View);
      }
    }
  }, [currentView, currentUser, isHqCeo, navItems]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Universal Modifier Engine: CMD (Mac) or CTRL (PC)
      const isMod = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;

      // CMD + SHIFT + P: Universal Command Palette
      if (isMod && isShift && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // CMD + 1-9: Instant Operational Navigation
      if (isMod && !isShift && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        const target = navItems[index];
        if (target) handleSetView(target.id as View);
        return;
      }

      // Legacy Context Focus (CMD + K)
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [currentView, navItems]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)] transition-colors duration-500 relative">
      <TopLoader isLoading={loading} />

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Navigation Sidebar - Industrial Style */}
      <aside
        className={cn(
          "bg-[var(--bg-panel)] border-r border-[var(--border-main)] flex flex-col items-center py-6 z-[200] transition-all duration-300 ease-in-out",
          "fixed lg:relative inset-y-0 left-0 lg:translate-x-0 shadow-2xl lg:shadow-lg",
          isSidebarExpanded ? "w-64 px-4" : "w-16",
          !isMobileMenuOpen && "translate-x-[-100%] lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-center w-full mb-8 px-2 transition-all">
          <div
            className={cn(
              "flex items-center justify-center transition-all shrink-0",
              isSidebarExpanded ? "w-12 h-12" : "w-10 h-10",
            )}
          >
            <img
              src={logoIcon}
              alt="TredPOS"
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]"
            />
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-0.5 w-full overflow-y-auto scrollbar-hide px-0 pt-2">
          {authorizedNavItems.map((item, idx) => (
            <React.Fragment key={item.id}>
              {/* Optional: Add separators for terminal users at specific points */}
              {!isHqCeo &&
                (idx === 3 ||
                  idx === 6 ||
                  (idx === 9 && currentUser?.role === "ADMIN")) && (
                  <div className="px-4 my-3">
                    <hr className="border-brand-steel border-t-2 opacity-50" />
                  </div>
                )}
              <SidebarButton
                item={item}
                currentView={currentView}
                setCurrentView={handleSetView}
                isSidebarExpanded={isSidebarExpanded}
              />
            </React.Fragment>
          ))}
        </nav>

        <div className="flex flex-col gap-1 mt-auto w-full border-t border-brand-steel pt-4">
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className={cn(
              "flex items-center transition-all relative group overflow-hidden border-l-2 border-transparent",
              isSidebarExpanded
                ? "w-full px-4 py-3 gap-4"
                : "w-12 h-12 justify-center mx-auto",
              "text-slate-500 hover:text-brand-accent hover:bg-brand-steel/20",
            )}
          >
            {isSidebarExpanded ? (
              <ChevronLeft size={18} className="shrink-0" />
            ) : (
              <ChevronRight size={18} className="shrink-0" />
            )}
            {isSidebarExpanded && (
              <span className="text-[10px] font-display whitespace-nowrap uppercase tracking-normal">
                Collapse Navigation
              </span>
            )}
          </button>

          <button
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = rect.left + rect.width / 2;
              const y = rect.top + rect.height / 2;

              const isAppearanceTransition =
                // @ts-ignore
                document.startViewTransition &&
                !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

              if (!isAppearanceTransition) {
                setIsLightMode(!isLightMode);
                // Corrected logical sync for non-transition environments
                document.documentElement.classList.toggle(
                  "light",
                  !isLightMode,
                );
                return;
              }

              const endRadius = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y),
              );

              // @ts-ignore
              const transition = document.startViewTransition(() => {
                flushSync(() => {
                  const nextValue = !isLightMode;
                  setIsLightMode(nextValue);
                  // Critical: Update class synchronously for the snapshot
                  document.documentElement.classList.toggle("light", nextValue);
                });
              });

              transition.ready.then(() => {
                document.documentElement.animate(
                  {
                    clipPath: [
                      `circle(0px at ${x}px ${y}px)`,
                      `circle(${endRadius}px at ${x}px ${y}px)`,
                    ],
                  },
                  {
                    duration: 1000,
                    easing: "ease-in-out",
                    pseudoElement: "::view-transition-new(root)",
                  },
                );
              });
            }}
            className={cn(
              "flex items-center transition-all relative group overflow-hidden border-l-2 border-transparent",
              isSidebarExpanded
                ? "w-full px-4 py-3 gap-4"
                : "w-12 h-12 justify-center mx-auto",
              "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-brand-steel/10",
            )}
          >
            {isLightMode ? (
              <Moon size={18} className="shrink-0" />
            ) : (
              <Sun size={18} className="shrink-0" />
            )}
            {isSidebarExpanded && (
              <span className="text-[10px] font-display whitespace-nowrap uppercase tracking-normal">
                {isLightMode ? "Dark Mode" : "Light Mode"}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative overflow-visible bg-[var(--bg-main)]">
        {/* System Header */}
        <header className="h-12 border-b border-[var(--border-main)] flex items-center justify-between px-6 md:px-10 bg-[var(--bg-panel)]/80 backdrop-blur-md relative z-[200] shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden mr-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-brand-accent hover:bg-brand-accent/10 transition-all shrink-0"
            >
              <LayoutGrid size={18} />
            </button>
            <span className="text-[9px] sm:text-[10px] font-display text-brand-accent font-black tracking-widest uppercase truncate max-w-[70px] sm:max-w-none shrink-0">
              Status: Active
            </span>
            <div className="h-3 w-px bg-[var(--border-main)] hidden sm:block shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-display text-[var(--text-muted)] uppercase tracking-widest leading-none pt-0.5 truncate min-w-0">
              <span className="hidden xs:inline">Module // </span>
              <span className="text-[var(--text-main)] truncate">
                {currentView.toUpperCase().replace("_", " ")}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden md:flex items-center gap-2 text-[9px] font-mono text-[var(--text-muted)]">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              TELEMETRY_LINK_ESTABLISHED
            </div>
            <div className="hidden sm:block text-[9px] font-mono text-[var(--text-muted)] border-x border-[var(--border-main)] px-4 opacity-60 font-black whitespace-nowrap">
              {currentTime.toLocaleDateString()} //{" "}
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="relative" ref={profileDropdownRef}>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpdate}
              />
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={cn(
                  "w-8 h-8 flex items-center justify-center text-[11px] font-bold rounded transition-all overflow-hidden",
                  isProfileOpen
                    ? "bg-brand-accent text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                    : "bg-brand-accent/10 border border-brand-accent/20 text-brand-accent hover:bg-brand-accent/20",
                )}
              >
                {currentUser?.profilePicture ? (
                  <img
                    src={`${API_BASE_URL}${currentUser.profilePicture}`}
                    alt="Identity"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser?.name?.charAt(0) || "C"
                )}
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="industrial-dropdown p-1 z-[999] shadow-2xl"
                  >
                    {/* User Header */}
                    <div className="px-4 py-3 border-b border-[var(--border-main)] bg-brand-accent/5 mb-1">
                      <div className="text-[10px] font-display text-[var(--text-main)] uppercase tracking-widest truncate">
                        {currentUser?.name || "Authorized User"}
                      </div>
                      <div className="text-[7px] font-mono text-brand-accent uppercase mt-0.5 opacity-70">
                        Privilege_Level // {currentUser?.role || "Guest"}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[6px] font-mono text-brand-accent uppercase mt-1 hover:underline cursor-pointer"
                      >
                        [UPDATE_IDENTITY_IMAGE]
                      </button>
                    </div>

                    <div className="flex flex-col">
                      <button
                        onClick={() => {
                          setIsCommandPaletteOpen(true);
                          setIsProfileOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-[9px] font-display text-[var(--text-muted)] hover:text-brand-accent hover:bg-brand-accent/10 transition-all uppercase tracking-widest group"
                      >
                        <CommandIcon
                          size={14}
                          className="group-hover:text-brand-accent transition-colors"
                        />
                        Strategic_Commands
                      </button>

                      {(isHqCeo || currentUser?.role?.toUpperCase() === 'ADMIN') && (
                        <button
                          onClick={() => {
                            handleSetView("settings");
                            setIsProfileOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-[9px] font-display text-[var(--text-muted)] hover:text-brand-accent hover:bg-brand-accent/10 transition-all uppercase tracking-widest group"
                        >
                          <SettingsIcon
                            size={14}
                            className="group-hover:text-brand-accent transition-colors"
                          />
                          Global_Settings
                        </button>
                      )}

                      <div className="h-px bg-[var(--border-main)] my-1 mx-2" />

                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-[9px] font-display text-[var(--text-muted)] hover:text-danger hover:bg-danger/10 transition-all uppercase tracking-widest group"
                      >
                        <LogOut
                          size={14}
                          className="group-hover:text-danger transition-colors"
                        />
                        Terminate_Session
                      </button>
                    </div>

                    <div className="mt-1 flex justify-center py-1 opacity-20 border-t border-[var(--border-main)]">
                      <span className="text-[6px] font-mono text-[var(--text-muted)] uppercase tracking-tighter">
                        Vanguard_Protocol_Active
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-hidden relative min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, scale: 0.995 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.005 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <React.Suspense fallback={<LogoLoader status={loadingStatus} />}>
                {currentView === "dashboard" && <Dashboard />}
                {currentView === "pos" && (
                  <POS onExit={() => setCurrentView("dashboard")} />
                )}
                {currentView === "inventory" && <Inventory />}
                {currentView === "credit" && <CreditManagement />}
                {currentView === "sales" && <SalesLogs />}
                {currentView === "suppliers" && <Suppliers />}
                {currentView === "expenses" && (
                  <div className="hidden lg:block h-full">
                    <Expenses />
                  </div>
                )}
                {currentView === "reports" && <Reports />}
                {currentView === "returns" && <ReturnsManagement />}
                {currentView === "hr" && (isHqCeo || currentUser?.role?.toUpperCase() === "ADMIN") && (
                  <HRModule />
                )}

                {/* HQ Views */}
                {currentView === "billing" && <BillingHub />}
                {currentView === "institutions" && <InstitutionRegistry />}
                {currentView === "website" && <WebsiteManager />}
                {currentView === "global_reports" && <GlobalReports />}
                {currentView === "audit" && <SystemAudit />}

                {currentView === "settings" && (isHqCeo || currentUser?.role?.toUpperCase() === "ADMIN" ? (isHqCeo ? <InfrastructureHub /> : <SettingsView />) : null)}
              </React.Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Command Palette */}
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <div className="industrial-modal-overlay pt-32 items-start">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCommandPaletteOpen(false)}
              className="fixed inset-0 bg-transparent"
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              className="industrial-modal-content !max-w-xl z-10 overflow-hidden border-brand-accent/50"
            >
              <div className="p-5 border-b border-[var(--border-main)] flex items-center gap-4 bg-[var(--bg-panel)]/50">
                <Search className="text-brand-accent" size={20} />
                <input
                  autoFocus
                  placeholder="EXECUTE_STRATEGIC_COMMAND..."
                  className="bg-transparent border-none outline-none text-sm font-display uppercase tracking-widest text-[var(--text-main)] w-full placeholder:text-[var(--text-muted)]/50"
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setIsCommandPaletteOpen(false);
                    if (e.key === "Enter") {
                      const firstMatch = authorizedNavItems.find((item) =>
                        item.label
                          .toLowerCase()
                          .includes(commandQuery.toLowerCase()),
                      );
                      if (firstMatch) {
                        handleSetView(firstMatch.id as View);
                        setIsCommandPaletteOpen(false);
                        setCommandQuery("");
                      }
                    }
                  }}
                />
              </div>
              <div className="p-2 max-h-96 overflow-y-auto scrollbar-industrial">
                {authorizedNavItems
                  .filter((item) =>
                    item.label
                      .toLowerCase()
                      .includes(commandQuery.toLowerCase()),
                  )
                  .map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleSetView(item.id as View);
                        setIsCommandPaletteOpen(false);
                        setCommandQuery("");
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3.5 hover:bg-brand-accent/10 transition-colors group rounded-sm border-l-2 border-transparent hover:border-brand-accent",
                        item.id === "expenses" && "hidden lg:flex",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <item.icon
                          size={18}
                          className="text-[var(--text-muted)] group-hover:text-brand-accent transition-colors"
                        />
                        <div className="flex flex-col items-start leading-none">
                          <span className="text-[11px] font-display uppercase tracking-widest group-hover:text-brand-accent transition-colors">
                            {item.label}
                          </span>
                          <span className="text-[7px] font-mono text-[var(--text-muted)] uppercase mt-1">
                            MODULE_CONTEXT // {item.id}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="keyboard-hint opacity-50 text-[10px] text-[var(--text-muted)]">
                          CMD+ {item.shortcut}
                        </span>
                      </div>
                    </button>
                  ))}
                {authorizedNavItems.filter((item) =>
                  item.label.toLowerCase().includes(commandQuery.toLowerCase()),
                ).length === 0 && (
                    <div className="p-8 text-center text-[var(--text-muted)] font-display text-[10px] uppercase italic opacity-40">
                      No_Matching_Commands_Found
                    </div>
                  )}
              </div>
              <div className="p-3 bg-[var(--bg-panel)] border-t border-[var(--border-main)] flex justify-between items-center text-[8px] font-mono text-[var(--text-muted)] px-6">
                <div className="flex gap-4">
                  <span>ESC :: ABORT</span>
                  <span>ENTER :: EXECUTE</span>
                </div>
                <div className="flex gap-4">
                  <span>UP/DOWN :: NAVIGATE</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
