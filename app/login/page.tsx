'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  User,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { AuthSession } from '@/lib/auth/session';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/nova';

  const [tab, setTab] = useState<'signin' | 'signup' | 'otp_request' | 'otp_verify'>('signin');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [rememberMe, setRememberMe] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const [expiryCountdown, setExpiryCountdown] = useState(180);
  const [savedUser, setSavedUser] = useState<{ name?: string; identifier?: string; phone?: string; email?: string } | null>(null);

  // Load remembered citizen details
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nagrikone_saved_citizen');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedUser(parsed);
        if (parsed.identifier || parsed.phone || parsed.email) {
          setIdentifier(parsed.identifier || parsed.phone || parsed.email || '');
          setPhone(parsed.phone || '');
          setEmail(parsed.email || '');
          if (parsed.name) setName(parsed.name);
        }
      }
    } catch (e) {}
  }, []);

  // OTP countdown timer
  useEffect(() => {
    let timer: any;
    if (tab === 'otp_verify') {
      timer = setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
        setExpiryCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [tab]);

  const saveRememberedCitizen = (userData: any) => {
    if (!rememberMe) return;
    try {
      localStorage.setItem('nagrikone_saved_citizen', JSON.stringify({
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        identifier: userData.phone || userData.email,
        savedAt: new Date().toISOString()
      }));
    } catch (e) {}
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials. Please check your password.');
      }

      saveRememberedCitizen(data.user);
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          password
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed.');
      }

      saveRememberedCitizen(data.user);
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message || 'Could not complete registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const target = (phone || identifier).trim();

    if (!target) {
      setError('Please enter your 10-digit mobile number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', target })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unable to send OTP right now.');
      }

      setTab('otp_verify');
      setCooldown(data.cooldownSeconds || 30);
      setExpiryCountdown(data.expirySeconds || 180);
      setSuccessMsg(`A 6-digit verification code has been dispatched to ${target}.`);
    } catch (err: any) {
      setError(err.message || 'Unable to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const digitsOnly = val.replace(/\D/g, '');
    if (digitsOnly.length > 1) {
      const newOtp = [...otp];
      for (let i = 0; i < 6 && i < digitsOnly.length; i++) {
        newOtp[i] = digitsOnly[i];
      }
      setOtp(newOtp);
      const lastIdx = Math.min(5, digitsOnly.length - 1);
      document.getElementById(`login-otp-${lastIdx}`)?.focus();
      return;
    }

    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    if (val && index < 5) {
      document.getElementById(`login-otp-${index + 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = otp.join('');
    const target = (phone || identifier).trim();

    if (code.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          target,
          code,
          name: name.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid OTP. Please check the code.');
      }

      saveRememberedCitizen(data.user);
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 pb-20">
      <Navbar onOpenAuth={() => {}} onLogout={() => {}} />

      <div className="container-box pt-8 sm:pt-14 max-w-lg">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Homepage</span>
        </Link>

        <div className="rounded-3xl p-6 sm:p-9 bg-gradient-to-b from-[#081322] via-[#040914] to-[#020408] border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.2)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-extrabold text-sm">
              N1
            </div>
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              Citizen Security Gateway
            </span>
          </div>

          {/* Tab Selector */}
          {tab !== 'otp_verify' && (
            <div className="flex p-1 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => { setTab('signin'); setError(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  tab === 'signin'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('signup'); setError(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  tab === 'signup'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => { setTab('otp_request'); setError(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  tab === 'otp_request'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SMS OTP
              </button>
            </div>
          )}

          <h1 className="text-2xl font-black text-slate-50 mb-1">
            {tab === 'signin' && (savedUser?.name ? `Welcome back, ${savedUser.name.split(' ')[0]}` : 'Citizen Sign In')}
            {tab === 'signup' && 'Register New Citizen Profile'}
            {tab === 'otp_request' && 'Login with Mobile OTP'}
            {tab === 'otp_verify' && 'Verify 6-Digit SMS Code'}
          </h1>

          <p className="text-xs text-slate-400 mb-6 font-sans">
            {tab === 'signin'
              ? 'Enter your registered mobile or email and your password to access your cases.'
              : tab === 'signup'
              ? 'Enter your details once. We remember you securely with one password.'
              : tab === 'otp_request'
              ? 'We will dispatch a secure 6-digit verification code to your phone.'
              : `Enter the code dispatched to ${phone || identifier}`}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN */}
          {tab === 'signin' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Mobile Number or Email *
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus-within:border-cyan-400">
                  <User className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 9503795786 or citizen@example.com"
                    className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => { setTab('otp_request'); setError(null); }}
                    className="text-[10.5px] font-mono text-cyan-400 hover:underline"
                  >
                    Use SMS OTP
                  </button>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus-within:border-cyan-400">
                  <KeyRound className="w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1 font-sans">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                />
                <span>Remember me on this browser</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(6,182,212,0.35)] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to NagrikOne</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SIGN UP */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Full Name *
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus-within:border-cyan-400">
                  <User className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jahid Tamboli"
                    className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  10-Digit Mobile Number *
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus-within:border-cyan-400">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9503795786"
                    className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Email Address (Optional)
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus-within:border-cyan-400">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. citizen@example.com"
                    className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Create Password (Min 6 characters) *
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus-within:border-cyan-400">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create your secure password"
                    className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                />
                <span>Remember my details on this device</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(6,182,212,0.35)] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Registering Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Continue</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP REQUEST */}
          {tab === 'otp_request' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  10-Digit Mobile Number *
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus-within:border-cyan-400">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={phone || identifier}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '');
                      setPhone(clean);
                      setIdentifier(clean);
                    }}
                    placeholder="e.g. 9503795786"
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
                    <span>Dispatching Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send 6-Digit SMS Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP VERIFY */}
          {tab === 'otp_verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <div className="flex items-center justify-between px-1 mb-2.5 text-[11px] font-mono">
                  <span className="text-slate-400 uppercase tracking-wider">SMS Code Sent</span>
                  <span className={expiryCountdown > 30 ? 'text-cyan-400 font-bold' : 'text-rose-400 font-bold'}>
                    {expiryCountdown > 0
                      ? `Live: ${Math.floor(expiryCountdown / 60)}:${(expiryCountdown % 60).toString().padStart(2, '0')}`
                      : 'Code Expired'}
                  </span>
                </div>

                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <input
                      key={idx}
                      id={`login-otp-${idx}`}
                      type="text"
                      maxLength={6}
                      value={otp[idx]}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-10 h-12 text-center text-lg font-mono font-bold bg-slate-900 border border-slate-700 rounded-xl text-cyan-300 focus:border-cyan-400 focus:outline-none"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>{cooldown > 0 ? `Resend SMS in ${cooldown}s` : "Didn't receive code?"}</span>
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
                onClick={() => setTab('signin')}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 font-mono"
              >
                ← Back to Password Sign In
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Server-Side Encrypted Session • Privacy Safeguarded</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030712] flex items-center justify-center text-slate-400">Loading Gateway...</div>}>
      <LoginContent />
    </Suspense>
  );
}
