'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Send,
  Loader2,
  UserCheck,
  CheckCheck,
  FileText,
  ShieldCheck,
  MapPin,
  Calendar
} from 'lucide-react';

export interface TimelineEvent {
  id: string;
  status: string;
  note?: string;
  createdAt: string;
}

export interface CaseItem {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  description?: string;
  location?: string;
  statutoryRoute?: string;
  suggestedUrgency?: string;
  createdAt: string;
  updatedAt?: string;
  events?: TimelineEvent[];
}

interface CaseTimelineProps {
  caseItem: CaseItem;
  onOpenLegalDossier?: (caseItem: CaseItem) => void;
}

const LIFECYCLE_STAGES = [
  { key: 'DRAFT', label: 'Draft Prepared', icon: FileText, desc: 'Issue analyzed & structured by NOVA AI' },
  { key: 'UNDERSTANDING', label: 'Fact Verification', icon: Clock, desc: 'Citizen confirmed evidence & answers' },
  { key: 'READY_FOR_SUBMISSION', label: 'Statutory Docket Ready', icon: FileCheck, desc: 'Jurisdiction & act citations mapped' },
  { key: 'SUBMITTED', label: 'Dispatched to Authority', icon: Send, desc: 'Transmitted to designated portal/ward' },
  { key: 'IN_PROGRESS', label: 'Investigation Active', icon: Loader2, desc: 'Work order or enquiry docket issued' },
  { key: 'WAITING_FOR_CITIZEN', label: 'Action Needed', icon: UserCheck, desc: 'Awaiting citizen reply or document' },
  { key: 'RESOLVED', label: 'Statutory Resolution', icon: CheckCircle2, desc: 'Resolved with official resolution order' },
  { key: 'CLOSED', label: 'Case Archived', icon: CheckCheck, desc: 'Case closed with citizen feedback' }
];

export default function CaseTimeline({ caseItem, onOpenLegalDossier }: CaseTimelineProps) {
  const currentStatus = caseItem.status || 'DRAFT';

  const getStatusIndex = (status: string) => {
    const idx = LIFECYCLE_STAGES.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const currentIdx = getStatusIndex(currentStatus);

  const getPriorityColor = (p: string) => {
    switch (p?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-950/70 text-rose-300 border-rose-500/40';
      case 'URGENT':
        return 'bg-amber-950/70 text-amber-300 border-amber-500/40';
      case 'HIGH':
        return 'bg-orange-950/70 text-orange-300 border-orange-500/40';
      default:
        return 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40';
    }
  };

  return (
    <div className="rounded-2xl bg-[#081322] border border-slate-800 p-5 sm:p-6 text-slate-100 shadow-xl space-y-6">
      {/* Top Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/30">
              {caseItem.id}
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getPriorityColor(caseItem.priority)}`}>
              {caseItem.priority} PRIORITY
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {caseItem.category}
            </span>
          </div>
          <h3 className="font-extrabold text-base sm:text-lg text-slate-100">{caseItem.title}</h3>
        </div>

        {onOpenLegalDossier && (
          <button
            type="button"
            onClick={() => onOpenLegalDossier(caseItem)}
            className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Full Docket</span>
          </button>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {caseItem.statutoryRoute && (
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Designated Statutory Route</span>
              <strong className="text-slate-200">{caseItem.statutoryRoute}</strong>
            </div>
          </div>
        )}

        {caseItem.location && (
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Jurisdiction Locality</span>
              <strong className="text-slate-200">{caseItem.location}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Progress Stepper for Mobile & Desktop */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span>Statutory Lifecycle Tracker:</span>
          <span className="text-emerald-400 font-bold">{currentStatus.replace(/_/g, ' ')}</span>
        </h4>

        {/* Horizontal bar on desktop */}
        <div className="hidden md:grid grid-cols-8 gap-2">
          {LIFECYCLE_STAGES.map((stage, idx) => {
            const isDone = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const Icon = stage.icon;

            return (
              <div
                key={stage.key}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                  isCurrent
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : isDone
                    ? 'bg-slate-900/80 border-slate-700/60 text-slate-300'
                    : 'bg-slate-950/40 border-slate-800/50 text-slate-600'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isCurrent
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : isDone
                      ? 'bg-slate-700 text-emerald-400'
                      : 'bg-slate-900 text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-semibold line-clamp-2 leading-tight">
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Stacked Stepper for Mobile */}
        <div className="md:hidden space-y-2 border-l-2 border-slate-800 ml-2 pl-4 py-1">
          {LIFECYCLE_STAGES.map((stage, idx) => {
            const isDone = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const Icon = stage.icon;

            return (
              <div key={stage.key} className="relative flex items-start gap-3 py-1">
                <div
                  className={`-ml-[25px] w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isCurrent
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 font-bold'
                      : isDone
                      ? 'bg-slate-700 text-emerald-400'
                      : 'bg-slate-900 text-slate-600'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                </div>
                <div>
                  <p className={`text-xs font-bold ${isCurrent ? 'text-emerald-300' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                    {stage.label}
                  </p>
                  <p className="text-[11px] text-slate-400">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status History Events */}
      {caseItem.events && caseItem.events.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-mono uppercase text-slate-400 block">
            Statutory Audit Log ({caseItem.events.length} entries)
          </span>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {caseItem.events.map((ev, i) => (
              <div
                key={ev.id || i}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-200 font-mono text-[11px] text-emerald-400">
                    [{ev.status}]
                  </span>{' '}
                  <span>{ev.note || 'Status progression recorded.'}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {new Date(ev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
