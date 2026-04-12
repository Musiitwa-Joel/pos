import React, { useState } from 'react';
import { 
  Save, 
  Globe, 
  Search, 
  Share2, 
  Palette, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin,
  ChevronRight,
  Zap,
  Star
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Settings({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const [activeTab, setActiveTab] = useState('general');
  const isDark = theme === 'dark';

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'seo', label: 'SEO & Meta', icon: Search },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ];

  return (
    <div className={cn("space-y-12 p-8 rounded-[2rem]", isDark ? "bg-black text-white" : "bg-cream text-black")}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter font-display uppercase mb-4">
            Site <span className="text-yellow-400 underline decoration-8 underline-offset-8">Settings</span>
          </h1>
          <p className={cn("text-xl font-bold max-w-xl", isDark ? "text-white/60" : "text-black/80")}>
            Configure your website's global settings, SEO metadata, and branding preferences.
          </p>
        </div>
        <button className="neo-button bg-neo-orange text-white text-xl py-5 px-10 flex items-center gap-3">
          <Save size={24} />
          Save Settings
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Settings Navigation */}
        <div className="lg:col-span-4">
          <div className={cn("neo-card sticky top-28 border-4", isDark ? "bg-white/5 border-white/20 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]" : "bg-white border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]")}>
            <h3 className={cn("text-2xl font-black font-display uppercase tracking-tighter mb-8", isDark ? "text-white" : "text-black")}>Settings Menu</h3>
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-6 font-black uppercase tracking-tight transition-all border-2",
                    activeTab === tab.id 
                      ? "bg-yellow-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" 
                      : isDark ? "bg-white/5 text-white border-white/10 hover:bg-white/10" : "bg-white text-black border-black hover:bg-black/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <tab.icon size={24} />
                    <span>{tab.label}</span>
                  </div>
                  <ChevronRight size={20} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Editor */}
        <div className="lg:col-span-8">
          <div className={cn("neo-card border-4", isDark ? "bg-white/5 border-white/20 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]" : "bg-white border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]")}>
            {activeTab === 'general' && (
              <div className="space-y-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn("w-12 h-12 neo-border flex items-center justify-center rotate-3 border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", isDark ? "bg-neo-blue/80" : "bg-neo-blue")}>
                    <Globe className="text-white" size={24} />
                  </div>
                  <h3 className={cn("text-3xl font-black font-display uppercase tracking-tighter", isDark ? "text-white" : "text-black")}>General Settings</h3>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className={cn("text-xs font-black uppercase tracking-widest ml-1", isDark ? "text-white/40" : "text-black/60")}>Site Name</label>
                    <input 
                      type="text" 
                      defaultValue="TredPOS"
                      className={cn("w-full neo-border py-4 px-6 font-black focus:outline-none transition-colors border-2", isDark ? "bg-white/5 border-white/20 text-white focus:bg-white/10" : "bg-white border-black text-black focus:bg-cream")}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className={cn("text-xs font-black uppercase tracking-widest ml-1", isDark ? "text-white/40" : "text-black/60")}>Site Description</label>
                    <textarea 
                      defaultValue="A modern SaaS POS platform for traders and retail businesses. Manage inventory, sales, and credit with ease."
                      className={cn("w-full neo-border py-4 px-6 font-bold focus:outline-none transition-colors min-h-[120px] border-2", isDark ? "bg-white/5 border-white/20 text-white focus:bg-white/10" : "bg-white border-black text-black focus:bg-cream")}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className={cn("text-xs font-black uppercase tracking-widest ml-1", isDark ? "text-white/40" : "text-black/60")}>Support Email</label>
                      <div className="relative">
                        <Mail className={cn("absolute left-4 top-1/2 -translate-y-1/2", isDark ? "text-white/40" : "text-black/40")} size={20} />
                        <input 
                          type="email" 
                          defaultValue="support@tredpos.com"
                          className={cn("w-full neo-border py-4 pl-12 pr-6 font-bold focus:outline-none transition-colors border-2", isDark ? "bg-white/5 border-white/20 text-white focus:bg-white/10" : "bg-white border-black text-black focus:bg-cream")}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className={cn("text-xs font-black uppercase tracking-widest ml-1", isDark ? "text-white/40" : "text-black/60")}>Support Phone</label>
                      <div className="relative">
                        <Phone className={cn("absolute left-4 top-1/2 -translate-y-1/2", isDark ? "text-white/40" : "text-black/40")} size={20} />
                        <input 
                          type="text" 
                          defaultValue="+1 (555) 000-0000"
                          className={cn("w-full neo-border py-4 pl-12 pr-6 font-bold focus:outline-none transition-colors border-2", isDark ? "bg-white/5 border-white/20 text-white focus:bg-white/10" : "bg-white border-black text-black focus:bg-cream")}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className={cn("text-xs font-black uppercase tracking-widest ml-1", isDark ? "text-white/40" : "text-black/60")}>Office Address</label>
                    <div className="relative">
                      <MapPin className={cn("absolute left-4 top-1/2 -translate-y-1/2", isDark ? "text-white/40" : "text-black/40")} size={20} />
                      <input 
                        type="text" 
                        defaultValue="123 Trading St, Commerce City, TX 75001"
                        className={cn("w-full neo-border py-4 pl-12 pr-6 font-bold focus:outline-none transition-colors border-2", isDark ? "bg-white/5 border-white/20 text-white focus:bg-white/10" : "bg-white border-black text-black focus:bg-cream")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn("w-12 h-12 neo-border flex items-center justify-center rotate-3 border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", isDark ? "bg-neo-green/80" : "bg-neo-green")}>
                    <Search className="text-black" size={24} />
                  </div>
                  <h3 className={cn("text-3xl font-black font-display uppercase tracking-tighter", isDark ? "text-white" : "text-black")}>SEO & Meta Settings</h3>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className={cn("text-xs font-black uppercase tracking-widest ml-1", isDark ? "text-white/40" : "text-black/60")}>Meta Keywords</label>
                    <input 
                      type="text" 
                      defaultValue="POS, retail, inventory, trading, SaaS, business management"
                      className={cn("w-full neo-border py-4 px-6 font-bold focus:outline-none transition-colors border-2", isDark ? "bg-white/5 border-white/20 text-white focus:bg-white/10" : "bg-white border-black text-black focus:bg-cream")}
                    />
                    <p className={cn("text-[10px] font-bold uppercase tracking-widest", isDark ? "text-white/40" : "text-black/40")}>Separate keywords with commas.</p>
                  </div>

                  <div className="space-y-4">
                    <label className={cn("text-xs font-black uppercase tracking-widest ml-1", isDark ? "text-white/40" : "text-black/60")}>Google Analytics ID</label>
                    <input 
                      type="text" 
                      defaultValue="UA-000000000-1"
                      className={cn("w-full neo-border py-4 px-6 font-bold focus:outline-none transition-colors border-2", isDark ? "bg-white/5 border-white/20 text-white focus:bg-white/10" : "bg-white border-black text-black focus:bg-cream")}
                    />
                  </div>

                  <div className={cn("p-8 border-2 border-dashed", isDark ? "bg-white/5 border-white/20" : "bg-neo-orange/10 border-neo-orange")}>
                    <div className="flex flex-col items-center text-center gap-4">
                      <Zap size={48} className="text-neo-orange" />
                      <div>
                        <h4 className={cn("text-xl font-black font-display uppercase tracking-tighter", isDark ? "text-white" : "text-black")}>Sitemap & Robots.txt</h4>
                        <p className={cn("font-bold", isDark ? "text-white/60" : "text-black/60")}>Automatically generate your sitemap and robots.txt files for search engines.</p>
                      </div>
                      <button className={cn("neo-button text-sm py-3 px-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", isDark ? "bg-white text-black" : "bg-white text-black")}>
                        Generate Sitemap
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {activeTab !== 'general' && activeTab !== 'seo' && (
              <div className="py-20 text-center space-y-6">
                <Palette size={64} className={cn("mx-auto", isDark ? "text-white/10" : "text-black/20")} />
                <h3 className={cn("text-3xl font-black font-display uppercase tracking-tighter", isDark ? "text-white" : "text-black")}>Settings Coming Soon</h3>
                <p className={cn("font-bold max-w-md mx-auto", isDark ? "text-white/40" : "text-black/60")}>
                  We are currently building the configuration for this section. Check back later for more updates.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
