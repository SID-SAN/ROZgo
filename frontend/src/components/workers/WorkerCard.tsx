import React from 'react';
import { MapPin, Phone, ShieldCheck, Star } from 'lucide-react';
import { WorkerProfile } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LabourBadge } from './LabourBadge';
import { Badge } from '../common/Badge';

interface WorkerCardProps {
  worker: WorkerProfile;
  onCall: (worker: WorkerProfile) => void;
  onSelect?: (worker: WorkerProfile) => void;
  isCompact?: boolean;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  onCall,
  onSelect,
  isCompact = false,
}) => {
  return (
    <Card variant="interactive" padding={isCompact ? 'sm' : 'md'} className="flex flex-col justify-between">
      <div>
        {/* Top: Avatar, Name, Verification, Rating */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-rozgo-100 dark:border-darkbg-border shadow-xs"
            />
            {worker.isVerified && (
              <span
                className="absolute -bottom-1 -right-1 bg-rozgo-900 text-white p-1 rounded-full shadow-xs"
                title="Verified Labour Identity"
              >
                <ShieldCheck className="w-4 h-4 text-rozgo-200" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white truncate">
                {worker.name}
              </h4>
              <Badge variant="verified" size="sm">
                Verified
              </Badge>
            </div>

            <div className="mt-1 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center gap-1 font-bold text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{worker.rating.toFixed(1)}</span>
              </div>
              <span className="text-neutral-300 dark:text-neutral-600">•</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {worker.completedJobsCount} jobs completed
              </span>
            </div>

            <div className="mt-1.5 flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <MapPin className="w-3.5 h-3.5 text-rozgo-700 dark:text-rozgo-400 flex-shrink-0" />
              <span className="truncate">{worker.location} ({worker.distanceKm} km away)</span>
            </div>
          </div>
        </div>

        {/* Labour Number */}
        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-darkbg-border flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            Labour ID:
          </div>
          <LabourBadge labourNumber={worker.labourNumber} size="sm" />
        </div>

        {/* Skills Pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {worker.skills.map((skill) => (
            <span
              key={skill}
              className="text-xs px-2.5 py-0.5 rounded-lg font-medium bg-neutral-100 dark:bg-darkbg-surface text-neutral-700 dark:text-neutral-300 capitalize"
            >
              {skill.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-darkbg-border flex items-center gap-2">
        <Button
          variant="primary"
          size="md"
          fullWidth
          leftIcon={<Phone className="w-4 h-4" />}
          onClick={(e) => {
            e.stopPropagation();
            onCall(worker);
          }}
        >
          Call Worker
        </Button>
        {onSelect && (
          <Button
            variant="secondary"
            size="md"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(worker);
            }}
          >
            Profile
          </Button>
        )}
      </div>
    </Card>
  );
};

