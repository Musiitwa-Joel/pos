import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  LayoutGrid,
  Globe,
  Receipt,
  Truck,
  RotateCcw,
  UserCog,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useHardware } from "./HardwareContext";
import { toast } from "sonner";
import TopLoader from "./components/TopLoader";
import { observer } from "@legendapp/state/react";

// Modular UI Components
import { Sidebar } from "./components/AppShell/Sidebar";
import { Header } from "./components/AppShell/Header";
import { CommandPalette } from "./components/AppShell/CommandPalette";

// 🏗️ Deferred Module Loading (Code Splitting)
const Dashboard = React.lazy(() => import("./components/Dashboard"));
const POS = React.lazy(() => import("./components/POS"));
const Inventory = React.lazy(() => import("./components/Inventory"));
const CreditManagement = React.lazy(() => import("./components/CreditManagement"));
const SalesLogs = React.lazy(() => import("./components/SalesLogs"));
const Suppliers = React.lazy(() => import("./components/Suppliers"));
const HRModule = React.lazy(() => import("./components/HRModule"));
const SettingsView = React.lazy(() => import("./components/SettingsView"));
const Reports = React.lazy(() => import("./components/Reports"));
const ReturnsManagement = React.lazy(() => import("./components/ReturnsManagement"));

// 👑 HQ Modules (Deferred)
const BillingHub = React.lazy(() => import("./components/hq/BillingHub"));
const InstitutionRegistry = React.lazy(() => import("./components/hq/InstitutionRegistry"));
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
  | "global_reports"
  | "audit"
  | "institutional_reports";

export default observer(function AppShell() {
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
  if (currentUser?.tenantStatus === "suspended" && currentUser?.role !== "hq-ceo") {
    return <SuspensionOverlay />;
  }

  const isHqCeo = currentUser?.role === "hq-ceo";
  const [currentView, setCurrentView] = useState<View>(isHqCeo ? "billing" : "dashboard");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light";
  });
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
    if (isHqCeo && currentView === "dashboard") {
      setCurrentView("billing");
    }
  }, [isHqCeo, currentView]);

  const handleSetView = (view: View) => {
    if (view === currentView) return;
    setCurrentView(view);
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

  const navItems = useMemo(() => {
    return isHqCeo
      ? [
        { id: "billing", label: "Collections HQ", icon: LayoutGrid, shortcut: "C" },
        { id: "institutions", label: "B2B Registry", icon: Globe, shortcut: "I" },
        // { id: "website", label: "Manage Website", icon: Zap, shortcut: "W" },
        { id: "global_reports", label: "Global Reports", icon: BarChart3, shortcut: "R" },
        { id: "audit", label: "Security Logs", icon: Receipt, shortcut: "A" },
        { id: "settings", label: "Global Config", icon: SettingsIcon, shortcut: "G" },
      ]
      : [
        { id: "dashboard", label: "Intelligence", icon: LayoutDashboard, shortcut: "R" },
        { id: "pos", label: "Terminal", icon: ShoppingCart, shortcut: "P" },
        { id: "inventory", label: "Inventory", icon: Package, shortcut: "I" },
        { id: "credit", label: "Credit", icon: Users, shortcut: "U" },
        { id: "hr", label: "Human Resources", icon: UserCog, shortcut: "H" },
        { id: "sales", label: "Audit", icon: Receipt, shortcut: "L" },
        { id: "reports", label: "Analytics", icon: BarChart3, shortcut: "B" },
        { id: "suppliers", label: "Suppliers", icon: Truck, shortcut: "S" },
        // { id: "expenses", label: "Expenses", icon: DollarSign, shortcut: "E" },
        { id: "returns", label: "Returns Hub", icon: RotateCcw, shortcut: "T" },
      ];
  }, [isHqCeo]);

  const authorizedNavItems = useMemo(() => {
    if (isHqCeo || currentUser?.role?.toUpperCase() === 'ADMIN') return navItems;
    const authorized = currentUser?.authorizedModules || [];
    return navItems.filter(item => authorized.includes(item.id));
  }, [navItems, currentUser, isHqCeo]);

  useEffect(() => {
    if (!currentUser || isHqCeo || currentUser.role?.toUpperCase() === 'ADMIN') return;
    const authorizedIds = currentUser.authorizedModules || [];
    const isActuallyAuthorized = authorizedIds.includes(currentView);
    if (!isActuallyAuthorized && authorizedIds.length > 0) {
      const firstAvailable = navItems.find(item => authorizedIds.includes(item.id as any));
      if (firstAvailable) {
        setCurrentView(firstAvailable.id as View);
      }
    }
  }, [currentView, currentUser, isHqCeo, navItems]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;
      if (isMod && isShift && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }
      if (isMod && !isShift && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        const target = navItems[index];
        if (target) handleSetView(target.id as View);
        return;
      }
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[205] lg:hidden"
          />
        )}
      </AnimatePresence>

      <Sidebar 
        isSidebarExpanded={isSidebarExpanded}
        setIsSidebarExpanded={setIsSidebarExpanded}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isLightMode={isLightMode}
        setIsLightMode={setIsLightMode}
        authorizedNavItems={authorizedNavItems}
        currentView={currentView}
        onSetView={handleSetView}
        isHqCeo={isHqCeo}
        currentUser={currentUser}
      />

      <main className="flex-1 flex flex-col relative overflow-visible bg-[var(--bg-main)]">
        <Header 
          loading={loading}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          currentView={currentView}
          currentUser={currentUser}
          isProfileOpen={isProfileOpen}
          setIsProfileOpen={setIsProfileOpen}
          profileDropdownRef={profileDropdownRef}
          fileInputRef={fileInputRef}
          handleAvatarUpdate={handleAvatarUpdate}
          handleLogout={handleLogout}
          isHqCeo={isHqCeo}
          onSetView={handleSetView}
          setIsCommandPaletteOpen={setIsCommandPaletteOpen}
          settings={settings}
        />

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
                {currentView === "pos" && <POS onExit={() => setCurrentView("dashboard")} />}
                {currentView === "inventory" && <Inventory />}
                {currentView === "credit" && <CreditManagement />}
                {currentView === "sales" && <SalesLogs />}
                {currentView === "suppliers" && <Suppliers />}
                {/* {currentView === "expenses" && <div className="hidden lg:block h-full"><Expenses /></div>} */}
                {currentView === "reports" && <Reports />}
                {currentView === "returns" && <ReturnsManagement />}
                {currentView === "hr" && <HRModule />}

                {/* HQ Views */}
                {currentView === "billing" && <BillingHub />}
                {currentView === "institutions" && <InstitutionRegistry />}
                {/* {currentView === "website" && <WebsiteManager />} */}
                {currentView === "global_reports" && <GlobalReports />}
                {currentView === "audit" && <SystemAudit />}

                {currentView === "settings" && (isHqCeo ? <InfrastructureHub /> : <SettingsView />)}
              </React.Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        query={commandQuery}
        setQuery={setCommandQuery}
        authorizedNavItems={authorizedNavItems}
        onSetView={handleSetView}
      />
    </div>
  );
});
