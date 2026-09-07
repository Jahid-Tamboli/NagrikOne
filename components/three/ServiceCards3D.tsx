'use client';

import React, { useState } from 'react';
import {
  Building2,
  FileCheck2,
  Scale,
  ShieldAlert,
  Wrench,
  HelpCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export interface ServiceItem {
  id: string;
  badge?: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  glowColor: string;
  statutoryRoute: string;
  turnaroundDays: string;
  categoryQuery: string;
}

export const SERVICES: ServiceItem[] = [
  {
    id: 'civic',
    badge: 'High Impact',
    title: 'Civic Problems',
    description: 'Potholes, broken roads, dark streetlights, waste dumping, contaminated water, and open drains routed directly to local Municipal & PWD departments.',
    icon: Building2,
    gradient: 'from-emerald-500/20 via-cyan-500/10 to-transparent',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    statutoryRoute: 'Municipal Corporation / PWD',
    turnaroundDays: '48 - 72 Hours',
    categoryQuery: 'Civic & Municipal'
  },
  {
    id: 'govt',
    badge: 'Statutory',
    title: 'Government Services',
    description: 'Aadhaar corrections, PAN discrepancies, passport processing stalls, ration card issues, and certificate delays navigated through RTS frameworks.',
    icon: FileCheck2,
    gradient: 'from-sky-500/20 via-blue-500/10 to-transparent',
    glowColor: 'rgba(56, 189, 248, 0.25)',
    statutoryRoute: 'Service Plus / RTS Nodal Officers',
    turnaroundDays: '3 - 7 Days',
    categoryQuery: 'Govt Certificates & Land'
  },
  {
    id: 'consumer',
    badge: 'Most Popular',
    title: 'Consumer Problems',
    description: 'E-commerce return refund denial, defective appliances, cancelled bookings without refund, and warranty refusal prepared for National Consumer Helpline (1915) & e-Daakhil.',
    icon: Scale,
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    statutoryRoute: 'Consumer Forum / NCH 1915',
    turnaroundDays: '7 - 14 Days',
    categoryQuery: 'Consumer & E-Commerce'
  },
  {
    id: 'financial',
    badge: 'Emergency / 1930',
    title: 'Financial & Digital Issues',
    description: 'Failed UPI transactions, unauthorized ATM debits, fake loan app extortion, cyber phishing, and loan recovery agent harassment.',
    icon: ShieldAlert,
    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    statutoryRoute: 'Cyber Crime 1930 / RBI Ombudsman',
    turnaroundDays: '24 - 48 Hours',
    categoryQuery: 'Cyber & Online Fraud'
  },
  {
    id: 'utility',
    badge: 'Everyday Services',
    title: 'Vehicle & Home Services',
    description: 'Dealership servicing disputes, insurance claim rejection, broadband outage, power grid issues, and home utility contract violations.',
    icon: Wrench,
    gradient: 'from-teal-500/20 via-emerald-500/10 to-transparent',
    glowColor: 'rgba(20, 184, 166, 0.25)',
    statutoryRoute: 'Sectoral Regulators / Discoms',
    turnaroundDays: '3 - 5 Days',
    categoryQuery: 'Telecom & Broadband'
  },
  {
    id: 'anything-else',
    badge: 'Universal Intelligence',
    title: 'Anything Else',
    description: 'Describe the problem in your own words. NOVA will understand it, ask the right questions and determine the next step.',
    icon: HelpCircle,
    gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
    glowColor: 'rgba(168, 85, 247, 0.25)',
    statutoryRoute: 'NagrikOne Custom Triage Engine',
    turnaroundDays: 'Dynamic Intake',
    categoryQuery: 'Unclassified'
  }
];

export default function ServiceCards3D({ onSelectService }: { onSelectService?: (service: ServiceItem) => void }) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {SERVICES.map((service) => {
        const Icon = service.icon;
        const isHovered = hoveredCard === service.id;

        return (
          <div
            key={service.id}
            onMouseEnter={() => setHoveredCard(service.id)}
            onMouseLeave={() => setHoveredCard(null)}
            className="group relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#081322] to-[#040914] border border-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-[0_0_35px_rgba(6,182,212,0.15)]"
          >
            {/* Ambient Background Glow */}
            <div
              className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
            />

            <div>
              {/* Header Badge & 3D Glowing Icon Container */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-slate-700/80 group-hover:border-cyan-400/60 flex items-center justify-center text-slate-100 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                </div>

                {service.badge && (
                  <span className="px-3 py-1 rounded-full text-[10.5px] font-mono font-bold uppercase tracking-wider bg-slate-900/80 border border-slate-700/80 text-slate-300 group-hover:text-white group-hover:border-cyan-500/40">
                    {service.badge}
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-extrabold text-slate-50 mb-2.5 tracking-tight group-hover:text-cyan-300 transition-colors">
                {service.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6 font-sans">
                {service.description}
              </p>
            </div>

            {/* Bottom Meta & Action */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Target Route</span>
                <strong className="text-slate-300 font-semibold truncate max-w-[170px] block">{service.statutoryRoute}</strong>
              </div>

              <Link
                href={`/nova?category=${encodeURIComponent(service.id)}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 group-hover:border-cyan-400 text-slate-300 group-hover:text-cyan-300 transition-colors font-sans font-semibold text-xs"
              >
                <span>Talk to NOVA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
