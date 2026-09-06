'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MapPin,
  FileCheck,
  ShieldCheck,
  ChevronRight,
  User,
  Trash2,
  Clock3,
  HelpCircle,
  Scale
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import NovaHeroCore, { NovaState } from '@/components/three/NovaHeroCore';
import { AuthSession } from '@/lib/auth/session';

interface DynamicQuestion {
  id: string;
  question: string;
  type: 'text' | 'choice' | 'boolean' | 'file';
  placeholder?: string;
  options?: string[];
  required: boolean;
  helpText?: string;
}

export default function NovaPage() {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState<string | undefined>();

  const [inputProblem, setInputProblem] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [novaState, setNovaState] = useState<NovaState>('IDLE');

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, string>>({});
  const [evidenceFiles, setEvidenceFiles] = useState<{ name: string; type: string; size: number; url?: string; ocrExtracted?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [creatingCase, setCreatingCase] = useState(false);
  const [createdCase, setCreatedCase] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check current session
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.warn('Session check failed:', err);
      }
    }
    checkSession();
  }, []);

  const handleStartAnalysis = async () => {
    if (!inputProblem.trim()) {
      setErrorMessage('Please describe the problem you are facing first.');
      return;
    }

    setErrorMessage(null);
    setNovaState('THINKING');
    setAnalyzing(true);

    try {
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputProblem,
          location: customLocation || undefined
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze issue.');
      }

      setNovaState('CLASSIFYING');
      setAnalysisResult(data);

      // Transition to idle after classification visual pulse
      setTimeout(() => {
        setNovaState('IDLE');
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error analyzing issue with NOVA.');
      setNovaState('IDLE');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!user) {
      setAuthPromptMessage('Before we start, please log in so I can securely save your problem, documents and case status.');
      setAuthModalOpen(true);
      return;
    }

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/evidence', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload verification failed.');
      }

      setEvidenceFiles((prev) => [...prev, data.file]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not upload evidence file.');
    }
  };

  const handleCreatePersistentCase = async () => {
    if (!user) {
      setAuthPromptMessage('Before we start, please log in so I can securely save your problem, documents and case status.');
      setAuthModalOpen(true);
      return;
    }

    if (!analysisResult?.problem) return;

    setCreatingCase(true);
    setErrorMessage(null);
    setNovaState('THINKING');

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: analysisResult.problem.name,
          category: analysisResult.problem.category,
          priority: analysisResult.classification?.suggestedUrgency || analysisResult.problem.priority,
          description: inputProblem,
          location: customLocation || analysisResult.location,
          problemId: analysisResult.problem.id,
          isUnknownIssue: analysisResult.classification?.isUnknown || false,
          inferredDomain: analysisResult.classification?.inferredDomain,
          dynamicAnswers,
          evidence: evidenceFiles
        })
      });

      const newCase = await res.json();

      if (!res.ok || !newCase.id) {
        if (newCase.requireAuth) {
          setAuthPromptMessage('Before we start, please log in so I can securely save your problem, documents and case status.');
          setAuthModalOpen(true);
          return;
        }
        throw new Error(newCase.error || 'Could not create persistent case.');
      }

      setCreatedCase(newCase);
      setNovaState('CASE_CREATED');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create case.');
      setNovaState('IDLE');
    } finally {
      setCreatingCase(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar
        user={user}
        onOpenAuth={() => {
          setAuthPromptMessage(undefined);
          setAuthModalOpen(true);
        }}
        onLogout={async () => {
          await fetch('/api/auth/session', { method: 'DELETE' });
          setUser(null);
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        initialMessage={authPromptMessage}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(u) => {
          setUser(u);
        }}
      />

      <div className="container-box py-8 lg:py-12">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>NOVA CONVERSATIONAL INTELLIGENCE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">
              Explain your situation naturally.
            </h1>
          </div>

          <Link
            href="/how-it-works"
            className="text-xs font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
          >
            <span>How NOVA Processes Issues</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200">
              ✕
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Natural Language Input & Dynamic Questions */}
          <div className="lg:col-span-7 space-y-6">
            {!createdCase ? (
              <>
                {/* Natural Input Box */}
                <div className="p-6 rounded-3xl bg-gradient-to-b from-[#081322] to-[#040914] border border-slate-800 shadow-2xl focus-within:border-cyan-500/60 transition-all">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2 font-bold">
                    Tell NOVA what you are facing:
                  </label>
                  <textarea
                    value={inputProblem}
                    onChange={(e) => setInputProblem(e.target.value)}
                    placeholder="e.g. 'My landlord is refusing to return my deposit of ₹45,000 after move out' or 'UPI payment was deducted but merchant didn't get it' or 'Street light is broken for 2 weeks'..."
                    className="w-full min-h-[120px] bg-transparent border-none outline-none text-base text-slate-100 placeholder:text-slate-600 resize-none"
                  />

                  {/* Evidence Attachments */}
                  {evidenceFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800/80 mb-3">
                      {evidenceFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
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

                  <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
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
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500 transition-colors"
                        title="Upload Photo / PDF Evidence"
                      >
                        <UploadCloud className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <input
                          type="text"
                          value={customLocation}
                          onChange={(e) => setCustomLocation(e.target.value)}
                          placeholder="Locality / City (Optional)"
                          className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder:text-slate-500 w-36 sm:w-44"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartAnalysis}
                      disabled={analyzing}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all disabled:opacity-50"
                    >
                      {analyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>NOVA Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <span>Understand & Triage</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Dynamic Questions Panel */}
                {analysisResult && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-[#081322] border border-cyan-500/40 shadow-2xl space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-[10.5px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                          CLARIFYING QUESTIONS
                        </span>
                        <h2 className="text-xl font-bold text-slate-100 mt-0.5">
                          {analysisResult.problem.name}
                        </h2>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                        {analysisResult.classification?.suggestedUrgency || 'MEDIUM'} PRIORITY
                      </span>
                    </div>

                    {/* Reasoning Note */}
                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
                      <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-slate-100 font-semibold mb-0.5">NOVA Assessment:</strong>
                        <span>{analysisResult.classification?.reasoning}</span>
                      </div>
                    </div>

                    {/* Questions Form */}
                    <div className="space-y-4">
                      {((analysisResult.dynamicQuestions || []) as DynamicQuestion[]).map((q, idx) => (
                        <div key={q.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                          <label className="text-xs font-bold text-slate-200 block mb-2">
                            <span className="text-cyan-400 font-mono mr-1.5">0{idx + 1}.</span>
                            {q.question}
                          </label>

                          {q.type === 'choice' && q.options ? (
                            <div className="grid sm:grid-cols-2 gap-2 mt-2">
                              {q.options.map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setDynamicAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                                  className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                                    dynamicAnswers[q.id] === opt
                                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 font-semibold'
                                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={dynamicAnswers[q.id] || ''}
                              onChange={(e) => setDynamicAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                              placeholder={q.placeholder || 'Enter details...'}
                              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-400"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Summary & Create Case Confirmation */}
                    <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400 block">Recommended Pathway:</span>
                        <strong className="text-xs text-cyan-300 font-mono">{analysisResult.problem.route}</strong>
                      </div>

                      <button
                        type="button"
                        onClick={handleCreatePersistentCase}
                        disabled={creatingCase}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all disabled:opacity-50"
                      >
                        {creatingCase ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                            <span>Creating Case Dossier...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-slate-950" />
                            <span>Confirm & Create Case</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Case Created Success Screen */
              <div className="p-8 rounded-3xl bg-gradient-to-b from-[#081e28] to-[#040f17] border border-emerald-500/50 shadow-2xl text-center space-y-6 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    CASE DOSSIER SECURELY GENERATED
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-50 mt-2">
                    {createdCase.title}
                  </h2>
                  <p className="text-sm font-mono text-cyan-300 mt-1">
                    Case ID: <strong className="font-extrabold">{createdCase.caseNumber || createdCase.id}</strong>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left text-xs text-slate-300 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-mono text-cyan-400 font-semibold">{createdCase.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category:</span>
                    <span>{createdCase.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Route:</span>
                    <span className="text-emerald-300 font-semibold">{analysisResult?.problem?.route || 'Official Review'}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    href={`/cases/${createdCase.id}`}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-opacity"
                  >
                    <span>Track Case Dossier</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setCreatedCase(null);
                      setAnalysisResult(null);
                      setInputProblem('');
                      setEvidenceFiles([]);
                      setNovaState('IDLE');
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-semibold text-xs hover:text-white"
                  >
                    Start Another Case
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: 3D NOVA Core Visualizer */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-[#040914] border border-slate-800/80 rounded-3xl p-2 shadow-2xl">
              <NovaHeroCore state={novaState} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
