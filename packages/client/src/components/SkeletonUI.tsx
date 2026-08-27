import React from 'react';

// 🚀 [VANGUARD] Zero-CPU Pulse Engine:
// Moves the heartbeat from the main thread (JS) to the GPU (CSS).
// This eliminates fan noise completely while maintaining a professional 'pulse'.

export const SkeletonPulseStyle = () => (
  <style>{`
    @keyframes legend-pulse {
      0% { opacity: 0.4; }
      50% { opacity: 0.8; }
      100% { opacity: 0.4; }
    }
    .skeleton-pulse {
      animation: legend-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      will-change: opacity;
      transform: translateZ(0); /* Force GPU composite layer */
    }
  `}</style>
);

export const SkeletonBox = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <div 
    className={`bg-slate-800/40 rounded-sm skeleton-pulse ${className}`}
    style={style}
  />
);

export const SkeletonText = ({ width = 'w-32', height = 'h-3', className }: { width?: string; height?: string; className?: string }) => (
  <div 
    className={`${width} ${height} bg-slate-800/30 rounded-full skeleton-pulse ${className}`}
  />
);

export const SkeletonCircle = ({ size = 'w-10 h-10', className }: { size?: string; className?: string }) => (
  <div 
    className={`${size} bg-slate-800/40 rounded-full skeleton-pulse ${className}`}
  />
);
