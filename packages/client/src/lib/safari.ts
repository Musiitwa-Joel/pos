/**
 * [HSM v2.6] Institutional Safari Hardening Protocol
 * Corrects Webkit-specific layout drifting, viewport miscalculations, 
 * and flexbox-rendering race conditions.
 */

export function initSafariHardening() {
  // 1. Fix 100vh issues on mobile Safari (The 'svh' equivalent for legacy Webkit)
  function setVhVariable() {
    if (typeof window === 'undefined') return;
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  // Run on load and resize
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', setVhVariable);
    window.addEventListener('load', setVhVariable);
    setVhVariable();

    // 2. Safari Detection & Force Redraw Protocol
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      console.log("[HSM] Safari Detected: Applying institutional layout hardening...");
      
      // Force redraw for critical flex/grid components to prevent 'ghost-wrapping'
      const containers = document.querySelectorAll('.flex-container, .grid-container, .industrial-panel-header');
      containers.forEach(el => {
        const item = el as HTMLElement;
        const originalDisplay = item.style.display;
        item.style.display = 'none';
        item.offsetHeight; // Trigger reflow
        item.style.display = originalDisplay;
      });
    }
  }
}
