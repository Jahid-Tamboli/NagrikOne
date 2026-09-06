'use client';

import React, { useState } from 'react';
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

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar onOpenAuth={() => {}} onLogout={() => {}} />

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
          <p className="text-base text-slate-400 mt-3 leading-relaxed">
            Have a question, feedback, or partnership inquiry? Reach out directly to the founder and creation team.
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
                <div className="flex items-center gap-2.5 text-cyan-300">
                  <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                  <a
                    href="mailto:tambolijahid04@gmail.com"
                    className="hover:underline font-mono"
                  >
                    tambolijahid04@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
              <strong className="block text-slate-200 font-bold">Privacy & Data Handling:</strong>
              <p className="leading-relaxed">
                Communications with NagrikOne are strictly encrypted. We never sell personal contact information or case evidence to third parties.
              </p>
            </div>
          </div>

          {/* Direct Message Form Column */}
          <div className="md:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#081322] border border-cyan-500/30 shadow-2xl">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">Message Received</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Thank you for reaching out. We will review your message and reply to <strong className="text-slate-200">{email}</strong> shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-100 mb-1">Send a Message</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Send your inquiry directly to our support inbox.
                  </p>

                  <div>
                    <label className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jahid Tamboli"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="citizen@example.com"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      Message / Feedback *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help you?"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                  >
                    <span>Send Inquiry</span>
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
