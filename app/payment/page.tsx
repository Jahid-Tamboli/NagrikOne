'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  PhoneCall,
  Clock,
  Check,
  CreditCard,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import Card3D from '@/components/Card3D';

function PaymentContent() {
  const searchParams = useSearchParams();
  const caseIdFromUrl = searchParams.get('caseId') || '';

  const [selectedTier, setSelectedTier] = useState<'standard' | 'priority' | 'legal'>('priority');
  const [caseId, setCaseId] = useState(caseIdFromUrl);
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);

  const tiers = {
    standard: { name: 'Standard Citizen Filing', amount: 49, desc: 'Official portal dispatch & auto-drafting' },
    priority: { name: 'Priority Escalation Pass', amount: 199, desc: 'High-priority routing + daily status updates' },
    legal: { name: 'Legal & RTI Advisory Pass', amount: 499, desc: 'Full legal notice drafting + RTI escalation guidance' }
  };

  const currentTier = tiers[selectedTier];
  const upiId = '8208583788@kotak811';
  const supportNumber = '+91 8208583788';

  const upiDeepLink = `upi://pay?pa=${upiId}&pn=NagrikOne&am=${currentTier.amount}&cu=INR&tn=${encodeURIComponent(
    `NagrikOne Pass ${caseId ? `Case ${caseId}` : 'Citizen'}`
  )}`;

  const handleCopyUpi = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSimulatePayment = async () => {
    setVerifying(true);
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: caseId || 'DEMO_CASE',
          amount: currentTier.amount,
          tier: selectedTier.toUpperCase()
        })
      });

      const data = await res.json();
      if (data.success) {
        setPaymentSuccess(data);
      }
    } catch (err) {
      console.error('[Payment] Simulation failed:', err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="pay-page-wrapper">
      <div className="w-full max-w-xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-emerald-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Resolution Center</span>
        </Link>

        <Card3D glowColor="rgba(52, 211, 153, 0.25)">
          <div className="pay-card-container">
            {/* Header Brand */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-extrabold text-lg shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                N1
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-slate-100 leading-tight">NagrikOne</h2>
                <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
                  Secure Resolution Gateway
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NPCI UPI VERIFIED GATEWAY</span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 mb-2">
              Citizen Service Pass
            </h1>
            <p className="text-xs text-slate-400 mb-6">
              Scan with any UPI application (GPay, PhonePe, Paytm, BHIM, Cred) to verify your complaint.
            </p>

            {/* Case ID Linking */}
            <div className="mb-6 text-left p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                Target Resolution Case ID
              </label>
              <input
                type="text"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                placeholder="Optional Case ID (e.g. case_12345)"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 placeholder:text-slate-600 outline-none focus:border-emerald-500"
              />
            </div>

            {/* Resolution Tier Selector */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {(['standard', 'priority', 'legal'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTier(t)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    selectedTier === t
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase text-slate-400 block truncate">
                    {t === 'priority' ? '⭐ Priority' : t}
                  </span>
                  <strong className="text-lg font-bold text-slate-100 mt-1 block">
                    ₹{tiers[t].amount}
                  </strong>
                </button>
              ))}
            </div>

            {/* Selected Tier Banner */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-left mb-6 flex items-center justify-between">
              <div>
                <strong className="text-slate-200 block">{currentTier.name}</strong>
                <span className="text-slate-400 text-[11px]">{currentTier.desc}</span>
              </div>
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                ₹{currentTier.amount}
              </span>
            </div>

            {/* QR Code Container */}
            <div className="qr-box">
              <Image
                src="/nagrikone-upi-qr.jpg"
                alt="NagrikOne UPI QR"
                width={320}
                height={480}
                priority
              />
            </div>

            {/* Copyable UPI ID Box */}
            <div className="upi-id-box">
              <div className="text-left">
                <span className="text-[10px] font-mono text-slate-400 block">OFFICIAL UPI ID</span>
                <strong className="text-sm font-mono text-emerald-300">{upiId}</strong>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct Mobile UPI App Link */}
            <a
              href={upiDeepLink}
              className="w-full mb-3 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:opacity-95 transition-opacity"
            >
              <span>Pay via UPI App (Mobile Only)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Instant Verification Simulation */}
            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={verifying || !!paymentSuccess}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900/90 text-xs font-semibold text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 flex items-center justify-center gap-2 transition-colors mb-6"
            >
              {verifying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Connecting to UPI Gateway Webhook...</span>
                </>
              ) : paymentSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verified & Synced with Case</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulate Payment Verification Callback</span>
                </>
              )}
            </button>

            {/* Payment Success Card */}
            {paymentSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-left text-xs text-emerald-200 mb-6 space-y-1 font-mono">
                <div className="flex items-center justify-between font-bold text-emerald-300 mb-2">
                  <span>PAYMENT RECEIPT</span>
                  <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded text-[10px]">PAID</span>
                </div>
                <p>Reference: {paymentSuccess.refId}</p>
                <p>Amount: ₹{paymentSuccess.amount}</p>
                <p>Status: Verification Confirmed</p>
                <p className="text-[11px] text-emerald-400/80 pt-1">
                  Your case status has been updated to high-priority resolution dispatch.
                </p>
              </div>
            )}

            {/* Support and Disclaimers */}
            <div className="pt-4 border-t border-slate-800 text-slate-400 text-[11px] space-y-1">
              <p className="flex items-center justify-center gap-1.5 font-mono">
                <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
                <span>Dedicated Citizen Helpline: {supportNumber}</span>
              </p>
              <p className="text-slate-500 text-[10px] leading-relaxed pt-2">
                NagrikOne Prototype: Payment verification will be processed via bank webhook or reference reconciliation before external escalation.
              </p>
            </div>
          </div>
        </Card3D>
      </div>
    </div>
  );
}

export default function Payment() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-slate-400 font-mono">Loading Payment Gateway...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
