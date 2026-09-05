import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PROBLEM_TYPES } from '@/lib/problemTypes';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('category')?.toLowerCase() || '';

    let problems: any[] = [];

    try {
      if (db?.problemType?.findMany) {
        problems = await db.problemType.findMany({
          orderBy: { category: 'asc' }
        });
      }
    } catch (dbErr) {
      console.warn('[API /problems] DB lookup failed, serving from canonical store:', dbErr);
    }

    if (!problems || problems.length === 0) {
      problems = PROBLEM_TYPES;
    }

    if (category && category !== 'all') {
      problems = problems.filter((p: any) => p.category.toLowerCase() === category);
    }

    if (q) {
      problems = problems.filter((p: any) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.route.toLowerCase().includes(q) ||
        (Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    return NextResponse.json(problems);
  } catch (err: any) {
    console.error('[API /problems] Error fetching problems:', err);
    return NextResponse.json(PROBLEM_TYPES);
  }
}
