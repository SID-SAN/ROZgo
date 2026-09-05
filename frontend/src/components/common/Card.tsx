import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'lg',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10',
  };

  const variantStyles = {
    default:
      'bg-white dark:bg-darkbg-card border border-neutral-200/80 dark:border-darkbg-border shadow-soft',
    elevated:
      'bg-white dark:bg-darkbg-card border border-neutral-100 dark:border-darkbg-border shadow-soft-lg',
    bordered:
      'bg-transparent border-2 border-rozgo-200 dark:border-darkbg-border',
    interactive:
      'bg-white dark:bg-darkbg-card border border-neutral-200/90 dark:border-darkbg-border shadow-soft hover:shadow-card-hover hover:border-rozgo-300 dark:hover:border-rozgo-500 hover:-translate-y-1 transition-all duration-300 cursor-pointer',
  };

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl transition-colors duration-200 ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

