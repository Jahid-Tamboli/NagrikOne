'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Clock,
  Layers,
  CheckCircle2,
  FileCheck2,
  Lock,
  Activity,
  Zap,
  Scale,
  Building2,
  MessageSquare,
  Eye,
  ShieldAlert
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import NovaHeroCore from '@/components/three/NovaHeroCore';
import ServiceCards3D from '@/components/three/ServiceCards3D';
import { AuthSession } from '@/lib/auth/session';

export default function Home() {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [quickInput, setQuickInput] = useState('');

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

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
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

      {/* ============================================================ */}
      {/* SECTION 1: HERO SECTION (Aevon Style Composition)            */}
      {/* ============================================================ */}
      <section className="container-box py-12 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Headline, Subtext, CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>NAGRIKONE • CITIZEN INTELLIGENCE PLATFORM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-50 tracking-tight leading-[1.05]">
              One place for every citizen problem.
            </h1>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl font-sans">
              Tell NOVA what you're facing. NOVA understands the problem, guides you through the next steps, helps organize the case, and lets you track what happens next.
            </p>

            {/* Quick Interactive Start Box */}
            <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[#081322] to-[#040914] border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="What problem are you facing? (e.g. UPI failed, street light broken...)"
                className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 px-3 py-2 font-sans"
              />

              <Link
                href={`/nova${quickInput ? `?initial=${encodeURIComponent(quickInput)}` : ''}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] whitespace-nowrap transition-all"
              >
                <span>Talk to NOVA</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* CTAs & Trust Points */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/how-it-works"
                className="px-5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-600 text-slate-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <span>How NagrikOne Works</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                <span className="flex items-center gap-1 text-cyan-400">✓ Real Statutory Routes</span>
                <span className="flex items-center gap-1 text-purple-400">✓ No Fake Claims</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D NOVA Intelligence Object */}
          <div className="lg:col-span-5">
            <div className="p-2 rounded-3xl bg-gradient-to-b from-[#081322]/80 to-[#020408]/90 border border-cyan-500/20 shadow-2xl">
              <NovaHeroCore state="IDLE" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2: PROBLEM STATEMENT — CITIZEN FRAGMENTATION         */}
      {/* ============================================================ */}
      <section className="container-box py-16 border-t border-slate-800/80">
        <div className="max-w-3xl mb-12">
          <span className="text-[10.5px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-2">
            THE FRAGMENTATION PROBLEM
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight leading-tight">
            Citizen problems are scattered across departments, portals, service providers and processes.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed font-sans">
            When a pothole damages your vehicle, a bank deducts UPI money twice, or an e-commerce firm denies a valid return, finding the right authority or regulatory helpline is exhausting. Most citizens abandon legitimate grievances because the system is fragmented.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#081322] border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-100">Confusing Jurisdictions</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              Is a street issue under PWD, Municipal Corporation, or Ward Discom? Citizens shouldn't need a law degree to report a broken light.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#081322] border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-100">Zero Transparency & SLA</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              Complaints vanish into black-box portals without clear turnaround times, escalation criteria, or accountability.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#081322] border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-100">Unstructured Evidence</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              Without geotagged photos, transaction RRNs, or statutory act citations, valid complaints are routinely dismissed.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3: NOVA CITIZEN INTELLIGENCE LAYER                   */}
      {/* ============================================================ */}
      <section className="container-box py-16 border-t border-slate-800/80">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#08182a] to-[#040c17] border border-cyan-500/30">
          <div className="max-w-2xl mb-8">
            <span className="text-[10.5px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-2">
              THE INTELLIGENCE LAYER
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">
              NOVA is not merely a chatbot.
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              NOVA orchestrates understanding, evidence compilation, and statutory workflows into a unified engine.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <strong className="text-base text-cyan-300 font-bold block">CITIZEN INTELLIGENCE</strong>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Understands natural speech and text across languages, extracting critical facts without forcing rigid forms.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <strong className="text-base text-purple-300 font-bold block">CASE INTELLIGENCE</strong>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Organizes facts, geotagged evidence, and applicable statutory laws into a formal case dossier.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <strong className="text-base text-emerald-300 font-bold block">WORKFLOW INTELLIGENCE</strong>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Monitors statutory turnaround times (SLA), triggers escalation alerts, and verifies resolution before closure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4: WHAT NAGRIKONE CAN HELP WITH (3D Cards)          */}
      {/* ============================================================ */}
      <section className="container-box py-16 border-t border-slate-800/80">
        <div className="max-w-3xl mb-12">
          <span className="text-[10.5px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-2">
            SCOPE OF SUPPORT
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">
            What NagrikOne can help you with
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed font-sans">
            From civic issues to digital payments, documents and everyday service problems, NOVA helps you understand what to do next.
          </p>
        </div>

        <ServiceCards3D />
      </section>

      {/* ============================================================ */}
      {/* SECTION 5: HOW NOVA WORKS                                    */}
      {/* ============================================================ */}
      <section className="container-box py-16 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10.5px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-2">
            RESOLUTION METHODOLOGY
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">
            How NOVA Works
          </h2>
          <p className="text-sm text-slate-400 mt-2 font-sans">
            A continuous sequence from explanation to verified resolution.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
          {[
            { step: '01', title: 'Problem', desc: 'You explain in plain words' },
            { step: '02', title: 'Understand', desc: 'NOVA evaluates domain & urgency' },
            { step: '03', title: 'Ask', desc: 'Contextual follow-up questions' },
            { step: '04', title: 'Verify', desc: 'Evidence & location confirmed' },
            { step: '05', title: 'Route', desc: 'Target jurisdiction identified' },
            { step: '06', title: 'Track', desc: 'SLA monitored until resolution' }
          ].map((item) => (
            <div key={item.step} className="p-4 rounded-2xl bg-[#081322] border border-slate-800">
              <span className="text-xs font-mono font-bold text-cyan-400 block mb-1">STEP {item.step}</span>
              <strong className="text-sm font-bold text-slate-100 block mb-1">{item.title}</strong>
              <p className="text-[11px] text-slate-400 font-sans">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 & 7: CASE LIFECYCLE & WORKFLOW INTELLIGENCE       */}
      {/* ============================================================ */}
      <section className="container-box py-16 border-t border-slate-800/80">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-[10.5px] font-mono uppercase tracking-widest text-purple-400 font-bold block">
              DETERMINISTIC STATE MACHINE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">
              Case Lifecycle & SLA Timers
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              Every case created in NagrikOne progresses through deterministic statutory states. When an SLA deadline approaches, warning flags alert the citizen and recommend higher escalations.
            </p>

            <div className="space-y-2 pt-2">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Intake & Verification</span>
                <span className="text-cyan-400 font-bold">VERIFIED</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Statutory Preparation</span>
                <span className="text-emerald-400 font-bold">READY_FOR_PWD_SUBMISSION</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">SLA Warning at 75% Time</span>
                <span className="text-amber-400 font-bold">SLA_WARNING</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Citizen Verified Closure</span>
                <span className="text-purple-400 font-bold">STATUTORY_RESOLVED</span>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#081322] to-[#040914] border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-slate-300">SAMPLE LIVE DOSSIER</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">N1-2026-89412</span>
            </div>
            <h3 className="text-base font-bold text-slate-100">Non-Functional Street Light / Dark Public Spot</h3>
            <p className="text-xs text-slate-400 font-mono">Route: Municipal Electrical Department / Discom Ward Office</p>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              ✓ Geotagged photo verified • Pole ID #42 logged • SLA Target: 48h
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8: CASE TRACKING PREVIEW                             */}
      {/* ============================================================ */}
      <section className="container-box py-16 border-t border-slate-800/80">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#081322] to-[#030712] border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-[10.5px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
              REAL CITIZEN TRACKING
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-50">
              Track real database events. No fake timelines.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              Inspect your case history, review official act citations, check officer compliance remarks, and confirm resolution from your private citizen dashboard.
            </p>
          </div>

          <Link
            href="/cases"
            className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 font-bold text-xs flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <span>Open Case Dockets</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 9: TRUST & TRANSPARENCY PRINCIPLES                  */}
      {/* ============================================================ */}
      <section className="container-box py-16 border-t border-slate-800/80">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <span className="text-[10.5px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
            ETHICS & TRANSPARENCY
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-50">
            Trust is our core architecture.
          </h2>
          <p className="text-sm text-slate-400 font-sans leading-relaxed">
            NagrikOne is an independent citizen-support platform. We never pretend to be a government body, make false guarantees, or simulate fake submissions.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#081322] border border-slate-800 space-y-2">
            <strong className="text-sm font-bold text-slate-200 block">No Fake Government Claims</strong>
            <p className="text-xs text-slate-400">We never pretend official affiliation or fabricate government outcomes.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#081322] border border-slate-800 space-y-2">
            <strong className="text-sm font-bold text-slate-200 block">Server-Side Security</strong>
            <p className="text-xs text-slate-400">All authentication, payments, and RBAC authorization are strictly verified server-side.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#081322] border border-slate-800 space-y-2">
            <strong className="text-sm font-bold text-slate-200 block">Transparent Statuses</strong>
            <p className="text-xs text-slate-400">Every status reflects real database events and verified external actions.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#081322] border border-slate-800 space-y-2">
            <strong className="text-sm font-bold text-slate-200 block">Citizen Controlled</strong>
            <p className="text-xs text-slate-400">You control your evidence and confirm resolution before cases are closed.</p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 10: FINAL ACTION CTA                                */}
      {/* ============================================================ */}
      <section className="container-box py-20 border-t border-slate-800/80">
        <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-r from-[#081b2e] via-[#041220] to-[#020810] border border-cyan-500/40 text-center max-w-4xl mx-auto shadow-[0_0_60px_rgba(6,182,212,0.2)]">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-50 tracking-tight mb-4">
            Tell NOVA what's wrong.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto mb-8 font-sans">
            Get instant statutory guidance, organize your evidence, and generate an official resolution dossier in minutes.
          </p>
          <Link
            href="/nova"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
          >
            <span>Talk to NOVA</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
