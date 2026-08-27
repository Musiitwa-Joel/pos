import { observer } from '@legendapp/state/react';
import { Smartphone, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../../lib/utils';

interface ShiftModalsProps {
  ui$: any;
  confirm$: any;
  shiftStats: any;
  handleOpenShift: () => void;
  handleCloseShift: () => void;
  onExit?: () => void;
}

// 🔐 [VANGUARD] Terminal Shift Control:
// Handles the mission-critical register locking and auditing modals.
export const ShiftModals = observer(({
  ui$,
  confirm$,
  shiftStats: shiftStats$,
  handleOpenShift,
  handleCloseShift,
  onExit
}: ShiftModalsProps) => {
  const showOpeningModal = ui$.showOpeningModal.get();
  const showClosingModal = ui$.showClosingModal.get();
  const openingCashInput = ui$.openingCashInput.get();
  const closingCashInput = ui$.closingCashInput.get();
  const shiftStats = shiftStats$.get();
  const isFetchingStats = ui$.isFetchingStats.get();

  if (!showOpeningModal && !showClosingModal) return null;

  return (
    <>
      {/* Shift Opening Modal */}
      {showOpeningModal && (
        <div className="absolute inset-0 z-[100] bg-brand-dark/95 backdrop-blur-xl flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="industrial-panel p-5 sm:p-8 w-full max-w-md flex flex-col gap-6"
          >
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-accent/20 border border-brand-accent/40 text-brand-accent mx-auto flex items-center justify-center rounded mb-4">
                <Smartphone size={window.innerWidth < 768 ? 24 : 32} />
              </div>
              <h2 className="text-lg md:text-2xl font-display text-[var(--text-main)] uppercase break-words leading-tight">
                Register_Locked
              </h2>
              <p className="text-[9px] sm:text-[10px] text-slate-900 dark:text-slate-500 font-mono mt-2 uppercase tracking-widest leading-relaxed">
                A shift must be opened before processing sales.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-display text-slate-800 dark:text-slate-400">
                  STARTING_CASH_FLOAT (USh)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="terminal-input w-full h-12 text-lg font-mono text-brand-accent text-center"
                  placeholder="0.00"
                  value={openingCashInput}
                  onChange={(e: any) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    ui$.openingCashInput.set(val);
                  }}
                  autoFocus
                />
              </div>
              <button
                onClick={handleOpenShift}
                className="btn-industrial btn-primary w-full py-4 text-[9px] sm:text-[10px] font-display uppercase tracking-widest"
              >
                Open_Register_Terminal
              </button>

              {onExit && (
                <button
                  onClick={onExit}
                  className="w-full py-2 border border-brand-steel/30 text-slate-900 dark:text-slate-500 hover:text-brand-accent hover:bg-brand-accent/5 text-[8px] font-display uppercase tracking-[0.2em] transition-all"
                >
                  Return_To_Intelligence_Hub
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Shift Closing Modal */}
      {showClosingModal && (
        <div className="absolute inset-0 z-[100] bg-brand-dark/95 backdrop-blur-xl flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="industrial-panel p-5 sm:p-8 w-full max-w-md flex flex-col gap-6"
          >
            <div className="text-center">
              <h2 className="text-lg md:text-2xl font-display text-[var(--text-main)] uppercase break-words leading-tight">
                Close_Register_Audit
              </h2>
              <p className="text-[9px] sm:text-[10px] text-slate-900 dark:text-slate-500 font-mono mt-2 uppercase tracking-widest leading-relaxed">
                Perform physical cash count for verification.
              </p>
            </div>

            <div className="space-y-4">
              {shiftStats && (
                <div className="p-4 bg-brand-steel/5 border border-brand-steel/20 rounded flex flex-col items-center justify-center space-y-2">
                  <span className="text-[10px] font-display text-slate-500 uppercase tracking-widest">
                    System_Expected_Balance
                  </span>
                  <span className="text-2xl font-mono font-black text-brand-accent">
                    {isFetchingStats
                      ? "..."
                      : formatCurrency(shiftStats.expectedCash)}
                  </span>
                  <div className="flex gap-4 text-[8px] font-mono text-slate-400 mt-2">
                    <div className="flex flex-col items-center">
                      <span className="opacity-60">RECOVERY</span>
                      <span className="text-success font-bold">
                        {formatCurrency(shiftStats.recoveryTotal)}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="opacity-60">REFUNDS</span>
                      <span className="text-danger font-bold">
                        -{formatCurrency(shiftStats.refundsTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[9px] font-display text-slate-800 dark:text-slate-400">
                  PHYSICAL_CASH_ON_HAND (USh)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="terminal-input w-full h-12 text-lg font-mono text-success text-center"
                  placeholder="Count your cash..."
                  value={closingCashInput}
                  onChange={(e: any) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    ui$.closingCashInput.set(val);
                  }}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => ui$.showClosingModal.set(false)}
                  className="btn-industrial btn-outline py-3 text-[10px]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirm$.set({
                    isOpen: true,
                    title: "AUTHORIZE_SHIFT_CLOSURE",
                    message: "Ensure physical cash counts are accurate. Finalize?",
                    onConfirm: handleCloseShift,
                    confirmText: "FINALIZE",
                    type: "danger"
                  })}
                  className="btn-industrial bg-danger hover:bg-danger/80 text-white py-3 text-[10px] font-display uppercase"
                >
                  Finalize_&_Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
});
