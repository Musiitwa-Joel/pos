import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Zap,
  Globe,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export default function AdminLayout({ children, activeView, onViewChange, onLogout }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'content', label: 'Content Manager', icon: FileText },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
    { id: 'settings', label: 'Site Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-cream text-black font-sans flex">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r-4 border-black flex flex-col z-50"
      >
        <div className="p-6 border-b-4 border-black flex items-center justify-between">
          <div className={cn("flex items-center gap-3 overflow-hidden", !isSidebarOpen && "hidden")}>
            <div className="w-10 h-10 bg-black flex items-center justify-center rotate-3 shadow-[2px_2px_0px_0px_rgba(255,107,0,1)]">
              <Zap className="text-neo-orange fill-neo-orange" size={20} />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase font-display">Admin<span className="text-neo-orange">OS</span></span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 neo-border bg-white hover:bg-neo-orange transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 font-black uppercase tracking-tight transition-all",
                activeView === item.id 
                  ? "bg-neo-orange text-white neo-border neo-shadow-sm translate-x-[-2px] translate-y-[-2px]" 
                  : "hover:bg-black/5"
              )}
            >
              <item.icon size={24} />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t-4 border-black space-y-2">
          <button 
            onClick={() => window.location.href = '/'}
            className={cn(
              "w-full flex items-center gap-4 p-4 font-black uppercase tracking-tight hover:bg-neo-blue/10 text-neo-blue transition-all",
              !isSidebarOpen && "justify-center"
            )}
          >
            <Globe size={24} />
            {isSidebarOpen && <span>View Website</span>}
          </button>
          <button 
            onClick={onLogout}
            className={cn(
              "w-full flex items-center gap-4 p-4 font-black uppercase tracking-tight hover:bg-red-100 text-red-600 transition-all",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut size={24} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b-4 border-black flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black uppercase font-display tracking-tighter">
              {menuItems.find(i => i.id === activeView)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-neo-green/20 neo-border">
              <div className="w-2 h-2 bg-neo-green rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">System Online</span>
            </div>
            <div className="w-10 h-10 neo-border bg-white flex items-center justify-center font-black">
              A
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-cream">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
