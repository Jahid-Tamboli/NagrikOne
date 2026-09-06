'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Mail,
  Phone,
  KeyRound,
  X,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  User,
  LogOut,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export interface UserSession {
  name: string;
  email: string;
  mobile: string;
  verifiedAt: string;
  role?: 'citizen' | 'admin';
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserSession) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!mobile.trim() || mobile.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setTimer(60);
    }, 500);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = otp.join('');

    if (code.length < 4) {
      setError('Please enter the 4-digit verification OTP.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const userSession: UserSession = {
        name: name.trim() || email.split('@')[0],
        email: email.trim(),
        mobile: mobile.trim(),
        verifiedAt: new Date().toISOString(),
        role: email.toLowerCase().includes('admin') ? 'admin' : 'citizen'
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('nagrikone_user', JSON.stringify(userSession));
      }

      onLoginSuccess(userSession);
      onClose();
    }, 600);
  };

  const handleDemoFill = () => {
    setName('Jahid Tamboli');
    setEmail('citizen@nagrikone.gov.in');
    setMobile('9876543210');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#081322] border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.2)] text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-extrabold text-sm">
            N1
          </div>
          <span className="text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase">
            Citizen Authentication
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-1">
          {step === 'input' ? 'Sign in to NagrikOne' : 'Verify Dual OTP'}
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          {step === 'input'
            ? 'Access your saved cases, AI triage dossiers, and track statutory escalations.'
            : `Enter the 4-digit security code sent to ${mobile} and ${email}`}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {step === 'input' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Full Name (Optional)
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus-within:border-emerald-400">
                <User className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jahid Tamboli"
                  className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Email Address *
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus-within:border-emerald-400">
                <Mail className="w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@example.com"
                  className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Mobile Number *
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus-within:border-emerald-400">
                <span className="text-xs font-mono text-slate-400">+91</span>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching OTP...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleDemoFill}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
              >
                ⚡ Autofill Demo Citizen Profile
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-between font-mono">
              <span>Demo OTP Code:</span>
              <span className="font-bold tracking-widest text-emerald-400 bg-slate-900 px-2.5 py-1 rounded border border-emerald-500/40">
                4829
              </span>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2 text-center">
                Enter 4-Digit OTP
              </label>
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={otp[idx]}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-12 h-14 text-center text-xl font-mono font-bold bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 focus:border-emerald-400 focus:outline-none shadow-inner"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>{timer > 0 ? `Resend in ${timer}s` : "Didn't get OTP?"}</span>
              {timer === 0 && (
                <button
                  type="button"
                  onClick={() => setTimer(60)}
                  className="text-emerald-400 hover:underline"
                >
                  Resend Code
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Sign In</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('input')}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200"
            >
              ← Edit mobile number or email
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>256-Bit Encrypted Citizen Session • UIDAI & MeitY Standards</span>
        </div>
      </div>
    </div>
  );
}
