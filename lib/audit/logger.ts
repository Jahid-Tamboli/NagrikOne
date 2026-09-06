import { db } from '@/lib/db';

export interface AuditLogEntry {
  actorId?: string;
  actorRole: 'CITIZEN' | 'ADMIN' | 'NODAL_OFFICER' | 'SYSTEM';
  action: string;
  entityType: 'Case' | 'User' | 'Payment' | 'Evidence' | 'System';
  entityId?: string;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

/**
 * Creates an immutable audit log entry in the database.
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    if (db?.auditLog?.create) {
      await db.auditLog.create({
        data: {
          actorId: entry.actorId || undefined,
          actorRole: entry.actorRole,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId || undefined,
          previousState: entry.previousState || {},
          newState: entry.newState || {},
          ipAddress: entry.ipAddress || undefined,
          metadata: entry.metadata || {}
        }
      });
    }
  } catch (err) {
    console.warn('[NagrikOne Audit Log] DB logging error:', err);
  }
}
