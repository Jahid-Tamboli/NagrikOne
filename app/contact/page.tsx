'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  User,
  Send,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    // Create a pre-filled mailto link for reliable direct dispatch
    const subject = encodeURIComponent(`NagrikOne Inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    window.location.href = `mailto:tambolijahid04@gmail.com?subject=${subject}&body=${body}`;

    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#040914] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <Navbar casesCount={2} user={null} onOpenAuth={() => {}} onLogout={() => {}} />

      {/* Hero */}
      <section className="container-box pt-12 pb-16">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span>DIRECT CREATOR & TEAM REACH-OUT</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-50 tracking-tight leading-tight">
            Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">NagrikOne</span>.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Have a question, feedback, partnership inquiry, or technical grievance suggestion? Reach out directly to the founder.
          </p>
        </div>
      </section>

      {/* Contact Content Grid */}
      <section className="container-box py-12 border-t border-slate-850">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Direct Creator Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#08182b] to-[#040e1a] border border-cyan-500/30 space-y-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/30">
                JT
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  FOUNDER & CREATOR
                </span>
                <h2 className="text-xl font-extrabold text-slate-100">Jahid Tamboli</h2>
                <p className="text-xs text-slate-400">Lead Product & Architecture</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400">Official Creator Email:</span>
              <div className="flex items-center justify-between">
                <a
                  href="mailto:tambolijahid04@gmail.com"
                  className="text-xs sm:text-sm font-mono font-bold text-cyan-300 hover:underline"
                >
                  tambolijahid04@gmail.com
                </a>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We respond to citizen inquiries, platform suggestions, and feedback. If you have a specific legal case to report, we recommend using NOVA AI directly on the home page for instant triage.
            </p>

            <div className="pt-2">
              <a
                href="mailto:tambolijahid04@gmail.com"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Mail className="w-4 h-4" />
                <span>Send Email to Jahid Tamboli</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Direct Feedback Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#081524] border border-slate-800 space-y-5 shadow-xl">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <h3 className="font-extrabold text-lg text-slate-100">Send a Message</h3>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-center space-y-3 animate-fadeIn">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-base text-slate-100">Email Client Opened!</h4>
                <p className="text-xs text-slate-300">
                  Thank you for reaching out to Jahid Tamboli. Your message has been prepared for dispatch.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-emerald-400 underline pt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Your Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. citizen@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Your Message or Feedback</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you'd like to share..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message Directly</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
