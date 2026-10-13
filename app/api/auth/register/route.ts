import { NextResponse } from 'next/server';
import { registerCitizen } from '@/lib/auth/passwordAuth';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, phone, password, confirmPassword } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
    }

    const result = await registerCitizen({
      name: String(name || ''),
      email: String(email),
      phone: phone ? String(phone) : undefined,
      password: String(password),
      confirmPassword: confirmPassword ? String(confirmPassword) : undefined
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully.',
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
