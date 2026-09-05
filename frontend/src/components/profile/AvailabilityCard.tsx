import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle2, XCircle, X } from 'lucide-react';
import { WorkerAvailabilitySlot } from '../../types';
import { Button } from '../common/Button';

interface AvailabilityCardProps {
  schedule?: WorkerAvailabilitySlot[];
  onUpdateSchedule?: (newSchedule: WorkerAvailabilitySlot[]) => void;
  isEditable?: boolean;
}

const DEFAULT_SCHEDULE: WorkerAvailabilitySlot[] = [
  { day: 'Today', status: 'available', hours: '9:00 AM – 6:00 PM' },
  { day: 'Tomorrow', status: 'available', hours: '9:00 AM – 6:00 PM' },
  { day: 'Sunday', status: 'unavailable', hours: 'Rest day' },
];

export const AvailabilityCard: React.FC<AvailabilityCardProps> = ({
  schedule = DEFAULT_SCHEDULE,
  onUpdateSchedule,
  isEditable = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftSchedule, setDraftSchedule] = useState<WorkerAvailabilitySlot[]>(schedule);

  // Sync draftSchedule whenever schedule prop updates
  React.useEffect(() => {
    setDraftSchedule(schedule);
  }, [schedule]);

  const todaySlot = schedule.find((s) => s.day.toLowerCase() === 'today') || schedule[0] || {
    day: 'Today',
    status: 'available' as const,
    hours: '8:00 AM – 6:00 PM',
  };

  const isTodayAvailable = todaySlot.status === 'available';

  const handleQuickToggleToday = () => {
    if (!onUpdateSchedule) return;
    const nextStatus = isTodayAvailable ? 'unavailable' : 'available';
    const updated = (schedule.length > 0 ? schedule : DEFAULT_SCHEDULE).map((slot, idx) => {
      if (idx === 0 || slot.day.toLowerCase() === 'today') {
        return { ...slot, status: nextStatus as 'available' | 'unavailable' };
      }
      return slot;
    });
    onUpdateSchedule(updated);
  };

  const handleDraftToggleToday = () => {
    const updated = draftSchedule.map((slot, idx) => {
      if (idx === 0 || slot.day.toLowerCase() === 'today') {
        return {
          ...slot,
          status: (slot.status === 'available' ? 'unavailable' : 'available') as 'available' | 'unavailable',
        };
      }
      return slot;
    });
    setDraftSchedule(updated);
  };

  const handleSave = () => {
    if (onUpdateSchedule) {
      onUpdateSchedule(draftSchedule);
    }
    setIsModalOpen(false);
  };

  const draftTodaySlot = draftSchedule.find((s) => s.day.toLowerCase() === 'today') || draftSchedule[0] || todaySlot;
  const isDraftTodayAvailable = draftTodaySlot.status === 'available';

  return (
    <>
      <div className="bg-white dark:bg-darkbg-card rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-4 text-left">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="space-y-0.5">
            <h3 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#123B32] dark:text-emerald-400" />
              <span>Today&apos;s Work Availability</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Are you available to take customer work today?
            </p>
          </div>

          {isEditable && (
            <button
              type="button"
              onClick={() => {
                setDraftSchedule(schedule);
                setIsModalOpen(true);
              }}
              className="text-xs font-bold text-[#123B32] dark:text-emerald-400 hover:underline"
            >
              Update Hours
            </button>
          )}
        </div>

        {/* Highlighted Today Status Card */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isTodayAvailable
              ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                isTodayAvailable
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
              }`}
            >
              {isTodayAvailable ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Today
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black ${
                    isTodayAvailable
                      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isTodayAvailable ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                  <span>{isTodayAvailable ? 'Available Today' : 'Not Available Today'}</span>
                </span>
              </div>
              <p className="text-sm font-black text-neutral-900 dark:text-white mt-1">
                {isTodayAvailable
                  ? 'Ready for new work calls and employer bookings'
                  : 'Daily jobs are hidden • Resting or on another assignment'}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Working Hours: {todaySlot.hours || '8:00 AM – 6:00 PM'}</span>
              </p>
            </div>
          </div>

          {isEditable && (
            <Button
              type="button"
              variant={isTodayAvailable ? 'outline' : 'primary'}
              size="sm"
              onClick={handleQuickToggleToday}
              className={`shrink-0 font-black ${
                isTodayAvailable
                  ? 'border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300'
                  : '!bg-[#123B32] hover:!bg-[#0D2B24] text-white'
              }`}
            >
              {isTodayAvailable ? 'Mark Not Available' : 'Mark Available Today'}
            </Button>
          )}
        </div>
      </div>

      {/* Manage Today's Availability Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkbg-card rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-neutral-200 dark:border-darkbg-border animate-scaleUp text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#123B32] dark:text-emerald-400" />
                <span>Today&apos;s Availability</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Set your availability status for today. Changing this immediately controls whether employers can discover and contact you.
            </p>

            {/* Toggle options for Today */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  if (!isDraftTodayAvailable) handleDraftToggleToday();
                }}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-colors ${
                  isDraftTodayAvailable
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500'
                    : 'border-neutral-200 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-black text-neutral-900 dark:text-white">Available Today</p>
                    <p className="text-[11px] text-neutral-500">{draftTodaySlot.hours || '8:00 AM – 6:00 PM'}</p>
                  </div>
                </div>
                {isDraftTodayAvailable && (
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">Selected</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isDraftTodayAvailable) handleDraftToggleToday();
                }}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-colors ${
                  !isDraftTodayAvailable
                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 ring-2 ring-rose-500'
                    : 'border-neutral-200 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold text-sm">
                    ✕
                  </div>
                  <div>
                    <p className="text-xs font-black text-neutral-900 dark:text-white">Not Available Today</p>
                    <p className="text-[11px] text-neutral-500">Resting / Busy on other assignment</p>
                  </div>
                </div>
                {!isDraftTodayAvailable && (
                  <span className="text-xs font-black text-rose-700 dark:text-rose-300">Selected</span>
                )}
              </button>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="!bg-[#123B32] text-white font-bold"
                onClick={handleSave}
              >
                Save Availability
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

