'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  Printer,
  Download,
  Sparkles,
  Scale,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { ProblemTypeDefinition } from '@/lib/problemTypes';

interface LegalNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: ProblemTypeDefinition | null;
  citizenName?: string;
  locality?: string;
  customDetails?: string;
}

export default function LegalNoticeModal({
  isOpen,
  onClose,
  problem,
  citizenName = 'Citizen of India',
  locality = 'Citizen Residence / Locality',
  customDetails = ''
}: LegalNoticeModalProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [noticeText, setNoticeText] = useState('');

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const refNumber = `N1-LEG-${Math.floor(100000 + Math.random() * 900000)}`;

  useEffect(() => {
    if (!problem) return;

    const generated = `LEGAL GRIEVANCE & STATUTORY DEMAND NOTICE
(UNDER THE MANDATE OF ${problem.legalAct.toUpperCase()})

REF NO: ${refNumber}
DATE: ${todayStr}

TO,
THE COMPETENT APPELLATE & GRIEVANCE OFFICER,
${problem.route.toUpperCase()}
GOVERNMENT OF INDIA / STATE JURISDICTION

FROM:
${citizenName || 'Aggrieved Citizen'}
Resident of: ${locality || 'Local Municipal Ward / Jurisdiction'}
Contact via: NagrikOne Citizen Resolution Platform (Verified Electronic Docket)

----------------------------------------------------------------------
SUBJECT: FORMAL STATUTORY GRIEVANCE REGARDING ${problem.name.toUpperCase()}
REFERENCE LAW: ${problem.legalAct}
----------------------------------------------------------------------

RESPECTED SIR / MADAM,

I, the undersigned aggrieved citizen, do hereby submit this formal statutory complaint and legal demand notice under the statutory provisions and consumer/citizen protections enshrined in the Constitution of India and ${problem.legalAct}:

1. STATEMENT OF FACTS:
   That the undersigned has been directly aggrieved by the failure, deficiency of service, and/or non-compliance regarding:
   "${customDetails || problem.name}".
   
   Location of Incident/Grievance: ${locality || 'Municipal / District Jurisdiction'}
   Date of Grievance: ${todayStr}

2. STATUTORY BREACH & LEGAL LIABILITY:
   Under the provisions of ${problem.legalAct}, the concerned authorities and respondents are legally obligated to provide timely resolution within the prescribed Service Level Agreement (SLA) of ~${problem.estimatedResolutionDays} Business Days.
   
   Escalation Matrix Applicable:
   ${problem.escalationLevel}

3. PRESERVATION OF EVIDENCE:
   The following primary documentary and electronic evidences are available and submitted for verification:
   ${problem.evidence ? problem.evidence.map((e, idx) => `   [${idx + 1}] ${e}`).join('\n') : '   [1] Electronic timestamped incident log & GPS data'}

4. FORMAL PRAYER & RELIEF SOUGHT:
   The undersigned hereby calls upon your good office to:
   a) Immediately register this formal docket under the statutory tracking mechanism.
   b) Take prompt corrective and remedial action regarding "${problem.name}" within 7 business days.
   c) Issue a certified written compliance report to the undersigned.

5. NOTICE OF FURTHER ESCALATION:
   Please take notice that failure to rectify this statutory grievance within the stipulated timeframe shall leave the undersigned with no alternative but to escalate this matter to the higher Appellate Authority, State Human Rights Commission, or the Hon'ble Consumer / High Court under Writ Jurisdiction at your sole risk and costs.

Yours Sincerely,

_____________________________
${citizenName || 'Aggrieved Citizen'}
Verified through NagrikOne Cyber-Civic Resolution Framework
Ref Docket: ${refNumber}`;

    setNoticeText(generated);
  }, [problem, citizenName, locality, customDetails]);

  if (!isOpen || !problem) return null;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(noticeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([noticeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Legal_Notice_${problem.id}_${refNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Legal Notice - ${refNumber}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; color: #111; font-size: 14px; }
            pre { white-space: pre-wrap; font-family: inherit; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <pre>${noticeText}</pre>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#081322] border border-purple-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(168,85,247,0.25)] text-slate-100 my-8 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                NOVA.Ai Legal Drafting Engine
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/70 border border-purple-500/40 text-purple-300">
                STATUTORY DOCKET
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">
              Formal Legal Notice & Grievance Petition Draft
            </h2>
          </div>
        </div>

        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 mb-4 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ref: {refNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-cyan-300 text-xs flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Done Editing' : 'Edit Text'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-emerald-300 text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-cyan-300 text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-xs flex items-center gap-1.5 transition-colors font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Notice Preview Text Area */}
        <div className="flex-1 min-h-[340px] max-h-[50vh] overflow-y-auto rounded-xl bg-slate-950/80 border border-slate-800 p-4 font-mono text-xs text-slate-200 leading-relaxed shadow-inner">
          {isEditing ? (
            <textarea
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              className="w-full h-full min-h-[320px] bg-transparent border-none outline-none resize-none text-slate-100 font-mono text-xs leading-relaxed"
            />
          ) : (
            <pre className="whitespace-pre-wrap">{noticeText}</pre>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
          <span>Official Addressee: {problem.route}</span>
          <button
            type="button"
            onClick={onClose}
            className="text-cyan-400 hover:underline font-semibold"
          >
            Close & Return to Resolution Center
          </button>
        </div>
      </div>
    </div>
  );
}
