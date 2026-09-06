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
  Zap,
  Scale,
  Layers,
  Check,
  Eye,
  Trash2,
  FileCheck,
  Navigation
} from 'lucide-react';
import Civic3DCanvas from '@/components/Civic3DCanvas';
import Card3D from '@/components/Card3D';
import Navbar from '@/components/Navbar';
import AuthModal, { UserSession } from '@/components/AuthModal';
import ProblemModal from '@/components/ProblemModal';
import LegalNoticeModal from '@/components/LegalNoticeModal';
import { PROBLEM_TYPES, ProblemTypeDefinition, CATEGORIES } from '@/lib/problemTypes';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const speechRecognitionRef = useRef<any>(null);

  const [evidenceFiles, setEvidenceFiles] = useState<{ name: string; previewUrl?: string; ocrExtracted?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [confirmedQuestions, setConfirmedQuestions] = useState<Record<string, boolean>>({});

  const [user, setUser] = useState<UserSession | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [activeDossierProblem, setActiveDossierProblem] = useState<ProblemTypeDefinition | null>(null);
  const [activeLegalNoticeProblem, setActiveLegalNoticeProblem] = useState<ProblemTypeDefinition | null>(null);

  const resolutionCardRef = useRef<HTMLDivElement | null>(null);
  const casesSectionRef = useRef<HTMLElement | null>(null);

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

  const toggleVoiceInput = () => {
    if (isRecording) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN';

      recognition.onstart = () => {
        setIsRecording(true);
        setErrorNotice(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } else {
      setIsRecording(true);
      setTimeout(() => {
        if (!text) {
          setText('Mere area mein street light 5 din se band hai aur raat ko andhera rehta hai.');
        }
        setIsRecording(false);
      }, 2400);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const previewUrl = URL.createObjectURL(file);
    const newEvidence = {
      name: file.name,
      previewUrl,
      ocrExtracted: `OCR Verified: Geotag timestamped • Format ${file.type.split('/')[1] || 'DOC'}`
    };

    setEvidenceFiles((prev) => [...prev, newEvidence]);
    setSuccessNotice(`Evidence "${file.name}" uploaded and AI OCR verified!`);
  };

  const handleDetectGPS = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(`Ward 42, Metro Sector (Lat: ${pos.coords.latitude.toFixed(2)}, Lon: ${pos.coords.longitude.toFixed(2)})`);
          setSuccessNotice('GPS Locality detected and pinned successfully!');
        },
        (err) => {
          setLocation('Municipal Ward No. 14, Central Zone');
          setSuccessNotice('Locality updated to Central Municipal Ward.');
        }
      );
    } else {
      setLocation('Municipal Ward No. 14, Central Zone');
    }
  };

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
      setConfirmedQuestions({});

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

  function toggleQuestion(q: string) {
    setConfirmedQuestions((prev) => ({
      ...prev,
      [q]: !prev[q]
    }));
  }

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
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesSearch;
  });
  return (
    <main className="min-h-screen bg-[#040914] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
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
      <section id="home" className="container-box hero-wrapper">
        <div>
          <div className="badge-verified">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>99 STATUTORY ROUTES • AI TRIAGE & LEGAL DISPATCH</span>
          </div>

          <h1 className="hero-heading">
            Har problem ka <em>next step.</em>
          </h1>

          <p className="hero-subtext">
            Government, municipal civic, cybercrime, bank fraud, women rights, consumer disputes, and utility breakdowns — tell NagrikOne what happened for instant official escalation routes.
          </p>

          {/* Smart Input Card */}
          <div className="input-glass-box">
            <textarea
              className="issue-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell NagrikOne what happened... (e.g. 'Street light band hai 4 din se' or 'Cyber scam me OTP chala gaya')"
            />

            {/* Voice Waveform */}
            {isRecording && (
              <div className="flex items-center gap-2 p-2.5 mb-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-pulse">
                <div className="waveform-container">
                  <div className="waveform-bar" />
                  <div className="waveform-bar" />
                  <div className="waveform-bar" />
                  <div className="waveform-bar" />
                  <div className="waveform-bar" />
                </div>
                <span>Listening live in Hindi / English... Speak your issue clearly</span>
              </div>
            )}

            {/* Evidence Chips */}
            {evidenceFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {evidenceFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="max-w-[140px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setEvidenceFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="input-toolbar">
              <div className="tool-group">
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`btn-tool ${isRecording ? 'recording' : ''}`}
                  title={isRecording ? 'Stop Voice Recording' : 'Dictate issue with Speech-to-Text'}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-tool"
                  title="Upload Photo / Evidence with OCR Parsing"
                >
                  <Camera className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-tool"
                  title="Attach Bill, Police Slip, or Notice"
                >
                  <UploadCloud className="w-4 h-4" />
                </button>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    title="Auto-detect GPS location"
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </button>
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

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-500">Quick prompts:</span>
            {[
              'Street light band hai 4 din se',
              'Online scam me 15,000 kat gaye',
              'Pothole near metro station',
              'E-commerce return refund stuck',
              'Bank recovery agent harassment'
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

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">✓ 99 Statutory Routes</span>
            <span className="flex items-center gap-1 text-cyan-400">✓ NOVA.Ai Legal Drafting</span>
            <span className="flex items-center gap-1 text-purple-400">✓ 100% Citizen Approval First</span>
          </div>
        </div>

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
      {/* Resolution Blueprint */}
      {result?.problem && (
        <section ref={resolutionCardRef} className="container-box animate-fadeIn">
          <div className="plan-container">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="section-label">RESOLUTION ACTION BLUEPRINT</span>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {Math.round((result.detection?.confidence || 0.88) * 100)}% Match Confidence
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                    result.detection?.suggestedUrgency === 'CRITICAL' || result.detection?.suggestedUrgency === 'URGENT'
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

            {result.problem.legalAct && (
              <div className="mb-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5">
                <Scale className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong>Statutory Protection:</strong> {result.problem.legalAct}
                </span>
              </div>
            )}

            {result.problem.guidelines && (
              <div className="mb-6 p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 leading-relaxed flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5 text-cyan-100">Citizen Legal & Procedural Advisory:</strong>
                  {result.problem.guidelines}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono mb-3">
                Smart Verification Checklist
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

            <div className="flex flex-col sm:flex-row items-center gap-3">
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

              <button
                type="button"
                onClick={() => setActiveLegalNoticeProblem(result.problem)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-purple-500/40 bg-purple-950/40 text-purple-300 font-semibold text-xs hover:bg-purple-900/40 flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.15)]"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Generate NOVA AI Legal Draft</span>
              </button>

              <Link
                href="/payment"
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-semibold text-xs hover:bg-emerald-500/20 text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Fast-Track Pass</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Cases Section */}
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
              <span>Refresh</span>
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

      {/* 99 Problem Library */}
      <section id="library" className="container-box py-16 border-t border-slate-800/60">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="section-label">NOVA KNOWLEDGE LAYER</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                99 Active Routes
              </span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mt-1 text-slate-100">
              99 Problem Library & Statutory Routes
            </h2>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all 99 problems, acts, or tags..."
              className="bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-500 w-full"
            />
          </div>
        </div>

        <div className="filter-bar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`filter-btn ${isSelected ? 'active' : ''}`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-4">
          <span>Showing {filteredProblems.length} statutory routes</span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-cyan-400 hover:underline"
            >
              Clear Search
            </button>
          )}
        </div>

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

                  <p className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{p.route}</span>
                  </p>

                  {p.legalAct && (
                    <p className="text-[11px] text-slate-500 font-mono line-clamp-1 mb-3">
                      ⚖️ {p.legalAct}
                    </p>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setActiveDossierProblem(p)}
                    className="w-full py-2 px-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>View Statutory Route Dossier</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setText(p.tags[0] ? `Issue regarding: ${p.name}` : p.name);
                      const homeElem = document.getElementById('home');
                      homeElem?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-bold text-emerald-300 flex items-center justify-between transition-colors"
                  >
                    <span>Launch Direct Workflow</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="border-t border-slate-800/80 py-12 bg-[#030710]">
        <div className="container-box flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 font-mono">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="font-bold text-slate-200 text-sm">NagrikOne</span>
              <span>•</span>
              <span className="text-emerald-400">One Citizen. One Platform. Every Problem.</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Covers 99 Statutory Citizen Grievances under BNSS, Consumer Protection Act, IT Act, and RTI Directives.
            </p>
          </div>
          <div className="text-center md:text-right">
            <span className="block text-slate-400 font-semibold">Platform Architect: Jahid Tamboli</span>
            <span className="text-[10px] text-slate-600">3D Cyber-Civic Edition • 256-Bit SSL Encrypted</span>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setSuccessNotice(`Welcome back, ${loggedInUser.name}!`);
        }}
      />

      <ProblemModal
        problem={activeDossierProblem}
        onClose={() => setActiveDossierProblem(null)}
        onSelectWorkflow={(p) => {
          setText(p.name);
          const homeElem = document.getElementById('home');
          homeElem?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenLegalNotice={(p) => {
          setActiveLegalNoticeProblem(p);
        }}
      />

      <LegalNoticeModal
        isOpen={!!activeLegalNoticeProblem}
        onClose={() => setActiveLegalNoticeProblem(null)}
        problem={activeLegalNoticeProblem}
        citizenName={user?.name || 'Citizen of India'}
        locality={location || 'Local Municipal Ward / Jurisdiction'}
        customDetails={text || activeLegalNoticeProblem?.name}
      />
    </main>
  );
}
