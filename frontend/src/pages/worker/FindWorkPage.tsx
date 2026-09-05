import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Phone,
  Clock,
  Users,
  ArrowLeft,
  ArrowRight,
  X,
  RotateCcw,
  CheckCircle2,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { useLanguage } from '../../context/LanguageContext';
import { MOCK_JOBS } from '../../data/mockJobs';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CallModal } from '../../components/common/CallModal';
import { BookingAgreementModal } from '../../components/bookings/BookingAgreementModal';
import { WaitingForAgreementModal } from '../../components/bookings/WaitingForAgreementModal';
import { JobRecommendation } from '../../types';

export const FindWorkPage: React.FC = () => {
  const { workerUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const {
    activeAgreement,
    selectJobAsActiveAgreement,
    workerConfirmBooking,
  } = useBooking();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isSearchingNext, setIsSearchingNext] = useState<boolean>(false);
  const [selectedJobForCall, setSelectedJobForCall] = useState<JobRecommendation | null>(null);
  const [isWaitingAgreement, setIsWaitingAgreement] = useState(false);
  const [pendingAgreedJob, setPendingAgreedJob] = useState<JobRecommendation | null>(null);
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [showConfirmedNotice, setShowConfirmedNotice] = useState(false);

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

  const filteredJobs = MOCK_JOBS.filter((job) => {
    const matchesCategory =
      filterCategory === 'all' || job.serviceCategory === filterCategory;
    const matchesQuery =
      job.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const safeIndex =
    filteredJobs.length > 0 ? Math.min(currentIndex, filteredJobs.length - 1) : 0;
  const currentJob = filteredJobs.length > 0 ? filteredJobs[safeIndex] : null;

  const handleCategoryChange = (cat: string) => {
    setFilterCategory(cat);
    setCurrentIndex(0);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentIndex(0);
  };

  const handleRejectNext = () => {
    if (filteredJobs.length <= 1) return;
    setIsSearchingNext(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredJobs.length);
      setIsSearchingNext(false);
    }, 450);
  };

  const handlePrevOpportunity = () => {
    if (filteredJobs.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + filteredJobs.length) % filteredJobs.length);
  };

  const handleSelectJob = (job: JobRecommendation) => {
    setSelectedJobForCall(job);
  };

  const handleCallAgreed = () => {
    if (!selectedJobForCall) return;
    const agreedJob = selectedJobForCall;
    setPendingAgreedJob(agreedJob);
    setSelectedJobForCall(null);
    selectJobAsActiveAgreement(agreedJob, 1200);
    // Show waiting for agreement details by employer modal
    setIsWaitingAgreement(true);
  };

  const handleAgreementDetailsArrived = () => {
    setIsWaitingAgreement(false);
    if (pendingAgreedJob) {
      selectJobAsActiveAgreement(pendingAgreedJob, 1200);
      setPendingAgreedJob(null);
    }
    // Show agreement popup with Accept & Reject options
    setIsAgreementOpen(true);
  };

  const handleRejectCallNegotiation = () => {
    setIsWaitingAgreement(false);
    setPendingAgreedJob(null);
    handleRejectNext();
  };

  const handleDirectAcceptWork = (job: JobRecommendation) => {
    selectJobAsActiveAgreement(job, 1200);
    setIsAgreementOpen(true);
  };

  const handleConfirmBooking = () => {
    if (activeAgreement) {
      workerConfirmBooking(activeAgreement.id, true);
    }
    setIsAgreementOpen(false);
    setShowConfirmedNotice(true);
  };

  const handleRejectAgreement = () => {
    if (activeAgreement) {
      workerConfirmBooking(activeAgreement.id, false);
    }
    setIsAgreementOpen(false);
    handleRejectNext();
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
        return <Wrench className="w-6 h-6 text-rozgo-700 dark:text-rozgo-300" />;
    }
  };

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 text-left">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/worker/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-rozgo-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {isAvailableToday && filteredJobs.length > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rozgo-100 dark:bg-darkbg-card text-rozgo-900 dark:text-rozgo-200 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-rozgo-700 dark:text-rozgo-300" />
            <span>
              Work {safeIndex + 1} of {filteredJobs.length} Available
            </span>
          </div>
        )}
      </div>

      {!isAvailableToday ? (
        <Card
          variant="elevated"
          padding="xl"
          className="text-center py-12 px-6 sm:px-12 max-w-xl mx-auto space-y-6 border-2 border-amber-300 dark:border-amber-800/60 shadow-soft bg-white dark:bg-darkbg-card my-6"
        >
          <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto shadow-xs">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              You are Marked as Not Available Today
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              You chose not to take work today. Jobs for the day are hidden to avoid unwanted inquiries while you are resting or on another assignment.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-bold">Want to find and accept work today?</p>
            <p>
              Please update your availability in your profile page to see available work for the day.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/worker/profile"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#123B32] hover:bg-[#0c2721] text-white font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <span>Update Availability in Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/worker/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-2xl border border-neutral-300 dark:border-darkbg-border text-neutral-700 dark:text-neutral-300 font-bold text-sm hover:bg-neutral-50 dark:hover:bg-darkbg-base transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Header & Filter Controls */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            Find Work Opportunities
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Browse verified direct-hire job requests from local employers. Review one work opportunity at a time.
          </p>
        </div>

        {/* Trade Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Work' },
            { id: 'plumber', label: 'Plumbing' },
            { id: 'electrician', label: 'Electrical' },
            { id: 'carpenter', label: 'Carpentry' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterCategory === cat.id
                  ? 'bg-rozgo-900 text-white shadow-soft'
                  : 'bg-neutral-100 dark:bg-darkbg-card text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-darkbg-border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Filter by work task or location (e.g. tap, pipe, DLF, Sushant Lok)..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rozgo-900 shadow-soft"
          />
        </div>
      </div>

      {/* SUCCESS CONFIRMATION BANNER */}
      {showConfirmedNotice && (
        <Card
          variant="elevated"
          padding="lg"
          className="border-2 border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 shadow-soft animate-fadeIn"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  BOOKING CONFIRMED & ACTIVE
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  You accepted the work agreement!
                </h3>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-0.5">
                  The agreement is now active on your worker dashboard.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/worker/dashboard')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="bg-emerald-700 hover:bg-emerald-800 text-white whitespace-nowrap shadow-soft"
            >
              Go to Dashboard
            </Button>
          </div>
        </Card>
      )}
      {/* SINGLE WORK OPPORTUNITY DISPLAY (1 AT A TIME) */}
      {activeAgreement && activeAgreement.status === 'confirmed' ? (
        <Card
          variant="elevated"
          padding="xl"
          className="text-center py-16 space-y-5 border-2 border-rozgo-300 dark:border-darkbg-border"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              ACTIVE WORK IN PROGRESS
            </span>
            <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
              You Have Active Accepted Work
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              You are currently booked for <strong>{activeAgreement.workTitle}</strong> ({activeAgreement.employerName}). Please complete this work on your dashboard before viewing newer opportunities.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/worker/dashboard')}
            >
              View Active Work on Dashboard
            </Button>
          </div>
        </Card>
      ) : isSearchingNext ? (
        <Card
          variant="elevated"
          padding="xl"
          className="text-center py-20 flex flex-col items-center justify-center min-h-[400px]"
        >
          <div className="w-16 h-16 rounded-full bg-rozgo-100 dark:bg-darkbg-card flex items-center justify-center mb-4 animate-spin">
            <RotateCcw className="w-8 h-8 text-rozgo-900 dark:text-rozgo-300" />
          </div>
          <h4 className="text-xl font-bold text-neutral-900 dark:text-white">
            Loading Next Work Opportunity...
          </h4>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-sm">
            Fetching the next verified work request in your selected category.
          </p>
        </Card>
      ) : currentJob ? (
        <div className="relative">
          <Card
            variant="elevated"
            padding="lg"
            className="border-2 border-rozgo-200 dark:border-darkbg-border shadow-soft-lg overflow-hidden relative"
          >
            {/* Top Bar: Opportunity Counter & Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-darkbg-border mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black tracking-wider uppercase text-rozgo-900 dark:text-rozgo-300">
                  WORK OPPORTUNITY #{safeIndex + 1}
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  (of {filteredJobs.length} available)
                </span>
              </div>

              {/* Prev / Next Pagination Steppers */}
              {filteredJobs.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevOpportunity}
                    title="Previous Opportunity"
                    className="p-2 rounded-xl border border-neutral-200 dark:border-darkbg-border hover:bg-neutral-100 dark:hover:bg-darkbg-card text-neutral-600 dark:text-neutral-300 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRejectNext}
                    title="Next Opportunity"
                    className="p-2 rounded-xl border border-neutral-200 dark:border-darkbg-border hover:bg-neutral-100 dark:hover:bg-darkbg-card text-neutral-600 dark:text-neutral-300 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Trade Icon & Title Header */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-rozgo-50 dark:bg-darkbg-surface border border-rozgo-100 dark:border-darkbg-border flex items-center justify-center flex-shrink-0">
                {getServiceIcon(currentJob.serviceCategory)}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    {currentJob.serviceCategory}
                  </span>
                  {getDifficultyBadge(currentJob.difficulty)}
                  <span className="text-xs text-neutral-400">• Posted {currentJob.postedAt}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  {currentJob.subcategory}
                </h3>
              </div>
            </div>

            {/* Description Quote */}
            <div className="mb-6 bg-neutral-50 dark:bg-darkbg-surface/60 p-4 sm:p-5 rounded-2xl border border-neutral-200/60 dark:border-darkbg-border">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
                Work Details
              </div>
              <p className="text-neutral-800 dark:text-neutral-200 text-sm sm:text-base leading-relaxed">
                "{currentJob.description}"
              </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 text-sm">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-darkbg-card border border-neutral-200/80 dark:border-darkbg-border">
                <MapPin className="w-4 h-4 text-rozgo-700 dark:text-rozgo-400 flex-shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] text-neutral-400 uppercase font-bold">Distance</div>
                  <div className="font-bold text-neutral-900 dark:text-white truncate">
                    {currentJob.distanceKm} km away
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-darkbg-card border border-neutral-200/80 dark:border-darkbg-border">
                <Users className="w-4 h-4 text-rozgo-700 dark:text-rozgo-400 flex-shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] text-neutral-400 uppercase font-bold">Workers Needed</div>
                  <div className="font-bold text-neutral-900 dark:text-white">
                    {currentJob.workersNeeded} worker(s)
                  </div>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-darkbg-card border border-neutral-200/80 dark:border-darkbg-border">
                <Clock className="w-4 h-4 text-rozgo-700 dark:text-rozgo-400 flex-shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] text-neutral-400 uppercase font-bold">Preferred Time</div>
                  <div className="font-bold text-neutral-900 dark:text-white truncate">
                    {currentJob.preferredTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Employer and Location Info Box */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rozgo-50/60 dark:bg-darkbg-card border border-rozgo-100 dark:border-darkbg-border mb-6">
              <div>
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Employer
                </div>
                <div className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <span>{currentJob.employerName}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
              </div>

              <div className="sm:text-right">
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex sm:justify-end items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rozgo-700 dark:text-rozgo-400" />
                  <span>Job Location</span>
                </div>
                <div className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
                  {currentJob.location}
                </div>
              </div>
            </div>

            {/* Actions: Equal-sized Call, Accept, Reject buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-100 dark:border-darkbg-border">
              <Button
                variant="primary"
                size="lg"
                className="w-full shadow-soft text-sm sm:text-base font-bold justify-center"
                leftIcon={<Phone className="w-5 h-5 text-rozgo-200" />}
                onClick={() => handleSelectJob(currentJob)}
              >
                {t('workerDashboard.callEmployer')}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-transparent shadow-soft text-sm sm:text-base justify-center"
                leftIcon={<CheckCircle2 className="w-5 h-5 text-white" />}
                onClick={() => handleDirectAcceptWork(currentJob)}
              >
                {t('workerDashboard.acceptWork')}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full border-neutral-300 dark:border-darkbg-border font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-darkbg-surface text-sm sm:text-base justify-center"
                leftIcon={<X className="w-5 h-5 text-neutral-400" />}
                onClick={handleRejectNext}
              >
                {t('workerDashboard.rejectNext')}
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <Card variant="default" padding="xl" className="text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-darkbg-card text-neutral-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-neutral-900 dark:text-white">
              No matching work opportunities found
            </h4>
            <p className="text-sm text-neutral-500 mt-1 max-w-md mx-auto">
              No pending job requests match your current trade filter or search query.
            </p>
          </div>
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setFilterCategory('all');
              setSearchQuery('');
              setCurrentIndex(0);
            }}
          >
            Reset Filters & View All
          </Button>
        </Card>
      )}

      {/* Simulated Phone Call Dialog */}
      {selectedJobForCall && (
        <CallModal
          isOpen={!!selectedJobForCall}
          onClose={() => setSelectedJobForCall(null)}
          onCallAgreed={handleCallAgreed}
          calleeName={selectedJobForCall.employerName}
          calleePhone={selectedJobForCall.employerPhone}
          roleType="worker"
          serviceTitle={selectedJobForCall.subcategory}
        />
      )}

      {/* Waiting for Agreement Details by Employer Dialog */}
      {pendingAgreedJob && (
        <WaitingForAgreementModal
          isOpen={isWaitingAgreement}
          onClose={() => setIsWaitingAgreement(false)}
          employerName={pendingAgreedJob.employerName}
          employerPhone={pendingAgreedJob.employerPhone}
          workTitle={pendingAgreedJob.subcategory}
          onAgreementArrived={handleAgreementDetailsArrived}
          onReject={handleRejectCallNegotiation}
        />
      )}

      {/* ROZGO Cooperative Agreement Review & Confirmation Modal */}
      {activeAgreement && (
        <BookingAgreementModal
          isOpen={isAgreementOpen}
          onClose={() => setIsAgreementOpen(false)}
          agreement={activeAgreement}
          isWorkerPerspective={true}
          onWorkerConfirm={handleConfirmBooking}
          onWorkerReject={handleRejectAgreement}
        />
      )}
        </>
      )}
    </div>
  );
};

