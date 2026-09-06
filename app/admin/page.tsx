'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  User,
  ShieldCheck,
  RefreshCw,
  Edit,
  Download,
  ExternalLink,
  Zap,
  Lock
} from 'lucide-react';

interface AdminCase {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  description?: string;
  location?: string;
  createdAt: string;
  notes?: string;
}

export default function AdminPage() {
  const [cases, setCases] = useState<AdminCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState<AdminCase | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // default demo authenticated

  const loadCases = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCases(data);
          if (data.length > 0 && !selectedCase) {
            setSelectedCase(data[0]);
          }
        }
      }
    } catch (err) {
      console.error('[Admin] Error fetching cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedCase) return;
    setUpdating(true);

    try {
      // Local optimistic update
      const updated = cases.map((c) =>
        c.id === selectedCase.id ? { ...c, status: newStatus, notes: adminNote || c.notes } : c
      );
      setCases(updated);
      setSelectedCase((prev) => (prev ? { ...prev, status: newStatus, notes: adminNote || prev.notes } : null));
    } catch (err) {
      console.error('[Admin] Update failed:', err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const urgentCount = cases.filter((c) => c.priority === 'CRITICAL' || c.priority === 'URGENT').length;
  const resolvedCount = cases.filter((c) => c.status === 'RESOLVED').length;

  return (
    <main className="min-h-screen bg-[#040914] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Admin Header */}
      <header className="header-glass">
        <div className="flex items-center gap-3">
          <Link href="/" className="brand-logo">
            <div className="brand-icon">N1</div>
            <div className="brand-title">
              <span className="font-extrabold tracking-tight text-white">NagrikOne</span>
              <span className="brand-badge text-purple-400">ADMIN COMMAND CENTER</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Citizen Portal</span>
          </Link>
          <div className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-mono flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Nodal Officer Session</span>
          </div>
        </div>
      </header>

      <div className="container-box py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-mono uppercase text-slate-400 block">Total Cases Docketed</span>
            <strong className="text-2xl font-extrabold text-slate-100 font-mono mt-1 block">
              {cases.length}
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30">
            <span className="text-[11px] font-mono uppercase text-rose-300 block">Urgent / Critical</span>
            <strong className="text-2xl font-extrabold text-rose-400 font-mono mt-1 block">
              {urgentCount}
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
            <span className="text-[11px] font-mono uppercase text-emerald-300 block">Statutory Resolved</span>
            <strong className="text-2xl font-extrabold text-emerald-400 font-mono mt-1 block">
              {resolvedCount}
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30">
            <span className="text-[11px] font-mono uppercase text-cyan-300 block">Live Resolution SLA</span>
            <strong className="text-2xl font-extrabold text-cyan-400 font-mono mt-1 block">
              98.4% On-Time
            </strong>
          </div>
        </div>

        {/* Case Table / Detail Split Layout */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column: Case List */}
          <div className="lg:col-span-7 space-y-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, title, or category..."
                  className="bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-600 w-full"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {['ALL', 'DRAFT', 'VERIFICATION_PENDING', 'VERIFIED', 'RESOLVED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                      statusFilter === st
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Case List Items */}
            {loading ? (
              <div className="p-12 text-center text-slate-400 font-mono">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                <span>Loading official grievance dockets...</span>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
                No resolution cases matched current filter.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {filteredCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCase(c);
                      setAdminNote(c.notes || '');
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedCase?.id === c.id
                        ? 'bg-purple-950/30 border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                        {c.category}
                      </span>
                      <span className={`status-pill status-${c.status || 'DRAFT'}`}>
                        {c.status || 'DRAFT'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 mb-1">{c.title}</h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>ID: {c.id}</span>
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Selected Case Action Center */}
          <div className="lg:col-span-5">
            {selectedCase ? (
              <div className="p-6 rounded-2xl bg-[#081322] border border-slate-700 shadow-2xl text-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">
                      CASE DOSSIER INSPECTOR
                    </span>
                    <h3 className="text-base font-bold text-slate-100 mt-0.5">{selectedCase.title}</h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    {selectedCase.id}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Citizen Complaint Statement:
                  </span>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed font-sans text-xs">
                    {selectedCase.description || 'No additional statement provided.'}
                  </div>
                </div>

                {selectedCase.location && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
                    <span className="text-cyan-400 font-mono text-[11px]">Locality / Ward:</span>
                    <strong className="text-slate-100">{selectedCase.location}</strong>
                  </div>
                )}

                {/* Status Update Actions */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-bold">
                    Statutory Case Status Transition:
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { st: 'VERIFIED', label: 'Mark Verified', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
                      { st: 'DISPATCHED', label: 'Dispatched to PWD/Police', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
                      { st: 'ESCALATED', label: 'Escalate to Tribunal', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
                      { st: 'RESOLVED', label: 'Statutory Resolved', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' }
                    ].map((item) => (
                      <button
                        key={item.st}
                        type="button"
                        onClick={() => handleUpdateStatus(item.st)}
                        disabled={updating}
                        className={`p-2 rounded-xl border text-xs font-semibold text-center transition-colors ${item.color} ${
                          selectedCase.status === item.st ? 'ring-2 ring-white' : ''
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                      Officer Case Note / Compliance Log:
                    </label>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Add compliance notes, dispatch reference number, or officer remarks..."
                      className="w-full min-h-[80px] bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:border-purple-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedCase.status)}
                      className="mt-2 w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-slate-950 font-bold text-xs transition-colors"
                    >
                      Save Case Compliance Note
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
                Select a case from the docket list to inspect and take action.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
