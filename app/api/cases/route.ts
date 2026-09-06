import { NextResponse } from 'next/server';
import { db, fallbackStore } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    let cases: any[] = [];
    try {
      if (db?.case?.findMany) {
        if (id) {
          const single = await db.case.findUnique({
            where: { id },
            include: { events: true, payments: true }
          });
          if (single) return NextResponse.json(single);
        } else {
          cases = await db.case.findMany({
            include: { events: true, payments: true },
            orderBy: { createdAt: 'desc' }
          });
        }
      }
    } catch (dbError) {
      console.warn('[API /cases GET] Database unavailable, returning fallback cases:', dbError);
    }

    if (!cases || cases.length === 0) {
      if (id) {
        const found = fallbackStore.cases.find((c) => c.id === id);
        return NextResponse.json(found || null);
      }
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
    const title = String(b.title || 'Citizen Grievance Docket').trim();
    const category = String(b.category || 'General Citizen Grievance').trim();
    const priority = String(b.priority || 'MEDIUM').trim();
    const description = String(b.description || '').trim();
    const location = String(b.location || '').trim();
    const statutoryRoute = b.statutoryRoute ? String(b.statutoryRoute).trim() : undefined;
    const suggestedUrgency = b.suggestedUrgency ? String(b.suggestedUrgency).trim() : priority;
    const problemId = b.problemId ? String(b.problemId) : undefined;
    const conversationId = b.conversationId ? String(b.conversationId) : undefined;
    const evidence = b.evidence ? b.evidence : undefined;

    const formattedId = `CASE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    let createdCase: any = null;

    try {
      if (db?.case?.create) {
        createdCase = await db.case.create({
          data: {
            id: formattedId,
            title,
            category,
            priority,
            status: 'DRAFT',
            description,
            location,
            statutoryRoute,
            suggestedUrgency,
            evidence,
            problemId,
            conversationId
          }
        });

        try {
          await db.statusEvent.create({
            data: {
              caseId: createdCase.id,
              status: 'DRAFT',
              note: 'Resolution docket prepared by NOVA AI'
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
      createdCase = {
        id: formattedId,
        title,
        category,
        priority,
        status: 'DRAFT',
        description,
        location,
        statutoryRoute,
        suggestedUrgency,
        evidence,
        problemId,
        conversationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        events: [
          {
            id: `ev_${Date.now()}`,
            caseId: formattedId,
            status: 'DRAFT',
            note: 'Resolution docket prepared by NOVA AI',
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

export async function PATCH(req: Request) {
  try {
    const b = await req.json().catch(() => ({}));
    const id = String(b.id || '').trim();
    const status = String(b.status || '').trim();
    const note = b.note ? String(b.note).trim() : `Status updated to ${status}`;

    if (!id || !status) {
      return NextResponse.json({ error: 'Case ID and status are required.' }, { status: 400 });
    }

    let updatedCase: any = null;

    try {
      if (db?.case?.update) {
        updatedCase = await db.case.update({
          where: { id },
          data: { status, updatedAt: new Date() }
        });

        await db.statusEvent.create({
          data: {
            caseId: id,
            status,
            note
          }
        }).catch(() => null);
      }
    } catch (dbErr) {
      console.warn('[API /cases PATCH] DB update bypassed:', dbErr);
    }

    // Memory fallback update
    const memCase = fallbackStore.cases.find((c) => c.id === id);
    if (memCase) {
      memCase.status = status;
      memCase.updatedAt = new Date().toISOString();
      memCase.events = memCase.events || [];
      memCase.events.push({
        id: `ev_${Date.now()}`,
        caseId: id,
        status,
        note,
        createdAt: new Date().toISOString()
      });
      if (!updatedCase) updatedCase = memCase;
    }

    return NextResponse.json({ success: true, case: updatedCase || { id, status } });
  } catch (err: any) {
    console.error('[API /cases PATCH] Error:', err);
    return NextResponse.json({ error: 'Failed to update case status.' }, { status: 500 });
  }
}

