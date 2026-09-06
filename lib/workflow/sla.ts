export interface SlaAssessment {
  slaTargetHours: number;
  slaDueAt: Date;
  isWarning: boolean;
  isBreached: boolean;
  hoursRemaining: number;
  recommendation: 'NORMAL' | 'SLA_WARNING' | 'ESCALATION_RECOMMENDED' | 'ESCALATE_NOW';
  summary: string;
}

/**
 * Computes the statutory SLA target hours for a case category and priority.
 */
export function calculateSlaTargetHours(category: string, priority: string): number {
  if (priority === 'CRITICAL') return 24; // 1 day emergency
  if (priority === 'URGENT') return 48; // 2 days

  const cat = category.toLowerCase();
  if (cat.includes('cyber') || cat.includes('fraud')) return 24;
  if (cat.includes('police') || cat.includes('safety') || cat.includes('women')) return 48;
  if (cat.includes('civic') || cat.includes('municipal')) return 72;
  if (cat.includes('banking') || cat.includes('finance')) return 120; // 5 business days
  if (cat.includes('consumer')) return 168; // 7 days

  return 72; // Default 3 days
}

/**
 * Evaluates current SLA state based on creation timestamp and priority.
 */
export function evaluateCaseSla(createdAt: string | Date, priority: string, category: string, currentStatus: string): SlaAssessment {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const slaTargetHours = calculateSlaTargetHours(category, priority);
  const slaDueAt = new Date(createdDate.getTime() + slaTargetHours * 60 * 60 * 1000);

  const totalMs = slaDueAt.getTime() - createdDate.getTime();
  const elapsedMs = now.getTime() - createdDate.getTime();
  const remainingMs = slaDueAt.getTime() - now.getTime();
  const hoursRemaining = Math.max(0, Math.round(remainingMs / (1000 * 60 * 60)));

  const isTerminal = ['STATUTORY_RESOLVED', 'CLOSED', 'REJECTED'].includes(currentStatus);
  if (isTerminal) {
    return {
      slaTargetHours,
      slaDueAt,
      isWarning: false,
      isBreached: false,
      hoursRemaining: 0,
      recommendation: 'NORMAL',
      summary: 'Case completed within statutory window.'
    };
  }

  const elapsedRatio = elapsedMs / totalMs;

  if (now > slaDueAt) {
    return {
      slaTargetHours,
      slaDueAt,
      isWarning: true,
      isBreached: true,
      hoursRemaining: 0,
      recommendation: 'ESCALATE_NOW',
      summary: `Statutory SLA target exceeded by ${Math.abs(hoursRemaining)}h. Escalation to higher tribunal/officer recommended.`
    };
  }

  if (elapsedRatio >= 0.75) {
    return {
      slaTargetHours,
      slaDueAt,
      isWarning: true,
      isBreached: false,
      hoursRemaining,
      recommendation: 'ESCALATION_RECOMMENDED',
      summary: `75% of statutory SLA elapsed (${hoursRemaining}h remaining). Warning flag active.`
    };
  }

  return {
    slaTargetHours,
    slaDueAt,
    isWarning: false,
    isBreached: false,
    hoursRemaining,
    recommendation: 'NORMAL',
    summary: `On-time: ${hoursRemaining} hours remaining in standard SLA window.`
  };
}
