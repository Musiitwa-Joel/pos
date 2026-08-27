import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { cn } from '../../lib/utils';
import { observer } from '@legendapp/state/react';
import fullLogo from '../../../assets/SVG/fulllogo.svg';

// Modular Forms
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

const AuthModal = observer(() => {
  const { showAuthModal, authMode, closeAuth } = useAuth();

  const requestId = useMemo(() => Math.random().toString(36).substring(7).toUpperCase(), [authMode, showAuthModal]);

  return (
    <AnimatePresence mode="wait">
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeAuth()}
            className="fixed inset-0"
          />

          <motion.div
            key={authMode === 'register' ? 'signup' : authMode}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "relative w-full max-w-5xl neo-border neo-shadow-lg flex flex-col md:flex-row max-h-fit md:max-h-[90vh] overflow-hidden z-10",
              (authMode === 'login' || authMode === 'signup') ? "bg-white" : "bg-[#FDFCF8]"
            )}
          >
            {/* Close Button - Responsive Positioning */}
            <button
              onClick={() => closeAuth()}
              className="absolute top-4 right-4 p-2 hover:bg-neo-orange transition-colors neo-border bg-white z-[60] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              <X size={18} />
            </button>

            {/* Left Panel: Visual/Status Branding */}
            <div className={cn(
              "w-full md:w-5/12 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b-4 md:border-b-0 md:border-r-4 border-black shrink-0 min-h-[220px] md:min-h-0",
              authMode === 'login' ? "bg-black text-white" : "bg-neo-orange text-black"
            )}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl opacity-20" />

              <div className="relative z-10">
                <div className="h-10 sm:h-14 mb-8 filter drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                  <img
                    src={fullLogo}
                    alt="TredPOS"
                    className="h-full w-auto object-contain"
                    style={{ filter: authMode === 'login' ? 'brightness(0) invert(1)' : 'none' }}
                  />
                </div>
                <h3 className="text-2xl sm:text-4xl font-black uppercase leading-[1.1] mb-6 font-display flex flex-col items-start gap-2">
                  {authMode === 'login' ? (
                    <>
                      <span className="bg-neo-orange text-black px-3 py-1 -rotate-1 translate-x-[-4px] italic text-base sm:text-2xl">Trading_OS</span>
                      <span className="bg-neo-orange text-black px-3 py-1 rotate-1 italic text-base sm:text-2xl">System_Auth</span>
                    </>
                  ) : (
                    <span className="bg-neo-orange text-black px-3 py-1 italic text-base sm:text-2xl">Strategic Matrix</span>
                  )}
                </h3>
                <p className={cn(
                  "text-[10px] sm:text-xs font-bold leading-relaxed max-w-sm mt-4 italic",
                  authMode === 'login' ? "text-white opacity-95 border-l-2 border-neo-orange pl-3" : "text-black/80"
                )}>
                  {authMode === 'login'
                    ? "Access the world's most advanced retail intelligence standard."
                    : "Initialize your institutional commerce presence."
                  }
                </p>
              </div>

              <div className="relative z-10 pt-8 hidden md:block">
                <div className="flex items-center gap-2">
                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", authMode === 'login' ? "bg-neo-orange" : "bg-black")} />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">Security: Vanguard_Encrypted</span>
                </div>
              </div>
            </div>

            {/* Right Panel: Functional Form Area */}
            <div className="w-full md:w-7/12 p-6 sm:p-12 flex flex-col justify-start md:justify-center overflow-y-auto bg-white/50 backdrop-blur-sm max-h-[60vh] md:max-h-none">
              <div className="max-w-md mx-auto w-full py-4">
                <div className="mb-8 flex items-end justify-between border-b-4 border-black pb-3">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase font-display italic">
                    {authMode === 'login' ? 'System Login' : authMode === 'forgot' ? 'Recover Identity' : 'Create Identity'}
                  </h2>
                  <span className="text-[9px] font-mono text-slate-400 mb-1 hidden sm:block">REQ_ID: {requestId}</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={authMode}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {authMode === 'login' && <LoginForm />}
                    {authMode === 'register' && <SignupForm />}
                    {authMode === 'forgot' && <ForgotPasswordForm />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

AuthModal.displayName = 'AuthModal';

export default AuthModal;
