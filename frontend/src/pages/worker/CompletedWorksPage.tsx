import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Printer,
  Calendar,
  MapPin,
  Star,
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useLanguage } from '../../context/LanguageContext';
import { BookingAgreement } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { BookingAgreementModal } from '../../components/bookings/BookingAgreementModal';

export const CompletedWorksPage: React.FC = () => {
  const { completedAgreements } = useBooking();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Intermediate' | 'High'>('all');
  const [selectedAgreement, setSelectedAgreement] = useState<BookingAgreement | null>(null);

  // Filter agreements by search and difficulty
  const filteredAgreements = completedAgreements.filter((b) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      b.workTitle.toLowerCase().includes(query) ||
      b.employerName.toLowerCase().includes(query) ||
      b.bookingNumber.toLowerCase().includes(query) ||
      b.location.toLowerCase().includes(query);

    const matchesDifficulty = difficultyFilter === 'all' || b.difficulty === difficultyFilter;
    return matchesQuery && matchesDifficulty;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-left animate-fadeIn">
      {/* 1. TOP HEADER & BACK NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-darkbg-border">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => navigate('/worker/dashboard')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-rozgo-700 dark:text-rozgo-300 hover:text-rozgo-900 dark:hover:text-white hover:underline transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
              All Completed Works History
            </h1>
            <Badge variant="success" size="md">
              {completedAgreements.length} Total Completed
            </Badge>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Verified cooperative work agreements, negotiated wages, and employer ratings.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/worker/dashboard')}
        >
          Dashboard
        </Button>
      </div>

      {/* 2. SEARCH & FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job title, employer, location, or booking #..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-darkbg-border bg-white dark:bg-darkbg-card text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rozgo-700 dark:focus:ring-rozgo-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'Easy', 'Intermediate', 'High'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                difficultyFilter === diff
                  ? 'bg-rozgo-900 text-white dark:bg-rozgo-200 dark:text-rozgo-950 shadow-xs'
                  : 'bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-darkbg-surface'
              }`}
            >
              {diff === 'all' ? 'All Difficulties' : diff}
            </button>
          ))}
        </div>
      </div>

      {/* 3. LIST OF ALL COMPLETED WORKS */}
      <div className="space-y-4">
        {filteredAgreements.length > 0 ? (
          filteredAgreements.map((booking) => (
            <Card
              key={booking.id}
              variant="default"
              padding="lg"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-neutral-200 dark:border-darkbg-border hover:border-rozgo-300 dark:hover:border-rozgo-700 transition-all hover:shadow-soft"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                    {booking.workTitle}
                  </h3>
                  <Badge variant="success" size="sm">
                    ✓ Completed
                  </Badge>
                  <span className="text-xs font-mono font-bold text-neutral-400 bg-neutral-100 dark:bg-darkbg-surface px-2 py-0.5 rounded-md">
                    #{booking.bookingNumber}
                  </span>
                  <Badge
                    variant={
                      booking.difficulty === 'Easy'
                        ? 'success'
                        : booking.difficulty === 'Intermediate'
                        ? 'warning'
                        : 'primary'
                    }
                    size="sm"
                  >
                    {booking.difficulty}
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                  {booking.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-rozgo-700 dark:text-rozgo-400" />
                    <span>{booking.date}</span>
                  </span>
                  <span>•</span>
                  <span>
                    Employer: <strong className="text-neutral-800 dark:text-neutral-200">{booking.employerName}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rozgo-700 dark:text-rozgo-400" />
                    <span>{booking.location}</span>
                  </span>
                </div>
              </div>

              {/* Right: Agreed Wage & Print CTA */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-darkbg-border flex-shrink-0">
                <div className="text-left sm:text-right">
                  <div className="text-xs text-neutral-400 uppercase font-bold">Agreed Direct Wage</div>
                  <div className="text-xl sm:text-2xl font-black text-rozgo-900 dark:text-emerald-400">
                    ₹{booking.agreedWage.toLocaleString()}
                  </div>
                  <div className="text-xs text-amber-500 font-bold flex items-center justify-start sm:justify-end gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>5.0 (Verified)</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Printer className="w-4 h-4 text-rozgo-700 dark:text-rozgo-300" />}
                  onClick={() => setSelectedAgreement(booking)}
                  title={t('workerDashboard.printAgreement')}
                >
                  {t('workerDashboard.printAgreement')}
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card variant="default" padding="xl" className="text-center py-16 space-y-3">
            <p className="text-base font-bold text-neutral-700 dark:text-neutral-300">
              No completed works matched your search or filters.
            </p>
            <p className="text-xs text-neutral-500">
              Try adjusting your search terms or filter selection.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setDifficultyFilter('all');
              }}
            >
              Reset Filters
            </Button>
          </Card>
        )}
      </div>

      {/* 4. AGREEMENT PREVIEW & PRINT MODAL */}
      {selectedAgreement && (
        <BookingAgreementModal
          isOpen={Boolean(selectedAgreement)}
          onClose={() => setSelectedAgreement(null)}
          agreement={selectedAgreement}
          isWorkerPerspective={true}
        />
      )}
    </div>
  );
};
