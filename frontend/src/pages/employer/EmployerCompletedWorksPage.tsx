import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Printer,
  Calendar,
  MapPin,
  Star,
  Users,
  CheckCircle2,
  Phone,
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useLanguage } from '../../context/LanguageContext';
import { BookingAgreement } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { BookingAgreementModal } from '../../components/bookings/BookingAgreementModal';

export const EmployerCompletedWorksPage: React.FC = () => {
  const { completedAgreements } = useBooking();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedAgreement, setSelectedAgreement] = useState<BookingAgreement | null>(null);

  // Filter agreements by search and category
  const filteredAgreements = completedAgreements.filter((b) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      b.workTitle.toLowerCase().includes(query) ||
      (b.workers[0]?.name && b.workers[0].name.toLowerCase().includes(query)) ||
      b.bookingNumber.toLowerCase().includes(query) ||
      b.location.toLowerCase().includes(query);

    const matchesCategory = categoryFilter === 'all' || b.serviceCategory === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-left animate-fadeIn">
      {/* 1. TOP HEADER & BACK NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-darkbg-border">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => navigate('/employer/requests')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-rozgo-700 dark:text-rozgo-300 hover:text-rozgo-900 dark:hover:text-white hover:underline transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Bookings</span>
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
              All Completed Services History
            </h1>
            <Badge variant="success" size="md">
              {completedAgreements.length} Total Services
            </Badge>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            View full record of verified work agreements, payments, worker details, and ratings.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/employer/requests')}
        >
          My Bookings
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
            placeholder="Search by job title, worker name, location, or booking #..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-darkbg-border bg-white dark:bg-darkbg-card text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rozgo-700 dark:focus:ring-rozgo-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All Trades' },
            { id: 'plumber', label: 'Plumber' },
            { id: 'electrician', label: 'Electrician' },
            { id: 'carpenter', label: 'Carpenter' },
            { id: 'domestic_help', label: 'Domestic Help' },
            { id: 'painter', label: 'Painter' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-rozgo-900 text-white dark:bg-rozgo-200 dark:text-rozgo-950 shadow-xs'
                  : 'bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-darkbg-surface'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. LIST OF COMPLETED SERVICE CARDS */}
      <div className="space-y-4">
        {filteredAgreements.length > 0 ? (
          filteredAgreements.map((booking) => (
            <Card
              key={booking.id}
              variant="default"
              padding="lg"
              className="border border-neutral-200 dark:border-darkbg-border hover:border-rozgo-300 dark:hover:border-rozgo-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {booking.workTitle}
                  </h3>
                  <Badge variant="success" size="sm">
                    Completed
                  </Badge>
                  <span className="text-xs text-neutral-400">#{booking.bookingNumber}</span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                  {booking.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    {booking.date} • {booking.time}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rozgo-700" />
                    {booking.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    Worker: {booking.workers[0]?.name || 'Worker'} ({booking.workersCount} assigned)
                  </span>
                </div>
              </div>

              <div className="flex items-center sm:flex-col items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-darkbg-border">
                <div className="text-left sm:text-right">
                  <div className="text-xs text-neutral-400 uppercase font-semibold">Wage Paid</div>
                  <div className="text-xl font-black text-rozgo-900 dark:text-emerald-400">
                    ₹{booking.agreedWage.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>5.0</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Printer className="w-4 h-4 text-rozgo-700 dark:text-rozgo-300" />}
                    onClick={() => setSelectedAgreement(booking)}
                    title="View & Print Agreement"
                  >
                    Agreement
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card variant="default" padding="xl" className="text-center py-12 space-y-3">
            <p className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
              No completed work matches your search query or filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}
            >
              Reset Filters
            </Button>
          </Card>
        )}
      </div>

      {/* 4. MODAL: FULL AGREEMENT DOCUMENT POPUP FOR PRINTING / VIEWING */}
      {selectedAgreement && (
        <BookingAgreementModal
          isOpen={Boolean(selectedAgreement)}
          onClose={() => setSelectedAgreement(null)}
          agreement={selectedAgreement}
          isEmployerPerspective={true}
        />
      )}
    </div>
  );
};

export default EmployerCompletedWorksPage;
