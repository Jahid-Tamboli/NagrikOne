'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Bot,
  HelpCircle,
  FileCheck,
  Send,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  Layers
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const STEPS = [
  {
    number: '01',
    title: 'Tell NOVA Your Problem',
    subtitle: 'Natural Language Input',
    desc: 'Describe what happened in conversational Hindi or English, use voice dictation, or scan a receipt or UPI QR code.',
    icon: MessageSquare,
    badge: 'Step 1: Intake'
  },
  {
    number: '02',
    title: 'NOVA Understands & Classifies',
    subtitle: 'Statutory Mapping',
    desc: 'NOVA identifies the governing Indian statute, maps statutory jurisdiction, and determines immediate emergency actions.',
    icon: Bot,
    badge: 'Step 2: AI Triage'
  },
  {
    number: '03',
    title: 'Answer a Few Key Questions',
    subtitle: 'Fact Verification',
    desc: 'Confirm essential details (dates, transaction IDs, landmarks) required to make an official grievance legally actionable.',
    icon: HelpCircle,
    badge: 'Step 3: Verification'
  },
  {
    number: '04',
    title: 'Get Recommended Steps & Evidence',
    subtitle: 'Actionable Guidance',
    desc: 'Receive immediate statutory action steps, turnaround deadlines (SLAs), and a checklist of required documentary evidence.',
    icon: FileCheck,
    badge: 'Step 4: Statutory Blueprint'
  },
  {
    number: '05',
    title: 'Create an Official Case Docket',
    subtitle: 'Docket Generation',
    desc: 'With one tap, generate an official pre-drafted grievance dossier with statutory citations ready for portal dispatch.',
    icon: Send,
    badge: 'Step 5: Case Docket'
  },
  {
    number: '06',
    title: 'Track Live Progress & Escalations',
    subtitle: 'Lifecycle Resolution',
    desc: 'Follow your complaint across 8 lifecycle stages from submission to official work orders and final resolution.',
    icon: CheckCircle2,
    badge: 'Step 6: Resolution'
  }
];

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <main className="min-h-screen bg-[#040914] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <Navbar casesCount={2} user={null} onOpenAuth={() => {}} onLogout={() => {}} />

      {/* Hero */}
      <section className="container-box pt-12 pb-16">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>6-STEP CITIZEN RESOLUTION WORKFLOW</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-50 tracking-tight leading-tight">
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">NagrikOne</span> Resolves Your Problems.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            From your first description to statutory case closure, see how NOVA AI simplifies official grievance escalation in minutes.
          </p>
        </div>
      </section>

      {/* Interactive Process Grid */}
      <section className="container-box py-12 border-t border-slate-850">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = activeStep === idx;

              return (
                <div
                  key={step.number}
                  onClick={() => setActiveStep(idx)}
                  className={`cursor-pointer p-6 sm:p-7 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#081b2d] to-[#04101e] border-emerald-400/60 shadow-[0_0_40px_rgba(52,211,153,0.2)]'
                      : 'bg-[#081524]/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      {step.number}
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-semibold">
                      {step.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-base text-slate-100">{step.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{step.desc}</p>
                  </div>

                  <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
                    <span>{step.subtitle}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Flow Demo */}
          <div className="p-6 sm:p-10 rounded-3xl bg-[#08182b] border border-cyan-500/30 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black font-mono text-emerald-400">
                  {STEPS[activeStep].number}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{STEPS[activeStep].title}</h3>
                  <p className="text-xs text-slate-400">{STEPS[activeStep].subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : STEPS.length - 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : 0))}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
                >
                  Next Step
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
              <span className="text-emerald-400 font-bold">CITIZEN EXPERIENCE SIMULATION:</span>
              <p className="mt-2 text-slate-200">{STEPS[activeStep].desc}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pt-6">
            <Link
              href="/#nova"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>Launch NOVA AI & Report an Issue Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
