import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog box */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidthStyles[maxWidth]} bg-white dark:bg-darkbg-card rounded-3xl shadow-2xl border border-neutral-200 dark:border-darkbg-border p-6 sm:p-8 z-10 my-8 transition-transform duration-200 scale-100`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-darkbg-border mb-5">
          {title && (
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            className="no-print p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-darkbg-surface transition-colors ml-auto"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
};

