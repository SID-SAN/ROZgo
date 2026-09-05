import React from 'react';
import { Lock, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WorkerProfile } from '../../types';

interface PrivateVerificationCardProps {
  worker: WorkerProfile;
}

export const PrivateVerificationCard: React.FC<PrivateVerificationCardProps> = ({ worker }) => {
  const maskedAadhaar =
    worker.verificationDetails?.maskedIdentifier ||
    worker.verificationDetails?.aadhaarMasked ||
    'XXXX XXXX 4821';

  return (
    <div className="bg-white dark:bg-darkbg-card rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#123B32] dark:text-rozgo-300" />
          <h3 className="text-base font-black text-neutral-900 dark:text-white">
            Document Verification
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-500 bg-neutral-100 dark:bg-darkbg-surface px-2.5 py-0.5 rounded-full">
          <Lock className="w-3 h-3" />
          <span>Private to you</span>
        </span>
      </div>

      <p className="text-xs text-neutral-500 leading-relaxed">
        Your sensitive identity data is encrypted. Employers will only ever see your <strong>"Verified Worker ✓"</strong> badge and ROZGO Labour ID.
      </p>

      {/* Verification Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Mobile */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-100 dark:border-darkbg-border flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-neutral-900 dark:text-white">Mobile Number</p>
            <p className="text-[11px] text-neutral-500">{worker.phone}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified</span>
          </span>
        </div>

        {/* Identity Document */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-100 dark:border-darkbg-border flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-neutral-900 dark:text-white">Aadhaar Card</p>
            <p className="text-[11px] font-mono text-rozgo-900 dark:text-rozgo-300 font-bold tracking-wider">{maskedAadhaar}</p>
          </div>
          {worker.isVerified ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified</span>
            </span>
          ) : (
            <Link
              to="/worker/verify"
              className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full hover:underline"
            >
              Verify Now
            </Link>
          )}
        </div>

        {/* e-Shram */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-100 dark:border-darkbg-border flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-neutral-900 dark:text-white">e-Shram National UAN</p>
            <p className="text-[11px] text-neutral-500">
              {worker.verifiedItems?.eshram ? 'Linked to Central Portal' : 'Not Linked'}
            </p>
          </div>
          {worker.verifiedItems?.eshram ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Linked</span>
            </span>
          ) : (
            <a
              href="https://eshram.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#123B32] hover:underline"
            >
              <span>Learn / Connect</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Certificates */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-100 dark:border-darkbg-border flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-neutral-900 dark:text-white">Skill Certificates</p>
            <p className="text-[11px] text-neutral-500">
              {worker.certifications?.length || 2} credentials registered
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>2 Verified</span>
          </span>
        </div>
      </div>
    </div>
  );
};

