'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Sparkles,
  User,
  Mail,
  ArrowRight,
  CheckCircle2,
  Scale,
  Compass,
  Zap,
  Layers,
  HeartHandshake,
  Bot
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#040914] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <Navbar casesCount={2} user={null} onOpenAuth={() => {}} onLogout={() => {}} />

      {/* Hero Section */}
      <section className="container-box pt-12 pb-16">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>INDEPENDENT CITIZEN TECHNOLOGY PLATFORM</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-50 tracking-tight leading-tight">
            One Intelligent Platform for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Citizen Problems</span>.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            NagrikOne simplifies grievance redressal in India. Instead of requiring citizens to decipher complex department jurisdictions, NOVA AI analyzes your problem and maps the exact statutory route.
          </p>
        </div>
      </section>

      {/* Core Principles Grid */}
      <section className="container-box py-12 border-t border-slate-850">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Why Created */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#081524] border border-slate-800 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-100">Why NagrikOne Was Created</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every day, millions of citizens in India face potholes, failed UPI transactions, illegal electricity cuts, tenancy disputes, and consumer service denials. Most complaints fail not because laws do not exist, but because citizens do not know <strong>which portal, authority, or ombudsman</strong> holds statutory jurisdiction.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              NagrikOne removes the friction between a citizen&apos;s real-life problem and the official statutory solution.
            </p>
          </div>

          {/* How NOVA AI Works */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#081524] border border-slate-800 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold">
              <Bot className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-100">How NOVA AI Works</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              NOVA AI combines a 99-route statutory database with natural language reasoning. Whether you speak in conversational Hindi or English, NOVA categorizes the issue, extracts evidence requirements, identifies relevant legal acts, and structures an official case docket.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              NOVA never turns you away with &quot;Problem not found&quot; — even unsupported or private disputes receive structured legal guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="container-box py-12 border-t border-slate-850">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100">Statutory Benefits for Citizens</h2>
            <p className="text-xs sm:text-sm text-slate-400">Designed from the ground up for transparency and empowerment</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'One Unified Platform', desc: 'Covering civic, banking, police, cybercrime, women safety, consumer, and tenancy.' },
              { title: 'AI-Assisted Clarity', desc: 'No legal jargon or technical terms required; explain in everyday language.' },
              { title: 'Statutory Citations', desc: 'Pre-drafted with relevant Indian acts (Consumer Act 2019, IT Act, Municipal Bylaws).' },
              { title: 'Evidence Guidance', desc: 'Learn exactly what photos, receipts, or timestamps make your complaint airtight.' },
              { title: 'Location-Aware Routing', desc: 'Maps issues to your specific Municipal Ward, Police Jurisdiction, or District Forum.' },
              { title: 'End-to-End Tracking', desc: 'Track your complaint across 8 lifecycle stages from Draft to Resolution.' }
            ].map((benefit, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">{benefit.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator & Independence Statement */}
      <section className="container-box py-12 border-t border-slate-850">
        <div className="max-w-3xl mx-auto p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#08182b] to-[#040e1a] border border-cyan-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-emerald-500/30">
            JT
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              FOUNDER & CREATOR
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100">Jahid Tamboli</h2>
            <p className="text-xs sm:text-sm text-slate-400">Creator & Lead Architect, NagrikOne</p>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
            NagrikOne was created by Jahid Tamboli to give Indian citizens a single, intelligent, accessible interface for resolving real-world civic, banking, and consumer disputes.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="mailto:tambolijahid04@gmail.com"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Talk to the Creator (tambolijahid04@gmail.com)</span>
            </a>
            <Link
              href="/#nova"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Try NOVA AI</span>
            </Link>
          </div>

          {/* Legal / Independence Notice */}
          <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed">
            <p>
              <strong>Important Independence Notice:</strong> NagrikOne is an independent citizen-support technology platform. NagrikOne is not an official government agency and does not misrepresent itself as one. We assist citizens in drafting, preparing, and routing grievances to appropriate official statutory bodies under Indian law.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
