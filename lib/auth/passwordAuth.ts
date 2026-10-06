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
  return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(testHash, 'hex'));
}

/**
 * Registers a citizen with Name, Mobile, Email, and Password.
 */
export async function registerCitizen(data: {
  name: string;
  phone: string;
  email?: string;
  password: string;
}) {
  const name = data.name.trim();
  const phone = data.phone.trim().replace(/\D/g, '').slice(-10);
  const email = data.email?.trim().toLowerCase() || undefined;
  const password = data.password.trim();

  if (!name || name.length < 2) {
    return { success: false, error: 'Please enter your full name.' };
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  // Check in memory store
  for (const storedUser of Array.from(global.__fallbackUsersStore?.values() || [])) {
    if (storedUser.phone === phone) {
      return { success: false, error: 'This mobile number is already registered. Please sign in with your password.' };
    }
    if (email && storedUser.email === email) {
      return { success: false, error: 'This email is already registered. Please sign in with your password.' };
    }
  }

  // Check in DB
  try {
    if (db?.user?.findFirst) {
      const existing = await db.user.findFirst({
        where: {
          OR: [
            { phone },
            ...(email ? [{ email }] : [])
          ]
        }
      });
      if (existing) {
        return { success: false, error: 'An account with this mobile number or email already exists. Please sign in.' };
      }
    }
  } catch (err) {
    console.warn('[Register] DB check note:', err);
  }

  const pHash = hashPassword(password);
  const now = new Date();
  const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const newCitizen: CitizenRecord = {
    id: userId,
    name,
    phone,
    email,
    passwordHash: pHash,
    role: 'CITIZEN',
    isActive: true,
    createdAt: now.toISOString()
  };

  // Save to memory store
  global.__fallbackUsersStore?.set(phone, newCitizen);
  if (email) {
    global.__fallbackUsersStore?.set(email, newCitizen);
  }

  // Save to database
  let dbUser: any = null;
  try {
    if (db?.user?.create) {
      dbUser = await db.user.create({
        data: {
          id: userId,
          name,
          phone,
          email,
          role: 'CITIZEN',
          isActive: true
        }
      });
    }
  } catch (err) {
    console.warn('[Register] DB save note:', err);
  }

  const activeUser = dbUser || newCitizen;

  // Create session token and set HTTP-only cookie (valid for 30 days)
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
 * Signs in a citizen with Mobile / Email + Password.
 */
export async function loginCitizen(data: {
  identifier: string;
  password: string;
}) {
  const idStr = data.identifier.trim();
  const password = data.password.trim();

  if (!idStr || !password) {
    return { success: false, error: 'Please enter your mobile/email and password.' };
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
      if ((isPhone && u.phone === cleanPhone) || u.email === cleanEmail) {
        citizen = u;
        break;
      }
    }
  }

  // 2. Look up in DB if available
  let dbUser: any = null;
  try {
    if (db?.user?.findFirst) {
      dbUser = await db.user.findFirst({
        where: isPhone ? { phone: cleanPhone } : { email: cleanEmail }
      });
    }
  } catch (err) {
    console.warn('[Login] DB find note:', err);
  }

  if (!citizen && !dbUser) {
    return { success: false, error: 'No account found with these details. Please register first.' };
  }

  // Verify password if hash exists
  if (citizen?.passwordHash) {
    const valid = verifyPassword(password, citizen.passwordHash);
    if (!valid) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }
  }

  const userId = citizen?.id || dbUser?.id;
  const name = citizen?.name || dbUser?.name || 'Citizen';
  const phone = citizen?.phone || dbUser?.phone;
  const email = citizen?.email || dbUser?.email;
  const role = citizen?.role || dbUser?.role || 'CITIZEN';

  // Create session token and set HTTP-only cookie
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
