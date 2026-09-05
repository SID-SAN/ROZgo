import React, { useState } from 'react';
import { Copy, Check, ShieldCheck } from 'lucide-react';

interface LabourBadgeProps {
  labourNumber?: string;
  showCopy?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const LabourBadge: React.FC<LabourBadgeProps> = ({
  labourNumber,
  showCopy = true,
  size = 'md',
}) => {
  const [copied, setCopied] = useState(false);

  if (!labourNumber) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-100/80 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 shadow-xs">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
        <span>Issued After Verification</span>
      </span>
    );
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(labourNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3.5 py-1.5',
    lg: 'text-base sm:text-lg px-4 sm:px-5 py-2 sm:py-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`inline-flex items-center gap-2 rounded-xl sm:rounded-2xl font-mono font-bold tracking-wider bg-rozgo-100 text-rozgo-950 dark:bg-rozgo-950/80 dark:text-rozgo-200 border border-rozgo-300 dark:border-rozgo-700/80 shadow-xs ${sizeClasses[size]}`}
      >
        <ShieldCheck className={`${iconSizes[size]} text-rozgo-700 dark:text-rozgo-400 flex-shrink-0`} />
        <span>{labourNumber}</span>

        {showCopy && (
          <button
            type="button"
            onClick={handleCopy}
            className="ml-1 p-1 rounded-md hover:bg-rozgo-200 dark:hover:bg-rozgo-800 text-rozgo-900 dark:text-rozgo-200 transition-colors focus:outline-none"
            title="Copy Labour Number"
            aria-label="Copy Labour Number"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
      {copied && (
        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 animate-fadeIn">
          Copied!
        </span>
      )}
    </div>
  );
};

