import React from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  setQuery: (q: string) => void;
  authorizedNavItems: any[];
  onSetView: (view: any) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  query,
  setQuery,
  authorizedNavItems,
  onSetView
}: CommandPaletteProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="industrial-modal-overlay pt-32 items-start z-[9999]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") onClose();
                  if (e.key === "Enter") {
                    const firstMatch = authorizedNavItems.find((item) =>
                      item.label
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                    );
                    if (firstMatch) {
                      onSetView(firstMatch.id);
                      onClose();
                      setQuery("");
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
                    .includes(query.toLowerCase()),
                )
                .map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSetView(item.id);
                      onClose();
                      setQuery("");
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
                item.label.toLowerCase().includes(query.toLowerCase()),
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
  );
}
