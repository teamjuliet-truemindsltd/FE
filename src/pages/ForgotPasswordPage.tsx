import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { AlertCircle, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      await authService.forgotPassword({ email });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 transition-colors duration-300">
        <div className="absolute top-8 left-8"><Logo size="lg" /></div>
        <div className="w-full max-w-md text-center">
          <div className="card shadow-2xl p-8 border border-border">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-[24px] mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">Check Your Email</h1>
            <p className="text-foreground/60 mb-2">
              If an account exists for <span className="text-primary-teal font-semibold">{email}</span>, we've sent a 6-digit reset code.
            </p>
            <p className="text-foreground/40 text-sm mb-8">The code expires in 10 minutes.</p>
            <button
              onClick={() => navigate('/auth/reset-password', { state: { email } })}
              className="w-full btn-primary py-3 mb-4"
            >
              Enter Reset Code
            </button>
            <Link to="/auth/login" className="text-sm text-foreground/50 hover:text-primary-teal transition font-medium">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="absolute top-8 left-8"><Logo size="lg" /></div>

      <div className="w-full max-w-md">
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder="Enter your registered email"
                className="input"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 mt-2"
            >
              {isLoading ? 'Sending Code...' : 'Send Reset Code'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-primary-teal transition font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
