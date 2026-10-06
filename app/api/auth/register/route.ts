import { NextResponse } from 'next/server';
import { registerCitizen } from '@/lib/auth/passwordAuth';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, phone, email, password } = body;

    const result = await registerCitizen({
      name: String(name || ''),
      phone: String(phone || ''),
      email: email ? String(email) : undefined,
      password: String(password || '')
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Account created and secured.',
      user: result.user
    });
  } catch (err: any) {
    console.error('[API /auth/register] Error:', err);
    return NextResponse.json(
      { error: 'Registration failed. Please check your details and try again.' },
      { status: 500 }
    );
  }
}
