import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { observer } from '@legendapp/state/react';
import { cn } from '../lib/utils';

interface ConfirmDialogProps {
  ui$?: any; // The record-observable for high-perf blades
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default observer(function ConfirmDialog(props: ConfirmDialogProps) {
  // 🛰️ [VANGUARD] Polymorphic Data Extraction:
  // Detect if we are using an observable blade or legacy primitive props.
  const isObservable = !!props.ui$ && typeof props.ui$.get === 'function';
  
  const uiData = isObservable ? props.ui$.get() : {
    isOpen: props.isOpen,
    title: props.title,
    message: props.message,
    confirmText: props.confirmText || "CONFIRM_ACTION",
    cancelText: props.cancelText || "CANCEL",
    type: props.type || 'danger',
    onConfirm: props.onConfirm
  };

  const {
    isOpen,
    title,
    message,
    confirmText = "CONFIRM_ACTION",
    cancelText = "CANCEL",
    type = 'danger',
    onConfirm
  } = uiData;
  
  const isProcessing = (isObservable ? uiData.isLoading : props.isLoading) || false;

  const iconMap = {
    danger: <AlertCircle className="text-red-500" size={22} />,
    warning: <AlertTriangle className="text-amber-500" size={22} />,
    info: <Info className="text-blue-500" size={22} />
  };

  const buttonClassMap = {
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20",
    warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-900/20",
    info: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
  };

  const handleClose = () => {
    if (isProcessing) return;
    if (isObservable) {
      props.ui$.set((prev: any) => ({ ...prev, isOpen: false }));
    } else if (props.onClose) {
      props.onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden transform-gpu">
          {/* Backdrop Handshake */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog Architecture: Ant Design Aesthetic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-[400px] bg-[var(--bg-main)] border border-brand-steel/50 shadow-2xl rounded-sm overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  {iconMap[type]}
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-[13px] font-display text-[var(--text-main)] font-bold tracking-tight uppercase leading-none">
                    {title}
                  </h3>
                  <p className="text-[11px] text-slate-800 dark:text-slate-400 font-medium leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-brand-steel/20">
                <button
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="px-4 py-2 text-[10px] font-display text-slate-500 hover:text-[var(--text-main)] transition-all hover:bg-white/5 disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={async () => {
                    if (onConfirm) await onConfirm();
                    handleClose();
                  }}
                  disabled={isProcessing}
                  className={cn(
                    "px-6 py-2 text-[10px] font-display font-bold tracking-widest rounded-sm transition-all disabled:opacity-50 flex items-center gap-2",
                    buttonClassMap[type]
                  )}
                >
                  {isProcessing && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
                    />
                  )}
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});
