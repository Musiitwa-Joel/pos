import React from "react";
import { cn } from "../../lib/utils";
import { ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";
import { SidebarButton } from "./SidebarButton";
import logoIcon from "../../../assets/SVG/tredpos1.svg";
import { flushSync } from "react-dom";

interface SidebarProps {
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (expanded: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isLightMode: boolean;
  setIsLightMode: (light: boolean) => void;
  authorizedNavItems: any[];
  currentView: string;
  onSetView: (view: any) => void;
  isHqCeo: boolean;
  currentUser: any;
}

export function Sidebar({
  isSidebarExpanded,
  setIsSidebarExpanded,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isLightMode,
  setIsLightMode,
  authorizedNavItems,
  currentView,
  onSetView,
  isHqCeo,
  currentUser
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "bg-[var(--bg-panel)] border-r border-[var(--border-main)] flex flex-col items-center py-6 z-[210] transition-all duration-300 ease-in-out",
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
              setCurrentView={onSetView}
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
  );
}
