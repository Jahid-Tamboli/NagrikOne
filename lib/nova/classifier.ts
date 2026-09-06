import { PROBLEM_TYPES, ProblemTypeDefinition, getProblemById } from '@/lib/problemTypes';

export interface NovaClassificationResult {
  problemId: string;
  problem: ProblemTypeDefinition;
  confidence: number;
  matchedKeywords: string[];
  suggestedUrgency: 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM';
  extractedLocation?: string;
  isUnknown: boolean;
  inferredDomain?: string;
  reasoning: string;
}

interface DomainRule {
  domainId: string;
  primaryCategory: string;
  keywords: RegExp;
  weight: number;
  urgency: 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM';
}

const DOMAIN_RULES: DomainRule[] = [
  // Cyber & Online Financial Fraud (Immediate Financial / Safety Danger)
  {
    domainId: 'cyber-digital-arrest',
    primaryCategory: 'Cyber & Online Fraud',
    keywords: /\b(digital arrest|skype call police|fake cbi|customs parcel|video call extortion|police uniform call|arrest warrant on whatsapp|duress transfer)\b/i,
    weight: 1.0,
    urgency: 'CRITICAL'
  },
  {
    domainId: 'cyber-apk-loan-extortion',
    primaryCategory: 'Cyber & Online Fraud',
    keywords: /\b(loan app|apk|morphed photo|nude morph|contact list harassment|7 day loan|chinese loan app|blackmail gallery)\b/i,
    weight: 0.98,
    urgency: 'CRITICAL'
  },
  {
    domainId: 'cyber-part-time-job',
    primaryCategory: 'Cyber & Online Fraud',
    keywords: /\b(telegram task|youtube like|prepaid task|part time job scam|crypto task|daily earning group|recharge scam)\b/i,
    weight: 0.95,
    urgency: 'URGENT'
  },
  {
    domainId: 'cyber-otp-phishing',
    primaryCategory: 'Cyber & Online Fraud',
    keywords: /\b(otp fraud|sim swap|phishing link|electricity bill cut sms|pan update link|netbanking hacked|credit card empty|account debited automatically)\b/i,
    weight: 0.95,
    urgency: 'CRITICAL'
  },
  // Banking & UPI Transactions
  {
    domainId: 'bank-upi-failed-debit',
    primaryCategory: 'Banking & Finance',
    keywords: /\b(upi|gpay|phonepe|paytm|bhim|rrn|utr|failed transaction|debited not credited|pending payment|paisa kat gaya merchant ko nahi mila|chargeback)\b/i,
    weight: 0.92,
    urgency: 'HIGH'
  },
  {
    domainId: 'bank-atm-cash-not-dispensed',
    primaryCategory: 'Banking & Finance',
    keywords: /\b(atm cash not dispensed|atm machine error|cash stuck in atm|atm debit|atm slip)\b/i,
    weight: 0.92,
    urgency: 'HIGH'
  },
  {
    domainId: 'bank-recovery-harassment',
    primaryCategory: 'Banking & Finance',
    keywords: /\b(recovery agent|loan collection|abusive calls|calling relatives|agent threatening|rbi recovery code|unauthorized collection)\b/i,
    weight: 0.95,
    urgency: 'CRITICAL'
  },
  // Police & Women Safety
  {
    domainId: 'police-fir-refusal',
    primaryCategory: 'Police & Safety',
    keywords: /\b(fir refused|police not taking complaint|sho refused|thana nahi le raha|zero fir|police inaction)\b/i,
    weight: 0.96,
    urgency: 'CRITICAL'
  },
  {
    domainId: 'women-workplace-posh',
    primaryCategory: 'Women Safety & Rights',
    keywords: /\b(posh|sexual harassment|workplace harassment|office misconduct|inappropriate behavior boss|icc complaint)\b/i,
    weight: 0.96,
    urgency: 'CRITICAL'
  },
  // Civic & Municipal
  {
    domainId: 'civic-pothole',
    primaryCategory: 'Civic & Municipal',
    keywords: /\b(pothole|potholes|khadda|khadde|road damage|broken road|sadak toot gayi|crater|open manhole|divider broken)\b/i,
    weight: 0.9,
    urgency: 'HIGH'
  },
  {
    domainId: 'civic-streetlight',
    primaryCategory: 'Civic & Municipal',
    keywords: /\b(street light|streetlight|street lamp|light band|andhera|dark spot|electric pole light|batti nahi jal rahi)\b/i,
    weight: 0.9,
    urgency: 'MEDIUM'
  },
  {
    domainId: 'civic-garbage',
    primaryCategory: 'Civic & Municipal',
    keywords: /\b(garbage|kachra|kachre|waste dump|overflowing dustbin|smell|safai|drainage blocked|naali overflow|gutter)\b/i,
    weight: 0.9,
    urgency: 'HIGH'
  },
  {
    domainId: 'civic-water-supply',
    primaryCategory: 'Civic & Municipal',
    keywords: /\b(water supply|dirty water|contaminated water|paani nahi aa raha|muddy water|jal board|pipeline leakage)\b/i,
    weight: 0.9,
    urgency: 'HIGH'
  },
  // Consumer & E-Commerce
  {
    domainId: 'consumer-refund-denial',
    primaryCategory: 'Consumer & E-Commerce',
    keywords: /\b(refund stuck|return picked up no refund|amazon refund|flipkart return|defective product|replacement denied|consumer court)\b/i,
    weight: 0.88,
    urgency: 'HIGH'
  },
  // Tenant & Landlord Dispute
  {
    domainId: 'police-tenant-landlord-extortion',
    primaryCategory: 'Police & Safety',
    keywords: /\b(landlord|deposit not returned|rent deposit|security deposit|illegal eviction|cut electricity tenant|kirayedar|makan malik)\b/i,
    weight: 0.9,
    urgency: 'MEDIUM'
  },
  // Government Certificates & Documents
  {
    domainId: 'govt-certificate',
    primaryCategory: 'Govt Certificates & Land',
    keywords: /\b(aadhaar correction|pan card stuck|passport delay|ration card|caste certificate|income certificate|sarkari portal error)\b/i,
    weight: 0.88,
    urgency: 'MEDIUM'
  },
  // Telecom & Broadband
  {
    domainId: 'telecom-network',
    primaryCategory: 'Telecom & Broadband',
    keywords: /\b(broadband down|wifi not working|fiber cut|sim no signal|call drop|slow internet|jio fiber|airtel xstream)\b/i,
    weight: 0.88,
    urgency: 'MEDIUM'
  }
];

/**
 * Classifies citizen's raw natural language problem description.
 */
export function classifyCitizenIssue(text: string, customLocation?: string): NovaClassificationResult {
  const normalized = text.toLowerCase().trim();
  const matchedKeywords: string[] = [];
  let bestDomainId: string | null = null;
  let highestScore = 0;
  let detectedUrgency: 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM' = 'MEDIUM';

  for (const rule of DOMAIN_RULES) {
    const match = normalized.match(rule.keywords);
    if (match) {
      matchedKeywords.push(match[0]);
      if (rule.weight > highestScore) {
        highestScore = rule.weight;
        bestDomainId = rule.domainId;
        detectedUrgency = rule.urgency;
      }
    }
  }

  // Location extraction heuristic
  let extractedLocation: string | undefined = customLocation;
  if (!extractedLocation) {
    const locMatch = text.match(/(?:at|in|near|near to|behind|opposite|mein|ke paas|chowk|road|street|nagar|colony|sector|ward|society)\s+([A-Za-z0-9\s,\.-]{3,40})/i);
    if (locMatch && locMatch[1]) {
      extractedLocation = locMatch[1].trim();
    }
  }

  // Check for critical urgency triggers in tone
  const isEmergency = /\b(emergency|urgent|critical|turant|threat|violence|beating|danger|suicide|immediate help)\b/i.test(normalized);
  if (isEmergency) {
    detectedUrgency = 'CRITICAL';
  }

  // If a known domain was matched with solid confidence
  if (bestDomainId && highestScore >= 0.7) {
    const problem = getProblemById(bestDomainId) || PROBLEM_TYPES[0];
    const confidence = Math.min(0.98, highestScore + (matchedKeywords.length * 0.03));

    return {
      problemId: problem.id,
      problem,
      confidence,
      matchedKeywords,
      suggestedUrgency: isEmergency ? 'CRITICAL' : detectedUrgency,
      extractedLocation,
      isUnknown: false,
      reasoning: `Matched statutory catalog route "${problem.name}" based on key signals: ${matchedKeywords.join(', ')}.`
    };
  }

  // UNKNOWN PROBLEM HANDLING:
  // When an issue doesn't fit standard catalog, we construct a structured Unclassified Problem
  // without hallucinating fake government departments or rejecting the citizen.
  const unknownProblem: ProblemTypeDefinition = {
    id: `unclassified_${Date.now()}`,
    name: 'Unclassified Citizen Issue',
    category: 'Civic & Municipal',
    route: 'NagrikOne Guided Citizen Dossier Preparation & Statutory Review',
    priority: detectedUrgency,
    estimatedResolutionDays: 5,
    legalAct: 'Article 21 (Right to Speedy Redressal) & Relevant Sectoral Consumer/Administrative Bylaws',
    escalationLevel: 'L1: NagrikOne Case Officer Review -> L2: Sectoral Nodal Agency Guidance',
    tags: ['unclassified', 'custom issue', 'advisory needed'],
    questions: [
      'What specific outcome or relief are you seeking?',
      'Have you already contacted any company, landlord, or authority regarding this?',
      'When did this problem first start occurring?'
    ],
    evidence: [
      'Any receipts, written agreements, emails, or chat screenshots',
      'Proof of identity or reference numbers',
      'Relevant photos or documents showing the issue'
    ],
    guidelines: 'Your case will be organized into a structured statutory dossier. Our system will help you identify the legally appropriate grievance pathway.'
  };

  return {
    problemId: unknownProblem.id,
    problem: unknownProblem,
    confidence: 0.5,
    matchedKeywords: [],
    suggestedUrgency: detectedUrgency,
    extractedLocation,
    isUnknown: true,
    inferredDomain: 'Unclassified / General Citizen Dispute',
    reasoning: 'The issue requires tailored follow-up to identify the exact administrative or consumer jurisdiction.'
  };
}
