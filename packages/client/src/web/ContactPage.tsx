import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  MessageSquare,
  Send,
  Headphones,
  ShieldCheck,
  Clock,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useQuery, useMutation } from '@apollo/client';
import { SUBMIT_CONTACT_INQUIRY, GET_CONTACT_CONFIG } from '../gql/website';

import { observer } from '@legendapp/state/react';
import { webState$ } from './webState';

export default observer(function ContactPage() {
  const formData = webState$.contact.formData.get();
  const submitted = webState$.contact.submitted.get();
  const isSubmitting = webState$.contact.isSubmitting.get();

  const setFormData = (val: any) => webState$.contact.formData.set(val);
  const setSubmitted = (val: boolean) => webState$.contact.submitted.set(val);
  const setIsSubmitting = (val: boolean) => webState$.contact.isSubmitting.set(val);

  const { data: configData } = useQuery(GET_CONTACT_CONFIG);
  const supportEmail = configData?.getContactConfig?.support_email || 'ops@tredpos.com';
  const supportPhone = configData?.getContactConfig?.support_phone || '+44 (0) 20 7946 0123';

  const [submitInquiry] = useMutation(SUBMIT_CONTACT_INQUIRY);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitInquiry({
        variables: {
          input: {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
          }
        }
      });
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
      });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error("Transmission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const offices = [
    { country: "United Kingdom", city: "London", address: "12 Finsbury Square, London EC2A 1BR", phone: "+44 20 7946 0123" },
    { country: "United States", city: "New York", address: "251 Little Falls Drive, Wilmington, DE 19808", phone: "+1 212 555 0198" },
    { country: "Singapore", city: "Singapore", address: "10 Anson Road, International Plaza, 079903", phone: "+65 6221 1234" }
  ];

  return (
    <div className="pt-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 bg-neo-blue text-white border-b-4 border-black overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <div className="inline-block px-4 py-1 bg-neo-orange neo-border mb-8 rotate-[-2deg]">
              <span className="text-xs font-black uppercase tracking-widest text-white">Contact TredPos</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[110px] font-black leading-none mb-8 font-display uppercase tracking-tighter">
              ESTABLISH <br />
              <span className="text-white underline decoration-4 sm:decoration-8 underline-offset-4 sm:underline-offset-8 decoration-neo-green italic">CONTACT</span>
            </h1>
            <p className="text-2xl font-bold max-w-2xl leading-tight opacity-70">
              Our global operations are active 24/7. Reach out for institutional partnerships, technical support, or forensic audits.
            </p>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-[-20deg] pointer-events-none" />
      </section>

      {/* Main Content: Support Tiers & Form */}
      <section className="py-16 sm:py-32 bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            {/* Left Column: Support Info */}
            <div className="lg:col-span-5 space-y-12">
              <div>
                <h2 className="text-4xl font-black font-display uppercase italic mb-8">GLOBAL CHANNELS</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 sm:p-8 neo-border bg-cream hover:bg-white transition-colors group cursor-default">
                    <div className="w-14 h-14 bg-black text-white neo-border flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(255,107,0,1)] group-hover:rotate-6 transition-transform shrink-0">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black font-display uppercase">Email Operations</h4>
                      <p className="text-black/60 font-bold">{supportEmail}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 sm:p-8 neo-border bg-cream hover:bg-white transition-colors group cursor-default">
                    <div className="w-14 h-14 bg-neo-green text-white neo-border flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:-rotate-6 transition-transform shrink-0">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black font-display uppercase">TredPos Hotline</h4>
                      <p className="text-black/60 font-bold">{supportPhone}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 sm:p-8 neo-border bg-cream hover:bg-white transition-colors group cursor-default">
                    <div className="w-14 h-14 bg-neo-blue text-white neo-border flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform shrink-0">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black font-display uppercase">Live Intelligence</h4>
                      <p className="text-black/60 font-bold">Available in the Dashboard</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 sm:p-10 bg-black border-4 border-white/10 sm:rotate-2 shadow-[12px_12px_0px_0px_rgba(255,107,0,0.2)]">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-14 h-14 bg-neo-orange text-black flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_white]">
                    <Clock size={32} strokeWidth={3} />
                  </div>
                  <h3 
                    className="text-2xl sm:text-3xl font-black uppercase tracking-tighter italic"
                    style={{ color: '#FFFFFF', visibility: 'visible', opacity: 1 }}
                  >
                    TREDPOS UPTIME
                  </h3>
                </div>
                <p 
                  className="text-base sm:text-lg font-bold leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.9)', visibility: 'visible', opacity: 1 }}
                >
                  Support operations across all regions are synchronized. Our global command centers respond within 15 minutes for Tier 1 incidents.
                </p>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="neo-card p-6 sm:p-10 lg:p-12 bg-cream/50 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="mb-10">
                  <h2 className="text-4xl font-black font-display uppercase tracking-tighter italic">TRANSMIT INQUIRY</h2>
                  <p className="text-lg font-bold opacity-50">Expect a high-velocity response from our strategic team.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest ml-1">TredPos Identity</label>
                      <input
                        required
                        type="text"
                        placeholder="Full Name"
                        className="w-full neo-border py-4 px-6 font-bold bg-white focus:bg-cream transition-colors outline-none"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest ml-1">Communication Channel</label>
                      <input
                        required
                        type="email"
                        placeholder="email@organization.com"
                        className="w-full neo-border py-4 px-6 font-bold bg-white focus:bg-cream transition-colors outline-none"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest ml-1">Operation Subject</label>
                    <select
                      className="w-full neo-border py-4 px-6 font-bold bg-white focus:bg-cream transition-colors outline-none cursor-pointer appearance-none"
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option>General Inquiry</option>
                      <option>Institutional Partnership</option>
                      <option>Forensic Support</option>
                      <option>Technical Integration</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest ml-1">Message Payload</label>
                    <textarea
                      required
                      placeholder="Transmission goes here..."
                      rows={6}
                      className="w-full neo-border py-6 px-6 font-bold bg-white focus:bg-cream transition-colors outline-none resize-none"
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full neo-button bg-black text-white text-xl py-6 flex items-center justify-center gap-4 group disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Transmitting...' : 'Execute Transmission'}</span>
                    {!isSubmitting && <Send size={24} className="group-hover:translate-x-2 transition-transform" />}
                  </button>
                </form>

                <AnimatePresence>
                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-white/95 neo-border z-20 group"
                    >
                      <div className="text-center p-12">
                        <div className="w-20 h-20 bg-neo-green neo-border flex items-center justify-center mx-auto mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                          <ShieldCheck size={40} className="text-white" />
                        </div>
                        <h3 className="text-3xl font-black font-display uppercase italic mb-4 text-black">TRANSMISSION SECURED</h3>
                        <p className="text-xl font-bold opacity-60">Our strategists have received your signal.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Offices */}
      <section className="py-20 sm:py-32 bg-cream border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black font-display uppercase tracking-tighter mb-12 sm:mb-20">GLOBAL <br /> <span className="text-neo-green">COMMAND</span> CENTERS</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-12">
            {offices.map((office, i) => (
              <motion.div
                key={office.city}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="neo-card p-6 sm:p-10 lg:p-12 bg-white hover:bg-neo-blue hover:text-white transition-all duration-300 group"
              >
                <div className="flex justify-between items-start mb-10">
                  <Globe size={40} className="text-neo-orange shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50 group-hover:opacity-100 italic ml-4">{office.country}</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-black font-display uppercase mb-4 sm:mb-6">{office.city}</h3>
                <p className="font-bold opacity-60 group-hover:opacity-100 text-base sm:text-lg leading-snug mb-8">{office.address}</p>
                <div className="flex items-center gap-2 font-black text-xs tracking-widest group-hover:gap-4 transition-all opacity-40 group-hover:opacity-100">
                  {office.phone} <ArrowRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
});
