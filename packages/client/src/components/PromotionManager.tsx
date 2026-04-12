import React, { useState, useEffect } from 'react';
import { Tag, Clock, Trash2, ShieldAlert, Plus, Zap, Calendar, ArrowRight, PauseCircle, PlayCircle, Timer } from 'lucide-react';
import { useHardware } from '../HardwareContext';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function PromotionManager() {
  const { promotions, addPromotion, updatePromotion, deletePromotion, togglePromotion, products, sales } = useHardware();
  const [showAdd, setShowAdd] = useState(false);
  const [isInstant, setIsInstant] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [activeExtendId, setActiveExtendId] = useState<string | null>(null);
  const formatDateTimeLocal = (d: Date) => {
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  };

  const [newPromo, setNewPromo] = useState({
    name: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    startDate: formatDateTimeLocal(new Date()),
    durationHours: 1,
    productIds: [] as string[]
  });

  const activePromos = promotions.filter(p => {
    const now = new Date().getTime();
    return p.isActive && now >= new Date(p.startDate).getTime() && now <= new Date(p.endDate).getTime();
  });

  const scheduledPromos = promotions.filter(p => !activePromos.includes(p));

  const totalSavings = React.useMemo(() => {
    return sales.filter(s => s.promoId).reduce((acc, s) => acc + (s.discount || 0), 0);
  }, [sales]);

  const handleAdd = () => {
    const start = isInstant ? new Date() : new Date(newPromo.startDate || new Date());
    const end = new Date(start.getTime() + (newPromo.durationHours || 1) * 60 * 60 * 1000);

    addPromotion({
      name: newPromo.name || 'FLASH_SALE',
      type: newPromo.type,
      value: newPromo.value,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      productIds: newPromo.productIds
    });
    setShowAdd(false);
    setIsInstant(true);
    setNewPromo({ name: '', type: 'percentage', value: 0, startDate: formatDateTimeLocal(new Date()), durationHours: 1, productIds: [] });
    setProductSearch('');
  };

  const toggleProductSelection = (productId: string) => {
    setNewPromo(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId]
    }));
  };

  const selectedProductNames = products
    .filter(p => newPromo.productIds.includes(p.id))
    .map(p => p.name);

  const searchedProducts = productSearch
    ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 5)
    : [];

  const setPreset = (mins: number) => {
    setNewPromo(prev => ({ ...prev, durationHours: mins / 60 }));
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-display text-[var(--text-main)] uppercase tracking-tight">Promotions_Engine</h2>
          <p className="text-[10px] text-slate-900 dark:text-slate-500 font-mono uppercase tracking-widest mt-1">Configure timed discounts & revenue triggers</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-industrial btn-primary flex items-center gap-2 px-4 py-2 text-[10px] w-full sm:w-auto justify-center"
        >
          <Plus size={14} /> NEW_PROMOTION
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Active Promos */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-brand-accent">
            <Zap size={14} />
            <span className="text-[10px] font-display uppercase tracking-widest">Live_Events</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence mode="popLayout">
              {activePromos.length > 0 ? activePromos.map((promo, index) => (
                <PromotionCard
                  key={promo.id}
                  promo={promo}
                  onDelete={deletePromotion}
                  onToggle={togglePromotion}
                  onUpdate={updatePromotion}
                  isActive={true}
                  isExtendOpen={activeExtendId === promo.id}
                  onToggleExtend={() => setActiveExtendId(activeExtendId === promo.id ? null : promo.id)}
                  isFirst={index === 0}
                />
              )) : (
                <div className="industrial-panel p-12 flex flex-col items-center justify-center gap-4 opacity-30 border-dashed">
                  <Tag size={40} strokeWidth={1} />
                  <p className="text-[9px] font-mono uppercase">No active promotions currently running</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-500 pt-4">
            <Calendar size={14} />
            <span className="text-[10px] font-display uppercase tracking-widest">Scheduled_&_Expired</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {scheduledPromos.map((promo, index) => (
              <PromotionCard
                key={promo.id}
                promo={promo}
                onDelete={deletePromotion}
                onToggle={togglePromotion}
                onUpdate={updatePromotion}
                isActive={false}
                isExtendOpen={activeExtendId === promo.id}
                onToggleExtend={() => setActiveExtendId(activeExtendId === promo.id ? null : promo.id)}
                isFirst={index === 0}
              />
            ))}
          </div>
        </div>

        {/* Info/Stats */}
        <div className="space-y-4">
          <div className="industrial-panel p-4 bg-brand-accent/5 border-brand-accent/20">
            <div className="flex items-center gap-2 text-brand-accent mb-4">
              <ShieldAlert size={14} />
              <span className="text-[10px] font-display uppercase tracking-widest">Security_Notice</span>
            </div>
            <p className="text-[10px] text-slate-800 dark:text-slate-400 font-mono leading-relaxed uppercase">
              Promotions apply automatically at checkout. Overlapping promotions will stack. Use with caution to protect profit margins.
            </p>
          </div>

          <div className="industrial-panel p-4">
            <div className="text-slate-900 dark:text-slate-500 text-[10px] font-display uppercase tracking-widest mb-4">Quick_Stats</div>
            <div className="space-y-4">
              <div>
                <div className="text-[9px] text-slate-900 dark:text-slate-500 mb-1">TOTAL_SAVINGS_GIVEN</div>
                <div className="text-xl font-mono font-bold text-[var(--text-main)]">{formatCurrency(totalSavings)}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-900 dark:text-slate-500 mb-1">ACTIVE_CAMPAIGNS</div>
                <div className="text-xl font-mono font-bold text-brand-accent">{activePromos.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="industrial-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="industrial-modal-content p-6 space-y-6 custom-scrollbar"
            >
              <div className="flex justify-between items-center border-b border-brand-steel pb-4">
                <span className="text-[12px] font-display uppercase tracking-widest text-brand-accent">Configure_Promotion</span>
                <button onClick={() => setShowAdd(false)} className="text-slate-900 dark:text-slate-500 hover:text-white transition-colors">
                  <Plus className="rotate-45" size={20} />
                </button>
              </div>

              {/* Instant / Scheduled Toggle */}
              <div className="flex rounded border border-brand-steel overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsInstant(true)}
                  className={cn(
                    "flex-1 py-2.5 text-[9px] font-display uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                    isInstant ? "bg-brand-accent text-brand-dark font-bold" : "text-slate-800 dark:text-slate-400 hover:text-white"
                  )}
                >
                  <Zap size={11} /> Instant
                </button>
                <button
                  type="button"
                  onClick={() => setIsInstant(false)}
                  className={cn(
                    "flex-1 py-2.5 text-[9px] font-display uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                    !isInstant ? "bg-brand-accent text-brand-dark font-bold" : "text-slate-800 dark:text-slate-400 hover:text-white"
                  )}
                >
                  <Calendar size={11} /> Scheduled
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-900 dark:text-slate-500 font-display">EVENT_NAME</label>
                  <input
                    type="text"
                    className="terminal-input w-full"
                    placeholder="e.g. FLASH_SALE_10%"
                    value={newPromo.name}
                    onChange={e => setNewPromo(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-900 dark:text-slate-500 font-display">TYPE</label>
                    <select
                      className="terminal-input w-full"
                      value={newPromo.type}
                      onChange={e => setNewPromo(prev => ({ ...prev, type: e.target.value as any }))}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed USh</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-900 dark:text-slate-500 font-display">VALUE</label>
                    <input
                      type="number"
                      className="terminal-input w-full text-brand-accent"
                      placeholder="0"
                      value={newPromo.value}
                      onChange={e => setNewPromo(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                {/* Only show start time picker in Scheduled mode */}
                {!isInstant && (
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-900 dark:text-slate-500 font-display">START_TIME</label>
                    <input
                      type="datetime-local"
                      className="terminal-input w-full [color-scheme:dark]"
                      value={newPromo.startDate}
                      onChange={e => setNewPromo(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[9px] text-slate-900 dark:text-slate-500 font-display">TARGET_PRODUCTS (Leave empty for store-wide)</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="terminal-input w-full pr-10"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                    />
                    <Tag className="absolute right-3 top-2.5 text-slate-900 dark:text-slate-500" size={14} />
                  </div>

                  {searchedProducts.length > 0 && (
                    <div className="border border-brand-steel bg-brand-dark max-h-40 overflow-y-auto rounded shadow-xl">
                      {searchedProducts.map(p => (
                        <button
                          key={p.id}
                          onClick={() => toggleProductSelection(p.id)}
                          className="w-full text-left p-2 hover:bg-brand-accent/10 border-b border-brand-steel/30 text-[10px] flex justify-between items-center"
                        >
                          <span>{p.name}</span>
                          {newPromo.productIds.includes(p.id) && <Plus className="rotate-45 text-brand-accent" size={12} />}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedProductNames.map((name, i) => (
                      <span key={i} className="px-2 py-0.5 bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-[8px] rounded-full flex items-center gap-1">
                        {name}
                        <button onClick={() => toggleProductSelection(newPromo.productIds[i])}><Plus className="rotate-45" size={10} /></button>
                      </span>
                    ))}
                    {newPromo.productIds.length === 0 && (
                      <span className="text-[9px] font-mono text-slate-900 dark:text-slate-500 italic uppercase">All_Products_Selected</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] text-slate-900 dark:text-slate-500 font-display">DURATION_PRESETS</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: '30M', val: 30 },
                      { label: '1H', val: 60 },
                      { label: '24H', val: 1440 },
                      { label: '1W', val: 10080 }
                    ].map(p => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setPreset(p.val)}
                        className={cn(
                          "py-2 text-[9px] border transition-all",
                          newPromo.durationHours === (p.val / 60) ? "bg-brand-accent/20 border-brand-accent text-brand-accent" : "border-brand-steel hover:border-slate-500"
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAdd}
                  className="btn-industrial btn-primary w-full py-4 text-[10px] font-display uppercase tracking-widest mt-4"
                >
                  {isInstant ? '⚡ Activate_Now' : 'Schedule_&_Activate_Terminal'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interaction Shield (Click Outside Guard) */}
      <AnimatePresence>
        {activeExtendId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveExtendId(null)}
            className="fixed inset-0 z-[145] cursor-default"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PromotionCard({ 
  promo, onDelete, onToggle, onUpdate, isActive, isExtendOpen, onToggleExtend, isFirst 
}: { 
  promo: any, onDelete: any, onToggle: any, onUpdate: any, isActive: boolean, isExtendOpen: boolean, onToggleExtend: () => void, isFirst?: boolean 
}) {
  const { products } = useHardware();
  const [timeLeft, setTimeLeft] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const end = new Date(promo.endDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${h}H ${m}M ${s}S`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [promo.endDate]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "industrial-panel p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group !overflow-visible relative transition-all duration-300",
        !isActive && "opacity-90 dark:opacity-60 bg-brand-steel/10",
        isExtendOpen && "z-[150] ring-1 ring-brand-accent/30 shadow-2xl bg-brand-panel"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 flex items-center justify-center rounded border",
          isActive ? "bg-brand-accent/20 border-brand-accent/40 text-brand-accent" : "bg-slate-800 border-slate-700 text-slate-900 dark:text-slate-500"
        )}>
          <Tag size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-tight">{promo.name}</h3>
            {isActive && <span className="text-[8px] bg-brand-accent/10 border border-brand-accent/30 text-brand-accent px-1.5 py-0.5 rounded-full animate-pulse">LIVE</span>}
          </div>
          <div className="flex items-center gap-3 text-[9px] font-mono text-slate-900 dark:text-slate-500 mt-2 uppercase flex-wrap">
            <span>{promo.type === 'percentage' ? `${promo.value}% OFF` : `-${formatCurrency(promo.value)}`}</span>
            <ArrowRight size={8} />
            {promo.productIds?.length ? (
              <span className="text-brand-accent font-bold flex items-center gap-1 flex-wrap max-w-xs">
                {products
                  .filter(p => (promo.productIds as string[]).includes(p.id))
                  .map(p => (
                    <span key={p.id} className="px-1 py-0.5 bg-brand-accent/10 border border-brand-accent/20 rounded text-[8px]">
                      {p.name}
                    </span>
                  ))
                }
              </span>
            ) : (
              <span className="text-brand-accent font-bold">STOREWIDE</span>
            )}
            <ArrowRight size={8} className="hidden sm:inline" />
            <span className="flex items-center gap-1 whitespace-nowrap"><Clock size={10} /> {timeLeft}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity w-full sm:w-auto justify-end border-t border-brand-steel/30 sm:border-0 pt-2 sm:pt-0">
        {/* Extend Deadline Button */}
        <div className="relative">
          <button
            onClick={() => { onToggleExtend(); setCustomEnd(new Date(promo.endDate).toISOString().slice(0, 16)); }}
            className={cn(
              "p-2 border transition-colors",
              isExtendOpen ? "bg-brand-accent border-brand-accent text-brand-dark" : "border-brand-steel hover:bg-brand-steel text-slate-800 dark:text-slate-400"
            )}
            title="Extend deadline"
          >
            <Timer size={14} />
          </button>
          <AnimatePresence mode="wait">
            {isExtendOpen && (
              <motion.div
                initial={{ opacity: 0, y: isFirst ? -5 : 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: isFirst ? -5 : 5 }}
                className={cn("industrial-popover", isFirst && "industrial-popover-down")}
              >
                <p className="text-[9px] text-slate-900 dark:text-slate-500 font-display uppercase tracking-widest mb-2">Extend_Deadline</p>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { label: '30M', h: 0.5 },
                    { label: '1H', h: 1 },
                    { label: '3H', h: 3 },
                    { label: '24H', h: 24 },
                    { label: '1W', h: 168 }
                  ].map(p => (
                    <button
                      key={p.label}
                      onClick={(e) => {
                        e.stopPropagation();
                        const now = Date.now();
                        const currentEnd = new Date(promo.endDate).getTime();
                        const baseTime = Math.max(now, currentEnd);
                        const newEnd = new Date(baseTime + p.h * 3600000).toISOString();

                        // If it was expired, also update startDate to now for a clean active window
                        const updateData: any = { endDate: newEnd };
                        if (currentEnd < now) {
                          updateData.startDate = new Date(now).toISOString();
                        }

                        onUpdate(promo.id, updateData);
                        onToggleExtend();
                      }}
                      className="py-1 text-[8px] border border-brand-steel hover:border-brand-accent hover:text-brand-accent transition-colors font-mono"
                    >{p.label}</button>
                  ))}
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] text-slate-900 dark:text-slate-500 uppercase">Custom end time</p>
                  <input
                    type="datetime-local"
                    className="terminal-input w-full text-[9px] [color-scheme:dark]"
                    value={customEnd}
                    onChange={e => setCustomEnd(e.target.value)}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const now = Date.now();
                      const newEnd = new Date(customEnd).getTime();
                      const updateData: any = { endDate: new Date(customEnd).toISOString() };

                      // If setting to a future time while currently expired, reset startDate
                      if (newEnd > now && new Date(promo.endDate).getTime() < now) {
                        updateData.startDate = new Date(now).toISOString();
                      }

                      onUpdate(promo.id, updateData);
                      onToggleExtend();
                    }}
                    className="btn-industrial btn-primary w-full py-1 text-[8px]"
                  >Apply</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Toggle Active/Inactive */}
        <button
          onClick={() => onToggle(promo.id)}
          className={cn(
            "p-2 border transition-colors flex items-center gap-1 text-[8px] font-mono",
            promo.isActive
              ? "border-brand-accent/40 hover:bg-red-900/20 hover:border-red-500/50 text-brand-accent hover:text-red-400"
              : "border-brand-steel hover:bg-brand-accent/10 hover:border-brand-accent/50 text-slate-900 dark:text-slate-500 hover:text-brand-accent"
          )}
          title={promo.isActive ? 'Deactivate' : 'Reactivate'}
        >
          {promo.isActive ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(promo.id)}
          className="p-2 border border-brand-steel hover:bg-danger/20 hover:border-danger/50 text-slate-900 dark:text-slate-500 hover:text-danger transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

