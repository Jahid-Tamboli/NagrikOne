'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  MessageSquare,
  Sparkles,
  HelpCircle,
  FileCheck,
  Tag,
  FileText,
  Route,
  Activity,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Mic
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import { AuthSession } from '@/lib/auth/session';

const STEPS = [
  {
    step: '01',
    title: 'Explain by Voice or Text',
    desc: 'Tell NOVA what happened in natural English, Hindi, or Hinglish without having to identify legal categories or departments.',
    icon: Mic,
    accent: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/40'
  },
  {
    step: '02',
    title: 'Dynamic Fact Extraction',
    desc: 'NOVA asks only the specific missing questions required for your issue: dates, transaction IDs, proof, and location.',
    icon: HelpCircle,
    accent: 'border-blue-500/40 text-blue-400 bg-blue-950/40'
  },
  {
    step: '03',
    title: 'Evidence Verification',
    desc: 'Attach photos, receipts, or notices. Securely validated and encrypted on the server.',
    icon: FileCheck,
    accent: 'border-purple-500/40 text-purple-400 bg-purple-950/40'
  },
  {
    step: '04',
    title: 'Statutory Route Mapping',
    desc: 'Mapped to official citizen charters, RTS legislation, or consumer tribunals with verified statutory SLAs.',
    icon: Route,
    accent: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40'
  },
  {
    step: '05',
    title: 'Secure Case Creation',
    desc: 'Authenticated with real OTP to create your permanent, encrypted case dossier and timeline.',
    icon: Lock,
    accent: 'border-teal-500/40 text-teal-400 bg-teal-950/40'
  },
  {
    step: '06',
    title: 'Real-Time Event Tracking',
    desc: 'Track statutory turnaround deadlines, automated escalation warnings, and status milestones.',
    icon: Activity,
    accent: 'border-amber-500/40 text-amber-400 bg-amber-950/40'
  },
  {
    step: '07',
    title: 'Citizen Outcome Verification',
    desc: 'You confirm when your issue is resolved. If an authority neglects the issue, you can reopen the case with NOVA anytime.',
    icon: CheckCircle2,
    accent: 'border-emerald-400 text-emerald-300 bg-emerald-950/60'
  }
];

export default function HowItWorksPage() {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

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

      <div className="container-box py-12 lg:py-16 max-w-5xl">
        {/* Header */}
        <div className="mb-14 text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>THE INTELLIGENCE PIPELINE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-50 tracking-tight leading-tight">
            How NagrikOne Works
          </h1>

          <p className="text-base text-slate-400 font-sans leading-relaxed">
            From initial conversational intake to statutory routing, tracking, and citizen resolution verification.
          </p>
        </div>

        {/* Steps Journey */}
        <div className="space-y-4">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-3xl p-6 sm:p-7 bg-gradient-to-b from-[#081322] to-[#040914] border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-lg"
              >
                <div className="flex items-start sm:items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-500/60">Step {s.step}</span>
                      <h2 className="text-base sm:text-lg font-bold text-slate-100">{s.title}</h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans max-w-2xl">{s.desc}</p>
                  </div>
                </div>

                <span className="text-xs font-mono text-slate-500 hidden lg:block shrink-0">
                  Phase {idx + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* CTA Card */}
        <div className="mt-14 rounded-3xl p-8 bg-gradient-to-b from-[#081322] to-[#040914] border border-cyan-500/30 text-center space-y-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <h2 className="text-2xl font-black text-slate-50">Ready to resolve your issue?</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-sans">
            Talk to NOVA right now. Describe your problem in your own words and let NOVA organize the rest.
          </p>
          <div className="pt-2">
            <Link
              href="/nova"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all"
            >
              <Mic className="w-4 h-4" />
              <span>Talk to NOVA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
