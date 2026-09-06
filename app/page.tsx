'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  UploadCloud,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  FileText,
  ShieldAlert,
  HelpCircle,
  XCircle,
  RefreshCw,
  Zap,
  Scale,
  Layers,
  Check,
  Eye,
  Trash2,
  FileCheck,
  Navigation,
  Compass,
  Bot,
  QrCode,
  Lock
} from 'lucide-react';
import Civic3DCanvas from '@/components/Civic3DCanvas';
import Card3D from '@/components/Card3D';
import Navbar from '@/components/Navbar';
import NOVAChat from '@/components/NOVAChat';
import CaseTimeline, { CaseItem } from '@/components/CaseTimeline';
import ScannerModal from '@/components/ScannerModal';
import OfflineBanner from '@/components/OfflineBanner';
import AuthModal, { UserSession } from '@/components/AuthModal';
import ProblemModal from '@/components/ProblemModal';
import LegalNoticeModal from '@/components/LegalNoticeModal';
import { PROBLEM_TYPES, ProblemTypeDefinition, CATEGORIES } from '@/lib/problemTypes';

export default function Home() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const [user, setUser] = useState<UserSession | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [activeDossierProblem, setActiveDossierProblem] = useState<ProblemTypeDefinition | null>(null);
  const [activeLegalNoticeProblem, setActiveLegalNoticeProblem] = useState<ProblemTypeDefinition | null>(null);

  const casesSectionRef = useRef<HTMLElement | null>(null);
  const novaSectionRef = useRef<HTMLElement | null>(null);

  // Load User from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('nagrikone_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Fetch initial cases
  useEffect(() => {
    async function loadCases() {
      try {
        const res = await fetch('/api/cases');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setCases(data);
          }
        }
      } catch (err) {
        console.warn('[NagrikOne] Could not fetch initial cases:', err);
      }
    }
    loadCases();
  }, []);

  const handleCaseCreated = (newCase: any) => {
    setCases((prev) => [newCase, ...prev.filter((c) => c.id !== newCase.id)]);
    setSuccessNotice(`Statutory Case ${newCase.id} created! Scroll down to Track Cases.`);
    setTimeout(() => {
      casesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
  };

  const filteredProblems = PROBLEM_TYPES.filter((p) => {
    const matchesCat =
      selectedCategory === 'All' ||
      p.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      selectedCategory.toLowerCase().includes(p.category.toLowerCase());

    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.legalAct?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCat && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#040914] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <OfflineBanner />

      <Navbar
        casesCount={cases.length}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={() => {
          localStorage.removeItem('nagrikone_user');
          setUser(null);
          setSuccessNotice('Signed out successfully.');
        }}
      />

      {/* Global Alerts */}
      {errorNotice && (
        <div className="container-box mt-4 animate-fadeIn">
          <div className="flex items-center justify-between p-4 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <p className="text-sm font-medium">{errorNotice}</p>
            </div>
            <button onClick={() => setErrorNotice(null)} className="text-rose-400 hover:text-rose-200">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {successNotice && (
        <div className="container-box mt-4 animate-fadeIn">
          <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-sm font-medium">{successNotice}</p>
            </div>
            <button onClick={() => setSuccessNotice(null)} className="text-emerald-400 hover:text-emerald-200">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="container-box hero-wrapper pt-8 pb-12 lg:pt-14 lg:pb-20">
        <div className="space-y-6">
          <div className="badge-verified">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>99 STATUTORY ROUTES • AI CITIZEN ASSISTANT • LIVE</span>
          </div>

          <h1 className="hero-heading">
            One Problem. One Platform. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              One Smarter Solution.
            </span>
          </h1>

          <p className="hero-subtext max-w-2xl">
            Tell NagrikOne what you&apos;re facing. NOVA AI helps you understand what to do next, maps official department jurisdictions, and guides you through statutory resolution.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                novaSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-emerald-500/25 transition-all transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask NOVA AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Scan QR / Evidence</span>
            </button>

            <Link
              href="#cases"
              className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Track Your Case</span>
            </Link>
          </div>

          {/* Trust stats pill */}
          <div className="flex flex-wrap items-center gap-4 pt-4 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              100% Free Public Triage
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Governed by Indian Statutory Acts
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-purple-400" />
              Client Privacy Preserved
            </span>
          </div>
        </div>

        {/* 3D Civic Statutory Mesh */}
        <div className="mt-8 lg:mt-0">
          <Civic3DCanvas onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            const el = document.getElementById('library');
            el?.scrollIntoView({ behavior: 'smooth' });
          }} />
        </div>
      </section>

      {/* Flagship NOVA AI Section */}
      <section id="nova" ref={novaSectionRef} className="container-box py-12 lg:py-16 border-t border-slate-850">
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>CENTRAL PROBLEM-SOLVING CONVERSATION ENGINE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-50 tracking-tight">
            Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">NOVA AI</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            You don&apos;t need to know which department handles your issue. Just explain what happened — NOVA understands and handles the rest.
          </p>
        </div>

        <NOVAChat
          onCaseCreated={handleCaseCreated}
          onOpenScanner={() => setScannerOpen(true)}
        />
      </section>

      {/* 99 Problem Statutory Library */}
      <section id="library" className="container-box py-12 lg:py-16 border-t border-slate-850">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold mb-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>STATUTORY DISPUTE MESH</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
              99 Problem Resolution Library
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Explore pre-mapped legal routes, governing acts, and SLA resolution benchmarks.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, Act, or route..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/80 hover:bg-slate-850 border-slate-700/80 text-slate-300 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of Problem Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProblems.slice(0, 18).map((prob) => (
            <Card3D key={prob.id}>
              <div className="p-5 sm:p-6 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/30">
                      {prob.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        prob.priority === 'CRITICAL'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                          : prob.priority === 'URGENT'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                          : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                      }`}
                    >
                      {prob.priority}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-slate-100 leading-snug">
                    {prob.name}
                  </h3>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Official Authority:</span>
                    <strong className="text-slate-200 text-xs block truncate">{prob.route}</strong>
                  </div>

                  {prob.legalAct && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      <Scale className="w-3 h-3 inline mr-1 text-cyan-400" />
                      {prob.legalAct}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock3 className="w-3 h-3 text-cyan-400" />
                    SLA: ~{prob.estimatedResolutionDays} Days
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveDossierProblem(prob)}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <span>View Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card3D>
          ))}
        </div>

        {filteredProblems.length === 0 && (
          <div className="p-12 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="font-bold text-base text-slate-100">No exact matches in canonical library</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              NOVA AI handles unclassified citizen issues automatically. Click below to describe your situation to NOVA.
            </p>
            <button
              type="button"
              onClick={() => {
                novaSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
            >
              Ask NOVA AI Directly
            </button>
          </div>
        )}
      </section>

      {/* Citizen Case Tracking Hub */}
      <section id="cases" ref={casesSectionRef} className="container-box py-12 lg:py-16 border-t border-slate-850">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold mb-2">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>LIVE CITIZEN AUDIT & ESCALATIONS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
              Active Case Tracking Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Monitor real-time investigation stages, work orders, and statutory resolution timelines.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              novaSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>File New Case via NOVA</span>
          </button>
        </div>

        <div className="space-y-6">
          {cases.map((c) => (
            <CaseTimeline
              key={c.id}
              caseItem={c}
              onOpenLegalDossier={() => {
                const found = PROBLEM_TYPES.find((p) => p.id === (c as any).problemId) || PROBLEM_TYPES[0];
                setActiveDossierProblem(found);
              }}
            />
          ))}

          {cases.length === 0 && (
            <div className="p-12 rounded-3xl bg-[#081322] border border-slate-800 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="font-bold text-base text-slate-200">No active cases drafted yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Use NOVA AI at the top to describe your grievance and prepare your first official case.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Resolution Pass & Support Tiers */}
      <section className="container-box py-12 lg:py-16 border-t border-slate-850">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>OPTIONAL ADVOCATE & RTI ESCALATION PASSES</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-100">
            Speed Up Your Resolution
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            NagrikOne core AI triage is 100% free. Optional priority passes include advocate legal notice drafting, RTI First Appeals, and daily SMS alerts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              tier: 'standard',
              name: 'Standard Portal Pass',
              price: '₹49',
              desc: 'Official statutory portal dispatch with auto-drafted grievance docket',
              features: ['Official portal filing', 'Pre-drafted legal docket', 'Email acknowledgment']
            },
            {
              tier: 'priority',
              name: 'Priority Fast-Track',
              price: '₹199',
              desc: '2x faster triage routing with daily SMS/WhatsApp status updates',
              popular: true,
              features: ['2x Priority Escalation', 'Daily SMS/WhatsApp status', 'RTI Pre-draft Included', 'Dedicated Case Officer']
            },
            {
              tier: 'legal',
              name: 'Legal Notice & RTI Pass',
              price: '₹499',
              desc: 'Advocate-reviewed legal notice with Indian statutory citations',
              features: ['Advocate-reviewed legal notice', 'RTI First Appeal dossier', 'Tribunal escalation guide', 'Direct call advisory']
            }
          ].map((plan) => (
            <div
              key={plan.tier}
              className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between space-y-6 ${
                plan.popular
                  ? 'bg-gradient-to-b from-[#081e33] to-[#04101e] border-emerald-400/60 shadow-[0_0_50px_rgba(52,211,153,0.2)] relative'
                  : 'bg-[#081524] border-slate-800'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] font-mono uppercase tracking-wider">
                  MOST POPULAR
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-100">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.desc}</p>
                </div>

                <div className="text-3xl font-black text-slate-50 font-mono">
                  {plan.price}
                  <span className="text-xs font-normal text-slate-400 font-sans ml-1">/ one-time</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/payment"
                className={`w-full py-3 rounded-xl font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-all ${
                  plan.popular
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25'
                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200'
                }`}
              >
                <span>Get Resolution Pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-850 bg-[#030712] py-12 text-xs text-slate-400">
        <div className="container-box flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-slate-950 font-black flex items-center justify-center text-xs">
              N1
            </div>
            <div>
              <p className="font-bold text-slate-200">NagrikOne</p>
              <p className="text-[11px] text-slate-500">Citizen Problem-Solving Platform</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 font-medium">
            <Link href="/about" className="hover:text-slate-200">About</Link>
            <Link href="/how-it-works" className="hover:text-slate-200">How It Works</Link>
            <Link href="/contact" className="hover:text-slate-200">Contact</Link>
            <Link href="/payment" className="hover:text-slate-200">Payment & Passes</Link>
            <Link href="/admin" className="text-purple-400 hover:text-purple-300">Admin Portal</Link>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-500 space-y-1">
            <p>Created by <strong>Jahid Tamboli</strong> (Founder & Creator)</p>
            <p>Independent civic technology platform. Not an official government portal.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanComplete={(data, meta) => {
          setSuccessNotice(`Scanned data captured: ${data.substring(0, 40)}...`);
          novaSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(u: UserSession) => {
          setUser(u);
          setSuccessNotice(`Welcome back, ${u.name}!`);
        }}
      />

      <ProblemModal
        problem={activeDossierProblem}
        onClose={() => setActiveDossierProblem(null)}
        onSelectWorkflow={(p) => {
          setActiveDossierProblem(null);
          novaSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenLegalNotice={(p) => {
          setActiveDossierProblem(null);
          setActiveLegalNoticeProblem(p);
        }}
      />

      <LegalNoticeModal
        isOpen={!!activeLegalNoticeProblem}
        problem={activeLegalNoticeProblem}
        onClose={() => setActiveLegalNoticeProblem(null)}
      />
    </main>
  );
}
