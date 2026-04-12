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
import { cn } from '../../../lib/utils';
import { motion } from 'motion/react';

export default function InquiriesView() {
  const [activeTab, setActiveTab] = useState('all');

  const inquiries = [
    { id: 1, name: 'John Doe', email: 'john@example.com', subject: 'Pro Plan Inquiry', message: 'I am interested in the Pro plan for my retail business. Do you support multi-warehouse inventory tracking?', status: 'new', time: '2h ago' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@retail.co', subject: 'Hardware Compatibility', message: 'Does TredPOS work with Star Micronics receipt printers?', status: 'replied', time: '5h ago' },
    { id: 3, name: 'Mike Johnson', email: 'mike@tech.io', subject: 'API Access', message: 'Where can I find the API documentation for custom integrations?', status: 'archived', time: '1d ago' },
    { id: 4, name: 'Emily Brown', email: 'emily@boutique.com', subject: 'Demo Request', message: 'I would like to schedule a live demo for my team next week.', status: 'new', time: '2d ago' },
  ];

  const filteredInquiries = activeTab === 'all' 
    ? inquiries 
    : inquiries.filter(i => i.status === activeTab);

  return (
    <div className="space-y-12 bg-cream p-8 rounded-3xl border-4 border-black min-h-screen text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter font-display uppercase mb-4 text-black">
            Website <span className="text-neo-green underline decoration-8 underline-offset-8">Inquiries</span>
          </h1>
          <p className="text-xl font-bold max-w-xl text-black/80">
            Manage all messages and demo requests from your website visitors. Stay on top of your leads.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={20} />
            <input 
              type="text" 
              placeholder="Search inquiries..."
              className="neo-border py-4 pl-12 pr-6 font-bold focus:outline-none focus:bg-white transition-colors bg-white text-black"
            />
          </div>
          <button className="neo-button bg-white text-black p-4">
            <Filter size={24} />
          </button>
        </div>
      </div>

      <div className="neo-card bg-white">
        {/* Tabs */}
        <div className="flex border-b-4 border-black mb-8">
          {['all', 'new', 'replied', 'archived'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-8 py-4 font-black uppercase tracking-tight transition-all relative",
                activeTab === tab 
                  ? "text-neo-orange" 
                  : "text-black/40 hover:text-black"
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
            <div key={inquiry.id} className="p-8 neo-border bg-white hover:bg-cream transition-colors group relative overflow-hidden">
              {inquiry.status === 'new' && (
                <div className="absolute top-0 left-0 w-2 h-full bg-neo-orange" />
              )}
              
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 neo-border flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                      inquiry.status === 'new' ? "bg-neo-orange" : inquiry.status === 'replied' ? "bg-neo-green" : "bg-black/10"
                    )}>
                      {inquiry.status === 'replied' ? <CheckCircle2 size={24} className="text-white" /> : <Mail size={24} className={inquiry.status === 'new' ? "text-white" : "text-black"} />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black font-display uppercase tracking-tighter text-black">{inquiry.subject}</h3>
                      <div className="flex items-center gap-3 text-sm font-bold text-black/40">
                        <span>{inquiry.name}</span>
                        <div className="w-1 h-1 bg-black/20 rounded-full" />
                        <span>{inquiry.email}</span>
                      </div>
                    </div>
                  </div>
                  <p className="font-bold text-black/60 leading-relaxed max-w-3xl italic">
                    "{inquiry.message}"
                  </p>
                </div>

                <div className="flex flex-col justify-between items-end gap-6">
                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-black/40">
                    <Clock size={14} />
                    {inquiry.time}
                  </div>
                  <div className="flex gap-3">
                    <button className="neo-button bg-black text-white text-xs py-2 px-6">
                      Reply
                    </button>
                    <button className="neo-button bg-white text-black p-2">
                      <Trash2 size={20} />
                    </button>
                    <button className="neo-button bg-white text-black p-2">
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
          <p className="text-sm font-bold text-black/40 uppercase tracking-widest">Showing 1-4 of 42 inquiries</p>
          <div className="flex gap-4">
            <button className="neo-button bg-white text-black p-2 opacity-40 cursor-not-allowed">
              <ChevronLeft size={24} />
            </button>
            <button className="neo-button bg-white text-black p-2">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
