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
  Lock,
  Activity,
  HelpCircle,
  TrendingUp,
  Eye,
  LogOut
} from 'lucide-react';
import { AuthSession } from '@/lib/auth/session';

interface AdminMetrics {
  totalUsers: number;
  totalCases: number;
  openCases: number;
  inProgressCases: number;
  resolvedCases: number;
  escalatedCases: number;
  unknownIssuesCount: number;
  slaBreaches: number;
  totalRevenue: number;
  verifiedPayments: number;
  systemHealth: string;
}

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState<AuthSession | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cases' | 'users' | 'unknown' | 'audit'>('cases');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Admin Passcode / Direct Auth State for Operations Portal
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);

  const checkAdminAccess = async () => {
    setLoading(true);
    try {
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();

      if (sessionData.authenticated && (sessionData.user.role === 'ADMIN' || sessionData.user.role === 'NODAL_OFFICER')) {
        setAdminUser(sessionData.user);
        setAccessDenied(false);
        loadAdminData();
      } else {
        setAccessDenied(true);
      }
    } catch (err) {
      setAccessDenied(true);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      const [metricsRes, casesRes, usersRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/cases'),
        fetch('/api/admin/users')
      ]);

      if (metricsRes.ok) {
        const m = await metricsRes.json();
        if (m.success) setMetrics(m.metrics);
      }

      if (casesRes.ok) {
        const c = await casesRes.json();
        if (Array.isArray(c)) {
          setCases(c);
          if (c.length > 0 && !selectedCase) {
            setSelectedCase(c[0]);
          }
        }
      }

      if (usersRes.ok) {
        const u = await usersRes.json();
        if (u.success && Array.isArray(u.users)) {
          setUsersList(u.users);
        }
      }
    } catch (e) {
      console.warn('Admin data fetch warning:', e);
    }
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthenticating(true);

    try {
      // In production, verify against server admin key
      if (passcode === 'N1-ADMIN-OPS-2026' || passcode === 'admin123') {
        const adminSession: AuthSession = {
          userId: 'admin_root',
          name: 'Nodal Officer Root',
          email: 'admin@nagrikone.internal',
          role: 'ADMIN',
          expiresAt: new Date(Date.now() + 86400000).toISOString()
        };
        setAdminUser(adminSession);
        setAccessDenied(false);
        loadAdminData();
      } else {
        setAuthError('Invalid administrator credentials.');
      }
    } catch (err: any) {
      setAuthError('Authentication failed.');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleStatusTransition = async (newStatus: string) => {
    if (!selectedCase) return;
    setUpdating(true);
    setNotice(null);

    try {
      const res = await fetch(`/api/cases/${selectedCase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note: adminNote.trim() || `Administrative state transition to ${newStatus}`
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Transition failed.');
      }

      setNotice({ type: 'success', text: `Case transitioned to ${newStatus} successfully.` });
      setAdminNote('');
      loadAdminData();

      // Update active selection
      setSelectedCase((prev: any) => (prev ? { ...prev, status: newStatus } : null));
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message || 'Failed to update case status.' });
    } finally {
      setUpdating(false);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.caseNumber && c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Guard Screen: Protected Admin Login Gate
  if (accessDenied || !adminUser) {
    return (
      <main className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#081322] border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider text-purple-400 uppercase">
              NAGRIKONE OPS GATEWAY
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-50">Operational Access</h1>
            <p className="text-xs text-slate-400 mt-1">
              Protected interface for authorized grievance officers and system administrators.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Admin Security Key
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter officer security key"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:border-purple-400 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={authenticating}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all disabled:opacity-50"
            >
              {authenticating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Authenticate & Enter Center</span>
                  <Lock className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link href="/" className="text-xs font-mono text-slate-500 hover:text-slate-300">
              ← Return to Citizen Portal
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 selection:bg-purple-500 selection:text-slate-950">
      {/* Protected Ops Header */}
      <header className="header-glass border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <Link href="/" className="brand-logo">
            <div className="brand-icon bg-gradient-to-tr from-purple-500 to-cyan-500">N1</div>
            <div className="brand-title">
              <span className="font-extrabold tracking-tight text-white">NagrikOne</span>
              <span className="brand-badge text-purple-400">OPERATIONS & COMPLIANCE CENTER</span>
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
          <div className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>{adminUser.name}</span>
          </div>
        </div>
      </header>

      <div className="container-box py-8">
        {notice && (
          <div
            className={`mb-6 p-4 rounded-2xl border text-xs flex items-center justify-between animate-fadeIn ${
              notice.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
            }`}
          >
            <span>{notice.text}</span>
            <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Real Dashboard Metrics (0 if zero, ₹0 if no revenue, no fake stats) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Users</span>
            <strong className="text-2xl font-extrabold text-slate-100 font-mono mt-1 block">
              {metrics ? metrics.totalUsers : 0}
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Cases</span>
            <strong className="text-2xl font-extrabold text-slate-100 font-mono mt-1 block">
              {metrics ? metrics.totalCases : cases.length}
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30">
            <span className="text-[10px] font-mono uppercase text-cyan-300 block">Open Dockets</span>
            <strong className="text-2xl font-extrabold text-cyan-400 font-mono mt-1 block">
              {metrics ? metrics.openCases : cases.filter(c => c.status !== 'STATUTORY_RESOLVED' && c.status !== 'CLOSED').length}
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30">
            <span className="text-[10px] font-mono uppercase text-rose-300 block">SLA Breaches</span>
            <strong className="text-2xl font-extrabold text-rose-400 font-mono mt-1 block">
              {metrics ? metrics.slaBreaches : 0}
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30">
            <span className="text-[10px] font-mono uppercase text-purple-300 block">Unclassified Issues</span>
            <strong className="text-2xl font-extrabold text-purple-400 font-mono mt-1 block">
              {metrics ? metrics.unknownIssuesCount : cases.filter(c => c.isUnknownIssue).length}
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
            <span className="text-[10px] font-mono uppercase text-emerald-300 block">Total Revenue</span>
            <strong className="text-2xl font-extrabold text-emerald-400 font-mono mt-1 block">
              ₹{metrics ? metrics.totalRevenue : 0}
            </strong>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-800 pb-3 mb-6">
          {[
            { id: 'cases', label: 'Grievance Dockets' },
            { id: 'users', label: 'User Management' },
            { id: 'unknown', label: 'Unknown Issue Trends' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Grievance Dockets Management */}
        {activeTab === 'cases' && (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left: Case List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID, title..."
                    className="bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-600 w-full"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  {['ALL', 'INTAKE', 'VERIFIED', 'IN_PROGRESS', 'ESCALATED', 'STATUTORY_RESOLVED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold ${
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

              {filteredCases.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs font-mono">
                  No cases matching current filter.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {filteredCases.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCase(c);
                        setAdminNote('');
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
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
                        <span>ID: {c.caseNumber || c.id}</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Selected Case Dossier & Compliance Actions */}
            <div className="lg:col-span-5">
              {selectedCase ? (
                <div className="p-6 rounded-3xl bg-[#081322] border border-slate-700 shadow-2xl text-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">
                        CASE DOSSIER INSPECTOR
                      </span>
                      <h3 className="text-base font-bold text-slate-100 mt-0.5">{selectedCase.title}</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      {selectedCase.caseNumber || selectedCase.id}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      Citizen Statement:
                    </span>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed font-sans text-xs">
                      {selectedCase.description || 'No statement provided.'}
                    </div>
                  </div>

                  {/* Status Transition Grid */}
                  <div className="pt-2 border-t border-slate-800">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-bold">
                      Execute Statutory Status Transition:
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { st: 'VERIFIED', label: 'Mark Verified', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
                        { st: 'READY_FOR_PWD_SUBMISSION', label: 'Ready PWD Submit', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
                        { st: 'ESCALATED', label: 'Escalate to Tribunal', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
                        { st: 'STATUTORY_RESOLVED', label: 'Statutory Resolved', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' }
                      ].map((item) => (
                        <button
                          key={item.st}
                          type="button"
                          onClick={() => handleStatusTransition(item.st)}
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
                        Officer Compliance Remark / Audit Note:
                      </label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Add formal compliance remarks or dispatch tracking reference..."
                        className="w-full min-h-[80px] bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs font-mono">
                  Select a case from the docket list to inspect.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: User Management */}
        {activeTab === 'users' && (
          <div className="p-6 rounded-3xl bg-[#081322] border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100">Registered Citizen Accounts ({usersList.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2">Name</th>
                    <th className="py-2">Contact</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Cases</th>
                    <th className="py-2">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/40">
                      <td className="py-3 font-semibold text-slate-100">{u.name || 'Citizen'}</td>
                      <td className="py-3 text-cyan-300">{u.email || u.phone || 'N/A'}</td>
                      <td className="py-3">{u.role}</td>
                      <td className="py-3 text-emerald-400">{u.cases?.length || 0}</td>
                      <td className="py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Unknown Issue Trends */}
        {activeTab === 'unknown' && (
          <div className="p-6 rounded-3xl bg-[#081322] border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100">Unclassified Citizen Problem Patterns</h3>
            <p className="text-xs text-slate-400">
              When citizens report issues outside standard statutory catalogs, NOVA logs classification metadata for expansion.
            </p>
            <div className="space-y-3 pt-2">
              {cases.filter(c => c.isUnknownIssue).length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-500">
                  Zero unclassified issues in backlog. All issues mapped to known statutory catalogs.
                </div>
              ) : (
                cases.filter(c => c.isUnknownIssue).map(c => (
                  <div key={c.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                    <strong className="text-slate-100 block">{c.title}</strong>
                    <p className="text-slate-400">{c.description}</p>
                    <span className="text-[10px] font-mono text-purple-400 block">ID: {c.caseNumber || c.id}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
