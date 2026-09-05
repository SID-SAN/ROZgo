import React, { useState } from 'react';
import { Star, MessageSquare, X } from 'lucide-react';
import { Review } from '../../types';
import { Button } from '../common/Button';

interface RatingsReviewsSectionProps {
  rating: number;
  completedJobsCount: number;
  reviews: Review[];
}

export const RatingsReviewsSection: React.FC<RatingsReviewsSectionProps> = ({
  rating,
  completedJobsCount,
  reviews = [],
}) => {
  const [isAllReviewsModalOpen, setIsAllReviewsModalOpen] = useState(false);

  // Breakdown statistics (calculated or realistic demo distribution)
  const breakdown = [
    { stars: 5, count: 34, pct: 81 },
    { stars: 4, count: 6, pct: 14 },
    { stars: 3, count: 2, pct: 5 },
    { stars: 2, count: 0, pct: 0 },
    { stars: 1, count: 0, pct: 0 },
  ];

  return (
    <>
      <div className="bg-white dark:bg-darkbg-card rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-5 text-left">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Ratings & Reviews</span>
          </h3>

          {reviews.length > 2 && (
            <button
              type="button"
              onClick={() => setIsAllReviewsModalOpen(true)}
              className="text-xs font-bold text-[#123B32] dark:text-rozgo-300 hover:underline"
            >
              View All ({reviews.length})
            </button>
          )}
        </div>

        {/* Top Summary & Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-100 dark:border-darkbg-border">
          {/* Left score */}
          <div className="md:col-span-4 text-center md:text-left space-y-1">
            <div className="flex items-baseline justify-center md:justify-start gap-2">
              <span className="text-4xl font-black text-neutral-900 dark:text-white">
                {rating.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-neutral-400">/ 5</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs font-bold text-neutral-500 pt-1">
              Based on {completedJobsCount} completed jobs
            </p>
          </div>

          {/* Right bars */}
          <div className="md:col-span-8 space-y-1.5">
            {breakdown.map((row) => (
              <div key={row.stars} className="flex items-center gap-2.5 text-xs">
                <span className="w-7 font-bold text-neutral-600 dark:text-neutral-400 flex items-center gap-0.5">
                  <span>{row.stars}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#123B32] dark:bg-rozgo-400 h-full rounded-full"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="w-6 text-right font-mono font-bold text-neutral-500 text-[11px]">
                  {row.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reviews (First 2) */}
        <div className="space-y-3 pt-1">
          {reviews.length > 0 ? (
            reviews.slice(0, 2).map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-neutral-900 dark:text-white">
                      {rev.authorName}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-darkbg-surface text-neutral-600 dark:text-neutral-400">
                      Employer
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400">{rev.date}</span>
                </div>

                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-700'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-neutral-700 dark:text-neutral-300 italic leading-relaxed">
                  "{rev.comment}"
                </p>

                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rev.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-rozgo-50 dark:bg-rozgo-950/40 text-[#123B32] dark:text-rozgo-300 font-semibold"
                      >
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface text-center space-y-1">
              <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">No reviews yet.</p>
              <p className="text-[11px] text-neutral-500">
                Complete your first ROZGO job to receive employer feedback and ratings.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* View All Reviews Modal */}
      {isAllReviewsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkbg-card rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-neutral-200 dark:border-darkbg-border animate-scaleUp text-left">
            <div className="flex items-center justify-between sticky top-0 bg-white/95 dark:bg-darkbg-card/95 py-1 z-10">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                  Customer Reviews ({reviews.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAllReviewsModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-100 dark:border-darkbg-border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-900 dark:text-white">
                      {rev.authorName}
                    </span>
                    <span className="text-[11px] text-neutral-400">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsAllReviewsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

