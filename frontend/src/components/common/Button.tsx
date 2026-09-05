import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rozgo-900 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-sm px-3.5 py-2 rounded-xl gap-1.5 min-h-[38px]',
    md: 'text-base px-5 py-2.5 rounded-2xl gap-2 min-h-[46px]',
    lg: 'text-lg px-6 py-3.5 rounded-2xl gap-2.5 min-h-[52px]',
    xl: 'text-xl px-8 py-4 rounded-3xl gap-3 min-h-[58px]',
  };

  const variantStyles = {
    primary:
      'bg-rozgo-900 hover:bg-rozgo-800 active:bg-rozgo-950 text-white shadow-soft dark:bg-rozgo-700 dark:hover:bg-rozgo-600',
    secondary:
      'bg-rozgo-100 hover:bg-rozgo-200 text-rozgo-900 dark:bg-darkbg-card dark:text-rozgo-200 dark:hover:bg-darkbg-cardHover border border-rozgo-200 dark:border-darkbg-border',
    outline:
      'bg-transparent border-2 border-rozgo-900 text-rozgo-900 hover:bg-rozgo-50 dark:border-rozgo-400 dark:text-rozgo-300 dark:hover:bg-darkbg-surface',
    danger:
      'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60',
    ghost:
      'bg-transparent hover:bg-neutral-100 dark:hover:bg-darkbg-card text-neutral-700 dark:text-neutral-200',
    success:
      'bg-emerald-700 hover:bg-emerald-800 text-white shadow-soft dark:bg-emerald-600',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

