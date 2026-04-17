import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery } from '@apollo/client';
import { 
  Search, 
  Book, 
  Terminal, 
  ShieldCheck, 
  Zap, 
  FileText, 
  HelpCircle, 
  ChevronRight, 
  ArrowRight,
  Monitor,
  Database,
  Lock,
  Cpu,
  Globe,
  Layout,
  MessageSquare,
  Key as KeyIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { GET_KB_CATEGORIES, GET_KB_ARTICLES } from '../gql/website';

// Icon Map for dynamic lookup
const ICON_MAP: Record<string, any> = {
  Search, Book, Terminal, ShieldCheck, Zap, FileText, HelpCircle, 
  Monitor, Database, Lock, Cpu, Globe, Layout, MessageSquare, Key: KeyIcon
};

interface KnowledgeBaseProps {
  type: 'help' | 'api' | 'security';
}

export default function KnowledgeBase({ type }: KnowledgeBaseProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const kbType = type.toUpperCase();

  const config = {
    help: {
      title: "HELP CENTER",
      subtitle: "Institutional Knowledge Base",
      heroBg: "bg-neo-blue",
    },
    api: {
      title: "API DOCS",
      subtitle: "Vanguard Developer Portal",
      heroBg: "bg-black",
    },
    security: {
      title: "SECURITY",
      subtitle: "Trust & Compliance Registry",
      heroBg: "bg-neo-green",
    }
  };

  const current = config[type];

  // Queries
  const { data: catData, loading: catLoading } = useQuery(GET_KB_CATEGORIES, {
    variables: { type: kbType }
  });
  
  const { data: artData, loading: artLoading } = useQuery(GET_KB_ARTICLES, {
    variables: { type: kbType, categoryId: activeCategoryId }
  });

  const categories = catData?.getKBCategories || [];
  const articles = artData?.getKBArticles || [];

  const filteredArticles = useMemo(() => {
    if (!searchTerm) return articles;
    return articles.filter((art: any) => 
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      art.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [articles, searchTerm]);

  const getIcon = (name: string) => ICON_MAP[name] || FileText;

  return (
     <div className="pt-20 overflow-hidden text-balance">
      {/* Hero Section */}
      <section className={cn("relative py-16 sm:py-32 text-white border-b-4 border-black overflow-hidden px-4 sm:px-6 lg:px-8", current.heroBg)}>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="inline-block px-4 py-1 bg-white text-black neo-border mb-8 -rotate-1">
              <span className="text-xs font-black uppercase tracking-widest italic">{current.subtitle}</span>
            </div>
             <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[110px] font-black leading-none mb-8 font-display uppercase tracking-tighter italic">
              {current.title.split(' ')[0]} <br />
              <span className="text-white underline decoration-4 sm:decoration-8 underline-offset-4 sm:underline-offset-8 decoration-neo-orange italic">{current.title.split(' ')[1] || ''}</span>
            </h1>
             <div className="max-w-2xl relative w-full">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 sm:p-5 bg-white neo-border text-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-4 flex-1">
                  <Search size={24} className="opacity-40 shrink-0" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={`Search ${current.title.toLowerCase()}...`} 
                    className="bg-transparent font-black text-lg sm:text-xl outline-none flex-1 uppercase tracking-tight" 
                  />
                </div>
                <button className="neo-button bg-neo-orange text-white py-3 sm:py-2 px-6 text-sm font-black italic">Search</button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-12">
             {/* Sidebar Categories */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest opacity-40 mb-6 sm:mb-8 italic">Categories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <button
                  onClick={() => setActiveCategoryId(null)}
                  className={cn(
                    "w-full text-left p-6 neo-border transition-all font-black uppercase text-xs tracking-widest flex items-center justify-between group",
                    activeCategoryId === null ? "bg-black text-white" : "bg-cream hover:bg-neo-blue hover:text-white"
                  )}
                >
                  All Blueprints
                  <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </button>
                {catLoading ? (
                  <div className="p-12 text-center opacity-40">
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : categories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={cn(
                      "w-full text-left p-6 neo-border transition-all font-black uppercase text-xs tracking-widest flex items-center justify-between group",
                      activeCategoryId === cat.id ? "bg-black text-white" : "bg-cream hover:bg-neo-blue hover:text-white"
                    )}
                  >
                    {cat.name}
                    <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                ))}
              </div>
              
              <div className="mt-8 sm:mt-12 p-6 sm:p-8 neo-border bg-black text-white sm:rotate-2">
                <h4 className="text-xl font-black font-display uppercase italic mb-4">Direct Help</h4>
                <p className="text-sm font-bold opacity-60 mb-6 leading-snug">Can't find what you need? Connect with a vanguard strategist directly.</p>
                <button className="w-full neo-button bg-neo-orange text-white py-4 text-xs font-black uppercase">Start Signal</button>
              </div>
            </div>

             {/* Article Grid */}
            <div className="lg:col-span-3 space-y-12">
              <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 min-h-[400px]">
                {artLoading ? (
                  <div className="col-span-full flex items-center justify-center p-32">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredArticles.length === 0 ? (
                  <div className="col-span-full p-24 text-center neo-border border-dashed opacity-50 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black mb-4">[X]</span>
                    <p className="font-black uppercase tracking-widest">No matching payloads identified</p>
                  </div>
                ) : (
                  filteredArticles.map((art: any, i: number) => {
                    const Icon = getIcon(art.icon_name);
                    return (
                      <motion.div
                        key={art.title}
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="p-6 sm:p-10 neo-border bg-white hover:bg-cream transition-colors group cursor-pointer shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 overflow-hidden"
                      >
                        <div className="w-14 h-14 bg-neo-orange neo-border flex items-center justify-center mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform shrink-0">
                          <Icon size={28} />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black font-display uppercase italic mb-4 leading-none line-clamp-2">{art.title}</h3>
                        <p className="text-sm sm:text-base font-bold opacity-60 leading-snug mb-8 line-clamp-3">{art.excerpt}</p>
                        <div className="flex items-center gap-2 text-neo-blue font-black uppercase text-[10px] tracking-widest group-hover:gap-4 transition-all">
                          Read Blueprint <ArrowRight size={14} />
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Documentation Placeholder */}
              <div className="p-8 sm:p-16 neo-border bg-cream/50 relative overflow-hidden group">
                <div className="relative z-10">
                  <h2 className="text-2xl sm:text-4xl font-black font-display uppercase italic mb-6">INTEGRATION HUB</h2>
                  <p className="text-lg sm:text-xl font-bold opacity-60 max-w-2xl leading-snug mb-10">
                    The TredPOS architecture is designed for multi-layered institutional integration. Explore our developer toolkits and security standard registries.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button className="w-full sm:w-auto neo-button bg-black text-white py-5 px-10 text-xl font-black uppercase italic hover:bg-neo-blue transition-colors">Launch Portal</button>
                    <button className="w-full sm:w-auto neo-button bg-white text-black py-5 px-10 text-xl font-black uppercase italic hover:bg-cream transition-colors">View SDKs</button>
                  </div>
                </div>
                <div className="absolute top-10 right-10 opacity-5 group-hover:rotate-12 transition-transform">
                  <Terminal size={200} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
