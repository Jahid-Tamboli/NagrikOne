import { NextResponse } from 'next/server';
import { db, fallbackStore } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 403 });
    }

    let totalUsers = 0;
    let totalCases = 0;
    let openCases = 0;
    let inProgressCases = 0;
    let resolvedCases = 0;
    let escalatedCases = 0;
    let totalRevenue = 0;
    let verifiedPayments = 0;
    let unknownIssuesCount = 0;
    let slaBreaches = 0;

    try {
      if (db?.case?.count) {
        totalCases = await db.case.count();
        totalUsers = await db.user.count();
        openCases = await db.case.count({ where: { status: { in: ['DRAFT', 'INTAKE', 'UNDER_REVIEW', 'INFORMATION_REQUIRED', 'VERIFIED'] } } });
        inProgressCases = await db.case.count({ where: { status: { in: ['IN_PROGRESS', 'READY_FOR_ROUTING', 'READY_FOR_PWD_SUBMISSION', 'READY_FOR_POLICE_SUBMISSION', 'DISPATCHED_TO_PWD', 'DISPATCHED_TO_POLICE'] } } });
        resolvedCases = await db.case.count({ where: { status: { in: ['STATUTORY_RESOLVED', 'CLOSED'] } } });
        escalatedCases = await db.case.count({ where: { status: 'ESCALATED' } });
        unknownIssuesCount = await db.case.count({ where: { isUnknownIssue: true } });

        const revenueSum = await db.payment.aggregate({
          where: { status: 'VERIFIED' },
          _sum: { amount: true }
        });
        totalRevenue = revenueSum._sum.amount || 0;
        verifiedPayments = await db.payment.count({ where: { status: 'VERIFIED' } });

        // Calculate actual SLA breaches
        const now = new Date();
        slaBreaches = await db.case.count({
          where: {
            status: { notIn: ['STATUTORY_RESOLVED', 'CLOSED', 'REJECTED'] },
            slaDueAt: { lt: now }
          }
        });
      }
    } catch (dbErr) {
      console.warn('[Admin Metrics API] DB error, aggregating fallback store:', dbErr);
      const cases = fallbackStore.cases || [];
      totalCases = cases.length;
      totalUsers = 1;
      openCases = cases.filter((c: any) => ['DRAFT', 'INTAKE', 'UNDER_REVIEW', 'VERIFIED'].includes(c.status)).length;
      resolvedCases = cases.filter((c: any) => ['STATUTORY_RESOLVED', 'CLOSED'].includes(c.status)).length;
      escalatedCases = cases.filter((c: any) => c.status === 'ESCALATED').length;
      totalRevenue = (fallbackStore.payments || []).filter((p: any) => p.status === 'VERIFIED').reduce((acc: number, p: any) => acc + p.amount, 0);
      verifiedPayments = (fallbackStore.payments || []).filter((p: any) => p.status === 'VERIFIED').length;
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers,
        totalCases,
        openCases,
        inProgressCases,
        resolvedCases,
        escalatedCases,
        unknownIssuesCount,
        slaBreaches,
        totalRevenue,
        verifiedPayments,
        systemHealth: 'OPERATIONAL',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error('[Admin Metrics API] Error:', err);
    return NextResponse.json({ error: 'Failed to compute admin metrics.' }, { status: 500 });
  }
}
