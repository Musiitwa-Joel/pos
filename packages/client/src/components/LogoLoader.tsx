import React from 'react';
import { motion } from 'motion/react';
import logoIcon from '../../assets/SVG/tredpos1.svg';

export default function LogoLoader({ status }: { status?: string }) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-[var(--bg-main)] relative overflow-hidden">
      {/* 🏁 Industrial Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }} 
      />

      <div className="relative flex flex-col items-center gap-4">
        {/* Ambient Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-brand-accent rounded-full blur-3xl"
        />
        
        {/* Animated Logo */}
        <motion.div
          animate={{
            scale: [0.95, 1.05, 0.95],
            rotateY: [0, 10, 0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative w-16 h-16 md:w-20 md:h-20"
        >
          <img
            src={logoIcon}
            alt="Loading..."
            className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]"
          />
        </motion.div>
<div className="flex flex-col items-center gap-1">
        {/* Modular Status Text */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: [0.5, 1, 0.5] }}
           transition={{ duration: 1.5, repeat: Infinity }}
           className="text-[9px] font-display text-brand-accent uppercase tracking-[0.3em] font-black"
        >
          {status ? status.replace(/_/g, ' ') : 'Initializing_Module'}
        </motion.div>
        
        {status && (
          <div className="flex gap-1">
             {[0,1,2].map(i => (
               <motion.div 
                 key={i}
                 animate={{ opacity: [0.2, 1, 0.2] }}
                 transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                 className="w-1 h-1 bg-brand-accent/40 rounded-full"
               />
             ))}
          </div>
        )}
</div>
      </div>
    </div>
  );
}
