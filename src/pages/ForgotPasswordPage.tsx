import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { AlertCircle, Mail, ArrowLeft, CheckCircle, KeyRound, Eye, EyeOff, Loader } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

type Step = 'email' | 'reset' | 'success';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');

  // Step 1 state
  const [email, setEmail] = useState('');

  // Step 2 state
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Shared
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Focus first OTP box when step changes to 'reset'
  useEffect(() => {
    if (step === 'reset') {
      setTimeout(() => {
        (document.getElementById('fp-otp-0') as HTMLInputElement)?.focus();
      }, 100);
    }
  }, [step]);

  // Redirect to login after success
  useEffect(() => {
    if (step === 'success') {
      const t = setTimeout(() => navigate('/auth/login'), 3500);
      return () => clearTimeout(t);
    }
  }, [step, navigate]);

  // ─── Step 1: Send OTP ──────────────────────────────
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError('Please enter your email address'); return; }

    try {
      setIsLoading(true);
      await authService.forgotPassword({ email });
      setResendCooldown(60);
      setStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    try {
      setIsLoading(true);
      await authService.forgotPassword({ email });
      setResendCooldown(60);
      setOtp('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── OTP box helpers ───────────────────────────────
  const handleOtpChange = (value: string, index: number) => {
    if (!/^[0-9]*$/.test(value)) return;
    const arr = otp.padEnd(6, ' ').split('');
    arr[index] = value || ' ';
    const next = arr.join('').trimEnd();
    setOtp(next.slice(0, 6));
    setError(null);
    if (value && index < 5) {
      (document.getElementById(`fp-otp-${index + 1}`) as HTMLInputElement)?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        (document.getElementById(`fp-otp-${index - 1}`) as HTMLInputElement)?.focus();
      }
      const arr = otp.split('');
      arr[index] = '';
      setOtp(arr.join(''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtp(pasted);
    const i = Math.min(pasted.length, 5);
    (document.getElementById(`fp-otp-${i}`) as HTMLInputElement)?.focus();
  };

  // ─── Step 2: Reset Password ────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otp.replace(/\s/g, '');
    if (cleanOtp.length !== 6)  { setError('Please enter the full 6-digit code'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }

    try {
      setIsLoading(true);
      await authService.resetPassword({ email, code: cleanOtp, newPassword });
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Your code may be incorrect or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Shared layout wrapper ─────────────────────────
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 transition-colors duration-300">
      <div className="absolute top-8 left-8"><Logo size="lg" /></div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );

  // ─── Step 3: Success ───────────────────────────────
  if (step === 'success') {
    return (
      <Wrapper>
        <div className="card shadow-2xl p-8 border border-border text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-[24px] mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Password Reset!</h1>
          <p className="text-foreground/60 mb-2">Your password has been updated successfully.</p>
          <p className="text-foreground/40 text-sm">Redirecting you to login...</p>
          <div className="flex justify-center mt-6">
            <div className="w-2 h-2 rounded-full bg-primary-teal animate-bounce mx-1" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary-teal animate-bounce mx-1" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary-teal animate-bounce mx-1" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </Wrapper>
    );
  }

  // ─── Step 2: Enter OTP + New Password ─────────────
  if (step === 'reset') {
    return (
      <Wrapper>
        <div className="card shadow-2xl p-8 border border-border">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-teal/10 text-primary-teal rounded-2xl mb-4">
              <KeyRound className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Reset Password</h1>
            <p className="text-foreground/60 text-sm">
              Enter the 6-digit code sent to{' '}
              <span className="text-primary-teal font-semibold">{email}</span>
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* OTP Boxes */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-3">6-Digit Reset Code</label>
              <div className="flex justify-between gap-2">
                {[0,1,2,3,4,5].map((index) => (
                  <input
                    key={index}
                    id={`fp-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={(otp[index] || '').trim()}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    onPaste={handlePaste}
                    disabled={isLoading}
                    className="w-12 h-14 text-center text-2xl font-bold bg-background border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-4 focus:ring-primary-teal/20 focus:border-primary-teal transition-all disabled:opacity-50"
                  />
                ))}
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="fp-new-password" className="block text-sm font-medium text-foreground/80 mb-2">New Password</label>
              <div className="relative">
                <input
                  id="fp-new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                  placeholder="At least 6 characters"
                  className="input pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="fp-confirm-password" className="block text-sm font-medium text-foreground/80 mb-2">Confirm Password</label>
              <input
                id="fp-confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                placeholder="Repeat your new password"
                className="input"
                disabled={isLoading}
              />
              {confirmPassword.length > 0 && (
                <p className={`mt-1.5 text-xs flex items-center gap-1 ${newPassword === confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                  {newPassword === confirmPassword
                    ? <><CheckCircle className="w-3.5 h-3.5" /> Passwords match</>
                    : "Passwords don't match"
                  }
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.replace(/\s/g,'').length !== 6 || !newPassword || newPassword !== confirmPassword}
              className="w-full btn-primary py-3 flex justify-center items-center gap-2"
            >
              {isLoading ? <><Loader className="w-4 h-4 animate-spin" /> Resetting...</> : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center space-y-3">
            <p className="text-sm text-foreground/50">
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : <button onClick={handleResend} disabled={isLoading} className="text-primary-teal hover:text-primary-teal/80 font-semibold transition disabled:opacity-50">Resend code</button>
              }
            </p>
            <button
              onClick={() => { setStep('email'); setOtp(''); setError(null); }}
              className="inline-flex items-center gap-2 text-sm text-foreground/40 hover:text-foreground/60 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Change email
            </button>
          </div>
        </div>
      </Wrapper>
    );
  }

  // ─── Step 1: Enter Email ───────────────────────────
  return (
    <Wrapper>
      <div className="card shadow-2xl p-8 border border-border">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-teal/10 text-primary-teal rounded-2xl mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Forgot Password?</h1>
          <p className="text-foreground/60">Enter your email and we'll send you a reset code</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSendCode} className="space-y-5">
          <div>
            <label htmlFor="fp-email" className="block text-sm font-medium text-foreground/80 mb-2">Email Address</label>
            <input
              id="fp-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              placeholder="Enter your registered email"
              className="input"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <button type="submit" disabled={isLoading} className="w-full btn-primary py-3 flex justify-center items-center gap-2">
            {isLoading ? <><Loader className="w-4 h-4 animate-spin" /> Sending Code...</> : 'Send Reset Code'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <Link to="/auth/login" className="inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-primary-teal transition font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </Wrapper>
  );
};

export default ForgotPasswordPage;
