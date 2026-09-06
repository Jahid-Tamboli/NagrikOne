import { NextResponse } from 'next/server';
import { db, fallbackStore } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

// Server-controlled pricing matrix (Never trust client amount)
export const TIER_PRICING: Record<string, { name: string; amount: number; desc: string }> = {
  STANDARD: {
    name: 'Standard Citizen Filing',
    amount: 49,
    desc: 'Official statutory portal preparation & auto-drafted grievance dossier'
  },
  PRIORITY: {
    name: 'Priority Fast-Track Pass',
    amount: 199,
    desc: 'High-priority SLA monitoring + daily status updates + SMS escalation alerts'
  },
  LEGAL: {
    name: 'Legal Notice & RTI Pass',
    amount: 499,
    desc: 'Formal legal notice drafting with legal citation + RTI First Appeal guide'
  },
  VIP: {
    name: 'VIP / High-Court Advisory',
    amount: 999,
    desc: 'Comprehensive legal concierge with panel advocate guidance'
  }
};

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const b = await req.json().catch(() => ({}));
    const caseId = b.caseId ? String(b.caseId).trim() : null;
    const requestedTier = String(b.tier || 'PRIORITY').toUpperCase();

    const tierInfo = TIER_PRICING[requestedTier] || TIER_PRICING.PRIORITY;
    const amount = tierInfo.amount; // Enforce server-controlled pricing

    const upiId = process.env.NAGRIKONE_UPI_ID || '8208583788@kotak811';
    const supportPhone = process.env.NAGRIKONE_SUPPORT || '+91 8208583788';
    const refId = `N1_TXN_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Standard NPCI UPI URI scheme for deep linking into UPI apps
    const encodedNote = encodeURIComponent(`NagrikOne ${tierInfo.name} Ref ${refId}`);
    const upiDeepLink = `upi://pay?pa=${upiId}&pn=NagrikOne&am=${amount}&cu=INR&tn=${encodedNote}`;

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
      amount,
      tier: tierInfo,
      upiId,
      supportPhone,
      upiDeepLink,
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
