import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

// Forensic_Glyphs
const GLYPH_SEC = "[SEC]";
const GLYPH_ARCH = "[SYS]";
const GLYPH_FIX = "[FIX]";
const GLYPH_FEAT = "[FEATURE]";

import {
  GET_CHANGELOGS,
  GET_LATEST_CHANGELOG,
  CREATE_CHANGELOG,
  UPDATE_CHANGELOG,
  DELETE_CHANGELOG
} from '../../gql/website';
import { cn } from '../../lib/utils';

export default function ChangelogAdmin() {
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [logForm, setLogForm] = useState({
    version: '',
    title: '',
    category: 'FEATURE' as 'FEATURE' | 'FIX' | 'SECURITY' | 'ARCHITECTURE',
    content: ''
  });

  const { data: logData, loading: loadingLogs, refetch: refetchLogs } = useQuery(GET_CHANGELOGS);
  const { data: latestLogData } = useQuery(GET_LATEST_CHANGELOG);

  const [createLog] = useMutation(CREATE_CHANGELOG, {
    refetchQueries: [{ query: GET_CHANGELOGS }, { query: GET_LATEST_CHANGELOG }]
  });
  const [updateLog] = useMutation(UPDATE_CHANGELOG, {
    refetchQueries: [{ query: GET_CHANGELOGS }]
  });
  const [deleteLog] = useMutation(DELETE_CHANGELOG, {
    refetchQueries: [{ query: GET_CHANGELOGS }, { query: GET_LATEST_CHANGELOG }]
  });

  useEffect(() => {
    if (!editingLogId && latestLogData?.getLatestChangelog) {
      const latest = latestLogData.getLatestChangelog;
      const currentVersion = latest.version || 'v0.0.0';
      const parts = currentVersion.replace(/^v/, '').split('.').map(Number);

      if (parts.length === 3) {
        parts[2] += 1;
      } else if (parts.length > 0) {
        parts[parts.length - 1] += 1;
      } else {
        parts.push(1);
      }

      const nextVersion = `v${parts.join('.')}`;
      setLogForm(prev => ({ ...prev, version: nextVersion }));
    } else if (!editingLogId && !latestLogData?.getLatestChangelog) {
      setLogForm(prev => ({ ...prev, version: 'v1.0.0' }));
    }
  }, [latestLogData, editingLogId]);

  const handleSaveLog = async () => {
    if (!logForm.version || !logForm.title || !logForm.content) {
      toast.error("TELEMETRY_INCOMPLETE: Full logging specs required.");
      return;
    }

    const toastId = toast.loading(editingLogId ? 'RECALIBRATING_PLATFORM...' : 'PROVISIONING_UPDATE...');

    try {
      if (editingLogId) {
        await updateLog({
          variables: {
            id: editingLogId,
            input: {
              version: logForm.version,
              title: logForm.title,
              category: logForm.category,
              content: logForm.content
            }
          }
        });
        toast.success("CORE_SYNC_SUCCESS: Protocol recalibrated.", { id: toastId });
      } else {
        await createLog({ variables: { input: logForm } });
        toast.success("CORE_SYNC_SUCCESS: Protocol successfully deployed.", { id: toastId });
      }

      setEditingLogId(null);
      setLogForm({ version: 'v1.0.0', title: '', category: 'FEATURE', content: '' });
      refetchLogs();
    } catch (err: any) {
      toast.error(`CORE_FAILURE: ${err.message}`, { id: toastId });
    }
  };

  const handleEditLog = (log: any) => {
    setEditingLogId(log.id);
    setLogForm({
      version: log.version,
      title: log.title,
      category: log.category,
      content: log.content
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);

  const handleDeleteLog = async () => {
    if (!nodeToDelete) return;
    const toastId = toast.loading("DECOMMISSIONING_NODE...");
    try {
      await deleteLog({ variables: { id: nodeToDelete } });
      toast.success("NODE_DECOMMISSIONED", { id: toastId });
      setIsModalOpen(false);
      setNodeToDelete(null);
    } catch (err: any) {
      toast.error("DECOMMISSION_ERROR", { id: toastId });
    }
  };

  const formatForensicDate = (dateStr: string | number) => {
    if (!dateStr) return "N/A";
    const date = isNaN(Number(dateStr)) ? new Date(dateStr) : new Date(Number(dateStr));
    if (isNaN(date.getTime())) return "INVALID_TERMINAL_TIME";
    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).toUpperCase();
  };

  const CategoryIcon = ({ category }: { category: string }) => {
    switch (category) {
      case 'SECURITY': return <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-black uppercase rounded-sm">{GLYPH_SEC}</span>;
      case 'ARCHITECTURE': return <span className="px-2 py-0.5 bg-neo-orange text-white text-[9px] font-black uppercase rounded-sm">{GLYPH_ARCH}</span>;
      case 'FIX': return <span className="px-2 py-0.5 bg-neo-blue text-white text-[9px] font-black uppercase rounded-sm">{GLYPH_FIX}</span>;
      default: return <span className="px-2 py-0.5 bg-neo-green text-black text-[9px] font-black uppercase rounded-sm">{GLYPH_FEAT}</span>;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-32 text-[var(--text-main)]">
      {/* 🛠️ Enterprise Update Terminal */}
      <section className="relative">
        <div className="absolute -top-6 left-10 z-20 px-4 py-1 bg-[var(--text-main)] text-[var(--bg-panel)] text-[9px] font-black uppercase tracking-[0.4em] rotate-[-1deg]">
          Registry_Terminal // HSM_2.4
        </div>

        <div className="neo-card border-4 border-[var(--border-main)] bg-[var(--bg-panel)] shadow-[24px_24px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[24px_24px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="min-h-[700px]">

            {/* 📝 Editor Blade */}
            <div className="p-8 md:p-12 space-y-10 bg-[var(--bg-main)]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 neo-border flex items-center justify-center bg-neo-orange rotate-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-xl font-black text-black select-none">[v]</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">
                      {editingLogId ? "Update_Protocol" : "Deploy_Update"}
                    </h3>
                    <p className="text-[10px] font-mono font-black text-neo-orange uppercase tracking-widest mt-1 opacity-60">
                      {editingLogId ? `ID_REF: ${editingLogId}` : "STANDBY_FOR_INPUT"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSaveLog}
                  className="neo-button bg-black text-white py-4 px-10 flex items-center gap-4 text-xs font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(255,107,0,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  <span className="font-mono text-neo-orange"> {">>"} </span>
                  {editingLogId ? "Push Update" : "Deploy Log"}
                </button>
              </div>

              <div className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Version_ID</label>
                    <input
                      type="text"
                      value={logForm.version}
                      readOnly
                      className="w-full neo-border py-4 px-6 font-mono text-xl bg-[var(--bg-main)] text-neo-orange border-4 border-[var(--border-main)] cursor-not-allowed opacity-80 transition-all uppercase"
                      placeholder="v1.0.0"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Protocol_Headline</label>
                    <input
                      type="text"
                      value={logForm.title}
                      onChange={e => setLogForm({ ...logForm, title: e.target.value })}
                      className="w-full neo-border py-4 px-6 font-black text-xl bg-[var(--bg-panel)] text-[var(--text-main)] border-4 border-[var(--border-main)] focus:border-neo-orange transition-all uppercase placeholder:[var(--text-secondary)]/30"
                      placeholder="ENTER_CORE_HEADLINE"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">System_Classification</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['FEATURE', 'FIX', 'SECURITY', 'ARCHITECTURE'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setLogForm({ ...logForm, category: cat as any })}
                        className={cn(
                          "px-4 py-4 neo-border border-4 font-black text-[10px] uppercase tracking-widest transition-all text-center",
                          logForm.category === cat
                            ? "bg-[var(--text-main)] text-[var(--bg-panel)] shadow-[6px_6px_0px_0px_rgba(255,107,0,1)] translate-y-[-2px]"
                            : "bg-[var(--bg-panel)] text-[var(--text-main)] opacity-30 hover:opacity-100 border-[var(--border-main)]"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Scientific_Content (Markdown)</label>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-neo-green rounded-full animate-pulse" />
                      <span className="text-[9px] font-mono text-neo-green font-bold uppercase tracking-widest">Compiler_Active</span>
                    </div>
                  </div>
                  <textarea
                    value={logForm.content}
                    onChange={e => setLogForm({ ...logForm, content: e.target.value })}
                    className="w-full neo-border p-8 font-mono text-sm border-4 border-[var(--border-main)] bg-[var(--bg-main)] text-[var(--text-main)] min-h-[450px] focus:outline-none focus:border-neo-orange leading-relaxed"
                    placeholder="# Log_Summary&#10;- Bullet_One&#10;- Bullet_Two"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 📜 Audit Stream */}
      <section className="space-y-10 px-4 md:px-0">
        <div className="flex items-center gap-8">
          <div className="w-12 h-12 neo-border bg-black flex items-center justify-center">
            <span className="text-white font-black">#</span>
          </div>
          <h3 className="text-4xl font-black uppercase tracking-tighter italic">Registry_History</h3>
          <div className="h-0.5 flex-1 bg-black/10" />
          <p className="text-[10px] font-mono font-black uppercase tracking-[0.3em] opacity-40">Forensic_Data_Center</p>
        </div>

        {loadingLogs ? (
          <div className="py-24 text-center space-y-6">
            <div className="w-16 h-16 border-4 border-neo-orange border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 animate-pulse">Synchronizing_With_Global_Clusters...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {(logData?.getChangelogs || []).map((log: any, index: number) => {
              return (
                <div key={log.id} className="group relative neo-card border-4 border-[var(--border-main)] p-8 bg-[var(--bg-panel)] hover:bg-[var(--bg-main)] transition-all flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      {CategoryIcon({ category: log.category })}
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                        {log.category} // {log.version}
                      </span>
                    </div>
                    <div className="px-3 py-1 bg-black text-white text-[9px] font-black">
                      #{logData.getChangelogs.length - index}
                    </div>
                  </div>

                  <h4 className="text-2xl font-black uppercase tracking-tighter mb-4 line-clamp-2 leading-[0.9] group-hover:text-neo-orange transition-colors">
                    {log.title}
                  </h4>

                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-6 border-b border-[var(--border-main)]/10 pb-4">
                    {formatForensicDate(log.created_at)}
                  </p>

                  <div className="flex-1 overflow-hidden opacity-60">
                    <div className="line-clamp-4 text-xs font-bold leading-relaxed">
                      {log.content}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-black/10 flex gap-4">
                    <button
                      onClick={() => handleEditLog(log)}
                      className="flex-1 neo-button bg-[var(--bg-panel)] text-[var(--text-main)] py-3 text-[10px] font-black uppercase tracking-widest border-2 border-[var(--border-main)] hover:bg-neo-orange hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none"
                    >
                      RECALIBRATE
                    </button>
                    <button
                      onClick={() => { setNodeToDelete(log.id); setIsModalOpen(true); }}
                      className="w-14 h-12 neo-button bg-[var(--bg-panel)] text-red-500 flex items-center justify-center border-2 border-[var(--border-main)] hover:bg-red-500 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none group/del"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">Del</span>
                    </button>
                  </div>
                </div>
              );
            })}

              <div className="col-span-full py-32 border-4 border-dashed border-black/5 flex flex-col items-center justify-center gap-6 text-black/20">
                <span className="text-6xl font-black">[X]</span>
                <p className="text-xl font-black uppercase tracking-[0.5em]">No Registry Data Detected</p>
              </div>
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
              className="relative w-full max-w-md bg-[var(--bg-panel)] border-4 border-[var(--border-main)] p-10 shadow-[20px_20px_0px_0px_rgba(255,107,0,0.4)]"
            >
              <div className="absolute -top-4 -right-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 bg-[var(--text-main)] text-[var(--bg-panel)] flex items-center justify-center border-4 border-[var(--border-main)] hover:bg-neo-orange transition-colors"
                >
                  <span className="font-black">[X]</span>
                </button>
              </div>

              <div className="flex flex-col items-center text-center space-y-8">
                <div className="w-20 h-20 bg-red-500/10 border-4 border-red-500 flex items-center justify-center rotate-3 shadow-[6px_6px_0px_0px_rgba(239,68,68,0.2)]">
                  <span className="text-4xl font-black text-red-500">[!]</span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic text-[var(--text-main)]">Confirm_Deletion</h3>
                  <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed">
                    You are about to decommission a <span className="text-red-500">Registry_Node</span>. This action is immutable and will purge the protocol from platform telemetry.
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
                    onClick={handleDeleteLog}
                    className="flex-1 neo-button bg-red-500 text-white py-4 font-black uppercase tracking-widest border-4 border-[var(--border-main)] shadow-[6px_6px_0px_0px_rgba(239,68,68,0.3)] hover:shadow-none transition-all"
                  >
                    Decommission
                  </button>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-[var(--border-main)]/10 text-center">
                <p className="text-[9px] font-mono font-black text-[var(--text-secondary)]/30 uppercase tracking-[0.5em]">TredPOS // Secure_Purge_Protocol</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
