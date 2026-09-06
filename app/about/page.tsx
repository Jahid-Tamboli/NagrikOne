'use client';

import React from 'react';
import Link from 'next/link';
import {
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
  Target,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar onOpenAuth={() => {}} onLogout={() => {}} />

      <div className="container-box py-12 lg:py-16 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>MISSION & CIVIC ARCHITECTURE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-50 tracking-tight leading-tight">
            About NagrikOne
          </h1>
          <p className="text-lg text-slate-400 mt-4 leading-relaxed">
            An independent civic-tech platform designed to empower citizens with intelligent case organization, statutory guidance, and transparent progress tracking.
          </p>
        </div>

        {/* Founder & Creator Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#081322] to-[#040914] border border-cyan-500/30 mb-12 shadow-xl">
          <span className="text-[10.5px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-2">
            LEADERSHIP & CREATION
          </span>
          <h2 className="text-2xl font-bold text-slate-100">Jahid Tamboli</h2>
          <p className="text-xs font-mono text-slate-400 mb-4">Founder & Creator, NagrikOne</p>

          <div className="flex items-center gap-2 text-sm text-cyan-300">
            <Mail className="w-4 h-4 text-cyan-400" />
            <a
              href="mailto:tambolijahid04@gmail.com"
              className="hover:underline font-mono text-xs sm:text-sm"
            >
              tambolijahid04@gmail.com
            </a>
          </div>
        </div>

        {/* Narrative Sections */}
        <div className="space-y-10 text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Why NagrikOne was Created</h2>
            <p>
              Every day, citizens face dozens of administrative, consumer, and municipal obstacles: damaged roads that cause accidents, broken streetlights that create dark crime-prone zones, unauthorized bank debits, or e-commerce companies refusing refunds.
            </p>
            <p>
              However, the pathways to resolve these issues are scattered across hundreds of disconnected portals, complex jurisdictional boundaries, and confusing legal acts. Most citizens give up simply because they do not know what the next step is.
            </p>
            <p>
              NagrikOne was built to eliminate this friction — creating <strong>one place for every citizen problem</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">How NOVA Works</h2>
            <p>
              NOVA is not a generic chatbot. NOVA is a purpose-built citizen intelligence layer combining:
            </p>
            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                <strong className="block text-cyan-300 mb-1 font-bold">Citizen Intelligence</strong>
                <p className="text-xs text-slate-400">Understands natural language in Hindi and English, extracting core facts and urgency.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                <strong className="block text-purple-300 mb-1 font-bold">Case Intelligence</strong>
                <p className="text-xs text-slate-400">Structures problems into formal statutory dossiers complete with legal act references.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                <strong className="block text-emerald-300 mb-1 font-bold">Workflow Intelligence</strong>
                <p className="text-xs text-slate-400">Tracks SLA deadlines, warning triggers, and escalation pathways deterministically.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Independent & Transparent</h2>
            <p>
              NagrikOne is an independent civic-support platform. We never claim official government ownership, fake partnerships, or guaranteed official outcomes.
            </p>
            <p>
              Instead, we provide honest, transparent tools that organize facts, identify rights under Indian law, guide evidence collection, and ensure citizens have a clear record when seeking resolution.
            </p>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex items-center justify-between">
          <Link
            href="/contact"
            className="text-xs font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1.5"
          >
            <span>Have questions? Contact the founder</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/nova"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg"
          >
            <span>Talk to NOVA</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
