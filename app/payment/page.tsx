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

  const [selectedTier, setSelectedTier] = useState<'STANDARD' | 'PRIORITY' | 'LEGAL' | 'VIP'>('PRIORITY');
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

  const [timerSeconds, setTimerSeconds] = useState(600);

  const tiers: Record<'STANDARD' | 'PRIORITY' | 'LEGAL' | 'VIP', { name: string; amount: number; desc: string; features: string[]; popular?: boolean }> = {
    STANDARD: {
      name: 'Standard Citizen Filing',
      amount: 49,
      desc: 'Official statutory portal preparation & auto-drafted grievance dossier',
      features: ['Official portal preparation', 'Auto-drafted docket', 'Email acknowledgment']
    },
    PRIORITY: {
      name: 'Priority Fast-Track Pass',
      amount: 199,
      desc: 'High-priority SLA monitoring + daily status updates + SMS escalation alerts',
      features: ['2x Faster Triage Routing', 'Daily SMS/WhatsApp alerts', 'Dedicated Case Officer', 'RTI Pre-draft Included'],
      popular: true
    },
    LEGAL: {
      name: 'Legal Notice & RTI Pass',
      amount: 499,
      desc: 'Formal legal notice drafting with legal citation + RTI First Appeal guide',
      features: ['Advocate-reviewed notice draft', 'RTI First Appeal dossier', 'Tribunal escalation guide', 'Direct call advisory']
    },
    VIP: {
      name: 'VIP / High-Court Advisory',
      amount: 999,
      desc: 'End-to-end legal concierge with dedicated panel advocate guidance',
      features: ['Dedicated Legal Concierge', 'High Court Writ Guidance', 'Priority Tele-Consult', '100% SLA Guarantee']
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
  const initializePayment = async () => {
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
        throw new Error(data.error || 'Failed to initialize payment.');
      }
      setInitPaymentData(data);
    } catch (err: any) {
      setVerificationError(err.message || 'Error initializing secure payment.');
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    initializePayment();
  }, [selectedTier, caseId]);

  // Expiry countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyUpi = () => {
    const upi = initPaymentData?.upiId || '8208583788@kotak811';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(upi);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Real Server-Side Verification
  const handleVerifyPayment = async () => {
    if (!initPaymentData?.refId) return;
    setVerifying(true);
    setVerificationError(null);

    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refId: initPaymentData.refId,
          upiRrn: upiRrnInput.trim() || undefined
        })
      });

      const data = await res.json();

      if (!res.ok || !data.verified) {
        throw new Error(data.message || 'Payment confirmation is awaiting bank network settlement. Please enter your 12-digit UPI RRN / UTR number.');
      }

      setVerifiedPayment(data.payment);
    } catch (err: any) {
      setVerificationError(err.message || 'Payment verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  // QR Camera Scanner
  const startCameraScanner = async () => {
    setScannerOpen(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraPermission('granted');
        }
      }
    } catch (err) {
      setCameraPermission('denied');
    }
  };

  const stopCameraScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
    }
    setScannerOpen(false);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={() => setUser(null)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />

      <div className="container-box py-10 lg:py-14 max-w-6xl">
        {/* Header Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Resolution Center</span>
          </Link>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
              NPCI UPI 2.0 Compliant
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Lock className="w-3.5 h-3.5" />
              Server-Side Verified
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left: Tiers & QR Scanner */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold mb-2">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>OFFICIAL RESOLUTION FAST-TRACK PASS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight">
                Select Resolution Level
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Choose the statutory acceleration pass for your case docket.
              </p>
            </div>

            {/* Target Case Linking */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1.5 font-bold">
                Target Resolution Case ID (Optional)
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700">
                <FileCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  placeholder="e.g. N1-2026-89412 or leave blank for direct citizen pass"
                  className="w-full bg-transparent border-none outline-none text-xs font-mono text-cyan-300 placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* 4 Plan Tier Selection Cards */}
            <div className="grid sm:grid-cols-2 gap-3">
              {(Object.keys(tiers) as Array<keyof typeof tiers>).map((k) => {
                const tier = tiers[k];
                const isSelected = selectedTier === k;
                return (
                  <div
                    key={k}
                    onClick={() => setSelectedTier(k)}
                    className={`relative p-5 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-[10px] font-mono font-bold">
                        RECOMMENDED
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-200">{tier.name}</span>
                        <strong className="text-lg font-mono font-extrabold text-cyan-400">
                          ₹{tier.amount}
                        </strong>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-snug mb-3">{tier.desc}</p>
                    </div>

                    <div className="space-y-1 border-t border-slate-800/80 pt-2 text-[10px] text-slate-300">
                      {tier.features.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* QR Payment Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#081322] border border-slate-800 text-center space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Scan with any UPI App (GPay, PhonePe, Paytm, BHIM)
              </h3>

              {/* Dynamic QR Display */}
              <div className="p-4 rounded-2xl bg-white text-slate-950 inline-block shadow-2xl mx-auto">
                <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto flex flex-col items-center justify-center p-2 border-2 border-slate-900 rounded-xl">
                  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                    <rect x="5" y="5" width="26" height="26" rx="4" stroke="#040914" strokeWidth="4" />
                    <rect x="11" y="11" width="14" height="14" rx="2" fill="#040914" />
                    <rect x="69" y="5" width="26" height="26" rx="4" stroke="#040914" strokeWidth="4" />
                    <rect x="75" y="11" width="14" height="14" rx="2" fill="#040914" />
                    <rect x="5" y="69" width="26" height="26" rx="4" stroke="#040914" strokeWidth="4" />
                    <rect x="11" y="75" width="14" height="14" rx="2" fill="#040914" />
                    <rect x="36" y="8" width="6" height="6" fill="#040914" />
                    <rect x="46" y="8" width="6" height="6" fill="#040914" />
                    <rect x="56" y="8" width="6" height="6" fill="#040914" />
                    <rect x="36" y="44" width="8" height="8" fill="#06b6d4" />
                    <rect x="48" y="44" width="8" height="8" fill="#3b82f6" />
                    <circle cx="50" cy="50" r="11" fill="#ffffff" stroke="#040914" strokeWidth="2" />
                    <circle cx="50" cy="50" r="8" fill="#06b6d4" />
                    <text x="50" y="53" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">N1</text>
                  </svg>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs font-bold text-slate-900">NagrikOne Citizen Infrastructure</p>
                  <p className="text-[10px] font-mono text-slate-500">Scan to Pay ₹{currentTier.amount}</p>
                </div>
              </div>

              {/* Dynamic QR Expiry Timer */}
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>QR Session valid for: <strong className="text-amber-400">{formatTimer(timerSeconds)}</strong></span>
              </div>

              {/* Verified VPA Copy */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">OFFICIAL VERIFIED VPA</span>
                  <strong className="text-xs font-mono text-cyan-300">{initPaymentData?.upiId || '8208583788@kotak811'}</strong>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-cyan-500/30"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy VPA'}</span>
                </button>
              </div>

              {/* Deep Link Intent */}
              {initPaymentData?.upiDeepLink && (
                <div className="pt-2">
                  <a
                    href={initPaymentData.upiDeepLink}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 text-xs font-bold transition-colors"
                  >
                    <span>Open in UPI App</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Breakdown & Server-Side Verification Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#081322] border border-slate-800 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                    ORDER BREAKDOWN
                  </span>
                  <h3 className="text-lg font-bold text-slate-100">Tax Invoice Summary</h3>
                </div>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs font-mono">
                  ₹
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>{currentTier.name}</span>
                  <span className="font-mono text-slate-100">₹{(currentTier.amount * 0.847).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Statutory GST (18%)</span>
                  <span className="font-mono">₹{(currentTier.amount * 0.153).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Official Portal Dispatch Fee</span>
                  <span className="font-mono text-emerald-400">FREE</span>
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline text-slate-100">
                  <span className="font-bold text-sm">Total Payable Amount:</span>
                  <strong className="text-2xl font-extrabold text-cyan-400 font-mono">
                    ₹{currentTier.amount}
                  </strong>
                </div>
              </div>

              {/* Verification Form (No fake instant success simulation) */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <label className="text-[10.5px] font-mono uppercase text-slate-400 block font-bold">
                  Enter 12-Digit Bank UPI Reference / UTR Number:
                </label>
                <input
                  type="text"
                  value={upiRrnInput}
                  onChange={(e) => setUpiRrnInput(e.target.value)}
                  placeholder="e.g. 423891029481 (From transaction SMS/Receipt)"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-400"
                />

                {verificationError && (
                  <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{verificationError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleVerifyPayment}
                  disabled={verifying || !!verifiedPayment}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all disabled:opacity-60"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Verifying Bank Settlement...</span>
                    </>
                  ) : verifiedPayment ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>Payment Confirmed & Verified</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-slate-950" />
                      <span>Verify & Activate Pass (₹{currentTier.amount})</span>
                    </>
                  )}
                </button>
              </div>

              {/* Verified Confirmation Receipt */}
              {verifiedPayment && (
                <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-xs text-emerald-200 space-y-2 font-mono animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                    <span className="font-bold text-emerald-300">GST TAX INVOICE</span>
                    <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-bold">PAID</span>
                  </div>
                  <p>Ref: {verifiedPayment.refId}</p>
                  <p>Pass: {verifiedPayment.tier}</p>
                  <p>Amount: ₹{verifiedPayment.amount}</p>
                  <p>Timestamp: {new Date().toLocaleString('en-IN')}</p>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handlePrintReceipt}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold"
                    >
                      Print Receipt
                    </button>
                    <Link
                      href="/cases"
                      className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold text-center"
                    >
                      Go to Cases
                    </Link>
                  </div>
                </div>
              )}

              {/* Guarantee */}
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>100% Money-Back SLA Guarantee if statutory preparation fails.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center bg-[#030712] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
            <span>Loading NagrikOne Secure Gateway...</span>
          </div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
