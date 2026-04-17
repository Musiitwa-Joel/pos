import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ShieldAlert,
  ChevronDown,
  X,
  Settings
} from 'lucide-react';
import { 
  GET_STATUS_COMPONENTS, 
  GET_INCIDENT_HISTORY, 
  UPSERT_STATUS_COMPONENT, 
  DELETE_STATUS_COMPONENT, 
  UPSERT_STATUS_INCIDENT, 
  DELETE_STATUS_INCIDENT 
} from '../../gql/website';

// Forensic Glyphs
const GLYPH_PULSE = "[PULSE_MONITOR]";
const GLYPH_INCIDENT = "[REPORT_INCIDENT]";
const GLYPH_SAVE = "[SYNC_HEALTH]";
const GLYPH_DEL = "[PURGE_NODE]";

export default function StatusAdmin() {
  const [activeTab, setActiveTab] = useState<'COMPONENTS' | 'INCIDENTS'>('COMPONENTS');
  
  // Queries
  const { data: compData, loading: compLoading, refetch: refetchComps } = useQuery(GET_STATUS_COMPONENTS);
  const { data: incData, loading: incLoading, refetch: refetchIncs } = useQuery(GET_INCIDENT_HISTORY, {
    variables: { limit: 50 }
  });

  // Mutations
  const [upsertComp, { loading: savingComp }] = useMutation(UPSERT_STATUS_COMPONENT, {
    onCompleted: () => refetchComps()
  });
  const [deleteComp] = useMutation(DELETE_STATUS_COMPONENT, {
    onCompleted: () => refetchComps()
  });
  const [upsertInc, { loading: savingInc }] = useMutation(UPSERT_STATUS_INCIDENT, {
    onCompleted: () => refetchIncs()
  });
  const [deleteInc] = useMutation(DELETE_STATUS_INCIDENT, {
    onCompleted: () => refetchIncs()
  });

  // Editor State
  const [editingComp, setEditingComp] = useState<any | null>(null);
  const [editingInc, setEditingInc] = useState<any | null>(null);
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [isIncModalOpen, setIsIncModalOpen] = useState(false);

  const components = compData?.getStatusComponents || [];
  const incidents = incData?.getIncidentHistory || [];

  const handleSaveComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("SYNCING_HEALTH_TELEMETRY...");
    try {
      await upsertComp({
        variables: {
          input: {
            id: editingComp.id,
            name: editingComp.name,
            description: editingComp.description,
            status: editingComp.status || 'OPERATIONAL',
            order_index: parseInt(editingComp.order_index || 0)
          }
        }
      });
      toast.success("HEALTH_SYNCHRONIZED", { id: toastId });
      setIsCompModalOpen(false);
      setEditingComp(null);
    } catch (err: any) {
      toast.error(`SYNC_FAILURE: ${err.message}`, { id: toastId });
    }
  };

  const handleSaveIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("BROADCASTING_INCIDENT_REPORT...");
    try {
      await upsertInc({
        variables: {
          input: {
            id: editingInc.id,
            title: editingInc.title,
            message: editingInc.message,
            status: editingInc.status || 'INVESTIGATING',
            impact: editingInc.impact || 'NONE'
          }
        }
      });
      toast.success("INCIDENT_BROADCAST_COMPLETED", { id: toastId });
      setIsIncModalOpen(false);
      setEditingInc(null);
    } catch (err: any) {
      toast.error(`BROADCAST_FAILURE: ${err.message}`, { id: toastId });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL': return 'text-neo-green';
      case 'DEGRADED': return 'text-yellow-500';
      case 'PARTIAL_OUTAGE': return 'text-neo-orange';
      case 'MAJOR_OUTAGE': return 'text-red-500';
      default: return 'text-[var(--text-main)]';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'CRITICAL': return 'bg-red-500 text-white';
      case 'MAJOR': return 'bg-neo-orange text-white';
      case 'MINOR': return 'bg-yellow-500 text-black';
      default: return 'bg-zinc-200 text-black';
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-32 text-[var(--text-main)]">
      
      {/* 📡 Pulse Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-black pb-8">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter italic flex items-center gap-4">
            <Activity className="text-neo-green animate-pulse" size={48} />
            SYSTEM_PULSE_HQ
          </h2>
          <p className="text-xs font-black uppercase tracking-[0.5em] opacity-40 mt-2">Telemetry Control & Incident Orchestration</p>
        </div>
        <div className="flex gap-4">
           {(['COMPONENTS', 'INCIDENTS'] as const).map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`neo-button px-8 py-3 font-black uppercase tracking-widest text-xs italic ${
                 activeTab === tab 
                   ? 'bg-black text-white shadow-[6px_6px_0px_0px_rgba(255,107,0,1)]' 
                   : 'bg-[var(--bg-panel)] border-4 border-[var(--border-main)]'
               }`}
             >
               {tab === 'COMPONENTS' ? GLYPH_PULSE : GLYPH_INCIDENT}
             </button>
           ))}
        </div>
      </section>

      {/* 📊 Interface Terminal */}
      <AnimatePresence mode="wait">
        {activeTab === 'COMPONENTS' ? (
          <motion.div
            key="comp-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="lg:col-span-2 flex justify-between items-center mb-4">
               <h3 className="text-2xl font-black uppercase tracking-widest italic">Node_Status_Registry</h3>
               <button 
                onClick={() => { setEditingComp({}); setIsCompModalOpen(true); }}
                className="neo-button bg-neo-green text-black font-black uppercase px-6 py-3 flex items-center gap-2 border-4 border-black"
               >
                 <Plus size={18} /> PROVISION_NODE
               </button>
            </div>

            {compLoading ? (
              <div className="col-span-full py-24 text-center border-4 border-dashed border-[var(--border-main)]">
                 <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : components.length === 0 ? (
               <div className="col-span-full py-24 text-center border-4 border-dashed border-[var(--border-main)] opacity-40">
                  <p className="font-black uppercase tracking-widest">NO_NODES_IDENTIFIED_IN_CLUSTER</p>
               </div>
            ) : (
              components.map((comp: any) => (
                <div 
                  key={comp.id}
                  className="neo-card bg-[var(--bg-panel)] border-4 border-[var(--border-main)] p-8 relative flex flex-col justify-between shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                   <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className={`text-4xl font-black uppercase italic ${getStatusColor(comp.status)}`}>
                          {comp.status}
                        </div>
                        <div className="flex gap-2">
                           <button 
                            onClick={() => { setEditingComp(comp); setIsCompModalOpen(true); }}
                            className="w-10 h-10 neo-border bg-white hover:bg-neo-blue hover:text-white flex items-center justify-center transition-colors"
                           >
                             <Edit size={16} />
                           </button>
                           <button 
                            onClick={() => { if(confirm("PURGE_NODE?")) deleteComp({ variables: { id: comp.id } }); }}
                            className="w-10 h-10 neo-border bg-white hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                      </div>
                      <h4 className="text-2xl font-black uppercase tracking-tight mb-2">{comp.name}</h4>
                      <p className="text-xs font-bold opacity-60 uppercase mb-8">{comp.description || "NO_DESCRIPTION_PAYLOAD"}</p>
                   </div>
                   <div className="border-t-2 border-black/10 pt-4 text-[10px] font-black uppercase tracking-widest opacity-40">
                      NODE_ID: {comp.id} // SEQ: {comp.order_index}
                   </div>
                </div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="inc-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-2xl font-black uppercase tracking-widest italic">Active_Incident_Journal</h3>
               <button 
                onClick={() => { setEditingInc({}); setIsIncModalOpen(true); }}
                className="neo-button bg-red-500 text-white font-black uppercase px-6 py-3 flex items-center gap-2 border-4 border-black"
               >
                 <ShieldAlert size={18} /> BROADCAST_INCIDENT
               </button>
            </div>

            <div className="neo-card bg-[var(--bg-panel)] border-4 border-[var(--border-main)] overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-black text-white border-b-4 border-black">
                    <tr>
                      <th className="p-6 text-xs font-black uppercase tracking-[0.2em]">IDENTIFIER</th>
                      <th className="p-6 text-xs font-black uppercase tracking-[0.2em]">IMPACT_LEVEL</th>
                      <th className="p-6 text-xs font-black uppercase tracking-[0.2em]">STATUS</th>
                      <th className="p-6 text-xs font-black uppercase tracking-[0.2em] text-right">ADMIN_OP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black/10">
                    {incLoading ? (
                      <tr><td colSpan={4} className="p-20 text-center"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                    ) : incidents.length === 0 ? (
                      <tr><td colSpan={4} className="p-20 text-center opacity-40 font-black uppercase text-sm">NO_ACTIVE_INCIDENTS_DETECTED</td></tr>
                    ) : (
                      incidents.map((inc: any) => (
                        <tr key={inc.id} className="hover:bg-cream transition-colors">
                          <td className="p-6">
                             <h5 className="font-black uppercase text-lg italic tracking-tight">{inc.title}</h5>
                             <p className="text-[10px] font-black uppercase tracking-widest opacity-40">CHRONO: {new Date(parseInt(inc.created_at)).toLocaleString().toUpperCase()}</p>
                          </td>
                          <td className="p-6 text-center">
                             <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest neo-border ${getImpactColor(inc.impact)}`}>
                               {inc.impact}
                             </span>
                          </td>
                          <td className="p-6">
                             <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest italic border border-black italic">
                               {inc.status}
                             </span>
                          </td>
                          <td className="p-6 text-right space-x-2">
                             <button 
                              onClick={() => { setEditingInc(inc); setIsIncModalOpen(true); }}
                              className="w-10 h-10 neo-border hover:bg-neo-blue hover:text-white inline-flex items-center justify-center transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                             >
                                <Edit size={16} />
                             </button>
                             <button 
                              onClick={() => { if(confirm("PURGE_INCIDENT?")) deleteInc({ variables: { id: inc.id } }); }}
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

      {/* 🧩 Component Modal */}
      <AnimatePresence>
        {isCompModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xl bg-[var(--bg-panel)] border-4 border-black p-10 relative shadow-[20px_20px_0px_0px_rgba(0,0,0,0.5)]"
            >
              <button 
                onClick={() => { setIsCompModalOpen(false); setEditingComp(null); }}
                className="absolute -top-4 -right-4 w-10 h-10 bg-black text-white flex items-center justify-center border-4 border-white"
              >
                 <X size={20} />
              </button>
              <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-10 border-b-4 border-black pb-4">
                CALIBRATE_NODE_HEALTH
              </h3>
              <form onSubmit={handleSaveComponent} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">NODE_NAME</label>
                  <input 
                    required
                    value={editingComp?.name || ''} 
                    onChange={e => setEditingComp({...editingComp, name: e.target.value})}
                    className="w-full neo-border p-4 font-black uppercase text-sm bg-[var(--bg-main)] outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">NODE_STATUS</label>
                  <select 
                    required
                    value={editingComp?.status || 'OPERATIONAL'} 
                    onChange={e => setEditingComp({...editingComp, status: e.target.value})}
                    className="w-full neo-border p-4 font-black uppercase text-sm bg-[var(--bg-main)] outline-none cursor-pointer" 
                  >
                    <option value="OPERATIONAL">OPERATIONAL</option>
                    <option value="DEGRADED">DEGRADED_PERFORMANCE</option>
                    <option value="PARTIAL_OUTAGE">PARTIAL_OUTAGE</option>
                    <option value="MAJOR_OUTAGE">MAJOR_OUTAGE</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">NODE_DESCRIPTION</label>
                  <textarea 
                    value={editingComp?.description || ''} 
                    onChange={e => setEditingComp({...editingComp, description: e.target.value})}
                    className="w-full neo-border p-4 font-bold text-sm bg-[var(--bg-main)] outline-none h-24" 
                  />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50">ORDER_PRIORITY</label>
                    <input 
                      type="number"
                      value={editingComp?.order_index || 0} 
                      onChange={e => setEditingComp({...editingComp, order_index: e.target.value})}
                      className="w-full neo-border p-4 font-black uppercase text-sm bg-[var(--bg-main)] outline-none" 
                    />
                </div>
                <button 
                  type="submit"
                  disabled={savingComp}
                  className="w-full neo-button bg-black text-white font-black uppercase py-6 text-xl mt-6 italic shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                  {savingComp ? "CALIBRATING..." : GLYPH_SAVE}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⚠️ Incident Modal */}
      <AnimatePresence>
        {isIncModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xl bg-[var(--bg-panel)] border-4 border-black p-10 relative shadow-[20px_20px_0px_0px_rgba(255,107,0,0.3)]"
            >
              <button 
                onClick={() => { setIsIncModalOpen(false); setEditingInc(null); }}
                className="absolute -top-4 -right-4 w-10 h-10 bg-black text-white flex items-center justify-center border-4 border-white"
              >
                 <X size={20} />
              </button>
              <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-10 border-b-4 border-black pb-4 text-red-500">
                ENCODE_INCIDENT_SIGNAL
              </h3>
              <form onSubmit={handleSaveIncident} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">SIGNAL_TITLE</label>
                  <input 
                    required
                    value={editingInc?.title || ''} 
                    onChange={e => setEditingInc({...editingInc, title: e.target.value})}
                    className="w-full neo-border p-4 font-black uppercase text-sm bg-[var(--bg-main)] outline-none" 
                    placeholder="e.g. CORE_API_LATENCY_SPIKE"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-50">INCIDENT_STATUS</label>
                      <select 
                        required
                        value={editingInc?.status || 'INVESTIGATING'} 
                        onChange={e => setEditingInc({...editingInc, status: e.target.value})}
                        className="w-full neo-border p-4 font-black uppercase text-xs bg-[var(--bg-main)] outline-none cursor-pointer" 
                      >
                        <option value="INVESTIGATING">INVESTIGATING</option>
                        <option value="IDENTIFIED">IDENTIFIED</option>
                        <option value="MONITORING">MONITORING</option>
                        <option value="RESOLVED">RESOLVED</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-50">IMPACT_LEVEL</label>
                      <select 
                        required
                        value={editingInc?.impact || 'NONE'} 
                        onChange={e => setEditingInc({...editingInc, impact: e.target.value})}
                        className="w-full neo-border p-4 font-black uppercase text-xs bg-[var(--bg-main)] outline-none cursor-pointer" 
                      >
                        <option value="NONE">NONE</option>
                        <option value="MINOR">MINOR_FRICTION</option>
                        <option value="MAJOR">MAJOR_DISRUPTION</option>
                        <option value="CRITICAL">CRITICAL_OUTAGE</option>
                      </select>
                   </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">SIGNAL_BODY_PAYLOAD</label>
                  <textarea 
                    required
                    value={editingInc?.message || ''} 
                    onChange={e => setEditingInc({...editingInc, message: e.target.value})}
                    className="w-full neo-border p-4 font-mono text-sm bg-[var(--bg-main)] outline-none h-40 leading-relaxed" 
                    placeholder="ENTER_INCIDENT_CHRONOLOGY..."
                  />
                </div>
                <button 
                  type="submit"
                  disabled={savingInc}
                  className="w-full neo-button bg-red-600 text-white font-black uppercase py-6 text-xl mt-6 italic shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                  {savingInc ? "TRANSMITTING..." : GLYPH_SAVE}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
