import { NextResponse } from 'next/server';
import { db, fallbackStore } from '@/lib/db';

export async function GET() {
  try {
    let cases: any[] = [];
    try {
      if (db?.case?.findMany) {
        cases = await db.case.findMany({
          include: { events: true, payments: true },
          orderBy: { createdAt: 'desc' }
        });
      }
    } catch (dbError) {
      console.warn('[API /cases GET] Database unavailable, returning fallback cases:', dbError);
    }

    if (!cases || cases.length === 0) {
      cases = fallbackStore.cases || [];
    }

    return NextResponse.json(cases);
  } catch (err: any) {
    console.error('[API /cases GET] Unexpected error:', err);
    return NextResponse.json(fallbackStore.cases || [], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}));
    const title = String(b.title || 'Citizen issue').trim();
    const category = String(b.category || 'General').trim();
    const priority = String(b.priority || 'MEDIUM').trim();
    const description = String(b.description || '').trim();
    const location = String(b.location || '').trim();
    const problemId = b.problemId ? String(b.problemId) : undefined;

    let createdCase: any = null;

    try {
      if (db?.case?.create) {
        createdCase = await db.case.create({
          data: {
            title,
            category,
            priority,
            status: 'DRAFT',
            description,
            location,
            problemId
          }
        });

        try {
          await db.statusEvent.create({
            data: {
              caseId: createdCase.id,
              status: 'DRAFT',
              note: 'Resolution draft created by citizen'
            }
          });
        } catch (evErr) {
          console.warn('[API /cases] Could not create status event:', evErr);
        }
      }
    } catch (dbErr) {
      console.warn('[API /cases POST] Database unavailable, saving to in-memory store:', dbErr);
    }

    // Fallback if DB save did not complete
    if (!createdCase) {
      const generatedId = `case_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      createdCase = {
        id: generatedId,
        title,
        category,
        priority,
        status: 'DRAFT',
        description,
        location,
        problemId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        events: [
          {
            id: `ev_${Date.now()}`,
            caseId: generatedId,
            status: 'DRAFT',
            note: 'Resolution draft created by citizen',
            createdAt: new Date().toISOString()
          }
        ],
        payments: []
      };
      fallbackStore.cases.unshift(createdCase);
    }

    return NextResponse.json(createdCase, { status: 201 });
  } catch (err: any) {
    console.error('[API /cases POST] Error creating case:', err);
    return NextResponse.json(
      { error: 'Failed to create case. Please verify details and try again.' },
      { status: 500 }
    );
  }
}
