import React from 'react';
import { ShieldCheck, CheckCircle2, X, Lock } from 'lucide-react';
import { WorkerProfile } from '../../types';

interface VerifiedBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: WorkerProfile;
}

export const VerifiedBadgeModal: React.FC<VerifiedBadgeModalProps> = ({ isOpen, onClose, worker }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-darkbg-card rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-neutral-200 dark:border-darkbg-border animate-scaleUp text-left">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                Verified Profile
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                ROZGO Trust & Authenticity Guarantee
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-darkbg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verified Items List */}
        <div className="space-y-3 pt-2">
          {/* 1. Mobile Number */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white">
                Mobile Number Verified
              </p>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                Direct OTP authentication verified on registration.
              </p>
            </div>
          </div>

          {/* 2. Identity Verification */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white">
                Identity Verified
              </p>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                Government identity document authenticated by ROZGO cooperative desk.
              </p>
            </div>
          </div>

          {/* 3. Profile & Trade Verification */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white">
                Profile & Trade Verified
              </p>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                Active worker registered with verified trade experience and reviews.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
            To ensure worker dignity and safety, original ID photos and raw numbers are never exposed to employers.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-[#123B32] hover:bg-[#0d2822] text-white text-xs font-bold transition-colors shadow-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
};

