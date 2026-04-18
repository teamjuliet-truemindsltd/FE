import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../contexts/authContext';
import { AlertCircle, LogIn } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!formData.email || !formData.password) {
      setLocalError('Email and password are required');
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setLocalError(errorMsg);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Logo */}
      <div className="absolute top-8 left-8">
        <Logo size="lg" />
      </div>

      <div className="w-full max-w-md">
        <div className="card shadow-2xl p-8 border border-border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-teal/10 text-primary-teal rounded-2xl mb-4">
              <LogIn className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2 transition-colors">Welcome Back</h1>
            <p className="text-foreground/60 transition-colors text-lg">Sign in to your account</p>
          </div>

          {displayError && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-sm">{displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2 transition-colors">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-foreground/80 transition-colors">
                  Password
                </label>
                <Link to="/auth/forgot-password" className="text-xs text-primary-teal hover:text-primary-teal/80 font-semibold transition">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 mt-4"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-foreground/50 text-center text-sm transition-colors">
              Don't have an account?{' '}
              <Link to="/auth/register" className="text-primary-teal hover:text-primary-teal/80 font-semibold transition">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
