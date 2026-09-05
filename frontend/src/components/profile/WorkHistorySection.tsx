import React, { useState } from 'react';
import { History, Star, ArrowRight, ShieldAlert, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WorkerCompletedWorkItem } from '../../types';
import { Button } from '../common/Button';

interface WorkHistorySectionProps {
  works: WorkerCompletedWorkItem[];
}

export const WorkHistorySection: React.FC<WorkHistorySectionProps> = ({ works = [] }) => {
  const [isAllWorkModalOpen, setIsAllWorkModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-darkbg-card rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-[#123B32] dark:text-rozgo-300" />
              <span>Work History</span>
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-darkbg-surface text-neutral-600 dark:text-neutral-400">
              {works.length}
            </span>
          </div>

          {works.length > 2 && (
            <button
              type="button"
              onClick={() => setIsAllWorkModalOpen(true)}
              className="text-xs font-bold text-[#123B32] dark:text-rozgo-300 hover:underline"
            >
              View All Work ({works.length})
            </button>
          )}
        </div>

        {/* Works List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {works.length > 0 ? (
            works.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border space-y-2 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Employer: <strong>{item.employerName}</strong> • {item.completedDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{item.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="font-black text-[#123B32] dark:text-rozgo-300 font-mono text-sm">
                    ₹{item.wage.toLocaleString()}
                  </span>
                  <Link
                    to={`/grievances/new?bookingId=${item.id}&title=${encodeURIComponent(item.title)}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-400 hover:text-rose-600 transition-colors"
                    title="Report an issue regarding this booking"
                  >
                    <ShieldAlert className="w-3 h-3" />
                    <span>Report Issue</span>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="sm:col-span-2 p-6 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface text-center space-y-1">
              <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                No completed work yet.
              </p>
              <p className="text-[11px] text-neutral-500">
                Your completed ROZGO bookings and agreed wages will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* All Works Modal */}
      {isAllWorkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkbg-card rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-neutral-200 dark:border-darkbg-border animate-scaleUp text-left">
            <div className="flex items-center justify-between sticky top-0 bg-white/95 dark:bg-darkbg-card/95 py-1 z-10">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#123B32]" />
                <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                  Completed Work History ({works.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAllWorkModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {works.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{item.title}</h4>
                      <p className="text-xs text-neutral-500">
                        Employer: {item.employerName} • Completed {item.completedDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-black text-[#123B32] font-mono text-sm">
                      ₹{item.wage.toLocaleString()}
                    </span>
                    <Link
                      to={`/grievances/new?bookingId=${item.id}&title=${encodeURIComponent(item.title)}`}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Report a Problem
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsAllWorkModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

