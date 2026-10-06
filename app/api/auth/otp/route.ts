import { NextResponse } from 'next/server';
import { sendOtp, verifyOtp } from '@/lib/auth/otp';
import { createSession } from '@/lib/auth/session';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '').trim().toLowerCase();
    const target = String(body.target || '').trim();

    if (!target) {
      return NextResponse.json(
        { error: 'Mobile number or email address is required.' },
        { status: 400 }
      );
    }

    if (action === 'send' || action === 'request') {
      const result = await sendOtp(target);
      if (!result.success) {
        const message =
          result.message ||
          'Unable to send OTP right now.';

        const isCooldown =
          typeof result.cooldownSeconds === 'number' &&
          result.cooldownSeconds > 0;

        return NextResponse.json(
          {
            success: false,
            error: message,
            cooldownSeconds: result.cooldownSeconds
          },
          {
            status: isCooldown ? 429 : 503
          }
        );
      }
      return NextResponse.json({
        success: true,
        message: result.message,
        cooldownSeconds: result.cooldownSeconds,
        expirySeconds: result.expirySeconds,
        devOtp: result.devOtp
      });
    }

    if (action === 'verify') {
      const code = String(body.code || '').trim();
      const name = body.name ? String(body.name).trim() : undefined;

      const result = await verifyOtp(target, code, name);
      if (!result.success || !result.user) {
        return NextResponse.json(
          { error: result.message },
          { status: 400 }
        );
      }

      // Create session token and set secure HTTP-only cookie
      const userAgent = req.headers.get('user-agent') || undefined;
      const ipAddress = req.headers.get('x-forwarded-for') || undefined;
      const session = await createSession(result.user.id, userAgent, ipAddress);

      const cookieStore = await cookies();
      cookieStore.set('nagrikone_session_token', session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: session.expiresAt,
        path: '/'
      });

      return NextResponse.json({
        success: true,
        message: 'Verified successfully.',
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone,
          role: result.user.role
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action. Specify "send" or "verify".' }, { status: 400 });
  } catch (err: any) {
    console.error('[API /auth/otp] Error:', err);
    return NextResponse.json(
      { error: 'Unable to process authentication request. Please try again.' },
      { status: 500 }
    );
  }
}
