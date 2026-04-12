import React from 'react';
import { motion } from 'motion/react';
import { useHardware } from '../HardwareContext';
import logoIcon from '../../assets/SVG/tredpos1.svg';
import { cn } from '../lib/utils';

export default function BrandedLoader({ isLightMode }: { isLightMode?: boolean }) {
  const { settings, loadingStatus } = useHardware();

  // Extract initials from COMPANY_NAME (e.g., "MUKONO GENERAL HARDWARE" -> "MGH")
  const companyName = settings.COMPANY_NAME || 'SYSTEM';
  const initials = companyName
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 3)
    .toUpperCase();

  return (
    <div className={cn(
      "fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md transition-colors duration-500",
      isLightMode ? "bg-slate-50/90" : "bg-[#020617]/95"
    )}>
      <div className="relative flex flex-col items-center">
        {/* Outer Tech Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className={cn(
            "w-48 h-48 border rounded-full flex items-center justify-center transition-colors",
            isLightMode ? "border-slate-300" : "border-brand-accent/20"
          )}
        >
          <div className={cn(
            "w-full h-px absolute rotate-45 transition-colors",
            isLightMode ? "bg-slate-200" : "bg-gradient-to-r from-transparent via-brand-accent/30 to-transparent"
          )} />
          <div className={cn(
            "w-full h-px absolute -rotate-45 transition-colors",
            isLightMode ? "bg-slate-200" : "bg-gradient-to-r from-transparent via-brand-accent/30 to-transparent"
          )} />
        </motion.div>

        {/* Spinning Dashed Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className={cn(
            "absolute inset-0 m-auto w-36 h-36 border-2 border-dashed rounded-full transition-colors",
            isLightMode ? "border-slate-400" : "border-brand-accent/40"
          )}
        />

        {/* Central Core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.8, 1, 0.8], scale: [0.95, 1, 0.95] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 filter drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]"
          >
            <img src={logoIcon} alt="Logo" className="w-full h-full object-contain" style={{ filter: isLightMode ? 'none' : 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }} />
          </motion.div>
        </div>

        {/* Status Section */}
        <div className="mt-12 flex flex-col items-center gap-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 140 }}
            className={cn(
              "h-1 transition-all",
              isLightMode ? "bg-slate-900 shadow-[0_0_8px_rgba(0,0,0,0.15)]" : "bg-brand-accent shadow-[0_0_10px_#F97316]"
            )}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "text-[9px] font-mono tracking-[0.4em] uppercase font-bold transition-colors",
              isLightMode ? "text-slate-900 dark:text-slate-500" : "text-brand-accent"
            )}
          >
            {loadingStatus || 'LOADING DATA......'}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
