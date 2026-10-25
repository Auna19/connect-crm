import { NextResponse } from 'next/server';
import { getUserByEmail, createPasswordReset, logAuditEvent } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found, please sign up.',
          userNotFound: true
        },
        { status: 404 }
      );
    }

    const { otp, expiresAt } = createPasswordReset(email);

    logAuditEvent({
      userId: user.id,
      action: 'OTP_DISPATCHED',
      entity: 'PasswordReset',
      entityId: user.id,
      details: `Password reset OTP generated for ${user.email}.`
    });

    return NextResponse.json({
      success: true,
      message: `Verification OTP dispatched to ${email}.`,
      otp, // included for seamless demonstration & verification
      expiresAt,
      email: user.email
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to initiate password reset.' },
      { status: 500 }
    );
  }
}
