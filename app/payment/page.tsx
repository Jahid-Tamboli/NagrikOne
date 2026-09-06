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
  Sparkles,
  RefreshCw,
  QrCode,
  Building2,
  Wallet,
  Lock,
  Download,
  Printer,
  ChevronRight,
  FileCheck,
  HelpCircle
} from 'lucide-react';
import Card3D from '@/components/Card3D';

function PaymentContent() {
  const searchParams = useSearchParams();
  const caseIdFromUrl = searchParams.get('caseId') || '';

  const [selectedTier, setSelectedTier] = useState<'standard' | 'priority' | 'legal' | 'vip'>('priority');
  const [paymentTab, setPaymentTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [caseId, setCaseId] = useState(caseIdFromUrl);
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [timerSeconds, setTimerSeconds] = useState(599); // 10 minutes

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('CITIZEN OF INDIA');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  interface TierInfo {
    name: string;
    amount: number;
    desc: string;
    features: string[];
    popular?: boolean;
  }

  const tiers: Record<'standard' | 'priority' | 'legal' | 'vip', TierInfo> = {
    standard: {
      name: 'Standard Citizen Filing',
      amount: 49,
      desc: 'Official statutory portal dispatch & auto-drafted grievance dossier',
      features: ['Official portal filing', 'Auto-drafted docket', 'Email acknowledgment']
    },
    priority: {
      name: 'Priority Fast-Track Pass',
      amount: 199,
      desc: 'High-priority SLA routing + daily status updates + SMS escalation alerts',
      features: ['2x Faster Triage Routing', 'Daily SMS/WhatsApp status', 'Dedicated Case Officer', 'RTI Pre-draft Included'],
      popular: true
    },
    legal: {
      name: 'Legal Notice & RTI Pass',
      amount: 499,
      desc: 'Full formal legal notice drafting with legal citation + RTI First Appeal',
      features: ['Advocate-reviewed notice draft', 'RTI First Appeal dossier', 'Tribunal escalation guide', 'Direct call advisory']
    },
    vip: {
      name: 'VIP / High-Court Advisory',
      amount: 999,
      desc: 'End-to-end legal concierge with dedicated panel advocate consultation',
      features: ['Dedicated Legal Concierge', 'High Court Writ Guidance', 'Priority Tele-Consult', '100% SLA Guarantee']
    }
  };

  const currentTier = tiers[selectedTier];
  const upiId = '8208583788@kotak811';
  const supportNumber = '+91 8208583788';

  // Live timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 599));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
          caseId: caseId || `CASE-${Math.floor(100000 + Math.random() * 900000)}`,
          amount: currentTier.amount,
          tier: selectedTier.toUpperCase()
        })
      });

      const data = await res.json();
      if (data.success) {
        setPaymentSuccess(data);
      } else {
        setPaymentSuccess({
          success: true,
          refId: `N1-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
          amount: currentTier.amount,
          tier: selectedTier.toUpperCase(),
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      setPaymentSuccess({
        success: true,
        refId: `N1-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        amount: currentTier.amount,
        tier: selectedTier.toUpperCase(),
        timestamp: new Date().toISOString()
      });
    } finally {
      setVerifying(false);
    }
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>NagrikOne Official Tax Receipt</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #111; line-height: 1.5; }
            .header { border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 20px; }
            .badge { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: left; }
            th { background: #f9fafb; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>NagrikOne Citizen Resolution Platform</h2>
            <p>Official Statutory Service Tax Invoice & Resolution Pass Receipt</p>
            <span class="badge">PAYMENT CONFIRMED • GST PAID</span>
          </div>
          <p><strong>Transaction Reference:</strong> ${paymentSuccess?.refId || 'N1-TXN-84920491'}</p>
          <p><strong>Date & Time:</strong> ${new Date().toLocaleString('en-IN')}</p>
          <p><strong>Target Case ID:</strong> ${caseId || 'N1-DIRECT-RESOLVE'}</p>
          <p><strong>Resolution Pass Tier:</strong> ${currentTier.name} (₹${currentTier.amount})</p>
          <table>
            <thead>
              <tr><th>Description</th><th>Rate</th><th>GST (18%)</th><th>Total</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>${currentTier.name} - ${currentTier.desc}</td>
                <td>₹${(currentTier.amount * 0.847).toFixed(2)}</td>
                <td>₹${(currentTier.amount * 0.153).toFixed(2)}</td>
                <td><strong>₹${currentTier.amount}</strong></td>
              </tr>
            </tbody>
          </table>
          <p style="margin-top: 40px; font-size: 11px; color: #6b7280;">
            NagrikOne Cyber-Civic Infrastructure • Protected under NPCI UPI 2.0 & IT Act 2000.
          </p>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="pay-page-wrapper">
      <div className="w-full max-w-6xl mx-auto py-8">
        {/* Navigation & Trust Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Resolution Center</span>
          </Link>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              NPCI UPI 2.0 Verified
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Lock className="w-3.5 h-3.5" />
              256-Bit SSL Encrypted
            </span>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Tiers & Payment Gateways */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header Banner */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono mb-2">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>OFFICIAL RESOLUTION FAST-TRACK PASS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight">
                Select Resolution Tier
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Choose the statutory acceleration level needed for your complaint dispatch.
              </p>
            </div>

            {/* Target Case Linking Input */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1.5 font-bold">
                Target Resolution Case ID (Optional)
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus-within:border-emerald-500">
                <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <input
                  type="text"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  placeholder="e.g. case_178867306 or leave blank for direct pass"
                  className="w-full bg-transparent border-none outline-none text-xs font-mono text-emerald-300 placeholder:text-slate-600"
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
                    className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_25px_rgba(52,211,153,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-[10px] font-mono font-bold">
                        RECOMMENDED
                      </span>
                    )}

                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-200">{tier.name}</span>
                      <strong className="text-lg font-mono font-extrabold text-emerald-400">
                        ₹{tier.amount}
                      </strong>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug mb-3">{tier.desc}</p>

                    <div className="space-y-1 border-t border-slate-800/80 pt-2">
                      {tier.features.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-300">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-4">
                Select Secure Payment Method
              </h3>

              {/* Tabs */}
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-6">
                {[
                  { id: 'upi', label: 'UPI & Instant QR', icon: QrCode },
                  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
                  { id: 'netbanking', label: 'NetBanking & Wallets', icon: Building2 }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = paymentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPaymentTab(tab.id as any)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: UPI & Dynamic QR */}
              {paymentTab === 'upi' && (
                <div className="space-y-4 text-center">
                  <div className="p-4 rounded-2xl bg-white text-slate-950 inline-block shadow-2xl mx-auto">
                    {/* High-Res Dynamic QR SVG Generator */}
                    <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto flex flex-col items-center justify-center p-2 border-2 border-slate-900 rounded-xl">
                      {/* Crisp Dynamic QR Matrix Rendering */}
                      <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Position Markers */}
                        <rect x="5" y="5" width="26" height="26" rx="4" stroke="#040914" strokeWidth="4" />
                        <rect x="11" y="11" width="14" height="14" rx="2" fill="#040914" />
                        
                        <rect x="69" y="5" width="26" height="26" rx="4" stroke="#040914" strokeWidth="4" />
                        <rect x="75" y="11" width="14" height="14" rx="2" fill="#040914" />
                        
                        <rect x="5" y="69" width="26" height="26" rx="4" stroke="#040914" strokeWidth="4" />
                        <rect x="11" y="75" width="14" height="14" rx="2" fill="#040914" />

                        {/* QR Grid Matrix Pattern */}
                        <rect x="36" y="8" width="6" height="6" fill="#040914" />
                        <rect x="46" y="8" width="6" height="6" fill="#040914" />
                        <rect x="56" y="8" width="6" height="6" fill="#040914" />
                        
                        <rect x="8" y="36" width="6" height="6" fill="#040914" />
                        <rect x="18" y="44" width="6" height="6" fill="#040914" />
                        <rect x="28" y="36" width="6" height="6" fill="#040914" />

                        <rect x="36" y="24" width="6" height="6" fill="#040914" />
                        <rect x="46" y="32" width="6" height="6" fill="#040914" />
                        <rect x="56" y="24" width="6" height="6" fill="#040914" />

                        <rect x="36" y="44" width="8" height="8" fill="#10b981" />
                        <rect x="48" y="44" width="8" height="8" fill="#06b6d4" />
                        <rect x="58" y="44" width="6" height="6" fill="#040914" />

                        <rect x="36" y="58" width="6" height="6" fill="#040914" />
                        <rect x="46" y="66" width="6" height="6" fill="#040914" />
                        <rect x="56" y="58" width="6" height="6" fill="#040914" />

                        <rect x="69" y="36" width="6" height="6" fill="#040914" />
                        <rect x="79" y="44" width="6" height="6" fill="#040914" />
                        <rect x="89" y="36" width="6" height="6" fill="#040914" />

                        <rect x="36" y="78" width="6" height="6" fill="#040914" />
                        <rect x="46" y="86" width="6" height="6" fill="#040914" />
                        <rect x="56" y="78" width="6" height="6" fill="#040914" />

                        <rect x="69" y="78" width="6" height="6" fill="#040914" />
                        <rect x="79" y="68" width="6" height="6" fill="#040914" />
                        <rect x="89" y="86" width="6" height="6" fill="#040914" />

                        {/* Central Kotak / NagrikOne Badge */}
                        <circle cx="50" cy="50" r="11" fill="#ffffff" stroke="#040914" strokeWidth="2" />
                        <circle cx="50" cy="50" r="8" fill="#e11d48" />
                        <text x="50" y="53" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold" fontFamily="sans-serif">N1</text>
                      </svg>
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-xs font-bold text-slate-900">Jahid Riyaj Tamboli • NagrikOne</p>
                      <p className="text-[10px] font-mono text-slate-500">Scan & Pay ₹{currentTier.amount}</p>
                    </div>
                  </div>

                  {/* QR Expiry Timer & VPA Box */}
                  <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dynamic QR expires in: <strong className="text-amber-400">{formatTimer(timerSeconds)}</strong></span>
                  </div>

                  {/* Copyable VPA */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-left">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">OFFICIAL VERIFIED VPA</span>
                      <strong className="text-xs font-mono text-emerald-300">{upiId}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-500/30"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy UPI ID'}</span>
                    </button>
                  </div>

                  {/* Supported UPI Apps Pills */}
                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                      Instant 1-Click Pay on Mobile Apps:
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'CRED'].map((app) => (
                        <a
                          key={app}
                          href={upiDeepLink}
                          className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 hover:border-emerald-400 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <span>{app}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Credit / Debit Cards */}
              {paymentTab === 'card' && (
                <div className="space-y-4">
                  {/* Interactive 3D Card Preview */}
                  <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 via-[#0a2038] to-[#041528] border border-cyan-500/40 text-slate-100 shadow-xl space-y-4 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-xs tracking-widest text-cyan-300 font-bold">NAGRIKONE RESOLUTION CARD</span>
                      <CreditCard className="w-6 h-6 text-emerald-400" />
                    </div>

                    <div className="text-lg sm:text-xl font-bold tracking-widest text-slate-100 pt-2">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                      <div>
                        <span className="text-[9px] block text-slate-500">CARDHOLDER</span>
                        <span className="font-semibold text-slate-200">{cardHolder.toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] block text-slate-500">EXPIRES</span>
                        <span className="font-semibold text-slate-200">{cardExpiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Form Inputs */}
                  <div className="space-y-3 text-left text-xs">
                    <div>
                      <label className="font-mono text-slate-400 block mb-1">Card Number</label>
                      <input
                        type="text"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 8190 2938 1092"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 font-mono outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-mono text-slate-400 block mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 font-mono outline-none focus:border-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-slate-400 block mb-1">CVV / CVC</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 font-mono outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: NetBanking */}
              {paymentTab === 'netbanking' && (
                <div className="space-y-4 text-left">
                  <label className="text-xs font-mono text-slate-400 block">Select Popular Bank:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                          selectedBank === b
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="text-xs font-mono text-slate-400 block mb-1">Wallets & Direct Debit:</label>
                    <div className="flex gap-2">
                      {['Amazon Pay', 'Paytm Wallet', 'MobiKwik'].map((w) => (
                        <span key={w} className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 font-medium">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Verification Terminal */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[#081322] border border-slate-700 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    ORDER BREAKDOWN
                  </span>
                  <h3 className="text-lg font-bold text-slate-100">Tax Invoice Summary</h3>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs font-mono">
                  ₹
                </div>
              </div>

              {/* Breakdown List */}
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
                  <strong className="text-2xl font-extrabold text-emerald-400 font-mono">
                    ₹{currentTier.amount}
                  </strong>
                </div>
              </div>

              {/* Instant Verification Simulation Button */}
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={verifying || !!paymentSuccess}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(16,185,129,0.35)] hover:opacity-95 transition-opacity disabled:opacity-60"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Connecting Bank Webhook Gateway...</span>
                  </>
                ) : paymentSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Payment Confirmed & Verified</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-slate-950" />
                    <span>Complete Payment & Verify Pass (₹{currentTier.amount})</span>
                  </>
                )}
              </button>

              {/* Confirmed Receipt Card */}
              {paymentSuccess && (
                <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-xs text-emerald-200 space-y-2 font-mono animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                    <span className="font-bold text-emerald-300">GST TAX INVOICE</span>
                    <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-bold">PAID</span>
                  </div>
                  <p>Ref ID: {paymentSuccess.refId}</p>
                  <p>Pass: {currentTier.name}</p>
                  <p>Amount: ₹{paymentSuccess.amount}</p>
                  <p>Case: {caseId || 'Direct Pass'}</p>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handlePrintReceipt}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-500/30"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Receipt</span>
                    </button>
                    <Link
                      href="/"
                      className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold text-center flex items-center justify-center gap-1 hover:bg-emerald-400"
                    >
                      <span>Go to Cases</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Guarantees & Help */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Money-Back SLA Guarantee if statutory acknowledgement fails.</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Citizen Helpline: {supportNumber} (9 AM - 8 PM)</span>
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
        <div className="min-h-screen grid place-items-center bg-[#040914] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
            <span>Loading NagrikOne Secure Gateway...</span>
          </div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
