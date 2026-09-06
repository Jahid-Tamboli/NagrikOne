import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { classifyCitizenIssue } from '@/lib/nova/classifier';
import { getDynamicQuestions } from '@/lib/nova/question-engine';
import { evaluateCaseSla } from '@/lib/workflow/sla';

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

    // 1. Natural Language Classification
    const classification = classifyCitizenIssue(text, customLocation);

    // 2. Dynamic Questions Sequence
    const dynamicQuestions = getDynamicQuestions(classification.problemId, text);

    // 3. Calculated SLA Metrics
    const slaAssessment = evaluateCaseSla(new Date(), classification.suggestedUrgency, classification.problem.category, 'DRAFT');

    const resolvedLocation = customLocation || classification.extractedLocation || 'Location details required';

    return NextResponse.json({
      success: true,
      problem: classification.problem,
      classification: {
        confidence: classification.confidence,
        matchedKeywords: classification.matchedKeywords,
        suggestedUrgency: classification.suggestedUrgency,
        isUnknown: classification.isUnknown,
        inferredDomain: classification.inferredDomain,
        reasoning: classification.reasoning
      },
      dynamicQuestions,
      sla: slaAssessment,
      location: resolvedLocation,
      guidelines: classification.problem.guidelines,
      verified: false,
      readyForRouting: true
    });
  } catch (err: any) {
    console.error('[API /route] Error handling natural language triage:', err);
    return NextResponse.json(
      { error: 'An error occurred while analyzing the issue. Please try again.' },
      { status: 500 }
    );
  }
}
