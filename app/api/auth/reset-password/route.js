import { NextResponse } from 'next/server';
import { verifyAndResetPassword, logAuditEvent } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, OTP code, and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const result = await verifyAndResetPassword(email, otp, newPassword);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    logAuditEvent({
      userId: result.user.id,
      action: 'PASSWORD_RESET_SUCCESSFUL',
      entity: 'UserSecurity',
      entityId: result.user.id,
      details: `Password successfully updated via verified OTP for ${result.user.email}.`
    });

    return NextResponse.json({
      success: true,
      message: 'Password successfully reset! You can now log in with your new credentials.'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process password reset.' },
      { status: 500 }
    );
  }
}
