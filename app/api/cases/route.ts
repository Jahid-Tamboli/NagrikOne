import { NextResponse } from 'next/server';
import { db, fallbackStore } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { calculateSlaTargetHours } from '@/lib/workflow/sla';

function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `N1-${year}-${rand}`;
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    let cases: any[] = [];

    try {
      if (db?.case?.findMany) {
        if (user && user.role === 'ADMIN') {
          cases = await db.case.findMany({
            include: { events: true, evidenceList: true, payments: true, user: true },
            orderBy: { createdAt: 'desc' }
          });
        } else if (user) {
          cases = await db.case.findMany({
            where: { userId: user.userId },
            include: { events: true, evidenceList: true, payments: true },
            orderBy: { createdAt: 'desc' }
          });
        } else {
          // Public or anonymous only gets empty or demo preview if requested
          cases = [];
        }
      }
    } catch (dbError) {
      console.warn('[API /cases GET] Database query bypassed, using memory store:', dbError);
    }

    if (!cases || cases.length === 0) {
      if (user && user.role === 'ADMIN') {
        cases = fallbackStore.cases || [];
      } else if (user) {
        cases = (fallbackStore.cases || []).filter((c: any) => c.userId === user.userId || !c.userId);
      } else {
        cases = [];
      }
    }

    return NextResponse.json(cases);
  } catch (err: any) {
    console.error('[API /cases GET] Unexpected error:', err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    // Enforce authentication requirement
    if (!user) {
      return NextResponse.json(
        {
          error: 'Before we start, please log in so I can securely save your problem, documents and case status.',
          requireAuth: true
        },
        { status: 401 }
      );
    }

    const b = await req.json().catch(() => ({}));
    const title = String(b.title || 'Citizen Problem Dossier').trim();
    const category = String(b.category || 'Civic & Municipal').trim();
    const priority = String(b.priority || 'MEDIUM').trim();
    const description = String(b.description || '').trim();
    const location = String(b.location || '').trim();
    const problemId = b.problemId ? String(b.problemId) : undefined;
    const isUnknownIssue = Boolean(b.isUnknownIssue);
    const dynamicAnswers = b.dynamicAnswers || {};
    const evidenceFiles = Array.isArray(b.evidence) ? b.evidence : [];

    const caseNumber = generateCaseNumber();
    const slaTargetHours = calculateSlaTargetHours(category, priority);
    const slaDueAt = new Date(Date.now() + slaTargetHours * 60 * 60 * 1000);

    let createdCase: any = null;

    try {
      if (db?.case?.create) {
        createdCase = await db.case.create({
          data: {
            caseNumber,
            title,
            category,
            priority,
            status: 'INTAKE',
            description,
            location,
            userId: user.userId,
            problemId,
            isUnknownIssue,
            dynamicAnswers,
            slaDueAt
          }
        });

        // Record Initial StatusEvent
        await db.statusEvent.create({
          data: {
            caseId: createdCase.id,
            status: 'INTAKE',
            actorType: 'NOVA_AI',
            note: `Case initialized and statutory intake dossier prepared for ${user.name || 'Citizen'}.`
          }
        });

        // Save Evidence records if attached
        if (evidenceFiles.length > 0 && db?.evidence?.create) {
          for (const file of evidenceFiles) {
            await db.evidence.create({
              data: {
                caseId: createdCase.id,
                fileName: file.name || 'evidence.jpg',
                fileUrl: file.previewUrl || file.url || '/uploads/evidence.jpg',
                mimeType: file.type || 'image/jpeg',
                sizeBytes: file.size || 1024,
                ocrExtracted: file.ocrExtracted || undefined,
                verified: true
              }
            });
          }
        }

        // If unknown issue, save metadata
        if (isUnknownIssue && db?.unknownIssue?.create) {
          await db.unknownIssue.create({
            data: {
              caseId: createdCase.id,
              rawDescription: description,
              inferredDomain: b.inferredDomain || 'General Citizen Dispute',
              confidence: b.confidence || 0.5,
              questionsAsked: b.questionsAsked || [],
              suggestedRoute: 'Manual Ops Review'
            }
          });
        }
      }
    } catch (dbErr) {
      console.warn('[API /cases POST] DB save error, fallback to in-memory store:', dbErr);
    }

    if (!createdCase) {
      const generatedId = `case_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      createdCase = {
        id: generatedId,
        caseNumber,
        title,
        category,
        priority,
        status: 'INTAKE',
        description,
        location,
        userId: user.userId,
        problemId,
        isUnknownIssue,
        dynamicAnswers,
        slaDueAt: slaDueAt.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        events: [
          {
            id: `ev_${Date.now()}`,
            caseId: generatedId,
            status: 'INTAKE',
            actorType: 'NOVA_AI',
            note: `Case initialized and statutory intake dossier prepared for ${user.name || 'Citizen'}.`,
            createdAt: new Date().toISOString()
          }
        ],
        evidenceList: evidenceFiles.map((f: any, i: number) => ({
          id: `evi_${Date.now()}_${i}`,
          caseId: generatedId,
          fileName: f.name || 'evidence.jpg',
          fileUrl: f.previewUrl || f.url || '/uploads/evidence.jpg',
          mimeType: f.type || 'image/jpeg',
          sizeBytes: f.size || 1024,
          ocrExtracted: f.ocrExtracted,
          verified: true,
          createdAt: new Date().toISOString()
        })),
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
