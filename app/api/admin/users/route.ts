import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim().toLowerCase();

    let users: any[] = [];

    try {
      if (db?.user?.findMany) {
        users = await db.user.findMany({
          where: query
            ? {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { email: { contains: query, mode: 'insensitive' } },
                  { phone: { contains: query } }
                ]
              }
            : undefined,
          include: {
            cases: { select: { id: true, status: true, title: true } },
            payments: { select: { id: true, amount: true, status: true, tier: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
      }
    } catch (err) {
      console.warn('[Admin Users API] DB query error:', err);
    }

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    console.error('[Admin Users API] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
  }
}
