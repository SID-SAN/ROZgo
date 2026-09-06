import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, FileText, CheckCircle2, Phone, Calendar, Clock, Star, Users, Printer, ShieldAlert, ArrowRight, Layers } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useGrievance } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { ActiveBookingCard } from '../../components/bookings/ActiveBookingCard';
import { BookingAgreementModal } from '../../components/bookings/BookingAgreementModal';
import { RatingReviewModal } from '../../components/bookings/RatingReviewModal';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { BookingAgreement } from '../../types';

export const MyRequestsPage: React.FC = () => {
  const {
    activeAgreements,
    completedAgreements,
    markWorkCompleted,
    submitReview,
    employerRejectBooking,
  } = useBooking();
  const { activeGrievancesCount } = useGrievance();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [viewingAgreement, setViewingAgreement] = useState<BookingAgreement | null>(null);
  const [ratingBooking, setRatingBooking] = useState<BookingAgreement | null>(null);
  const [viewingCompletedAgreement, setViewingCompletedAgreement] = useState<BookingAgreement | null>(null);

  // Active bookings (in progress or awaiting confirmation)
  const activeJobs = activeAgreements.filter(
    (b) => b.status !== 'completed' && b.status !== 'rejected'
  );

  const handleCompleteWork = (booking: BookingAgreement) => {
    markWorkCompleted(booking.id);
    setRatingBooking(booking);
  };

  const handleCallWorker = (booking: BookingAgreement) => {
    const phone = (booking.workers[0]?.phone || '').replace(/[^0-9+]/g, '');
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-darkbg-border">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            My Work Bookings & Requests
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Track active jobs across trades, call workers directly, view agreements, and rate completed tasks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/employer')}
            className="font-bold whitespace-nowrap shadow-sm"
          >
            + Book Another Trade / Worker
          </Button>
        </div>
      </div>

      {/* 1. ACTIVE BOOKING SECTION (SUPPORTS MULTIPLE SIMULTANEOUS JOBS) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Active Jobs & Requests in Progress
            </h2>
            {activeJobs.length > 0 && (
              <Badge variant={activeJobs.length > 1 ? 'primary' : 'success'} size="sm">
                {activeJobs.length} Active {activeJobs.length === 1 ? 'Job' : 'Jobs'}
              </Badge>
            )}
          </div>

          {activeJobs.length > 1 && (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rozgo-800 dark:text-rozgo-300">
              <Layers className="w-3.5 h-3.5" />
              <span>Simultaneous Multi-Trade Booking Active</span>
            </div>
          )}
        </div>

        {activeJobs.length > 0 ? (
          <div className="space-y-6">
            {activeJobs.map((booking) => (
              <ActiveBookingCard
                key={booking.id}
                booking={booking}
                role="employer"
                onCall={() => handleCallWorker(booking)}
                onViewAgreement={() => setViewingAgreement(booking)}
                onCompleteWork={() => handleCompleteWork(booking)}
                onRejectBooking={() => employerRejectBooking('Cancelled by employer', booking.id)}
              />
            ))}
          </div>
        ) : (
          <Card variant="default" padding="xl" className="text-center py-12">
            <p className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
              You don't have an active booking right now.
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Select any household trade service or multiple fields to find verified workers nearby.
            </p>
            <Button
              variant="primary"
              size="md"
              className="mt-5"
              onClick={() => navigate('/employer')}
            >
              Find Workers
            </Button>
          </Card>
        )}
      </section>

      {/* 2. COMPLETED BOOKINGS HISTORY (RECENT 5) */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Completed Services History
            </h2>
            {completedAgreements.length > 0 && (
              <Badge variant="neutral" size="sm">
                Recent {Math.min(5, completedAgreements.length)} of {completedAgreements.length}
              </Badge>
            )}
          </div>
          {completedAgreements.length > 0 && (
            <Link
              to="/employer/completed-services"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-rozgo-700 dark:text-rozgo-300 hover:text-rozgo-900 dark:hover:text-white hover:underline transition-colors"
            >
              <span>View All History ({completedAgreements.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="space-y-3">
          {completedAgreements.length > 0 ? (
            <>
              {completedAgreements.slice(0, 5).map((booking) => (
                <Card
                  key={booking.id}
                  variant="default"
                  padding="lg"
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-rozgo-200 dark:hover:border-rozgo-800 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                        {booking.workTitle}
                      </h3>
                      <Badge variant="success" size="sm">
                        Completed
                      </Badge>
                      <span className="text-xs text-neutral-400">#{booking.bookingNumber}</span>
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {booking.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 pt-1">
                      <span>Date: {booking.date}</span>
                      <span>•</span>
                      <span>Worker: {booking.workers[0]?.name}</span>
                      <span>•</span>
                      <span>{booking.workersCount} worker(s)</span>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col items-end justify-between sm:justify-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-darkbg-border">
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-neutral-400">Paid Direct Wage</div>
                      <div className="text-xl font-black text-rozgo-900 dark:text-emerald-400">
                        ₹{booking.agreedWage.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hidden sm:inline">
                        ✓ Rated ★★★★★
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Printer className="w-4 h-4 text-rozgo-700 dark:text-rozgo-300" />}
                        onClick={() => setViewingCompletedAgreement(booking)}
                        title="Print Agreement"
                      >
                        Print Agreement
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {completedAgreements.length > 5 && (
                <div className="pt-2 text-center">
                  <Link
                    to="/employer/completed-services"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-darkbg-card dark:hover:bg-darkbg-border text-neutral-900 dark:text-white font-bold text-sm transition-all border border-neutral-200 dark:border-darkbg-border shadow-xs"
                  >
                    <span>View All {completedAgreements.length} Completed Services</span>
                    <ArrowRight className="w-4 h-4 text-rozgo-600" />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-neutral-500">No completed jobs recorded yet.</p>
          )}
        </div>
      </section>

      {/* 3. EMPLOYER HELP & GRIEVANCE REDRESSAL BANNER */}
      <section className="space-y-4">
        <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl text-rozgo-200 border border-white/10 shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg sm:text-xl font-bold">
                  Work Dispute or Booking Concern?
                </h3>
                {activeGrievancesCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-neutral-900">
                    {activeGrievancesCount} Active
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-xl leading-relaxed">
                If a worker did not arrive, work quality issues occurred, or there was a disagreement over payment, report it to the ROZGO Neutral Redressal Cell for mediation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              to="/grievances/new"
              className="flex-1 md:flex-none text-center px-5 py-3 rounded-2xl bg-white text-neutral-900 hover:bg-neutral-100 font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              Report an Issue
            </Link>
            <Link
              to="/grievances/my"
              className="flex-1 md:flex-none text-center px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all"
            >
              My Grievance Tickets
            </Link>
          </div>
        </div>
      </section>

      {/* Agreement View Modal */}
      {viewingAgreement && (
        <BookingAgreementModal
          isOpen={Boolean(viewingAgreement)}
          onClose={() => setViewingAgreement(null)}
          agreement={
            activeAgreements.find(
              (a) => a.id === viewingAgreement.id || a.bookingNumber === viewingAgreement.bookingNumber
            ) || viewingAgreement
          }
          isEmployerPerspective={true}
          onEmployerReject={() => {
            employerRejectBooking('Cancelled by employer', viewingAgreement.id);
            setViewingAgreement(null);
          }}
        />
      )}

      {/* Completed Agreement View & Print Modal */}
      {viewingCompletedAgreement && (
        <BookingAgreementModal
          isOpen={Boolean(viewingCompletedAgreement)}
          onClose={() => setViewingCompletedAgreement(null)}
          agreement={viewingCompletedAgreement}
        />
      )}

      {/* Review Modal */}
      {ratingBooking && (
        <RatingReviewModal
          isOpen={Boolean(ratingBooking)}
          onClose={() => setRatingBooking(null)}
          onSubmit={(rating, comment, tags) => {
            submitReview(ratingBooking.id, rating, comment, tags);
            setRatingBooking(null);
          }}
          targetName={ratingBooking.workers[0]?.name || 'Worker'}
          role="employer"
        />
      )}
    </div>
  );
};
