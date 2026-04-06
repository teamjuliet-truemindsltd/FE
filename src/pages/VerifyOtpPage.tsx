import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../contexts/authContext';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';

export const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp, isLoading, error, clearError, registrationEmail } = useAuthStore();
  const searchParams = new URLSearchParams(location.search);
  const email = (location.state as { email?: string })?.email || searchParams.get('email') || registrationEmail || '';
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    // Redirect if no email provided
    if (!email) {
      navigate('/auth/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !canResend) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timeLeft, canResend]);

  const handleBackspace = (index: number) => {
    if (otp[index] === '' && index > 0) {
      setOtp((prev) => {
        const arr = prev.split('');
        arr[index - 1] = '';
        return arr.join('');
      });
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = otp.split('');
    newOtp[index] = value;
    const otpString = newOtp.join('');

    setOtp(otpString.slice(0, 6));
    setLocalError(null);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    setOtp(pastedData);
    setLocalError(null);

    // Focus reaching the last input or the next one
    const nextIndex = Math.min(pastedData.length, 5);
    const nextInput = document.getElementById(`otp-${nextIndex}`) as HTMLInputElement;
    nextInput?.focus();
  };

  useEffect(() => {
    // Auto-focus first input on mount
    const firstInput = document.getElementById('otp-0') as HTMLInputElement;
    firstInput?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (otp.length !== 6) {
      setLocalError('Please enter all 6 digits');
      return;
    }

    try {
      await verifyOtp(email, otp);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'OTP verification failed';
      setLocalError(errorMsg);
    }
  };

  const handleResendOtp = async () => {
    clearError();
    try {
      await resendOtp(email);
      setCanResend(false);
      setTimeLeft(60);
      setOtp('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to resend OTP';
      setLocalError(errorMsg);
    }
  };

  const displayError = localError || error;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
          <p className="text-slate-400">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Verify Email</h1>
            <p className="text-slate-400">Enter the 6-digit code sent to</p>
            <p className="text-slate-300 font-semibold break-all">{email}</p>
          </div>

          {displayError && (
            <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-sm">{displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[index] || ''}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onPaste={handlePaste}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace') {
                      handleBackspace(index);
                    }
                  }}
                  disabled={isLoading}
                  className="w-12 h-12 text-center text-xl font-bold bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:opacity-50"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-2.5 rounded-lg transition duration-200 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-slate-400 text-center text-sm mb-4">
              {canResend ? "Didn't receive the code?" : `Resend in ${timeLeft}s`}
            </p>
            <button
              onClick={handleResendOtp}
              disabled={!canResend || isLoading}
              className="w-full py-2 text-purple-400 hover:text-purple-300 font-semibold disabled:text-slate-500 disabled:cursor-not-allowed transition"
            >
              Resend Code
            </button>
            <p className="text-slate-400 text-center text-sm mt-4">
              <Link to="/auth/login" className="text-purple-400 hover:text-purple-300 font-semibold transition">
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
