import { NextResponse } from 'next/server';
import { db, fallbackStore } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}));
    const caseId = b.caseId ? String(b.caseId).trim() : null;
    const amount = Number(b.amount);
    const planTier = String(b.tier || 'STANDARD');

    if (!Number.isInteger(amount) || amount < 1) {
      return NextResponse.json(
        { error: 'A valid payment amount in INR is required.' },
        { status: 400 }
      );
    }

    const upiId = process.env.NAGRIKONE_UPI_ID || '8208583788@kotak811';
    const supportPhone = process.env.NAGRIKONE_SUPPORT || '+91 8208583788';
    const refId = `N1_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Standard NPCI UPI URI scheme for deep linking into UPI apps (GPay, PhonePe, Paytm, BHIM, Cred)
    const encodedNote = encodeURIComponent(`NagrikOne Case ${caseId || 'Direct'} Ref ${refId}`);
    const upiDeepLink = `upi://pay?pa=${upiId}&pn=NagrikOne&am=${amount}&cu=INR&tn=${encodedNote}`;

    let paymentRecord: any = null;

    try {
      if (db?.payment?.create) {
        paymentRecord = await db.payment.create({
          data: {
            caseId: caseId || undefined,
            amount,
            status: 'PENDING',
            providerRef: refId
          }
        });

        if (caseId && db?.case?.update) {
          await db.case.update({
            where: { id: caseId },
            data: { status: 'VERIFICATION_PENDING' }
          }).catch(() => null);

          await db.statusEvent.create({
            data: {
              caseId,
              status: 'VERIFICATION_PENDING',
              note: `Citizen initiated ${planTier} resolution payment (Ref: ${refId}, Amount: ₹${amount})`
            }
          }).catch(() => null);
        }
      }
    } catch (dbErr) {
      console.warn('[API /payment] Database unavailable, using memory fallback:', dbErr);
    }

    if (!paymentRecord) {
      paymentRecord = {
        id: `pay_${Date.now()}`,
        caseId: caseId || undefined,
        amount,
        status: 'PENDING',
        providerRef: refId,
        createdAt: new Date().toISOString()
      };
      fallbackStore.payments.push(paymentRecord);

      // Update in fallback cases if present
      if (caseId) {
        const foundCase = fallbackStore.cases.find((c: any) => c.id === caseId);
        if (foundCase) {
          foundCase.status = 'VERIFICATION_PENDING';
          foundCase.events = foundCase.events || [];
          foundCase.events.push({
            id: `ev_${Date.now()}`,
            caseId,
            status: 'VERIFICATION_PENDING',
            note: `Citizen initiated ${planTier} resolution payment (Ref: ${refId}, Amount: ₹${amount})`,
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      payment: paymentRecord,
      refId,
      upiId,
      supportPhone,
      amount,
      upiDeepLink,
      qrImageUrl: '/nagrikone-upi-qr.jpg',
      verified: false,
      instructions: 'Scan QR with any UPI app (GPay, PhonePe, Paytm) or tap the direct payment link.'
    });
  } catch (err: any) {
    console.error('[API /payment] Error creating payment:', err);
    return NextResponse.json(
      { error: 'Payment initialization failed. Please try again.' },
      { status: 500 }
    );
  }
}
