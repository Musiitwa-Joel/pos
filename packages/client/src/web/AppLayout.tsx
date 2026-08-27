import React from 'react';
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
import AuthModal from '../components/auth/AuthModal';

import { observer } from '@legendapp/state/react';
import { webState$ } from './webState';

export default observer(function AppLayout() {
  const isMenuOpen = webState$.ui.isMenuOpen.get();
  const setIsMenuOpen = (val: boolean) => webState$.ui.isMenuOpen.set(val);
  const { openAuth } = useAuth();
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: "Platform", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Status", href: "/status" }
  ];

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
                  onClick={() => openAuth('login')}
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
                    onClick={() => { openAuth('login'); setIsMenuOpen(false); }}
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

        {/* Centralized Auth Management Hook */}
        <AuthModal />
      </div>
    </div>
  );
});
