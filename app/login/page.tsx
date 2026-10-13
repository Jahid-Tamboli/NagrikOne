'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Phone,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Building2,
  Scale,
  Zap,
  Activity
} from 'lucide-react';
import Navbar from '@/components/Navbar';

// ─── Animated 3D civic network visual (CSS-only, no Three.js) ───────────────

function CivicNetworkVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none" aria-hidden="true">
      {/* Ambient glow orbs */}
      <div className="absolute w-64 h-64 rounded-full civic-orb-primary pointer-events-none" />
      <div className="absolute w-48 h-48 rounded-full civic-orb-secondary pointer-events-none" style={{ top: '15%', left: '15%' }} />
      <div className="absolute w-32 h-32 rounded-full civic-orb-tertiary pointer-events-none" style={{ bottom: '20%', right: '10%' }} />

      {/* Central hub */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Main animated core ring */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full civic-ring-outer" />
          {/* Middle pulse ring */}
          <div className="absolute inset-4 rounded-full civic-ring-middle" />
          {/* Inner glow */}
          <div className="absolute inset-8 rounded-full civic-ring-inner" />
          {/* Center logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', color: '#021a1a', boxShadow: '0 0 30px rgba(16,185,129,0.5)' }}>
              N1
            </div>
          </div>
        </div>

        {/* Floating service node chips */}
        <div className="absolute top-0 -right-4 sm:-right-8 civic-float-1">
          <div className="civic-node-chip">
            <Building2 className="w-3 h-3 text-cyan-400" />
            <span>Municipal</span>
          </div>
        </div>
        <div className="absolute top-0 -left-4 sm:-left-8 civic-float-2">
          <div className="civic-node-chip">
            <Scale className="w-3 h-3 text-purple-400" />
            <span>Consumer</span>
          </div>
        </div>
        <div className="absolute bottom-2 -right-4 sm:-right-10 civic-float-3">
          <div className="civic-node-chip">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Utility</span>
          </div>
        </div>
        <div className="absolute bottom-2 -left-4 sm:-left-10 civic-float-4">
          <div className="civic-node-chip">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>Banking</span>
          </div>
        </div>

        {/* Connecting lines SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="0.5" strokeDasharray="4 6" className="civic-dash-rotate" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(168,85,247,0.25)" strokeWidth="0.5" strokeDasharray="6 8" className="civic-dash-rotate-reverse" />
        </svg>
      </div>

      {/* Tagline */}
      <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 text-center space-y-1">
        <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest">One Platform</p>
        <p className="text-sm sm:text-base font-black text-slate-200 tracking-tight">Every Citizen Problem</p>
        <p className="text-[11px] text-slate-500 font-sans max-w-xs mx-auto">
          AI-powered resolution for municipal, banking, consumer, and civic disputes.
        </p>
      </div>
    </div>
  );
}

// ─── Field wrapper component ─────────────────────────────────────────────────

interface FieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}

function Field({ label, required, optional, children }: FieldProps) {
  return (
    <div>
      <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
        {optional && <span className="text-slate-600 ml-1 font-normal normal-case">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

// ─── The actual page content ─────────────────────────────────────────────────

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/nova';
  const defaultTabParam = searchParams.get('tab') as 'signin' | 'signup' | null;

  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTabParam === 'signup' ? 'signup' : 'signin');

  // Sign In fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Shared
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedUser, setSavedUser] = useState<{ name?: string } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nagrikone_saved_citizen');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedUser(parsed);
        if (parsed.identifier || parsed.email) {
          setIdentifier(parsed.identifier || parsed.email || '');
        }
      }
    } catch (e) {}
  }, []);

  const saveRememberedCitizen = (userData: any) => {
    if (!rememberMe) return;
    try {
      localStorage.setItem('nagrikone_saved_citizen', JSON.stringify({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        identifier: userData.email || userData.phone,
        savedAt: new Date().toISOString()
      }));
    } catch (e) {}
  };

  // Password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return null;
    const score = [pwd.length >= 8, /[A-Z]/.test(pwd), /[a-z]/.test(pwd), /\d/.test(pwd), /[^A-Za-z0-9]/.test(pwd)].filter(Boolean).length;
    if (score <= 2) return { label: 'Weak', color: 'bg-rose-500', width: '33%' };
    if (score <= 3) return { label: 'Fair', color: 'bg-amber-500', width: '60%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim() || !password) {
      setError('Please enter your email/mobile and password.');
      return;
    }
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
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || name.trim().length < 2) { setError('Please enter your full name.'); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Please enter a valid email address.'); return; }
    if (phone && !/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) { setError('Please enter a valid 10-digit mobile number, or leave it blank.'); return; }
    if (!signupPassword || signupPassword.length < 8) { setError('Password must be at least 8 characters long.'); return; }
    if (signupPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (!termsAccepted) { setError('Please accept the Terms of Service and Privacy Policy.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password: signupPassword,
          confirmPassword
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Registration failed.');
      saveRememberedCitizen(data.user);
      setSuccessMsg(`Welcome, ${data.user.name}! Redirecting…`);
      setTimeout(() => { window.location.href = redirectUrl; }, 1000);
    } catch (err: any) {
      setError(err.message || 'Could not complete registration.');
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = getPasswordStrength(signupPassword);

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 overflow-hidden relative">
      {/* Background ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.12), transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)' }} />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)' }} />
      </div>

      <div className="relative z-10">
        <Navbar onOpenAuth={() => {}} onLogout={() => {}} />

        <div className="min-h-[calc(100vh-76px)] grid lg:grid-cols-2">

          {/* ─── Left column: animated civic visual ─── */}
          <div className="hidden lg:flex flex-col items-center justify-center p-12 xl:p-16 relative">
            {/* Back to homepage */}
            <Link
              href="/"
              className="absolute top-6 left-8 inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>

            <div className="w-full max-w-sm xl:max-w-md aspect-square">
              <CivicNetworkVisual />
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {[
                { icon: ShieldCheck, label: 'PBKDF2 Encrypted', color: 'text-cyan-400' },
                { icon: Sparkles, label: 'NOVA AI-Powered', color: 'text-purple-400' },
                { icon: CheckCircle2, label: 'Real Statutory Routes', color: 'text-emerald-400' }
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span className="text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Right column: auth form ─── */}
          <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
            <div className="w-full max-w-md">
              {/* Mobile back link */}
              <Link href="/" className="lg:hidden inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-cyan-400 mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Home
              </Link>

              {/* Mobile brand header */}
              <div className="lg:hidden flex items-center gap-3 mb-8">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
                  style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#021a1a' }}>
                  N1
                </div>
                <div>
                  <span className="text-sm font-extrabold text-slate-50 block leading-none">NagrikOne</span>
                  <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">Citizen Platform</span>
                </div>
              </div>

              {/* Auth card */}
              <div className="login-card">
                {/* Card ambient glow */}
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full pointer-events-none opacity-25"
                  style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)', filter: 'blur(25px)' }} />

                {/* Desktop brand */}
                <div className="hidden lg:flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
                    style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#021a1a' }}>
                    N1
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-slate-50 block leading-none">NagrikOne</span>
                    <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">Citizen Intelligence Platform</span>
                  </div>
                </div>

                {/* Tab switcher */}
                <div className="flex p-1 rounded-2xl mb-6"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {(['signin', 'signup'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setTab(t); setError(null); setSuccessMsg(null); }}
                      className="flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200"
                      style={tab === t ? {
                        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                        color: '#030712',
                        boxShadow: '0 4px 15px rgba(6,182,212,0.3)'
                      } : { color: '#94a3b8' }}
                    >
                      {t === 'signin' ? 'Sign In' : 'Create Account'}
                    </button>
                  ))}
                </div>

                {/* Headings */}
                <h1 className="text-2xl font-black text-slate-50 tracking-tight mb-1">
                  {tab === 'signin'
                    ? (savedUser?.name ? `Welcome back, ${savedUser.name.split(' ')[0]} 👋` : 'Welcome back')
                    : 'Create your account'}
                </h1>
                <p className="text-xs text-slate-400 mb-5 font-sans">
                  {tab === 'signin'
                    ? 'Sign in to access your citizen cases and NOVA AI.'
                    : 'One account for all your civic dispute resolution needs.'}
                </p>

                {/* Error/success messages */}
                {error && (
                  <div className="mb-4 p-3 rounded-xl flex items-center gap-2.5 text-xs text-rose-300 animate-fadeIn"
                    style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)' }}>
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="mb-4 p-3 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300 animate-fadeIn"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* ─── SIGN IN ─── */}
                {tab === 'signin' && (
                  <form onSubmit={handleSignIn} className="space-y-4" noValidate>
                    <Field label="Email or Mobile Number" required>
                      <div className="auth-field-wrap">
                        <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                        <input
                          type="text"
                          required
                          autoComplete="username"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="you@example.com or 9876543210"
                          className="auth-field-input"
                        />
                      </div>
                    </Field>

                    <Field label="Password" required>
                      <div className="auth-field-wrap">
                        <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Your password"
                          className="auth-field-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="text-slate-500 hover:text-slate-300 transition-colors ml-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </Field>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="auth-checkbox"
                        />
                        <span className="text-xs text-slate-400 font-sans">Remember me</span>
                      </label>
                      <span className="text-[10.5px] text-slate-600 font-mono">
                        Forgot password? Contact support.
                      </span>
                    </div>

                    <button type="submit" disabled={loading} className="auth-btn-primary">
                      {loading
                        ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Signing in…</span></>
                        : <><span>Sign In to NagrikOne</span><ArrowRight className="w-4 h-4" /></>
                      }
                    </button>

                    <p className="text-center text-xs text-slate-500 pt-1 font-sans">
                      Don&apos;t have an account?{' '}
                      <button type="button" onClick={() => { setTab('signup'); setError(null); }}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                        Create one free
                      </button>
                    </p>
                  </form>
                )}

                {/* ─── SIGN UP ─── */}
                {tab === 'signup' && (
                  <form onSubmit={handleSignUp} className="space-y-3.5" noValidate>
                    <Field label="Full Name" required>
                      <div className="auth-field-wrap">
                        <User className="w-4 h-4 text-slate-500 shrink-0" />
                        <input
                          type="text"
                          required
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Jahid Tamboli"
                          className="auth-field-input"
                        />
                      </div>
                    </Field>

                    <Field label="Email Address" required>
                      <div className="auth-field-wrap">
                        <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="auth-field-input"
                        />
                      </div>
                    </Field>

                    <Field label="Mobile Number" optional>
                      <div className="auth-field-wrap">
                        <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                        <input
                          type="tel"
                          autoComplete="tel"
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="9876543210"
                          className="auth-field-input"
                        />
                      </div>
                    </Field>

                    <Field label="Password" required>
                      <div className="auth-field-wrap">
                        <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          required
                          autoComplete="new-password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Min. 8 characters"
                          className="auth-field-input"
                        />
                        <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)}
                          aria-label={showSignupPassword ? 'Hide' : 'Show'}
                          className="text-slate-500 hover:text-slate-300 transition-colors ml-1">
                          {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {pwStrength && (
                        <div className="mt-1.5 space-y-1">
                          <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-300 ${pwStrength.color}`} style={{ width: pwStrength.width }} />
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">{pwStrength.label}</span>
                        </div>
                      )}
                    </Field>

                    <Field label="Confirm Password" required>
                      <div className="auth-field-wrap" style={
                        confirmPassword && signupPassword !== confirmPassword ? { borderColor: 'rgba(244,63,94,0.5)' }
                        : confirmPassword && signupPassword === confirmPassword ? { borderColor: 'rgba(16,185,129,0.5)' }
                        : {}
                      }>
                        <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat your password"
                          className="auth-field-input"
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? 'Hide' : 'Show'}
                          className="text-slate-500 hover:text-slate-300 transition-colors ml-1">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPassword && signupPassword !== confirmPassword && (
                        <span className="text-[10px] text-rose-400 font-mono mt-1 block">Passwords don&apos;t match</span>
                      )}
                    </Field>

                    <label className="flex items-start gap-2.5 cursor-pointer pt-0.5">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="auth-checkbox mt-0.5"
                      />
                      <span className="text-xs text-slate-400 font-sans leading-relaxed">
                        I agree to the{' '}
                        <Link href="/about" className="text-cyan-400 hover:underline">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="/about" className="text-cyan-400 hover:underline">Privacy Policy</Link>
                      </span>
                    </label>

                    <button type="submit" disabled={loading} className="auth-btn-primary">
                      {loading
                        ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Creating account…</span></>
                        : <><span>Create Account</span><CheckCircle2 className="w-4 h-4" /></>
                      }
                    </button>

                    <p className="text-center text-xs text-slate-500 pt-1 font-sans">
                      Already have an account?{' '}
                      <button type="button" onClick={() => { setTab('signin'); setError(null); }}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                        Sign in
                      </button>
                    </p>
                  </form>
                )}

                {/* Footer */}
                <div className="mt-6 pt-4 text-center text-[10px] text-slate-600 font-mono flex items-center justify-center gap-1.5"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-500/60" />
                  <span>Encrypted Sessions • No Plain-Text Storage • Privacy First</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
          <span className="font-mono text-sm">Loading…</span>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
