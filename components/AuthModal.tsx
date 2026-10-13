'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Phone,
  X,
  CheckCircle2,
  ArrowRight,
  Lock,
  User,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { AuthSession } from '@/lib/auth/session';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthSession) => void;
  initialMessage?: string;
  customPrompt?: string;
  defaultTab?: 'signin' | 'signup';
}

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMessage,
  customPrompt,
  defaultTab = 'signin'
}: AuthModalProps) {
  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab);

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

  // Shared state
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedUser, setSavedUser] = useState<{ name?: string; identifier?: string } | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSuccessMsg(null);
    setTab(defaultTab);
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
  }, [isOpen, defaultTab]);

  // Trap focus and close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return null;
    const hasLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNum = /\d/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    const score = [hasLength, hasUpper, hasLower, hasNum, hasSpecial].filter(Boolean).length;
    if (score <= 2) return { label: 'Weak', color: 'bg-rose-500', width: '33%' };
    if (score <= 3) return { label: 'Fair', color: 'bg-amber-500', width: '60%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };

  // Sign In handler
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
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Sign Up handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (phone && !/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit Indian mobile number, or leave it blank.');
      return;
    }
    if (!signupPassword || signupPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

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
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed.');
      }
      saveRememberedCitizen(data.user);
      setSuccessMsg(`Welcome, ${data.user.name}! Your account is ready.`);
      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Could not complete registration.');
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = getPasswordStrength(signupPassword);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(3,7,18,0.88)', backdropFilter: 'blur(20px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Authentication"
        className="relative w-full max-w-md auth-modal-card animate-auth-enter"
        style={{
          background: 'linear-gradient(160deg, #0d1f35 0%, #060d1a 50%, #030712 100%)',
          border: '1px solid rgba(56,189,248,0.2)',
          borderRadius: '28px',
          padding: '32px',
          boxShadow: '0 0 80px rgba(6,182,212,0.15), 0 40px 80px rgba(0,0,0,0.7)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Ambient orb decorations */}
        <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(30px)' }} />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)', filter: 'blur(25px)' }} />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-100 transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
            style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#021a1a' }}>
            N1
          </div>
          <div>
            <span className="text-sm font-extrabold text-slate-50 block leading-none">NagrikOne</span>
            <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">Citizen Platform</span>
          </div>
        </div>

        {/* Custom prompt banner */}
        {(customPrompt || initialMessage) && (
          <div className="mb-5 p-3 rounded-xl flex items-start gap-2.5 text-xs text-cyan-200"
            style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)' }}>
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-cyan-400 mt-0.5" />
            <span>{customPrompt || initialMessage}</span>
          </div>
        )}

        {/* Tab Switcher */}
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
              } : {
                color: '#94a3b8'
              }}
            >
              {t === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Heading */}
        <h2 className="text-xl font-black text-slate-50 mb-1 tracking-tight">
          {tab === 'signin'
            ? (savedUser?.name ? `Welcome back, ${savedUser.name.split(' ')[0]} 👋` : 'Welcome back')
            : 'Create your account'}
        </h2>
        <p className="text-xs text-slate-400 mb-5 font-sans">
          {tab === 'signin'
            ? 'Sign in to access your cases and citizen services.'
            : 'Join NagrikOne to track and resolve your civic issues.'}
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl flex items-center gap-2.5 text-xs text-rose-300 animate-fadeIn"
            style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)' }}>
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300 animate-fadeIn"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ─── SIGN IN FORM ─── */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4" noValidate>
            {/* Email/Mobile */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Email or Mobile Number
              </label>
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
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[10.5px] text-slate-500 font-mono">
                  Forgot password? Contact support.
                </span>
              </div>
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
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="auth-checkbox"
              />
              <span className="text-xs text-slate-400 font-sans">Remember me on this browser</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="auth-btn-primary"
            >
              {loading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /><span>Signing in…</span></>
              ) : (
                <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            {/* Switch to signup */}
            <p className="text-center text-xs text-slate-500 pt-1 font-sans">
              Don&apos;t have an account?{' '}
              <button type="button" onClick={() => { setTab('signup'); setError(null); }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                Create one free
              </button>
            </p>
          </form>
        )}

        {/* ─── SIGN UP FORM ─── */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5" noValidate>
            {/* Full Name */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
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
            </div>

            {/* Email */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Email Address <span className="text-rose-400">*</span>
              </label>
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
            </div>

            {/* Mobile (optional) */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Mobile Number <span className="text-slate-600 font-normal">(optional)</span>
              </label>
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
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Password <span className="text-rose-400">*</span>
              </label>
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
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  aria-label={showSignupPassword ? 'Hide' : 'Show'}
                  className="text-slate-500 hover:text-slate-300 transition-colors ml-1"
                >
                  {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength */}
              {pwStrength && (
                <div className="mt-1.5 space-y-1">
                  <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${pwStrength.color}`}
                      style={{ width: pwStrength.width }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{pwStrength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Confirm Password <span className="text-rose-400">*</span>
              </label>
              <div className="auth-field-wrap" style={
                confirmPassword && signupPassword !== confirmPassword
                  ? { borderColor: 'rgba(244,63,94,0.5)' }
                  : confirmPassword && signupPassword === confirmPassword
                  ? { borderColor: 'rgba(16,185,129,0.5)' }
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
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide' : 'Show'}
                  className="text-slate-500 hover:text-slate-300 transition-colors ml-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && signupPassword !== confirmPassword && (
                <span className="text-[10px] text-rose-400 font-mono mt-1 block">Passwords don&apos;t match</span>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="auth-checkbox mt-0.5"
              />
              <span className="text-xs text-slate-400 font-sans leading-relaxed">
                I agree to the{' '}
                <a href="/about" target="_blank" className="text-cyan-400 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/about" target="_blank" className="text-cyan-400 hover:underline">Privacy Policy</a>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="auth-btn-primary"
            >
              {loading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /><span>Creating account…</span></>
              ) : (
                <><span>Create Account</span><CheckCircle2 className="w-4 h-4" /></>
              )}
            </button>

            {/* Switch to signin */}
            <p className="text-center text-xs text-slate-500 pt-1 font-sans">
              Already have an account?{' '}
              <button type="button" onClick={() => { setTab('signin'); setError(null); }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                Sign in
              </button>
            </p>
          </form>
        )}

        {/* Footer trust indicator */}
        <div className="mt-6 pt-4 text-center text-[10px] text-slate-600 font-mono flex items-center justify-center gap-1.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-500/60" />
          <span>PBKDF2-Encrypted • Session-Secured • No Plain-Text Storage</span>
        </div>
      </div>
    </div>
  );
}
