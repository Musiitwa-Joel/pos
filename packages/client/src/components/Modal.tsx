import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-md" }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="industrial-modal-overlay">
          {/* Isolate backdrop effect from content to prevent rendering artifacts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="industrial-modal-backdrop"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "industrial-modal-content rounded-lg transform-gpu",
              maxWidth
            )}
          >
            <div className="flex items-start justify-between px-6 py-4 border-b border-brand-steel bg-[var(--bg-inset)]">
              <h2 className="text-[10px] font-display text-[var(--text-main)] uppercase tracking-tight font-bold leading-tight break-words pr-4">{title}</h2>
              <button 
                onClick={onClose}
                className="p-1.5 text-slate-800 dark:text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
