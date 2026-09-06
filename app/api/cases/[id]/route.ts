import { NextResponse } from 'next/server';
import { db, fallbackStore } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { transitionCaseStatus } from '@/lib/workflow/engine';
import { evaluateCaseSla } from '@/lib/workflow/sla';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    let foundCase: any = null;

    try {
      if (db?.case?.findFirst) {
        foundCase = await db.case.findFirst({
          where: {
            OR: [{ id }, { caseNumber: id }]
          },
          include: {
            events: { orderBy: { createdAt: 'desc' } },
            evidenceList: true,
            payments: true,
            user: { select: { id: true, name: true, phone: true, email: true } },
            problem: true,
            unknownDetails: true
          }
        });
      }
    } catch (err) {
      console.warn('[API /cases/[id]] DB query warning:', err);
    }

    if (!foundCase) {
      foundCase = fallbackStore.cases.find((c: any) => c.id === id || c.caseNumber === id);
    }

    if (!foundCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Authorization check: Citizen can only access own case unless Admin
    if (user && user.role !== 'ADMIN' && foundCase.userId && foundCase.userId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized access to case docket.' }, { status: 403 });
    }

    // Calculate live SLA evaluation
    const sla = evaluateCaseSla(foundCase.createdAt, foundCase.priority, foundCase.category, foundCase.status);

    return NextResponse.json({
      ...foundCase,
      sla
    });
  } catch (err: any) {
    console.error('[API /cases/[id]] Error:', err);
    return NextResponse.json({ error: 'Error loading case details.' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const newStatus = body.status;
    const note = String(body.note || 'Status update').trim();

    if (!newStatus) {
      return NextResponse.json({ error: 'Target status is required.' }, { status: 400 });
    }

    // Role check: Only ADMIN can perform arbitrary transitions; CITIZEN can verify resolution or request review
    const actorType = user.role === 'ADMIN' ? 'ADMIN' : 'CITIZEN';

    const result = await transitionCaseStatus({
      caseId: id,
      toStatus: newStatus,
      actorType,
      actorId: user.userId,
      note,
      metadata: body.metadata || {},
      hasVerifiedExternalDispatch: Boolean(body.hasVerifiedExternalDispatch)
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Transition not allowed.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error('[API /cases/[id] PATCH] Error:', err);
    return NextResponse.json({ error: 'Failed to update case status.' }, { status: 500 });
  }
}
