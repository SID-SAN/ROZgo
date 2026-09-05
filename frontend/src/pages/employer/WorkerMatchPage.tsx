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
  Layers,
  Wrench,
  Building,
  Sparkles,
  UserCheck,
  Eye,
  Award,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LabourBadge } from '../../components/workers/LabourBadge';
import { BookingAgreementModal } from '../../components/bookings/BookingAgreementModal';
import { WorkerProfileModal } from '../../components/workers/WorkerProfileModal';
import { Modal } from '../../components/common/Modal';
import { SERVICES_DATA } from '../../data/servicesData';
import { BookingAgreement, WorkerProfile } from '../../types';

export const WorkerMatchPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    activeAgreements,
    activeAgreement,
    matchedWorker,
    matchedWorkersByTrade,
    requestedCategories,
    additionalWorkers,
    addWorkerByLabourNumber,
    addRecommendedWorker,
    removeWorkerFromBooking,
    confirmAgreementDetails,
    confirmAllPendingAgreements,
    employerRejectBooking,
    switchMatchedWorker,
    rejectWorkerAndShowNext,
    previousWorkerFeedback,
    clearPreviousWorkerFeedback,
  } = useBooking();
  const navigate = useNavigate();

  // Active matching agreements
  const matchingAgreements = activeAgreements.filter(
    (a) => a.status === 'matching' || a.status === 'awaiting_confirmation'
  );

  const activeCategories =
    requestedCategories.length > 0
      ? requestedCategories
      : matchingAgreements.length > 0
      ? matchingAgreements.map((a) => a.serviceCategory)
      : ['plumber'];

  // Worker profile modal state
  const [selectedProfileWorker, setSelectedProfileWorker] = useState<WorkerProfile | null>(null);

  // Reject booking modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingCategory, setRejectingCategory] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState('Unable to reach agreement on wage or timing');

  // Confirmation form modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [wagesByTrade, setWagesByTrade] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    activeCategories.forEach((cat) => {
      initial[cat] = cat === 'mason' ? 1800 : cat === 'plumber' ? 1500 : 1200;
    });
    return initial;
  });

  const [date, setDate] = useState<string>('Today');
  const [time, setTime] = useState<string>('11:00 AM');

  // Generated agreement view
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [viewingAgreement, setViewingAgreement] = useState<BookingAgreement | null>(null);

  // Labour number hire input
  const [labourNoInput, setLabourNoInput] = useState('');
  const [labourFeedback, setLabourFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleCallWorker = (phoneStr: string) => {
    const phone = phoneStr.replace(/[^0-9+]/g, '') || phoneStr;
    window.location.href = `tel:${phone}`;
  };

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

  const handleOpenConfirmModal = () => {
    setIsConfirmModalOpen(true);
  };

  const handleFinalizeAllBookings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = confirmAllPendingAgreements(wagesByTrade, date, time);
    setIsConfirmModalOpen(false);
    if (updated.length > 0) {
      setViewingAgreement(updated[0]);
      setIsAgreementOpen(true);
    } else {
      navigate('/employer/requests');
    }
  };

  if (activeCategories.length === 0 && !matchedWorker) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold">No active work request found</h2>
        <Button variant="primary" onClick={() => navigate('/employer')}>
          Choose Services
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 text-left animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-darkbg-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rozgo-100 dark:bg-darkbg-card text-rozgo-900 dark:text-rozgo-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Direct Contact • Zero Middleman Fees</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            {activeCategories.length > 1
              ? `Verified Workers Matched (${activeCategories.length} Simultaneous Trades)`
              : 'Verified Worker Matched'}
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Review worker profiles, check ratings and portfolio pictures, call directly to negotiate fair wages, and finalize agreements.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          rightIcon={<ArrowRight className="w-5 h-5" />}
          onClick={handleOpenConfirmModal}
          className="shrink-0 shadow-md font-black"
        >
          {activeCategories.length > 1 ? 'Finalize & Send All Agreements' : 'Finalize Agreement'}
        </Button>
      </div>

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
                Reason: {previousWorkerFeedback.reason}. Assigned next available verified worker nearby.
              </p>
            </div>
          </div>

          <button
            onClick={clearPreviousWorkerFeedback}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg transition-colors self-end sm:self-center cursor-pointer"
            title="Dismiss note"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Matched Workers List by Trade */}
      <div className="space-y-6">
        {activeCategories.map((category, idx) => {
          const worker = matchedWorkersByTrade[category] || matchedWorker || null;
          if (!worker) return null;

          const serviceMeta = SERVICES_DATA.find((s) => s.id === category);
          const tradeTitle = serviceMeta?.defaultName || category.toUpperCase();
          const targetAgr = matchingAgreements.find((a) => a.serviceCategory === category);
          const currentWage = wagesByTrade[category] || 1500;
          const portfolioCount = worker.portfolio?.length || 0;
          const certCount = worker.certifications?.length || 0;

          return (
            <Card
              key={category}
              variant="elevated"
              padding="lg"
              className="border-2 border-rozgo-900/40 dark:border-rozgo-700 space-y-5 relative overflow-hidden"
            >
              {/* Top Trade Badge Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-darkbg-border">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-xl bg-rozgo-900 text-white font-bold text-xs uppercase tracking-wider">
                    Trade {idx + 1}: {tradeTitle}
                  </span>
                  {targetAgr && (
                    <span className="text-xs text-neutral-500 font-semibold">
                      Task: {targetAgr.subcategory}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Citizen Worker</span>
                  </span>
                </div>
              </div>

              {/* Worker Profile Main Info */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => setSelectedProfileWorker(worker)}
                    className="cursor-pointer group relative shrink-0"
                    title="Click to view full profile & portfolio"
                  >
                    <img
                      src={worker.avatar}
                      alt={worker.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-white shadow-soft group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 rounded-3xl bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[11px] font-bold">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSelectedProfileWorker(worker)}
                        className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white hover:text-rozgo-800 dark:hover:text-rozgo-300 transition-colors text-left cursor-pointer"
                        title="View profile"
                      >
                        {worker.name}
                      </button>
                      <LabourBadge labourNumber={worker.labourNumber} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{worker.rating.toFixed(1)}</span>
                        <span className="text-neutral-400">({worker.completedJobsCount} jobs)</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{worker.distanceKm} km away ({worker.location})</span>
                      </div>
                      <span>•</span>
                      <span>{worker.experienceYears} yrs exp</span>
                    </div>

                    {/* Quick highlights: Skills & Portfolio badges */}
                    <div className="pt-1 flex flex-wrap items-center gap-1.5">
                      {worker.skills.slice(0, 3).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-darkbg-surface text-neutral-700 dark:text-neutral-300 text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}

                      {portfolioCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-[11px] font-semibold border border-blue-200 dark:border-blue-800/40">
                          <ImageIcon className="w-3 h-3" />
                          <span>{portfolioCount} Photos</span>
                        </span>
                      )}

                      {certCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800/40">
                          <Award className="w-3 h-3" />
                          <span>Certified</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Calling, Profile View & Negotiation CTAs */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Phone className="w-4 h-4" />}
                    onClick={() => handleCallWorker(worker.phone)}
                    className="!bg-emerald-600 hover:!bg-emerald-700 text-white font-bold whitespace-nowrap shadow-sm"
                  >
                    Call {worker.name}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<UserCheck className="w-4 h-4 text-rozgo-800 dark:text-rozgo-300" />}
                      onClick={() => setSelectedProfileWorker(worker)}
                      className="text-xs font-bold flex-1"
                    >
                      View Profile & Photos
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRejectingCategory(category);
                        setIsRejectModalOpen(true);
                      }}
                      className="text-xs text-neutral-600 dark:text-neutral-300 hover:text-rose-600"
                    >
                      Skip
                    </Button>
                  </div>
                </div>
              </div>

              {/* Direct call note & profile review link */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-100 dark:border-darkbg-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-neutral-600 dark:text-neutral-400">
                  Phone: <strong className="text-neutral-800 dark:text-neutral-200">{worker.phone}</strong> • Agree on wage directly over phone
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProfileWorker(worker)}
                    className="text-rozgo-700 dark:text-rozgo-300 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Check certifications & ratings ({worker.reviews?.length || 0} reviews)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Helper Labour (Majdoor Mitr) Crew Section */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Add Additional Helpers (Majdoor Mitr)
            </h3>
            <p className="text-xs text-neutral-500">
              Need extra helper hands on site? Add recommended workers or hire by Labour ID.
            </p>
          </div>
          {additionalWorkers.length > 0 && (
            <Badge variant="primary" size="sm">
              {additionalWorkers.length} Helper(s) Added
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="default" padding="md" className="space-y-3">
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
              Add Nearby Verified Helper
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Instantly pair an additional verified labourer with this crew.
            </p>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleAddRecommended}
            >
              Add Recommended Worker
            </Button>
          </Card>

          <Card variant="default" padding="md" className="space-y-3">
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
              Add Worker by Labour ID (RZG-XXXXXX)
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Enter the labour number if recommended directly:
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

      {/* Bottom Finalize Bar */}
      <div className="p-6 rounded-3xl bg-neutral-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div>
          <h3 className="font-black text-lg">
            Ready to confirm the booking agreement?
          </h3>
          <p className="text-xs text-neutral-300 mt-0.5">
            Agreed wages will be locked in the digital agreement and sent to each worker for immediate confirmation.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          rightIcon={<ArrowRight className="w-5 h-5" />}
          onClick={handleOpenConfirmModal}
          className="whitespace-nowrap font-black !bg-rozgo-500 hover:!bg-rozgo-400 text-neutral-900"
        >
          {activeCategories.length > 1
            ? `Finalize Agreements for ${activeCategories.length} Trades`
            : 'Enter Agreed Details & Send'}
        </Button>
      </div>

      {/* Worker Profile Modal (Shows Rating, Portfolio Pictures, Certifications, etc.) */}
      {selectedProfileWorker && (
        <WorkerProfileModal
          worker={selectedProfileWorker}
          isOpen={Boolean(selectedProfileWorker)}
          onClose={() => setSelectedProfileWorker(null)}
          onCall={() => handleCallWorker(selectedProfileWorker.phone)}
        />
      )}

      {/* Agreement Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Enter Agreed Booking Details"
        maxWidth="md"
      >
        <form onSubmit={handleFinalizeAllBookings} className="space-y-5">
          <div className="p-3.5 rounded-2xl bg-rozgo-50 dark:bg-darkbg-surface border border-rozgo-200 text-xs text-neutral-700 dark:text-neutral-300">
            Enter the wage mutually agreed on the phone call for each requested trade:
          </div>

          <div className="space-y-3">
            {activeCategories.map((cat) => {
              const service = SERVICES_DATA.find((s) => s.id === cat);
              const name = service?.defaultName || cat;
              return (
                <div key={cat}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Agreed Wage for {name}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 font-bold text-rozgo-900 dark:text-rozgo-300">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={100}
                      max={50000}
                      value={wagesByTrade[cat] || 1500}
                      onChange={(e) =>
                        setWagesByTrade((prev) => ({
                          ...prev,
                          [cat]: Number(e.target.value),
                        }))
                      }
                      className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white font-black text-lg focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                      required
                    />
                  </div>
                </div>
              );
            })}
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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Send Agreements to Workers
          </Button>
        </form>
      </Modal>

      {/* Reject / Skip Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Find Next Worker Match"
        maxWidth="md"
      >
        <div className="py-2 space-y-4">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-neutral-900 dark:text-white">
              Skip worker and show next available candidate?
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              ROZGO will assign the next verified nearby worker in this category.
            </p>
          </div>

          <div className="space-y-2">
            {[
              'Unable to reach agreement on wage or charges',
              'Worker unavailable at requested time/date',
              'Job requirement changed or cancelled',
              'Distance or transport issue',
              'Other reason',
            ].map((reason) => (
              <label
                key={reason}
                onClick={() => setRejectionReason(reason)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  rejectionReason === reason
                    ? 'border-rose-500 bg-rose-50/60 text-rose-900 font-bold'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
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

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => setIsRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              fullWidth
              onClick={() => {
                rejectWorkerAndShowNext(rejectionReason, rejectingCategory);
                setIsRejectModalOpen(false);
              }}
            >
              Show Next Worker
            </Button>
          </div>
        </div>
      </Modal>

      {/* Generated Agreement Document Modal */}
      {viewingAgreement && (
        <BookingAgreementModal
          isOpen={isAgreementOpen}
          onClose={() => {
            setIsAgreementOpen(false);
            navigate('/employer/requests');
          }}
          agreement={viewingAgreement}
          isEmployerPerspective={true}
          onEmployerReject={() => {
            rejectWorkerAndShowNext('Declined from agreement modal', viewingAgreement.serviceCategory);
            setIsAgreementOpen(false);
          }}
        />
      )}
    </div>
  );
};
