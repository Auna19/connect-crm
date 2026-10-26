import { NextResponse } from 'next/server';
import { getUserByEmail, createPasswordReset, logAuditEvent } from '@/lib/db';
import { sendOtpEmail, isEmailConfigured } from '@/lib/email';

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

    const user = await getUserByEmail(email);
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

    const { otp, expiresAt } = await createPasswordReset(email);

    // Dispatch real email via Resend
    const emailResult = await sendOtpEmail({
      to: user.email,
      otp,
      userName: user.name
    });

    logAuditEvent({
      userId: user.id,
      action: 'OTP_DISPATCHED',
      entity: 'PasswordReset',
      entityId: user.id,
      details: `Password reset OTP generated for ${user.email}. Email sent: ${emailResult.success}`
    });

    const emailDelivered = emailResult.success;
    const isConfigured = isEmailConfigured();

    return NextResponse.json({
      success: true,
      message: emailDelivered
        ? `Verification code dispatched to ${user.email}. Check your inbox!`
        : `Verification code generated.`,
      emailSent: emailDelivered,
      // Only include fallback OTP on screen if RESEND_API_KEY is not yet configured
      otp: !isConfigured ? otp : undefined,
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
