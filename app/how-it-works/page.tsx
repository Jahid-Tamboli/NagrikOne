'use client';

import React from 'react';
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
  ChevronRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const STEPS = [
  {
    step: '01',
    title: 'Authenticate Securely',
    desc: 'Citizens sign in via real OTP authentication to encrypt and securely tie their case history and evidence.',
    icon: Lock,
    accent: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/40'
  },
  {
    step: '02',
    title: 'Explain in Natural Language',
    desc: 'Tell NOVA what happened in simple Hindi, Hinglish, or English without needing to know government categories.',
    icon: MessageSquare,
    accent: 'border-blue-500/40 text-blue-400 bg-blue-950/40'
  },
  {
    step: '03',
    title: 'NOVA Semantic Understanding',
    desc: 'NOVA analyzes the problem, evaluates urgency, extracts location signals, and identifies statutory jurisdictions.',
    icon: Sparkles,
    accent: 'border-purple-500/40 text-purple-400 bg-purple-950/40'
  },
  {
    step: '04',
    title: 'Contextual Dynamic Questions',
    desc: 'Instead of static giant forms, NOVA asks only the specific questions required for your problem domain.',
    icon: HelpCircle,
    accent: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40'
  },
  {
    step: '05',
    title: 'Evidence Verification',
    desc: 'Attach photos, PDF invoices, police receipts, or screenshots with server-side validation and OCR extraction.',
    icon: FileCheck,
    accent: 'border-teal-500/40 text-teal-400 bg-teal-950/40'
  },
  {
    step: '06',
    title: 'Statutory Classification',
    desc: 'NOVA matches the case with legal protections (e.g. Article 21, Consumer Protection Act, RBI Zero Liability).',
    icon: Tag,
    accent: 'border-amber-500/40 text-amber-400 bg-amber-950/40'
  },
  {
    step: '07',
    title: 'Case Dossier Created',
    desc: 'A unique Case ID is generated and the complete dossier is recorded in the PostgreSQL database.',
    icon: FileText,
    accent: 'border-indigo-500/40 text-indigo-400 bg-indigo-950/40'
  },
  {
    step: '08',
    title: 'Deterministic Workflow Routing',
    desc: 'The workflow engine calculates SLA deadlines and sets up the case for verified department submission.',
    icon: Route,
    accent: 'border-sky-500/40 text-sky-400 bg-sky-950/40'
  },
  {
    step: '09',
    title: 'Transparent Progress Tracking',
    desc: 'Track real database status events, SLA countdowns, and official escalation recommendations in real-time.',
    icon: Activity,
    accent: 'border-rose-500/40 text-rose-400 bg-rose-950/40'
  },
  {
    step: '10',
    title: 'Citizen Resolution Verification',
    desc: 'The citizen confirms that the issue is resolved before the case is closed. Cases can be reopened if neglected.',
    icon: CheckCircle2,
    accent: 'border-emerald-400 text-emerald-300 bg-emerald-950/60'
  }
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar onOpenAuth={() => {}} onLogout={() => {}} />

      <div className="container-box py-12 lg:py-16">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>10-STEP CITIZEN ROADMAP</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-50 tracking-tight leading-tight">
            How NagrikOne turns everyday problems into real progress.
          </h1>
          <p className="text-base text-slate-400 mt-4 leading-relaxed">
            From municipal potholes and streetlight failures to UPI transaction disputes and consumer refunds, see how NOVA navigates complex processes on your behalf.
          </p>
        </div>

        {/* 10 Step Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#081322] to-[#040914] border border-slate-800 hover:border-cyan-500/40 transition-all flex gap-5"
              >
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${item.accent}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-cyan-400">STEP {item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#081b2e] to-[#04101d] border border-cyan-500/40 text-center max-w-4xl mx-auto shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-50 mb-3">
            Ready to resolve your issue?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mb-6">
            Talk to NOVA now to analyze your problem and generate an official statutory resolution dossier.
          </p>
          <Link
            href="/nova"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
          >
            <span>Talk to NOVA</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
