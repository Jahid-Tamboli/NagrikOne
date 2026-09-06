import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }
    return NextResponse.json({ authenticated: true, user });
  } catch (err) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('nagrikone_session_token');
    return NextResponse.json({ success: true, message: 'Signed out successfully.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Sign out failed.' }, { status: 500 });
  }
}
