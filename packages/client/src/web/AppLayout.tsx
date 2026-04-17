import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Zap, Menu, X, Globe, Star, CheckCircle2, ArrowRight, Eye, EyeOff, Facebook, Instagram, Twitter } from 'lucide-react';
import wordLogo from '../../assets/SVG/wordlogo.svg';
import fullLogo from '../../assets/SVG/fulllogo.svg';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../AuthContext';
import { useHardware } from '../HardwareContext';
import { toast } from 'sonner';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useMutation } from '@apollo/client';
import { GOOGLE_REGISTER_INSTITUTION, GOOGLE_FINALIZE_PROVISIONING, GOOGLE_DECOMMISSION_REGISTRY } from '../gql/mutations/auth';

export default function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { showAuthModal, authMode, openAuth, closeAuth, setMode } = useAuth();
  const { login, loginWithGoogle } = useHardware();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // AUTH STATE
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<'IDENTITY' | 'REGISTRY' | 'PAYMENT' | 'DEPLOYMENT'>('IDENTITY');
  const [provisioningStatus, setProvisioningStatus] = useState<'idle' | 'registering' | 'paying' | 'provisioning' | 'success'>('idle');
  const [provisioningProgress, setProvisioningProgress] = useState('');
  const [onboardingTenant, setOnboardingTenant] = useState<{ id: string, email: string } | null>(null);
  const [registeredTenantId, setRegisteredTenantId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [registerInstitution] = useMutation(GOOGLE_REGISTER_INSTITUTION);
  const [finalizeProvisioning] = useMutation(GOOGLE_FINALIZE_PROVISIONING);
  const [decommissionRegistry] = useMutation(GOOGLE_DECOMMISSION_REGISTRY);

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

  const StepIndicator = ({ current }: { current: string }) => {
    const steps = ['IDENTITY', 'REGISTRY', 'PAYMENT', 'DEPLOYMENT'];
    const currentIdx = steps.indexOf(current);
    return (
      <div className="mb-10 px-1">
        <div className="flex justify-between items-end mb-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neo-orange">Phase_0{currentIdx + 1}</span>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{current}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {steps.map((step, idx) => (
            <div key={step} className={cn(
              "h-1 transition-all duration-700",
              idx <= currentIdx ? "bg-black" : "bg-black/5"
            )} />
          ))}
        </div>
      </div>
    );
  };

  const handleInstitutionalDeployment = async () => {
    if (!businessName || !supportPhone) {
      toast.error('Registry Data Required', { description: 'Please provide Business Name and Support Phone for terminal deployment.' });
      return;
    }

    setProvisioningStatus('registering');
    setProvisioningProgress('[PROTOCOL] Establishing Institutional Link...');

    try {
      // 1. Register in Hub
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

      // 2. Move to Payment Phase
      setOnboardingStep('PAYMENT');

      // (Payment handled by UI transition, then calls finalize)
    } catch (err: any) {
      toast.error('Registry Failure', { description: err.message });
    }
  };

  const executeVanguardDeployment = async (tenantId: string) => {
    try {
      // 3. Trigger Factory Provisioning
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
      // FAIL-SAFE: Decommission the pending registry record to keep Hub clean
      if (registeredTenantId) {
        console.log(`[Vanguard] Deployment Failure. Decommissioning Pending Registry: ${registeredTenantId}`);
        await decommissionRegistry({ variables: { tenantId: registeredTenantId } }).catch(() => { });
        setRegisteredTenantId(null);
      }

      setProvisioningStatus('idle');
      setOnboardingStep('REGISTRY'); // Fallback to registry
      toast.error('Factory Failure', { description: err.message });
    }
  };

  const launchInstitutionalTerminal = async () => {
    setIsLoading(true);
    try {
      // Use the credentials captured in Step 1 for auto-login
      await login(email, password);
      closeAuth();
      navigate('/'); // Enter the newly provisioned institutional shell
    } catch (err: any) {
      toast.error('Identity Retrieval Failed', { description: 'Please login manually using your new credentials.' });
      setMode('login');
      setOnboardingStep('IDENTITY');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (authMode === 'signup') {
      if (!email || !password || !fullName) {
        toast.error('Identity Protocol Required', { description: 'Please provide full operator credentials to initialize your account.' });
        return;
      }
      // Move to Step 2: Registry (We don't call server yet, we capture all data first)
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
      // login will set currentUser in context, triggers Shell in App.tsx
      closeAuth();
      setEmail('');
      setPassword('');
    } catch (err: any) {
      // HardwareContext already handles the toast, but we need to stop loading
    } finally {
      setIsLoading(false);
    }
  };

  const navLinks = [
    { label: "Platform", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Status", href: "/status" }
  ];

  const handleAuthAction = (mode: 'login' | 'signup') => {
    openAuth(mode);
    setIsMenuOpen(false);
  };

  return (
    <div className="tred-web">
      <div className="min-h-screen bg-white text-black font-sans selection:bg-neo-orange selection:text-white">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link to="/" className="flex items-center gap-4 group cursor-pointer">
                <div className="h-10 md:h-12 w-36 md:w-44 hover:scale-105 transition-all duration-300 filter drop-shadow-[0_0_10px_rgba(255,107,0,0.1)]">
                  <img src={wordLogo} alt="TredPOS" className="h-full w-full object-contain" />
                </div>
              </Link>

              <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-xs font-black hover:text-neo-orange transition-colors uppercase tracking-tight font-display italic"
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  className="neo-button-magnetic neo-button bg-neo-orange text-white hover:bg-black font-black uppercase text-xs italic"
                  onClick={() => handleAuthAction('login')}
                >
                  Get Started
                </button>
              </div>

              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                  {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="md:hidden bg-white border-b-4 border-black p-4"
              >
                <div className="flex flex-col gap-6 py-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-2xl font-black hover:text-neo-orange transition-colors uppercase tracking-tighter font-display italic border-b-2 border-black/5 pb-2"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <button
                    className="neo-button bg-neo-orange text-white w-full py-5 text-xl font-black uppercase italic"
                    onClick={() => handleAuthAction('login')}
                  >
                    Get Started
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Dynamic Page Content */}
        <main>
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white text-black py-20 md:py-32 border-t-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 md:gap-20">
              <div className="lg:col-span-5">
                <div className="flex items-center gap-4 mb-8 md:mb-10">
                  <div className="h-12 sm:h-16 md:h-20 hover:scale-105 transition-all duration-500 filter drop-shadow-[0_0_15px_rgba(255,107,0,0.2)]">
                    <img src={fullLogo} alt="TredPOS Logo" className="h-full w-auto object-contain" />
                  </div>
                </div>
                <p className="text-black/60 text-lg md:text-xl font-bold mb-8 md:mb-10 leading-snug max-w-md">
                  The world's most advanced retail operating system. Built for the next generation of global commerce.
                </p>
                <div className="flex gap-4 md:gap-6">
                  {[
                    { name: "Facebook", icon: Facebook, href: "https://facebook.com/tredpos" },
                    { 
                      name: "X", 
                      icon: (props: any) => (
                        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644z" />
                        </svg>
                      ), 
                      href: "https://x.com/tredpos" 
                    },
                    { name: "Instagram", icon: Instagram, href: "https://instagram.com/tredpos" }
                  ].map(social => (
                    <a 
                      key={social.name} 
                      href={social.href} 
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      className="w-12 h-12 md:w-14 md:h-14 neo-border bg-black text-white flex items-center justify-center hover:bg-neo-orange transition-colors shadow-[6px_6px_0px_0px_rgba(255,107,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px]"
                    >
                      <social.icon size={20} className="md:size-6" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10 md:gap-12">
                <div>
                  <h4 className="text-neo-orange font-black uppercase tracking-widest text-xs mb-8">Product</h4>
                  <ul className="space-y-4 font-bold">
                    {["Features", "Pricing", "Case Studies", "Reviews", "Updates", "Change Log"].map(item => (
                      <li key={item}><Link to={item === "Change Log" ? "/changelog" : `/${item.toLowerCase().replace(/ /g, '-')}`} className="text-black/60 hover:text-neo-orange transition-colors">{item}</Link></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-neo-orange font-black uppercase tracking-widest text-xs mb-8">Company</h4>
                  <ul className="space-y-4 font-bold">
                    {["About", "Careers", "Blog", "Press", "Contact"].map(item => (
                      <li key={item}><Link to={`/${item.toLowerCase().replace(/ /g, '-')}`} className="text-black/60 hover:text-neo-orange transition-colors">{item}</Link></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-neo-orange font-black uppercase tracking-widest text-xs mb-8">Support</h4>
                  <ul className="space-y-4 font-bold">
                    {["Help Center", "API Docs", "Community", "Status", "Security"].map(item => (
                      <li key={item}><Link to={`/${item.toLowerCase().replace(/ /g, '')}`} className="text-black/60 hover:text-neo-orange transition-colors">{item}</Link></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-32 pt-12 border-t-4 border-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
              <p className="text-black/80 font-bold">© {currentYear} TredPOS Inc. All rights reserved.</p>
              <div className="flex gap-8 text-sm font-bold text-black/60">
                <Link to="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-black transition-colors">Terms of Service</Link>
                <Link to="/cookies" className="hover:text-black transition-colors">Cookies</Link>
              </div>
            </div>
          </div>
        </footer>

        {/* Centralized Auth Modal - Redesigned Horizontal Landscape */}
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
                  {/* Decorative Kinetic Elements */}
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
                        {authMode === 'login' ? 'System Login' : 'Create Identity'}
                      </h2>
                      <span className="text-[9px] font-mono text-slate-400 mb-1 hidden sm:block">REQ_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                    </div>

                    <div className="space-y-6">
                      {authMode === 'signup' && <StepIndicator current={onboardingStep} />}

                      {onboardingStep === 'DEPLOYMENT' ? (
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
                          <div className="bg-neo-orange/5 p-6 sm:p-10 border-2 border-black flex flex-col items-center text-center space-y-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:shadow-none sm:bg-transparent sm:border-0 lg:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] lg:bg-neo-orange/5 lg:border-2">
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
                                  <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500 italic">Security Protocol (Password)</label>
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
                            setOnboardingTenant(null); // Clear onboarding state if switching
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
      </div>
    </div>
  );
}

