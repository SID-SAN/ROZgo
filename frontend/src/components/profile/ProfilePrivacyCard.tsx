import React from 'react';
import { Eye, Shield, Check } from 'lucide-react';

interface ProfilePrivacyCardProps {
  visibility: 'all_employers' | 'only_requested';
  onUpdateVisibility: (vis: 'all_employers' | 'only_requested') => void;
}

export const ProfilePrivacyCard: React.FC<ProfilePrivacyCardProps> = ({
  visibility = 'all_employers',
  onUpdateVisibility,
}) => {
  return (
    <div className="bg-white dark:bg-darkbg-card rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-3.5 text-left">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-[#123B32] dark:text-rozgo-300" />
        <h3 className="text-base font-black text-neutral-900 dark:text-white">
          Profile Visibility & Privacy
        </h3>
      </div>

      <p className="text-xs text-neutral-500">
        Control who can discover your profile card and search for your Labour ID.
      </p>

      <div className="space-y-2">
        {/* Option 1: All employers */}
        <label
          onClick={() => onUpdateVisibility('all_employers')}
          className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-colors ${
            visibility === 'all_employers'
              ? 'border-[#123B32] bg-rozgo-50/50 dark:bg-rozgo-950/20'
              : 'border-neutral-200 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface'
          }`}
        >
          <input
            type="radio"
            name="privacy_visibility"
            checked={visibility === 'all_employers'}
            onChange={() => onUpdateVisibility('all_employers')}
            className="w-4 h-4 mt-0.5 text-[#123B32] focus:ring-[#123B32]"
          />
          <div>
            <p className="text-xs font-bold text-neutral-900 dark:text-white">
              All ROZGO Employers (Recommended)
            </p>
            <p className="text-[11px] text-neutral-500">
              Appear in nearby search results and allow employers to hire directly using your Labour ID.
            </p>
          </div>
        </label>

        {/* Option 2: Only after response */}
        <label
          onClick={() => onUpdateVisibility('only_requested')}
          className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-colors ${
            visibility === 'only_requested'
              ? 'border-[#123B32] bg-rozgo-50/50 dark:bg-rozgo-950/20'
              : 'border-neutral-200 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface'
          }`}
        >
          <input
            type="radio"
            name="privacy_visibility"
            checked={visibility === 'only_requested'}
            onChange={() => onUpdateVisibility('only_requested')}
            className="w-4 h-4 mt-0.5 text-[#123B32] focus:ring-[#123B32]"
          />
          <div>
            <p className="text-xs font-bold text-neutral-900 dark:text-white">
              Only After I Respond to a Request
            </p>
            <p className="text-[11px] text-neutral-500">
              Profile remains unlisted until you accept an incoming gig alert or send an estimate.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

