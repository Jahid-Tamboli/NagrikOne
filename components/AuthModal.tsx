'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  X,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  User,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { AuthSession } from '@/lib/auth/session';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthSession) => void;
  initialMessage?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMessage
}: AuthModalProps) {
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [target, setTarget] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  useEffect(() => {
    setStep('input');
    setError(null);
  }, [isOpen]);

  useEffect(() => {
    let timer: any;
    if (step === 'otp' && cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, cooldown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanedTarget = target.trim();
    if (!cleanedTarget) {
      setError('Please enter your 10-digit mobile number or email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          target: cleanedTarget
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unable to send OTP right now. Please try again after 30 seconds.');
      }

      setStep('otp');
      setCooldown(data.cooldownSeconds || 30);
    } catch (err: any) {
      setError(err.message || 'Unable to send OTP right now. Please try again after 30 seconds.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = otp.join('');

    if (code.length < 4) {
      setError('Invalid OTP. Please check the OTP and try again.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          target: target.trim(),
          code,
          name: name.trim() || undefined
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid OTP. Please check the OTP and try again.');
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please check the OTP and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#081322] via-[#040914] to-[#020408] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.2)] text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-extrabold text-sm">
            N1
          </div>
          <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
            Citizen Security Gateway
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-1">
          {step === 'input' ? 'Citizen Sign In / Register' : 'Enter Verification Code'}
        </h2>

        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          {initialMessage || (step === 'input'
            ? 'Before we start, please log in so I can securely save your problem, documents and case status.'
            : `Enter the verification code sent to ${target}`)}
        </p>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {step === 'input' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Your Full Name (Optional)
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus-within:border-cyan-400">
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
              <label className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Mobile Number or Email *
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus-within:border-cyan-400">
                <Phone className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g. 9876543210 or citizen@example.com"
                  className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(6,182,212,0.35)] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Dispatching OTP...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2.5 text-center">
                Enter Code
              </label>
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <input
                    key={idx}
                    id={`otp-digit-${idx}`}
                    type="text"
                    maxLength={1}
                    value={otp[idx]}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-10 h-12 text-center text-lg font-mono font-bold bg-slate-900 border border-slate-700 rounded-xl text-cyan-300 focus:border-cyan-400 focus:outline-none"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>{cooldown > 0 ? `Resend in ${cooldown}s` : "Didn't receive code?"}</span>
              {cooldown === 0 && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-cyan-400 hover:underline"
                >
                  Resend Code
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Access Case Intelligence</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('input')}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 font-mono"
            >
              ← Edit details
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-cyan-400" />
          <span>Server-Side Encrypted Session • Privacy Safeguarded</span>
        </div>
      </div>
    </div>
  );
}
