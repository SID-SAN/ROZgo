import React, { useState } from 'react';
import {
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  MapPin,
  Users,
  Clock,
  Phone,
  X,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { JobRecommendation } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface JobSwipeCardProps {
  job: JobRecommendation;
  onCall: (job: JobRecommendation) => void;
  onReject: () => void;
  onAccept?: (job: JobRecommendation) => void;
  isSearchingNext?: boolean;
}

export const JobSwipeCard: React.FC<JobSwipeCardProps> = ({
  job,
  onCall,
  onReject,
  onAccept,
  isSearchingNext = false,
}) => {
  const { t } = useLanguage();
  const [swipeOffset, setSwipeOffset] = useState(0);

  const getDifficultyBadge = (level: string) => {
    switch (level) {
      case 'Easy':
        return <Badge variant="success">Easy</Badge>;
      case 'Intermediate':
        return <Badge variant="warning">Intermediate</Badge>;
      case 'High':
        return <Badge variant="primary">High Complexity</Badge>;
      default:
        return <Badge variant="neutral">{level}</Badge>;
    }
  };

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'plumber':
        return <Wrench className="w-6 h-6 text-teal-600 dark:text-teal-400" />;
      case 'electrician':
        return <Zap className="w-6 h-6 text-amber-500" />;
      case 'carpenter':
        return <Hammer className="w-6 h-6 text-orange-600 dark:text-orange-400" />;
      case 'painter':
        return <Paintbrush className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <Wrench className="w-6 h-6 text-rozgo-700" />;
    }
  };

  if (isSearchingNext) {
    return (
      <Card
        variant="elevated"
        padding="xl"
        className="text-center py-16 flex flex-col items-center justify-center min-h-[380px]"
      >
        <div className="w-16 h-16 rounded-full bg-rozgo-100 dark:bg-darkbg-surface flex items-center justify-center mb-4 animate-spin">
          <RotateCcw className="w-8 h-8 text-rozgo-900 dark:text-rozgo-300" />
        </div>
        <h4 className="text-xl font-bold text-neutral-900 dark:text-white">
          Finding Your Next Trade Match...
        </h4>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-sm">
          Looking for pending requests near your registered area matching your trade skills.
        </p>
      </Card>
    );
  }

  return (
    <div className="relative select-none transition-transform duration-200">
      <Card
        variant="elevated"
        padding="lg"
        className="relative overflow-hidden border-2 border-rozgo-200 dark:border-darkbg-border shadow-soft-lg"
      >
        {/* Top Header Label */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-darkbg-border mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black tracking-wider uppercase text-rozgo-900 dark:text-rozgo-300">
              YOUR NEXT JOB OPPORTUNITY
            </span>
          </div>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
            Posted {job.postedAt}
          </span>
        </div>

        {/* Trade & Title */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-rozgo-50 dark:bg-darkbg-surface border border-rozgo-100 dark:border-darkbg-border flex items-center justify-center flex-shrink-0">
            {getServiceIcon(job.serviceCategory)}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {job.serviceCategory}
              </span>
              {getDifficultyBadge(job.difficulty)}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              {job.subcategory}
            </h3>
          </div>
        </div>

        {/* Task description */}
        <p className="text-neutral-700 dark:text-neutral-300 text-sm sm:text-base leading-relaxed mb-6 bg-neutral-50 dark:bg-darkbg-surface/60 p-4 rounded-2xl border border-neutral-200/60 dark:border-darkbg-border">
          "{job.description}"
        </p>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 text-sm">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-darkbg-card border border-neutral-200/80 dark:border-darkbg-border">
            <MapPin className="w-4 h-4 text-rozgo-700 dark:text-rozgo-400 flex-shrink-0" />
            <div className="truncate">
              <div className="text-[11px] text-neutral-400 uppercase font-bold">Distance</div>
              <div className="font-bold text-neutral-900 dark:text-white">{job.distanceKm} km away</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-darkbg-card border border-neutral-200/80 dark:border-darkbg-border">
            <Users className="w-4 h-4 text-rozgo-700 dark:text-rozgo-400 flex-shrink-0" />
            <div>
              <div className="text-[11px] text-neutral-400 uppercase font-bold">Labour Req</div>
              <div className="font-bold text-neutral-900 dark:text-white">{job.workersNeeded} worker(s)</div>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-darkbg-card border border-neutral-200/80 dark:border-darkbg-border">
            <Clock className="w-4 h-4 text-rozgo-700 dark:text-rozgo-400 flex-shrink-0" />
            <div className="truncate">
              <div className="text-[11px] text-neutral-400 uppercase font-bold">Preferred Time</div>
              <div className="font-bold text-neutral-900 dark:text-white truncate">{job.preferredTime}</div>
            </div>
          </div>
        </div>

        {/* Employer Reference & Large Location */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rozgo-50/70 dark:bg-darkbg-surface/70 border border-rozgo-100 dark:border-darkbg-border mb-6">
          <div>
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Employer
            </div>
            <div className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span>{job.employerName}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="sm:text-right">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex sm:justify-end items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rozgo-700 dark:text-rozgo-400" />
              <span>Location</span>
            </div>
            <div className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
              {job.location}
            </div>
          </div>
        </div>

        {/* Direct Action Buttons: Equal-sized 3 column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-100 dark:border-darkbg-border">
          <Button
            variant="primary"
            size="lg"
            className="w-full text-sm sm:text-base font-bold shadow-xs justify-center"
            leftIcon={<Phone className="w-5 h-5 text-rozgo-200" />}
            onClick={() => onCall(job)}
          >
            {t('workerDashboard.callEmployer')}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-transparent shadow-xs text-sm sm:text-base justify-center"
            leftIcon={<Check className="w-5 h-5 text-white" />}
            onClick={() => (onAccept ? onAccept(job) : onCall(job))}
          >
            {t('workerDashboard.acceptWork')}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full border-neutral-300 dark:border-darkbg-border font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-darkbg-surface text-sm sm:text-base justify-center"
            leftIcon={<X className="w-5 h-5 text-neutral-500" />}
            onClick={onReject}
          >
            {t('workerDashboard.rejectNext')}
          </Button>
        </div>
      </Card>
    </div>
  );
};

