import { PROBLEM_TYPES, ProblemTypeDefinition, getProblemById } from './problemTypes';

export interface DetectionResult {
  problemId: string;
  problem: ProblemTypeDefinition;
  confidence: number;
  matchedKeywords: string[];
  suggestedUrgency: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  extractedLocation?: string;
}

interface KeywordRule {
  id: string;
  regex: RegExp;
  weight: number;
}

const DETECTION_RULES: KeywordRule[] = [
  // Cyber & Safety Fraud (Highest priority)
  {
    id: 'cyber-scam',
    regex: /\b(fraud|scam|cyber|otp|phishing|hacked|fake call|lottery|apk|anydesk|teamviewer|telegram task|part time job scam|extortion|sextortion|fake police|digital arrest|looted|thagi|dhokhadhadi|paisa kat gaya|account empty)\b/i,
    weight: 1.0
  },
  // Bank & UPI dispute
  {
    id: 'bank-transaction',
    regex: /\b(bank|upi|atm|gpay|phonepe|paytm|transaction|transfer|rrn|utr|debit|credited|chargeback|pending transaction|cash not dispensed|account debited|paisa fas gaya|double deduction)\b/i,
    weight: 0.9
  },
  // Civic - Road Potholes
  {
    id: 'civic-pothole',
    regex: /\b(pothole|potholes|khadda|khadde|road.*damage|broken road|sadak|divider|speed breaker|crater|asphalt|manhole cover|gaddha)\b/i,
    weight: 0.9
  },
  // Civic - Streetlights
  {
    id: 'civic-streetlight',
    regex: /\b(street ?light|street.*lamp|light band|light nahi jal rahi|pole|andhera|dark spot|street lamp|electric pole|batti)\b/i,
    weight: 0.9
  },
  // Civic - Garbage & Sanitation
  {
    id: 'civic-garbage',
    regex: /\b(garbage|kachra|kachre|waste|dustbin|dumping|smell|safai|gutter|drainage|sewer|naali|swachh|sanitation|stink)\b/i,
    weight: 0.9
  },
  // Consumer - Refund & E-Commerce
  {
    id: 'consumer-refund',
    regex: /\b(refund|return|replacement|delivery|damaged product|fake product|amazon|flipkart|order not received|merchant|warranty denied|overcharge|mrp|consumer forum|ghatiya saman)\b/i,
    weight: 0.85
  },
  // Government Certificates & Documents
  {
    id: 'govt-certificate',
    regex: /\b(certificate|aadhaar|pan card|passport|voter|ration card|caste certificate|income certificate|birth certificate|domicile|sarkari|tehsildar|portal error|rts|service plus)\b/i,
    weight: 0.85
  },
  // Telecom & Broadband
  {
    id: 'telecom-network',
    regex: /\b(internet|wifi|broadband|fiber|sim|network|call drop|slow speed|signal|tower|jio|airtel|vi|bsnl|net band|router red)\b/i,
    weight: 0.85
  },
  // Automobile & Vehicle
  {
    id: 'vehicle-service',
    regex: /\b(bike|car|scooter|motorcycle|vehicle|servicing|mechanic|engine|brake|clutch|showroom|dealership|challan|rc|dl)\b/i,
    weight: 0.85
  },
  // Home Appliance & Utilities
  {
    id: 'home-service',
    regex: /\b(appliance|ac|air conditioner|fridge|refrigerator|washing machine|geyser|cooler|microwave|amc|cooling nahi|technician)\b/i,
    weight: 0.85
  }
];

export function detectProblem(text: string): DetectionResult {
  const normalized = text.toLowerCase().trim();
  let bestMatchId = 'consumer-refund';
  let bestScore = 0.4;
  const matchedKeywords: string[] = [];

  for (const rule of DETECTION_RULES) {
    const match = normalized.match(rule.regex);
    if (match) {
      const matchScore = rule.weight;
      matchedKeywords.push(match[0]);
      if (matchScore > bestScore) {
        bestScore = matchScore;
        bestMatchId = rule.id;
      }
    }
  }

  // Location extraction heuristic
  let extractedLocation: string | undefined;
  const locMatch = text.match(/(?:at|in|near|near to|behind|opposite|mein|ke paas|chowk|road|street|nagar|colony|sector|ward)\s+([A-Za-z0-9\s,\.-]{3,35})/i);
  if (locMatch && locMatch[1]) {
    extractedLocation = locMatch[1].trim();
  }

  const problem = getProblemById(bestMatchId) || PROBLEM_TYPES[0];
  const isUrgent = /urgent|emergency|critical|abhi|turant|police|immediate|heavy loss/i.test(normalized) || problem.priority === 'URGENT';

  return {
    problemId: problem.id,
    problem,
    confidence: matchedKeywords.length > 0 ? Math.min(0.98, 0.75 + (matchedKeywords.length * 0.08)) : 0.45,
    matchedKeywords,
    suggestedUrgency: isUrgent ? 'URGENT' : problem.priority,
    extractedLocation
  };
}

// Backward compatibility export for old calls
export function detect(text: string): string {
  return detectProblem(text).problemId;
}
