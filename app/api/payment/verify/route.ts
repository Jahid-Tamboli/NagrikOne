import { NextResponse } from 'next/server';
import { db, fallbackStore } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { logAuditEvent } from '@/lib/audit/logger';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json().catch(() => ({}));
    const refId = String(body.refId || '').trim();
    const upiRrn = body.upiRrn ? String(body.upiRrn).trim() : undefined;

    if (!refId) {
      return NextResponse.json(
        { error: 'Transaction reference ID is required for verification.' },
        { status: 400 }
      );
    }

    let paymentRecord: any = null;

    try {
      if (db?.payment?.findUnique) {
        paymentRecord = await db.payment.findUnique({
          where: { providerRef: refId }
        });
      }
    } catch (err) {
      console.warn('[API /payment/verify] DB lookup error:', err);
    }

    if (!paymentRecord) {
      paymentRecord = fallbackStore.payments.find((p: any) => p.providerRef === refId);
    }

    if (!paymentRecord) {
      return NextResponse.json(
        { error: 'Payment record not found. Please initiate payment first.' },
        { status: 404 }
      );
    }

    // In a production setup with a payment gateway webhook (Razorpay/Cashfree/UPI Webhook),
    // the webhook verifies bank confirmation. Here we record the verified transaction and update status.
    const isVerified = Boolean(upiRrn && upiRrn.length >= 10) || process.env.AUTO_VERIFY_PAYMENTS === 'true';

    if (isVerified) {
      try {
        if (db?.payment?.update) {
          await db.payment.update({
            where: { id: paymentRecord.id },
            data: {
              status: 'VERIFIED',
              upiRrn: upiRrn || undefined
            }
          });

          if (paymentRecord.caseId && db?.case?.update) {
            await db.case.update({
              where: { id: paymentRecord.caseId },
              data: { status: 'VERIFIED' }
            });

            await db.statusEvent.create({
              data: {
                caseId: paymentRecord.caseId,
                status: 'VERIFIED',
                actorType: 'WORKFLOW_ENGINE',
                note: `Resolution Pass confirmed (Ref: ${refId}, Tier: ${paymentRecord.tier}, Amount: ₹${paymentRecord.amount}).`
              }
            });
          }

          await logAuditEvent({
            actorId: user?.userId,
            actorRole: user?.role === 'ADMIN' ? 'ADMIN' : 'CITIZEN',
            action: 'PAYMENT_VERIFIED',
            entityType: 'Payment',
            entityId: paymentRecord.id,
            newState: { status: 'VERIFIED', refId, upiRrn }
          });
        }
      } catch (e) {
        console.warn('[API /payment/verify] DB update error:', e);
      }

      paymentRecord.status = 'VERIFIED';
      paymentRecord.upiRrn = upiRrn;

      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Payment verified and Resolution Pass activated successfully.',
        payment: {
          refId,
          amount: paymentRecord.amount,
          tier: paymentRecord.tier,
          caseId: paymentRecord.caseId,
          verifiedAt: new Date().toISOString()
        }
      });
    }

    // If UTR was not provided or bank verification is pending
    return NextResponse.json({
      success: false,
      verified: false,
      message: 'Payment confirmation is awaiting bank network settlement. Please enter your 12-digit UPI RRN / UTR number to speed up verification.',
      refId
    });
  } catch (err: any) {
    console.error('[API /payment/verify] Verification error:', err);
    return NextResponse.json(
      { error: 'Payment verification failed. Please check details and try again.' },
      { status: 500 }
    );
  }
}
