import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_WEBSITE_PRICING, 
  UPDATE_WEBSITE_PRICING,
  GET_HERO_SECTION,
  UPDATE_HERO_SECTION
} from '../../gql/website';
import { 
  Save, 
  Plus, 
  Trash2, 
  Move, 
  Layout, 
  FileText, 
  Image as ImageIcon, 
  Type,
  ChevronRight,
  ChevronLeft,
  Zap,
  Globe,
  Star,
  MessageSquare,
  Briefcase,
  Package,
  Settings as SettingsIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ContentManager({ initialSection, onBack }: { initialSection?: string, onBack?: () => void }) {
  const [activeSection, setActiveSection] = useState(initialSection || 'hero');

  const sections = [
    { id: 'hero', label: 'Hero Section', icon: Layout },
    { id: 'features', label: 'Features Grid', icon: FileText },
    { id: 'cases', label: 'Case Studies', icon: Star },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'updates', label: 'Updates/Changelog', icon: Zap },
    { id: 'about', label: 'About Page', icon: Globe },
    { id: 'careers', label: 'Careers', icon: Briefcase },
    { id: 'press', label: 'Press Kit', icon: Type },
    { id: 'pricing', label: 'Pricing Plans', icon: Star },
    { id: 'footer', label: 'Footer Content', icon: ImageIcon },
  ];

  // --- PRICING DATA SYNC ENGINE ---
  const { data: pricingData, loading: loadingPricing, refetch: refetchPricing } = useQuery(GET_WEBSITE_PRICING, {
    skip: activeSection !== 'pricing'
  });
  const [updatePricing, { loading: savingPricing }] = useMutation(UPDATE_WEBSITE_PRICING);
  const [pricingForm, setPricingForm] = useState<any>(null);

  useEffect(() => {
    if (pricingData?.getWebsitePricing) {
      // Create a clean copy for the form
      const cleanData = JSON.parse(JSON.stringify(pricingData.getWebsitePricing));
      // Remove __typename to avoid GraphQL errors on mutation
      const sanitize = (obj: any) => {
        if (Array.isArray(obj)) return obj.map(sanitize);
        if (obj !== null && typeof obj === 'object') {
          const { __typename, ...rest } = obj;
          Object.keys(rest).forEach(k => rest[k] = sanitize(rest[k]));
          return rest;
        }
        return obj;
      };
      setPricingForm(sanitize(cleanData));
    }
  }, [pricingData]);

  const handleSavePricing = async () => {
    if (!pricingForm) return;
    
    const toastId = toast.loading("SYNC_INITIALIZING: Reaching Institutional Registry...");
    
    try {
      // Strict Sanitization: Remove updatedAt and __typename before mutation
      const { updatedAt, __typename, ...cleanInput } = pricingForm as any;
      const sanitizedFeatures = cleanInput.features?.map(({ __typename, ...f }: any) => f);
      
      await updatePricing({
        variables: { 
          input: { 
            ...cleanInput, 
            features: sanitizedFeatures 
          } 
        }
      });
      
      toast.success("REGISTRY_SYNC_SUCCESS: Pricing Architecture Successfully Persisted.", { id: toastId });
      refetchPricing();
    } catch (err: any) {
      console.error("[Pricing Terminal] Sync failure:", err.message);
      
      let friendlyMessage = "CALIBRATION_FAILED: We were unable to sync with the Registry.";
      
      // Institutional Error Translation Matrix
      if (err.message.includes("FORBIDDEN") || err.message.includes("ACCESS_DENIED")) {
        friendlyMessage = "ACCESS_DENIED: Full TredPOS CEO privilege is required for this operation.";
      } else if (err.message.includes("REGISTRY_OFFLINE")) {
        friendlyMessage = "OFFLINE: The TredPOS Registry is unreachable. Please check your network.";
      } else if (err.message.includes("PAYLOAD_LIMIT")) {
        friendlyMessage = "LIMIT_EXCEEDED: Data too large. Please shorten feature descriptions.";
      } else {
        friendlyMessage = `SYNC_ERROR: ${err.message.split(':').pop()?.trim() || "Unknown Registry Failure"}`;
      }

      toast.error(friendlyMessage, { id: toastId, duration: 5000 });
    }
  };

  const parsePriceString = (str: string): number => {
    if (!str) return 0;
    // Extract numbers, handles "K" (thousand) and "M" (million)
    let cleaned = str.toUpperCase().replace(/[^0-9.KM]/g, '');
    let multiplier = 1;
    if (cleaned.endsWith('K')) {
      multiplier = 1000;
      cleaned = cleaned.slice(0, -1);
    } else if (cleaned.endsWith('M')) {
      multiplier = 1000000;
      cleaned = cleaned.slice(0, -1);
    }
    const val = parseFloat(cleaned);
    return isNaN(val) ? 0 : val * multiplier;
  };

  const updatePricingField = (field: string, value: any) => {
    setPricingForm((prev: any) => {
      const next = { ...prev, [field]: value };
      
      // Auto-Sync: If user updates the visual label, try to sync the numeric calculator rate
      if (field === 'basePrice') {
        const numericValue = parsePriceString(value);
        if (numericValue > 0) {
          next.calculatorBaseRate = numericValue;
        }
      }
      
      return next;
    });
  };

  const updateFeatureField = (index: number, field: string, value: string) => {
    const newFeatures = [...pricingForm.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setPricingForm((prev: any) => ({ ...prev, features: newFeatures }));
  };

  // --- HERO DATA SYNC ENGINE ---
  const { data: heroData, loading: loadingHero, refetch: refetchHero } = useQuery(GET_HERO_SECTION, {
    skip: activeSection !== 'hero'
  });
  const [updateHero, { loading: savingHero }] = useMutation(UPDATE_HERO_SECTION);
  const [heroForm, setHeroForm] = useState<any>(null);

  useEffect(() => {
    if (heroData?.getHeroSection) {
      const { __typename, updatedAt, ...cleanHero } = heroData.getHeroSection as any;
      setHeroForm(cleanHero);
    }
  }, [heroData]);

  const handleSaveHero = async () => {
    if (!heroForm) return;
    const toastId = toast.loading("COMMAND_DEPLOING: Reaching Enterprise Hub...");
    try {
      await updateHero({ variables: { input: heroForm } });
      toast.success("DEPLOY_SUCCESS: Hero Architecture Successfully Updated.", { id: toastId });
      refetchHero();
    } catch (err: any) {
      toast.error(`DEPLOY_ERROR: ${err.message}`, { id: toastId });
    }
  };

  const updateHeroField = (field: string, value: any) => {
    setHeroForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateMarqueeItem = (index: number, value: string) => {
    const newItems = [...(heroForm?.marqueeItems || [])];
    newItems[index] = value;
    updateHeroField('marqueeItems', newItems);
  };

  const addMarqueeItem = () => {
    const newItems = [...(heroForm?.marqueeItems || []), "NEW_PROTOCOL_DATA"];
    updateHeroField('marqueeItems', newItems);
  };

  const removeMarqueeItem = (index: number) => {
    const newItems = (heroForm?.marqueeItems || []).filter((_: any, i: number) => i !== index);
    updateHeroField('marqueeItems', newItems);
  };
  // --------------------------------

  return (
    <div className="space-y-6 p-[10px] min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-all duration-500">
      <div className="w-full">
        <div className="neo-card border-4 p-4 md:p-8 bg-[var(--bg-panel)] border-[var(--border-main)] shadow-[12px_12px_0px_0px_rgba(0,0,0,0.3)]">
          {activeSection === 'hero' && (
            <div className="space-y-12">
              <div className="flex items-center justify-between mb-8 border-b border-[var(--border-main)] pb-8">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={onBack}
                    className="w-12 h-12 neo-border flex items-center justify-center border-2 hover:bg-neo-orange hover:text-white transition-all text-[var(--text-muted)]"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div className="w-16 h-16 neo-border flex items-center justify-center rotate-3 border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-neo-orange">
                    <Layout className="text-black" size={32} />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black font-display uppercase tracking-tighter text-[var(--text-main)]">Hero Visuals & Copy</h3>
                    <p className="text-[10px] font-mono text-neo-orange uppercase tracking-widest mt-1 opacity-80 italic">
                       Enterprise_Node: 01 // Chromatic_Headline_System
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleSaveHero}
                  disabled={savingHero}
                  className={cn(
                    "neo-button bg-neo-orange text-white text-sm py-4 px-8 flex items-center gap-3 shadow-[6px_6px_0px_0px_rgba(249,115,22,0.3)] uppercase font-black transition-all",
                    savingHero && "opacity-50 scale-95"
                  )}
                >
                  <Save size={24} />
                  {savingHero ? "DEPLOYING..." : "Save Changes"}
                </button>
              </div>
              {/* ... Rest of Hero ... */}
              {/* Note: I'll need to update the hero content block in a separate multi-replacement if it uses the old header */}
              {/* ... Rest of Hero Editor content ... */}

                <div className="space-y-10">
                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] ml-1 text-neo-orange italic">Chromatic Headline Sequence</label>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase opacity-40 ml-1">Part 1 (Black)</label>
                        <input 
                          type="text"
                          value={heroForm?.blackPart1 || ""}
                          onChange={(e) => updateHeroField('blackPart1', e.target.value)}
                          className="w-full neo-border py-4 px-6 font-black text-xl border-4 bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-main)] focus:border-neo-blue uppercase"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase text-neo-orange ml-1">Part 2 (Orange Accent)</label>
                        <input 
                          type="text"
                          value={heroForm?.orangePart || ""}
                          onChange={(e) => updateHeroField('orangePart', e.target.value)}
                          className="w-full neo-border py-4 px-6 font-black text-xl border-4 bg-[var(--bg-main)] border-neo-orange/40 text-neo-orange focus:border-neo-orange uppercase"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase opacity-40 ml-1">Part 3 (Black)</label>
                        <input 
                          type="text"
                          value={heroForm?.blackPart2 || ""}
                          onChange={(e) => updateHeroField('blackPart2', e.target.value)}
                          className="w-full neo-border py-4 px-6 font-black text-xl border-4 bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-main)] focus:border-neo-blue uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] ml-1 text-[var(--text-muted)]">Sub-headline Description</label>
                    <textarea 
                      value={heroForm?.description || ""}
                      onChange={(e) => updateHeroField('description', e.target.value)}
                      className="w-full neo-border py-6 px-8 font-bold text-lg focus:outline-none transition-colors min-h-[140px] border-4 bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-main)] focus:border-neo-blue"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] ml-1 text-[var(--text-muted)]">Primary CTA Velocity</label>
                      <input 
                        type="text" 
                        value={heroForm?.primaryCta || ""}
                        onChange={(e) => updateHeroField('primaryCta', e.target.value)}
                        className="w-full neo-border py-6 px-8 font-black text-xl focus:outline-none transition-colors border-4 bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-main)] focus:border-neo-blue"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] ml-1 text-[var(--text-muted)]">Secondary CTA Node</label>
                      <input 
                        type="text" 
                        value={heroForm?.secondaryCta || ""}
                        onChange={(e) => updateHeroField('secondaryCta', e.target.value)}
                        className="w-full neo-border py-6 px-8 font-black text-xl focus:outline-none transition-colors border-4 bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-main)] focus:border-neo-blue"
                      />
                    </div>
                  </div>

                  <div className="p-12 border-4 border-dashed bg-neo-blue/5 border-neo-blue/20">
                    <div className="flex flex-col items-center text-center gap-6">
                      <ImageIcon size={64} className="text-neo-blue" />
                      <div>
                        <h4 className="text-2xl font-black font-display uppercase tracking-tighter text-[var(--text-main)]">Hero Image / Visual</h4>
                        <p className="font-bold text-[var(--text-muted)] uppercase text-xs tracking-wider">Recommended: 1920x1080 SVG or PNG</p>
                      </div>
                      <button className="neo-button bg-white text-black text-xs py-4 px-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase font-black">
                        Upload Strategic Asset
                      </button>
                    </div>
                  </div>

                  <div className="pt-12 border-t-4 border-[var(--border-main)] space-y-12">
                    <div className="flex items-center justify-between">
                      <div>
                         <h4 className="text-2xl font-black font-display uppercase tracking-tighter text-[var(--text-main)]">Marquee Ticker Controller</h4>
                         <p className="text-[10px] font-mono text-neo-orange uppercase tracking-widest mt-1 opacity-80 italic">Global_Broadcast_Sequence // Kinetic_Sync</p>
                      </div>
                      <button 
                        onClick={addMarqueeItem}
                        className="neo-button bg-black text-white text-xs py-4 px-8 flex items-center gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase font-black hover:bg-neo-orange transition-colors"
                      >
                        <Plus size={20} />
                        Add Node
                      </button>
                    </div>

                    <div className="p-8 neo-border bg-neo-blue/5 border-2 border-neo-blue/20">
                      <div className="flex items-center justify-between mb-4">
                         <label className="text-xs font-black uppercase tracking-widest text-neo-blue">Ticker Velocity (GSAP Scale)</label>
                         <span className="font-mono text-xl font-black">{heroForm?.marqueeSpeed || 20}s</span>
                      </div>
                      <input 
                        type="range"
                        min="5"
                        max="60"
                        step="1"
                        value={heroForm?.marqueeSpeed || 20}
                        onChange={(e) => updateHeroField('marqueeSpeed', parseInt(e.target.value))}
                        className="w-full h-3 bg-[var(--bg-main)] appearance-none cursor-pointer rounded-full border-2 border-[var(--border-main)] accent-neo-orange"
                      />
                    </div>

                    <div className="grid gap-4">
                      {(heroForm?.marqueeItems || []).map((item: string, i: number) => (
                        <div key={i} className="flex gap-4 items-center group">
                           <div className="w-12 h-12 neo-border flex items-center justify-center shrink-0 border-4 bg-[var(--bg-panel)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-6 transition-transform">
                              <Star size={20} className="text-neo-orange fill-neo-orange" />
                           </div>
                           <input 
                             type="text" 
                             value={item}
                             onChange={(e) => updateMarqueeItem(i, e.target.value)}
                             className="flex-1 neo-border py-4 px-6 font-black text-lg focus:outline-none transition-colors border-2 bg-[var(--bg-panel)] border-[var(--border-main)] text-[var(--text-main)] focus:border-neo-orange uppercase"
                           />
                           <button 
                             onClick={() => removeMarqueeItem(i)}
                             className="w-12 h-12 neo-border flex items-center justify-center border-2 hover:bg-red-500 hover:text-white transition-all text-red-500 opacity-20 group-hover:opacity-100"
                           >
                             <Trash2 size={24} />
                           </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'features' && (
              <div className="space-y-12">
                <div className="flex items-center justify-between mb-8 border-b border-[var(--border-main)] pb-8">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={onBack}
                      className="w-12 h-12 neo-border flex items-center justify-center border-2 hover:bg-neo-green hover:text-black transition-all text-[var(--text-muted)]"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <div className="w-16 h-16 neo-border flex items-center justify-center rotate-3 border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-neo-green">
                      <FileText className="text-black" size={32} />
                    </div>
                    <h3 className="text-4xl font-black font-display uppercase tracking-tighter text-[var(--text-main)]">Features Matrix</h3>
                  </div>
                  <div className="flex gap-4">
                    <button className="neo-button bg-neo-orange text-white text-sm py-4 px-8 flex items-center gap-3 shadow-[6px_6px_0px_0px_rgba(249,115,22,0.3)] uppercase font-black">
                      <Save size={24} />
                      Save Changes
                    </button>
                    <button className="neo-button bg-neo-green text-black text-sm py-4 px-8 flex items-center gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase font-black">
                      <Plus size={24} />
                      Add Data Node
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  {[
                    { title: "Lightning Fast Checkout", desc: "Process transactions in milliseconds with our optimized engine.", icon: Zap, color: "bg-neo-orange" },
                    { title: "Smart Inventory", desc: "Real-time tracking across all your locations and warehouses.", icon: Package, color: "bg-neo-blue" },
                  ].map((feature, i) => (
                    <div key={i} className="p-12 neo-border flex items-start gap-10 group border-4 bg-[var(--bg-main)] border-[var(--border-main)] hover:border-neo-blue transition-all">
                      <div className="flex flex-col items-center gap-6">
                        <button className="p-3 neo-border transition-colors cursor-move border-2 bg-[var(--bg-panel)] border-[var(--border-main)] hover:bg-neo-blue/10">
                          <Move size={24} className="text-[var(--text-muted)]" />
                        </button>
                        <button className="p-3 neo-border transition-colors border-2 bg-[var(--bg-panel)] border-[var(--border-main)] hover:bg-red-500/10 text-red-500">
                          <Trash2 size={24} />
                        </button>
                      </div>
                      
                      <div className="flex-1 space-y-8">
                        <div className="grid md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-[var(--text-muted)]">Feature Identification</label>
                            <input 
                              type="text" 
                              defaultValue={feature.title}
                              className="w-full neo-border py-5 px-8 font-black text-xl focus:outline-none transition-colors border-4 bg-[var(--bg-panel)] border-[var(--border-main)] text-[var(--text-main)] focus:border-neo-blue"
                            />
                          </div>
                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-[var(--text-muted)]">Visual Identifier</label>
                            <div className="flex gap-6">
                              <div className={cn("w-16 h-16 neo-border flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] border-4", feature.color)}>
                                <feature.icon size={32} className="text-white" />
                              </div>
                              <button className="neo-button text-xs px-6 flex-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white text-black uppercase font-black">Change Icon</button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-[var(--text-muted)]">Feature Description</label>
                          <textarea 
                            defaultValue={feature.desc}
                            className="w-full neo-border py-5 px-8 font-bold text-lg focus:outline-none transition-colors min-h-[120px] border-4 bg-[var(--bg-panel)] border-[var(--border-main)] text-[var(--text-main)] focus:border-neo-blue"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Pricing Plans Editor */}
          {activeSection === 'pricing' && (
            <div className="space-y-12">
              {loadingPricing && !pricingForm ? (
                <div className="py-32 text-center space-y-6">
                  <div className="w-16 h-16 border-4 border-neo-blue border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-mono font-bold tracking-[0.2em] text-[var(--text-muted)] uppercase">Syncing Registry Terminal...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-8 border-b border-[var(--border-main)] pb-8">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={onBack}
                        className="w-12 h-12 neo-border flex items-center justify-center border-2 hover:bg-neo-blue hover:text-white transition-all text-[var(--text-muted)]"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <div className="w-16 h-16 neo-border flex items-center justify-center rotate-3 border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-neo-orange">
                        <Star className="text-black" size={32} />
                      </div>
                      <div>
                        <h3 className="text-4xl font-black font-display uppercase tracking-tighter text-[var(--text-main)]">Pricing Plans Editor</h3>
                        <p className="text-[10px] font-mono text-neo-orange uppercase tracking-widest mt-1 opacity-80">
                          {pricingForm?.updatedAt ? `Last_Registry_Audit: ${new Date(pricingForm.updatedAt).toLocaleString()}` : "Calibration_Mode // Tier_v2.0"}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={handleSavePricing}
                      disabled={savingPricing}
                      className={cn(
                        "neo-button bg-neo-orange text-white text-sm py-4 px-8 flex items-center gap-3 shadow-[6px_6px_0px_0px_rgba(249,115,22,0.3)] uppercase font-black transition-all",
                        savingPricing && "opacity-50 scale-95"
                      )}
                    >
                      <Save size={24} />
                      {savingPricing ? "Committing..." : "Save Changes"}
                    </button>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-12">
                    {/* Core Plan Details */}
                    <div className="space-y-10">
                      <div className="neo-card border-4 p-8 bg-[var(--bg-main)] border-[var(--border-main)]">
                        <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-8 border-b border-[var(--border-main)] pb-4">Core Tier Configuration</h4>
                        <div className="space-y-8">
                          <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Plan Identification</label>
                            <input 
                              type="text" 
                              value={pricingForm?.planName || ""}
                              onChange={(e) => updatePricingField('planName', e.target.value)}
                              className="w-full neo-border py-4 px-6 font-black text-2xl focus:outline-none transition-colors border-4 bg-[var(--bg-panel)] border-[var(--border-main)] text-[var(--text-main)] focus:border-neo-blue"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Currency / Base Rate</label>
                              <input 
                                type="text" 
                                value={pricingForm?.basePrice || ""}
                                onChange={(e) => updatePricingField('basePrice', e.target.value)}
                                className="w-full neo-border py-4 px-6 font-black text-xl focus:outline-none transition-colors border-4 bg-[var(--bg-panel)] border-[var(--border-main)] text-[var(--text-main)] focus:border-neo-blue"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Billing Interval</label>
                              <input 
                                type="text" 
                                value={pricingForm?.billingInterval || ""}
                                onChange={(e) => updatePricingField('billingInterval', e.target.value)}
                                className="w-full neo-border py-4 px-6 font-black text-xl focus:outline-none transition-colors border-4 bg-[var(--bg-panel)] border-[var(--border-main)] text-[var(--text-main)] focus:border-neo-blue"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Tier Sub-label</label>
                            <input 
                              type="text" 
                              value={pricingForm?.subLabel || ""}
                              onChange={(e) => updatePricingField('subLabel', e.target.value)}
                              className="w-full neo-border py-4 px-6 font-bold text-sm tracking-widest focus:outline-none transition-colors border-4 bg-[var(--bg-panel)] border-[var(--border-main)] text-[var(--text-main)] focus:border-neo-blue"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="neo-card border-4 p-8 bg-[var(--bg-main)] border-[var(--border-main)]">
                        <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-8 border-b border-[var(--border-main)] pb-4">Calculator Parameters</h4>
                        <div className="space-y-8">
                          <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Price Per Deployment Node</label>
                            <input 
                              type="number" 
                              value={pricingForm?.calculatorBaseRate || 0}
                              onChange={(e) => updatePricingField('calculatorBaseRate', parseFloat(e.target.value))}
                              className="w-full neo-border py-4 px-6 font-black text-xl focus:outline-none transition-colors border-4 bg-[var(--bg-panel)] border-[var(--border-main)] text-[var(--text-main)] focus:border-neo-blue"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Calculator Headline</label>
                            <input 
                              type="text" 
                              value={pricingForm?.calculatorHeadline || ""}
                              onChange={(e) => updatePricingField('calculatorHeadline', e.target.value)}
                              className="w-full neo-border py-4 px-6 font-black text-xl focus:outline-none transition-colors border-4 bg-[var(--bg-panel)] border-[var(--border-main)] text-[var(--text-main)] focus:border-neo-blue"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features Matrix CRUD */}
                    <div className="neo-card border-4 p-8 bg-[var(--bg-main)] border-[var(--border-main)]">
                      <div className="flex items-center justify-between mb-8 border-b border-[var(--border-main)] pb-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Institutional Feature Matrix</h4>
                        <span className="text-[9px] font-mono text-neo-blue opacity-80">Registry_Live_Stream</span>
                      </div>
                      
                      <div className="space-y-6">
                        {(pricingForm?.features || []).map((feat: any, i: number) => (
                          <div key={i} className="space-y-4 p-6 border-2 border-[var(--border-main)] bg-[var(--bg-panel)] hover:border-neo-blue transition-all group relative">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 neo-border flex items-center justify-center shrink-0 border-2 bg-[var(--bg-main)] text-neo-blue">
                                <SettingsIcon size={16} />
                              </div>
                              <input 
                                type="text" 
                                value={feat.title}
                                onChange={(e) => updateFeatureField(i, 'title', e.target.value)}
                                className="bg-transparent border-none p-0 font-black uppercase text-sm w-full focus:outline-none text-[var(--text-main)]"
                              />
                            </div>
                            <textarea 
                              value={feat.description}
                              onChange={(e) => updateFeatureField(i, 'description', e.target.value)}
                              className="bg-transparent border-none p-0 font-medium text-xs w-full focus:outline-none text-[var(--text-muted)] min-h-[60px] resize-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Updates Section Placeholder */}
          {activeSection === 'updates' && (
             <div className="py-24 text-center space-y-8">
               <Zap size={80} className="mx-auto text-[var(--text-muted)] opacity-20" />
               <h3 className="text-4xl font-black font-display uppercase tracking-tighter text-[var(--text-main)]">Unified Ticker Migration</h3>
               <p className="font-bold max-w-md mx-auto text-[var(--text-muted)] uppercase text-xs tracking-widest leading-loose">
                  SYSTEM_ALERT: The marquee controls have been migrated to the Hero Section protocols for unified configuration.
               </p>
             </div>
          )}

          {/* Generalized List Editor for common sections */}
          {(['cases', 'reviews', 'careers', 'press'].includes(activeSection)) && (
             <div className="space-y-12">
                <div className="flex items-center justify-between mb-8 border-b border-[var(--border-main)] pb-8">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={onBack}
                      className="w-12 h-12 neo-border flex items-center justify-center border-2 hover:bg-neo-blue hover:text-white transition-all text-[var(--text-muted)]"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <div className="w-16 h-16 neo-border flex items-center justify-center rotate-3 border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-neo-blue">
                      {sections.find(s => s.id === activeSection)?.icon && React.createElement(sections.find(s => s.id === activeSection)!.icon, { size: 32, className: "text-white" })}
                    </div>
                    <h3 className="text-4xl font-black font-display uppercase tracking-tighter text-[var(--text-main)]">
                      {sections.find(s => s.id === activeSection)?.label} Manager
                    </h3>
                  </div>
                  <div className="flex gap-4">
                    <button className="neo-button bg-neo-orange text-white text-sm py-4 px-8 flex items-center gap-3 shadow-[6px_6px_0px_0px_rgba(249,115,22,0.3)] uppercase font-black">
                      <Save size={24} />
                      Save Changes
                    </button>
                    <button className="neo-button bg-neo-orange text-white text-sm py-4 px-8 flex items-center gap-3 shadow-[8px_8px_0px_0px_rgba(249,115,22,0.3)] uppercase font-black">
                      <Plus size={24} />
                      Add Registry Entry
                    </button>
                  </div>
                </div>
                
                <div className="py-24 text-center space-y-8 border-4 border-dashed border-[var(--border-main)] bg-[var(--bg-main)]">
                  <div className="text-sm font-black uppercase tracking-[0.4em] text-neo-orange mb-4 opacity-80 animate-pulse">Operational Sync Required</div>
                  <p className="font-bold max-w-md mx-auto leading-relaxed text-[var(--text-muted)]">
                     This module is ready for structural metadata injection. Start adding entries to populate your public website stream.
                  </p>
                </div>
             </div>
          )}

          {/* Placeholder for other sections */}
          {[ 'about', 'footer' ].includes(activeSection) && (
            <div className="py-24 text-center space-y-8">
              <Layout size={80} className="mx-auto text-[var(--text-muted)] opacity-20" />
              <h3 className="text-4xl font-black font-display uppercase tracking-tighter text-[var(--text-main)]">Editor Under Construction</h3>
              <p className="font-bold max-w-md mx-auto text-[var(--text-muted)] uppercase text-xs tracking-widest leading-loose">
                 TREDPOS_R&D: We are currently architecting the specialized configuration engine for this section. Link establishment pending.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Package icon is now imported from lucide-react
