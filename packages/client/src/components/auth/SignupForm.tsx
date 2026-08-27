import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { observable } from '@legendapp/state';
import { observer } from '@legendapp/state/react';
import { useHardware } from '../../HardwareContext';
import { useAuth } from '../../AuthContext';
import { useMutation } from '@apollo/client';
import { GOOGLE_REGISTER_INSTITUTION, GOOGLE_FINALIZE_PROVISIONING, GOOGLE_DECOMMISSION_REGISTRY } from '../../gql/mutations/auth';
import { toast } from 'sonner';
import { StepIndicator } from './AuthUI';
import fullLogo from '../../../assets/SVG/fulllogo.svg';

// 🏗️ [VANGUARD] Internal Signup Matrix
const signupState$ = observable({
  step: 'IDENTITY' as 'IDENTITY' | 'REGISTRY' | 'PAYMENT' | 'DEPLOYMENT',
  formData: {
    fullName: '',
    email: '',
    password: '',
    businessName: '',
    location: '',
    supportPhone: ''
  },
  ui: {
    showPassword: false,
    isLoading: false,
    error: '',
    provisioningStatus: 'idle' as 'idle' | 'registering' | 'paying' | 'provisioning' | 'success',
    provisioningProgress: '',
    registeredTenantId: null as string | null
  }
});

export const SignupForm = observer(() => {
  const { login } = useHardware();
  const { closeAuth, setMode } = useAuth();

  const [registerInstitution] = useMutation(GOOGLE_REGISTER_INSTITUTION);
  const [finalizeProvisioning] = useMutation(GOOGLE_FINALIZE_PROVISIONING);
  const [decommissionRegistry] = useMutation(GOOGLE_DECOMMISSION_REGISTRY);

  const validateIdentity = () => {
    const { fullName, email, password } = signupState$.formData.get();
    if (!fullName) return "Full Operator Name Required";
    if (!email) return "Operator Identity Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid Identity Format";
    if (!password || password.length < 6) return "Security Protocol must be at least 6 characters";
    return null;
  };

  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateIdentity();
    if (error) {
      signupState$.ui.error.set(error);
      return;
    }
    signupState$.ui.error.set('');
    signupState$.ui.isLoading.set(true);

    // Simulate initial identity check
    setTimeout(() => {
      signupState$.ui.isLoading.set(false);
      signupState$.step.set('REGISTRY');
      toast.success('Identity Registered', { description: 'Phase 01 Complete. Please provide Registry details.' });
    }, 800);
  };

  const handleInstitutionalDeployment = async () => {
    const { businessName, location, supportPhone, email } = signupState$.formData.get();
    if (!businessName || !supportPhone || !location) {
      signupState$.ui.error.set("Registry Data Required");
      return;
    }

    signupState$.ui.provisioningStatus.set('registering');
    signupState$.ui.provisioningProgress.set('[PROTOCOL] Establishing Institutional Link...');

    try {
      const { data: regData } = await registerInstitution({
        variables: {
          name: businessName,
          location,
          phone: supportPhone,
          email
        }
      });

      signupState$.ui.registeredTenantId.set(regData.googleRegisterInstitution.id);
      signupState$.step.set('PAYMENT');
    } catch (err: any) {
      toast.error('Registry Failure', { description: err.message });
      signupState$.ui.provisioningStatus.set('idle');
    }
  };

  const executeVanguardDeployment = async () => {
    const tenantId = signupState$.ui.registeredTenantId.get();
    const password = signupState$.formData.password.get();
    const businessName = signupState$.formData.businessName.get();

    if (!tenantId) return;

    try {
      signupState$.step.set('DEPLOYMENT');
      signupState$.ui.provisioningStatus.set('provisioning');
      signupState$.ui.provisioningProgress.set('[DATABASE] Deploying Fresh Hardware Terminal...');
      await new Promise(r => setTimeout(r, 1500));
      signupState$.ui.provisioningProgress.set('[SECURITY] Migrating Institutional Roles...');

      await finalizeProvisioning({ variables: { tenantId, password } });

      signupState$.ui.provisioningStatus.set('success');
      signupState$.ui.provisioningProgress.set('[SUCCESS] HSM v2.4 Vanguard Terminal is Ready.');
      toast.success('Provisioning Complete', { description: `${businessName} is now live.` });
    } catch (err: any) {
      if (tenantId) {
        await decommissionRegistry({ variables: { tenantId } }).catch(() => { });
        signupState$.ui.registeredTenantId.set(null);
      }
      signupState$.ui.provisioningStatus.set('idle');
      signupState$.step.set('REGISTRY');
      toast.error('Factory Failure', { description: err.message });
    }
  };

  const launchInstitutionalTerminal = async () => {
    signupState$.ui.isLoading.set(true);
    const { email, password } = signupState$.formData.get();
    try {
      await login(email, password);
      closeAuth();
      window.location.href = '/';
    } catch (err: any) {
      toast.error('Identity Retrieval Failed', { description: 'Please login manually.' });
      setMode('login');
      signupState$.step.set('IDENTITY');
    } finally {
      signupState$.ui.isLoading.set(false);
    }
  };

  const renderStep = () => {
    const step = signupState$.step.get();
    const { formData, ui } = signupState$.get();

    switch (step) {
      case 'IDENTITY':
        return (
          <form onSubmit={handleIdentitySubmit} className="space-y-4 pt-2">
            <h3 className="text-[10px] font-black uppercase text-neo-orange border-b-2 border-black/5 pb-2 tracking-[0.2em] italic">Operator Identity</h3>
            <div className="space-y-4 pt-2">
              <input type="text" placeholder="FULL NAME" value={formData.fullName} onChange={(e) => signupState$.formData.fullName.set(e.target.value)}
                className="w-full neo-border py-4 px-6 font-bold text-xs uppercase tracking-wider outline-none focus:bg-neo-orange/5" />
              <input type="email" placeholder="EMAIL ADDRESS" value={formData.email} onChange={(e) => signupState$.formData.email.set(e.target.value)}
                className="w-full neo-border py-4 px-6 font-bold text-xs tracking-wider outline-none focus:bg-neo-orange/5" />
              <div className="relative">
                <input type={ui.showPassword ? "text" : "password"} placeholder="SECURITY KEY" value={formData.password} onChange={(e) => signupState$.formData.password.set(e.target.value)}
                  className="w-full neo-border py-4 px-6 font-bold text-xs tracking-wider outline-none focus:bg-neo-orange/5" />
                <button type="button" onClick={() => signupState$.ui.showPassword.set(!ui.showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {ui.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {ui.error && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{ui.error}</p>}
            <button type="submit" disabled={ui.isLoading} className="w-full bg-black text-white p-6 sm:p-7 font-black uppercase tracking-widest text-sm shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-4 italic disabled:opacity-50">
              {ui.isLoading ? 'ESTABLISHING...' : 'REGISTER OPERATOR'}
              <ArrowRight size={20} />
            </button>
          </form>
        );

      case 'REGISTRY':
        return (
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase text-neo-orange border-b-2 border-black/5 pb-2 tracking-[0.2em] italic">Institutional Registry</h3>
            <div className="space-y-4 pt-2">
              <input type="text" value={formData.businessName} onChange={(e) => signupState$.formData.businessName.set(e.target.value)} placeholder="REGISTERED BUSINESS NAME"
                className="w-full neo-border py-4 px-6 font-bold text-xs uppercase bg-black/5 tracking-wider outline-none focus:bg-white" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" value={formData.location} onChange={(e) => signupState$.formData.location.set(e.target.value)} placeholder="FACILITY LOCATION"
                  className="w-full neo-border py-4 px-5 font-bold text-xs uppercase tracking-wider outline-none focus:bg-neo-orange/5" />
                <input type="tel" value={formData.supportPhone} onChange={(e) => signupState$.formData.supportPhone.set(e.target.value)} placeholder="SUPPORT PHONE"
                  className="w-full neo-border py-4 px-5 font-bold text-xs tracking-wider outline-none focus:bg-neo-orange/5" />
              </div>
            </div>
            {ui.error && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{ui.error}</p>}
            <button onClick={handleInstitutionalDeployment} disabled={!formData.businessName || !formData.supportPhone || !formData.location}
              className="w-full bg-black text-white p-6 sm:p-7 font-black uppercase tracking-widest text-sm shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-4 italic disabled:opacity-50">
              INITIALIZE DEPLOYMENT <ArrowRight size={20} />
            </button>
          </div>
        );

      case 'PAYMENT':
        return (
          <div className="space-y-6 sm:space-y-10 py-4">
            <div className="bg-neo-orange/5 p-6 sm:p-10 border-2 border-black flex flex-col items-center text-center space-y-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <div className="h-16 sm:h-24 filter drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                <img src={fullLogo} alt="TredPOS" className="h-full w-auto object-contain" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic">Institutional Commitment</h3>
              <div className="bg-black text-white px-6 py-2 text-xl sm:text-2xl font-black skew-x-[-12deg]">10,000 USH</div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-[240px] leading-relaxed italic">HSM v2.4 Multi-Tenant Deployment & High-Speed Hardware Buffer</p>
            </div>
            <button onClick={executeVanguardDeployment} className="w-full bg-neo-orange text-white p-6 sm:p-7 font-black uppercase tracking-widest text-sm hover:translate-y-1 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-4 hover:shadow-none italic">
              AUTHORIZE PROTOCOL <ArrowRight size={20} />
            </button>
          </div>
        );

      case 'DEPLOYMENT':
        return (
          <div className="space-y-8">
            <div className={`p-6 sm:p-8 font-mono text-[10px] space-y-4 border-2 shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] ${ui.provisioningStatus === 'success' ? "bg-neo-orange/5 border-black text-black" : "bg-black text-neo-orange border-neo-orange"}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2 h-2 animate-pulse ${ui.provisioningStatus === 'success' ? "bg-black" : "bg-neo-orange"}`} />
                <span className="font-black uppercase text-xs tracking-[0.3em]">Status: {ui.provisioningStatus === 'success' ? 'MISSION_READY' : 'FACTORY_BUILD'}</span>
              </div>
              <div className="space-y-1 opacity-80 leading-relaxed">
                <div>{ui.provisioningStatus === 'success' ? 'SYSTEMS STABILIZED AND CRYPTOGRAPHICALLY ISOLATED' : 'INITIALIZING HSM V2.4 PROVISIONER...'}</div>
                <div className={ui.provisioningStatus === 'success' ? "text-neo-orange font-black" : "text-white"}>{ui.provisioningProgress}</div>
                {ui.provisioningStatus === 'provisioning' && (
                  <div className="w-full h-1 bg-white/10 mt-4 overflow-hidden">
                    <motion.div className="h-full bg-neo-orange" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 3, ease: "linear" }} />
                  </div>
                )}
              </div>
            </div>
            {ui.provisioningStatus === 'success' && (
              <button onClick={launchInstitutionalTerminal} disabled={ui.isLoading} className="w-full bg-black text-white p-6 sm:p-7 font-black uppercase tracking-widest text-sm hover:translate-y-1 transition-all shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] flex items-center justify-center gap-4 border-2 border-black hover:shadow-none italic">
                {ui.isLoading ? 'ESTABLISHING HANDSHAKE...' : 'ENTER VANGUARD TERMINAL'} <ArrowRight size={20} />
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <StepIndicator current={signupState$.step.get()} mode="signup" />
      {renderStep()}
      {signupState$.step.get() === 'IDENTITY' && (
        <div className="mt-8 text-right pt-6 border-t-2 border-black/5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
            Already a partner?
            <button onClick={() => setMode('login')} className="text-neo-orange font-black ml-3 hover:underline underline-offset-4">Secure_Login</button>
          </p>
        </div>
      )}
    </div>
  );
});
