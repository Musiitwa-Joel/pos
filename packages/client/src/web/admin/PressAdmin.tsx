import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import {
  GET_PRESS_RELEASES,
  CREATE_PRESS_RELEASE,
  UPDATE_PRESS_RELEASE,
  DELETE_PRESS_RELEASE
} from '../../gql/website';
import { cn } from '../../lib/utils';

// Forensic_Glyphs (Icon Bypass)
const GLYPH_EDIT = "[EDIT]";
const GLYPH_DEL = "[DEL]";
const GLYPH_GO = ">>";
const GLYPH_WARN = "[!]";
const GLYPH_X = "[X]";

export default function PressAdmin() {
  const [editingPressId, setEditingPressId] = useState<string | null>(null);
  const [pressForm, setPressForm] = useState({
    title: '',
    source: '',
    link: '',
    excerpt: '',
    published_date: ''
  });

  const { data: pressData, loading: loadingPress, refetch: refetchPress } = useQuery(GET_PRESS_RELEASES);

  const [createPress] = useMutation(CREATE_PRESS_RELEASE, {
    refetchQueries: [{ query: GET_PRESS_RELEASES }]
  });
  const [updatePress] = useMutation(UPDATE_PRESS_RELEASE, {
    refetchQueries: [{ query: GET_PRESS_RELEASES }]
  });
  const [deletePress] = useMutation(DELETE_PRESS_RELEASE, {
    refetchQueries: [{ query: GET_PRESS_RELEASES }]
  });

  const handleSavePress = async () => {
    if (!pressForm.title || !pressForm.source || !pressForm.link) {
      toast.error("TELEMETRY_INCOMPLETE: Press specs required (Title, Source, Link).");
      return;
    }

    const toastId = toast.loading(editingPressId ? 'RECALIBRATING_PRESS...' : 'PROVISIONING_PRESS...');

    try {
      const { ...cleanInput } = pressForm;

      // Forensic Date Normalization for MySQL Registry
      if (cleanInput.published_date) {
        const pd = cleanInput.published_date;
        const time = isNaN(Number(pd)) ? new Date(pd) : new Date(Number(pd));
        if (!isNaN(time.getTime())) {
          // Format as YYYY-MM-DD HH:mm:ss for strict MySQL parity, or just YYYY-MM-DD if DATE column
          cleanInput.published_date = time.toISOString().split('T')[0];
        } else {
          toast.error("TELEMETRY_ERROR: Invalid chronometer sequence (Date format).");
          return;
        }
      }

      if (editingPressId) {
        await updatePress({
          variables: {
            id: editingPressId,
            input: cleanInput
          }
        });
        toast.success("CORE_SYNC_SUCCESS: Press Release recalibrated.", { id: toastId });
      } else {
        await createPress({ variables: { input: cleanInput } });
        toast.success("CORE_SYNC_SUCCESS: Press Release successfully deployed.", { id: toastId });
      }

      setEditingPressId(null);
      setPressForm({
        title: '',
        source: '',
        link: '',
        excerpt: '',
        published_date: ''
      });
      refetchPress();
    } catch (err: any) {
      toast.error(`CORE_FAILURE: ${err.message}`, { id: toastId });
    }
  };

  const handleEditPress = (pressItem: any) => {
    setEditingPressId(pressItem.id);

    // Format the date for the text input nicely if it's a numeric timestamp
    let formattedDate = pressItem.published_date || '';
    if (formattedDate) {
      const time = isNaN(Number(formattedDate)) ? new Date(formattedDate) : new Date(Number(formattedDate));
      if (!isNaN(time.getTime())) {
        formattedDate = time.toISOString().split('T')[0];
      }
    }

    setPressForm({
      title: pressItem.title,
      source: pressItem.source || '',
      link: pressItem.link || '',
      excerpt: pressItem.excerpt || '',
      published_date: formattedDate
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);

  const handleDeletePress = async () => {
    if (!nodeToDelete) return;
    const toastId = toast.loading("DECOMMISSIONING_NODE...");
    try {
      await deletePress({ variables: { id: nodeToDelete } });
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
      {/* 🛠️ Press Kit Terminal */}
      <section className="relative">
        <div className="absolute -top-6 left-10 z-20 px-4 py-1 bg-[var(--text-main)] text-[var(--bg-panel)] text-[9px] font-black uppercase tracking-[0.4em] rotate-[-1deg]">
          Press_Terminal // PK_4.2
        </div>

        <div className="neo-card border-4 border-[var(--border-main)] bg-[var(--bg-panel)] shadow-[24px_24px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[24px_24px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="min-h-[500px]">

            {/* 📝 Editor Blade */}
            <div className="p-8 md:p-12 space-y-10 bg-[var(--bg-main)]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 neo-border flex items-center justify-center bg-[var(--text-main)] rotate-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-xl font-black text-[var(--bg-panel)] select-none">[P]</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">
                      {editingPressId ? "Refine_Release" : "Provision_Release"}
                    </h3>
                    <p className="text-[10px] font-mono font-black text-[var(--text-main)] uppercase tracking-widest mt-1 opacity-60">
                      {editingPressId ? `ID_REF: ${editingPressId}` : "STANDBY_FOR_INPUT"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSavePress}
                  className="neo-button bg-black text-white py-4 px-10 flex items-center gap-4 text-xs font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  <span className="font-mono text-white">{GLYPH_GO}</span>
                  {editingPressId ? "Push Update" : "Deploy Release"}
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Release_Headline</label>
                  <input
                    type="text"
                    value={pressForm.title}
                    onChange={e => setPressForm({ ...pressForm, title: e.target.value })}
                    className="w-full neo-border py-4 px-6 font-black text-xl bg-[var(--bg-panel)] text-[var(--text-main)] border-4 border-[var(--border-main)] focus:border-[var(--text-main)] transition-all uppercase placeholder:[var(--text-secondary)]/30"
                    placeholder="ENTER_PRESS_RELEASE_HEADLINE"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Media_Source</label>
                     <input
                       type="text"
                       value={pressForm.source}
                       onChange={e => setPressForm({ ...pressForm, source: e.target.value })}
                       className="w-full neo-border py-4 px-6 font-black text-xs bg-[var(--bg-panel)] text-[var(--text-main)] border-4 border-[var(--border-main)] focus:border-[var(--text-main)] uppercase"
                       placeholder="TECH_CRUNCH"
                     />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Hyperlink_URL</label>
                    <input
                      type="text"
                      value={pressForm.link}
                      onChange={e => setPressForm({ ...pressForm, link: e.target.value })}
                      className="w-full neo-border py-4 px-6 font-mono text-xs bg-[var(--bg-panel)] text-[var(--text-main)] border-4 border-[var(--border-main)] focus:border-[var(--text-main)]"
                      placeholder="https://techcrunch.com/article..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Publication_Date</label>
                    <input
                      type="text"
                      value={pressForm.published_date}
                      onChange={e => setPressForm({ ...pressForm, published_date: e.target.value })}
                      className="w-full neo-border py-4 px-6 font-mono text-xs bg-[var(--bg-panel)] text-[var(--text-main)] border-4 border-[var(--border-main)] focus:border-[var(--text-main)]"
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Executive_Excerpt</label>
                  <textarea
                    value={pressForm.excerpt}
                    onChange={e => setPressForm({ ...pressForm, excerpt: e.target.value })}
                    className="w-full neo-border p-6 font-bold text-sm border-4 border-[var(--border-main)] bg-[var(--bg-panel)] text-[var(--text-main)] min-h-[150px] focus:outline-none focus:border-[var(--text-main)]"
                    placeholder="Brief manifesto of the press coverage..."
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 📜 Kit Stream */}
      <section className="space-y-10 px-4 md:px-0">
        <div className="flex items-center gap-8">
          <div className="w-12 h-12 neo-border bg-black flex items-center justify-center">
             <span className="text-white font-black">#</span>
          </div>
          <h3 className="text-4xl font-black uppercase tracking-tighter italic">Press_Kit_Stream</h3>
          <div className="h-0.5 flex-1 bg-black/10" />
          <p className="text-[10px] font-mono font-black uppercase tracking-[0.3em] opacity-40">Global_Media_Logs</p>
        </div>

        {loadingPress ? (
           <div className="py-24 text-center space-y-6">
              <div className="w-16 h-16 border-4 border-[var(--text-main)] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 animate-pulse">Syncing_Media_Registry...</p>
           </div>
        ) : (
          <div id="press-posts-grid" className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {(pressData?.getPressReleases || []).map((pressItem: any, index: number) => {
                return (
                 <div key={pressItem.id} className="group relative neo-card border-4 border-[var(--border-main)] p-8 bg-[var(--bg-panel)] hover:bg-[var(--bg-main)] transition-all flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
                   <div className="flex justify-between items-start mb-6">
                    <div className="px-2 py-0.5 bg-[var(--text-main)] text-[var(--bg-panel)] text-[9px] font-black uppercase rounded-sm">
                      {pressItem.source || 'EXTERNAL_MEDIA'}
                    </div>
                    <div className="px-3 py-1 bg-black text-white text-[9px] font-black">
                      #{pressData.getPressReleases.length - index}
                    </div>
                  </div>

                  <h4 className="text-2xl font-black uppercase tracking-tighter mb-4 line-clamp-2 leading-[0.9] transition-colors">
                    {pressItem.title}
                  </h4>

                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-6 border-b border-[var(--border-main)]/10 pb-4">
                    {formatForensicDate(pressItem.published_date || pressItem.created_at)}
                  </p>

                  <div className="flex-1 overflow-hidden opacity-60">
                    <p className="text-xs font-bold leading-relaxed line-clamp-3">
                      {pressItem.excerpt}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-black/10 flex gap-4">
                    <button
                      onClick={() => handleEditPress(pressItem)}
                      className="flex-1 neo-button bg-[var(--bg-panel)] text-[var(--text-main)] py-3 text-[10px] font-black uppercase tracking-widest border-2 border-[var(--border-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-panel)] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none"
                    >
                      {GLYPH_EDIT}
                    </button>
                    <button
                      onClick={() => { setNodeToDelete(pressItem.id); setIsModalOpen(true); }}
                      className="w-14 h-12 neo-button bg-[var(--bg-panel)] text-red-500 flex items-center justify-center border-2 border-[var(--border-main)] hover:bg-red-500 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none font-black text-[10px]"
                    >
                      {GLYPH_DEL}
                    </button>
                  </div>
                </div>
              );
            })}

            {pressData?.getPressReleases?.length === 0 && (
              <div className="col-span-full py-32 border-4 border-dashed border-black/5 flex flex-col items-center justify-center gap-6 text-black/20">
                <span className="text-6xl font-black">[X]</span>
                <p className="text-xl font-black uppercase tracking-[0.5em]">No Media Data Detected</p>
              </div>
            )}
          </div>
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
              className="relative w-full max-w-md bg-[var(--bg-panel)] border-4 border-[var(--border-main)] p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.4)]"
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
                    You are about to decommission a <span className="text-red-500">Media_Node</span>. This action is irreversible and will remove the release from the global hub.
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
                    onClick={handleDeletePress}
                    className="flex-1 neo-button bg-red-500 text-white py-4 font-black uppercase tracking-widest border-4 border-[var(--border-main)] shadow-[6px_6px_0px_0px_rgba(239,68,68,0.3)] hover:shadow-none transition-all"
                  >
                    Decommission
                  </button>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-[var(--border-main)]/10 text-center">
                <p className="text-[9px] font-mono font-black text-[var(--text-secondary)]/30 uppercase tracking-[0.5em]">TredPOS // Secure_Media_Purge</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
