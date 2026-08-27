import React from "react";
import { cn } from "../../lib/utils";

interface SidebarButtonProps {
  item: any;
  currentView: string;
  setCurrentView: (v: any) => void;
  isSidebarExpanded: boolean;
}

export function SidebarButton({
  item,
  currentView,
  setCurrentView,
  isSidebarExpanded,
}: SidebarButtonProps) {
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
