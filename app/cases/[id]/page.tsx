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
  HelpCircle,
  RotateCcw,
  Sparkles,
  CheckCircle
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

  const handleOutcomeFeedback = async (outcomeType: 'RESOLVED' | 'PARTIAL' | 'NOT_RESOLVED') => {
    if (!caseId) return;
    setActionLoading(true);
    setError(null);

    let targetStatus = 'STATUTORY_RESOLVED';
    let note = 'Citizen confirmed issue is satisfactorily resolved.';

    if (outcomeType === 'PARTIAL') {
      targetStatus = 'RESOLUTION_PENDING';
      note = 'Citizen indicated issue is partially resolved. Case remains open for follow-up.';
    } else if (outcomeType === 'NOT_RESOLVED') {
      targetStatus = 'REOPENED';
      note = 'Citizen indicated issue was NOT resolved. Case reopened for next escalation step.';
    }

    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          note: note
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update outcome.');
      }
      fetchCase();
    } catch (err: any) {
      setError(err.message || 'Error updating case outcome.');
    } finally {
      setActionLoading(false);
    }
  };

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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && !caseData ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
            <p className="text-xs font-mono text-slate-400">Loading case docket and statutory timelines...</p>
          </div>
        ) : !caseData ? (
          <div className="py-20 text-center space-y-4">
            <AlertTriangle className="w-8 h-8 mx-auto text-amber-400" />
            <p className="text-sm text-slate-300">Case docket not found or access unauthorized.</p>
            <Link
              href="/cases"
              className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold"
            >
              Back to Cases
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Column: Case Details & Outcome Feedback */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Header Card */}
              <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#081322] to-[#040914] border border-slate-800 shadow-xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">CASE DOCKET ID</span>
                    <span className="text-sm font-mono font-black text-cyan-300">{caseData.id}</span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                      caseData.status === 'STATUTORY_RESOLVED' || caseData.status === 'CLOSED'
                        ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                        : caseData.status === 'REOPENED'
                        ? 'bg-purple-950/80 border border-purple-500/50 text-purple-300'
                        : caseData.status === 'SLA_WARNING' || caseData.status === 'ESCALATION_RECOMMENDED'
                        ? 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
                        : 'bg-cyan-950/80 border border-cyan-500/50 text-cyan-300'
                    }`}
                  >
                    {caseData.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-50 leading-tight">
                    {caseData.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {caseData.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Category / Domain</span>
                    <strong className="text-slate-200 block truncate">{caseData.problemType?.category || 'General Citizen Issue'}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Jurisdiction</span>
                    <strong className="text-slate-200 block truncate">{caseData.location || 'Unspecified Jurisdiction'}</strong>
                  </div>
                </div>
              </div>

              {/* OUTCOME RESOLUTION FEEDBACK (SECTION 68 & 69) */}
              <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#081322] to-[#040914] border border-cyan-500/30 shadow-xl space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                    <span>Outcome Resolution Feedback</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">
                    Did the authority or service provider solve your problem? Your response drives our resolution loop.
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={() => handleOutcomeFeedback('RESOLVED')}
                    disabled={actionLoading}
                    className="p-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Yes, Resolved</span>
                  </button>

                  <button
                    onClick={() => handleOutcomeFeedback('PARTIAL')}
                    disabled={actionLoading}
                    className="p-3.5 rounded-2xl bg-amber-950/40 hover:bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all"
                  >
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span>Partially Resolved</span>
                  </button>

                  <button
                    onClick={() => handleOutcomeFeedback('NOT_RESOLVED')}
                    disabled={actionLoading}
                    className="p-3.5 rounded-2xl bg-rose-950/40 hover:bg-rose-950/80 border border-rose-500/40 text-rose-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all"
                  >
                    <RotateCcw className="w-5 h-5 text-rose-400" />
                    <span>Not Resolved (Reopen)</span>
                  </button>
                </div>

                {caseData.status === 'REOPENED' && (
                  <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-xs text-purple-200 flex items-center justify-between gap-3">
                    <div>
                      <strong className="block font-bold">Case is currently Reopened</strong>
                      <span className="text-purple-300 font-sans">NOVA can prepare an escalated dispute docket or legal notice.</span>
                    </div>
                    <Link
                      href={`/nova?initial=${encodeURIComponent(`Case ${caseData.id} was not resolved. I need to escalate.`)}`}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs whitespace-nowrap"
                    >
                      Consult NOVA
                    </Link>
                  </div>
                )}
              </div>

              {/* Evidence & Case Facts */}
              <div className="rounded-3xl p-6 bg-gradient-to-b from-[#081322] to-[#040914] border border-slate-800 space-y-4">
                <h3 className="text-sm font-black text-slate-200 uppercase font-mono tracking-wider">
                  Verified Case Evidence ({caseData.evidence?.length || 0})
                </h3>

                {caseData.evidence && caseData.evidence.length > 0 ? (
                  <div className="space-y-2">
                    {caseData.evidence.map((ev: any, idx: number) => (
                      <div key={ev.id || idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-400" />
                          <span className="font-semibold text-slate-200">{ev.fileName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({Math.round((ev.fileSize || 0) / 1024)} KB)</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono uppercase">Verified</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-mono">No evidence files attached to this case.</p>
                )}
              </div>
            </div>

            {/* Right Column: Real Event Timeline & SLA Status */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Statutory SLA Target Card */}
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
