import React from 'react';
import { Award, Clock, CheckCircle } from 'lucide-react';
import { WorkerExperienceItem } from '../../types';

interface ExperienceSectionProps {
  totalYears: number;
  breakdown?: WorkerExperienceItem[];
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  totalYears,
  breakdown = [],
}) => {
  return (
    <div className="bg-white dark:bg-darkbg-card rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-neutral-900 dark:text-white">
          Trade Experience
        </h3>
        <span className="text-xs font-black uppercase tracking-wider text-[#123B32] dark:text-rozgo-300 bg-rozgo-100 dark:bg-rozgo-900/40 px-3 py-1 rounded-full border border-rozgo-200 dark:border-rozgo-800">
          {totalYears}+ Years Total
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {breakdown.length > 0 ? (
          breakdown.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-100 dark:border-darkbg-border"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rozgo-100 dark:bg-rozgo-900/40 flex items-center justify-center text-[#123B32] dark:text-rozgo-300">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  {item.area}
                </span>
              </div>
              <span className="text-xs font-mono font-black text-neutral-600 dark:text-neutral-400 bg-white dark:bg-darkbg-card px-2.5 py-1 rounded-xl border border-neutral-200 dark:border-darkbg-border">
                {item.years} yrs
              </span>
            </div>
          ))
        ) : (
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface text-xs text-neutral-500">
            {totalYears} years of verified field service experience.
          </div>
        )}
      </div>
    </div>
  );
};

