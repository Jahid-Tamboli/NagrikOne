'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Sparkles,
  Compass,
  Info,
  Mail,
  Bot
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
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="header-glass">
      {/* Brand Logo */}
      <Link href="/" className="brand-logo focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-xl">
        <div className="brand-icon">N1</div>
        <div className="brand-title">
          <span className="font-extrabold tracking-tight text-slate-50 text-lg">NagrikOne</span>
          <span className="brand-badge">CITIZEN RESOLUTION PLATFORM</span>
        </div>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden xl:flex items-center gap-5">
        <Link href="/" className={`nav-item ${isActive('/') ? 'text-emerald-400 font-bold' : ''}`}>
          Home
        </Link>
        <Link href="/#nova" className="nav-item flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ask NOVA AI</span>
        </Link>
        <Link href="/how-it-works" className={`nav-item flex items-center gap-1.5 ${isActive('/how-it-works') ? 'text-cyan-400 font-bold' : ''}`}>
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>How It Works</span>
        </Link>
        <Link href="/#library" className="nav-item flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>99 Routes</span>
        </Link>
        <Link href="/#cases" className="nav-item flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>Track Cases</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
            {casesCount}
          </span>
        </Link>
        <Link href="/about" className={`nav-item flex items-center gap-1.5 ${isActive('/about') ? 'text-emerald-400 font-bold' : ''}`}>
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>About</span>
        </Link>
        <Link href="/contact" className={`nav-item flex items-center gap-1.5 ${isActive('/contact') ? 'text-emerald-400 font-bold' : ''}`}>
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span>Contact</span>
        </Link>
        <Link href="/payment" className="btn-pay-nav">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Resolution Pass</span>
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
                  href="/admin"
                  onClick={() => setUserDropdownOpen(false)}
                  className="block p-2 rounded-lg hover:bg-slate-800 text-purple-300 hover:text-purple-200"
                >
                  Admin Command Center
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

      {/* Tablet / Mid-screen Compact CTA */}
      <div className="hidden md:flex xl:hidden items-center gap-3">
        <Link
          href="/#nova"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask NOVA AI</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Toggle (Small screens) */}
      <div className="flex md:hidden items-center gap-2">
        <Link
          href="/#nova"
          className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[11px]">NOVA</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile & Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden absolute top-[74px] left-0 right-0 bg-[#081322]/98 border-b border-slate-800 backdrop-blur-2xl p-6 flex flex-col gap-4 text-sm text-slate-200 z-50 animate-fadeIn shadow-2xl">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2.5 border-b border-slate-800/60 font-semibold"
          >
            Home
          </Link>
          <Link
            href="/#nova"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2.5 border-b border-slate-800/60 text-emerald-300 font-bold flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Ask NOVA AI</span>
            </span>
            <span className="text-xs bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">Assistant</span>
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2.5 border-b border-slate-800/60 text-cyan-300 flex items-center justify-between"
          >
            <span>How It Works</span>
            <span className="text-xs text-cyan-400 font-mono">6 Steps</span>
          </Link>
          <Link
            href="/#library"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2.5 border-b border-slate-800/60 flex items-center justify-between"
          >
            <span>99 Problem Library</span>
            <span className="text-xs text-slate-400 font-mono">Statutory Mesh</span>
          </Link>
          <Link
            href="/#cases"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2.5 border-b border-slate-800/60 flex items-center justify-between"
          >
            <span>Track My Cases</span>
            <span className="text-xs text-emerald-400 font-mono">{casesCount} Active</span>
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2.5 border-b border-slate-800/60"
          >
            About & Creator Jahid Tamboli
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2.5 border-b border-slate-800/60"
          >
            Contact Creator
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2.5 border-b border-slate-800/60 text-purple-300"
          >
            Admin Command Center
          </Link>
          <Link
            href="/payment"
            onClick={() => setMobileMenuOpen(false)}
            className="py-3 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-center flex items-center justify-center gap-2 mt-1"
          >
            <Zap className="w-4 h-4" />
            <span>Resolution Pass & Pay</span>
          </Link>

          {user ? (
            <div className="pt-3 flex items-center justify-between border-t border-slate-800">
              <div>
                <p className="font-bold text-slate-100">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold"
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
              className="w-full py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-bold text-center mt-2"
            >
              Citizen Sign In / Register
            </button>
          )}
        </div>
      )}
    </header>
  );
}
