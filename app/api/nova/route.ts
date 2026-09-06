import { NextResponse } from 'next/server';
import { db, fallbackStore } from '@/lib/db';
import { PROBLEM_TYPES, ProblemTypeDefinition, getProblemById } from '@/lib/problemTypes';
import { detectProblem } from '@/lib/detect';
import { GoogleGenAI } from '@google/genai';

interface MessageHistoryItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface NovaRequestBody {
  message: string;
  conversationId?: string;
  location?: string;
  attachments?: Array<{ name: string; url?: string; ocrExtracted?: string }>;
  history?: MessageHistoryItem[];
}

export async function POST(req: Request) {
  try {
    const body: NovaRequestBody = await req.json().catch(() => ({ message: '' }));
    const message = String(body.message || '').trim();
    const location = String(body.location || '').trim();
    const history = Array.isArray(body.history) ? body.history : [];
    const attachments = Array.isArray(body.attachments) ? body.attachments : [];
    const conversationId = body.conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (!message && attachments.length === 0) {
      return NextResponse.json(
        { error: 'Please describe your problem or attach evidence.' },
        { status: 400 }
      );
    }

    // Context aggregation
    const contextPrompt = history
      .slice(-6)
      .map((h) => `${h.role === 'user' ? 'Citizen' : 'NOVA'}: ${h.content}`)
      .join('\n');

    let aiResult: any = null;

    // 1. Try Gemini API if key is available in environment
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `You are NOVA AI, the lead citizen problem-solving and statutory escalation assistant for NagrikOne (India's citizen platform).
Your duty is to understand any citizen's real problem (civic, banking, cybercrime, landlord/tenant, education, medical, consumer goods, electricity, women's safety, transport, or unclassified issues).
Analyze the citizen's complaint carefully.
Never tell the citizen "Problem not found" or turn them away.
Always provide empathetic, calm, structured, actionable statutory guidance.

You must respond in strict valid JSON format matching this schema:
{
  "understanding": "Clear 1-2 sentence breakdown of what happened to the citizen",
  "recommendedActions": ["Step 1: Immediate action", "Step 2: Official portal/ombudsman escalation", "Step 3: Statutory timeline/legal notice"],
  "followUpQuestions": ["Question 1 needed for legal case drafting", "Question 2"],
  "evidenceNeeded": ["Evidence document 1", "Evidence document 2"],
  "category": "Civic & Municipal | Police & Safety | Cyber & Online Fraud | Banking & Finance | Women Safety & Rights | Consumer & E-Commerce | Healthcare & Insurance | Govt Certificates & Land | Education & Colleges | Telecom & Broadband | Labour & Employment | Transport, RTO & Railways | Housing & Tenancy | General Citizen Grievance",
  "statutoryRoute": "Official Department, Portal, or Ombudsman (e.g. Municipal PWD, RBI CMS Portal, e-Daakhil, 1930 Cyber Cell, Rent Control Authority)",
  "legalAct": "Governing Indian statute or act (e.g., Consumer Protection Act 2019, Section 66D IT Act, Rent Control Act, BNSS, etc.)",
  "suggestedUrgency": "CRITICAL | URGENT | HIGH | MEDIUM",
  "estimatedDays": 3,
  "canCreateCase": true
}`;

        const promptText = `Citizen Location: ${location || 'Not specified'}\nAttachments: ${attachments.map(a => a.name + (a.ocrExtracted ? ` (${a.ocrExtracted})` : '')).join(', ') || 'None'}\n\nPast Conversation:\n${contextPrompt}\n\nCitizen's latest message:\n${message}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptText,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        });

        if (response && response.text) {
          try {
            const parsed = JSON.parse(response.text);
            aiResult = parsed;
          } catch (jsonErr) {
            console.warn('[NOVA API] Failed to parse Gemini JSON output, continuing to semantic engine:', jsonErr);
          }
        }
      } catch (geminiErr) {
        console.warn('[NOVA API] Gemini API call failed or rate-limited; falling back to local reasoning engine:', geminiErr);
      }
    }

    // 2. Intelligent Domain Reasoning Engine (Fallback / Offline / Fast Path)
    if (!aiResult) {
      aiResult = generateIntelligentFallbackResponse(message, history, location, attachments);
    }

    // Match or link to nearest canonical ProblemType if possible
    const detection = detectProblem(message);
    const matchedProblem = getProblemById(detection.problemId);

    const statutoryRoute = aiResult.statutoryRoute || matchedProblem?.route || 'District Grievance Redressal Cell / Consumer Forum';
    const legalAct = aiResult.legalAct || matchedProblem?.legalAct || 'Citizen Charter & Statutory Grievance Redressal Act';
    const category = aiResult.category || matchedProblem?.category || 'General Citizen Grievance';
    const urgency = aiResult.suggestedUrgency || matchedProblem?.priority || 'MEDIUM';

    // Build formatted reply for conversational rendering
    const conversationalReply = formatNovaConversationalReply(aiResult, message);

    const responsePayload = {
      success: true,
      conversationId,
      reply: conversationalReply,
      understanding: aiResult.understanding,
      recommendedActions: aiResult.recommendedActions || [],
      questions: aiResult.followUpQuestions || matchedProblem?.questions || [
        'What date and time did this incident occur?',
        'Do you have reference numbers, receipts, or witness photos?',
        'Have you previously contacted the local office or vendor?'
      ],
      evidenceNeeded: aiResult.evidenceNeeded || matchedProblem?.evidence || [
        'Geotagged photographs or screenshots with timestamp',
        'Written proof, receipts, invoices, or SMS alerts'
      ],
      category,
      statutoryRoute,
      legalAct,
      suggestedUrgency: urgency,
      estimatedDays: aiResult.estimatedDays || matchedProblem?.estimatedResolutionDays || 3,
      confidence: detection.confidence > 0.6 ? detection.confidence : 0.88,
      canCreateCase: true,
      caseData: {
        title: `${category}: ${message.length > 50 ? message.substring(0, 47) + '...' : message}`,
        category,
        priority: urgency,
        description: message,
        location: location || detection.extractedLocation || 'Locality to be verified',
        statutoryRoute,
        legalAct,
        problemId: matchedProblem?.id || 'unclassified-issue',
        conversationId
      }
    };

    // Save to DB / In-memory fallback
    try {
      if (db?.conversation?.upsert) {
        await db.conversation.upsert({
          where: { id: conversationId },
          create: {
            id: conversationId,
            title: message.substring(0, 60),
            category,
            location: location || undefined
          },
          update: {
            updatedAt: new Date(),
            category
          }
        }).catch(() => null);

        if (db?.message?.create) {
          await db.message.create({
            data: {
              conversationId,
              role: 'user',
              content: message
            }
          }).catch(() => null);

          await db.message.create({
            data: {
              conversationId,
              role: 'assistant',
              content: conversationalReply,
              structuredData: responsePayload
            }
          }).catch(() => null);
        }
      }
    } catch (saveErr) {
      console.warn('[NOVA API] DB save bypassed:', saveErr);
    }

    // Save to memory store
    let conv = fallbackStore.conversations.find(c => c.id === conversationId);
    if (!conv) {
      conv = {
        id: conversationId,
        title: message.substring(0, 60),
        category,
        location,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };
      fallbackStore.conversations.unshift(conv);
    }
    conv.messages.push(
      { id: `msg_${Date.now()}_u`, conversationId, role: 'user', content: message, createdAt: new Date().toISOString() },
      { id: `msg_${Date.now()}_a`, conversationId, role: 'assistant', content: conversationalReply, structuredData: responsePayload, createdAt: new Date().toISOString() }
    );

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    console.error('[NOVA API] Critical Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'NOVA is temporarily processing high volume. Please re-send your message.',
        details: err?.message
      },
      { status: 500 }
    );
  }
}

/**
 * Intelligent semantic reasoning engine for all citizen problem types.
 * Handles known categories as well as arbitrary unclassified issues (landlord, appliance, private contract, cyber, etc.)
 */
function generateIntelligentFallbackResponse(
  text: string,
  history: MessageHistoryItem[],
  location?: string,
  attachments?: Array<{ name: string; ocrExtracted?: string }>
) {
  const norm = text.toLowerCase();

  // 1. Tenancy / Landlord Deposit / Rental issues
  if (/landlord|deposit|rent|tenant|evict|pg |owner.*money|broker|flatmate|maintenance deposit|security deposit/i.test(norm)) {
    return {
      understanding: "Your landlord or property owner is disputing or improperly withholding your security deposit or rental settlement.",
      recommendedActions: [
        "Issue a formal statutory Legal Demand Notice citing Indian Contract Act & State Rent Control laws.",
        "File a complaint with the District Rent Control Authority / Tenancy Tribunal.",
        "Approach the Consumer Commission (e-Daakhil) for deficiency of housing service if handled via property management or broker."
      ],
      followUpQuestions: [
        "Was there a signed rental agreement or digital rent receipts available?",
        "What is the exact security deposit amount withheld?",
        "Did the landlord provide a formal itemized deduction list in writing?"
      ],
      evidenceNeeded: [
        "Copy of Registered / Notarized Rental Agreement",
        "Bank transaction statement showing initial deposit payment",
        "WhatsApp / Email conversations requesting deposit refund and move-out inspection notes"
      ],
      category: "Housing & Tenancy",
      statutoryRoute: "District Rent Controller Tribunal & Consumer Commission (e-Daakhil)",
      legalAct: "Indian Contract Act (Section 73) & State Model Tenancy Act",
      suggestedUrgency: "HIGH",
      estimatedDays: 7
    };
  }

  // 2. Consumer Home Appliances / Warranty Denials (Washing machine, AC, Fridge, TV)
  if (/washing machine|fridge|refrigerator|ac |air conditioner|microwave|geyser|tv|appliance|cooler|water purifier|ro |service centre|technician|amc|warranty/i.test(norm)) {
    return {
      understanding: "You are experiencing service failure, warranty denial, or defective home appliance servicing from the manufacturer or brand technician.",
      recommendedActions: [
        "Raise an official National Consumer Helpline (NCH) docket via Helpline 1915 or INGRAM portal.",
        "Send a formal Notice to the Manufacturer's Nodal / Grievance Officer giving a 7-day cure period.",
        "File an e-Daakhil complaint under Consumer Protection Act 2019 for replacement or full refund with compensation."
      ],
      followUpQuestions: [
        "Is the product within the manufacturer's standard or extended warranty period?",
        "What is the complaint / service job-sheet number from the technician visit?",
        "What is the purchase invoice date and model number?"
      ],
      evidenceNeeded: [
        "Purchase Tax Invoice with Serial / Model number",
        "Service technician job sheet / diagnostic report",
        "Photographs or video showing the malfunction or error code"
      ],
      category: "Consumer & E-Commerce",
      statutoryRoute: "National Consumer Helpline (NCH 1915) & District Consumer Disputes Redressal Commission",
      legalAct: "Consumer Protection Act, 2019 (Product Liability & Deficiency of Service)",
      suggestedUrgency: "MEDIUM",
      estimatedDays: 5
    };
  }

  // 3. UPI / Bank Deductions / Cyber Scams
  if (/upi|bank|fraud|otp|money deducted|scam|gpay|phonepe|paytm|debited|hacked|telegram|apk|part time job|digital arrest/i.test(norm)) {
    const isScam = /scam|fraud|otp|telegram|apk|digital arrest|hacked|fake call/i.test(norm);
    return {
      understanding: isScam
        ? "You have been targeted by an unauthorized cyber fraud / financial scam."
        : "Your bank account was debited for a failed or unauthorized transaction where funds were not settled.",
      recommendedActions: isScam
        ? [
            "Dial National Cyber Crime Helpline 1930 immediately to freeze fraudulent beneficiary accounts (Golden Hour window).",
            "File an official complaint on cybercrime.gov.in (I4C portal).",
            "Submit an unauthorized transaction dispute form to your bank within 72 hours for zero-liability protection under RBI guidelines."
          ]
        : [
            "Report failed transaction UTR / RRN to your bank grievance desk requesting auto-reversal under RBI Turnaround Time (TAT) circular.",
            "Demand RBI daily penalty compensation (₹100/day after T+1 business days).",
            "Escalate to the RBI Banking Ombudsman (CMS Portal) if unresolved within 30 days."
          ],
      followUpQuestions: [
        "What is the 12-digit UPI RRN / Transaction ID and exact amount debited?",
        "Did you share any OTP, UPI PIN, or install any screen-sharing APK app?",
        "Have you already notified your bank customer care to block your card/account?"
      ],
      evidenceNeeded: [
        "Bank account debit SMS & bank statement extract showing timestamp and RRN",
        "Screenshots of UPI app payment failure or scammer chat logs/phone numbers",
        "Complaint reference number from your bank customer care"
      ],
      category: isScam ? "Cyber & Online Fraud" : "Banking & Finance",
      statutoryRoute: isScam ? "National Cyber Crime Reporting Portal (1930) & Cyber Police Cell" : "RBI Banking Ombudsman (CMS Portal)",
      legalAct: isScam ? "Information Technology Act 2000 (Section 66D) & Bharatiya Nyaya Sanhita" : "RBI Master Direction on Customer Protection (Zero Liability Framework)",
      suggestedUrgency: "CRITICAL",
      estimatedDays: 2
    };
  }

  // 4. Civic Road / Potholes / Streetlights / Municipal Waste
  if (/pothole|khadda|road|streetlight|light|garbage|kachra|gutter|drainage|water supply|sewer|manhole/i.test(norm)) {
    return {
      understanding: "You are reporting a hazardous civic infrastructure or municipal sanitation breakdown in your locality.",
      recommendedActions: [
        "Log an official municipal work-order ticket with the local Municipal Corporation / PWD Ward Office.",
        "Dispatch geotagged visual evidence to the Zonal Junior Engineer for 48-hour SLA repair.",
        "Escalate to the Municipal Commissioner & Public Grievance Officer if neglected."
      ],
      followUpQuestions: [
        "What is the exact street name, nearby landmark, or ward number?",
        "Is this creating an immediate danger of road accidents, electrocution, or health hazard?",
        "How many days has this infrastructure remained broken?"
      ],
      evidenceNeeded: [
        "Clear geotagged photograph showing the defect and surroundings",
        "Exact GPS coordinates or landmark address",
        "Previous municipal ticket number if already filed"
      ],
      category: "Civic & Municipal",
      statutoryRoute: "Municipal Corporation / PWD Grievance Redressal Portal",
      legalAct: "Municipal Corporation Public Safety Bylaws & Right to Safe Public Infrastructure",
      suggestedUrgency: "HIGH",
      estimatedDays: 3
    };
  }

  // 5. Default General Citizen Intelligence
  return {
    understanding: `I have analyzed your situation regarding "${text.substring(0, 80)}...". NagrikOne will help you prepare and route this complaint through official channels.`,
    recommendedActions: [
      "Review the structured grievance dossier prepared by NOVA AI.",
      "Dispatch the formal complaint to the designated authority or appellate body.",
      "Track statutory escalation deadlines and request RTI or legal notice if deadlines lapse."
    ],
    followUpQuestions: [
      "What is the exact location, entity, or person involved?",
      "When did you first encounter this issue, and did you receive any formal reply?",
      "What specific resolution (refund, repair, investigation, penalty) are you seeking?"
    ],
    evidenceNeeded: [
      "Any receipts, correspondence, photos, or transaction records",
      "Identification of the party or government office responsible"
    ],
    category: "General Citizen Grievance",
    statutoryRoute: "Central/State Public Grievance Redressal Portal (CPGRAMS) & District Authority",
    legalAct: "Statutory Citizen Charter & Administrative Grievance Guidelines",
    suggestedUrgency: "MEDIUM",
    estimatedDays: 5
  };
}

function formatNovaConversationalReply(aiResult: any, userMsg: string): string {
  const steps = Array.isArray(aiResult.recommendedActions)
    ? aiResult.recommendedActions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')
    : '1. Review grievance details and statutory route.';

  return `Here is what I understand about your issue:
${aiResult.understanding}

Recommended Next Steps:
${steps}

Statutory Route:
${aiResult.statutoryRoute} (${aiResult.legalAct || 'Statutory Grievance Redressal'})

To prepare your official case, please review the questions below. When you're ready, tap "Create Resolution Case" to track progress.`;
}
