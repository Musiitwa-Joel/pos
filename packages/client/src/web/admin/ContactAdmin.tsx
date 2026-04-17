import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { 
  GET_CONTACT_INQUIRIES, 
  DELETE_CONTACT_INQUIRY, 
  MARK_INQUIRY_READ,
  GET_CONTACT_CONFIG,
  UPDATE_CONTACT_CONFIG
} from '../../gql/website';

// Forensic Glyphs
const GLYPH_DEL = "[PURGE]";
const GLYPH_READ = "[ACKNOWLEDGE]";
const GLYPH_WARN = "[!]";
const GLYPH_X = "[X]";

export default function ContactAdmin() {
  const { data: contactData, loading, refetch } = useQuery(GET_CONTACT_INQUIRIES);
  
  const [deleteInquiry] = useMutation(DELETE_CONTACT_INQUIRY, {
    refetchQueries: [{ query: GET_CONTACT_INQUIRIES }]
  });
  
  const [markRead] = useMutation(MARK_INQUIRY_READ, {
    refetchQueries: [{ query: GET_CONTACT_INQUIRIES }]
  });

  const { data: configData } = useQuery(GET_CONTACT_CONFIG);
  const [updateConfig, { loading: savingConfig }] = useMutation(UPDATE_CONTACT_CONFIG, {
    refetchQueries: [{ query: GET_CONTACT_CONFIG }]
  });

  const [activeMessage, setActiveMessage] = useState<any | null>(null);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [configForm, setConfigForm] = useState({ support_email: '', support_phone: '' });

  React.useEffect(() => {
    if (configData?.getContactConfig) {
      setConfigForm({
        support_email: configData.getContactConfig.support_email || 'ops@tredpos.com',
        support_phone: configData.getContactConfig.support_phone || '+44 (0) 20 7946 0123'
      });
    }
  }, [configData]);

  const handleSaveConfig = async () => {
    const toastId = toast.loading("SYNCING_CONFIG...");
    try {
      await updateConfig({ variables: { input: configForm } });
      toast.success("CHANNELS_UPDATED_SUCCESSFULLY", { id: toastId });
    } catch (e: any) {
      toast.error(`CONFIG_UPDATE_FAILED: ${e.message}`, { id: toastId });
      console.error(e);
    }
  };

  const formatForensicDate = (dateStr: any) => {
    if (!dateStr) return "UNKNOWN_CHRONO";
    try {
      const date = new Date(isNaN(Number(dateStr)) ? dateStr : Number(dateStr));
      if (isNaN(date.getTime())) return "INVALID_TERMINAL_TIME";
      return date.toLocaleString(undefined, {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).toUpperCase();
    } catch (e) {
      return "PARSING_ERROR";
    }
  };

  const handleDelete = async () => {
    if (!nodeToDelete) return;
    const toastId = toast.loading("PURGING_TRANSMISSION...");
    try {
      await deleteInquiry({ variables: { id: nodeToDelete } });
      toast.success("TRANSMISSION_PURGED", { id: toastId });
      setIsModalOpen(false);
      setNodeToDelete(null);
      if (activeMessage && activeMessage.id === nodeToDelete) {
        setActiveMessage(null);
      }
    } catch (err: any) {
      toast.error("PURGE_ERROR", { id: toastId });
    }
  };

  const handleRead = async (id: string, currentStatus: string) => {
    if (currentStatus === 'read') return;
    try {
      await markRead({ variables: { id } });
      toast.success("TRANSMISSION_ACKNOWLEDGED");
    } catch (e) {
      toast.error("ACKNOWLEDGE_FAILED");
    }
  };

  const inquiries = contactData?.getContactInquiries || [];
  const pendingCount = inquiries.filter((i: any) => i.status === 'pending').length;

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-32 text-[var(--text-main)]">
      
      {/* 📡 Radar Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neo-card bg-[var(--bg-panel)] border-4 border-[var(--border-main)] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-50 mb-2">Total Transmissions</h3>
          <p className="text-6xl font-black font-display italic">{inquiries.length}</p>
        </div>
        <div className="neo-card bg-[var(--bg-panel)] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(255,107,0,1)]">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-50 mb-2">Unacknowledged Signals</h3>
          <p className="text-6xl font-black font-display italic text-neo-orange">{pendingCount}</p>
        </div>
      </section>

      {/* ⚙️ Global Contact Channels */}
      <section className="p-8 neo-card bg-[var(--bg-panel)] border-4 border-[var(--border-main)] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
        <h3 className="text-2xl font-black uppercase tracking-widest italic mb-6 text-[var(--text-main)]">GLOBAL_CHANNELS_CONFIG</h3>
        <div className="grid md:grid-cols-2 gap-6 items-end">
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-50 text-[var(--text-main)]">Operations Email</label>
            <input 
              type="text" 
              value={configForm.support_email} 
              onChange={e => setConfigForm({ ...configForm, support_email: e.target.value })}
              className="w-full neo-border py-4 px-6 font-bold bg-[var(--bg-main)] text-[var(--text-main)] border-[var(--border-main)] focus:bg-[var(--bg-panel)] transition-colors outline-none" 
            />
          </div>
          <div className="space-y-3">
             <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-50 text-[var(--text-main)]">TredPos Hotline</label>
             <input 
              type="text" 
              value={configForm.support_phone} 
              onChange={e => setConfigForm({ ...configForm, support_phone: e.target.value })}
              className="w-full neo-border py-4 px-6 font-bold bg-[var(--bg-main)] text-[var(--text-main)] border-[var(--border-main)] focus:bg-[var(--bg-panel)] transition-colors outline-none" 
            />
          </div>
        </div>
        <button 
          onClick={handleSaveConfig}
          disabled={savingConfig}
          className="mt-6 neo-button bg-black text-white font-black uppercase tracking-widest px-8 py-4 disabled:opacity-50 hover:bg-neo-blue transition-colors"
        >
          {savingConfig ? "SYNCING..." : "COMMIT_CHANNEL_CHANGES"}
        </button>
      </section>

      {/* 📜 Transmission Stream */}
      <section className="grid md:grid-cols-12 gap-8">
        
        {/* Left Side: Inbox List */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-4 max-h-[800px] overflow-y-auto pr-2">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-8 h-8 neo-border bg-black flex items-center justify-center text-white font-black text-xs">
                RX
             </div>
             <h3 className="text-xl font-black uppercase tracking-widest italic">INBOX_STREAM</h3>
          </div>

          {loading ? (
             <div className="py-24 text-center space-y-6 neo-border border-dashed">
                <div className="w-10 h-10 border-4 border-[var(--text-main)] border-t-transparent rounded-full animate-spin mx-auto" />
             </div>
          ) : inquiries.length === 0 ? (
            <div className="p-12 text-center neo-border border-dashed flex flex-col items-center opacity-50">
              <span className="text-4xl font-black mb-4">[X]</span>
              <p className="text-xs uppercase tracking-widest font-black">NO_SIGNALS_DETECTED</p>
            </div>
          ) : (
            inquiries.map((inquiry: any) => {
              const isPending = inquiry.status === 'pending';
              const isActive = activeMessage?.id === inquiry.id;

              return (
                <div 
                  key={inquiry.id}
                  onClick={() => {
                    setActiveMessage(inquiry);
                    handleRead(inquiry.id, inquiry.status);
                  }}
                  className={`neo-card border-4 cursor-pointer transition-all p-6 relative group ${isActive ? 'border-black bg-black text-white translate-x-2' : isPending ? 'border-neo-orange bg-[var(--bg-panel)] hover:bg-[var(--bg-main)]' : 'border-[var(--border-main)] border-dashed bg-[var(--bg-panel)] opacity-60 hover:opacity-100 hover:border-solid'}`}
                >
                  {isPending && !isActive && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-neo-orange rounded-full animate-pulse border-2 border-black" />
                  )}
                  
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-white/60' : 'text-[var(--text-main)]/60'}`}>
                      {formatForensicDate(inquiry.created_at)}
                    </span>
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-tighter line-clamp-1 mb-1">
                    {inquiry.subject || 'GENERAL_INQUIRY'}
                  </h4>
                  <p className={`text-xs font-bold ${isActive ? 'text-white' : 'text-black'}`}>
                    {inquiry.name}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Message Inspector */}
        <div className="md:col-span-12 lg:col-span-8 h-full">
          {activeMessage ? (
            <motion.div
              layoutId={`msg-${activeMessage.id}`}
              className="neo-card border-4 border-[var(--border-main)] bg-[var(--bg-panel)] shadow-[16px_16px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[16px_16px_0px_0px_rgba(0,0,0,0.5)] sticky top-8 flex flex-col h-full min-h-[600px] text-[var(--text-main)]"
            >
              {/* Transceiver Header */}
              <div className="border-b-4 border-[var(--border-main)] p-8 bg-[var(--bg-main)]/50 flex justify-between items-start">
                <div className="flex-1">
                  <div className="inline-block px-3 py-1 bg-[var(--text-main)] text-[var(--bg-main)] text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                    DECRYPTED_PAYLOAD_ID: {activeMessage.id}
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-black font-display uppercase tracking-tighter leading-none mb-6">
                    {activeMessage.subject || 'GENERAL_INQUIRY'}
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-8 text-xs font-black uppercase tracking-widest font-mono">
                    <div>
                      <span className="opacity-40 block mb-1">TRANSMITTER_ID:</span>
                      <span className="break-all">{activeMessage.name}</span>
                    </div>
                    <div>
                      <span className="opacity-40 block mb-1">SECURE_NODE:</span>
                      <a href={`mailto:${activeMessage.email}`} className="text-neo-blue hover:text-[var(--text-main)] hover:underline break-all">
                        {activeMessage.email}
                      </a>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => { setNodeToDelete(activeMessage.id); setIsModalOpen(true); }}
                  className="w-16 h-16 neo-button bg-red-500 text-white flex items-center justify-center border-4 border-[var(--border-main)] hover:bg-[var(--text-main)] transition-colors shrink-0 ml-4"
                >
                  <span className="font-black text-xs">{GLYPH_DEL}</span>
                </button>
              </div>
              
              {/* Payload Body */}
              <div className="p-8 md:p-12 flex-1 bg-[var(--bg-panel)] font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-y-auto opacity-90">
                {activeMessage.message}
              </div>

              {/* Footer */}
              <div className="border-t-4 border-[var(--border-main)] p-6 bg-[var(--bg-main)] flex flex-col sm:flex-row justify-between items-center text-[10px] font-black tracking-widest uppercase gap-4">
                <span>STATUS: {activeMessage.status === 'read' ? 'ACKNOWLEDGED' : 'PENDING'}</span>
                <span>TIMESTAMP: {formatForensicDate(activeMessage.created_at)}</span>
              </div>
            </motion.div>
          ) : (
            <div className="neo-card border-4 border-dashed border-[var(--border-main)] h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 opacity-50 text-[var(--text-main)] bg-[var(--bg-panel)]">
              <span className="text-8xl font-black mb-6 rotate-12">[ ]</span>
              <h2 className="text-2xl font-black font-display uppercase tracking-[0.3em] mb-4">NO_PAYLOAD_SELECTED</h2>
              <p className="text-xs font-bold uppercase tracking-widest max-w-sm mx-auto">Select a transmission from the inbox stream to decrypt the payload.</p>
            </div>
          )}
        </div>
      </section>

      {/* 🛡️ Decommission Modal */}
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
                  className="w-10 h-10 bg-[var(--text-main)] text-[var(--bg-panel)] flex items-center justify-center border-4 border-[var(--border-main)]"
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
                    You are about to decommission <span className="text-red-500">Transmission Node</span>. This action is irreversible.
                  </p>
                </div>

                <div className="w-full flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 neo-button bg-[var(--bg-panel)] text-[var(--text-main)] py-4 font-black uppercase tracking-widest border-4 border-[var(--border-main)]"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="flex-1 neo-button bg-red-500 text-white py-4 font-black uppercase tracking-widest border-4 border-[var(--border-main)]"
                  >
                    Purge Payload
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
