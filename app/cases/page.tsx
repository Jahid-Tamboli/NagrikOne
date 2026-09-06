'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  RefreshCw,
  Plus,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Lock
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import { AuthSession } from '@/lib/auth/session';

interface CaseSummary {
  id: string;
  caseNumber: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  description?: string;
  location?: string;
  createdAt: string;
  slaDueAt?: string;
}

export default function CasesPage() {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadCases = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCases(data);
        }
      }
    } catch (err) {
      console.warn('Error fetching cases:', err);
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
      loadCases();
    }
    init();
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.caseNumber && c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar
        casesCount={cases.length}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={async () => {
          await fetch('/api/auth/session', { method: 'DELETE' });
          setUser(null);
          setCases([]);
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(u) => {
          setUser(u);
          loadCases();
        }}
      />

      <div className="container-box py-10 lg:py-14">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-[10.5px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
              CITIZEN RESOLUTION CENTER
            </span>
            <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight">
              My Case Dockets
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadCases}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Refresh Dockets"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/nova"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Case</span>
            </Link>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Case ID, title, or category..."
              className="bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-600 w-full"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {['ALL', 'INTAKE', 'VERIFIED', 'IN_PROGRESS', 'STATUTORY_RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Case List */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 font-mono">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-400" />
            <p className="text-xs">Loading case dockets...</p>
          </div>
        ) : !user ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 max-w-lg mx-auto space-y-4">
            <Lock className="w-10 h-10 text-cyan-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-100">Sign in to view your cases</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your cases, documents, and resolution statuses are securely tied to your verified phone or email.
            </p>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-lg"
            >
              Sign In with OTP
            </button>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No resolution cases found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You do not have any open cases matching the current filter. Tell NOVA what happened to start a new case dossier.
            </p>
            <Link
              href="/nova"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-semibold text-xs hover:border-cyan-400 transition-colors"
            >
              <span>Talk to NOVA</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="group p-6 rounded-3xl bg-gradient-to-b from-[#081322] to-[#040914] border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-md border border-cyan-500/30">
                      {c.category}
                    </span>
                    <span className={`status-pill status-${c.status || 'DRAFT'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {c.status || 'DRAFT'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-2 leading-snug">
                    {c.title}
                  </h3>

                  {c.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed font-sans">
                      {c.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>ID: {c.caseNumber || c.id.substring(0, 12)}</span>
                  <span className="text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
