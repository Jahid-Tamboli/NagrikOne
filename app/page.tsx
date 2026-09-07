'use client';

import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
  Mic,
  Volume2,
  Compass,
  FileText,
  Workflow,
  SearchCheck,
  RefreshCcw,
  CheckCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import NovaHeroCore, { NovaState } from '@/components/three/NovaHeroCore';
import ServiceCards3D from '@/components/three/ServiceCards3D';
import { AuthSession } from '@/lib/auth/session';

export default function Home() {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [heroNovaState, setHeroNovaState] = useState<NovaState>('IDLE');

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
    <main className="min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 overflow-hidden relative">
      {/* Dynamic Atmospheric Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-gradient-to-b from-cyan-950/25 via-blue-950/15 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-purple-950/15 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-[70%] -right-[10%] w-[700px] h-[700px] bg-cyan-950/15 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative z-10">
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
        {/* 1. HERO SECTION: DOMINANT NOVA CORE & INTAKE (CONTINUOUS FLOW) */}
        {/* ============================================================ */}
        <section className="container-box pt-12 pb-20 lg:pt-20 lg:pb-32">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline, Voice/Text Intake & Story Intro */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>NAGRIKONE • CITIZEN INTELLIGENCE PLATFORM</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-50 tracking-tight leading-[1.08]">
                One place for every citizen problem.
              </h1>

              <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl font-sans">
                Tell NOVA what you're facing. NOVA understands the problem, asks what matters, and helps you move toward the right next step.
              </p>

              {/* Quick Interactive Conversational Start Box */}
              <div className="p-2.5 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#081322]/90 to-[#040914]/95 border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.12)] backdrop-blur-xl flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full flex items-center">
                  <input
                    type="text"
                    value={quickInput}
                    onChange={(e) => {
                      setQuickInput(e.target.value);
                      if (e.target.value && heroNovaState === 'IDLE') {
                        setHeroNovaState('UNDERSTANDING');
                      } else if (!e.target.value) {
                        setHeroNovaState('IDLE');
                      }
                    }}
                    placeholder="Describe your issue... (e.g. Landlord withholding deposit, UPI failed)"
                    className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 px-3 py-2 font-sans"
                  />
                </div>

                <Link
                  href={`/nova${quickInput ? `?initial=${encodeURIComponent(quickInput)}` : ''}`}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.35)] whitespace-nowrap transition-all"
                >
                  <Mic className="w-4 h-4 text-slate-950" />
                  <span>Talk to NOVA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-5 pt-1 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <CheckCircle2 className="w-4 h-4" /> Real Statutory Timelines
                </span>
                <span className="flex items-center gap-1.5 text-purple-400">
                  <ShieldCheck className="w-4 h-4" /> No Fake Government Claims
                </span>
              </div>
            </div>

            {/* Right Column: Dominant 3D NOVA Core */}
            <div className="lg:col-span-6 flex items-center justify-center">
              <div className="relative group">
                {/* Visual Backdrop Halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-purple-500/10 to-blue-500/15 rounded-full blur-3xl opacity-75 group-hover:opacity-100 transition-opacity" />
                
                <NovaHeroCore
                  state={heroNovaState}
                  size="hero"
                  interactive={true}
                  onCoreClick={() => {
                    const states: NovaState[] = ['IDLE', 'LISTENING', 'UNDERSTANDING', 'THINKING', 'CLASSIFYING'];
                    const next = states[(states.indexOf(heroNovaState) + 1) % states.length];
                    setHeroNovaState(next);
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. THE CITIZEN PROBLEM: FRAGMENTATION CONVERGING TO NOVA     */}
        {/* ============================================================ */}
        <section className="container-box py-16 lg:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              The Fragmentation Problem
            </h2>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight leading-tight">
              Citizen problems are scattered across departments, portals, service providers and processes.
            </p>
            <p className="text-sm sm:text-base text-slate-400">
              NagrikOne brings clarity to chaos. Instead of figuring out where to go, explain what happened and let NOVA structure your path.
            </p>
          </div>

          {/* Interactive Convergence Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Municipal PWD', icon: Building2, desc: 'Roads, streetlights, sanitation' },
              { label: 'Bank & UPI', icon: ShieldAlert, desc: 'Debits, failed transfers, scams' },
              { label: 'Consumer Forum', icon: Scale, desc: 'Warranty, defective items, refunds' },
              { label: 'Cyber Crime 1930', icon: Lock, desc: 'Phishing, unauthorized access' },
              { label: 'RTS Portals', icon: FileCheck2, desc: 'Certificates, Aadhaar, Land' },
              { label: 'Electricity Discoms', icon: Zap, desc: 'Bill disputes, meter faults' },
              { label: 'Telecom Operators', icon: Activity, desc: 'Broadband, SIM porting, billing' },
              { label: 'Landlord & Rent', icon: Compass, desc: 'Security deposits, evictions' },
              { label: 'Service Contracts', icon: FileText, desc: 'Vehicle repair, job breaches' },
              { label: 'Unclassified Issues', icon: HelpCircle, desc: 'Any everyday citizen issue' }
            ].map((node, idx) => {
              const Icon = node.icon;
              return (
                <div
                  key={idx}
                  className="group relative rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-[#081322]/80 to-[#040914]/90 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                >
                  <div className="space-y-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {node.label}
                    </h3>
                    <p className="text-[11.5px] text-slate-500 leading-relaxed font-sans">
                      {node.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Convergence Metaphor Flow */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-900/90 border border-cyan-500/20 text-xs font-mono text-slate-300">
              <span className="text-slate-400">Scattered Portals</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-300 font-bold">NOVA Intelligence</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-emerald-400 font-bold">One Structured Path</span>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. HOW NOVA WORKS: ANIMATED CONTINUOUS FLOW                   */}
        {/* ============================================================ */}
        <section className="container-box py-16 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              How NOVA Works
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
              An intelligent journey from problem to next step.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'You Speak or Type',
                desc: 'Explain what happened in simple English, Hindi, or Hinglish without searching for legal jargon.',
                icon: Mic
              },
              {
                step: '02',
                title: 'NOVA Understands & Asks',
                desc: 'NOVA extracts missing facts dynamically—dates, transaction IDs, proof, and jurisdiction.',
                icon: MessageSquare
              },
              {
                step: '03',
                title: 'Statutory Routing',
                desc: 'Identifies the appropriate statutory body, RTI/RTS framework, or dispute forum with statutory SLAs.',
                icon: Workflow
              },
              {
                step: '04',
                title: 'Case Created & Tracked',
                desc: 'Your persistent case is organized with immutable event logs, document evidence, and action milestones.',
                icon: CheckCircle2
              }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-b from-[#081322]/90 to-[#040914]/90 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col justify-between shadow-lg"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black font-mono text-cyan-500/40">
                        {step.step}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-slate-100">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. 6 CORE PROBLEM CATEGORIES + "ANYTHING ELSE"               */}
        {/* ============================================================ */}
        <section className="container-box py-16 lg:py-24">
          <div className="max-w-3xl mb-12 space-y-3">
            <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Universal Coverage
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
              What NagrikOne can help with.
            </p>
            <p className="text-sm text-slate-400">
              Select an area or explain any unclassified issue to activate custom legal & civic triage.
            </p>
          </div>

          <ServiceCards3D />
        </section>

        {/* ============================================================ */}
        {/* 5. WORKFLOW ENGINE & STATUTORY TIMELINES                     */}
        {/* ============================================================ */}
        <section className="container-box py-16 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                Deterministic Engine
              </h2>
              <p className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight leading-tight">
                Statutory SLA monitoring and verified status transitions.
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                Cases follow strict statutory timelines governed by Citizen Charters and Right to Service (RTS) legislation. Automatic alerts trigger when statutory SLAs approach breach.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { label: 'Citizen Charter Integration', desc: 'Pre-configured turnaround deadlines for 99+ public service domains' },
                  { label: 'Immutable Audit Trail', desc: 'Every status change is logged server-side with actor IP and timestamp' },
                  { label: 'Escalation Warnings', desc: 'Deterministic warning states (SLA_WARNING, ESCALATION_RECOMMENDED)' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block">{item.label}</strong>
                      <span className="text-slate-500">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live State Machine Visual */}
            <div className="lg:col-span-6 rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#081322] to-[#040914] border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.1)] space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Workflow State Machine</span>
                </span>
                <span className="text-[10px] text-cyan-400">Statutory Engine v2.4</span>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center">
                  <span>DRAFT ➔ INTAKE ➔ UNDER_REVIEW</span>
                  <span className="text-cyan-400 text-[10px]">Triage Phase</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center">
                  <span>READY_FOR_SUBMISSION ➔ IN_PROGRESS</span>
                  <span className="text-amber-400 text-[10px]">Statutory SLA Active</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center">
                  <span>AWAITING_AUTHORITY ➔ SLA_WARNING</span>
                  <span className="text-rose-400 text-[10px]">Auto-Escalation</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex justify-between items-center bg-emerald-950/20">
                  <span className="text-emerald-300">RESOLUTION_VERIFICATION ➔ RESOLVED</span>
                  <span className="text-emerald-400 text-[10px]">Citizen Verified</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 6. ASSISTED SERVICES & PAYMENT TRANSPARENCY                  */}
        {/* ============================================================ */}
        <section className="container-box py-16 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Assistance & Value
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
              Pay only when you need additional assistance.
            </p>
            <p className="text-sm text-slate-400">
              Standard guidance, problem identification, and case organization are always free. Optional paid assistance helps with document drafting and dedicated follow-up.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier Card */}
            <div className="rounded-3xl p-7 sm:p-8 bg-gradient-to-b from-[#081322]/80 to-[#040914]/90 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex px-3 py-1 rounded-full text-[10.5px] font-mono font-bold uppercase tracking-wider bg-slate-900 border border-slate-700 text-slate-300">
                  Standard Access
                </div>
                <h3 className="text-2xl font-black text-slate-50">Free Citizen Guidance</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                  Complete access to NOVA intelligence, statutory department mapping, dynamic questions, and case tracking.
                </p>

                <div className="space-y-2.5 pt-4 text-xs text-slate-300">
                  <div className="flex items-center gap-2">✓ Conversational problem triage</div>
                  <div className="flex items-center gap-2">✓ Statutory SLA route identification</div>
                  <div className="flex items-center gap-2">✓ Persistent case creation and tracking</div>
                  <div className="flex items-center gap-2">✓ Self-submission guidance</div>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href="/nova"
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Start Free with NOVA</span>
                </Link>
              </div>
            </div>

            {/* Assisted Services Card */}
            <div className="rounded-3xl p-7 sm:p-8 bg-gradient-to-b from-[#081322] to-[#040914] border border-cyan-500/40 flex flex-col justify-between shadow-[0_0_30px_rgba(6,182,212,0.1)] relative">
              <div className="space-y-4">
                <div className="inline-flex px-3 py-1 rounded-full text-[10.5px] font-mono font-bold uppercase tracking-wider bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  Assisted Resolution
                </div>
                <h3 className="text-2xl font-black text-slate-50">Assisted Service Support</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                  When you need formal legal notice preparation, document drafting, or dedicated follow-up assistance for complex disputes.
                </p>

                <div className="space-y-2.5 pt-4 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-cyan-300">✓ Formal statutory notice preparation</div>
                  <div className="flex items-center gap-2 text-cyan-300">✓ Evidence review & document compilation</div>
                  <div className="flex items-center gap-2 text-cyan-300">✓ Dedicated escalation monitoring</div>
                  <div className="flex items-center gap-2 text-cyan-300">✓ Transparent fixed per-case pricing (from ₹499)</div>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href="/payment"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                >
                  <span>Explore Assisted Services</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 7. CITIZEN TRUST SECTION                                     */}
        {/* ============================================================ */}
        <section className="container-box py-16 lg:py-24">
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-[#081322] to-[#040914] border border-slate-800/80 space-y-8">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                Our Commitment
              </h2>
              <p className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
                Know what is happening with your problem.
              </p>
              <p className="text-sm text-slate-400">
                NagrikOne operates with complete transparency. We never pretend outcomes or make false 100% government resolution promises.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              {[
                { title: 'No Fake Claims', desc: 'We never claim government authority or promise outcomes outside legal jurisdiction.' },
                { title: 'Transparent Status', desc: 'Every case timeline reflects real verified events and statutory SLA counters.' },
                { title: 'Encrypted Evidence', desc: 'Documents and screenshots are securely stored with zero public indexing.' },
                { title: 'Outcome Reopening', desc: 'If an issue is not resolved, you can reopen the case anytime with NOVA.' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-2 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <h3 className="text-sm font-bold text-slate-200">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 8. FINAL CONVERSATIONAL CTA                                  */}
        {/* ============================================================ */}
        <section className="container-box py-20 lg:py-32 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>START YOUR JOURNEY</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-slate-50 tracking-tight leading-tight">
              Tell NOVA what's wrong.
            </h2>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-sans">
              You don't need to know which department, portal or process handles it. Just explain the problem.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/nova"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-[0_0_35px_rgba(6,182,212,0.4)] transition-all"
              >
                <Mic className="w-5 h-5 text-slate-950" />
                <span>Talk to NOVA</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-900 py-12 text-slate-500 text-xs font-mono">
          <div className="container-box flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>© {new Date().getFullYear()} NagrikOne Platform. Built for Citizens.</div>
            <div className="flex items-center gap-6">
              <Link href="/about" className="hover:text-cyan-400 transition-colors">About</Link>
              <Link href="/how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</Link>
              <Link href="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link>
              <Link href="/cases" className="hover:text-cyan-400 transition-colors">My Cases</Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
