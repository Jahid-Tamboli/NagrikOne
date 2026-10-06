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
    keywords: /\b(refund stuck|return picked up no refund|amazon refund|flipkart return|defective product|replacement denied|consumer court|fake product|warranty denied|overcharging mrp|courier lost)\b/i,
    weight: 0.88,
    urgency: 'HIGH'
  },
  // Tenant & Landlord Dispute
  {
    domainId: 'police-tenant-landlord-extortion',
    primaryCategory: 'Police & Safety',
    keywords: /\b(landlord|deposit not returned|rent deposit|security deposit|illegal eviction|cut electricity tenant|kirayedar|makan malik|flat deposit|landlord extortion)\b/i,
    weight: 0.9,
    urgency: 'MEDIUM'
  },
  // Healthcare & Insurance
  {
    domainId: 'health-cashless-denial',
    primaryCategory: 'Healthcare & Insurance',
    keywords: /\b(cashless denied|tpa rejected|insurance claim rejected|hospital overcharging|mediclaim dispute|medical negligence|icu charges unreasonable)\b/i,
    weight: 0.92,
    urgency: 'HIGH'
  },
  // Labour & Employment
  {
    domainId: 'labour-unpaid-salary',
    primaryCategory: 'Labour & Employment',
    keywords: /\b(unpaid salary|salary delay|salary nahi mili|tankhwah|epfo withdrawal|pf rejected|illegal termination|gratuity unpaid|fnf delayed|full and final settlement)\b/i,
    weight: 0.92,
    urgency: 'HIGH'
  },
  // Education & Degree
  {
    domainId: 'edu-degree-withheld',
    primaryCategory: 'Education & Colleges',
    keywords: /\b(degree withheld|marksheet not given|original documents retained college|capitation fee|illegal fine college|ragging|bonafide denied)\b/i,
    weight: 0.9,
    urgency: 'HIGH'
  },
  // Government Certificates & Land
  {
    domainId: 'govt-aadhaar-update',
    primaryCategory: 'Govt Certificates & Land',
    keywords: /\b(aadhaar correction|aadhaar update|pan card stuck|passport delay|passport police verification|ration card|caste certificate|income certificate|sarkari portal error|land mutation|khata transfer|encumbrance certificate)\b/i,
    weight: 0.88,
    urgency: 'MEDIUM'
  },
  // Telecom & Broadband
  {
    domainId: 'telecom-network',
    primaryCategory: 'Telecom & Broadband',
    keywords: /\b(broadband down|wifi not working|fiber cut|sim no signal|call drop|slow internet|jio fiber|airtel xstream|porting dispute)\b/i,
    weight: 0.88,
    urgency: 'MEDIUM'
  },
  // Transport & RTO
  {
    domainId: 'transport-driving-licence',
    primaryCategory: 'Transport, RTO & Railways',
    keywords: /\b(driving licence|dl test delay|smart card rc|rto agent|fake challan|traffic police bribe|wrong e-challan|railway ticket refund|irctc refund)\b/i,
    weight: 0.88,
    urgency: 'MEDIUM'
  }
];

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'any', 'can', 'her', 'was',
  'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now',
  'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she',
  'too', 'use', 'with', 'from', 'have', 'this', 'that', 'they', 'will', 'what', 'been',
  'there', 'when', 'make', 'more', 'about', 'time', 'some', 'could', 'them', 'other',
  'than', 'then', 'into', 'just', 'come', 'over', 'think', 'also', 'back', 'after',
  'mera', 'meri', 'mere', 'karna', 'karo', 'raha', 'rahi', 'rahe', 'nahi', 'kuch', 'hoga',
  'please', 'help', 'sir', 'madam', 'issue', 'problem', 'facing', 'complaint'
]);

/**
 * Classifies citizen's raw natural language problem description.
 */
export function classifyCitizenIssue(text: string, customLocation?: string): NovaClassificationResult {
  const normalized = text.toLowerCase().trim();
  const matchedKeywords: string[] = [];
  let bestDomainId: string | null = null;
  let highestScore = 0;
  let detectedUrgency: 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM' = 'MEDIUM';

  // Tier 1: Check specialized high-urgency domain rules
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

  // Location extraction heuristic: Detect Indian cities and street addresses
  let extractedLocation: string | undefined = customLocation;
  if (!extractedLocation) {
    const cityMatch = text.match(/\b(pune|mumbai|delhi|new delhi|bengaluru|bangalore|hyderabad|chennai|kolkata|ahmedabad|surat|noida|gurgaon|gurugram|faridabad|ghaziabad|lucknow|kanpur|jaipur|bhopal|indore|patna|chandigarh|nagpur|nashik|thane|navi mumbai)\b/i);
    const locMatch = text.match(/(?:at|in|near|near to|behind|opposite|mein|ke paas|chowk|road|street|nagar|colony|sector|ward|society|phase|area)\s+([A-Za-z0-9\s,\.-]{3,40})/i);
    if (cityMatch && locMatch && locMatch[1]) {
      extractedLocation = `${locMatch[1].trim()}, ${cityMatch[0].trim()}`;
    } else if (locMatch && locMatch[1]) {
      extractedLocation = locMatch[1].trim();
    } else if (cityMatch) {
      extractedLocation = cityMatch[0].trim();
    }
  }

  // Check for emergency / physical / financial duress triggers in tone
  const isEmergency = /\b(emergency|urgent|critical|turant|threat|violence|beating|danger|suicide|immediate help|police help|extortion)\b/i.test(normalized);
  if (isEmergency) {
    detectedUrgency = 'CRITICAL';
  }

  // If a known rule domain was matched with solid confidence
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

  // Tier 2: Universal semantic matching across all 100+ problem types in catalog
  const words = normalized
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  let bestProb: ProblemTypeDefinition | null = null;
  let bestProbScore = 0;
  const bestProbMatches: string[] = [];

  for (const prob of PROBLEM_TYPES) {
    let score = 0;
    const localMatches: string[] = [];

    // Check tags
    for (const tag of prob.tags) {
      const lowerTag = tag.toLowerCase();
      if (normalized.includes(lowerTag)) {
        score += 0.35 + (lowerTag.length > 6 ? 0.15 : 0);
        localMatches.push(tag);
      } else {
        const tagWords = lowerTag.split(/\s+/);
        for (const tw of tagWords) {
          if (tw.length > 3 && words.includes(tw)) {
            score += 0.15;
            localMatches.push(tw);
          }
        }
      }
    }

    // Check name tokens
    const nameWords = prob.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

    for (const nw of nameWords) {
      if (words.includes(nw)) {
        score += 0.2;
        localMatches.push(nw);
      }
    }

    // Check ID tokens
    const idParts = prob.id.split('-');
    for (const part of idParts) {
      if (part.length > 3 && words.includes(part)) {
        score += 0.25;
        localMatches.push(part);
      }
    }

    if (score > bestProbScore) {
      bestProbScore = score;
      bestProb = prob;
      bestProbMatches.length = 0;
      bestProbMatches.push(...Array.from(new Set(localMatches)));
    }
  }

  if (bestProb && bestProbScore >= 0.35) {
    const confidence = Math.min(0.96, 0.7 + bestProbScore * 0.08);
    return {
      problemId: bestProb.id,
      problem: bestProb,
      confidence,
      matchedKeywords: bestProbMatches,
      suggestedUrgency: isEmergency ? 'CRITICAL' : bestProb.priority,
      extractedLocation,
      isUnknown: false,
      reasoning: `Identified statutory route "${bestProb.name}" under ${bestProb.category} based on matching criteria: ${bestProbMatches.join(', ')}.`
    };
  }

  // UNKNOWN PROBLEM HANDLING:
  // When an issue doesn't fit standard catalog, construct a structured Unclassified Problem
  // without hallucinating fake government departments or rejecting the citizen.
  const unknownProblem: ProblemTypeDefinition = {
    id: 'unclassified-citizen-issue',
    name: 'Unclassified Citizen Issue',
    category: 'Civic & Municipal',
    route: 'NagrikOne Guided Citizen Dossier Preparation & Statutory Review',
    priority: detectedUrgency,
    estimatedResolutionDays: 5,
    legalAct: 'Applicable sector-specific law or administrative framework to be determined after review.',
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
