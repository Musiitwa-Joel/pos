import React from 'react';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Eye, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  Globe,
  Star,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Dashboard() {
  const stats = [
    { label: 'Total Visitors', value: '12,482', trend: '+12.5%', icon: Eye, color: 'bg-neo-blue' },
    { label: 'Active Users', value: '1,284', trend: '+5.2%', icon: Users, color: 'bg-neo-orange' },
    { label: 'New Inquiries', value: '42', trend: '-2.1%', icon: MessageSquare, color: 'bg-neo-green' },
    { label: 'Conversion Rate', value: '3.8%', trend: '+0.8%', icon: TrendingUp, color: 'bg-yellow-400' },
  ];

  const recentInquiries = [
    { id: 1, name: 'John Doe', email: 'john@example.com', message: 'Interested in the Pro plan...', time: '2h ago' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@retail.co', message: 'Do you support multi-warehouse?', time: '5h ago' },
    { id: 3, name: 'Mike Johnson', email: 'mike@tech.io', message: 'API documentation link?', time: '1d ago' },
  ];

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter font-display uppercase mb-4">
            Hello, <span className="text-neo-orange underline decoration-8 underline-offset-8">Admin</span>
          </h1>
          <p className="text-xl font-bold max-w-xl">
            Welcome back to the TredPOS Website Admin. Here's what's happening with your site today.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="neo-button bg-white text-black text-sm py-3 px-6">
            Generate Report
          </button>
          <button className="neo-button bg-black text-white text-sm py-3 px-6">
            Edit Landing Page
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="neo-card group hover:-translate-y-2 transition-transform">
            <div className={cn("w-14 h-14 neo-border flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", stat.color)}>
              <stat.icon size={28} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-4xl font-black font-display tracking-tighter">{stat.value}</h3>
              <div className={cn(
                "flex items-center gap-1 font-black text-xs px-2 py-1 neo-border",
                stat.trend.startsWith('+') ? "bg-neo-green/20 text-neo-green" : "bg-red-100 text-red-600"
              )}>
                {stat.trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Recent Inquiries */}
        <div className="lg:col-span-7">
          <div className="neo-card h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-black font-display uppercase tracking-tighter">Recent Inquiries</h3>
              <button className="text-neo-orange font-black text-sm hover:underline flex items-center gap-2 group">
                VIEW ALL <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="space-y-6">
              {recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="p-6 neo-border bg-white hover:bg-cream transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-black font-display uppercase tracking-tighter">{inquiry.name}</h4>
                      <p className="text-sm font-bold text-black/40">{inquiry.email}</p>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-black/40">{inquiry.time}</span>
                  </div>
                  <p className="font-bold text-black/60 mb-6 line-clamp-2">"{inquiry.message}"</p>
                  <button className="neo-button bg-black text-white text-xs py-2 px-4">
                    Reply Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Site Health / System Status */}
        <div className="lg:col-span-5">
          <div className="neo-card h-full bg-neo-blue text-white">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 bg-white neo-border flex items-center justify-center rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Zap className="text-neo-orange fill-neo-orange" size={32} />
              </div>
              <h3 className="text-3xl font-black font-display uppercase tracking-tighter">Site Health</h3>
            </div>
            
            <div className="space-y-8">
              <div className="p-6 neo-border bg-white/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-black uppercase tracking-widest text-xs">Page Speed</span>
                  <span className="font-black text-neo-green">98/100</span>
                </div>
                <div className="h-4 bg-white/20 neo-border overflow-hidden">
                  <div className="h-full bg-neo-green w-[98%]" />
                </div>
              </div>

              <div className="p-6 neo-border bg-white/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-black uppercase tracking-widest text-xs">SEO Score</span>
                  <span className="font-black text-neo-green">92/100</span>
                </div>
                <div className="h-4 bg-white/20 neo-border overflow-hidden">
                  <div className="h-full bg-neo-green w-[92%]" />
                </div>
              </div>

              <div className="p-6 neo-border bg-white/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-black uppercase tracking-widest text-xs">Uptime</span>
                  <span className="font-black text-neo-green">99.9%</span>
                </div>
                <div className="h-4 bg-white/20 neo-border overflow-hidden">
                  <div className="h-full bg-neo-green w-[99.9%]" />
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-black neo-border">
              <div className="flex items-center gap-4">
                <Globe size={24} className="text-neo-orange" />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-60">Last Deployment</p>
                  <p className="font-black uppercase">Apr 04, 2026 - 08:00 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
