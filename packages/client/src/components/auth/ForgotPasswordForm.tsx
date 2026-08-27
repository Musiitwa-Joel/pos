import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Eye, EyeOff, Key } from 'lucide-react';
import { observable } from '@legendapp/state';
import { observer } from '@legendapp/state/react';
import { useAuth } from '../../AuthContext';
import { useMutation } from '@apollo/client';
import { REQUEST_PASSWORD_RESET, VERIFY_PASSWORD_RESET_CODE, FINALIZE_PASSWORD_RESET } from '../../gql/mutations/auth';
import { toast } from 'sonner';
import { StepIndicator, SegmentedOTP } from './AuthUI';

// 🛡️ [VANGUARD] Internal Recovery Matrix
const recoverState$ = observable({
  step: 'IDENTITY' as 'IDENTITY' | 'VERIFY' | 'RESET' | 'SUCCESS',
  email: '',
  code: '',
  newPassword: '',
  ui: {
    showPassword: false,
    isLoading: false,
    error: ''
  }
});

export const ForgotPasswordForm = observer(() => {
  const { setMode } = useAuth();
  
  const [requestReset] = useMutation(REQUEST_PASSWORD_RESET);
  const [verifyResetCode] = useMutation(VERIFY_PASSWORD_RESET_CODE);
  const [finalizeReset] = useMutation(FINALIZE_PASSWORD_RESET);

  const handleRequestReset = async () => {
    const email = recoverState$.email.get();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      recoverState$.ui.error.set("Valid Operator Email Required");
      return;
    }
    
    recoverState$.ui.isLoading.set(true);
    try {
      await requestReset({ variables: { email } });
      recoverState$.step.set('VERIFY');
      recoverState$.ui.error.set('');
      toast.success('Identity Requested', { description: 'Recovery code dispatched to inbox.' });
    } catch (err: any) {
      recoverState$.ui.error.set(err.message);
    } finally {
      recoverState$.ui.isLoading.set(false);
    }
  };

  const handleVerifyCode = async (codeOverride?: string) => {
    const email = recoverState$.email.get();
    const code = codeOverride || recoverState$.code.get();
    if (code.length !== 6) return;
    
    recoverState$.ui.isLoading.set(true);
    try {
      await verifyResetCode({ variables: { email, code } });
      recoverState$.step.set('RESET');
      recoverState$.ui.error.set('');
      toast.success('Handshake Verified');
    } catch (err: any) {
      recoverState$.ui.error.set(err.message);
      recoverState$.code.set(''); 
    } finally {
      recoverState$.ui.isLoading.set(false);
    }
  };

  const handleFinalizeReset = async () => {
    const email = recoverState$.email.get();
    const code = recoverState$.code.get();
    const newPassword = recoverState$.newPassword.get();

    if (!newPassword || newPassword.length < 6) {
      recoverState$.ui.error.set("Security key must be at least 6 characters");
      return;
    }

    recoverState$.ui.isLoading.set(true);
    try {
      await finalizeReset({ variables: { email, code, newPassword } });
      recoverState$.step.set('SUCCESS');
      recoverState$.ui.error.set('');
      toast.success('Identity Stabilized');
    } catch (err: any) {
      recoverState$.ui.error.set(err.message);
    } finally {
      recoverState$.ui.isLoading.set(false);
    }
  };

  const renderStep = () => {
    const step = recoverState$.step.get();
    const { email, code, newPassword, ui } = recoverState$.get();

    switch (step) {
      case 'IDENTITY':
        return (
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase text-neo-orange border-b-2 border-black/5 pb-2 tracking-[0.2em] italic">Cluster Identity Request</h3>
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase italic">Enter the email associated with your institutional profile. We will verify your identity across the TredPOS federated cluster.</p>
            <input type="email" placeholder="OPERATOR EMAIL ADDRESS" value={email} onChange={(e) => recoverState$.email.set(e.target.value)}
              className="w-full neo-border py-4 px-6 font-bold text-xs tracking-wider uppercase outline-none focus:bg-neo-orange/5" />
            
            {ui.error && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{ui.error}</p>}
            <button onClick={handleRequestReset} disabled={ui.isLoading} className="w-full bg-black text-white p-6 sm:p-7 font-black uppercase tracking-widest text-sm shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-4 italic disabled:opacity-50">
               {ui.isLoading ? 'SCANNING CLUSTERS...' : 'INITIATE RECOVERY'} <ArrowRight size={20} />
            </button>
            <button onClick={() => setMode('login')} className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-neo-orange italic">← Back to Login</button>
          </div>
        );

      case 'VERIFY':
        return (
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase text-neo-orange border-b-2 border-black/5 pb-2 tracking-[0.2em] italic">Identity Verification</h3>
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase italic">Enter the 6-digit authorization code dispatched to your institutional inbox.</p>
            <SegmentedOTP value={code} onChange={(val) => recoverState$.code.set(val)} onComplete={handleVerifyCode} disabled={ui.isLoading} />
            
            {ui.error && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{ui.error}</p>}
            <button onClick={() => handleVerifyCode()} disabled={ui.isLoading || code.length < 6} className="w-full bg-black text-white p-6 sm:p-7 font-black uppercase tracking-widest text-sm shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-4 italic disabled:opacity-50">
               {ui.isLoading ? 'VERIFYING...' : 'CONFIRM HANDSHAKE'} <ArrowRight size={20} />
            </button>
            <button onClick={() => recoverState$.step.set('IDENTITY')} className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-neo-orange italic">← Re-issue Code</button>
          </div>
        );

      case 'RESET':
        return (
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase text-neo-orange border-b-2 border-black/5 pb-2 tracking-[0.2em] italic">New Security Protocol</h3>
            <div className="relative pt-2">
              <input type={ui.showPassword ? "text" : "password"} placeholder="NEW SECURITY KEY (PASSWORD)" value={newPassword} onChange={(e) => recoverState$.newPassword.set(e.target.value)}
                className="w-full neo-border py-4 px-6 font-bold text-xs tracking-wider outline-none focus:bg-neo-orange/5" />
              <button type="button" onClick={() => recoverState$.ui.showPassword.set(!ui.showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black">
                {ui.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            {ui.error && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{ui.error}</p>}
            <button onClick={handleFinalizeReset} disabled={ui.isLoading} className="w-full bg-black text-white p-6 sm:p-7 font-black uppercase tracking-widest text-sm shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-4 italic disabled:opacity-50">
               {ui.isLoading ? 'STABILIZING...' : 'FINALIZE RESET'} <ArrowRight size={20} />
            </button>
          </div>
        );

      case 'SUCCESS':
        return (
          <div className="space-y-6 text-center py-8">
            <div className="w-20 h-20 bg-neo-orange/10 border-2 border-neo-orange rounded-full flex items-center justify-center mx-auto mb-6 shadow-[10px_10px_0px_0px_rgba(255,107,0,0.2)]">
              <Key className="text-neo-orange" size={40} />
            </div>
            <h3 className="text-2xl font-black uppercase italic">Protocol Restored</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Identity synchronized with new security key.</p>
            <button onClick={() => { setMode('login'); recoverState$.step.set('IDENTITY'); }} className="w-full bg-black text-white p-6 font-black uppercase tracking-widest text-sm hover:translate-y-1 transition-all shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] flex items-center justify-center gap-4 hover:shadow-none italic">
               BACK TO LOGIN <ArrowRight size={20} />
            </button>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <StepIndicator current={recoverState$.step.get()} mode="forgot" />
      {renderStep()}
    </div>
  );
});
