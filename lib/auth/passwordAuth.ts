import crypto from 'crypto';
import { db } from '@/lib/db';
import { createSession } from './session';
import { cookies } from 'next/headers';

export interface CitizenRecord {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  role: 'CITIZEN' | 'ADMIN' | 'NODAL_OFFICER';
  isActive: boolean;
  createdAt: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __fallbackUsersStore: Map<string, CitizenRecord> | undefined;
}

if (!global.__fallbackUsersStore) {
  global.__fallbackUsersStore = new Map<string, CitizenRecord>();
}

/**
 * Hashes a plaintext password using PBKDF2 with a cryptographically secure random salt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a plaintext password against a stored PBKDF2 salt:hash string.
 */
export function verifyPassword(password: string, combined: string): boolean {
  if (!combined || !combined.includes(':')) return false;
  const [salt, originalHash] = combined.split(':');
  const testHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(testHash, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Registers a citizen with Name, Email (required), Mobile (contact field), and Password.
 * Email is the primary login identifier; phone is a contact field only.
 */
export async function registerCitizen(data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword?: string;
}) {
  const name = data.name.trim();
  const email = data.email?.trim().toLowerCase() || '';
  const phone = data.phone?.trim().replace(/\D/g, '').slice(-10) || undefined;
  const password = data.password.trim();
  const confirmPassword = data.confirmPassword?.trim();

  // Validate name
  if (!name || name.length < 2) {
    return { success: false, error: 'Please enter your full name (at least 2 characters).' };
  }

  // Validate email (required for login)
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  // Validate phone (optional, but if provided must be valid Indian mobile)
  if (phone && !/^[6-9]\d{9}$/.test(phone)) {
    return { success: false, error: 'Please enter a valid 10-digit Indian mobile number, or leave it blank.' };
  }

  // Validate password
  if (!password || password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' };
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match. Please re-enter.' };
  }

  // Check in-memory store for duplicates
  for (const storedUser of Array.from(global.__fallbackUsersStore?.values() || [])) {
    if (storedUser.email === email) {
      return { success: false, error: 'This email address is already registered. Please sign in.' };
    }
    if (phone && storedUser.phone === phone) {
      return { success: false, error: 'This mobile number is already registered.' };
    }
  }

  // Check DB for duplicates
  try {
    if (db?.user?.findFirst) {
      const existing = await db.user.findFirst({
        where: {
          OR: [
            { email },
            ...(phone ? [{ phone }] : [])
          ]
        }
      });
      if (existing) {
        if (existing.email === email) {
          return { success: false, error: 'This email address is already registered. Please sign in.' };
        }
        return { success: false, error: 'An account already exists with this mobile number or email.' };
      }
    }
  } catch (err) {
    console.warn('[Register] DB duplicate check note:', err);
  }

  const pHash = hashPassword(password);
  const now = new Date();
  const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const newCitizen: CitizenRecord = {
    id: userId,
    name,
    email,
    phone,
    passwordHash: pHash,
    role: 'CITIZEN',
    isActive: true,
    createdAt: now.toISOString()
  };

  // Save to in-memory fallback store
  global.__fallbackUsersStore?.set(email, newCitizen);
  if (phone) {
    global.__fallbackUsersStore?.set(phone, newCitizen);
  }

  // Save to database — NOW INCLUDING passwordHash
  let dbUser: any = null;
  try {
    if (db?.user?.create) {
      dbUser = await db.user.create({
        data: {
          id: userId,
          name,
          email,
          phone: phone || null,
          passwordHash: pHash,   // Persisted to DB
          role: 'CITIZEN',
          isActive: true
        }
      });
    }
  } catch (err) {
    console.warn('[Register] DB save note:', err);
  }

  const activeUser = dbUser || newCitizen;

  // Create session token (14 days)
  const session = await createSession(activeUser.id);
  const cookieStore = await cookies();
  cookieStore.set('nagrikone_session_token', session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: session.expiresAt,
    path: '/'
  });

  return {
    success: true,
    user: {
      id: activeUser.id,
      name: activeUser.name,
      phone: activeUser.phone,
      email: activeUser.email,
      role: activeUser.role
    }
  };
}

/**
 * Signs in a citizen with Email + Password.
 * Also supports mobile number as identifier for backward compatibility.
 */
export async function loginCitizen(data: {
  identifier: string;
  password: string;
}) {
  const idStr = data.identifier.trim();
  const password = data.password.trim();

  if (!idStr || !password) {
    return { success: false, error: 'Please enter your email/mobile and password.' };
  }

  const cleanPhone = idStr.replace(/\D/g, '').slice(-10);
  const isPhone = /^[6-9]\d{9}$/.test(cleanPhone);
  const cleanEmail = idStr.toLowerCase();

  // 1. Look up in memory store
  let citizen = isPhone
    ? global.__fallbackUsersStore?.get(cleanPhone)
    : global.__fallbackUsersStore?.get(cleanEmail);

  if (!citizen) {
    for (const u of Array.from(global.__fallbackUsersStore?.values() || [])) {
      if ((isPhone && u.phone === cleanPhone) || (!isPhone && u.email === cleanEmail)) {
        citizen = u;
        break;
      }
    }
  }

  // 2. Look up in DB — reads passwordHash from DB
  let dbUser: any = null;
  try {
    if (db?.user?.findFirst) {
      dbUser = await db.user.findFirst({
        where: isPhone ? { phone: cleanPhone } : { email: cleanEmail },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          passwordHash: true   // Read from DB
        }
      });
    }
  } catch (err) {
    console.warn('[Login] DB find note:', err);
  }

  if (!citizen && !dbUser) {
    return { success: false, error: 'No account found with these details. Please register first.' };
  }

  // Check account is active
  const isActive = dbUser?.isActive ?? citizen?.isActive ?? true;
  if (!isActive) {
    return { success: false, error: 'This account has been deactivated. Please contact support.' };
  }

  // Verify password — prefer DB hash over in-memory hash
  const storedHash = dbUser?.passwordHash || citizen?.passwordHash;

  if (!storedHash) {
    // Account exists but has no password (OTP-only account from before)
    return { success: false, error: 'This account uses OTP login. Password login is not set up for this account.' };
  }

  const valid = verifyPassword(password, storedHash);
  if (!valid) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  const userId = dbUser?.id || citizen?.id;
  const name = dbUser?.name || citizen?.name || 'Citizen';
  const phone = dbUser?.phone || citizen?.phone;
  const email = dbUser?.email || citizen?.email;
  const role = dbUser?.role || citizen?.role || 'CITIZEN';

  // Create session token
  const session = await createSession(userId);
  const cookieStore = await cookies();
  cookieStore.set('nagrikone_session_token', session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: session.expiresAt,
    path: '/'
  });

  return {
    success: true,
    user: {
      id: userId,
      name,
      phone,
      email,
      role
    }
  };
}
