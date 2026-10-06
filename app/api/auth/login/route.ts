import { NextResponse } from 'next/server';
import { loginCitizen } from '@/lib/auth/passwordAuth';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { identifier, password } = body;

    const result = await loginCitizen({
      identifier: String(identifier || ''),
      password: String(password || '')
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully.',
      user: result.user
    });
  } catch (err: any) {
    console.error('[API /auth/login] Error:', err);
    return NextResponse.json(
      { error: 'Login failed. Please check your credentials and try again.' },
      { status: 500 }
    );
  }
}
