import { NextRequest, NextResponse } from 'next/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || '';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASS) {
      // Create session token
      const token = Buffer.from(`${ADMIN_EMAIL}:${Date.now()}`).toString('base64');
      const response = NextResponse.json({ success: true, token });
      
      // Set secure cookie
      response.cookies.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Invalid admin email or password' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  return response;
}
