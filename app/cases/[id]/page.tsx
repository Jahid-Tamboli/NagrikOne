'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Building2,
  Scale,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  User,
  Activity,
  Zap,
  HelpCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import { AuthSession } from '@/lib/auth/session';

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params?.id as string;

  const [user, setUser] = useState<AuthSession | null>(null);
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const fetchCase = async () => {
    if (!caseId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Case not found');
      }
      setCaseData(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load case docket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        if (sessionData.authenticated && sessionData.user) {
          setUser(sessionData.user);
        }
      } catch (e) {}
      fetchCase();
    }
    init();
  }, [caseId]);

  const handleVerifyResolution = async () => {
    if (!caseId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'STATUTORY_RESOLVED',
          note: 'Citizen verified satisfactory resolution of the issue.'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to verify resolution.');
      }
      fetchCase();
    } catch (err: any) {
      setError(err.message || 'Error updating status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopenCase = async () => {
    if (!caseId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REOPENED',
          note: 'Citizen requested review / reopened case due to recurring problem.'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reopen case.');
      }
      fetchCase();
    } catch (err: any) {
      setError(err.message || 'Error reopening case.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
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
        onLoginSuccess={(u) => {
          setUser(u);
          fetchCase();
        }}
      />

      <div className="container-box py-10 lg:py-14 max-w-6xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/cases"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Case Dockets</span>
          </Link>

          <button
            onClick={fetchCase}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
            title="Refresh Timeline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="p-24 text-center text-slate-400 font-mono">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-400" />
            <p className="text-xs">Loading case dossier & timeline...</p>
          </div>
        ) : error || !caseData ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400 max-w-md mx-auto space-y-4">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-100">Unable to view case</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{error || 'Case does not exist.'}</p>
            <Link
              href="/cases"
              className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200"
            >
              Back to Cases
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Case Information & Evidence */}
            <div className="lg:col-span-7 space-y-6">
              {/* Header Box */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#081322] to-[#040914] border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-500/30">
                    {caseData.category}
                  </span>
                  <span className={`status-pill status-${caseData.status}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {caseData.status}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight">
                  {caseData.title}
                </h1>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                  {caseData.description || 'No statement provided.'}
                </div>

                {caseData.location && (
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span className="text-cyan-400 font-bold">Location:</span>
                    <span className="text-slate-200">{caseData.location}</span>
                  </div>
                )}
              </div>

              {/* Statutory Jurisdiction & Pathway */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-[#061e1b] to-[#030e0c] border border-emerald-500/30 space-y-3">
                <span className="text-[10.5px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                  STATUTORY ROUTING PATHWAY
                </span>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold text-slate-100">
                      {caseData.problem?.route || 'Official Department Review'}
                    </h3>
                    {caseData.problem?.legalAct && (
                      <p className="text-xs text-emerald-300/90 mt-1 font-mono">
                        Protected under: {caseData.problem.legalAct}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Evidence Inspector */}
              {caseData.evidenceList && caseData.evidenceList.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <span className="text-[10.5px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                    ATTACHED EVIDENCE ({caseData.evidenceList.length})
                  </span>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {caseData.evidenceList.map((file: any) => (
                      <div
                        key={file.id}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-xs"
                      >
                        <FileCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                        <div className="overflow-hidden">
                          <strong className="text-slate-200 block truncate">{file.fileName}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">{file.ocrExtracted || 'Verified evidence'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Citizen Actions */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Case Actions</h4>
                  <p className="text-xs text-slate-400">Confirm resolution or request operational review.</p>
                </div>

                <div className="flex items-center gap-3">
                  {caseData.status !== 'STATUTORY_RESOLVED' && caseData.status !== 'CLOSED' ? (
                    <button
                      onClick={handleVerifyResolution}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify Resolved</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleReopenCase}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
                    >
                      Reopen Case
                    </button>
                  )}

                  <Link
                    href={`/payment?caseId=${caseData.id}`}
                    className="px-4 py-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 font-semibold text-xs hover:bg-cyan-900/40 transition-colors flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Fast-Track Pass</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Real Event Timeline & SLA Status */}
            <div className="lg:col-span-5 space-y-6">
              {/* SLA Target Card */}
              {caseData.sla && (
                <div className="p-6 rounded-3xl bg-[#081322] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                      STATUTORY SLA TARGET
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        caseData.sla.isBreached
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : caseData.sla.isWarning
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {caseData.sla.recommendation}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {caseData.sla.summary}
                  </p>
                </div>
              )}

              {/* Event Timeline */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#081322] border border-slate-800 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Case Timeline</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {caseData.events?.length || 0} Events
                  </span>
                </div>

                <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {(caseData.events || []).map((ev: any, idx: number) => (
                    <div key={ev.id || idx} className="relative flex items-start gap-4 pl-8">
                      <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-[#081322] shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                            {ev.status}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(ev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          {ev.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
