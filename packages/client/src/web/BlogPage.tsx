import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_BLOG_POSTS } from '../gql/website';
import { 
  Zap, 
  Clock, 
  User, 
  Tag, 
  ChevronRight, 
  BarChart3, 
  ShieldCheck, 
  Globe, 
  Cpu, 
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '../lib/utils';
import LogoLoader from '../components/LogoLoader';

export default function BlogPage() {
  const navigate = useNavigate();
  const { data, loading } = useQuery(GET_BLOG_POSTS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ["All", "Architecture", "Engineering", "Strategy", "Security", "Institutional"];

  const posts = data?.getBlogPosts || [];

  const filteredPosts = posts.filter((post: any) => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <LogoLoader status="SYNCHRONIZING_MANIFESTO" />;

  return (
     <div className="pt-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-32 bg-cream border-b-4 border-black overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <div className="inline-block px-4 py-1 bg-neo-blue neo-border mb-8 rotate-[-1deg]">
              <span className="text-xs font-black uppercase tracking-widest text-white italic">Intelligence & Vanguards</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[110px] font-black leading-[0.85] mb-8 font-display uppercase tracking-tighter">
              THE <span className="text-neo-orange">TRED</span> <br />
              MANIFESTO
            </h1>
            <p className="hidden sm:block text-xl sm:text-2xl font-bold max-w-2xl mx-auto leading-tight opacity-70">
              Technical deep-dives, institutional strategies, and the latest from the frontline of retail OS engineering.
            </p>
          </motion.div>
        </div>
        <div className="absolute top-20 right-10 w-64 h-64 border-4 border-black rotate-12 opacity-5 pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-neo-blue opacity-10 -rotate-12 pointer-events-none rounded-full" />
      </section>

      {/* Filter & Search Bar */}
      <section className="py-12 bg-white border-b-4 border-black sticky top-[84px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 justify-center md:justify-start">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "neo-button px-6 py-2 text-xs font-black uppercase tracking-widest transition-all",
                    activeCategory === cat ? "bg-black text-white" : "bg-white text-black hover:bg-cream"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 p-3 bg-cream neo-border w-full md:w-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <Search size={20} className="opacity-40" />
              <input 
                type="text" 
                placeholder="Search Manifesto..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent font-bold outline-none flex-1 md:w-64" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-20">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post: any, i: number) => (
                <motion.article
                  layout
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                >
                  <div className="relative mb-10 neo-border overflow-hidden rotate-[-1deg] group-hover:rotate-0 transition-transform shadow-[12px_12px_0px_0px_rgba(255,107,0,1)] hover:shadow-none hover:translate-x-3 hover:translate-y-3 transition-all duration-300">
                    <img 
                      src={post.image_url || `https://picsum.photos/seed/${post.id}/800/600`} 
                      alt={post.title} 
                      className="w-full aspect-video object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                    />
                    <div className={cn("absolute top-6 left-6 px-4 py-1 neo-border text-[10px] font-black uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-neo-orange")}>
                      {post.category || 'VANGUARD'}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-6 text-xs font-black uppercase tracking-widest opacity-40">
                      <span className="flex items-center gap-2 italic"><Clock size={14} /> {new Date(post.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-2 italic"><User size={14} /> {post.author}</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black font-display uppercase tracking-tighter leading-none italic group-hover:text-neo-orange transition-colors">{post.title}</h2>
                    <p className="hidden sm:block text-lg sm:text-xl font-bold opacity-60 leading-snug group-hover:opacity-100 transition-opacity">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-black font-black uppercase text-xs tracking-widest group-hover:gap-8 transition-all group-hover:text-neo-orange group-hover:italic underline decoration-2 underline-offset-4">
                      Read Blueprint <ArrowRight size={18} />
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
            {filteredPosts.length === 0 && (
              <div className="col-span-2 py-20 text-center neo-border bg-cream">
                <p className="text-2xl font-black uppercase italic opacity-40">Zero_Signal_Detected</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-32 bg-neo-blue text-white border-y-4 border-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl sm:text-6xl md:text-8xl font-black font-display uppercase italic tracking-tighter leading-none mb-10">SIGNAL <br /> <span className="text-neo-orange">RECEIVER</span></h2>
              <p className="text-xl sm:text-2xl font-bold opacity-70 leading-tight">Join 25,000+ institutional vanguards receiving our weekly architectural intelligence updates.</p>
            </div>
            <div className="relative">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="email"
                  placeholder="vanguard@organization.com"
                  className="flex-1 neo-border py-6 px-8 font-bold bg-white text-black text-xl outline-none focus:bg-cream transition-colors"
                />
                <button className="neo-button bg-neo-orange text-white text-xl py-6 px-12 italic shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                  Subscribe
                </button>
              </div>
              <p className="mt-6 text-xs font-black uppercase tracking-widest opacity-40 italic">Zero telemetry. Professional Signal Only.</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-white/5 skew-y-12 translate-y-20 pointer-events-none" />
      </section>
    </div>
  );
}
