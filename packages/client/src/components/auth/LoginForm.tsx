import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { observable } from '@legendapp/state';
import { observer } from '@legendapp/state/react';
import { useHardware } from '../../HardwareContext';
import { useAuth } from '../../AuthContext';

// 🛡️ [VANGUARD] Internal Login State
const form$ = observable({
  email: '',
  password: '',
  showPassword: false,
  isLoading: false,
  error: ''
});

export const LoginForm = observer(() => {
  const { login } = useHardware();
  const { closeAuth, setMode } = useAuth();
  
  const validate = () => {
    const email = form$.email.get();
    const password = form$.password.get();
    
    if (!email) return "Operator Identity Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid Identity Format";
    if (!password) return "Security Protocol Required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    form$.error.set('');
    
    const error = validate();
    if (error) {
      form$.error.set(error);
      return;
    }

    form$.isLoading.set(true);
    try {
      await login(form$.email.get(), form$.password.get());
      closeAuth();
      form$.email.set('');
      form$.password.set('');
    } catch (err: any) {
      form$.error.set(err.message || "Authentication Protocol Failure");
    } finally {
      form$.isLoading.set(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500 italic">
            Authorized Operator Email
          </label>
          <input 
            type="email" 
            placeholder="Enter your email address" 
            value={form$.email.get()} 
            onChange={(e) => form$.email.set(e.target.value)}
            className="w-full neo-border py-4 px-6 font-bold text-xs tracking-wider uppercase bg-white focus:bg-neo-orange/5 transition-colors outline-none" 
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
              Security Protocol (Password)
            </label>
            <button 
              type="button"
              onClick={() => setMode('forgot')}
              className="text-[9px] font-black uppercase text-neo-orange hover:underline underline-offset-2 italic"
            >
              Forgot?
            </button>
          </div>
          <div className="relative">
            <input 
              type={form$.showPassword.get() ? "text" : "password"} 
              placeholder="Enter your password" 
              value={form$.password.get()} 
              onChange={(e) => form$.password.set(e.target.value)}
              className="w-full neo-border py-4 px-6 font-bold text-xs tracking-wider bg-white focus:bg-neo-orange/5 transition-colors outline-none" 
            />
            <button
              type="button"
              onClick={() => form$.showPassword.set(!form$.showPassword.get())}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors"
            >
              {form$.showPassword.get() ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {form$.error.get() && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 p-3 border border-rose-200 italic"
          >
            ! ERROR: {form$.error.get()}
          </motion.p>
        )}

        <button 
          type="submit"
          disabled={form$.isLoading.get()}
          className="w-full bg-black text-white p-6 sm:p-7 font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(255,107,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 italic disabled:opacity-50"
        >
          {form$.isLoading.get() ? 'ESTABLISHING...' : 'INITIALIZE SESSION'}
          <ArrowRight size={20} />
        </button>
      </form>

      <div className="mt-8 text-right pt-6 border-t-2 border-black/5">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
          New Operator?
          <button
            type="button"
            onClick={() => setMode('register')}
            className="text-neo-orange font-black ml-3 hover:underline underline-offset-4"
          >
            Initialize_Signup
          </button>
        </p>
      </div>
    </div>
  );
});
