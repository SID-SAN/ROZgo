import React from 'react';
import { CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'neutral' | 'verified' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 rounded-full font-medium gap-1',
    md: 'text-sm px-3 py-1 rounded-full font-semibold gap-1.5',
    lg: 'text-base px-4 py-1.5 rounded-full font-semibold gap-2',
  };

  const variantStyles = {
    primary:
      'bg-rozgo-100 text-rozgo-900 border border-rozgo-200 dark:bg-rozgo-900/40 dark:text-rozgo-200 dark:border-rozgo-800',
    secondary:
      'bg-neutral-100 text-neutral-800 border border-neutral-200 dark:bg-darkbg-card dark:text-neutral-300 dark:border-darkbg-border',
    success:
      'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    warning:
      'bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    info:
      'bg-blue-50 text-blue-900 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
    neutral:
      'bg-neutral-100 text-neutral-800 border border-neutral-200 dark:bg-darkbg-card dark:text-neutral-300 dark:border-darkbg-border',
    verified:
      'bg-rozgo-900 text-white dark:bg-rozgo-700 dark:text-white shadow-xs',
  };

  return (
    <span
      className={`inline-flex items-center tracking-tight ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && variant === 'verified' && <ShieldCheck className="w-4 h-4 text-rozgo-300" />}
      {icon && variant === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
      {icon && variant === 'warning' && <AlertCircle className="w-3.5 h-3.5" />}
      <span>{children}</span>
    </span>
  );
};

