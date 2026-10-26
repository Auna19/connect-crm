'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Plus, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  AlertCircle,
  Mail,
  ShieldAlert
} from 'lucide-react';
import './login.css';

export default function LoginPage() {
  const router = useRouter();

  // Mode states: 'login' | 'forgot' | 'verify_otp'
  const [frontMode, setFrontMode] = useState('login');
  const [isFlipped, setIsFlipped] = useState(false);

  // Visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Form states - strictly initialized empty
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('qa');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup form states
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState('qa');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupError, setSignupError] = useState('');

  // Forgot password & OTP states
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [dispatchedOtp, setDispatchedOtp] = useState(null);

  // OTP Verification states
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetError, setResetError] = useState('');

  // Global toasts
  const [successToast, setSuccessToast] = useState('');

  // Always clear all input states on initial mount or arrival
  useEffect(() => {
    setLoginEmail('');
    setLoginPassword('');
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setConfirmPassword('');
    setForgotEmail('');
    setOtpCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setLoginError('');
    setSignupError('');
    setForgotError('');
    setResetError('');

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      if (mode === 'signup') {
        setIsFlipped(true);
      } else {
        setIsFlipped(false);
        setFrontMode('login');
      }
    }
  }, []);

  const triggerToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast('');
    }, 4500);
  };

  const handleFlipToSignUp = () => {
    setSignupError('');
    setIsFlipped(true);
  };

  const handleFlipToLogin = () => {
    setLoginError('');
    setIsFlipped(false);
    setFrontMode('login');
  };

  // 1. Login Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Invalid credentials.');
        setIsLoggingIn(false);
        return;
      }

      // Save user session in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('connectcrm_user', JSON.stringify(data.user));
      }

      triggerToast('Login successful! Redirecting to dashboard...');
      
      // Clear data fields immediately
      setLoginEmail('');
      setLoginPassword('');

      setTimeout(() => {
        router.push(`/?view=dashboard&role=${data.user.role || selectedRole}`);
      }, 700);
    } catch (err) {
      setLoginError(err.message || 'Login failed.');
      setIsLoggingIn(false);
    }
  };

  // 2. Sign Up Handler
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');

    if (signupPassword !== confirmPassword) {
      setSignupError('Passwords do not match. Please re-enter.');
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters long.');
      return;
    }

    setIsSigningUp(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          role: signupRole
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSignupError(data.error || 'Failed to create account.');
        setIsSigningUp(false);
        return;
      }

      // Save new user session automatically and redirect
      if (typeof window !== 'undefined') {
        localStorage.setItem('connectcrm_user', JSON.stringify(data.user));
      }

      triggerToast('Account created successfully! Launching your workspace...');

      // Clear all registration inputs
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        router.push(`/?view=dashboard&role=${data.user.role || signupRole}`);
      }, 900);
    } catch (err) {
      setSignupError(err.message || 'Registration request failed.');
      setIsSigningUp(false);
    }
  };

  // 3. Forgot Password Handler (Request OTP)
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setIsSendingOtp(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Specifically check for unregistered email as requested:
        // "once i enter a valid email that haven't registered on the platform you should clearly indicate on the validation message that user not found, please sign up"
        setForgotError(data.error || 'User not found, please sign up.');
        setIsSendingOtp(false);
        return;
      }

      setDispatchedOtp(data.otp);
      triggerToast(`OTP Code sent to ${forgotEmail}`);
      setIsSendingOtp(false);
      setFrontMode('verify_otp');
    } catch (err) {
      setForgotError(err.message || 'Failed to dispatch OTP.');
      setIsSendingOtp(false);
    }
  };

  // 4. Verify OTP & Reset Password Handler
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError('');

    if (newPassword !== confirmNewPassword) {
      setResetError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }

    setIsResettingPassword(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          otp: otpCode,
          newPassword
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setResetError(data.error || 'Failed to reset password.');
        setIsResettingPassword(false);
        return;
      }

      triggerToast('Password reset successful! Please sign in with your new credentials.');

      // Clear all fields completely
      setForgotEmail('');
      setOtpCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setDispatchedOtp(null);
      setLoginEmail('');
      setLoginPassword('');

      setIsResettingPassword(false);
      setFrontMode('login');
    } catch (err) {
      setResetError(err.message || 'Password reset failed.');
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="login-page-body">
      {/* Return to Landing Link */}
      <Link href="/" className="back-link">
        <ArrowLeft size={16} />
        <span>Back to Landing Page</span>
      </Link>

      {/* Floating Neumorphic Ambient Elements */}
      <div className="bg-circle bg1"></div>
      <div className="bg-circle bg2"></div>
      <div className="bg-circle bg3"></div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>{successToast}</span>
        </div>
      )}

      {/* 3D Flip Card Container */}
      <div className="auth-wrapper">
        <div className={`auth-card ${isFlipped ? 'flipped' : ''}`} id="authCard">

          {/* ========================================================= */}
          {/* FRONT PANEL: Login OR Forgot Password OR Verify OTP */}
          {/* ========================================================= */}
          <div className="form-panel login-panel">
            
            {/* VIEW A: Standard Sign In */}
            {frontMode === 'login' && (
              <>
                <div className="logo">
                  <Lock size={32} />
                </div>
                <h1>Welcome Back</h1>
                <p className="subtitle">Login to access your ConnectCRM dashboard</p>

                {loginError && (
                  <div className="auth-alert-error">
                    <div className="alert-title">
                      <AlertCircle size={15} />
                      <span>Authentication Notice</span>
                    </div>
                    <span>{loginError}</span>
                    {loginError.includes('sign up') && (
                      <button
                        type="button"
                        onClick={handleFlipToSignUp}
                        className="text-left font-bold text-blue-600 underline text-[11px] mt-1"
                      >
                        Don't have an account? Click here to sign up.
                      </button>
                    )}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit}>
                  {/* Email Input */}
                  <div className="input-group">
                    <div className="electric-glow"></div>
                    <div className="electric-border"></div>
                    <input 
                      type="email" 
                      id="loginEmail" 
                      placeholder=" " 
                      autoComplete="off" 
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                    <label htmlFor="loginEmail">Email Address</label>
                  </div>

                  {/* Password Input with Eye Toggle */}
                  <div className="input-group">
                    <div className="electric-glow"></div>
                    <div className="electric-border"></div>
                    <input 
                      type={showLoginPassword ? "text" : "password"} 
                      id="loginPassword" 
                      placeholder=" " 
                      autoComplete="off" 
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <label htmlFor="loginPassword">Password</label>
                    <button 
                      type="button" 
                      className="password-toggle" 
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      title={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Role Selector */}
                  <div className="mb-3">
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Target Workspace Role:
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full text-xs bg-[#e7ebf0] border-none rounded-xl p-2.5 text-[#303943] font-semibold shadow-inner focus:outline-hidden"
                    >
                      <option value="qa">QA Engineer (Full Test Lab & Simulations)</option>
                      <option value="admin">Administrator (Full Control & Secrets)</option>
                      <option value="agent">Support Agent (Customer CRM & Tickets)</option>
                      <option value="auditor">Auditor (Read-Only Telemetry & Logs)</option>
                    </select>
                  </div>

                  {/* Options & Forgot Password Link */}
                  <div className="options">
                    <label className="checkbox">
                      <input type="checkbox" defaultChecked />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotError('');
                        if (loginEmail) setForgotEmail(loginEmail);
                        setFrontMode('forgot');
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-transparent border-none p-0 cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button type="submit" className="main-btn" disabled={isLoggingIn}>
                    {isLoggingIn ? 'AUTHENTICATING...' : 'SIGN IN'}
                  </button>
                </form>

                <div className="switch-area">
                  <span>Don't have an account?</span>
                  <button 
                    type="button" 
                    className="switch-circle" 
                    onClick={handleFlipToSignUp}
                    title="Switch to Sign Up"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </>
            )}

            {/* VIEW B: Forgot Password (Enter Email for OTP) */}
            {frontMode === 'forgot' && (
              <>
                <div className="logo">
                  <KeyRound size={32} />
                </div>
                <h1>Forgot Password</h1>
                <p className="subtitle">Enter your registered email to receive an instant OTP code</p>

                {forgotError && (
                  <div className="auth-alert-error">
                    <div className="alert-title">
                      <ShieldAlert size={15} />
                      <span>Verification Error</span>
                    </div>
                    <span>{forgotError}</span>
                    {forgotError.includes('sign up') && (
                      <button
                        type="button"
                        onClick={handleFlipToSignUp}
                        className="text-left font-bold text-blue-600 underline text-[11px] mt-1"
                      >
                        Click here to create a new account now.
                      </button>
                    )}
                  </div>
                )}

                <form onSubmit={handleForgotSubmit}>
                  <div className="input-group">
                    <div className="electric-glow"></div>
                    <div className="electric-border"></div>
                    <input 
                      type="email" 
                      id="forgotEmail" 
                      placeholder=" " 
                      autoComplete="off" 
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                    <label htmlFor="forgotEmail">Registered Email Address</label>
                  </div>

                  <button type="submit" className="main-btn" disabled={isSendingOtp}>
                    {isSendingOtp ? 'DISPATCHING OTP...' : 'SEND OTP CODE'}
                  </button>

                  {/* Navigation back button to Sign In page */}
                  <button
                    type="button"
                    onClick={() => {
                      setForgotError('');
                      setFrontMode('login');
                    }}
                    className="secondary-nav-btn"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Sign In</span>
                  </button>
                </form>
              </>
            )}

            {/* VIEW C: Verify OTP & Set New Password */}
            {frontMode === 'verify_otp' && (
              <>
                <div className="logo">
                  <ShieldCheck size={32} />
                </div>
                <h1>Enter OTP Code</h1>
                <p className="subtitle">Verify code and set your new password</p>

                {/* Live OTP Email / Demo Callout */}
                {dispatchedOtp ? (
                  <div className="otp-callout-box">
                    <span>Demo Mode Verification Code:</span>
                    <div className="otp-badge-code">{dispatchedOtp}</div>
                  </div>
                ) : (
                  <div className="otp-callout-box" style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}>
                    <span style={{ color: '#334155', fontSize: '12px', lineHeight: '1.4' }}>
                      Verification code sent to <strong>{forgotEmail}</strong>. Check your email inbox (or spam), then copy & paste the 6-digit OTP below:
                    </span>
                  </div>
                )}

                {resetError && (
                  <div className="auth-alert-error">
                    <div className="alert-title">
                      <AlertCircle size={15} />
                      <span>Reset Notice</span>
                    </div>
                    <span>{resetError}</span>
                  </div>
                )}

                <form onSubmit={handleResetSubmit}>
                  {/* 6-Digit OTP Input */}
                  <div className="input-group">
                    <div className="electric-glow"></div>
                    <div className="electric-border"></div>
                    <input 
                      type="text" 
                      id="otpCode" 
                      placeholder=" " 
                      maxLength={6}
                      autoComplete="off" 
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                    />
                    <label htmlFor="otpCode">6-Digit OTP Code</label>
                  </div>

                  {/* New Password */}
                  <div className="input-group">
                    <div className="electric-glow"></div>
                    <div className="electric-border"></div>
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      id="newPassword" 
                      placeholder=" " 
                      autoComplete="off" 
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <label htmlFor="newPassword">New Password</label>
                    <button 
                      type="button" 
                      className="password-toggle" 
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Confirm New Password */}
                  <div className="input-group">
                    <div className="electric-glow"></div>
                    <div className="electric-border"></div>
                    <input 
                      type={showConfirmNewPassword ? "text" : "password"} 
                      id="confirmNewPassword" 
                      placeholder=" " 
                      autoComplete="off" 
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                    <label htmlFor="confirmNewPassword">Confirm New Password</label>
                    <button 
                      type="button" 
                      className="password-toggle" 
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    >
                      {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <button type="submit" className="main-btn" disabled={isResettingPassword}>
                    {isResettingPassword ? 'UPDATING PASSWORD...' : 'RESET PASSWORD'}
                  </button>

                  {/* Navigation back button to Sign In page */}
                  <button
                    type="button"
                    onClick={() => {
                      setResetError('');
                      setFrontMode('login');
                    }}
                    className="secondary-nav-btn"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Sign In</span>
                  </button>
                </form>
              </>
            )}

          </div>

          {/* ========================================================= */}
          {/* BACK PANEL: Sign Up Form Panel */}
          {/* ========================================================= */}
          <div className="form-panel signup-panel">
            <div className="logo">
              <User size={32} />
            </div>
            <h1>Create Account</h1>
            <p className="subtitle">Start your enterprise journey with ConnectCRM</p>

            {signupError && (
              <div className="auth-alert-error">
                <div className="alert-title">
                  <AlertCircle size={15} />
                  <span>Registration Error</span>
                </div>
                <span>{signupError}</span>
              </div>
            )}

            <form onSubmit={handleSignupSubmit}>
              {/* Full Name */}
              <div className="input-group">
                <div className="electric-glow"></div>
                <div className="electric-border"></div>
                <input 
                  type="text" 
                  id="signupName" 
                  placeholder=" " 
                  autoComplete="off" 
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                />
                <label htmlFor="signupName">Full Name</label>
              </div>

              {/* Email */}
              <div className="input-group">
                <div className="electric-glow"></div>
                <div className="electric-border"></div>
                <input 
                  type="email" 
                  id="signupEmail" 
                  placeholder=" " 
                  autoComplete="off" 
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
                <label htmlFor="signupEmail">Email Address</label>
              </div>

              {/* Password */}
              <div className="input-group">
                <div className="electric-glow"></div>
                <div className="electric-border"></div>
                <input 
                  type={showSignupPassword ? "text" : "password"} 
                  id="signupPassword" 
                  placeholder=" " 
                  autoComplete="off" 
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                />
                <label htmlFor="signupPassword">Password</label>
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                >
                  {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="input-group">
                <div className="electric-glow"></div>
                <div className="electric-border"></div>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  id="confirmPassword" 
                  placeholder=" " 
                  autoComplete="off" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <label htmlFor="confirmPassword">Confirm Password</label>
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Role Selection */}
              <div className="mb-3">
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Primary Role Assignment:
                </label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="w-full text-xs bg-[#e7ebf0] border-none rounded-xl p-2.5 text-[#303943] font-semibold shadow-inner focus:outline-hidden"
                >
                  <option value="qa">QA Engineer (Integration Testing)</option>
                  <option value="admin">Administrator (Full Control)</option>
                  <option value="agent">Support Specialist (Customer Support)</option>
                  <option value="auditor">Auditor (Compliance Monitoring)</option>
                </select>
              </div>

              <button type="submit" className="main-btn" disabled={isSigningUp}>
                {isSigningUp ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </button>
            </form>

            <div className="switch-area">
              <span>Already have an account?</span>
              <button 
                type="button" 
                className="switch-circle" 
                onClick={handleFlipToLogin}
                title="Switch back to Login"
              >
                <ArrowLeft size={18} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
