'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
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
  RefreshCw,
  QrCode,
  Lock,
  Printer,
  ChevronRight,
  FileCheck,
  AlertTriangle,
  Camera,
  HelpCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import { AuthSession } from '@/lib/auth/session';

function PaymentContent() {
  const searchParams = useSearchParams();
  const caseIdFromUrl = searchParams.get('caseId') || '';

  const [user, setUser] = useState<AuthSession | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [selectedTier, setSelectedTier] = useState<'ASSISTED_DRAFT' | 'LEGAL_NOTICE' | 'CONCIERGE'>('LEGAL_NOTICE');
  const [caseId, setCaseId] = useState(caseIdFromUrl);
  const [copied, setCopied] = useState(false);

  const [initPaymentData, setInitPaymentData] = useState<any>(null);
  const [initializing, setInitializing] = useState(false);

  const [upiRrnInput, setUpiRrnInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedPayment, setVerifiedPayment] = useState<any>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Scanner state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const tiers: Record<'ASSISTED_DRAFT' | 'LEGAL_NOTICE' | 'CONCIERGE', { name: string; amount: number; desc: string; features: string[]; popular?: boolean }> = {
    ASSISTED_DRAFT: {
      name: 'Assisted Document Drafting',
      amount: 199,
      desc: 'Expert compilation of your grievance dossier, structured evidence summary, and RTS submission template',
      features: ['Full grievance dossier compilation', 'Statutory department evidence checklist', 'Daily SMS/Email milestone alerts', 'RTS first-appeal framework guidance']
    },
    LEGAL_NOTICE: {
      name: 'Formal Notice & Dispute Dossier',
      amount: 499,
      desc: 'Formal statutory notice draft with relevant legal citations, consumer protection clauses, and direct escalation pathway',
      features: ['Legally structured notice draft', 'Consumer Protection Act / RBI citation mapping', 'RTI application pre-filled package', 'Dedicated case follow-up officer'],
      popular: true
    },
    CONCIERGE: {
      name: 'Dedicated Advisory Concierge',
      amount: 999,
      desc: 'End-to-end procedural support for high-stakes financial, property, or administrative disputes',
      features: ['Dedicated case concierge', 'Multi-authority escalation roadmap', 'Priority document review within 24h', 'Direct phone advisory support']
    }
  };

  const currentTier = tiers[selectedTier];

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      } catch (e) {}
    }
    checkUser();
  }, []);

  // Initialize payment intent with server
  const initializeIntent = async () => {
    setInitializing(true);
    setVerificationError(null);
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          caseId: caseId || undefined
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize payment intent');
      }
      setInitPaymentData(data);
    } catch (err: any) {
      setVerificationError(err.message || 'Error generating UPI intent.');
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    initializeIntent();
  }, [selectedTier, caseId]);

  // Copy UPI string
  const handleCopyUPI = () => {
    if (!initPaymentData?.upiUri) return;
    navigator.clipboard.writeText(initPaymentData.upiUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Verify Payment RRN
  const handleVerifyPayment = async () => {
    if (!upiRrnInput.trim() || upiRrnInput.trim().length < 6) {
      setVerificationError('Please enter a valid 12-digit UPI UTR / RRN reference number.');
      return;
    }

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setVerifying(true);
    setVerificationError(null);

    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceId: initPaymentData?.referenceId || `PAY-${Date.now()}`,
          upiRrn: upiRrnInput.trim(),
          amount: currentTier.amount,
          caseId: caseId || undefined,
          tier: selectedTier
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Payment verification failed');
      }

      setVerifiedPayment(data.payment);
    } catch (err: any) {
      setVerificationError(err.message || 'Unable to verify transaction. Please re-check the 12-digit UTR.');
    } finally {
      setVerifying(false);
    }
  };

  // Camera QR Scanner
  const handleStartScanner = async () => {
    setScannerOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraPermission('granted');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setCameraPermission('denied');
    }
  };

  const handleStopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setScannerOpen(false);
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
        onLoginSuccess={(u) => setUser(u)}
      />

      <div className="container-box py-10 lg:py-14 max-w-5xl">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href={caseId ? `/cases/${caseId}` : '/'}
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{caseId ? `Back to Case ${caseId}` : 'Return to Home'}</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Encrypted NPCI UPI Gateway</span>
          </div>
        </div>

        {/* Free vs Paid Clarity Banner */}
        <div className="mb-10 rounded-3xl p-6 bg-gradient-to-b from-[#081322] to-[#040914] border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10.5px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
              Citizen Support Principle
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-100">
              Standard guidance and problem classification are always 100% free.
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Choose an assisted service only if you require dedicated document drafting, formal statutory notices, or legal concierge assistance.
            </p>
          </div>

          <Link
            href="/nova"
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 font-bold text-xs whitespace-nowrap transition-colors"
          >
            Continue with Free NOVA
          </Link>
        </div>

        {/* ============================================================ */}
        {/* SUCCESSFUL PAYMENT RECEIPT STATE                             */}
        {/* ============================================================ */}
        {verifiedPayment ? (
          <div className="rounded-3xl p-8 bg-gradient-to-b from-[#091e1d] to-[#040914] border border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)] space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-300">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-widest">
                  SERVICE ACTIVATED
                </span>
                <h1 className="text-2xl font-black text-slate-50">
                  Assisted Service Confirmed
                </h1>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              Your payment of <strong className="text-emerald-400">₹{verifiedPayment.amount}</strong> for <strong className="text-slate-100">{currentTier.name}</strong> has been verified and linked. A dedicated case officer has been assigned to compile your dossier.
            </p>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Payment Ref</span>
                <span className="text-slate-200 font-bold">{verifiedPayment.referenceId || verifiedPayment.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">UPI UTR / RRN</span>
                <span className="text-cyan-400 font-bold">{verifiedPayment.upiRrn}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Linked Case</span>
                <span className="text-slate-200 font-bold">{verifiedPayment.caseId || caseId || 'General Account'}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              {caseId ? (
                <Link
                  href={`/cases/${caseId}`}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs flex items-center gap-2"
                >
                  <span>Open Updated Case Docket</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <Link
                  href="/cases"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs flex items-center gap-2"
                >
                  <span>View My Cases</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left Column: Assisted Service Selection */}
            <div className="lg:col-span-6 space-y-4">
              <h2 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
                Select Assisted Service Level
              </h2>

              {(Object.keys(tiers) as Array<'ASSISTED_DRAFT' | 'LEGAL_NOTICE' | 'CONCIERGE'>).map((tierKey) => {
                const tier = tiers[tierKey];
                const isSelected = selectedTier === tierKey;

                return (
                  <div
                    key={tierKey}
                    onClick={() => setSelectedTier(tierKey)}
                    className={`cursor-pointer rounded-3xl p-6 transition-all duration-300 border relative ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#0c1f33] to-[#040914] border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.18)]'
                        : 'bg-gradient-to-b from-[#081322] to-[#040914] border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {tier.popular && (
                      <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                        Most Requested
                      </span>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-100">{tier.name}</h3>
                        <span className="text-2xl font-black font-mono text-cyan-400">₹{tier.amount}</span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed font-sans">{tier.desc}</p>

                      <div className="space-y-1.5 pt-3 text-xs text-slate-300 font-sans">
                        {tier.features.map((feat, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Optional Case ID Input */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Link to Case Docket (Optional)
                </label>
                <input
                  type="text"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  placeholder="e.g. CASE-1725700000-XYZ"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            {/* Right Column: Secure NPCI UPI Payment QR & Verification */}
            <div className="lg:col-span-6 space-y-6">
              <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#081322] to-[#040914] border border-cyan-500/30 shadow-2xl space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">PAYMENT SUMMARY</span>
                    <h3 className="text-base font-black text-slate-100">{currentTier.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">AMOUNT</span>
                    <span className="text-2xl font-black font-mono text-emerald-400">₹{currentTier.amount}</span>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                  {initPaymentData?.qrDataUrl ? (
                    <div className="p-3 bg-white rounded-2xl shadow-md">
                      <img
                        src={initPaymentData.qrDataUrl}
                        alt="NPCI UPI QR Code"
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-2xl bg-slate-950 flex items-center justify-center text-slate-600">
                      <QrCode className="w-16 h-16 animate-pulse" />
                    </div>
                  )}

                  <div className="text-center space-y-1">
                    <span className="text-xs font-mono font-bold text-slate-200 block">
                      Scan with any UPI App (GPay, PhonePe, Paytm, BHIM)
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 block">
                      Verified NPCI Payee: <strong className="text-slate-300">{initPaymentData?.payeeVpa || 'merchant@upi'}</strong>
                    </span>
                  </div>

                  {/* Copy UPI Intent Button */}
                  {initPaymentData?.upiUri && (
                    <button
                      onClick={handleCopyUPI}
                      className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-400 text-xs font-mono text-slate-300 flex items-center gap-2 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{copied ? 'UPI Link Copied!' : 'Copy UPI Link'}</span>
                    </button>
                  )}
                </div>

                {/* Verification Section */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-mono text-slate-300 font-bold block">
                    Confirm 12-digit UPI UTR / Transaction Reference (RRN)
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={16}
                      value={upiRrnInput}
                      onChange={(e) => setUpiRrnInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 425601982341"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-400 font-mono tracking-widest"
                    />

                    <button
                      onClick={handleVerifyPayment}
                      disabled={verifying}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs whitespace-nowrap transition-all disabled:opacity-50"
                    >
                      {verifying ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>

                  {verificationError && (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{verificationError}</span>
                    </div>
                  )}

                  {/* Security Notice */}
                  <div className="pt-2 flex items-start gap-2 text-[11px] text-slate-500 font-mono">
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>Never enter your UPI PIN or bank password on any website. Verification only checks your bank-issued 12-digit UTR.</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030712] flex items-center justify-center text-xs font-mono text-slate-500">Loading Payment Gateway...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
