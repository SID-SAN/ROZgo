import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Phone,
  Star,
  MapPin,
  Users,
  CheckCircle2,
  X,
  Plus,
  ArrowRight,
  AlertCircle,
  Clock,
  Calendar,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LabourBadge } from '../../components/workers/LabourBadge';
import { CallModal } from '../../components/common/CallModal';
import { BookingAgreementModal } from '../../components/bookings/BookingAgreementModal';
import { Modal } from '../../components/common/Modal';

export const WorkerMatchPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    activeAgreement,
    matchedWorker,
    additionalWorkers,
    addWorkerByLabourNumber,
    addRecommendedWorker,
    removeWorkerFromBooking,
    confirmAgreementDetails,
    employerRejectBooking,
    switchMatchedWorker,
    rejectWorkerAndShowNext,
    previousWorkerFeedback,
    clearPreviousWorkerFeedback,
  } = useBooking();
  const navigate = useNavigate();

  // Call modal
  const [isCallOpen, setIsCallOpen] = useState(false);

  // Reject booking modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Unable to reach agreement on wage or timing');

  // Labour number hire input
  const [labourNoInput, setLabourNoInput] = useState('');
  const [labourFeedback, setLabourFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Confirmation form modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [agreedWage, setAgreedWage] = useState<number>(1500);
  const [date, setDate] = useState<string>('12 September');
  const [time, setTime] = useState<string>('10:00 AM');

  // Generated agreement view
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);

  if (!matchedWorker) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold">No active match found</h2>
        <Button variant="primary" onClick={() => navigate('/employer')}>
          Choose a Service
        </Button>
      </div>
    );
  }

  const handleAddByLabourNo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labourNoInput.trim()) return;
    const res = addWorkerByLabourNumber(labourNoInput);
    if (res.success) {
      setLabourFeedback({ type: 'success', message: res.message });
      setLabourNoInput('');
    } else {
      setLabourFeedback({ type: 'error', message: res.message });
    }
  };

  const handleAddRecommended = () => {
    const success = addRecommendedWorker();
    if (!success) {
      setLabourFeedback({
        type: 'error',
        message: 'No further nearby workers found for this category at the moment.',
      });
    }
  };

  const handleFinalizeBooking = (e: React.FormEvent) => {
    e.preventDefault();
    confirmAgreementDetails({
      agreedWage,
      date,
      time,
    });
    setIsConfirmModalOpen(false);
    setIsAgreementOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 text-left">
      {/* Dynamic Next Worker Match Banner (After Rejection) */}
      {previousWorkerFeedback && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-amber-800 dark:text-amber-300" />
            </div>
            <div className="text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-950 dark:text-white">
                  Previous worker ({previousWorkerFeedback.workerName}) declined
                </span>
                <Badge variant="warning" size="sm">
                  Next Worker Assigned
                </Badge>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 mt-0.5">
                Reason: {previousWorkerFeedback.reason}. Showing next available verified <strong>{matchedWorker.primarySkill.toUpperCase()}</strong> ({matchedWorker.name}, {matchedWorker.distanceKm} km away).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const res = rejectWorkerAndShowNext('Requested next worker option');
                if (res.noMoreWorkers) {
                  // Looped through pool
                }
              }}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Skip to Next
            </Button>
            <button
              onClick={clearPreviousWorkerFeedback}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg transition-colors"
              title="Dismiss note"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Banner: MATCH FOUND */}
      <div className="flex items-center justify-between p-6 sm:p-8 rounded-3xl bg-rozgo-900 text-white shadow-soft-lg">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rozgo-800 text-rozgo-200 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('employerFlow.matchFoundTitle')}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {activeAgreement?.workTitle || 'Verified Worker Match'}
          </h1>
          <p className="text-xs sm:text-sm text-rozgo-100/80">
            {t('employerFlow.matchFoundSub')}
          </p>
        </div>

        <div className="hidden sm:block text-right">
          <Badge variant="verified" size="lg">
            ✓ Identity Verified
          </Badge>
        </div>
      </div>

      {/* Direct Phone Negotiation Notice */}
      <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-200 flex items-start gap-3.5">
        <AlertCircle className="w-6 h-6 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm">
          <h4 className="font-bold text-neutral-900 dark:text-white text-base">
            {t('employerFlow.negotiationNoticeTitle')}
          </h4>
          <p className="leading-relaxed">
            {t('employerFlow.negotiationNoticeBody')}
          </p>
        </div>
      </div>

      {/* Primary Matched Worker Card */}
      <Card variant="elevated" padding="xl" className="border-2 border-rozgo-200 dark:border-darkbg-border">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="relative">
            <img
              src={matchedWorker.avatar}
              alt={matchedWorker.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-rozgo-100 dark:border-darkbg-border shadow-soft"
            />
            <span className="absolute -bottom-1.5 -right-1.5 bg-rozgo-900 text-white p-1.5 rounded-full shadow-md">
              <ShieldCheck className="w-4 h-4 text-rozgo-200" />
            </span>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                  {matchedWorker.name}
                </h3>
                <p className="text-sm font-semibold text-rozgo-700 dark:text-rozgo-400">
                  Lead {matchedWorker.primarySkill.toUpperCase()}
                </p>
              </div>

              <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-lg">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{matchedWorker.rating.toFixed(1)}</span>
                <span className="text-xs text-neutral-400 font-normal">
                  ({matchedWorker.completedJobsCount} jobs)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Labour ID:
              </span>
              <LabourBadge labourNumber={matchedWorker.labourNumber} size="sm" />
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-rozgo-700" />
                {matchedWorker.location} ({matchedWorker.distanceKm} km away)
              </span>
              <span>•</span>
              <span>{matchedWorker.experienceYears}+ Years Experience</span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-darkbg-border flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            size="xl"
            className="sm:flex-[2]"
            leftIcon={<Phone className="w-6 h-6 text-rozgo-200" />}
            onClick={() => setIsCallOpen(true)}
          >
            {t('employerFlow.callWorker')}
          </Button>

          <Button
            variant="outline"
            size="xl"
            className="sm:flex-1 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-bold"
            leftIcon={<CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            onClick={() => setIsConfirmModalOpen(true)}
          >
            Confirm Booking
          </Button>

          <Button
            variant="outline"
            size="xl"
            className="sm:flex-1 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 font-bold"
            leftIcon={<XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
            onClick={() => setIsRejectModalOpen(true)}
          >
            Reject Booking
          </Button>
        </div>
      </Card>

      {/* MULTIPLE WORKERS SECTION (MAJDOOR MITR) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
              Add More Workers (Majdoor Mitr)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Need extra hands for this task? Add trusted peers recommended by ROZGO or hire by Labour ID.
            </p>
          </div>
        </div>

        {/* Added Additional Workers List */}
        {additionalWorkers.length > 0 && (
          <div className="space-y-2">
            {additionalWorkers.map((workerItem) => (
              <div
                key={workerItem.workerId}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rozgo-100 dark:bg-rozgo-900/60 text-rozgo-900 dark:text-rozgo-200 flex items-center justify-center font-bold">
                    {workerItem.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900 dark:text-white">
                      {workerItem.name}
                    </div>
                    <div className="text-xs text-neutral-400">{workerItem.phone}</div>
                  </div>
                  <LabourBadge labourNumber={workerItem.labourNumber} size="sm" showCopy={false} />
                </div>

                <button
                  type="button"
                  onClick={() => removeWorkerFromBooking(workerItem.workerId)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-darkbg-surface transition-colors"
                  title="Remove from booking"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: Find More Workers via ROZGO */}
          <Card variant="default" padding="md" className="space-y-3">
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
              {t('employerFlow.optionFindMore')}
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Let ROZGO find another nearby verified worker with suitable trade credentials.
            </p>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleAddRecommended}
            >
              Add Recommended Worker
            </Button>
          </Card>

          {/* Option 2: Hire by Labour Number (Majdoor Mitr Referral) */}
          <Card variant="default" padding="md" className="space-y-3">
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
              {t('employerFlow.optionLabourNo')}
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Did the primary worker recommend a peer over the phone? Enter their ID:
            </p>
            <form onSubmit={handleAddByLabourNo} className="flex gap-2">
              <input
                type="text"
                value={labourNoInput}
                onChange={(e) => setLabourNoInput(e.target.value)}
                placeholder="e.g. RZG-419032"
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-rozgo-900"
              />
              <Button type="submit" variant="primary" size="sm">
                Add ID
              </Button>
            </form>
          </Card>
        </div>

        {/* Feedback message if any */}
        {labourFeedback.message && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold ${
              labourFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {labourFeedback.message}
          </div>
        )}
      </section>

      {/* Simulated Phone Call Modal */}
      <CallModal
        isOpen={isCallOpen}
        onClose={() => setIsCallOpen(false)}
        onCallAgreed={() => {
          setIsConfirmModalOpen(true);
        }}
        calleeName={matchedWorker.name}
        calleePhone={matchedWorker.phone}
        calleeAvatar={matchedWorker.avatar}
        roleType="employer"
        serviceTitle={activeAgreement?.workTitle || 'Plumbing Service'}
      />

      {/* Post-Call Agreement Form Modal (Prompt section 29) */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Enter Agreed Booking Details"
        maxWidth="md"
      >
        <form onSubmit={handleFinalizeBooking} className="space-y-5">
          <div className="p-3.5 rounded-2xl bg-rozgo-50 dark:bg-darkbg-surface border border-rozgo-200 text-xs text-neutral-700 dark:text-neutral-300">
            Enter the wage and timings you mutually agreed with {matchedWorker.name} on the phone call:
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
              {t('employerFlow.agreedWageLabel')}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 font-bold text-rozgo-900 dark:text-rozgo-300">
                ₹
              </span>
              <input
                type="number"
                min={100}
                max={50000}
                value={agreedWage}
                onChange={(e) => setAgreedWage(Number(e.target.value))}
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white font-black text-xl focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Date
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                required
              />
            </div>
          </div>

          <div className="text-xs text-neutral-500">
            Total workers on booking:{' '}
            <span className="font-bold text-neutral-900 dark:text-white">
              {1 + additionalWorkers.length} Worker(s)
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            {t('employerFlow.sendConfirmationBtn')}
          </Button>
        </form>
      </Modal>

      {/* Call Worker Modal */}
      {matchedWorker && (
        <CallModal
          isOpen={isCallOpen}
          onClose={() => setIsCallOpen(false)}
          onCallAgreed={() => {
            setIsCallOpen(false);
            setIsConfirmModalOpen(true);
          }}
          onCallRejected={() => {
            setIsCallOpen(false);
            rejectWorkerAndShowNext('Declined during call negotiation');
          }}
          calleeName={matchedWorker.name}
          calleePhone={matchedWorker.phone}
          calleeAvatar={matchedWorker.avatar}
          roleType="employer"
          serviceTitle={activeAgreement?.workTitle || `${matchedWorker.primarySkill.toUpperCase()} Service`}
        />
      )}

      {/* Reject Booking Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Booking Request"
        maxWidth="md"
      >
        <div className="py-2 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-neutral-900 dark:text-white">
              Reject {matchedWorker.name} and show next worker?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              This will decline <span className="font-bold text-neutral-800 dark:text-neutral-200">{matchedWorker.name}</span> and immediately connect you with the next verified <span className="font-bold text-rozgo-900 dark:text-rozgo-300">{matchedWorker.primarySkill.toUpperCase()}</span> nearby.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Please select reason for rejection:
            </label>
            <div className="space-y-2">
              {[
                'Unable to reach agreement on wage or charges',
                'Worker unavailable at requested time/date',
                'Job requirement changed or cancelled',
                'Distance or transport issue',
                'Found alternative arrangements',
                'Other reason',
              ].map((reason) => (
                <label
                  key={reason}
                  onClick={() => setRejectionReason(reason)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                    rejectionReason === reason
                      ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold'
                      : 'border-neutral-200 dark:border-darkbg-border hover:bg-neutral-50 dark:hover:bg-darkbg-surface text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectionReason"
                    checked={rejectionReason === reason}
                    onChange={() => setRejectionReason(reason)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-darkbg-border">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => setIsRejectModalOpen(false)}
            >
              Keep Current Worker
            </Button>
            <Button
              variant="danger"
              size="lg"
              fullWidth
              leftIcon={<XCircle className="w-5 h-5" />}
              onClick={() => {
                rejectWorkerAndShowNext(rejectionReason);
                setIsRejectModalOpen(false);
              }}
            >
              Reject & Show Next Worker
            </Button>
          </div>
        </div>
      </Modal>

      {/* Generated Agreement Document Modal */}
      {activeAgreement && (
        <BookingAgreementModal
          isOpen={isAgreementOpen}
          onClose={() => {
            setIsAgreementOpen(false);
            navigate('/employer/requests');
          }}
          agreement={activeAgreement}
          isEmployerPerspective={true}
          onEmployerReject={() => {
            rejectWorkerAndShowNext('Declined from agreement modal');
            setIsAgreementOpen(false);
          }}
        />
      )}
    </div>
  );
};

