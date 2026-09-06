import { db, fallbackStore } from '@/lib/db';

export type CaseStatusType =
  | 'DRAFT'
  | 'INTAKE'
  | 'UNDER_REVIEW'
  | 'INFORMATION_REQUIRED'
  | 'EVIDENCE_REQUIRED'
  | 'VERIFIED'
  | 'READY_FOR_ROUTING'
  | 'READY_FOR_PWD_SUBMISSION'
  | 'READY_FOR_POLICE_SUBMISSION'
  | 'READY_FOR_AUTHORITY_SUBMISSION'
  | 'ROUTED_TO_SERVICE_PROVIDER'
  | 'DISPATCHED_TO_PWD'
  | 'DISPATCHED_TO_POLICE'
  | 'IN_PROGRESS'
  | 'AWAITING_AUTHORITY'
  | 'AWAITING_CITIZEN'
  | 'SLA_WARNING'
  | 'ESCALATION_RECOMMENDED'
  | 'ESCALATED'
  | 'RESOLUTION_PENDING'
  | 'RESOLUTION_VERIFICATION'
  | 'STATUTORY_RESOLVED'
  | 'CLOSED'
  | 'REOPENED'
  | 'REJECTED';

export type ActorRoleType = 'CITIZEN' | 'NOVA_AI' | 'WORKFLOW_ENGINE' | 'ADMIN';

export interface StatusTransitionRequest {
  caseId: string;
  toStatus: CaseStatusType;
  actorType: ActorRoleType;
  actorId?: string;
  note: string;
  metadata?: Record<string, any>;
  hasVerifiedExternalDispatch?: boolean;
}

export interface TransitionResult {
  success: boolean;
  caseId: string;
  previousStatus: CaseStatusType;
  newStatus: CaseStatusType;
  note: string;
  eventCreated: boolean;
  error?: string;
}

/**
 * Validates legal state transitions in the NagrikOne civic lifecycle.
 */
export function isValidTransition(fromStatus: CaseStatusType, toStatus: CaseStatusType, isExternalVerified: boolean = false): boolean {
  if (fromStatus === toStatus) return true;

  // Rule: Never claim external dispatch (DISPATCHED_TO_PWD or DISPATCHED_TO_POLICE) unless verified external integration occurred
  if ((toStatus === 'DISPATCHED_TO_PWD' || toStatus === 'DISPATCHED_TO_POLICE') && !isExternalVerified) {
    return false;
  }

  // Permitted transitions
  const allowedTransitions: Partial<Record<CaseStatusType, CaseStatusType[]>> = {
    DRAFT: ['INTAKE', 'UNDER_REVIEW', 'INFORMATION_REQUIRED', 'EVIDENCE_REQUIRED', 'VERIFIED'],
    INTAKE: ['UNDER_REVIEW', 'INFORMATION_REQUIRED', 'EVIDENCE_REQUIRED', 'VERIFIED', 'REJECTED'],
    UNDER_REVIEW: ['INFORMATION_REQUIRED', 'EVIDENCE_REQUIRED', 'VERIFIED', 'READY_FOR_ROUTING', 'READY_FOR_PWD_SUBMISSION', 'READY_FOR_POLICE_SUBMISSION', 'READY_FOR_AUTHORITY_SUBMISSION', 'REJECTED'],
    INFORMATION_REQUIRED: ['AWAITING_CITIZEN', 'UNDER_REVIEW', 'VERIFIED'],
    EVIDENCE_REQUIRED: ['AWAITING_CITIZEN', 'UNDER_REVIEW', 'VERIFIED'],
    AWAITING_CITIZEN: ['UNDER_REVIEW', 'VERIFIED', 'CLOSED'],
    VERIFIED: ['READY_FOR_ROUTING', 'READY_FOR_PWD_SUBMISSION', 'READY_FOR_POLICE_SUBMISSION', 'READY_FOR_AUTHORITY_SUBMISSION', 'ROUTED_TO_SERVICE_PROVIDER', 'IN_PROGRESS'],
    READY_FOR_ROUTING: ['READY_FOR_PWD_SUBMISSION', 'READY_FOR_POLICE_SUBMISSION', 'READY_FOR_AUTHORITY_SUBMISSION', 'ROUTED_TO_SERVICE_PROVIDER', 'IN_PROGRESS'],
    READY_FOR_PWD_SUBMISSION: ['DISPATCHED_TO_PWD', 'IN_PROGRESS', 'AWAITING_AUTHORITY', 'SLA_WARNING'],
    READY_FOR_POLICE_SUBMISSION: ['DISPATCHED_TO_POLICE', 'IN_PROGRESS', 'AWAITING_AUTHORITY', 'SLA_WARNING'],
    READY_FOR_AUTHORITY_SUBMISSION: ['IN_PROGRESS', 'AWAITING_AUTHORITY', 'SLA_WARNING'],
    ROUTED_TO_SERVICE_PROVIDER: ['IN_PROGRESS', 'AWAITING_AUTHORITY', 'SLA_WARNING'],
    DISPATCHED_TO_PWD: ['IN_PROGRESS', 'AWAITING_AUTHORITY', 'SLA_WARNING', 'RESOLUTION_PENDING'],
    DISPATCHED_TO_POLICE: ['IN_PROGRESS', 'AWAITING_AUTHORITY', 'SLA_WARNING', 'RESOLUTION_PENDING'],
    IN_PROGRESS: ['AWAITING_AUTHORITY', 'AWAITING_CITIZEN', 'SLA_WARNING', 'ESCALATION_RECOMMENDED', 'RESOLUTION_PENDING', 'STATUTORY_RESOLVED'],
    AWAITING_AUTHORITY: ['IN_PROGRESS', 'SLA_WARNING', 'ESCALATION_RECOMMENDED', 'RESOLUTION_PENDING', 'STATUTORY_RESOLVED'],
    SLA_WARNING: ['ESCALATION_RECOMMENDED', 'ESCALATED', 'RESOLUTION_PENDING', 'IN_PROGRESS'],
    ESCALATION_RECOMMENDED: ['ESCALATED', 'IN_PROGRESS', 'RESOLUTION_PENDING'],
    ESCALATED: ['IN_PROGRESS', 'AWAITING_AUTHORITY', 'RESOLUTION_PENDING', 'STATUTORY_RESOLVED'],
    RESOLUTION_PENDING: ['RESOLUTION_VERIFICATION', 'STATUTORY_RESOLVED', 'CLOSED', 'REOPENED'],
    RESOLUTION_VERIFICATION: ['STATUTORY_RESOLVED', 'CLOSED', 'REOPENED'],
    STATUTORY_RESOLVED: ['CLOSED', 'REOPENED'],
    CLOSED: ['REOPENED'],
    REOPENED: ['INTAKE', 'UNDER_REVIEW', 'IN_PROGRESS', 'VERIFIED'],
    REJECTED: ['REOPENED']
  };

  const allowed = allowedTransitions[fromStatus];
  return allowed ? allowed.includes(toStatus) : true;
}

/**
 * Executes a deterministic status transition, logs a StatusEvent, and records an AuditLog.
 */
export async function transitionCaseStatus(req: StatusTransitionRequest): Promise<TransitionResult> {
  const { caseId, toStatus, actorType, actorId, note, metadata, hasVerifiedExternalDispatch } = req;

  let currentCase: any = null;

  try {
    if (db?.case?.findUnique) {
      currentCase = await db.case.findUnique({
        where: { id: caseId }
      });
    }
  } catch (err) {
    console.warn('[Workflow Engine] Case fetch warning:', err);
  }

  // Check fallback store if DB is offline
  if (!currentCase) {
    currentCase = fallbackStore.cases.find((c: any) => c.id === caseId);
  }

  if (!currentCase) {
    return {
      success: false,
      caseId,
      previousStatus: 'DRAFT',
      newStatus: toStatus,
      note,
      eventCreated: false,
      error: `Case with ID ${caseId} not found.`
    };
  }

  const previousStatus = currentCase.status as CaseStatusType;

  // Guard against unverified external dispatch
  let adjustedTargetStatus = toStatus;
  if ((toStatus === 'DISPATCHED_TO_PWD' || toStatus === 'DISPATCHED_TO_POLICE') && !hasVerifiedExternalDispatch) {
    adjustedTargetStatus = toStatus === 'DISPATCHED_TO_PWD' ? 'READY_FOR_PWD_SUBMISSION' : 'READY_FOR_POLICE_SUBMISSION';
  }

  // Update Case in Database
  try {
    if (db?.case?.update) {
      await db.case.update({
        where: { id: caseId },
        data: {
          status: adjustedTargetStatus as any,
          escalatedAt: adjustedTargetStatus === 'ESCALATED' ? new Date() : undefined,
          closedAt: adjustedTargetStatus === 'CLOSED' || adjustedTargetStatus === 'STATUTORY_RESOLVED' ? new Date() : undefined
        }
      });

      // Create StatusEvent
      await db.statusEvent.create({
        data: {
          caseId,
          status: adjustedTargetStatus as any,
          actorType: actorType as any,
          actorId: actorId || undefined,
          note: note.trim(),
          metadata: metadata || {}
        }
      });

      // Create WorkflowEvent
      await db.workflowEvent.create({
        data: {
          caseId,
          eventType: 'STATUS_TRANSITION',
          fromStatus: previousStatus as any,
          toStatus: adjustedTargetStatus as any,
          automated: actorType === 'NOVA_AI' || actorType === 'WORKFLOW_ENGINE',
          triggerReason: note,
          payload: metadata || {}
        }
      });

      // If actor was ADMIN, create AuditLog
      if (actorType === 'ADMIN') {
        await db.auditLog.create({
          data: {
            actorId,
            actorRole: 'ADMIN',
            action: 'ADMIN_CHANGED_STATUS',
            entityType: 'Case',
            entityId: caseId,
            previousState: { status: previousStatus },
            newState: { status: adjustedTargetStatus, note },
            metadata: metadata || {}
          }
        });
      }
    }
  } catch (err) {
    console.warn('[Workflow Engine] DB transaction error, updating fallback store:', err);
  }

  // Update fallback store in memory
  currentCase.status = adjustedTargetStatus;
  currentCase.updatedAt = new Date().toISOString();
  currentCase.events = currentCase.events || [];
  currentCase.events.unshift({
    id: `ev_${Date.now()}`,
    caseId,
    status: adjustedTargetStatus,
    note,
    createdAt: new Date().toISOString()
  });

  return {
    success: true,
    caseId,
    previousStatus,
    newStatus: adjustedTargetStatus,
    note,
    eventCreated: true
  };
}
