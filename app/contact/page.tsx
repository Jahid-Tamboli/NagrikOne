'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  Send,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import { AuthSession } from '@/lib/auth/session';

export default function ContactPage() {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      } catch (e) {}
    }
    checkUser();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 pb-24">
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={async () => {
          await fetch('/api/auth/session', { method: 'DELETE' });
          setUser(null);
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />

      <div className="container-box py-12 lg:py-16 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>OFFICIAL CONTACT & SUPPORT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-50 tracking-tight leading-tight">
            Contact NagrikOne
          </h1>
          <p className="text-base text-slate-400 mt-3 leading-relaxed font-sans">
            Have a question, feedback, or legal inquiry? Reach out directly to the founder and creation team.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Contact Details Column */}
          <div className="md:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#081322] to-[#040914] border border-slate-800 space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                CREATOR & FOUNDER
              </span>
              <div>
                <h3 className="text-xl font-bold text-slate-100">Jahid Tamboli</h3>
                <p className="text-xs text-slate-400 font-mono">Founder & Creator, NagrikOne</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                  <a
                    href="mailto:tambolijahid04@gmail.com"
                    className="hover:text-cyan-300 font-mono"
                  >
                    tambolijahid04@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-mono">India (IST Timezone)</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#081322] border border-slate-800/80 space-y-2 text-xs text-slate-400 font-sans">
              <strong className="text-slate-200 block text-sm">Citizen Assistance</strong>
              <p>For urgent citizen problems, please consult NOVA directly on the platform for immediate statutory routing.</p>
              <Link href="/nova" className="inline-block text-cyan-400 font-semibold hover:underline pt-1">
                Open NOVA ➔
              </Link>
            </div>
          </div>

          {/* Form Column */}
          <div className="md:col-span-7">
            <div className="p-8 rounded-3xl bg-gradient-to-b from-[#081322] to-[#040914] border border-slate-800 shadow-xl">
              {submitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-300 mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">Message Received</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Thank you for reaching out. We will review your inquiry and respond to {email} promptly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-100 mb-2">Send an Inquiry</h2>

                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-400 font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-400 font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we assist you or collaborate?"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-400 font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                  >
                    <span>Send Message</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
