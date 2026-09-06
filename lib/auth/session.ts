import crypto from 'crypto';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'nagrikone_session_token';
const SESSION_EXPIRY_DAYS = 14;

export interface AuthSession {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'CITIZEN' | 'ADMIN' | 'NODAL_OFFICER';
  expiresAt: string;
}

/**
 * Creates a cryptographically random session token.
 */
function createToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hashes a session token for secure database storage.
 */
function hashToken(token: string): string {
  const secret = process.env.SESSION_SECRET || 'nagrikone_session_secret_2026';
  return crypto.createHmac('sha256', secret).update(token).digest('hex');
}

/**
 * Creates a new session in database and returns token.
 */
export async function createSession(userId: string, userAgent?: string, ipAddress?: string): Promise<{ token: string; expiresAt: Date }> {
  const token = createToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  try {
    if (db?.session?.create) {
      await db.session.create({
        data: {
          userId,
          tokenHash,
          userAgent,
          ipAddress,
          expiresAt
        }
      });
    }
  } catch (err) {
    console.warn('[NagrikOne Session] DB session creation error:', err);
  }

  return { token, expiresAt };
}

/**
 * Validates a session token and returns the authenticated user session.
 */
export async function getSessionFromToken(token: string): Promise<AuthSession | null> {
  if (!token || typeof token !== 'string') return null;
  const tokenHash = hashToken(token);
  const now = new Date();

  try {
    if (db?.session?.findUnique) {
      const session = await db.session.findUnique({
        where: { tokenHash },
        include: { user: true }
      });

      if (!session || session.expiresAt < now || !session.user || !session.user.isActive) {
        return null;
      }

      return {
        userId: session.user.id,
        name: session.user.name || 'Citizen',
        email: session.user.email || undefined,
        phone: session.user.phone || undefined,
        role: session.user.role as any,
        expiresAt: session.expiresAt.toISOString()
      };
    }
  } catch (err) {
    console.warn('[NagrikOne Session] Verification error:', err);
  }

  return null;
}

/**
 * Server action / route handler helper to get the current authenticated user session.
 */
export async function getCurrentUser(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await getSessionFromToken(token);
  } catch (e) {
    return null;
  }
}

/**
 * Requires admin authentication server-side.
 * Returns the admin session or null.
 */
export async function requireAdminSession(): Promise<AuthSession | null> {
  const session = await getCurrentUser();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'NODAL_OFFICER')) {
    return null;
  }
  return session;
}
