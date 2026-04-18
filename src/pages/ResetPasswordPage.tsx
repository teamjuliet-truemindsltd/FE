import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { AlertCircle, KeyRound, ArrowLeft, CheckCircle, Eye, EyeOff, Loader } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = (location.state as { email?: string })?.email || '';
  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // OTP input auto-advance
  const handleOtpChange = (value: string, index: number) => {
    if (!/^[0-9]*$/.test(value)) return;
    const arr = otp.split('');
    arr[index] = value;
    const next = arr.join('').slice(0, 6);
    setOtp(next);
    setError(null);
    if (value && index < 5) {
      const nextInput = document.getElementById(`reset-otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`reset-otp-${index - 1}`) as HTMLInputElement;
      prev?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtp(pasted);
    const nextInput = document.getElementById(`reset-otp-${Math.min(pasted.length, 5)}`) as HTMLInputElement;
    nextInput?.focus();
  };

  useEffect(() => {
    document.getElementById('reset-otp-0')?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) { setError('Email is required'); return; }
    if (otp.length !== 6) { setError('Please enter the full 6-digit code'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }

    try {
      setIsLoading(true);
      await authService.resetPassword({ email, code: otp, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/auth/login'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 transition-colors duration-300">
        <div className="absolute top-8 left-8"><Logo size="lg" /></div>
        <div className="w-full max-w-md text-center">
          <div className="card shadow-2xl p-8 border border-border">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-[24px] mb-6 animate-bounce-subtle">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">Password Reset!</h1>
            <p className="text-foreground/60 mb-2">Your password has been updated successfully.</p>
            <p className="text-foreground/40 text-sm">Redirecting you to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 transition-colors duration-300">
      <div className="absolute top-8 left-8"><Logo size="lg" /></div>

      <div className="w-full max-w-md">
        <div className="card shadow-2xl p-8 border border-border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-teal/10 text-primary-teal rounded-2xl mb-4">
              <KeyRound className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Reset Password</h1>
            <p className="text-foreground/60 text-sm">Enter the 6-digit code sent to your email and choose a new password</p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email (editable in case they land here directly) */}
            {!emailFromState && (
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-foreground/80 mb-2">Email Address</label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your registered email"
                  className="input"
                />
              </div>
            )}
            {emailFromState && (
              <div className="px-4 py-3 bg-primary-teal/5 border border-primary-teal/20 rounded-xl text-sm text-primary-teal font-medium">
                Code sent to: <span className="font-bold">{email}</span>
              </div>
            )}

            {/* OTP boxes */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-3">6-Digit Reset Code</label>
              <div className="flex justify-between gap-2">
                {[0,1,2,3,4,5].map((index) => (
                  <input
                    key={index}
                    id={`reset-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[index] || ''}
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
              <label htmlFor="new-password" className="block text-sm font-medium text-foreground/80 mb-2">New Password</label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                  placeholder="At least 6 characters"
                  className="input pr-12"
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
              <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground/80 mb-2">Confirm Password</label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                placeholder="Repeat your new password"
                className="input"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1.5 text-xs text-red-400">Passwords don't match</p>
              )}
              {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && (
                <p className="mt-1.5 text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6 || !newPassword || newPassword !== confirmPassword}
              className="w-full btn-primary py-3 mt-2 flex justify-center items-center gap-2"
            >
              {isLoading ? <><Loader className="w-4 h-4 animate-spin" /> Resetting...</> : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border space-y-3 text-center">
            <Link
              to="/auth/forgot-password"
              className="block text-sm text-foreground/50 hover:text-primary-teal transition font-medium"
            >
              Didn't receive a code? Request again
            </Link>
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-foreground/40 hover:text-foreground/60 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
