import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import {
  GET_BLOG_POSTS,
  CREATE_BLOG_POST,
  UPDATE_BLOG_POST,
  DELETE_BLOG_POST
} from '../../gql/website';
import { cn } from '../../lib/utils';

// Forensic_Glyphs (Icon Bypass)
const GLYPH_EDIT = "[EDIT]";
const GLYPH_DEL = "[DEL]";
const GLYPH_GO = ">>";
const GLYPH_WARN = "[!]";
const GLYPH_X = "[X]";
const GLYPH_DRAFT = "[DRAFT]";
const GLYPH_LIVE = "[LIVE]";

export default function BlogAdmin({ onBack }: { onBack?: () => void }) {
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    author: '',
    category: '',
    excerpt: '',
    content: '',
    image_url: '',
    is_draft: true
  });

  const { data: blogData, loading: loadingPosts, refetch: refetchPosts } = useQuery(GET_BLOG_POSTS);

  const [createPost] = useMutation(CREATE_BLOG_POST, {
    refetchQueries: [{ query: GET_BLOG_POSTS }]
  });
  const [updatePost] = useMutation(UPDATE_BLOG_POST, {
    refetchQueries: [{ query: GET_BLOG_POSTS }]
  });
  const [deletePost] = useMutation(DELETE_BLOG_POST, {
    refetchQueries: [{ query: GET_BLOG_POSTS }]
  });

  const handleSavePost = async () => {
    if (!postForm.title || !postForm.content || !postForm.slug) {
      toast.error("TELEMETRY_INCOMPLETE: Article specs required.");
      return;
    }

    const toastId = toast.loading(editingPostId ? 'RECALIBRATING_ARTICLE...' : 'PROVISIONING_PUBLICATION...');

    try {
      const { ...cleanInput } = postForm;
      
      if (editingPostId) {
        await updatePost({
          variables: {
            id: editingPostId,
            input: cleanInput
          }
        });
        toast.success("CORE_SYNC_SUCCESS: Article recalibrated.", { id: toastId });
      } else {
        await createPost({ variables: { input: cleanInput } });
        toast.success("CORE_SYNC_SUCCESS: Article successfully deployed.", { id: toastId });
      }

      setEditingPostId(null);
      setPostForm({
        title: '',
        slug: '',
        author: '',
        category: '',
        excerpt: '',
        content: '',
        image_url: '',
        is_draft: true
      });
      refetchPosts();
    } catch (err: any) {
      toast.error(`CORE_FAILURE: ${err.message}`, { id: toastId });
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPostId(post.id);
    setPostForm({
      title: post.title,
      slug: post.slug,
      author: post.author || '',
      category: post.category || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      image_url: post.image_url || '',
      is_draft: post.is_draft
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);

  const handleDeletePost = async () => {
    if (!nodeToDelete) return;
    const toastId = toast.loading("DECOMMISSIONING_NODE...");
    try {
      await deletePost({ variables: { id: nodeToDelete } });
      toast.success("NODE_DECOMMISSIONED", { id: toastId });
      setIsModalOpen(false);
      setNodeToDelete(null);
    } catch (err: any) {
      toast.error("DECOMMISSION_ERROR", { id: toastId });
    }
  };

  const formatForensicDate = (dateStr: any) => {
    if (!dateStr) return "PENDING_DEPLOYMENT";
    try {
      const date = new Date(isNaN(Number(dateStr)) ? dateStr : Number(dateStr));
      if (isNaN(date.getTime())) return "INVALID_TERMINAL_TIME";
      return date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).toUpperCase();
    } catch (e) {
      return "PARSING_ERROR";
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-32 text-[var(--text-main)]">
      {/* 🛠️ Blog Publication Terminal */}
      <section className="relative">
        <div className="absolute -top-6 left-10 z-20 px-4 py-1 bg-[var(--text-main)] text-[var(--bg-panel)] text-[9px] font-black uppercase tracking-[0.4em] rotate-[-1deg]">
          Blog_Terminal // HUB_5.1
        </div>

        <div className="neo-card border-4 border-[var(--border-main)] bg-[var(--bg-panel)] shadow-[24px_24px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[24px_24px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="min-h-[700px]">

            {/* 📝 Editor Blade */}
            <div className="p-8 md:p-12 space-y-10 bg-[var(--bg-main)]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 neo-border flex items-center justify-center bg-neo-blue rotate-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-xl font-black text-white select-none">[B]</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">
                      {editingPostId ? "Refine_Insight" : "Provision_Publication"}
                    </h3>
                    <p className="text-[10px] font-mono font-black text-neo-blue uppercase tracking-widest mt-1 opacity-60">
                      {editingPostId ? `ID_REF: ${editingPostId}` : "STANDBY_FOR_INPUT"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setPostForm({ ...postForm, is_draft: !postForm.is_draft })}
                    className={cn(
                      "px-6 py-4 font-black text-[10px] uppercase tracking-widest border-4 transition-all",
                      postForm.is_draft 
                        ? "bg-[var(--bg-panel)] border-[var(--border-main)] text-[var(--text-secondary)]"
                        : "bg-neo-green border-[var(--border-main)] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    )}
                  >
                    {postForm.is_draft ? GLYPH_DRAFT : GLYPH_LIVE}
                  </button>
                  <button
                    onClick={handleSavePost}
                    className="neo-button bg-black text-white py-4 px-10 flex items-center gap-4 text-xs font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(59,130,246,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    <span className="font-mono text-neo-blue">{GLYPH_GO}</span>
                    {editingPostId ? "Push Update" : "Deploy Insight"}
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Article_Headline</label>
                    <input
                      type="text"
                      value={postForm.title}
                      onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                      className="w-full neo-border py-4 px-6 font-black text-xl bg-[var(--bg-panel)] text-[var(--text-main)] border-4 border-[var(--border-main)] focus:border-neo-blue transition-all uppercase placeholder:[var(--text-secondary)]/30"
                      placeholder="ENTER_CORE_HEADLINE"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Registry_Slug</label>
                    <input
                      type="text"
                      value={postForm.slug}
                      onChange={e => setPostForm({ ...postForm, slug: e.target.value })}
                      className="w-full neo-border py-4 px-6 font-mono text-xl bg-[var(--bg-panel)] text-neo-blue border-4 border-[var(--border-main)] focus:border-neo-blue transition-all lowercase placeholder:[var(--text-secondary)]/30"
                      placeholder="article-slug-path"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                   <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Author_ID</label>
                    <input
                      type="text"
                      value={postForm.author}
                      onChange={e => setPostForm({ ...postForm, author: e.target.value })}
                      className="w-full neo-border py-4 px-6 font-black text-xs bg-[var(--bg-panel)] text-[var(--text-main)] border-4 border-[var(--border-main)] focus:border-neo-blue"
                      placeholder="AUTHOR_NAME"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Focus_Category</label>
                    <select
                      value={postForm.category}
                      onChange={e => setPostForm({ ...postForm, category: e.target.value })}
                      className="w-full neo-border py-4 px-6 font-black text-xs bg-[var(--bg-panel)] text-[var(--text-main)] border-4 border-[var(--border-main)] focus:border-neo-blue"
                    >
                      <option value="">SELECT_CATEGORY</option>
                      {['ARCHITECTURE', 'ENGINEERING', 'STRATEGY', 'SECURITY', 'INSTITUTIONAL'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Asset_Link (Image)</label>
                    <input
                      type="text"
                      value={postForm.image_url}
                      onChange={e => setPostForm({ ...postForm, image_url: e.target.value })}
                      className="w-full neo-border py-4 px-6 font-mono text-xs bg-[var(--bg-panel)] text-[var(--text-main)] border-4 border-[var(--border-main)] focus:border-neo-blue"
                      placeholder="https://assets.tredpos.com/..."
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Executive_Summary (Excerpt)</label>
                  <textarea
                    value={postForm.excerpt}
                    onChange={e => setPostForm({ ...postForm, excerpt: e.target.value })}
                    className="w-full neo-border p-6 font-bold text-sm border-4 border-[var(--border-main)] bg-[var(--bg-main)] text-[var(--text-main)] min-h-[100px] focus:outline-none focus:border-neo-blue"
                    placeholder="Brief manifesto of the investigation..."
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Insight_Payload (Markdown)</label>
                    <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-neo-blue rounded-full animate-pulse" />
                       <span className="text-[9px] font-mono text-neo-blue font-bold uppercase tracking-widest">Compiler_Active</span>
                    </div>
                  </div>
                  <textarea
                    value={postForm.content}
                    onChange={e => setPostForm({ ...postForm, content: e.target.value })}
                    className="w-full neo-border p-8 font-mono text-sm border-4 border-[var(--border-main)] bg-[var(--bg-main)] text-[var(--text-main)] min-h-[500px] focus:outline-none focus:border-neo-blue leading-relaxed"
                    placeholder="# Article_Title&#10;&#10;## Analysis_Section_01&#10;- Bullet_Point_Forensics..."
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 📜 Publication Stream */}
      <section className="space-y-10 px-4 md:px-0">
        <div className="flex items-center gap-8">
          <div className="w-12 h-12 neo-border bg-black flex items-center justify-center">
            <span className="text-white font-black">#</span>
          </div>
          <h3 className="text-4xl font-black uppercase tracking-tighter italic">Publication_Stream</h3>
          <div className="h-0.5 flex-1 bg-black/10" />
          <p className="text-[10px] font-mono font-black uppercase tracking-[0.3em] opacity-40">Global_Identity_Logs</p>
        </div>

        {loadingPosts ? (
          <div className="py-24 text-center space-y-6">
            <div className="w-16 h-16 border-4 border-neo-blue border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 animate-pulse">Syncing_Publication_Registry...</p>
          </div>
        ) : (
          <>
          {/* 🔍 Discovery & Filtering Horizon */}
          <section className="bg-[var(--bg-panel)] border-4 border-[var(--border-main)] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col md:flex-row gap-8 items-end justify-between">
              <div className="flex flex-col md:flex-row gap-8 flex-1">
                <div className="space-y-3 flex-1">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Filter_By_Category</label>
                  <select
                    id="blog-filter-category"
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="w-full neo-border py-4 px-6 font-black text-xs bg-[var(--bg-main)] text-[var(--text-main)] border-4 border-[var(--border-main)] focus:border-neo-blue transition-all"
                  >
                    <option value="ALL">ALL_CATEGORIES</option>
                    {['ARCHITECTURE', 'ENGINEERING', 'STRATEGY', 'SECURITY', 'INSTITUTIONAL'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3 flex-1">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Publication_Status</label>
                  <select
                    id="blog-filter-status"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="w-full neo-border py-4 px-6 font-black text-xs bg-[var(--bg-main)] text-[var(--text-main)] border-4 border-[var(--border-main)] focus:border-neo-blue transition-all"
                  >
                    <option value="ALL">ALL_STATUSES</option>
                    <option value="LIVE">LIVE_ONLY</option>
                    <option value="DRAFT">DRAFTS_ONLY</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-neo-blue/5 border-2 border-neo-blue/20 px-6 py-4 flex items-center gap-4">
                <span className="text-[10px] font-mono font-black text-neo-blue uppercase tracking-widest">Active_Insight_Nodes:</span>
                <span className="text-2xl font-black text-neo-blue">{blogData?.getBlogPosts?.length || 0}</span>
              </div>
            </div>
          </section>

          {/* 📡 Article Node Grid */}
          <div id="blog-posts-grid" className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {(blogData?.getBlogPosts || [])
              .filter((post: any) => filterCategory === 'ALL' || post.category === filterCategory)
              .filter((post: any) => {
                if (filterStatus === 'ALL') return true;
                if (filterStatus === 'LIVE') return !post.is_draft;
                if (filterStatus === 'DRAFT') return post.is_draft;
                return true;
              })
              .map((post: any) => {
                return (
                <div key={post.id} className="group relative neo-card border-4 border-[var(--border-main)] p-8 bg-[var(--bg-panel)] hover:bg-[var(--bg-main)] transition-all flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
                   <div className="flex justify-between items-start mb-6">
                    <div className="px-2 py-0.5 bg-black text-white text-[9px] font-black uppercase rounded-sm">
                      {post.category || 'GENERAL'}
                    </div>
                    <div className={cn(
                      "px-2 py-0.5 text-[9px] font-black uppercase rounded-sm border-2",
                      post.is_draft ? "border-amber-500 text-amber-500" : "border-neo-green text-neo-green"
                    )}>
                      {post.is_draft ? "DRAFT" : "LIVE"}
                    </div>
                  </div>

                  <h4 className="text-2xl font-black uppercase tracking-tighter mb-4 line-clamp-2 leading-[0.9] group-hover:text-neo-blue transition-colors">
                    {post.title}
                  </h4>

                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-6 border-b border-[var(--border-main)]/10 pb-4">
                    {post.author} // {formatForensicDate(post.published_at || post.created_at)}
                  </p>

                  <div className="flex-1 overflow-hidden opacity-60">
                    <p className="text-xs font-bold leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-black/10 flex gap-4">
                    <button
                      onClick={() => handleEditPost(post)}
                      className="flex-1 neo-button bg-[var(--bg-panel)] text-[var(--text-main)] py-3 text-[10px] font-black uppercase tracking-widest border-2 border-[var(--border-main)] hover:bg-neo-blue hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none"
                    >
                      {GLYPH_EDIT}
                    </button>
                    <button
                      onClick={() => { setNodeToDelete(post.id); setIsModalOpen(true); }}
                      className="w-14 h-12 neo-button bg-[var(--bg-panel)] text-red-500 flex items-center justify-center border-2 border-[var(--border-main)] hover:bg-red-500 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none font-black text-[10px]"
                    >
                      {GLYPH_DEL}
                    </button>
                  </div>
                </div>
              );
            })}

            {blogData?.getBlogPosts?.length === 0 && (
              <div className="col-span-full py-32 border-4 border-dashed border-black/5 flex flex-col items-center justify-center gap-6 text-black/20">
                <span className="text-6xl font-black">[X]</span>
                <p className="text-xl font-black uppercase tracking-[0.5em]">No Publication Data Detected</p>
              </div>
            )}
          </div>
          </>
        )}
      </section>

      {/* 🛡️ Decommission Confirmation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[var(--bg-panel)] border-4 border-[var(--border-main)] p-10 shadow-[20px_20px_0px_0px_rgba(59,130,246,0.4)]"
            >
              <div className="absolute -top-4 -right-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 bg-[var(--text-main)] text-[var(--bg-panel)] flex items-center justify-center border-4 border-[var(--border-main)] hover:bg-neo-blue transition-colors"
                >
                  <span className="font-black">{GLYPH_X}</span>
                </button>
              </div>

              <div className="flex flex-col items-center text-center space-y-8">
                <div className="w-20 h-20 bg-red-500/10 border-4 border-red-500 flex items-center justify-center rotate-3 shadow-[6px_6px_0px_0px_rgba(239,68,68,0.2)]">
                  <span className="text-4xl font-black text-red-500">{GLYPH_WARN}</span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic text-[var(--text-main)]">Confirm_Purge</h3>
                  <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed">
                    You are about to decommission a <span className="text-red-500">Publication_Node</span>. This action is irreversible and will remove the insight from the global hub.
                  </p>
                </div>

                <div className="w-full flex gap-4 pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 neo-button bg-[var(--bg-panel)] text-[var(--text-main)] py-4 font-black uppercase tracking-widest border-4 border-[var(--border-main)] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none transition-all"
                  >
                    Abort
                  </button>
                  <button
                    onClick={handleDeletePost}
                    className="flex-1 neo-button bg-red-500 text-white py-4 font-black uppercase tracking-widest border-4 border-[var(--border-main)] shadow-[6px_6px_0px_0px_rgba(239,68,68,0.3)] hover:shadow-none transition-all"
                  >
                    Decommission
                  </button>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-[var(--border-main)]/10 text-center">
                <p className="text-[9px] font-mono font-black text-[var(--text-secondary)]/30 uppercase tracking-[0.5em]">TredPOS // Secure_Insight_Purge</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
