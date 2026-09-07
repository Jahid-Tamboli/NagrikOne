'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
  Target,
  ArrowRight,
  ChevronRight,
  Mic
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import { AuthSession } from '@/lib/auth/session';

export default function AboutPage() {
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
          <p className="text-lg text-slate-400 mt-4 leading-relaxed font-sans">
            An independent civic-tech platform designed to empower citizens with intelligent case organization, statutory guidance, and transparent progress tracking.
          </p>
        </div>

        {/* Founder & Creator Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#081322] to-[#040914] border border-cyan-500/30 mb-12 shadow-xl space-y-4">
          <span className="text-[10.5px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
            LEADERSHIP & CREATION
          </span>
          <div>
            <h2 className="text-2xl font-black text-slate-100">Jahid Tamboli</h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5">Founder & Creator, NagrikOne</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-cyan-300 pt-2 border-t border-slate-800">
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
              Every day, citizens face administrative, consumer, and municipal obstacles: damaged roads, streetlights that create dark crime-prone zones, unauthorized bank debits, or e-commerce companies refusing refunds.
            </p>
            <p>
              However, the pathways to resolve these issues are scattered across hundreds of disconnected portals, complex jurisdictional boundaries, and confusing legal acts. Most citizens give up simply because they do not know what the next step is.
            </p>
            <p>
              NagrikOne was built to eliminate this friction — creating <strong>one place for every citizen problem</strong>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Core Principles</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <strong className="text-cyan-300 text-sm block">1. Zero False Claims</strong>
                <p className="text-xs text-slate-400">We never pretend government affiliation or guarantee outcomes outside statutory law.</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <strong className="text-emerald-300 text-sm block">2. Transparent Outcomes</strong>
                <p className="text-xs text-slate-400">Every timeline event is derived directly from verified database logs and statutory SLAs.</p>
              </div>
            </div>
          </section>

          <div className="pt-6">
            <Link
              href="/nova"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
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
