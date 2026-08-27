import React from "react";
import { LayoutGrid, Command as CommandIcon, Settings as SettingsIcon, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { observer } from "@legendapp/state/react";
import { cn } from "../../lib/utils";
import { API_BASE_URL } from "../../lib/apollo";
import { systemState$ } from "../../contexts/SystemContext";

interface HeaderProps {
  loading: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  currentView: string;
  currentUser: any;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  profileDropdownRef: any;
  fileInputRef: any;
  handleAvatarUpdate: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogout: () => void;
  isHqCeo: boolean;
  onSetView: (view: any) => void;
  setIsCommandPaletteOpen: (open: boolean) => void;
  settings: any;
}

// 🕒 [VANGUARD] Isolated Time Component:
// Only this component re-renders every second, keeping the main Header static.
const ReactiveClock = observer(() => {
  const now = new Date(systemState$.now.get());
  return (
    <div className="hidden sm:block text-[9px] font-mono text-[var(--text-muted)] border-x border-[var(--border-main)] px-4 opacity-60 font-black whitespace-nowrap">
      {now.toLocaleDateString()} // {now.toLocaleTimeString()}
    </div>
  );
});

export const Header = observer(({
  loading,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  currentView,
  currentUser,
  isProfileOpen,
  setIsProfileOpen,
  profileDropdownRef,
  fileInputRef,
  handleAvatarUpdate,
  handleLogout,
  isHqCeo,
  onSetView,
  setIsCommandPaletteOpen,
  settings
}: HeaderProps) => {
  return (
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
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          TELEMETRY_LINK_ESTABLISHED
        </div>

        <ReactiveClock />

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
                src={`${API_BASE_URL.replace(/\/$/, '')}/${currentUser.profilePicture.replace(/^\//, '')}`}
                alt="Identity"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=f97316&color=fff&bold=true`;
                }}
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
                        onSetView("settings");
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
  );
});
