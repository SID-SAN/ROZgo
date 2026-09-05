import React from 'react';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { WorkerProfile } from '../../types';
import { Button } from '../common/Button';

interface ProfileCompletionCardProps {
  worker: WorkerProfile;
  onCompleteProfile: () => void;
}

export const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({
  worker,
  onCompleteProfile,
}) => {
  // Calculate completion percentage dynamically
  let score = 0;
  const items = [
    { label: 'Basic Information', completed: Boolean(worker.name && worker.phone) },
    { label: 'Primary Skills', completed: Boolean(worker.skills && worker.skills.length > 0) },
    { label: 'Service Location', completed: Boolean(worker.location) },
    { label: 'Trade Experience', completed: Boolean(worker.experienceYears > 0) },
    { label: 'Identity Verification', completed: Boolean(worker.isVerified) },
    { label: 'Skill Certifications', completed: Boolean(worker.certifications && worker.certifications.length > 0) },
  ];

  const completedCount = items.filter((i) => i.completed).length;
  score = Math.round((completedCount / items.length) * 100);

  return (
    <div className="bg-white dark:bg-darkbg-card rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-neutral-900 dark:text-white">
              Profile Completion
            </h3>
            <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-[#123B32] text-white">
              {score}%
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            {score >= 90
              ? "You're all set! Your profile ranks prominently in employer searches."
              : "You're almost ready! Complete additional details to build stronger trust."}
          </p>
        </div>

        {score < 100 && (
          <Button
            variant="primary"
            size="sm"
            className="!bg-[#123B32] hover:!bg-[#0d2822] text-white font-bold whitespace-nowrap self-start sm:self-auto"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={onCompleteProfile}
          >
            Complete Profile
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-100 dark:bg-darkbg-surface h-2.5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out bg-[#123B32]"
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 font-medium">
            <CheckCircle2
              className={`w-4 h-4 flex-shrink-0 ${
                item.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-300 dark:text-neutral-600'
              }`}
            />
            <span
              className={
                item.completed
                  ? 'text-neutral-800 dark:text-neutral-200'
                  : 'text-neutral-400 dark:text-neutral-500'
              }
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

