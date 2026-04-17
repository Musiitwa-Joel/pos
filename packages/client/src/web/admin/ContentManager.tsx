import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_WEBSITE_PRICING,
  UPDATE_WEBSITE_PRICING,
  GET_HERO_SECTION,
  UPDATE_HERO_SECTION,
  GET_REVIEWS, CREATE_REVIEW, UPDATE_REVIEW, DELETE_REVIEW,
  GET_UPDATES, CREATE_UPDATE, UPDATE_UPDATE, DELETE_UPDATE,
  GET_CASE_STUDIES, CREATE_CASE_STUDY, UPDATE_CASE_STUDY, DELETE_CASE_STUDY,
  GET_ABOUT_SECTIONS, CREATE_ABOUT_SECTION, UPDATE_ABOUT_SECTION, DELETE_ABOUT_SECTION,
  GET_CAREERS_DATA,
  CREATE_JOB, UPDATE_JOB, DELETE_JOB,
  CREATE_PERK, UPDATE_PERK, DELETE_PERK,
  GET_PRESS_RELEASES, CREATE_PRESS_RELEASE, UPDATE_PRESS_RELEASE, DELETE_PRESS_RELEASE,
  GET_FEATURES, CREATE_FEATURE, UPDATE_FEATURE, DELETE_FEATURE
} from '../../gql/website';
import ChangelogAdmin from './ChangelogAdmin';
import BlogAdmin from './BlogAdmin.tsx';
import PressAdmin from './PressAdmin';
import ContactAdmin from './ContactAdmin';
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
  Settings as SettingsIcon,
  Calendar,
  RefreshCw,
  BookOpen,
  Newspaper,
  Megaphone,
  Info,
  History,
  Edit3
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ContentManager({ initialSection, onBack }: { initialSection?: string, onBack?: () => void }) {
  const [activeSection, setActiveSection] = useState<'hero' | 'pricing' | 'updates' | 'reviews' | 'case-studies' | 'about' | 'careers' | 'blog' | 'press' | 'features' | 'changelog' | 'contact'>((initialSection as any) || 'hero');

  const sections = [
    { id: 'hero', label: 'Hero Section', icon: Layout },
    { id: 'features', label: 'Features Grid', icon: FileText },
    { id: 'cases', label: 'Case Studies', icon: Star },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'changelog', label: 'Updates / Changelog', icon: Zap },
    { id: 'about', label: 'About Page', icon: Globe },
    { id: 'careers', label: 'Careers', icon: Briefcase },
    { id: 'blog', label: 'Identity Hub (Blog)', icon: Newspaper },
    { id: 'press', label: 'Press Kit', icon: Type },
    { id: 'contact', label: 'Global Transmissions', icon: MessageSquare },
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

  // --- Reviews State ---
  const { data: reviewData, refetch: refetchReviews } = useQuery(GET_REVIEWS, { skip: activeSection !== 'reviews' });
  const [createReview] = useMutation(CREATE_REVIEW, { onCompleted: () => refetchReviews() });
  const [updateReview] = useMutation(UPDATE_REVIEW, { onCompleted: () => refetchReviews() });
  const [deleteReview] = useMutation(DELETE_REVIEW, { onCompleted: () => refetchReviews() });

  // --- Platform Updates State ---
  const { data: platformUpdateData, refetch: refetchPlatformUpdates } = useQuery(GET_UPDATES, { skip: activeSection !== 'updates' });
  const [createPlatformUpdate] = useMutation(CREATE_UPDATE, { onCompleted: () => refetchPlatformUpdates() });
  const [updatePlatformUpdate] = useMutation(UPDATE_UPDATE, { onCompleted: () => refetchPlatformUpdates() });
  const [deletePlatformUpdate] = useMutation(DELETE_UPDATE, { onCompleted: () => refetchPlatformUpdates() });

  // --- Case Studies State ---
  const { data: caseStudyData, refetch: refetchCaseStudies } = useQuery(GET_CASE_STUDIES, { skip: activeSection !== 'case-studies' });
  const [createCaseStudy] = useMutation(CREATE_CASE_STUDY, { onCompleted: () => refetchCaseStudies() });
  const [updateCaseStudy] = useMutation(UPDATE_CASE_STUDY, { onCompleted: () => refetchCaseStudies() });
  const [deleteCaseStudy] = useMutation(DELETE_CASE_STUDY, { onCompleted: () => refetchCaseStudies() });

  // --- About State ---
  const { data: aboutData, refetch: refetchAbout } = useQuery(GET_ABOUT_SECTIONS, { skip: activeSection !== 'about' });
  const [createAboutSection] = useMutation(CREATE_ABOUT_SECTION, { onCompleted: () => refetchAbout() });
  const [updateAboutSection] = useMutation(UPDATE_ABOUT_SECTION, { onCompleted: () => refetchAbout() });
  const [deleteAboutSection] = useMutation(DELETE_ABOUT_SECTION, { onCompleted: () => refetchAbout() });

  // --- Careers & Perks State ---
  const { data: careerData, refetch: refetchCareers } = useQuery(GET_CAREERS_DATA, { skip: activeSection !== 'careers' });
  const [createJob] = useMutation(CREATE_JOB, { onCompleted: () => refetchCareers() });
  const [updateJob] = useMutation(UPDATE_JOB, { onCompleted: () => refetchCareers() });
  const [deleteJob] = useMutation(DELETE_JOB, { onCompleted: () => refetchCareers() });

  const [createPerk] = useMutation(CREATE_PERK, { onCompleted: () => refetchCareers() });
  const [updatePerk] = useMutation(UPDATE_PERK, { onCompleted: () => refetchCareers() });
  const [deletePerk] = useMutation(DELETE_PERK, { onCompleted: () => refetchCareers() });


  // --- Features Hub State ---
  const { data: featureData, refetch: refetchFeatures } = useQuery(GET_FEATURES, { skip: activeSection !== 'features' });
  const [createFeature] = useMutation(CREATE_FEATURE, { onCompleted: () => refetchFeatures() });
  const [updateFeature] = useMutation(UPDATE_FEATURE, { onCompleted: () => refetchFeatures() });
  const [deleteFeature] = useMutation(DELETE_FEATURE, { onCompleted: () => refetchFeatures() });

  // --- New Module Form States ---
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({ name: '', role: '', company: '', content: '', rating: 5, impact: '', avatar_url: '', is_featured: false });
  const [platformUpdateForm, setPlatformUpdateForm] = useState({ title: '', summary: '', content: '', image_url: '', category: 'ANNOUNCEMENT' });
  const [caseStudyForm, setCaseStudyForm] = useState({ title: '', slug: '', client_name: '', industry: '', summary: '', content: '', results: '', metric: '', metric_label: '', image_url: '', is_featured: false });
  const [aboutForm, setAboutForm] = useState({ title: '', subtitle: '', content: '', image_url: '', icon_name: 'Zap', order_index: 0, section_type: 'GENERAL', is_active: true });
  const [careerForm, setCareerForm] = useState({ title: '', department: '', location: 'Remote', type: 'Full-time', color_code: 'bg-neo-orange', description: '', requirements: '', order_index: 0, is_active: true });
  const [perkForm, setPerkForm] = useState({ title: '', description: '', icon_name: 'Zap', order_index: 0 });
  const [featureForm, setFeatureForm] = useState({ title: '', description: '', icon: 'Zap', color: 'bg-neo-orange', order_index: 0 });

  const resetItems = () => {
    setEditingItemId(null);
    setReviewForm({ name: '', role: '', company: '', content: '', rating: 5, impact: '', avatar_url: '', is_featured: false });
    setPlatformUpdateForm({ title: '', summary: '', content: '', image_url: '', category: 'ANNOUNCEMENT' });
    setCaseStudyForm({ title: '', slug: '', client_name: '', industry: '', summary: '', content: '', results: '', metric: '', metric_label: '', image_url: '', is_featured: false });
    setAboutForm({ title: '', subtitle: '', content: '', image_url: '', icon_name: 'Zap', order_index: 0, section_type: 'GENERAL', is_active: true });
    setCareerForm({ title: '', department: '', location: 'Remote', type: 'Full-time', color_code: 'bg-neo-orange', description: '', requirements: '', order_index: 0, is_active: true });
    setPerkForm({ title: '', description: '', icon_name: 'Zap', order_index: 0 });
    setFeatureForm({ title: '', description: '', icon: 'Zap', color: 'bg-neo-orange', order_index: 0 });
  };

  const handleCreateReview = async () => {
    const toastId = toast.loading(editingItemId ? "RECALIBRATING_REVIEW..." : "PROVISIONING_REVIEW...");
    try {
      if (editingItemId) await updateReview({ variables: { id: editingItemId, input: reviewForm } });
      else await createReview({ variables: { input: reviewForm } });
      toast.success("REVIEW_SYNC_COMPLETE", { id: toastId });
      resetItems();
    } catch (err: any) { toast.error(err.message, { id: toastId }); }
  };

  const handleCreateAbout = async () => {
    const toastId = toast.loading(editingItemId ? "RECALIBRATING_ABOUT..." : "PROVISIONING_ABOUT...");
    try {
      // Forensically strip restricted fields for Registry parity
      const { id, __typename, updated_at, ...cleanInput } = aboutForm as any;
      if (editingItemId) await updateAboutSection({ variables: { id: editingItemId, input: cleanInput } });
      else await createAboutSection({ variables: { input: cleanInput } });
      toast.success("ABOUT_SYNC_COMPLETE", { id: toastId });
      resetItems();
    } catch (err: any) { toast.error(err.message, { id: toastId }); }
  };

  const handleCreatePlatformUpdate = async () => {
    const toastId = toast.loading(editingItemId ? "RECALIBRATING_UPDATE..." : "PROVISIONING_UPDATE...");
    try {
      if (editingItemId) await updatePlatformUpdate({ variables: { id: editingItemId, input: platformUpdateForm } });
      else await createPlatformUpdate({ variables: { input: platformUpdateForm } });
      toast.success("UPDATE_SYNC_COMPLETE", { id: toastId });
      resetItems();
    } catch (err: any) { toast.error(err.message, { id: toastId }); }
  };

  const handleCreateCaseStudy = async () => {
    const toastId = toast.loading(editingItemId ? "RECALIBRATING_CASE_STUDY..." : "PROVISIONING_CASE_STUDY...");
    try {
      if (editingItemId) await updateCaseStudy({ variables: { id: editingItemId, input: caseStudyForm } });
      else await createCaseStudy({ variables: { input: caseStudyForm } });
      toast.success("CASE_STUDY_SYNC_COMPLETE", { id: toastId });
      resetItems();
    } catch (err: any) { toast.error(err.message, { id: toastId }); }
  };
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCreateJob = async () => {
    const toastId = toast.loading(editingItemId ? "RECALIBRATING_JOB..." : "PROVISIONING_JOB...");
    try {
      // Forensically strip restricted fields for Registry parity
      const { id, __typename, posted_at, created_at, ...cleanInput } = careerForm as any;
      if (editingItemId) await updateJob({ variables: { id: editingItemId, input: cleanInput } });
      else await createJob({ variables: { input: cleanInput } });
      toast.success("JOB_SYNC_COMPLETE", { id: toastId });
      resetItems();
    } catch (err: any) { toast.error(err.message, { id: toastId }); }
  };

  const handleCreatePerk = async () => {
    const toastId = toast.loading(editingItemId ? "RECALIBRATING_PERK..." : "PROVISIONING_PERK...");
    try {
      const { id, __typename, ...cleanInput } = perkForm as any;
      if (editingItemId) await updatePerk({ variables: { id: editingItemId, input: cleanInput } });
      else await createPerk({ variables: { input: cleanInput } });
      toast.success("PERK_SYNC_COMPLETE", { id: toastId });
      resetItems();
    } catch (err: any) { toast.error(err.message, { id: toastId }); }
  };


  const handleCreateFeature = async () => {
    const toastId = toast.loading(editingItemId ? "RECALIBRATING_FEATURE..." : "PROVISIONING_FEATURE...");
    try {
      if (editingItemId) await updateFeature({ variables: { id: editingItemId, input: featureForm } });
      else await createFeature({ variables: { input: featureForm } });
      toast.success("FEATURE_SYNC_COMPLETE", { id: toastId });
      resetItems();
    } catch (err: any) { toast.error(err.message, { id: toastId }); }
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

                {/* Modular Navigation Bridge */}
                <div className="flex bg-[var(--bg-panel)] neo-border border-4 p-2 gap-2 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'hero', label: 'Landing Hero', icon: Layout },
                    { id: 'pricing', label: 'Pricing Hub', icon: SettingsIcon },
                    { id: 'changelog', label: 'Updates Hub', icon: Zap },
                    { id: 'reviews', label: 'Customer Reviews', icon: MessageSquare },
                    { id: 'case-studies', label: 'Case Studies', icon: BookOpen },
                    { id: 'about', label: 'About Platform', icon: Info },
                    { id: 'careers', label: 'Careers/Jobs', icon: Briefcase },
                    { id: 'blog', label: 'Insights/Blog', icon: Newspaper },
                    { id: 'press', label: 'Press Registry', icon: Newspaper }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id as any)}
                      className={cn(
                        "flex items-center gap-3 px-6 py-3 font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap",
                        activeSection === item.id
                          ? "bg-neo-orange text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]"
                      )}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </button>
                  ))}
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

              <div className="neo-card border-4 p-8 bg-[var(--bg-panel)] border-[var(--border-main)] space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-neo-orange border-b border-[var(--border-main)] pb-4 italic">Deploy_Feature_Matrix_Node</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <input type="text" placeholder="FEATURE_TITLE" value={featureForm.title} onChange={e => setFeatureForm({ ...featureForm, title: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                  <select value={featureForm.color} onChange={e => setFeatureForm({ ...featureForm, color: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]">
                    <option value="bg-neo-orange">NEO_ORANGE</option>
                    <option value="bg-neo-green">NEO_GREEN</option>
                    <option value="bg-neo-blue">NEO_BLUE</option>
                    <option value="bg-black">INDUSTRIAL_BLACK</option>
                  </select>
                </div>
                <textarea placeholder="FEATURE_DESCRIPTION" value={featureForm.description} onChange={e => setFeatureForm({ ...featureForm, description: e.target.value })} className="w-full neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)] min-h-[100px]" />
                <button onClick={handleCreateFeature} className="w-full neo-button bg-black text-white py-5 font-black uppercase tracking-widest hover:bg-neo-orange transition-colors">{editingItemId ? "RECALIBRATE_FEATURE" : "COMMIT_FEATURE_NODE"}</button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {(featureData?.getFeatures || []).map((item: any) => (
                  <div key={item.id} className="p-10 neo-border flex items-start gap-8 group border-4 bg-[var(--bg-main)] border-[var(--border-main)] hover:border-neo-blue transition-all">
                    <div className={cn("w-16 h-16 neo-border flex items-center justify-center shrink-0 border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", item.color)}>
                      <Zap className="text-white" size={28} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-xl uppercase tracking-tighter text-[var(--text-main)] mb-2">{item.title}</h4>
                      <p className="text-xs font-bold text-[var(--text-muted)] line-clamp-3 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => { setEditingItemId(item.id); setFeatureForm(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-3 border-2 hover:bg-neo-blue/10 border-[var(--border-main)]"><Zap size={14} /></button>
                      <button onClick={() => deleteFeature({ variables: { id: item.id } })} className="p-3 border-2 hover:bg-red-50 text-red-500 border-[var(--border-main)]"><Trash2 size={14} /></button>
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

          {activeSection === 'blog' && (
            <BlogAdmin onBack={onBack} />
          )}

          {/* --- Institutional Header Orchestration --- */}
          {['reviews', 'case-studies', 'about', 'careers', 'blog', 'press', 'changelog'].includes(activeSection) && (
            <div className="flex items-center justify-between mb-8 border-b border-[var(--border-main)] pb-8">
              <div className="flex items-center gap-6">
                <button
                  onClick={onBack}
                  className="w-12 h-12 neo-border flex items-center justify-center border-2 hover:bg-neo-orange hover:text-white transition-all text-[var(--text-muted)]"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="w-16 h-16 neo-border flex items-center justify-center rotate-3 border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-neo-orange">
                  {sections.find(s => s.id === activeSection)?.icon && React.createElement(sections.find(s => s.id === activeSection)!.icon, { size: 32, className: "text-black" })}
                </div>
                <div>
                  <h3 className="text-4xl font-black font-display uppercase tracking-tighter text-[var(--text-main)]">
                    {sections.find(s => s.id === activeSection)?.label}
                  </h3>
                  <p className="text-[10px] font-mono text-neo-orange uppercase tracking-widest mt-1 opacity-80 italic">
                    Registry_Management // Live_Stream
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'reviews' && (
            <div className="space-y-10">
              <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-12">
                  <div className="neo-card border-4 p-8 bg-[var(--bg-panel)] border-[var(--border-main)] space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neo-orange border-b border-[var(--border-main)] pb-4 italic">Deploy_Review_Telemetry</h4>
                    <div className="grid md:grid-cols-4 gap-4">
                      <input type="text" placeholder="CUSTOMER_NAME" value={reviewForm.name} onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                      <input type="text" placeholder="ROLE / TITLE" value={reviewForm.role} onChange={e => setReviewForm({ ...reviewForm, role: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                      <input type="text" placeholder="COMPANY" value={reviewForm.company} onChange={e => setReviewForm({ ...reviewForm, company: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                      <select value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]">
                        {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} STARS</option>)}
                      </select>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <input type="text" placeholder="IMPACT_METRIC (e.g. Yield +40%)" value={reviewForm.impact} onChange={e => setReviewForm({ ...reviewForm, impact: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                      <input type="text" placeholder="AVATAR_IMAGE_URL" value={reviewForm.avatar_url} onChange={e => setReviewForm({ ...reviewForm, avatar_url: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                    </div>
                    <textarea placeholder="REVIEW_CONTENT" value={reviewForm.content} onChange={e => setReviewForm({ ...reviewForm, content: e.target.value })} className="w-full neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)] min-h-[120px]" />
                    <button onClick={handleCreateReview} className="w-full neo-button bg-black text-white py-5 font-black uppercase tracking-widest hover:bg-neo-orange transition-colors">{editingItemId ? "RECALIBRATE_REVIEW" : "COMMIT_REVIEW"}</button>
                  </div>
                </div>
                <div className="lg:col-span-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(reviewData?.getReviews || []).map((item: any) => (
                    <div key={item.id} className="neo-card border-2 p-6 bg-white flex justify-between items-center group hover:border-neo-orange transition-all">
                      <div>
                        <p className="font-black text-xs uppercase text-neo-orange">{item.name}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-500">{item.role} @ {item.company}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingItemId(item.id); setReviewForm(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-3 border hover:bg-slate-100"><Zap size={14} /></button>
                        <button onClick={() => deleteReview({ variables: { id: item.id } })} className="p-3 border hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'changelog' && (
            <ChangelogAdmin />
          )}

          {activeSection === 'case-studies' && (
            <div className="space-y-10">
              <div className="neo-card border-4 p-8 bg-[var(--bg-panel)] border-[var(--border-main)] space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-neo-orange border-b border-[var(--border-main)] pb-4 italic">Deploy_Case_Study_Forensics</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <input type="text" placeholder="TITLE" value={caseStudyForm.title} onChange={e => setCaseStudyForm({ ...caseStudyForm, title: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                  <input type="text" placeholder="SLUG" value={caseStudyForm.slug} onChange={e => setCaseStudyForm({ ...caseStudyForm, slug: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                  <input type="text" placeholder="CLIENT" value={caseStudyForm.client_name} onChange={e => setCaseStudyForm({ ...caseStudyForm, client_name: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                  <input type="text" placeholder="STRATEGIC_INDUSTRY" value={caseStudyForm.industry} onChange={e => setCaseStudyForm({ ...caseStudyForm, industry: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <input type="text" placeholder="METRIC_VALUE (e.g. 400M+)" value={caseStudyForm.metric} onChange={e => setCaseStudyForm({ ...caseStudyForm, metric: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                  <input type="text" placeholder="METRIC_LABEL (e.g. Transactions)" value={caseStudyForm.metric_label} onChange={e => setCaseStudyForm({ ...caseStudyForm, metric_label: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                  <input type="text" placeholder="IMAGE_URL" value={caseStudyForm.image_url} onChange={e => setCaseStudyForm({ ...caseStudyForm, image_url: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                </div>
                <textarea placeholder="TECHNICAL_CONTENT (Markdown_Residency)" value={caseStudyForm.content} onChange={e => setCaseStudyForm({ ...caseStudyForm, content: e.target.value })} className="w-full neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)] min-h-[200px]" />
                <button onClick={handleCreateCaseStudy} className="w-full neo-button bg-black text-white py-5 font-black uppercase tracking-widest">{editingItemId ? "RECALIBRATE_STUDY" : "COMMIT_CASE_STUDY"}</button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {(caseStudyData?.getCaseStudies || []).map((item: any) => (
                  <div key={item.id} className="neo-card border-2 p-6 bg-white flex justify-between items-center group hover:border-neo-orange transition-all">
                    <div><p className="font-black text-xs uppercase text-neo-orange">{item.title}</p><p className="text-[10px] uppercase font-bold text-slate-500">{item.client_name}</p></div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingItemId(item.id); setCaseStudyForm(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-3 border hover:bg-slate-100"><Zap size={14} /></button>
                      <button onClick={() => deleteCaseStudy({ variables: { id: item.id } })} className="p-3 border hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'careers' && (
            <div className="space-y-12">
              <div className="grid lg:grid-cols-2 gap-10">
                {/* Job Slot Terminal */}
                <div className="space-y-6">
                  <div className="neo-card border-4 p-8 bg-[var(--bg-panel)] border-[var(--border-main)] space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neo-orange border-b border-[var(--border-main)] pb-4 italic">Deploy_Job_Recruitment_Slot</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="JOB_TITLE" value={careerForm.title} onChange={e => setCareerForm({ ...careerForm, title: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                      <input type="text" placeholder="DEPARTMENT" value={careerForm.department} onChange={e => setCareerForm({ ...careerForm, department: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                      <input type="text" placeholder="LOCATION" value={careerForm.location} onChange={e => setCareerForm({ ...careerForm, location: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                      <select value={careerForm.type} onChange={e => setCareerForm({ ...careerForm, type: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)] font-mono">
                        <option value="Full-time">FULL_TIME</option>
                        <option value="Contract">CONTRACT</option>
                        <option value="Remote">REMOTE_ONLY</option>
                        <option value="Hybrid">HYBRID</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <select value={careerForm.color_code} onChange={e => setCareerForm({ ...careerForm, color_code: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]">
                        <option value="bg-neo-orange">BULLET_ORANGE</option>
                        <option value="bg-neo-blue">BULLET_BLUE</option>
                        <option value="bg-neo-green">BULLET_GREEN</option>
                        <option value="bg-yellow-400">BULLET_YELLOW</option>
                        <option value="bg-purple-400">BULLET_PURPLE</option>
                      </select>
                      <input type="number" placeholder="ORDER" value={careerForm.order_index} onChange={e => setCareerForm({ ...careerForm, order_index: parseInt(e.target.value) })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                    </div>
                    <textarea placeholder="JOB_DESCRIPTION" value={careerForm.description} onChange={e => setCareerForm({ ...careerForm, description: e.target.value })} className="w-full neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)] min-h-[120px]" />
                    <button onClick={handleCreateJob} className="w-full neo-button bg-black text-white py-5 font-black uppercase tracking-widest hover:bg-neo-orange transition-colors">{editingItemId ? "RECALIBRATE_POSITION" : "COMMIT_JOB_OPENING"}</button>
                  </div>

                  <div className="space-y-4">
                    {(careerData?.getOpenPositions || []).map((item: any) => (
                      <div key={item.id} className="neo-card border-2 p-6 bg-[var(--bg-main)] border-[var(--border-main)] flex justify-between items-center group hover:border-neo-orange transition-all">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-3 h-3 rounded-full", item.color_code)} />
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-xs uppercase text-neo-orange">{item.title}</p>
                            <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">{item.department} // {item.location}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 ml-4">
                          <button onClick={() => { setEditingItemId(item.id); setCareerForm(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-3 border hover:bg-[var(--bg-panel)] text-neo-orange"><Zap size={18} /></button>
                          <button onClick={() => deleteJob({ variables: { id: item.id } })} className="p-3 border hover:bg-red-50 text-red-500"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Culture Perks Terminal */}
                <div className="space-y-6">
                  <div className="neo-card border-4 p-8 bg-[var(--bg-panel)] border-[var(--border-main)] space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neo-blue border-b border-[var(--border-main)] pb-4 italic">Commit_Vanguard_Ethos_Perk</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="PERK_TITLE" value={perkForm.title} onChange={e => setPerkForm({ ...perkForm, title: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                      <select value={perkForm.icon_name} onChange={e => setPerkForm({ ...perkForm, icon_name: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]">
                        {['Globe', 'Zap', 'ShieldCheck', 'Rocket', 'Cpu', 'Users', 'Target', 'Activity'].map(icon => <option key={icon} value={icon}>{icon.toUpperCase()}_ICON</option>)}
                      </select>
                    </div>
                    <textarea placeholder="PERK_DESCRIPTION" value={perkForm.description} onChange={e => setPerkForm({ ...perkForm, description: e.target.value })} className="w-full neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)] min-h-[120px]" />
                    <button onClick={handleCreatePerk} className="w-full neo-button bg-neo-blue text-white py-5 font-black uppercase tracking-widest hover:bg-black transition-colors">{editingItemId ? "RECALIBRATE_ETHOS" : "COMMIT_PERK_NODE"}</button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {(careerData?.getJobPerks || []).map((item: any) => (
                      <div key={item.id} className="neo-card border-2 p-6 bg-[var(--bg-main)] border-[var(--border-main)] flex justify-between items-center group hover:border-neo-blue transition-all">
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-xs uppercase text-neo-blue truncate">{item.title}</p>
                          <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] truncate">{item.description}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 ml-4">
                          <button onClick={() => { setEditingItemId(item.id); setPerkForm(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-3 border hover:bg-[var(--bg-panel)] text-neo-blue"><Edit3 size={18} /></button>
                          <button onClick={() => deletePerk({ variables: { id: item.id } })} className="p-3 border hover:bg-red-50 text-red-500"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'about' && (
            <div className="space-y-10">
              <div className="neo-card border-4 p-8 bg-[var(--bg-panel)] border-[var(--border-main)] space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-neo-orange border-b border-[var(--border-main)] pb-4 italic">Commit_Institutional_Section</h4>
                <div className="grid md:grid-cols-4 gap-4">
                  <select value={aboutForm.section_type} onChange={e => setAboutForm({ ...aboutForm, section_type: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]">
                    <option value="TIMELINE">HISTORY_TIMELINE</option>
                    <option value="TEAM">TREDPOS_TEAM</option>
                    <option value="HERO">HERO_BANNER</option>
                    <option value="VALUE">CORE_VALUE</option>
                    <option value="GENERAL">GENERAL_MANIFESTO</option>
                  </select>
                  <input type="text" placeholder={aboutForm.section_type === 'TEAM' ? "MEMBER_NAME" : "SECTION_TITLE"} value={aboutForm.title} onChange={e => setAboutForm({ ...aboutForm, title: e.target.value })} className="md:col-span-2 neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                  <input type="number" placeholder="ORDER" value={aboutForm.order_index} onChange={e => setAboutForm({ ...aboutForm, order_index: parseInt(e.target.value) })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={aboutForm.section_type === 'TEAM' ? "MEMBER_ROLE" : aboutForm.section_type === 'TIMELINE' ? "MILESTONE_YEAR" : "SUBTITLE / LABEL"}
                    value={aboutForm.subtitle}
                    onChange={e => setAboutForm({ ...aboutForm, subtitle: e.target.value })}
                    className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]"
                  />
                  {aboutForm.section_type === 'TEAM' || aboutForm.section_type === 'HERO' ? (
                    <input type="text" placeholder="IMAGE_URL" value={aboutForm.image_url} onChange={e => setAboutForm({ ...aboutForm, image_url: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]" />
                  ) : (
                    <select value={aboutForm.icon_name} onChange={e => setAboutForm({ ...aboutForm, icon_name: e.target.value })} className="neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)]">
                      {['Zap', 'Shield', 'Target', 'History', 'Globe', 'Cpu', 'BarChart', 'Users'].map(icon => <option key={icon} value={icon}>{icon.toUpperCase()}_ICON</option>)}
                    </select>
                  )}
                </div>

                <textarea
                  placeholder={aboutForm.section_type === 'TEAM' ? "MEMBER_BIO_MANIFESTO" : "SECTION_CONTENT_BODY"}
                  value={aboutForm.content}
                  onChange={e => setAboutForm({ ...aboutForm, content: e.target.value })}
                  className="w-full neo-border py-4 px-5 font-black text-xs bg-[var(--bg-main)] min-h-[120px]"
                />
                <button onClick={handleCreateAbout} className="w-full neo-button bg-black text-white py-5 font-black uppercase tracking-widest hover:bg-neo-orange transition-colors">
                  {editingItemId ? "RECALIBRATE_ABOUT_NODE" : "COMMIT_ABOUT_NODE"}
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(aboutData?.getAboutSections || []).map((item: any) => (
                  <div key={item.id} className="neo-card border-4 p-8 bg-[var(--bg-main)] border-[var(--border-main)] relative group hover:border-neo-orange transition-colors">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingItemId(item.id); setAboutForm(item); }} className="p-2 border-2 border-[var(--border-main)] hover:bg-neo-orange/10"><Edit3 size={14} /></button>
                      <button onClick={() => deleteAboutSection({ variables: { id: item.id } })} className="p-2 border-2 border-[var(--border-main)] hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                    </div>
                    <div className="inline-block px-2 py-0.5 bg-black text-white text-[8px] font-black uppercase mb-4">{item.section_type}</div>
                    <h4 className="font-black text-lg uppercase tracking-tight mb-2">{item.title}</h4>
                    {item.subtitle && <p className="text-[10px] font-black uppercase text-neo-orange mb-4 italic">{item.subtitle}</p>}
                    <p className="text-[10px] font-bold text-[var(--text-muted)] line-clamp-3">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'press' && (
            <PressAdmin />
          )}

          {activeSection === 'contact' && (
            <ContactAdmin />
          )}
        </div>
      </div>
    </div>
  );
}
