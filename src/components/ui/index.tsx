import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`card ${hover ? 'card-hover' : ''} ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  icon: Icon,
  loading = false,
  children,
  disabled,
  ...props 
}: ButtonProps) {
  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  }[size];

  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost'
  }[variant];

  return (
    <button 
      className={`btn ${variantClass} ${sizeClass}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin" />
          {children}
        </>
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </button>
  );
}

interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'error';
  children: ReactNode;
  icon?: LucideIcon;
}

export function Badge({ variant = 'primary', children, icon: Icon }: BadgeProps) {
  const variantClass = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge',
    error: 'badge'
  }[variant];

  return (
    <span className={`badge ${variantClass}`}>
      {Icon && <Icon size={14} />}
      {children}
    </span>
  );
}

export interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
  required?: boolean;
}

export function FormField({ label, error, hint, className = '', children, required }: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-200">
          {label}
          {required && <span className="text-red-400"> *</span>}
        </label>
      )}
      {children}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {hint && <p className="text-sm text-gray-500">{hint}</p>}
    </div>
  );
}

export function Input({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      className={`input ${error ? 'border-red-500 focus:ring-red-500/50' : ''}`}
      {...props}
    />
  );
}

interface SectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function Section({ title, description, children, className = '', actions }: SectionProps) {
  return (
    <section className={`section-py ${className}`}>
      <div className="container-max">
        {(title || description || actions) && (
          <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between">
            <div>
              {title && <h2 className="text-4xl font-display font-bold mb-2">{title}</h2>}
              {description && <p className="text-gray-400 text-lg">{description}</p>}
            </div>
            {actions && <div className="mt-6 md:mt-0">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function Divider() {
  return <div className="divider" />;
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-dark-700 border-t-primary-500 rounded-full animate-spin"></div>
    </div>
  );
}
