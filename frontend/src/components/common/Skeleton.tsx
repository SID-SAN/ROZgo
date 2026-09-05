import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
}) => {
  const variantStyles = {
    rectangular: 'rounded-2xl',
    circular: 'rounded-full',
    text: 'rounded-md h-4',
  };

  return (
    <div
      className={`animate-pulse bg-neutral-200/80 dark:bg-darkbg-border/60 ${variantStyles[variant]} ${className}`}
    />
  );
};

