import { NextResponse } from 'next/server';
import { db, fallbackStore } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import QRCode from 'qrcode';

// Server-controlled pricing matrix (Never trust client amount)
const TIER_PRICING: Record<string, { name: string; amount: number; desc: string }> = {
  ASSISTED_DRAFT: {
    name: 'Assisted Document Drafting',
    amount: 199,
    desc: 'Expert compilation of your grievance dossier, structured evidence summary, and RTS submission template'
  },
  LEGAL_NOTICE: {
    name: 'Formal Notice & Dispute Dossier',
    amount: 499,
    desc: 'Formal statutory notice draft with relevant legal citations, consumer protection clauses, and direct escalation pathway'
  },
  CONCIERGE: {
    name: 'Dedicated Advisory Concierge',
    amount: 999,
    desc: 'End-to-end procedural support for high-stakes financial, property, or administrative disputes'
  },
  // Backward compatibility aliases
  STANDARD: {
    name: 'Assisted Document Drafting',
    amount: 199,
    desc: 'Expert compilation of your grievance dossier'
  },
  PRIORITY: {
    name: 'Assisted Document Drafting',
    amount: 199,
    desc: 'High-priority SLA monitoring'
  },
  LEGAL: {
    name: 'Formal Notice & Dispute Dossier',
    amount: 499,
    desc: 'Formal legal notice drafting'
  },
  VIP: {
    name: 'Dedicated Advisory Concierge',
    amount: 999,
    desc: 'Comprehensive legal concierge'
  }
};

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const b = await req.json().catch(() => ({}));
    const caseId = b.caseId ? String(b.caseId).trim() : null;
    const requestedTier = String(b.tier || 'LEGAL_NOTICE').toUpperCase();

    const tierInfo = TIER_PRICING[requestedTier] || TIER_PRICING.LEGAL_NOTICE;
    const amount = tierInfo.amount;

    const upiId = process.env.NAGRIKONE_UPI_ID || '8208583788@kotak811';
    const payeeName = 'NagrikOne Citizen Services';
    const supportPhone = process.env.NAGRIKONE_SUPPORT || '+91 8208583788';
    const refId = `N1_TXN_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Standard NPCI UPI URI scheme for scannable QR and deep linking into UPI apps
    const encodedNote = encodeURIComponent(`NagrikOne ${tierInfo.name}`);
    const upiDeepLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodedNote}`;

    // Generate real, scannable QR Code as Data URL
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(upiDeepLink, {
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    } catch (qrErr) {
      console.warn('QR code generation error:', qrErr);
      qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(upiDeepLink)}`;
    }

    let paymentRecord: any = null;

    try {
      if (db?.payment?.create) {
        paymentRecord = await db.payment.create({
          data: {
            caseId: caseId || undefined,
            userId: user?.userId || undefined,
            amount,
            status: 'PENDING',
            tier: requestedTier,
            providerRef: refId
          }
        });
      }
    } catch (dbErr) {
      console.warn('[API /payment] Database unavailable, using fallback store:', dbErr);
    }

    if (!paymentRecord) {
      paymentRecord = {
        id: `pay_${Date.now()}`,
        caseId: caseId || undefined,
        userId: user?.userId || undefined,
        amount,
        status: 'PENDING',
        tier: requestedTier,
        providerRef: refId,
        createdAt: new Date().toISOString()
      };
      fallbackStore.payments.push(paymentRecord);
    }

    return NextResponse.json({
      success: true,
      refId,
      referenceId: refId,
      amount,
      tier: tierInfo,
      upiId,
      payeeVpa: upiId,
      payeeName,
      supportPhone,
      upiDeepLink,
      upiUri: upiDeepLink,
      qrDataUrl,
      instructions: 'Scan QR with any UPI app (GPay, PhonePe, Paytm, BHIM) or tap the direct payment link.'
    });
  } catch (err: any) {
    console.error('[API /payment] Error initializing payment:', err);
    return NextResponse.json(
      { error: 'Payment initialization failed. Please try again.' },
      { status: 500 }
    );
  }
}
