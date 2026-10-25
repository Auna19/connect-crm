import { NextResponse } from 'next/server';
import { getUserByEmail, logAuditEvent } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found, please sign up.' },
        { status: 404 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid password. Please check your credentials.' },
        { status: 401 }
      );
    }

    logAuditEvent({
      userId: user.id,
      action: 'USER_LOGGED_IN',
      entity: 'Session',
      entityId: user.id,
      details: `User ${user.email} logged in with role ${user.role}.`
    });

    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      message: 'Login successful.',
      user: safeUser
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authentication service error.' },
      { status: 500 }
    );
  }
}
