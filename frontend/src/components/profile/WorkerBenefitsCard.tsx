import React from 'react';
import { HeartHandshake, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { WorkerBenefitItem } from '../../types';

interface WorkerBenefitsCardProps {
  benefits?: WorkerBenefitItem[];
}

export const WorkerBenefitsCard: React.FC<WorkerBenefitsCardProps> = ({ benefits = [] }) => {
  return (
    <div className="bg-white dark:bg-darkbg-card rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-[#123B32] dark:text-rozgo-300" />
          <h3 className="text-base font-black text-neutral-900 dark:text-white">
            Government & Worker Benefits
          </h3>
        </div>
        <span className="text-[11px] font-bold text-neutral-400">Information & Schemes</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {benefits.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200/80 dark:border-darkbg-border space-y-1.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300">
                  {item.category}
                </span>
                {item.status === 'active' && (
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Active ✓
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white mt-1">
                {item.title}
              </h4>
              <p className="text-[11px] text-neutral-500 leading-snug mt-0.5">
                {item.description}
              </p>
            </div>

            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#123B32] dark:text-rozgo-300 hover:underline pt-2"
              >
                <span>Portal Details</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

