import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Star,
  CheckCircle2,
  Phone,
  ShieldCheck,
  AlertCircle,
  FileText,
  Printer,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { useGrievance } from '../../context/GrievanceContext';
import { JobSwipeCard } from '../../components/workers/JobSwipeCard';
import { LabourBadge } from '../../components/workers/LabourBadge';
import { ActiveBookingCard } from '../../components/bookings/ActiveBookingCard';
import { BookingAgreementModal } from '../../components/bookings/BookingAgreementModal';
import { WaitingForAgreementModal } from '../../components/bookings/WaitingForAgreementModal';
import { RatingReviewModal } from '../../components/bookings/RatingReviewModal';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { StarRating } from '../../components/common/StarRating';
import { JobRecommendation, BookingAgreement } from '../../types';

export const WorkerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { workerUser } = useAuth();
  const { t } = useLanguage();
  const {
    activeAgreement,
    completedAgreements,
    currentJob,
    isSearchingNextJob,
    workerNextJob,
    selectJobAsActiveAgreement,
    workerConfirmBooking,
    markWorkCompleted,
    submitReview,
  } = useBooking();
  const { activeGrievancesCount } = useGrievance();

  // Dialog states
  const [isWaitingAgreement, setIsWaitingAgreement] = useState(false);
  const [pendingCallJob, setPendingCallJob] = useState<JobRecommendation | null>(null);
  const [activeCallTarget, setActiveCallTarget] = useState<{
    name: string;
    phone: string;
    title: string;
  }>({ name: '', phone: '', title: '' });

  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [viewingCompletedAgreement, setViewingCompletedAgreement] = useState<BookingAgreement | null>(null);
  const [isVerificationDismissed, setIsVerificationDismissed] = useState(false);

  const isAvailableToday = (() => {
    if (workerUser.weeklySchedule && workerUser.weeklySchedule.length > 0) {
      const todaySlot = workerUser.weeklySchedule.find((s) => s.day.toLowerCase() === 'today');
      if (todaySlot) {
        return todaySlot.status === 'available';
      }
    }
    if (typeof workerUser.availableToday === 'boolean') {
      return workerUser.availableToday;
    }
    return workerUser.availability === 'Available Today';
  })();

  const handleAcceptWork = (job: JobRecommendation) => {
    setPendingCallJob(job);
    setActiveCallTarget({
      name: job.employerName,
      phone: job.employerPhone,
      title: job.subcategory,
    });
    setIsWaitingAgreement(true);
  };

  const handleCallEmployer = (job: JobRecommendation) => {
    setPendingCallJob(job);
    setActiveCallTarget({
      name: job.employerName,
      phone: job.employerPhone,
      title: job.subcategory,
    });
    const phone = job.employerPhone.replace(/[^0-9+]/g, '') || job.employerPhone;
    window.location.href = `tel:${phone}`;
    setIsWaitingAgreement(true);
  };

  const handleCallFromActiveBooking = () => {
    if (!activeAgreement) return;
    const phone = activeAgreement.employerPhone.replace(/[^0-9+]/g, '') || activeAgreement.employerPhone;
    window.location.href = `tel:${phone}`;
  };

  const handleCallAgreed = () => {
    // Open agreement review
    // Show "waiting for agreement details by employer"
    setIsWaitingAgreement(true);
  };

  const handleAgreementDetailsArrived = () => {
    setIsWaitingAgreement(false);
    if (pendingCallJob) {
      selectJobAsActiveAgreement(pendingCallJob, 1200);
      setPendingCallJob(null);
    }
    // Now show the agreement popup with Accept & Reject options
    setIsAgreementOpen(true);
  };

  const handleRejectCallNegotiation = () => {
    setIsWaitingAgreement(false);
    setPendingCallJob(null);
    workerNextJob();
  };

  const handleCompleteWork = () => {
    if (activeAgreement) {
      markWorkCompleted(activeAgreement.id);
      workerNextJob();
      setIsRatingOpen(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10 text-left">
      {/* 1. TOP SECTION: ACTION-ORIENTED GREETING */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 sm:py-4 px-5 sm:px-6 rounded-2xl sm:rounded-3xl bg-rozgo-50 dark:bg-darkbg-card border border-rozgo-200 dark:border-darkbg-border shadow-soft">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <h1 className="text-lg sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              {t('workerDashboard.greeting')}, {workerUser.name.split(' ')[0]}
            </h1>
            {workerUser.labourNumber && workerUser.isVerified ? (
              <Badge variant="verified" size="sm">
                Verified
              </Badge>
            ) : (
              <Badge variant="warning" size="sm">
                Verification Pending
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            {t('workerDashboard.readyPrompt')}
          </p>
        </div>

        {/* Right Most: Unique Worker Labour ID (if verified) or Verification Status */}
        <div className="flex-shrink-0 flex flex-col items-start sm:items-end gap-0.5">
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Worker ID
          </span>
          {workerUser.labourNumber ? (
            <LabourBadge labourNumber={workerUser.labourNumber} size="lg" />
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Issued After Verification</span>
            </div>
          )}
        </div>
      </div>

      {/* VERIFICATION CARD (SUPPORTS 4 STATES) */}
      {!workerUser.isVerified && workerUser.verificationStatus !== 'verified' && (
        <>
          {/* STATE 1: NOT VERIFIED */}
          {(!workerUser.verificationStatus || workerUser.verificationStatus === 'not_verified') && !isVerificationDismissed && (
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-darkbg-card border-2 border-amber-300 dark:border-amber-700/60 shadow-soft animate-fadeIn">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="space-y-2.5 flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-black tracking-wide border border-amber-300 dark:border-amber-700/50">
                    <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <span>Profile Not Verified</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white leading-snug">
                    Complete verification to build trust with employers and unlock more features.
                  </h3>
                  <div className="pt-1">
                    <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Why verify?
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Get &quot;Verified Worker&quot; badge</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Appear higher in search</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Build trust with employers</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto flex-shrink-0">
                  <Button
                    variant="primary"
                    size="lg"
                    className="!bg-[#123B32] hover:!bg-[#0D2B24] text-white shadow-md font-black whitespace-nowrap"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => navigate('/worker/verify')}
                  >
                    Verify My Profile
                  </Button>
                  <button
                    type="button"
                    onClick={() => setIsVerificationDismissed(true)}
                    className="text-xs font-semibold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 text-center py-1 transition-colors"
                  >
                    Dismiss for now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: IN PROGRESS / PENDING / IN REVIEW */}
          {(workerUser.verificationStatus === 'pending' || workerUser.verificationStatus === 'in_progress' || workerUser.verificationStatus === 'in_review') && (
            <div className="p-5 sm:p-6 rounded-3xl bg-amber-50/80 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-700/60 shadow-soft animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-200 dark:bg-amber-900/50 flex items-center justify-center text-amber-800 dark:text-amber-300 flex-shrink-0">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      <span>Verification in Progress</span>
                    </div>
                    <h4 className="text-base font-black text-neutral-900 dark:text-white">
                      Your documents are being verified by our team.
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                      This usually takes 2–4 hours.
                      {workerUser.verificationSubmittedAt && (
                        <span> Submitted on {new Date(workerUser.verificationSubmittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}.</span>
                      )}
                    </p>
                  </div>
                </div>
                <Link
                  to="/worker/verify"
                  className="inline-flex items-center gap-1 text-xs font-bold text-rozgo-800 dark:text-rozgo-300 hover:underline flex-shrink-0"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* STATE 3: FAILED */}
          {workerUser.verificationStatus === 'failed' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-300 dark:border-rose-800 shadow-soft animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-200 dark:bg-rose-900/50 flex items-center justify-center text-rose-800 dark:text-rose-300 flex-shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-1">
                      <span>Verification Could Not Be Completed</span>
                    </div>
                    <h4 className="text-base font-black text-neutral-900 dark:text-white">
                      Please review your details and try again.
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                      Common issues: blurry document photo, name mismatch, or unreadable ID.
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  className="!bg-[#123B32] hover:!bg-[#0D2B24] text-white flex-shrink-0"
                  onClick={() => navigate('/worker/verify')}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 2. PENDING BOOKING CONFIRMATION BANNER (IF AWAITING WORKER CONFIRMATION) */}
      {activeAgreement && activeAgreement.status === 'awaiting_confirmation' && (
        <Card
          variant="elevated"
          padding="lg"
          className="border-2 border-amber-400 bg-amber-50/70 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200 animate-pulse-subtle"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  ACTION REQUIRED
                </span>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Booking Confirmation Required
                </h3>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-0.5">
                  {activeAgreement.employerName} entered agreed details: ₹{activeAgreement.agreedWage.toLocaleString()} • {activeAgreement.workTitle}
                </p>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                className="flex-1 sm:flex-none border-amber-400 text-amber-900 dark:text-amber-200"
                onClick={() => workerConfirmBooking(activeAgreement.id, false)}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => setIsAgreementOpen(true)}
              >
                Review & Confirm
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 3. ACTIVE BOOKING IN PROGRESS CARD */}
      {activeAgreement && activeAgreement.status === 'confirmed' && (
        <ActiveBookingCard
          booking={activeAgreement}
          role="worker"
          onCall={handleCallFromActiveBooking}
          onViewAgreement={() => setIsAgreementOpen(true)}
          onCompleteWork={handleCompleteWork}
        />
      )}

      {/* 4. PRIMARY FOCUS: "YOUR NEXT JOB" SWIPE / MATCH CARD (Only shown when not actively engaged in accepted work) */}
      {(!activeAgreement || activeAgreement.status !== 'confirmed') && (
        <section className="space-y-4">
          {!isAvailableToday ? (
            <Card
              variant="elevated"
              padding="xl"
              className="text-center py-10 px-6 sm:px-12 border-2 border-amber-300 dark:border-amber-800/60 shadow-soft space-y-4 bg-white dark:bg-darkbg-card"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto shadow-xs">
                <Clock className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-xl font-black text-neutral-900 dark:text-white">
                  You are Marked as Not Available Today
                </h4>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Jobs for the day are hidden. Update your availability in your profile page to see available work for the day and start receiving employer calls.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/worker/profile')}
                  className="bg-[#123B32] hover:bg-[#0c2721] text-white font-bold"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Update Availability in Profile
                </Button>
              </div>
            </Card>
          ) : currentJob ? (
            <JobSwipeCard
              job={currentJob}
              onCall={handleCallEmployer}
              onAccept={handleAcceptWork}
              onReject={workerNextJob}
              isSearchingNext={isSearchingNextJob}
            />
          ) : (
            <Card variant="elevated" padding="xl" className="text-center py-12">
              <h4 className="text-xl font-bold text-neutral-900 dark:text-white">
                {t('workerDashboard.noJobsMatched')}
              </h4>
              <Button
                variant="primary"
                size="md"
                className="mt-4"
                onClick={workerNextJob}
              >
                Check Again
              </Button>
            </Card>
          )}
        </section>
      )}

      {/* 5. RECENT COMPLETED WORK HISTORY (RECENT 5 WITH CHECK ALL) */}
      <section className="space-y-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              {t('workerDashboard.completedWorkTitle')}
            </h2>
            {completedAgreements.length > 0 && (
              <Badge variant="neutral" size="sm">
                Recent {Math.min(5, completedAgreements.length)} of {completedAgreements.length}
              </Badge>
            )}
          </div>

          {completedAgreements.length > 0 && (
            <Link
              to="/worker/completed-works"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-rozgo-700 dark:text-rozgo-300 hover:text-rozgo-900 dark:hover:text-white hover:underline transition-colors"
            >
              <span>Check All ({completedAgreements.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="space-y-3">
          {completedAgreements.length > 0 ? (
            completedAgreements.slice(0, 5).map((booking) => (
              <Card
                key={booking.id}
                variant="default"
                padding="md"
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-neutral-200 dark:border-darkbg-border hover:border-rozgo-300 dark:hover:border-rozgo-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                      {booking.workTitle}
                    </h4>
                    <Badge variant="success" size="sm">
                      Completed
                    </Badge>
                    <span className="text-xs font-mono text-neutral-400">
                      #{booking.bookingNumber}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {booking.date} • Employer: {booking.employerName}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100 dark:border-darkbg-border">
                  <div className="text-left sm:text-right">
                    <div className="text-base font-black text-rozgo-900 dark:text-emerald-400">
                      ₹{booking.agreedWage.toLocaleString()}
                    </div>
                    <div className="text-xs text-amber-500 font-bold">★★★★★</div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Printer className="w-4 h-4 text-rozgo-700 dark:text-rozgo-300" />}
                    onClick={() => setViewingCompletedAgreement(booking)}
                    title={t('workerDashboard.printAgreement')}
                  >
                    {t('workerDashboard.printAgreement')}
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card variant="default" padding="lg" className="text-center py-8">
              <p className="text-sm text-neutral-500">No completed jobs yet.</p>
            </Card>
          )}
        </div>

        {completedAgreements.length > 5 && (
          <div className="text-center pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/worker/completed-works')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Check All Completed Works ({completedAgreements.length})
            </Button>
          </div>
        )}
      </section>

      {/* 6. WORKER RATING & FEEDBACK (FULL WIDTH) */}
      <section className="space-y-4 w-full">
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
          {t('workerDashboard.myRatingTitle')}
        </h2>

        <Card variant="default" padding="lg" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-darkbg-border">
            <div className="flex items-center gap-4">
              <div className="text-4xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
                {workerUser.rating.toFixed(1)}
              </div>
              <div>
                <StarRating rating={workerUser.rating} size="md" />
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Based on {workerUser.completedJobsCount} verified completed jobs
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="verified" size="sm">
                100% Verified Reviews
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Recent Customer Reviews
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workerUser.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-100 dark:border-darkbg-border text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 dark:text-white text-sm">
                      {rev.authorName}
                    </span>
                    <span className="text-neutral-400">{rev.date}</span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 italic leading-relaxed text-sm">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* 5. WORKER HELP & GRIEVANCE REDRESSAL SECTION */}
      <section className="space-y-4">
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-rozgo-900 to-[#1b4d42] text-white shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl text-rozgo-200 border border-white/10 shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg sm:text-xl font-bold">
                  Facing an Issue with Wages or Work?
                </h3>
                {activeGrievancesCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-neutral-900">
                    {activeGrievancesCount} Active
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-neutral-200/90 max-w-xl leading-relaxed">
                If an employer paid less than agreed, cancelled unexpectedly, or acted inappropriately, report it safely to the ROZGO Redressal Desk. We resolve disputes neutrally without affecting your rating.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              to="/grievances/new"
              className="flex-1 md:flex-none text-center px-5 py-3 rounded-2xl bg-white text-rozgo-900 hover:bg-rozgo-50 font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              Report a Problem
            </Link>
            <Link
              to="/grievances/my"
              className="flex-1 md:flex-none text-center px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all"
            >
              Track Grievances
            </Link>
          </div>
        </div>
      </section>


      {/* Waiting for Agreement Details by Employer Modal */}
      <WaitingForAgreementModal
        isOpen={isWaitingAgreement}
        onClose={() => setIsWaitingAgreement(false)}
        employerName={activeCallTarget.name}
        employerPhone={activeCallTarget.phone}
        workTitle={activeCallTarget.title}
        onAgreementArrived={handleAgreementDetailsArrived}
        onReject={handleRejectCallNegotiation}
      />

      {/* Agreement Confirmation Modal */}
      {activeAgreement && (
        <BookingAgreementModal
          isOpen={isAgreementOpen}
          onClose={() => setIsAgreementOpen(false)}
          agreement={activeAgreement}
          isWorkerPerspective={true}
          onWorkerConfirm={() => workerConfirmBooking(activeAgreement.id, true)}
          onWorkerReject={() => workerConfirmBooking(activeAgreement.id, false)}
        />
      )}

      {/* Completed Agreement View & Print Modal */}
      {viewingCompletedAgreement && (
        <BookingAgreementModal
          isOpen={Boolean(viewingCompletedAgreement)}
          onClose={() => setViewingCompletedAgreement(null)}
          agreement={viewingCompletedAgreement}
          isWorkerPerspective={true}
        />
      )}

      {/* Rating & Review Modal */}
      {activeAgreement && (
        <RatingReviewModal
          isOpen={isRatingOpen}
          onClose={() => setIsRatingOpen(false)}
          onSubmit={(rating, comment, tags) =>
            submitReview(activeAgreement.id, rating, comment, tags)
          }
          targetName={activeAgreement.employerName}
          role="worker"
        />
      )}
    </div>
  );
};

