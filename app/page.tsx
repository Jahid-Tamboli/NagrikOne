'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock3,
  MapPin,
  Mic,
  MicOff,
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
  Zap
} from 'lucide-react';
import Civic3DCanvas from '@/components/Civic3DCanvas';
import Card3D from '@/components/Card3D';
import { PROBLEM_TYPES, ProblemTypeDefinition } from '@/lib/problemTypes';

interface CaseItem {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  description?: string;
  location?: string;
  createdAt: string;
  events?: { id: string; status: string; note: string; createdAt: string }[];
}

interface DetectionResponse {
  problem: ProblemTypeDefinition;
  detection: {
    confidence: number;
    matchedKeywords: string[];
    suggestedUrgency: string;
  };
  location: string;
}

export default function Home() {
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingCase, setCreatingCase] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedEvidence, setAttachedEvidence] = useState<string[]>([]);
  const [confirmedQuestions, setConfirmedQuestions] = useState<Record<string, boolean>>({});

  const resolutionCardRef = useRef<HTMLDivElement | null>(null);
  const casesSectionRef = useRef<HTMLElement | null>(null);

  // Fetch persistent cases on initial mount
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

  // Solve & Analyze Complaint
  async function handleSolve() {
    if (!text.trim()) {
      setErrorNotice('Please enter a description of your issue first.');
      return;
    }
    setErrorNotice(null);
    setLoading(true);

    try {
      const r = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          location: location || undefined
        })
      });

      const data = await r.json();

      if (!r.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze issue.');
      }

      setResult(data);
      // Reset answered questions for new problem
      setConfirmedQuestions({});

      // Smooth scroll to resolution plan
      setTimeout(() => {
        resolutionCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    } catch (err: any) {
      console.error('[NagrikOne] Solve error:', err);
      setErrorNotice(err.message || 'Unable to analyze issue right now. Please check your network.');
    } finally {
      setLoading(false);
    }
  }

  // Create Case Draft
  async function handleCreateCase() {
    if (!result?.problem) return;
    setCreatingCase(true);
    setErrorNotice(null);

    try {
      const r = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: result.problem.name,
          category: result.problem.category,
          priority: result.detection?.suggestedUrgency || result.problem.priority,
          description: text,
          location: location || result.location,
          problemId: result.problem.id
        })
      });

      const newCase = await r.json();

      if (!r.ok || !newCase.id) {
        throw new Error(newCase.error || 'Could not save case.');
      }

      setCases((prev) => [newCase, ...prev.filter((c) => c.id !== newCase.id)]);
      setSuccessNotice(`Resolution draft "${newCase.id}" created successfully!`);

      // Scroll to cases section
      setTimeout(() => {
        casesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } catch (err: any) {
      console.error('[NagrikOne] Create case error:', err);
      setErrorNotice(err.message || 'Error creating resolution case.');
    } finally {
      setCreatingCase(false);
    }
  }

  // Simulated Voice Dictation
  function toggleVoiceInput() {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setErrorNotice(null);
      // Mock voice input simulation
      setTimeout(() => {
        if (!text) {
          setText('Mere area mein street light 5 din se band hai aur raat ko andhera rehta hai.');
        }
        setIsRecording(false);
      }, 2400);
    }
  }

  // Simulated Evidence Attachment
  function handleAddMockEvidence() {
    const mockFiles = ['pothole_evidence_geo.jpg', 'bill_receipt_pdf.png', 'meter_fault_scan.jpg'];
    const nextFile = mockFiles[attachedEvidence.length % mockFiles.length];
    if (!attachedEvidence.includes(nextFile)) {
      setAttachedEvidence((prev) => [...prev, nextFile]);
    }
  }

  // Toggle question confirmation
  function toggleQuestion(q: string) {
    setConfirmedQuestions((prev) => ({
      ...prev,
      [q]: !prev[q]
    }));
  }

  // Filtered Problem Library
  const filteredProblems = PROBLEM_TYPES.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#040914] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Sticky Glassmorphic Header */}
      <header className="header-glass">
        <div className="brand-logo">
          <div className="brand-icon">N1</div>
          <div className="brand-title">
            <span className="font-extrabold tracking-tight">NagrikOne</span>
            <span className="brand-badge">Citizen Resolution Platform</span>
          </div>
        </div>

        <nav className="nav-links">
          <a href="#home" className="nav-item active">Home</a>
          <a href="#library" className="nav-item">Problem Library</a>
          <a href="#cases" className="nav-item">My Cases ({cases.length})</a>
          <Link href="/payment" className="btn-pay-nav">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Resolution Pass & Pay</span>
          </Link>
        </nav>
      </header>

      {/* Global Alerts / Toasts */}
      {errorNotice && (
        <div className="container-box mt-4">
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
        <div className="container-box mt-4">
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
      <section id="home" className="container-box hero-wrapper">
        <div>
          <div className="badge-verified">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>VERIFIED-FIRST RESOLUTION ENGINE</span>
          </div>

          <h1 className="hero-heading">
            Har problem ka <em>next step.</em>
          </h1>

          <p className="hero-subtext">
            Government, municipal civic, cybercrime, bank fraud, consumer disputes, and utility breakdowns — tell NagrikOne what happened for instant official escalation routes.
          </p>

          {/* Smart Input Card */}
          <div className="input-glass-box">
            <textarea
              className="issue-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell NagrikOne what happened... (e.g. 'Street light band hai 4 din se' or 'Cyber scam me OTP chala gaya')"
            />

            {/* Simulated Voice Dictation Waveform */}
            {isRecording && (
              <div className="flex items-center gap-2 p-2 mb-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <div className="waveform-container">
                  <div className="waveform-bar" />
                  <div className="waveform-bar" />
                  <div className="waveform-bar" />
                  <div className="waveform-bar" />
                  <div className="waveform-bar" />
                </div>
                <span>Listening in Hindi / English... Speak your issue</span>
              </div>
            )}

            {/* Attached Evidence Chips */}
            {attachedEvidence.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {attachedEvidence.map((file) => (
                  <span
                    key={file}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {file}
                  </span>
                ))}
              </div>
            )}

            <div className="input-toolbar">
              <div className="tool-group">
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`btn-tool ${isRecording ? 'recording' : ''}`}
                  title={isRecording ? 'Stop Voice Recording' : 'Dictate issue in Hindi/English'}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleAddMockEvidence}
                  className="btn-tool"
                  title="Attach Photo / Geotagged Evidence"
                >
                  <Camera className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleAddMockEvidence}
                  className="btn-tool"
                  title="Upload Document / PDF Statement"
                >
                  <UploadCloud className="w-4 h-4" />
                </button>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Locality / Ward (Optional)"
                    className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder:text-slate-500 w-36"
                  />
                </div>
              </div>

              <button
                type="button"
                className="btn-primary-action"
                onClick={handleSolve}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                    <span>Analyzing Triage...</span>
                  </>
                ) : (
                  <>
                    <span>Start Resolution</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Issue Example Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-500">Quick prompts:</span>
            {[
              'Street light band hai 4 din se',
              'Online scam me 15,000 kat gaye',
              'Pothole near metro station',
              'E-commerce return refund stuck'
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setText(prompt)}
                className="px-2.5 py-1 rounded-md bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-emerald-300 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Trust points */}
          <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">✓ AI Triage Engine</span>
            <span className="flex items-center gap-1 text-cyan-400">✓ Statutory Route Mapping</span>
            <span className="flex items-center gap-1 text-purple-400">✓ 100% Citizen Approval First</span>
          </div>
        </div>

        {/* 3D Interactive WebGL Canvas */}
        <div className="w-full">
          <Civic3DCanvas
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              const libraryElem = document.getElementById('library');
              libraryElem?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      </section>

      {/* Resolution Plan Section (Appears upon AI triage) */}
      {result?.problem && (
        <section ref={resolutionCardRef} className="container-box">
          <div className="plan-container">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="section-label">RESOLUTION ACTION BLUEPRINT</span>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {Math.round((result.detection?.confidence || 0.85) * 100)}% Match Confidence
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                    result.detection?.suggestedUrgency === 'URGENT'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {result.detection?.suggestedUrgency || result.problem.priority} PRIORITY
                </span>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-50 tracking-tight">
              {result.problem.name}
            </h2>

            <div className="my-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 text-sm italic">
              “{text}”
            </div>

            {/* Official Authority Route */}
            <div className="route-badge">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300/80 block">
                  Official Statutory Grievance Route
                </span>
                <strong className="text-base text-slate-100">{result.problem.route}</strong>
              </div>
            </div>

            {/* Guidelines / Advisory */}
            {result.problem.guidelines && (
              <div className="mb-6 p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 leading-relaxed flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5 text-cyan-100">Citizen Legal & Procedural Advisory:</strong>
                  {result.problem.guidelines}
                </div>
              </div>
            )}

            {/* Smart Confirmation Questions */}
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono mb-3">
                Smart Clarification Checklist
              </h3>
              <div className="space-y-2">
                {(Array.isArray(result.problem.questions) ? result.problem.questions : []).map(
                  (q: string, idx: number) => {
                    const isChecked = !!confirmedQuestions[q];
                    return (
                      <div
                        key={q}
                        onClick={() => toggleQuestion(q)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-emerald-400 font-bold">0{idx + 1}</span>
                          <span className="text-sm">{q}</span>
                        </div>
                        <button
                          type="button"
                          className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                            isChecked
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {isChecked ? 'Confirmed ✓' : 'Confirm'}
                        </button>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Required Evidence Checklist */}
            <div className="mb-8 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Recommended Evidence for Fast Resolution:
              </span>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(result.problem.evidence) ? result.problem.evidence : []).map((ev: string) => (
                  <span
                    key={ev}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    {ev}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                type="button"
                className="btn-primary-action w-full sm:w-auto justify-center"
                onClick={handleCreateCase}
                disabled={creatingCase}
              >
                {creatingCase ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                    <span>Saving Resolution Case...</span>
                  </>
                ) : (
                  <>
                    <span>Create Resolution Draft</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <Link
                href="/payment"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-semibold text-sm hover:bg-emerald-500/20 text-center transition-colors"
              >
                Fast-Track with Verification Pass →
              </Link>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Prototype Protection: No external government or company complaint is officially submitted without your explicit secondary citizen confirmation.
              </span>
            </div>
          </div>
        </section>
      )}

      {/* My Resolution Center (Cases) */}
      <section ref={casesSectionRef} id="cases" className="container-box py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <span className="section-label">MY RESOLUTION CENTER</span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-1 text-slate-100">
              Cases that move forward.
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">Total Cases: {cases.length}</span>
            <button
              type="button"
              onClick={async () => {
                const res = await fetch('/api/cases');
                if (res.ok) setCases(await res.json());
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-300 hover:text-emerald-400 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {cases.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40">
            <Clock3 className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Your newly created resolution cases will appear here.</p>
            <p className="text-xs text-slate-600 mt-1">
              Start by typing an issue in the input box above to generate your first draft.
            </p>
          </div>
        ) : (
          <div className="grid-cases">
            {cases.map((c) => (
              <Card3D key={c.id} glowColor="rgba(6, 182, 212, 0.2)">
                <div className="case-card-inner">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                        {c.category}
                      </span>
                      <span className={`status-pill status-${c.status || 'DRAFT'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {c.status || 'DRAFT'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 mb-2 leading-snug">
                      {c.title}
                    </h3>

                    {c.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                        {c.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>ID: {c.id.substring(0, 14)}</span>
                    <Link
                      href={`/payment?caseId=${c.id}`}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      <span>Verify & Pay</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </Card3D>
            ))}
          </div>
        )}
      </section>

      {/* Problem Library Section */}
      <section id="library" className="container-box py-16 border-t border-slate-800/60">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <span className="section-label">NOVA KNOWLEDGE LAYER</span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-1 text-slate-100">
              Problem Library & Statutory Routes
            </h2>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problem types or tags..."
              className="bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-500 w-full"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="filter-bar">
          {['all', 'Civic', 'Safety', 'Consumer', 'Government', 'Telecom', 'Banking', 'Vehicle', 'Home'].map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`filter-btn ${selectedCategory.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
              >
                {cat === 'all' ? 'All Problems' : cat}
              </button>
            )
          )}
        </div>

        {/* Problem Cards 3D Grid */}
        <div className="grid-cases">
          {filteredProblems.map((p) => (
            <Card3D key={p.id} glowColor="rgba(52, 211, 153, 0.2)">
              <div className="case-card-inner">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                      {p.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ~{p.estimatedResolutionDays} Days
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 mb-1.5">{p.name}</h3>

                  <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{p.route}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setText(p.tags[0] ? `Issue regarding: ${p.name}` : p.name);
                    const homeElem = document.getElementById('home');
                    homeElem?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-2 px-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-xs font-semibold text-slate-300 hover:text-emerald-300 flex items-center justify-between transition-colors"
                >
                  <span>Use Workflow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card3D>
          ))}
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="border-t border-slate-800/80 py-10 bg-[#030710]">
        <div className="container-box flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-300">NagrikOne</span>
            <span>•</span>
            <span>One Citizen. One Platform. Every Problem.</span>
          </div>
          <div>
            <span>Platform Architect: Jahid Tamboli • 3D Cyber-Civic Edition</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
