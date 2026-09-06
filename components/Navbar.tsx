'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  User,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  FileText,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { UserSession } from './AuthModal';

interface NavbarProps {
  casesCount: number;
  user: UserSession | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Navbar({
  casesCount,
  user,
  onOpenAuth,
  onLogout
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="header-glass">
      {/* Brand Logo */}
      <Link href="/" className="brand-logo">
        <div className="brand-icon">N1</div>
        <div className="brand-title">
          <span className="font-extrabold tracking-tight text-slate-50 text-lg">NagrikOne</span>
          <span className="brand-badge">CITIZEN RESOLUTION PLATFORM</span>
        </div>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-6">
        <Link href="/#home" className="nav-item">
          Home
        </Link>
        <Link href="/#library" className="nav-item flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>99 Problem Library</span>
        </Link>
        <Link href="/#cases" className="nav-item flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>My Cases</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
            {casesCount}
          </span>
        </Link>
        <Link href="/admin" className="nav-item flex items-center gap-1.5 text-slate-400 hover:text-purple-300">
          <Lock className="w-3.5 h-3.5 text-purple-400" />
          <span>Admin Portal</span>
        </Link>
        <Link href="/payment" className="btn-pay-nav">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Resolution Pass & Pay</span>
        </Link>

        {/* User Profile / Login */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/40 text-xs text-slate-200 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs font-mono">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[100px] truncate font-medium">{user.name}</span>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#081322] border border-slate-700 p-2 shadow-2xl text-xs text-slate-200 z-50 animate-fadeIn">
                <div className="p-2 border-b border-slate-800">
                  <p className="font-bold text-slate-100">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  <p className="text-[10px] text-emerald-400 font-mono mt-0.5">+91 {user.mobile}</p>
                </div>
                <Link
                  href="/#cases"
                  onClick={() => setUserDropdownOpen(false)}
                  className="block p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-slate-100 mt-1"
                >
                  My Resolution Cases ({casesCount})
                </Link>
                <Link
                  href="/payment"
                  onClick={() => setUserDropdownOpen(false)}
                  className="block p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-slate-100"
                >
                  Active Passes & Receipts
                </Link>
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-rose-950/50 text-rose-300 hover:text-rose-200 flex items-center gap-2 mt-1 border-t border-slate-800/80"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-700 hover:border-emerald-500/40 bg-slate-900/80 text-xs font-semibold text-slate-200 hover:text-emerald-300 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span>Citizen Sign In</span>
          </button>
        )}
      </nav>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-[74px] left-0 right-0 bg-[#081322]/95 border-b border-slate-800 backdrop-blur-2xl p-6 flex flex-col gap-4 text-sm text-slate-200 z-50 animate-fadeIn">
          <Link
            href="/#home"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 border-b border-slate-800/60"
          >
            Home
          </Link>
          <Link
            href="/#library"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 border-b border-slate-800/60 flex items-center justify-between"
          >
            <span>99 Problem Library</span>
            <span className="text-xs text-cyan-400 font-mono">99 Routes</span>
          </Link>
          <Link
            href="/#cases"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 border-b border-slate-800/60 flex items-center justify-between"
          >
            <span>My Cases</span>
            <span className="text-xs text-emerald-400 font-mono">{casesCount}</span>
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 border-b border-slate-800/60 text-purple-300"
          >
            Admin Command Center
          </Link>
          <Link
            href="/payment"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2.5 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold text-center flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>Resolution Pass & Pay</span>
          </Link>

          {user ? (
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <div>
                <p className="font-bold text-slate-100">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="px-3 py-1 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-semibold text-center"
            >
              Citizen Sign In / Register
            </button>
          )}
        </div>
      )}
    </header>
  );
}
