import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Search, 
  Folder, 
  FileText, 
  ChevronRight, 
  X,
  HelpCircle,
  Terminal,
  ShieldCheck,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { 
  GET_KB_CATEGORIES, 
  GET_KB_ARTICLES, 
  UPSERT_KB_CATEGORY, 
  DELETE_KB_CATEGORY, 
  UPSERT_KB_ARTICLE, 
  DELETE_KB_ARTICLE 
} from '../../gql/website';

// Forensic Glyphs
const GLYPH_PLUS = "[ADD_NODE]";
const GLYPH_SAVE = "[COMMIT]";
const GLYPH_DEL = "[PURGE]";
const GLYPH_X = "[X]";

type KBType = 'HELP' | 'API' | 'SECURITY';

export default function HelpCenterAdmin() {
  const [activeType, setActiveType] = useState<KBType>('HELP');
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'ARTICLES'>('CATEGORIES');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Queries
  const { data: catData, loading: catLoading, refetch: refetchCats } = useQuery(GET_KB_CATEGORIES, {
    variables: { type: activeType }
  });
  
  const { data: artData, loading: artLoading, refetch: refetchArts } = useQuery(GET_KB_ARTICLES, {
    variables: { type: activeType }
  });

  // Mutations
  const [upsertCat, { loading: savingCat }] = useMutation(UPSERT_KB_CATEGORY, {
    onCompleted: () => refetchCats()
  });
  const [deleteCat] = useMutation(DELETE_KB_CATEGORY, {
    onCompleted: () => refetchCats()
  });
  const [upsertArt, { loading: savingArt }] = useMutation(UPSERT_KB_ARTICLE, {
    onCompleted: () => refetchArts()
  });
  const [deleteArt] = useMutation(DELETE_KB_ARTICLE, {
    onCompleted: () => refetchArts()
  });

  // Editor State
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [editingArt, setEditingArt] = useState<any | null>(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isArtModalOpen, setIsArtModalOpen] = useState(false);

  const categories = catData?.getKBCategories || [];
  const articles = artData?.getKBArticles || [];

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("SYNCING_CATEGORY_NODE...");
    try {
      await upsertCat({
        variables: {
          input: {
            id: editingCat.id,
            name: editingCat.name,
            slug: editingCat.slug,
            type: activeType,
            icon_name: editingCat.icon_name || 'HelpCircle',
            order_index: parseInt(editingCat.order_index || 0)
          }
        }
      });
      toast.success("CATEGORY_NODE_COMMITTED", { id: toastId });
      setIsCatModalOpen(false);
      setEditingCat(null);
    } catch (err: any) {
      toast.error(`COMMIT_FAILURE: ${err.message}`, { id: toastId });
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("SYNCING_ARTICLE_PAYLOAD...");
    try {
      await upsertArt({
        variables: {
          input: {
            id: editingArt.id,
            category_id: editingArt.category_id,
            title: editingArt.title,
            slug: editingArt.slug,
            content: editingArt.content,
            excerpt: editingArt.excerpt,
            kb_type: activeType,
            icon_name: editingArt.icon_name || 'FileText',
            order_index: parseInt(editingArt.order_index || 0),
            is_active: editingArt.is_active !== false
          }
        }
      });
      toast.success("ARTICLE_PAYLOAD_COMMITTED", { id: toastId });
      setIsArtModalOpen(false);
      setEditingArt(null);
    } catch (err: any) {
      toast.error(`COMMIT_FAILURE: ${err.message}`, { id: toastId });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("PURGE_CATEGORY_NODE? ALL_ASSOCIATED_ARTICLES_WILL_BECOME_ORPHANS.")) return;
    try {
      await deleteCat({ variables: { id } });
      toast.success("CATEGORY_PURGED");
    } catch (err: any) {
      toast.error(`PURGE_FAILED: ${err.message}`);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("PURGE_ARTICLE_PAYLOAD?")) return;
    try {
      await deleteArt({ variables: { id } });
      toast.success("ARTICLE_PURGED");
    } catch (err: any) {
      toast.error(`PURGE_FAILED: ${err.message}`);
    }
  };

  const getTypeColor = (type: KBType) => {
    switch (type) {
      case 'HELP': return 'text-neo-blue border-neo-blue';
      case 'API': return 'text-black border-black';
      case 'SECURITY': return 'text-neo-green border-neo-green';
    }
  };

  const getKBIcon = (type: KBType) => {
    switch (type) {
      case 'HELP': return <HelpCircle size={20} />;
      case 'API': return <Terminal size={20} />;
      case 'SECURITY': return <ShieldCheck size={20} />;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-32 text-[var(--text-main)]">
      
      {/* 🔮 Mode Selector */}
      <section className="flex flex-wrap gap-4">
        {(['HELP', 'API', 'SECURITY'] as KBType[]).map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`neo-button px-10 py-5 font-black uppercase italic text-xl flex items-center gap-4 transition-all ${
              activeType === type 
                ? 'bg-black text-white shadow-[8px_8px_0px_0px_rgba(255,107,0,1)]' 
                : 'bg-[var(--bg-panel)] text-[var(--text-main)] border-4 border-[var(--border-main)]'
            }`}
          >
            {getKBIcon(type)}
            {type}_REGISTRY
          </button>
        ))}
      </section>

      {/* ⚡ Secondary Routing */}
      <section className="flex border-b-4 border-[var(--border-main)]">
        {(['CATEGORIES', 'ARTICLES'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-12 py-6 text-sm font-black uppercase tracking-[0.3em] italic transition-all relative ${
              activeTab === tab 
                ? 'text-neo-orange' 
                : 'opacity-40 hover:opacity-100'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTab" 
                className="absolute bottom-0 left-0 w-full h-1 bg-neo-orange" 
              />
            )}
          </button>
        ))}
      </section>

      {/* 📊 Content Management Terminal */}
      <AnimatePresence mode="wait">
        {activeTab === 'CATEGORIES' ? (
          <motion.div
            key="categories-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase tracking-widest italic">{activeType}_STRUCTURE_NODES</h3>
              <button 
                onClick={() => { setEditingCat({}); setIsCatModalOpen(true); }}
                className="neo-button bg-neo-green text-black font-black uppercase px-8 py-3 flex items-center gap-2 border-4 border-black"
              >
                <Plus size={18} /> {GLYPH_PLUS} CATEGORY
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catLoading ? (
                <div className="col-span-full py-24 text-center border-4 border-dashed border-[var(--border-main)]">
                  <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : categories.length === 0 ? (
                <div className="col-span-full py-24 text-center border-4 border-dashed border-[var(--border-main)] opacity-50">
                   <p className="font-black uppercase tracking-widest">NO_NODES_PROVISIONED</p>
                </div>
              ) : (
                categories.map((cat: any) => (
                  <div 
                    key={cat.id}
                    className="neo-card bg-[var(--bg-panel)] border-4 border-[var(--border-main)] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] group overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-2 h-full bg-[var(--border-main)] opacity-10 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 neo-border bg-black text-white flex items-center justify-center">
                        <Folder size={24} />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setEditingCat(cat); setIsCatModalOpen(true); }}
                          className="w-10 h-10 neo-border hover:bg-neo-blue hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="w-10 h-10 neo-border hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-2xl font-black uppercase font-display italic leading-none mb-2">{cat.name}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">SLUG: {cat.slug}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic mt-1">ORDER: {cat.order_index}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="articles-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <h3 className="text-2xl font-black uppercase tracking-widest italic">{activeType}_ARTICLE_PAYLOADS</h3>
              <div className="flex w-full sm:w-auto gap-4">
                 <div className="relative flex-1 sm:w-64">
                   <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                   <input 
                    type="text" 
                    placeholder="FILTER_PAYLOADS..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full neo-border bg-[var(--bg-main)] py-3 pl-12 pr-4 font-black uppercase text-xs outline-none focus:bg-[var(--bg-panel)]"
                   />
                 </div>
                 <button 
                  onClick={() => { setEditingArt({}); setIsArtModalOpen(true); }}
                  className="neo-button bg-neo-green text-black font-black uppercase px-8 py-3 flex items-center gap-2 border-4 border-black"
                >
                  <Plus size={18} /> {GLYPH_PLUS} ARTICLE
                </button>
              </div>
            </div>

            <div className="neo-card bg-[var(--bg-panel)] border-4 border-[var(--border-main)] overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-[var(--bg-main)] border-b-4 border-[var(--border-main)]">
                    <tr>
                      <th className="p-6 text-xs font-black uppercase tracking-widest">PAYLOAD_IDENTITY</th>
                      <th className="p-6 text-xs font-black uppercase tracking-widest">CATEGORY</th>
                      <th className="p-6 text-xs font-black uppercase tracking-widest">STATUS</th>
                      <th className="p-6 text-xs font-black uppercase tracking-widest text-right">OPERATIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[var(--border-main)]">
                    {artLoading ? (
                      <tr>
                        <td colSpan={4} className="p-24 text-center">
                          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                        </td>
                      </tr>
                    ) : articles.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-24 text-center opacity-40 font-black uppercase tracking-widest text-sm">
                           NO_PAYLOADS_LOCALIZED_IN_STREAM
                        </td>
                      </tr>
                    ) : (
                      articles.filter((a: any) => a.title.toLowerCase().includes(searchQuery.toLowerCase())).map((art: any) => (
                        <tr key={art.id} className="hover:bg-cream transition-colors">
                          <td className="p-6">
                            <h5 className="font-black uppercase text-lg italic tracking-tight">{art.title}</h5>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">SLUG: {art.slug}</span>
                          </td>
                          <td className="p-6">
                            <span className="px-3 py-1 bg-neo-blue/10 text-neo-blue text-[10px] font-black uppercase tracking-widest border border-neo-blue/30">
                              {art.category?.name || 'ORPHAN_NODE'}
                            </span>
                          </td>
                          <td className="p-6">
                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${art.is_active ? 'bg-neo-green/20 text-neo-green' : 'bg-red-500/20 text-red-500'}`}>
                              {art.is_active ? 'ACTIVE' : 'DECOMMISSIONED'}
                            </span>
                          </td>
                          <td className="p-6 text-right space-x-2">
                             <button 
                              onClick={() => { setEditingArt(art); setIsArtModalOpen(true); }}
                              className="w-10 h-10 neo-border hover:bg-neo-blue hover:text-white inline-flex items-center justify-center transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                             >
                                <Edit size={16} />
                             </button>
                             <button 
                              onClick={() => handleDeleteArticle(art.id)}
                              className="w-10 h-10 neo-border hover:bg-red-500 hover:text-white inline-flex items-center justify-center transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                             >
                                <Trash2 size={16} />
                             </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
               </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧩 Category Modal */}
      <AnimatePresence>
        {isCatModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xl bg-[var(--bg-panel)] border-4 border-[var(--border-main)] p-10 relative shadow-[20px_20px_0px_0px_rgba(0,0,0,0.5)]"
            >
              <button 
                onClick={() => { setIsCatModalOpen(false); setEditingCat(null); }}
                className="absolute -top-4 -right-4 w-10 h-10 bg-black text-white flex items-center justify-center border-4 border-white"
              >
                 {GLYPH_X}
              </button>
              <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-10 border-b-4 border-black pb-4">
                PROVISION_CATEGORY_NODE
              </h3>
              <form onSubmit={handleSaveCategory} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50">NODE_NAME</label>
                    <input 
                      required
                      value={editingCat?.name || ''} 
                      onChange={e => setEditingCat({...editingCat, name: e.target.value})}
                      className="w-full neo-border p-4 font-black uppercase text-sm bg-[var(--bg-main)] outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50">NODE_SLUG</label>
                    <input 
                      required
                      value={editingCat?.slug || ''} 
                      onChange={e => setEditingCat({...editingCat, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                      className="w-full neo-border p-4 font-black uppercase text-sm bg-[var(--bg-main)] outline-none" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50">GLYPH_IDENTIFIER</label>
                    <input 
                      value={editingCat?.icon_name || ''} 
                      onChange={e => setEditingCat({...editingCat, icon_name: e.target.value})}
                      className="w-full neo-border p-4 font-black uppercase text-sm bg-[var(--bg-main)] outline-none" 
                      placeholder="e.g. HelpCircle"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50">SEQUENCE_INDEX</label>
                    <input 
                      type="number"
                      value={editingCat?.order_index || 0} 
                      onChange={e => setEditingCat({...editingCat, order_index: e.target.value})}
                      className="w-full neo-border p-4 font-black uppercase text-sm bg-[var(--bg-main)] outline-none" 
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={savingCat}
                  className="w-full neo-button bg-black text-white font-black uppercase py-6 text-xl mt-6 italic shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                  {savingCat ? "SYNCING..." : GLYPH_SAVE + " NODE"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📄 Article Modal */}
      <AnimatePresence>
        {isArtModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-5xl bg-[var(--bg-panel)] border-4 border-[var(--border-main)] p-10 relative shadow-[30px_30px_0px_0px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <button 
                onClick={() => { setIsArtModalOpen(false); setEditingArt(null); }}
                className="absolute top-6 right-6 w-10 h-10 bg-black text-white flex items-center justify-center border-4 border-white"
              >
                 {GLYPH_X}
              </button>
              <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-10 border-b-4 border-black pb-4">
                ENCODE_ARTICLE_PAYLOAD
              </h3>
              
              <form onSubmit={handleSaveArticle} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-50">PAYLOAD_TITLE</label>
                      <input 
                        required
                        value={editingArt?.title || ''} 
                        onChange={e => setEditingArt({...editingArt, title: e.target.value})}
                        className="w-full neo-border p-5 font-black uppercase text-lg bg-[var(--bg-main)] outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-50">STRUCTURAL_PARENT</label>
                      <select 
                        required
                        value={editingArt?.category_id || ''} 
                        onChange={e => setEditingArt({...editingArt, category_id: e.target.value})}
                        className="w-full neo-border p-5 font-black uppercase text-sm bg-[var(--bg-main)] outline-none" 
                      >
                         <option value="">SELECT_NODE</option>
                         {categories.map((c: any) => (
                           <option key={c.id} value={c.id}>{c.name}</option>
                         ))}
                      </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-50">IDENTIFIER_SLUG</label>
                      <input 
                        required
                        value={editingArt?.slug || ''} 
                        onChange={e => setEditingArt({...editingArt, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                        className="w-full neo-border p-4 font-black uppercase text-sm bg-[var(--bg-main)] outline-none" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest opacity-50">SEQUENCE</label>
                          <input 
                            type="number"
                            value={editingArt?.order_index || 0} 
                            onChange={e => setEditingArt({...editingArt, order_index: e.target.value})}
                            className="w-full neo-border p-4 font-black uppercase text-sm bg-[var(--bg-main)] outline-none" 
                          />
                       </div>
                       <div className="space-y-2 flex flex-col pt-6">
                          <label className="flex items-center gap-4 cursor-pointer">
                             <input 
                              type="checkbox"
                              checked={editingArt?.is_active !== false}
                              onChange={e => setEditingArt({...editingArt, is_active: e.target.checked})}
                              className="w-6 h-6 neo-border bg-black appearance-none checked:bg-neo-green transition-colors cursor-pointer"
                             />
                             <span className="text-[10px] font-black uppercase tracking-widest">ACTIVE_STATUS</span>
                          </label>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50">ABSTRACT_EXCERPT</label>
                    <textarea 
                      value={editingArt?.excerpt || ''} 
                      onChange={e => setEditingArt({...editingArt, excerpt: e.target.value})}
                      className="w-full neo-border p-4 font-bold text-sm bg-[var(--bg-main)] outline-none h-24 no-scrollbar" 
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50">PRIMARY_PAYLOAD_CONTENT</label>
                    <textarea 
                      required
                      value={editingArt?.content || ''} 
                      onChange={e => setEditingArt({...editingArt, content: e.target.value})}
                      className="w-full neo-border p-6 font-mono text-sm bg-[var(--bg-main)] outline-none h-80 no-scrollbar leading-relaxed" 
                      placeholder="ENTER_TRANSMISSION_DATA..."
                    />
                 </div>

                 <div className="flex gap-6 pt-6 sticky bottom-0 bg-[var(--bg-panel)] py-4 border-t-4 border-black">
                    <button 
                      type="button"
                      onClick={() => { setIsArtModalOpen(false); setEditingArt(null); }}
                      className="flex-1 neo-button bg-[var(--bg-panel)] text-black font-black uppercase py-5 border-4 border-black"
                    >
                      ABORT_MISSION
                    </button>
                    <button 
                      type="submit"
                      disabled={savingArt}
                      className="flex-[2] neo-button bg-black text-white font-black uppercase py-5 text-xl italic shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                    >
                      {savingArt ? "ENCODING..." : GLYPH_SAVE + " PAYLOAD"}
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
