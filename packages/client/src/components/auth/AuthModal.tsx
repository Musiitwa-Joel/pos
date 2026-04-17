import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, Eye, EyeOff, ChevronRight, Key, RefreshCw } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { useHardware } from '../../HardwareContext';
import { toast } from 'sonner';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useMutation } from '@apollo/client';
import { GOOGLE_REGISTER_INSTITUTION, GOOGLE_FINALIZE_PROVISIONING, GOOGLE_DECOMMISSION_REGISTRY, REQUEST_PASSWORD_RESET, VERIFY_PASSWORD_RESET_CODE, FINALIZE_PASSWORD_RESET } from '../../gql/mutations/auth';
import { cn } from '../../lib/utils';
import fullLogo from '../../../assets/SVG/fulllogo.svg';

// Optimized Sub-component to prevent parent rerenders
const StepIndicator = React.memo(({ current, mode = 'signup' }: { current: string, mode?: 'signup' | 'forgot' }) => {
  const signupSteps = ['IDENTITY', 'REGISTRY', 'PAYMENT', 'DEPLOYMENT'];
  const forgotSteps = ['IDENTITY', 'VERIFY', 'RESET', 'SUCCESS'];
  const steps = mode === 'signup' ? signupSteps : forgotSteps;
  const currentIdx = steps.indexOf(current);
  const totalSteps = steps.length;

  return (
    <div className="mb-10 px-1">
      <div className="flex justify-between items-end mb-3">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neo-orange">Phase_0{currentIdx + 1}</span>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{current}</span>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${totalSteps}, 1fr)` }}>
        {steps.map((step, idx) => (
          <div key={step} className={cn(
            "h-1 transition-all duration-700",
            idx <= currentIdx ? "bg-black" : "bg-black/5"
          )} />
        ))}
      </div>
    </div>
  );
});

StepIndicator.displayName = 'StepIndicator';

const SegmentedOTP = React.memo(({ value, onChange, onComplete, disabled }: { value: string, onChange: (val: string) => void, onComplete: () => void, disabled?: boolean }) => {
  const inputs = React.useRef<(HTMLInputElement | null)[]>([]);
  
  const handleDigitChange = (digit: string, idx: number) => {
    if (disabled) return;
    const isNumeric = /^\d?$/.test(digit);
    if (!isNumeric) return;

    const newValue = value.split('');
    newValue[idx] = digit;
    const finalString = newValue.join('').substring(0, 6);
    onChange(finalString);

    if (digit && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  // Trigger completion check
  React.useEffect(() => {
    if (value.length === 6) {
      onComplete();
    }
  }, [value, onComplete]);

  return (
    <div className="flex justify-between gap-2 sm:gap-4">
      {[...Array(6)].map((_, idx) => (
        <div key={idx} className="relative w-full aspect-square sm:w-14 sm:h-20">
          <input
            ref={(el) => { inputs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[idx] || ''}
            onChange={(e) => handleDigitChange(e.target.value, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            disabled={disabled}
            className={cn(
               "w-full h-full neo-border bg-black/5 text-center font-black text-2xl sm:text-4xl focus:border-neo-orange focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(255,107,0,1)] transition-all outline-none",
               disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>
      ))}
    </div>
  );
});

SegmentedOTP.displayName = 'SegmentedOTP';

const AuthModal = React.memo(() => {
  const { showAuthModal, authMode, closeAuth, setMode } = useAuth();
  const { login, loginWithGoogle } = useHardware();

  // AUTH STATE (Isolated to Modal Node)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<'IDENTITY' | 'REGISTRY' | 'PAYMENT' | 'DEPLOYMENT'>('IDENTITY');
  const [recoveryStep, setRecoveryStep] = useState<'IDENTITY' | 'VERIFY' | 'RESET' | 'SUCCESS'>('IDENTITY');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [provisioningStatus, setProvisioningStatus] = useState<'idle' | 'registering' | 'paying' | 'provisioning' | 'success'>('idle');
  const [provisioningProgress, setProvisioningProgress] = useState('');
  const [onboardingTenant, setOnboardingTenant] = useState<{ id: string, email: string } | null>(null);
  const [registeredTenantId, setRegisteredTenantId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [registerInstitution] = useMutation(GOOGLE_REGISTER_INSTITUTION);
  const [finalizeProvisioning] = useMutation(GOOGLE_FINALIZE_PROVISIONING);
  const [decommissionRegistry] = useMutation(GOOGLE_DECOMMISSION_REGISTRY);
  const [requestReset] = useMutation(REQUEST_PASSWORD_RESET);
  const [verifyResetCode] = useMutation(VERIFY_PASSWORD_RESET_CODE);
  const [finalizeReset] = useMutation(FINALIZE_PASSWORD_RESET);

  const googleLoginTrigger = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const res = await loginWithGoogle(tokenResponse.access_token);
        if (!res) throw new Error('No identity token received from gateway.');
        const decoded: any = jwtDecode(res);

        if (decoded.needsOnboarding) {
          setOnboardingTenant({ id: '', email: decoded.username });
          setOnboardingStep('REGISTRY');
          setMode('signup');
          toast.success('Identity Tethered', { description: 'Welcome. Please initialize your Institutional Registry.' });
        } else {
          closeAuth();
        }
      } catch (err: any) {
        toast.error('Identity Protocol Failure', { description: err.message });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => toast.error('Google Handshake Failed')
  });

  const handleRequestReset = useCallback(async () => {
    if (!email) {
      toast.error('Identity Required', { description: 'Please provide your authorized operator email.' });
      return;
    }
    setIsLoading(true);
    try {
      await requestReset({ variables: { email } });
      setRecoveryStep('VERIFY');
      toast.success('Identity Requested', { description: 'Recovery authorization code dispatched to your institutional inbox.' });
    } catch (err: any) {
      toast.error('Protocol Error', { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [email, requestReset]);

  const handleVerifyCode = useCallback(async (codeOverride?: string) => {
    const codeToVerify = codeOverride || recoveryCode;
    if (codeToVerify.length !== 6) return;
    
    setIsLoading(true);
    try {
      await verifyResetCode({ variables: { email, code: codeToVerify } });
      setRecoveryStep('RESET');
      toast.success('Handshake Verified', { description: 'Identity confirmed. Please provision your new security protocol.' });
    } catch (err: any) {
      toast.error('Verification Rejected', { description: err.message });
      setRecoveryCode(''); // Clear on failure
    } finally {
      setIsLoading(false);
    }
  }, [email, recoveryCode, verifyResetCode]);

  const handleFinalizeReset = useCallback(async () => {
    if (!recoveryCode || !password) {
      toast.error('Identity Verification Required', { description: 'Authorization code and new security key required.' });
      return;
    }
    setIsLoading(true);
    try {
      await finalizeReset({ variables: { email, code: recoveryCode, newPassword: password } });
      setRecoveryStep('SUCCESS');
      toast.success('Identity Stabilized', { description: 'Security key updated. You may now initialize your session.' });
    } catch (err: any) {
      toast.error('Handshake Rejected', { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [email, recoveryCode, password, finalizeReset]);

  const handleInstitutionalDeployment = useCallback(async () => {
    if (!businessName || !supportPhone) {
      toast.error('Registry Data Required', { description: 'Please provide Business Name and Support Phone for terminal deployment.' });
      return;
    }

    setProvisioningStatus('registering');
    setProvisioningProgress('[PROTOCOL] Establishing Institutional Link...');

    try {
      const { data: regData } = await registerInstitution({
        variables: {
          name: businessName,
          location: location || 'Remote Terminal',
          phone: supportPhone,
          email: onboardingTenant?.email
        }
      });

      const tenantId = regData.googleRegisterInstitution.id;
      setRegisteredTenantId(tenantId);
      setOnboardingStep('PAYMENT');
    } catch (err: any) {
      toast.error('Registry Failure', { description: err.message });
      setProvisioningStatus('idle');
    }
  }, [businessName, supportPhone, location, onboardingTenant, registerInstitution]);

  const executeVanguardDeployment = useCallback(async (tenantId: string) => {
    try {
      setOnboardingStep('DEPLOYMENT');
      setProvisioningStatus('provisioning');
      setProvisioningProgress('[DATABASE] Deploying Fresh Hardware Terminal...');
      await new Promise(r => setTimeout(r, 1500));
      setProvisioningProgress('[SECURITY] Migrating Institutional Roles...');

      await finalizeProvisioning({ variables: { tenantId, password } });

      setProvisioningStatus('success');
      setProvisioningProgress('[SUCCESS] HSM v2.4 Vanguard Terminal is Ready.');
      toast.success('Provisioning Complete', { description: `${businessName} is now live.` });
    } catch (err: any) {
      if (registeredTenantId) {
        await decommissionRegistry({ variables: { tenantId: registeredTenantId } }).catch(() => { });
        setRegisteredTenantId(null);
      }
      setProvisioningStatus('idle');
      setOnboardingStep('REGISTRY');
      toast.error('Factory Failure', { description: err.message });
    }
  }, [businessName, password, registeredTenantId, finalizeProvisioning, decommissionRegistry]);

  const launchInstitutionalTerminal = useCallback(async () => {
    setIsLoading(true);
    try {
      await login(email, password);
      closeAuth();
      window.location.href = '/'; // Forensic reload to initialize new shell
    } catch (err: any) {
      toast.error('Identity Retrieval Failed', { description: 'Please login manually using your new credentials.' });
      setMode('login');
      setOnboardingStep('IDENTITY');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, login, closeAuth, setMode]);

  const handleAuthSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (authMode === 'signup') {
      if (!email || !password || !fullName) {
        toast.error('Identity Protocol Required', { description: 'Please provide full operator credentials to initialize your account.' });
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setOnboardingTenant({ id: 'manual_pending', email: email });
        setOnboardingStep('REGISTRY');
        toast.success('Identity Registered', { description: 'Phase 01 Complete. Please provide your Institutional Registry details.' });
      }, 800);
      return;
    }

    if (!email || !password) {
      toast.error('Identity Verification Required', { description: 'Please provide both operator identity and security protocol.' });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      closeAuth();
      setEmail('');
      setPassword('');
    } catch (err: any) {
      // HardwareContext already handles the toast
    } finally {
      setIsLoading(false);
    }
  }, [authMode, email, password, fullName, login, closeAuth]);

  const requestId = useMemo(() => Math.random().toString(36).substring(7).toUpperCase(), [authMode, showAuthModal]);

  return (
    <AnimatePresence mode="wait">
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeAuth()}
            className="fixed inset-0 bg-black/90 backdrop-blur-md"
          />

          <motion.div
            key={authMode}
            initial={{ opacity: 0, scale: 0.95, x: authMode === 'login' ? -50 : 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: authMode === 'login' ? 50 : -50 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "relative w-full max-w-5xl neo-border neo-shadow-lg flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] overflow-hidden",
              authMode === 'login' ? "bg-white" : "bg-cream"
            )}
          >
            {/* Close Button */}
            <button
              onClick={() => closeAuth()}
              className="absolute top-4 right-4 p-2 hover:bg-neo-orange transition-colors neo-border bg-white z-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              <X size={18} />
            </button>

            {/* Left Panel: Visual/Information */}
            <div className={cn(
              "w-full md:w-5/12 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b-4 md:border-b-0 md:border-r-4 border-black shrink-0",
              authMode === 'login' ? "bg-black text-white" : "bg-neo-orange text-black"
            )}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl opacity-20" />

              <div className="relative z-10">
                <div className="h-10 sm:h-14 mb-8 filter drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                  <img src={fullLogo} alt="TredPOS" className="h-full w-auto object-contain" style={{ filter: authMode === 'login' ? 'brightness(0) invert(1)' : 'none' }} />
                </div>
                <h3 className="text-3xl sm:text-4xl font-black uppercase leading-[1.1] mb-6 font-display flex flex-col items-start gap-2">
                  {authMode === 'login' ? (
                    <>
                      <span className="bg-neo-orange text-black px-3 py-1 -rotate-1 translate-x-[-4px] italic">Trading_OS</span>
                      <span className="bg-neo-orange text-black px-3 py-1 rotate-1 italic">System_Auth</span>
                    </>
                  ) : (
                    <span className="bg-neo-orange text-black px-3 py-1 italic">Strategic Matrix</span>
                  )}
                </h3>
                <p className={cn(
                  "text-xs sm:text-sm font-bold leading-relaxed max-w-sm mt-4 italic",
                  authMode === 'login' ? "text-white opacity-95 border-l-2 border-neo-orange pl-3" : "text-black/80"
                )}>
                  {authMode === 'login'
                    ? "Access the world's most advanced retail intelligence standard."
                    : "Initialize your institutional commerce presence."
                  }
                </p>
              </div>

              <div className="relative z-10 pt-8 hidden sm:block">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", authMode === 'login' ? "bg-neo-orange" : "bg-black")} />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">Security: Encrypted</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Form */}
            <div className="w-full md:w-7/12 p-6 sm:p-10 flex flex-col justify-center overflow-y-auto bg-white/50 backdrop-blur-sm">
              <div className="max-w-md mx-auto w-full py-4 sm:py-8">
                <div className="mb-6 sm:mb-8 flex items-end justify-between border-b-4 border-black pb-3">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase font-display italic">
                    {authMode === 'login' ? 'System Login' : authMode === 'forgot' ? 'Recover Identity' : 'Create Identity'}
                  </h2>
                  <span className="text-[9px] font-mono text-slate-400 mb-1 hidden sm:block">REQ_ID: {requestId}</span>
                </div>

                <div className="space-y-6">
                  {authMode === 'signup' && <StepIndicator current={onboardingStep} mode="signup" />}
                  {authMode === 'forgot' && <StepIndicator current={recoveryStep} mode="forgot" />}

                  {authMode === 'forgot' ? (
                     <div className="space-y-8">
                        {recoveryStep === 'SUCCESS' ? (
                          <div className="space-y-6 text-center py-8">
                             <div className="w-20 h-20 bg-neo-orange/10 border-2 border-neo-orange rounded-full flex items-center justify-center mx-auto mb-6 shadow-[10px_10px_0px_0px_rgba(255,107,0,0.2)]">
                                <Key className="text-neo-orange" size={40} />
                             </div>
                             <h3 className="text-2xl font-black uppercase italic">Protocol Restored</h3>
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Identity synchronized with new security key. You may now return to the session terminal.</p>
                             <button 
                                onClick={() => { setMode('login'); setRecoveryStep('IDENTITY'); }}
                                className="w-full bg-black text-white p-6 font-black uppercase tracking-widest text-sm hover:translate-y-1 transition-all shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] flex items-center justify-center gap-4 hover:shadow-none italic"
                             >
                                BACK TO LOGIN
                                <ArrowRight size={20} />
                             </button>
                          </div>
                        ) : recoveryStep === 'RESET' ? (
                          <div className="space-y-6">
                             <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase text-neo-orange border-b-2 border-black/5 pb-2 tracking-[0.2em] italic">New Security Protocol</h3>
                                <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase italic">Identity verified. Please provision a new terminal security key to stabilize your session.</p>
                                <div className="relative pt-2">
                                   <input type={showPassword ? "text" : "password"} placeholder="NEW SECURITY KEY (PASSWORD)" value={password} onChange={(e) => setPassword(e.target.value)}
                                     className="w-full neo-border py-4 px-6 font-bold text-xs tracking-wider" />
                                   <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors">
                                     {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                   </button>
                                </div>
                             </div>
                             <button onClick={handleFinalizeReset} disabled={isLoading} className="w-full bg-black text-white p-6 font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 italic">
                                {isLoading ? 'STABILIZING...' : 'FINALIZE RESET'}
                                <ArrowRight size={20} />
                             </button>
                          </div>
                        ) : recoveryStep === 'VERIFY' ? (
                          <div className="space-y-6">
                             <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase text-neo-orange border-b-2 border-black/5 pb-2 tracking-[0.2em] italic">Identity Verification</h3>
                                <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase italic mb-4">Enter the 6-digit authorization code dispatched to your institutional inbox.</p>
                                <SegmentedOTP 
                                   value={recoveryCode} 
                                   onChange={setRecoveryCode} 
                                   onComplete={handleVerifyCode}
                                   disabled={isLoading}
                                />
                             </div>
                             <button onClick={() => handleVerifyCode()} disabled={isLoading || recoveryCode.length < 6} className="w-full bg-black text-white p-6 font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 italic">
                                {isLoading ? 'VERIFYING...' : 'CONFIRM HANDSHAKE'}
                                <ArrowRight size={20} />
                             </button>
                             <button onClick={() => setRecoveryStep('IDENTITY')} className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-neo-orange italic">← Re-issue Code</button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                             <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase text-neo-orange border-b-2 border-black/5 pb-2 tracking-[0.2em] italic">Cluster Identity Request</h3>
                                <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase italic">Enter the email associated with your institutional profile. We will verify your identity across the TredPOS federated cluster.</p>
                                <input type="email" placeholder="OPERATOR EMAIL ADDRESS" value={email} onChange={(e) => setEmail(e.target.value)}
                                   className="w-full neo-border py-4 px-6 font-bold text-xs tracking-wider uppercase" />
                             </div>
                             <button onClick={handleRequestReset} disabled={isLoading} className="w-full bg-black text-white p-6 font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 italic">
                                {isLoading ? 'SCANNING CLUSTERS...' : 'INITIATE RECOVERY'}
                                <ArrowRight size={20} />
                             </button>
                          </div>
                        )}
                     </div>
                  ) : onboardingStep === 'DEPLOYMENT' ? (
                    <div className="space-y-8">
                      <div className={cn(
                        "p-6 sm:p-8 font-mono text-[10px] space-y-4 border-2 shadow-[8px_8px_0px_0px_rgba(255,107,0,1)]",
                        provisioningStatus === 'success' ? "bg-neo-orange/5 border-black text-black" : "bg-black text-neo-orange border-neo-orange"
                      )}>
                        <div className="flex items-center gap-2 mb-4">
                          <div className={cn("w-2 h-2 animate-pulse", provisioningStatus === 'success' ? "bg-black" : "bg-neo-orange")} />
                          <span className="font-black uppercase text-xs tracking-[0.3em]">Status: {provisioningStatus === 'success' ? 'MISSION_READY' : 'FACTORY_BUILD'}</span>
                        </div>
                        <div className="space-y-1 opacity-80 leading-relaxed">
                          <div>{provisioningStatus === 'success' ? 'SYSTEMS STABILIZED AND CRYPTOGRAPHICALLY ISOLATED' : 'INITIALIZING HSM V2.4 PROVISIONER...'}</div>
                          <div className={cn(provisioningStatus === 'success' ? "text-neo-orange font-black" : "text-white")}>{provisioningProgress}</div>
                          {provisioningStatus === 'provisioning' && (
                            <div className="w-full h-1 bg-white/10 mt-4 overflow-hidden">
                              <motion.div
                                className="h-full bg-neo-orange"
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 3, ease: "linear" }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {provisioningStatus === 'success' && (
                        <button
                          onClick={launchInstitutionalTerminal}
                          disabled={isLoading}
                          className="w-full bg-black text-white p-6 sm:p-7 font-black uppercase tracking-widest text-sm hover:translate-y-1 transition-all shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] flex items-center justify-center gap-4 border-2 border-black hover:shadow-none italic"
                        >
                          {isLoading ? 'ESTABLISHING HANDSHAKE...' : 'ENTER VANGUARD TERMINAL'}
                          <ArrowRight size={20} />
                        </button>
                      )}
                    </div>
                  ) : onboardingStep === 'PAYMENT' ? (
                    <div className="space-y-6 sm:space-y-10 py-4">
                      <div className="bg-neo-orange/5 p-6 sm:p-10 border-2 border-black flex flex-col items-center text-center space-y-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                        <div className="h-16 sm:h-24 mb-2 filter drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                          <img src={fullLogo} alt="TredPOS" className="h-full w-auto object-contain" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter font-display italic">Institutional Commitment</h3>
                        <div className="bg-black text-white px-6 py-2 text-xl sm:text-2xl font-black rounded-none skew-x-[-12deg]">
                          10,000 USH
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-[240px] leading-relaxed italic">
                          HSM v2.4 Multi-Tenant Deployment & High-Speed Hardware Buffer
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (!registeredTenantId) return;
                          executeVanguardDeployment(registeredTenantId);
                        }}
                        className="w-full bg-neo-orange text-white p-6 sm:p-7 font-black uppercase tracking-widest text-sm hover:translate-y-1 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-4 hover:shadow-none italic"
                      >
                        AUTHORIZE PROTOCOL
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  ) : onboardingStep === 'REGISTRY' ? (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase text-neo-orange border-b-2 border-black/5 pb-2 tracking-[0.2em] italic">Institutional Registry</h3>
                        <div className="space-y-4 pt-2">
                          <input
                            type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                            placeholder="REGISTERED BUSINESS NAME"
                            className="w-full neo-border py-4 px-6 font-bold text-xs uppercase bg-black/5 tracking-wider"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                              type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                              placeholder="FACILITY LOCATION"
                              className="w-full neo-border py-4 px-5 font-bold text-xs uppercase tracking-wider"
                            />
                            <input
                              type="tel" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)}
                              placeholder="SUPPORT PHONE"
                              className="w-full neo-border py-4 px-5 font-bold text-xs tracking-wider"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleInstitutionalDeployment}
                        disabled={!businessName || !supportPhone || !location}
                        className="w-full bg-black text-white p-6 sm:p-7 font-black uppercase tracking-widest text-sm hover:translate-y-1 transition-all shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] flex items-center justify-center gap-4 border-2 border-black disabled:opacity-50 hover:shadow-none italic"
                      >
                        INITIALIZE DEPLOYMENT
                        <ArrowRight size={20} />
                      </button>

                      <button
                        onClick={() => setOnboardingStep('IDENTITY')}
                        className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-neo-orange transition-colors italic"
                      >
                        ← Return to Operator Identity
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="space-y-6">
                        {authMode === 'signup' ? (
                          <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase text-neo-orange border-b-2 border-black/5 pb-2 tracking-[0.2em] italic">Operator Identity</h3>
                            <div className="space-y-4 pt-2">
                              <input type="text" placeholder="FULL NAME" value={fullName} onChange={(e) => setFullName(e.target.value)}
                                className="w-full neo-border py-4 px-6 font-bold text-xs uppercase tracking-wider" />
                              <input type="email" placeholder="EMAIL ADDRESS" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full neo-border py-4 px-6 font-bold text-xs tracking-wider" />
                              <div className="relative">
                                <input type={showPassword ? "text" : "password"} placeholder="SECURITY KEY" value={password} onChange={(e) => setPassword(e.target.value)}
                                  className="w-full neo-border py-4 px-6 font-bold text-xs tracking-wider" />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors"
                                >
                                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500 italic">Authorized Operator Email</label>
                              <input type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full neo-border py-4 px-6 font-bold text-xs tracking-wider uppercase" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Security Protocol (Password)</label>
                                <button 
                                  onClick={() => { setMode('forgot'); setRecoveryStep('IDENTITY'); }}
                                  className="text-[9px] font-black uppercase text-neo-orange hover:underline underline-offset-2 italic"
                                >
                                  Forgot?
                                </button>
                              </div>
                              <div className="relative">
                                <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)}
                                  className="w-full neo-border py-4 px-6 font-bold text-xs tracking-wider" />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors"
                                >
                                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        <button onClick={handleAuthSubmit} disabled={isLoading}
                          className="w-full bg-black text-white p-6 sm:p-7 font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 italic"
                        >
                          {isLoading ? 'ESTABLISHING...' : authMode === 'login' ? 'INITIALIZE SESSION' : 'REGISTER OPERATOR'}
                          <ArrowRight size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 text-right pt-6 border-t-2 border-black/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                    {authMode === 'login' ? "New Operator?" : "Already a partner?"}
                    <button
                      onClick={() => {
                        setMode(authMode === 'login' ? 'signup' : 'login');
                        setOnboardingTenant(null); 
                      }}
                      className="text-neo-orange font-black ml-3 hover:underline underline-offset-4"
                    >
                      {authMode === 'login' ? 'Initialize_Signup' : 'Secure_Login'}
                    </button>
                  </p>
                </div>
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
