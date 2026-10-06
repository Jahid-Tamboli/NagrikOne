import { NextResponse } from 'next/server';
import { classifyCitizenIssue } from '@/lib/nova/classifier';
import { getDynamicQuestions } from '@/lib/nova/question-engine';
import { evaluateCaseSla } from '@/lib/workflow/sla';
import { generateNovaSolution } from '@/lib/nova/solutionEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = String(body.text || body.problem || body.message || '').trim();
    const customLocation = body.location ? String(body.location).trim() : '';
    const history = Array.isArray(body.history) ? body.history : [];

    if (!text) {
      return NextResponse.json(
        { error: 'Please describe the problem to get a resolution route.' },
        { status: 400 }
      );
    }

    // 1. Natural Language Classification
    const classification = classifyCitizenIssue(text, customLocation);
    const problem = classification.problem;

    const resolvedLocation = customLocation || classification.extractedLocation || 'Location details required';

    // 2. Comprehensive ChatGPT-Style Solution Generation
    const solution = generateNovaSolution(problem, text, resolvedLocation, history);

    // 3. Dynamic Questions Sequence
    const dynamicQuestions = getDynamicQuestions(classification.problemId, text);

    // 4. Calculated SLA Metrics
    const slaAssessment = evaluateCaseSla(new Date(), classification.suggestedUrgency, problem.category, 'DRAFT');

    const route = {
      targetDepartment: problem.route,
      statutoryFramework: problem.legalAct,
      estimatedSlaDays: problem.estimatedResolutionDays,
      actionPlan:
        problem.guidelines ||
        'Review the required information and prepare the case.',
      nextImmediateStep:
        dynamicQuestions.length > 0
          ? 'Answer the required questions so NOVA can prepare your case.'
          : 'Review the guidance and continue with case preparation.',
      legalNoticeRecommended: Boolean(
        problem.legalAct &&
          /act|law|legal|statutory|consumer|administrative/i.test(
            problem.legalAct
          )
      )
    };

    return NextResponse.json({
      success: true,
      problem,

      classification: {
        confidence: classification.confidence,
        matchedKeywords: classification.matchedKeywords,
        suggestedUrgency: classification.suggestedUrgency,
        isUnknown: classification.isUnknown,
        inferredDomain:
          classification.inferredDomain || problem.category,
        domain:
          classification.inferredDomain || problem.category,
        reasoning: classification.reasoning,
        summary: classification.isUnknown
          ? 'I need a few more details to understand and route this citizen issue.'
          : `I identified this as ${problem.name}.`
      },

      questions: dynamicQuestions,
      dynamicQuestions,

      solution,
      chatResponse: solution.chatResponseText,

      route,

      sla: slaAssessment,
      location: resolvedLocation,
      guidelines: problem.guidelines,

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
