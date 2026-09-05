import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { detectProblem } from '@/lib/detect';
import { getProblemById } from '@/lib/problemTypes';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = String(body.text || '').trim();
    const customLocation = body.location ? String(body.location).trim() : '';

    if (!text) {
      return NextResponse.json(
        { error: 'Please describe the problem to get a resolution route.' },
        { status: 400 }
      );
    }

    const detection = detectProblem(text);
    let problemData: any = null;

    // Try database lookup first if available
    try {
      if (db?.problemType?.findUnique) {
        problemData = await db.problemType.findUnique({
          where: { id: detection.problemId }
        });
      }
    } catch (dbError) {
      console.warn('[API /route] Database lookup bypassed, using canonical catalog:', dbError);
    }

    // Fall back to canonical memory catalog if database has not been seeded
    if (!problemData) {
      problemData = getProblemById(detection.problemId) || detection.problem;
    }

    // Ensure questions and evidence are arrays even if stored as JSON string
    const questions = Array.isArray(problemData.questions)
      ? problemData.questions
      : typeof problemData.questions === 'string'
      ? JSON.parse(problemData.questions)
      : detection.problem.questions;

    const evidence = Array.isArray(problemData.evidence)
      ? problemData.evidence
      : typeof problemData.evidence === 'string'
      ? JSON.parse(problemData.evidence)
      : detection.problem.evidence;

    const resolvedLocation = customLocation || detection.extractedLocation || 'Location required from citizen';

    return NextResponse.json({
      success: true,
      problem: {
        ...problemData,
        questions,
        evidence
      },
      detection: {
        confidence: detection.confidence,
        matchedKeywords: detection.matchedKeywords,
        suggestedUrgency: detection.suggestedUrgency
      },
      location: resolvedLocation,
      verified: false,
      submission: false
    });
  } catch (err: any) {
    console.error('[API /route] Error handling request:', err);
    return NextResponse.json(
      { error: 'An error occurred while analyzing the complaint. Please try again.' },
      { status: 500 }
    );
  }
}
