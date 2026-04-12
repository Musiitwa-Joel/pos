import React, { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

export default function TopLoader({ isLoading }: { isLoading: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setProgress(10);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          // Simulate erratic natural progress
          return prev + Math.random() * 15;
        });
      }, 300);
    } else {
      if (progress > 0) {
        setProgress(100);
        setTimeout(() => setProgress(0), 400); // Wait for transition then reset
      }
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-[9999] pointer-events-none">
      <div 
        className={cn(
          "h-full bg-brand-accent shadow-[0_0_10px_#f97316] transition-all duration-300 ease-out",
          progress === 0 && "opacity-0"
        )}
        style={{ width: `${progress}%` }}
      >
        <div className="absolute top-0 right-0 w-24 h-full bg-white opacity-80 dark:opacity-50 blur-sm shadow-[0_0_10px_white] animate-[pulse_1s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
