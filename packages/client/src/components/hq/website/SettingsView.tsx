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
import { cn } from '../../../lib/utils';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'seo', label: 'SEO & Meta', icon: Search },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-12 bg-cream p-8 rounded-3xl border-4 border-black min-h-screen text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter font-display uppercase mb-4 text-black">
            Site <span className="text-yellow-400 underline decoration-8 underline-offset-8">Settings</span>
          </h1>
          <p className="text-xl font-bold max-w-xl text-black/80">
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
          <div className="neo-card sticky top-28 bg-white">
            <h3 className="text-2xl font-black font-display uppercase tracking-tighter mb-8 text-black">Settings Menu</h3>
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-6 font-black uppercase tracking-tight transition-all neo-border",
                    activeTab === tab.id 
                      ? "bg-yellow-400 text-black neo-shadow-sm translate-x-[-2px] translate-y-[-2px]" 
                      : "bg-white text-black hover:bg-black/5"
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
          <div className="neo-card bg-white">
            {activeTab === 'general' && (
              <div className="space-y-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-neo-blue neo-border flex items-center justify-center rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Globe className="text-white" size={24} />
                  </div>
                  <h3 className="text-3xl font-black font-display uppercase tracking-tighter text-black">General Settings</h3>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest ml-1 text-black/60">Site Name</label>
                    <input 
                      type="text" 
                      defaultValue="TredPOS"
                      className="w-full neo-border py-4 px-6 font-black focus:outline-none focus:bg-cream transition-colors text-black bg-white"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest ml-1 text-black/60">Site Description</label>
                    <textarea 
                      defaultValue="A modern SaaS POS platform for traders and retail businesses. Manage inventory, sales, and credit with ease."
                      className="w-full neo-border py-4 px-6 font-bold focus:outline-none focus:bg-cream transition-colors min-h-[120px] text-black bg-white"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-widest ml-1 text-black/60">Support Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={20} />
                        <input 
                          type="email" 
                          defaultValue="support@tredpos.com"
                          className="w-full neo-border py-4 pl-12 pr-6 font-bold focus:outline-none focus:bg-cream transition-colors text-black bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-widest ml-1 text-black/60">Support Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={20} />
                        <input 
                          type="text" 
                          defaultValue="+1 (555) 000-0000"
                          className="w-full neo-border py-4 pl-12 pr-6 font-bold focus:outline-none focus:bg-cream transition-colors text-black bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-neo-green neo-border flex items-center justify-center rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Search className="text-black" size={24} />
                  </div>
                  <h3 className="text-3xl font-black font-display uppercase tracking-tighter text-black">SEO & Meta Settings</h3>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest ml-1 text-black/60">Meta Keywords</label>
                    <input 
                      type="text" 
                      defaultValue="POS, retail, inventory, trading, SaaS, business management"
                      className="w-full neo-border py-4 px-6 font-bold focus:outline-none focus:bg-cream transition-colors text-black bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'general' && activeTab !== 'seo' && (
              <div className="py-20 text-center space-y-6">
                <Palette size={64} className="mx-auto text-black/20" />
                <h3 className="text-3xl font-black font-display uppercase tracking-tighter text-black">Settings Coming Soon</h3>
                <p className="font-bold text-black/60 max-w-md mx-auto">
                  We are currently building the configuration for this section.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
