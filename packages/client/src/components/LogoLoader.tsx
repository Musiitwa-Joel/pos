import React from 'react';
import logoIcon from '../../assets/SVG/tredpos1.svg';

// 🚀 [VANGUARD] Zero-CPU Loader Engine:
// Optimized for zero re-renders and GPU-accelerated transitions.
const LoaderStyles = () => (
  <style>{`
    @keyframes logo-pulse {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.05); opacity: 1; }
    }
    @keyframes text-fade {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }
    .loader-logo {
      animation: logo-pulse 2s ease-in-out infinite;
      will-change: transform, opacity;
    }
    .loader-text {
      animation: text-fade 1.5s ease-in-out infinite;
    }
  `}</style>
);

export default function LogoLoader({ status }: { status?: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[var(--bg-main)] transition-colors duration-500">
      <LoaderStyles />
      
      <div className="flex flex-col items-center gap-8">
        {/* Sleek, Minimalist Logo Pulse */}
        <div className="w-16 h-16 md:w-20 md:h-20 loader-logo">
          <img
            src={logoIcon}
            alt="Initializing..."
            className="w-full h-full object-contain grayscale opacity-80"
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="text-[9px] font-display text-[var(--text-main)] uppercase tracking-[0.6em] font-medium loader-text opacity-60">
            {status ? status.replace(/_/g, ' ') : 'CORE_INITIALIZATION_ACTIVE'}
          </div>
          
          <div className="flex gap-1">
             {[0, 1, 2].map(i => (
               <div 
                 key={i}
                 className="w-1 h-1 bg-[var(--text-main)] rounded-full opacity-20"
                 style={{ animation: 'text-fade 1.5s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
               />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
