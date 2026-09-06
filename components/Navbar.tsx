'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  User,
  LogOut,
  Menu,
  X,
  FileText,
  Sparkles,
  HelpCircle,
  Info,
  Phone,
  ChevronRight
} from 'lucide-react';
import { AuthSession } from '@/lib/auth/session';

interface NavbarProps {
  casesCount?: number;
  user?: AuthSession | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Navbar({
  casesCount = 0,
  user = null,
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
          <span className="brand-badge">CITIZEN INTELLIGENCE PLATFORM</span>
        </div>
      </Link>

      {/* Desktop Minimal Navigation (NO Admin links) */}
      <nav className="hidden lg:flex items-center gap-6">
        <Link href="/nova" className="nav-item flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NOVA</span>
        </Link>
        <Link href="/how-it-works" className="nav-item flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>How It Works</span>
        </Link>
        <Link href="/about" className="nav-item flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>About</span>
        </Link>
        <Link href="/contact" className="nav-item flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>Contact</span>
        </Link>

        {/* Authenticated Citizen Cases Link */}
        {user && (
          <Link href="/cases" className="nav-item flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>My Cases</span>
            {casesCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                {casesCount}
              </span>
            )}
          </Link>
        )}

        {/* Primary CTA */}
        <Link
          href="/nova"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
        >
          <span>Talk to NOVA</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        {/* User Profile / Login */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-xs text-slate-200 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs font-mono">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[110px] truncate font-medium">{user.name}</span>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#081322] border border-slate-700 p-2 shadow-2xl text-xs text-slate-200 z-50 animate-fadeIn">
                <div className="p-2 border-b border-slate-800">
                  <p className="font-bold text-slate-100">{user.name}</p>
                  {user.email && <p className="text-[11px] text-slate-400 truncate">{user.email}</p>}
                  {user.phone && <p className="text-[10px] text-cyan-400 font-mono mt-0.5">+91 {user.phone}</p>}
                </div>
                <Link
                  href="/cases"
                  onClick={() => setUserDropdownOpen(false)}
                  className="block p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-slate-100 mt-1"
                >
                  My Resolution Cases
                </Link>
                <Link
                  href="/payment"
                  onClick={() => setUserDropdownOpen(false)}
                  className="block p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-slate-100"
                >
                  Resolution Passes & Receipts
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-700 hover:border-cyan-500/40 bg-slate-900/80 text-xs font-semibold text-slate-200 hover:text-cyan-300 transition-colors"
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

      {/* Mobile Drawer (NO Admin links) */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-[76px] left-0 right-0 bg-[#081322]/95 border-b border-slate-800 backdrop-blur-2xl p-6 flex flex-col gap-4 text-sm text-slate-200 z-50 animate-fadeIn">
          <Link
            href="/nova"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 border-b border-slate-800/60 flex items-center justify-between text-cyan-300 font-semibold"
          >
            <span>NOVA Intelligence</span>
            <Sparkles className="w-4 h-4" />
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 border-b border-slate-800/60"
          >
            How It Works
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 border-b border-slate-800/60"
          >
            About NagrikOne
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 border-b border-slate-800/60"
          >
            Contact
          </Link>

          {user ? (
            <>
              <Link
                href="/cases"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-800/60 flex items-center justify-between"
              >
                <span>My Cases</span>
                <span className="text-xs text-emerald-400 font-mono">{casesCount}</span>
              </Link>
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-100">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email || user.phone}</p>
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
            </>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-semibold text-center"
            >
              Citizen Sign In
            </button>
          )}
        </div>
      )}
    </header>
  );
}
