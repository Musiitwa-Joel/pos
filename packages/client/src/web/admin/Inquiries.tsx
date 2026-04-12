import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Zap,
  Star
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export default function Inquiries({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const [activeTab, setActiveTab] = useState('all');
  const isDark = theme === 'dark';

  const inquiries = [
    { id: 1, name: 'John Doe', email: 'john@example.com', subject: 'Pro Plan Inquiry', message: 'I am interested in the Pro plan for my retail business. Do you support multi-warehouse inventory tracking?', status: 'new', time: '2h ago' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@retail.co', subject: 'Hardware Compatibility', message: 'Does TredPOS work with Star Mi receipt printers?', status: 'replied', time: '5h ago' },
    { id: 3, name: 'Mike Johnson', email: 'mike@tech.io', subject: 'API Access', message: 'Where can I find the API documentation for custom integrations?', status: 'archived', time: '1d ago' },
    { id: 4, name: 'Emily Brown', email: 'emily@boutique.com', subject: 'Demo Request', message: 'I would like to schedule a live demo for my team next week.', status: 'new', time: '2d ago' },
  ];

  const filteredInquiries = activeTab === 'all' 
    ? inquiries 
    : inquiries.filter(i => i.status === activeTab);

  return (
    <div className={cn("space-y-12 p-8 rounded-[2rem]", isDark ? "bg-black text-white" : "bg-cream text-black")}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter font-display uppercase mb-4">
            Website <span className="text-neo-green underline decoration-8 underline-offset-8">Inquiries</span>
          </h1>
          <p className={cn("text-xl font-bold max-w-xl", isDark ? "text-white/60" : "text-black/80")}>
            Manage all messages and demo requests from your website visitors. Stay on top of your leads.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2", isDark ? "text-white/40" : "text-black/40")} size={20} />
            <input 
              type="text" 
              placeholder="Search inquiries..."
              className={cn("neo-border py-4 pl-12 pr-6 font-bold focus:outline-none transition-colors border-2", isDark ? "bg-white/5 border-white/20 text-white focus:bg-white/10" : "bg-white border-black text-black focus:bg-cream")}
            />
          </div>
          <button className={cn("neo-button p-4", isDark ? "bg-white/5 text-white border-white/20" : "bg-white text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]")}>
            <Filter size={24} />
          </button>
        </div>
      </div>

      <div className={cn("neo-card border-4", isDark ? "bg-white/5 border-white/20 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]" : "bg-white border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]")}>
        {/* Tabs */}
        <div className={cn("flex border-b-4 mb-8", isDark ? "border-white/10" : "border-black")}>
          {['all', 'new', 'replied', 'archived'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-8 py-4 font-black uppercase tracking-tight transition-all relative",
                activeTab === tab 
                  ? "text-neo-orange" 
                  : isDark ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-[-4px] left-0 right-0 h-1 bg-neo-orange"
                />
              )}
            </button>
          ))}
        </div>

        {/* Inquiry List */}
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => (
            <div key={inquiry.id} className={cn("p-8 neo-border transition-colors group relative overflow-hidden border-2", isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-black hover:bg-cream")}>
              {inquiry.status === 'new' && (
                <div className="absolute top-0 left-0 w-2 h-full bg-neo-orange" />
              )}
              
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 neo-border flex items-center justify-center border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                      inquiry.status === 'new' ? "bg-neo-orange" : inquiry.status === 'replied' ? "bg-neo-green" : isDark ? "bg-white/10" : "bg-black/10"
                    )}>
                      {inquiry.status === 'replied' ? <CheckCircle2 size={24} className="text-white" /> : <Mail size={24} className={inquiry.status === 'new' ? "text-white" : isDark ? "text-white" : "text-black"} />}
                    </div>
                    <div>
                      <h3 className={cn("text-2xl font-black font-display uppercase tracking-tighter", isDark ? "text-white" : "text-black")}>{inquiry.subject}</h3>
                      <div className={cn("flex items-center gap-3 text-sm font-bold", isDark ? "text-white/40" : "text-black/40")}>
                        <span>{inquiry.name}</span>
                        <div className={cn("w-1 h-1 rounded-full", isDark ? "bg-white/20" : "bg-black/20")} />
                        <span>{inquiry.email}</span>
                      </div>
                    </div>
                  </div>
                  <p className={cn("font-bold leading-relaxed max-w-3xl", isDark ? "text-white/60" : "text-black/60")}>
                    "{inquiry.message}"
                  </p>
                </div>

                <div className="flex flex-col justify-between items-end gap-6">
                  <div className={cn("flex items-center gap-3 text-xs font-black uppercase tracking-widest", isDark ? "text-white/40" : "text-black/40")}>
                    <Clock size={14} />
                    {inquiry.time}
                  </div>
                  <div className="flex gap-3">
                    <button className={cn("neo-button text-xs py-2 px-6", isDark ? "bg-white text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]" : "bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]")}>
                      Reply
                    </button>
                    <button className={cn("neo-button p-2", isDark ? "bg-white/5 text-white border-white/20" : "bg-white text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]")}>
                      <Trash2 size={20} />
                    </button>
                    <button className={cn("neo-button p-2", isDark ? "bg-white/5 text-white border-white/20" : "bg-white text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]")}>
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex items-center justify-between">
          <p className={cn("text-sm font-bold uppercase tracking-widest", isDark ? "text-white/40" : "text-black/40")}>Showing 1-4 of 42 inquiries</p>
          <div className="flex gap-4">
            <button className={cn("neo-button p-2 opacity-40 cursor-not-allowed", isDark ? "bg-white/10 text-white" : "bg-white text-black")}>
              <ChevronLeft size={24} />
            </button>
            <button className={cn("neo-button p-2", isDark ? "bg-white/10 text-white" : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]")}>
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
