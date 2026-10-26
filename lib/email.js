import { Resend } from 'resend';

let resendClient = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Dispatches an official ConnectCRM Password Reset OTP to the recipient.
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.otp - 6-digit OTP code
 * @param {string} [options.userName] - Recipient name
 */
export async function sendOtpEmail({ to, otp, userName = 'Valued User' }) {
  const resend = getResendClient();

  if (!resend) {
    console.warn('[ConnectCRM Email] RESEND_API_KEY is not set. OTP code generated in demo mode:', otp);
    return {
      success: false,
      isDemo: true,
      error: 'RESEND_API_KEY not configured. Falling back to local demonstration mode.'
    };
  }

  const fromAddress = process.env.RESEND_FROM_EMAIL || 'ConnectCRM Security <onboarding@resend.dev>';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ConnectCRM Verification Code</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f1f5f9;
      padding: 40px 0;
    }
    .main {
      background-color: #ffffff;
      margin: 0 auto;
      max-width: 560px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      padding: 36px 32px;
      text-align: center;
    }
    .logo-text {
      color: #ffffff;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .logo-sub {
      color: #94a3b8;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-top: 4px;
    }
    .content {
      padding: 36px 32px;
    }
    h1 {
      color: #0f172a;
      font-size: 20px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 12px;
    }
    p {
      color: #475569;
      font-size: 15px;
      line-height: 1.6;
      margin: 0 0 20px;
    }
    .otp-container {
      background: linear-gradient(135deg, #f8fafc 0%, #ede9fe 100%);
      border: 2px dashed #6366f1;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 28px 0;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #4338ca;
      margin: 0;
    }
    .otp-sub {
      font-size: 13px;
      color: #64748b;
      margin-top: 8px;
      font-weight: 500;
    }
    .alert-box {
      background-color: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      margin-top: 24px;
    }
    .alert-text {
      font-size: 13px;
      color: #991b1b;
      margin: 0;
      line-height: 1.5;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer-text {
      color: #94a3b8;
      font-size: 12px;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main">
      <div class="header">
        <div class="logo-text">CONNECT<span style="color: #6366f1;">CRM</span></div>
        <div class="logo-sub">Security Operations Center</div>
      </div>
      <div class="content">
        <h1>Password Reset Request</h1>
        <p>Hello ${userName},</p>
        <p>We received a request to reset the password for your ConnectCRM account associated with <strong>${to}</strong>. Use the verification code below to complete the reset process:</p>
        
        <div class="otp-container">
          <div class="otp-code">${otp}</div>
          <div class="otp-sub">Valid for 10 minutes • Do not share this code</div>
        </div>

        <p>Copy and paste this 6-digit code into the password reset prompt on ConnectCRM to choose your new password.</p>

        <div class="alert-box">
          <p class="alert-text"><strong>Security Notice:</strong> If you did not request this password reset, please ignore this email or review your account activity. Your account credentials remain secure.</p>
        </div>
      </div>
      <div class="footer">
        <p class="footer-text">© ${new Date().getFullYear()} ConnectCRM Platform. High-Assurance Telephony & Integration Suite.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject: `ConnectCRM Verification Code: ${otp}`,
      html: htmlContent,
      text: `Your ConnectCRM password reset verification code is: ${otp}. It will expire in 10 minutes. If you did not request this, please ignore this email.`
    });

    if (error) {
      console.error('[ConnectCRM Email] Resend delivery error:', error);
      return { success: false, error: error.message };
    }

    console.log('[ConnectCRM Email] OTP email sent successfully. Resend ID:', data?.id);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[ConnectCRM Email] Unexpected dispatch exception:', err);
    return { success: false, error: err.message };
  }
}
