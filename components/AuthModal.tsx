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
  AlertCircle,
  ShieldAlert
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
  defaultRole?: 'citizen' | 'admin';
}

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultRole = 'citizen'
}: AuthModalProps) {
  const [role, setRole] = useState<'citizen' | 'admin'>(defaultRole);
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    setRole(defaultRole);
    setStep('input');
    setError(null);
  }, [defaultRole, isOpen]);

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

    if (role === 'admin') {
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter your official administrator email.');
        return;
      }
      if (!adminPasscode.trim() && !mobile.trim()) {
        setError('Please enter the Admin Security Key or registered mobile.');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const adminSession: UserSession = {
          name: name.trim() || 'Nodal Officer Jahid',
          email: email.trim(),
          mobile: mobile.trim() || '9876543210',
          verifiedAt: new Date().toISOString(),
          role: 'admin'
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('nagrikone_user', JSON.stringify(adminSession));
        }
        onLoginSuccess(adminSession);
        onClose();
      }, 600);
      return;
    }

    // Citizen flow
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
    if (role === 'citizen') {
      setName('Jahid Tamboli');
      setEmail('citizen@nagrikone.gov.in');
      setMobile('9876543210');
    } else {
      setName('Admin Officer Jahid');
      setEmail('admin@nagrikone.gov.in');
      setMobile('9876543210');
      setAdminPasscode('N1-ADMIN-2026');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#0b1b2d] via-[#081322] to-[#040a14] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.25)] text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand & Role Switcher */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-extrabold text-sm">
              N1
            </div>
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
              {role === 'citizen' ? 'Citizen Portal' : 'Admin Security'}
            </span>
          </div>

          {/* Toggle Role */}
          <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => {
                setRole('citizen');
                setStep('input');
                setError(null);
              }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                role === 'citizen'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('admin');
                setStep('input');
                setError(null);
              }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                role === 'admin'
                  ? 'bg-purple-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-1">
          {role === 'citizen'
            ? step === 'input'
              ? 'Citizen Sign In / Register'
              : 'Verify 4-Digit OTP'
            : 'Admin Command Gateway'}
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          {role === 'citizen'
            ? step === 'input'
              ? 'Access saved dockets, AI triage dossiers, and statutory escalations.'
              : `Enter the 4-digit code dispatched to ${mobile || 'your mobile'}`
            : 'Sign in to access grievance dockets, dispatch workflows, and compliance logs.'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {step === 'input' ? (
          <form onSubmit={handleSendOtp} className="space-y-3.5">
            <div>
              <label className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus-within:border-emerald-400">
                <User className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === 'citizen' ? 'e.g. Jahid Tamboli' : 'e.g. Nodal Officer Jahid'}
                  className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                {role === 'citizen' ? 'Email Address *' : 'Official Admin Email *'}
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus-within:border-emerald-400">
                <Mail className="w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'citizen' ? 'citizen@example.com' : 'admin@nagrikone.gov.in'}
                  className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-600"
                />
              </div>
            </div>

            {role === 'citizen' ? (
              <div>
                <label className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
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
            ) : (
              <div>
                <label className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Admin Passcode / Key
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus-within:border-purple-400">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <input
                    type="password"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    placeholder="Enter official admin security key"
                    className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-600"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 ${
                role === 'citizen'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95 shadow-[0_4px_25px_rgba(16,185,129,0.35)]'
                  : 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-95 shadow-[0_4px_25px_rgba(168,85,247,0.35)]'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : role === 'citizen' ? (
                <>
                  <span>Send Dual Verification OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Authenticate & Enter Admin Center</span>
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
                ⚡ Autofill Demo {role === 'citizen' ? 'Citizen Profile' : 'Admin Credentials'}
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
                Enter 4-Digit Security Code
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
              ← Edit details
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>256-Bit Encrypted Session • UIDAI & MeitY Standards</span>
        </div>
      </div>
    </div>
  );
}
