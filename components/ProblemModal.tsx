'use client';

import React from 'react';
import {
  X,
  ShieldCheck,
  Clock,
  FileText,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Sparkles,
  Scale,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { ProblemTypeDefinition } from '@/lib/problemTypes';

interface ProblemModalProps {
  problem: ProblemTypeDefinition | null;
  onClose: () => void;
  onSelectWorkflow: (problem: ProblemTypeDefinition) => void;
  onOpenLegalNotice: (problem: ProblemTypeDefinition) => void;
}

export default function ProblemModal({
  problem,
  onClose,
  onSelectWorkflow,
  onOpenLegalNotice
}: ProblemModalProps) {
  if (!problem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#081322] border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-slate-100 my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30">
            {problem.category}
          </span>
          <span
            className={`text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded border ${
              problem.priority === 'CRITICAL'
                ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                : problem.priority === 'URGENT'
                ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
            }`}
          >
            {problem.priority} PRIORITY
          </span>
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            <Clock className="w-3 h-3 text-cyan-400" />
            Statutory SLA: ~{problem.estimatedResolutionDays} Business Days
          </span>
        </div>

        {/* Problem Title */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-50 tracking-tight mb-2">
          {problem.name}
        </h2>

        {/* Route Card */}
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-3 my-4">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300/80 block">
              Official Statutory Grievance Authority
            </span>
            <strong className="text-sm sm:text-base text-slate-100">{problem.route}</strong>
          </div>
        </div>

        {/* Legal Act & Sections */}
        {problem.legalAct && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 mb-4">
            <div className="flex items-center gap-2 mb-1.5 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>Governing Statutory Act & Mandate</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
              {problem.legalAct}
            </p>
          </div>
        )}

        {/* Escalation Hierarchy */}
        {problem.escalationLevel && (
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 mb-4">
            <div className="flex items-center gap-2 mb-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <ChevronRight className="w-4 h-4" />
              <span>Statutory Escalation Hierarchy</span>
            </div>
            <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              {problem.escalationLevel}
            </p>
          </div>
        )}

        {/* Mandatory Evidence Checklist */}
        {problem.evidence && problem.evidence.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Required Verification Evidence Checklist:</span>
            </h4>
            <div className="grid sm:grid-cols-2 gap-2">
              {problem.evidence.map((ev, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{ev}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legal Advisory Guidelines */}
        {problem.guidelines && (
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 leading-relaxed flex items-start gap-3 mb-6">
            <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5 text-cyan-100">
                Citizen Rights & Procedural Guidance:
              </strong>
              {problem.guidelines}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              onSelectWorkflow(problem);
              onClose();
            }}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:opacity-95 transition-opacity"
          >
            <span>Start Direct Resolution Workflow</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenLegalNotice(problem);
              onClose();
            }}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-slate-900 border border-purple-500/40 text-purple-300 hover:bg-purple-950/40 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.15)]"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Generate NOVA AI Legal Draft</span>
          </button>
        </div>
      </div>
    </div>
  );
}
