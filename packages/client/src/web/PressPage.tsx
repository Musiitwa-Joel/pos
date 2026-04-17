import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery } from '@apollo/client';
import { GET_PRESS_RELEASES } from '../gql/website';
import { 
  Zap, 
  Calendar, 
  ArrowRight,
  Search,
  ExternalLink,
  Radio
} from 'lucide-react';
import { cn } from '../lib/utils';
import LogoLoader from '../components/LogoLoader';

export default function PressPage() {
  const { data, loading } = useQuery(GET_PRESS_RELEASES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPress, setSelectedPress] = useState<any | null>(null);

  const pressItems = data?.getPressReleases || [];

  const filteredPress = pressItems.filter((item: any) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatForensicDate = (dateStr: any) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(isNaN(Number(dateStr)) ? dateStr : Number(dateStr));
      if (isNaN(date.getTime())) return "INVALID_TIME";
      return date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).toUpperCase();
    } catch (e) {
      return "N/A";
    }
  };

  if (loading) return <LogoLoader status="SYNCHRONIZING_MEDIA_NODES" />;

  return (
     <div className="pt-20 bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 border-b-4 border-black overflow-hidden bg-cream">
        <div className="absolute top-10 right-10 w-64 h-64 border-8 border-neo-orange rotate-12 opacity-20 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-neo-orange opacity-10 -rotate-12 pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center gap-8">
             <div className="flex items-center gap-3">
                <div className="inline-block px-8 py-2 bg-neo-orange text-black border-2 border-black rotate-[-2deg] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase tracking-widest">
                   Press_Registry // Global
                </div>
             </div>
             <h1 className="text-6xl md:text-8xl lg:text-[120px] font-black uppercase tracking-tighter leading-[0.85] text-black italic">
                Media <span className="text-neo-orange">&</span> Radar
             </h1>
             <p className="max-w-3xl text-xl md:text-2xl font-bold text-black opacity-70 leading-relaxed mt-2">
                Official press coverage, media assets, and institutional transmissions broadcasting our progress in retail engineering.
             </p>
          </div>
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </section>

      {/* Filter / Search Horizon */}
      <section className="py-8 bg-white border-b-4 border-black sticky top-[84px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4">
              <span className="w-4 h-4 bg-neo-orange rounded-full animate-pulse border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
              <span className="font-mono text-xs font-black uppercase tracking-widest text-black">Live_Signal: {pressItems.length} Nodes</span>
           </div>
           
           <div className="flex items-center gap-4 p-4 bg-white neo-border w-full md:w-auto shadow-[6px_6px_0px_0px_rgba(255,107,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
             <Search size={22} className="text-neo-orange" />
             <input 
               type="text" 
               placeholder="Scan Registry..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="bg-transparent font-bold outline-none flex-1 md:w-64" 
             />
           </div>
        </div>
      </section>

      {/* Registry Database */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
             <AnimatePresence mode="popLayout">
               {filteredPress.map((item: any, i: number) => (
                 <motion.article
                   layout
                   key={item.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ delay: i * 0.05 }}
                   className="group relative flex flex-col"
                 >
                   <div 
                     onClick={() => setSelectedPress(item)}
                     className="neo-card border-4 border-black p-8 h-full flex flex-col bg-white hover:bg-black transition-all shadow-[12px_12px_0px_0px_rgba(255,107,0,1)] hover:shadow-none hover:translate-x-3 hover:translate-y-3 cursor-pointer group relative overflow-hidden"
                   >
                     {/* Decorative Card Accent */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-neo-orange opacity-0 group-hover:opacity-10 transition-opacity rounded-bl-[100px] pointer-events-none" />

                     <div className="flex justify-between items-start mb-8 relative z-10">
                       <span className="px-4 py-1.5 bg-neo-orange text-black border-2 border-black font-black text-[10px] uppercase tracking-widest rotate-[-2deg] group-hover:bg-white group-hover:!text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none group-hover:translate-x-0.5 group-hover:translate-y-0.5">
                         {item.source || 'MEDIA'}
                       </span>
                       <ExternalLink size={24} className="opacity-40 group-hover:!text-neo-orange group-hover:opacity-100 transition-colors text-black" />
                     </div>
                     
                     <h2 className="text-3xl font-black font-display uppercase tracking-tighter leading-[0.9] mb-4 relative z-10 text-black group-hover:!text-neo-orange transition-colors">
                       {item.title}
                     </h2>
                     
                     <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest opacity-60 mb-6 font-mono relative z-10 text-black group-hover:!text-white">
                       <Calendar size={14} className="text-neo-orange" /> {formatForensicDate(item.published_date || item.created_at)}
                     </div>
                     
                     <p className="font-bold text-sm md:text-base leading-relaxed opacity-80 group-hover:opacity-100 flex-1 line-clamp-4 relative z-10 text-black group-hover:!text-white transition-colors">
                       {item.excerpt}
                     </p>
                     
                     <div className="mt-8 pt-6 border-t-2 border-black/10 group-hover:border-white/20 flex items-center gap-3 font-black uppercase text-xs tracking-widest relative z-10 text-black group-hover:!text-neo-orange transition-colors">
                       INSPECT_NODE <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                     </div>
                   </div>
                 </motion.article>
               ))}
             </AnimatePresence>

             {filteredPress.length === 0 && (
               <div className="col-span-full py-20 border-4 border-dashed border-black/20 text-center bg-cream">
                 <p className="text-2xl font-black uppercase italic opacity-40">Zero_Signal_Detected</p>
                 <p className="text-xs font-bold opacity-30 mt-2 uppercase">Try adjusting your radar frequency.</p>
               </div>
             )}
           </div>
        </div>
      </section>

      {/* Press Kit Contact */}
      <section className="py-24 bg-cream text-black border-y-4 border-black relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
           <Zap size={48} className="mx-auto mb-8 text-neo-orange opacity-80" />
           <h2 className="text-5xl md:text-7xl font-black uppercase font-display tracking-tighter italic mb-6">Need Internal Assets?</h2>
           <p className="text-xl font-bold opacity-70 mb-10">For press inquiries, brand assets, and verified logos, contact our institutional relations team.</p>
           <a href="mailto:press@tredpos.com" className="inline-flex neo-button bg-black text-white border-4 border-black py-4 px-10 text-xl font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(255,107,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
             press@tredpos.com
           </a>
        </div>
        <div className="absolute inset-0 bg-white opacity-40 rotate-6 scale-150 pointer-events-none" />
      </section>

      {/* Interactive Press Modal */}
      <AnimatePresence>
        {selectedPress && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPress(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto neo-card bg-cream border-4 border-black p-8 md:p-12 shadow-[20px_20px_0px_0px_rgba(255,107,0,1)] flex flex-col"
            >
              <div className="absolute top-6 right-6">
                <button 
                  onClick={() => setSelectedPress(null)}
                  className="w-12 h-12 bg-black text-white hover:bg-neo-orange hover:text-black flex items-center justify-center border-4 border-black transition-colors"
                >
                  <span className="font-black text-xl">X</span>
                </button>
              </div>

              <div className="flex gap-4 items-center mb-8 pr-16 border-b-4 border-black pb-8">
                <span className="px-4 py-2 bg-neo-orange text-black border-2 border-black font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]">
                  {selectedPress.source || 'MEDIA'}
                </span>
                <span className="font-mono text-xs font-black tracking-widest text-black opacity-60">
                  {formatForensicDate(selectedPress.published_date || selectedPress.created_at)}
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tighter leading-[0.85] mb-8 text-black italic">
                {selectedPress.title}
              </h2>

              <div className="flex-1">
                <p className="text-lg md:text-xl font-bold leading-relaxed text-black opacity-90 whitespace-pre-line">
                  {selectedPress.excerpt}
                </p>
              </div>

              <div className="mt-12 pt-8 border-t-4 border-black flex flex-col sm:flex-row gap-6 items-center">
                <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] opacity-40 text-center sm:text-left">
                  EXTERNAL_TRANSMISSION // {selectedPress.source?.toUpperCase() || 'NET'}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
     </div>
  );
}
