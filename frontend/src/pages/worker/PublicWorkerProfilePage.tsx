import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  Phone,
  Briefcase,
  Clock,
  Globe,
  Award,
  Bookmark,
  CheckCircle2,
  Share2,
  Lock,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Heart,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { WorkerProfile } from '../../types';
import { VerifiedBadgeModal } from '../../components/profile/VerifiedBadgeModal';
import { ShareProfileModal } from '../../components/profile/ShareProfileModal';
import { apiClient } from '../../api/apiClient';

export const PublicWorkerProfilePage: React.FC = () => {
  const { labourId } = useParams<{ labourId: string }>();
  const navigate = useNavigate();
  const { workerUser, role } = useAuth();
  const { addWorkerByLabourNumber, availableWorkersList } = useBooking();
  const [fetchedWorker, setFetchedWorker] = useState<WorkerProfile | null>(null);

  useEffect(() => {
    if (!labourId) return;
    const cleanId = labourId.trim();
    apiClient.get<any>(`/workers/labour-no/${cleanId}`)
      .then(res => {
        if (res && res.id) setFetchedWorker(res);
      })
      .catch(() => {
        apiClient.get<any>(`/workers/${cleanId}`)
          .then(r => { if (r && r.id) setFetchedWorker(r); })
          .catch(() => {});
      });
  }, [labourId]);

  // Look up worker by labourNumber or id
  const worker: WorkerProfile = useMemo(() => {
    if (fetchedWorker) return fetchedWorker;
    if (!labourId) return workerUser;
    const cleanId = labourId.trim().toUpperCase();
    const found = availableWorkersList.find(
      (w) =>
        (w.labourNumber && w.labourNumber.toUpperCase() === cleanId) ||
        (w.id && w.id.toUpperCase() === cleanId)
    );
    if (found) return found;
    if (workerUser.labourNumber?.toUpperCase() === cleanId || workerUser.id.toUpperCase() === cleanId) {
      return workerUser;
    }
    return availableWorkersList[0] || workerUser;
  }, [labourId, workerUser, availableWorkersList, fetchedWorker]);

  // Modals
  const [isVerifiedModalOpen, setIsVerifiedModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    showToast(!isSaved ? `${worker.name} saved to your favorites!` : 'Removed from favorites.');
  };

  const handleHireDirect = () => {
    if (worker.labourNumber) {
      const res = addWorkerByLabourNumber(worker.labourNumber);
      if (res.success) {
        setIsBookingSuccess(true);
        setTimeout(() => {
          navigate('/employer/match');
        }, 1500);
      } else {
        showToast(res.message);
      }
    } else {
      navigate('/employer/request');
    }
  };

  const handleCallWorker = () => {
    const phone = worker.phone.replace(/[^0-9+]/g, '') || worker.phone;
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-darkbg-base py-6 sm:py-10 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#123B32] text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-500/30 animate-fade-in text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            {toastMessage}
          </div>
        )}

        {/* Booking feedback modal */}
        {isBookingSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-darkbg-surface p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl border border-emerald-500/30">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Worker Added to Booking!
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Redirecting to booking confirmation & digital work agreement...
              </p>
            </div>
          </div>
        )}

        {/* Back navigation & Public Badge */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-[#123B32] dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 dark:text-neutral-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            Public Employer View
          </div>
        </div>

        {/* Master Profile Header Card */}
        <div className="bg-white dark:bg-darkbg-surface rounded-3xl border border-neutral-200 dark:border-darkbg-border p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={worker.avatar}
                alt={worker.name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-emerald-50 dark:border-darkbg-border shadow-md"
              />
              {worker.isVerified && (
                <button
                  onClick={() => setIsVerifiedModalOpen(true)}
                  className="absolute -bottom-2 -right-2 bg-[#123B32] text-white p-2 rounded-2xl shadow-lg hover:scale-105 transition-transform"
                  title="Verified Labour Identity"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                </button>
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                      {worker.name}
                    </h1>
                    {worker.isVerified && (
                      <button
                        onClick={() => setIsVerifiedModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-[#123B32] dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#123B32] dark:text-emerald-400" />
                        Verified Worker
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-bold text-[#123B32] dark:text-emerald-400 capitalize mt-1">
                    Master {worker.primarySkill} • {worker.experienceYears} Years Experience
                  </p>
                </div>

                {/* Rates badge */}
                <div className="bg-neutral-50 dark:bg-darkbg-base px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-darkbg-border inline-block md:block text-right">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Standard Rate</p>
                  <p className="text-lg font-black text-[#123B32] dark:text-emerald-400">
                    ₹{worker.dailyRate}{' '}
                    <span className="text-xs font-normal text-neutral-500">/ day</span>
                  </p>
                </div>
              </div>

              {/* Meta details */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-neutral-600 dark:text-neutral-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#123B32] dark:text-emerald-400" />
                  <span>{worker.location}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {worker.rating.toFixed(1)}
                  </span>
                  <span>({worker.completedJobsCount} completed jobs)</span>
                </div>

                {worker.labourNumber && (
                  <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-darkbg-base px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-darkbg-border font-mono font-bold text-[#123B32] dark:text-emerald-300">
                    <span>Labour No:</span>
                    <span>{worker.labourNumber}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons for Employers */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-4 border-t border-neutral-100 dark:border-darkbg-border">
                <button
                  onClick={handleHireDirect}
                  className="px-6 py-3 rounded-2xl bg-[#123B32] text-white font-bold text-xs hover:bg-[#0c2721] transition-all shadow-md flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Request / Book Worker
                </button>

                <button
                  onClick={handleCallWorker}
                  className="px-5 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#123B32] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs hover:bg-emerald-100 transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call Worker
                </button>

                <button
                  onClick={handleSaveToggle}
                  className={`px-4 py-3 rounded-2xl border font-bold text-xs transition-colors flex items-center gap-1.5 ${
                    isSaved
                      ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:border-red-800'
                      : 'bg-white dark:bg-darkbg-base text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-darkbg-border hover:bg-neutral-50'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                  {isSaved ? 'Saved' : 'Save Worker'}
                </button>

                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="p-3 rounded-2xl bg-white dark:bg-darkbg-base text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-darkbg-border hover:bg-neutral-50 transition-colors"
                  title="Share Profile"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Public Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Main Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* About Worker */}
            <div className="bg-white dark:bg-darkbg-surface rounded-3xl border border-neutral-200 dark:border-darkbg-border p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                About the Worker
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {worker.bio ||
                  `${worker.name} is a certified, background-checked professional with ${worker.experienceYears} years of hands-on field experience. Known for punctual arrivals, accurate job scoping, and verified high customer satisfaction across residential and commercial sites.`}
              </p>
            </div>

            {/* Verified Skills */}
            <div className="bg-white dark:bg-darkbg-surface rounded-3xl border border-neutral-200 dark:border-darkbg-border p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Verified Skills & Expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-[#123B32] text-white text-xs font-bold capitalize shadow-xs">
                  ★ Primary: {worker.primarySkill}
                </span>
                {(worker.secondarySkills || worker.skills.slice(1))?.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-darkbg-base text-neutral-800 dark:text-neutral-200 text-xs font-bold capitalize border border-neutral-200 dark:border-darkbg-border"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {worker.experienceBreakdown && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-neutral-100 dark:border-darkbg-border">
                  {worker.experienceBreakdown.map((exp, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-50 dark:bg-darkbg-base rounded-2xl border border-neutral-200 dark:border-darkbg-border"
                    >
                      <p className="font-bold text-xs text-neutral-900 dark:text-white">{exp.area}</p>
                      <p className="text-[11px] text-[#123B32] dark:text-emerald-400 font-semibold mt-0.5">
                        {exp.years} years • {exp.specialization || 'General Fieldwork'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Work Portfolio */}
            {worker.portfolio && worker.portfolio.length > 0 && (
              <div className="bg-white dark:bg-darkbg-surface rounded-3xl border border-neutral-200 dark:border-darkbg-border p-6 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Past Completed Projects
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {worker.portfolio.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-darkbg-border bg-neutral-100 dark:bg-darkbg-base aspect-square"
                    >
                      <img
                        src={item.photoUrl || item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 p-2.5 flex flex-col justify-end text-left text-white">
                        <p className="font-bold text-xs truncate">{item.title}</p>
                        <p className="text-[10px] text-emerald-300">{item.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ratings & Reviews */}
            <div className="bg-white dark:bg-darkbg-surface rounded-3xl border border-neutral-200 dark:border-darkbg-border p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Employer Ratings & Reviews
                </h2>
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{worker.rating.toFixed(1)} out of 5</span>
                </div>
              </div>

              {worker.reviews && worker.reviews.length > 0 ? (
                <div className="space-y-3">
                  {worker.reviews.slice(0, 3).map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 bg-neutral-50 dark:bg-darkbg-base rounded-2xl border border-neutral-200 dark:border-darkbg-border space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-neutral-900 dark:text-white">
                          {rev.authorName || rev.employerName}
                        </p>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-neutral-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300">{rev.comment}</p>
                      <p className="text-[10px] text-neutral-400">{rev.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-500">No written reviews yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar Right Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
              {/* Availability Summary */}
              <div className="bg-white dark:bg-darkbg-surface rounded-3xl border border-neutral-200 dark:border-darkbg-border p-6 shadow-sm space-y-3">
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Today&apos;s Availability
                </h2>
                {worker.availableToday !== false && worker.availability !== 'Busy' ? (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <span className="font-bold text-xs text-[#123B32] dark:text-emerald-300">
                      Ready for Immediate Booking Today
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800">
                    <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
                    <span className="font-bold text-xs text-rose-800 dark:text-rose-300">
                      Not Available Today (Resting / On Job)
                    </span>
                  </div>
                )}
                <p className="text-xs text-neutral-500">
                  Standard hours: 8:00 AM – 6:00 PM
                </p>
              </div>

            {/* Service Radius */}
            <div className="bg-white dark:bg-darkbg-surface rounded-3xl border border-neutral-200 dark:border-darkbg-border p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Service Area
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                Serves within <span className="font-bold text-[#123B32] dark:text-emerald-400">{worker.maxTravelDistanceKm || worker.serviceRadiusKm || 10} km</span> of {worker.location}.
              </p>
              <div className="p-3 bg-neutral-50 dark:bg-darkbg-base rounded-2xl text-[11px] text-neutral-500 border border-neutral-200 dark:border-darkbg-border">
                Travel charges are pre-included in standard platform minimum wage guidelines.
              </div>
            </div>

            {/* Certifications */}
            {worker.certifications && worker.certifications.length > 0 && (
              <div className="bg-white dark:bg-darkbg-surface rounded-3xl border border-neutral-200 dark:border-darkbg-border p-6 shadow-sm space-y-3">
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Government & Trade Certifications
                </h2>
                <div className="space-y-2">
                  {worker.certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-3 bg-neutral-50 dark:bg-darkbg-base rounded-2xl border border-neutral-200 dark:border-darkbg-border flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#123B32]/10 text-[#123B32] dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-neutral-900 dark:text-white">{cert.name}</p>
                        <p className="text-[10px] text-neutral-500">{cert.issuingOrg} • {cert.issueDate || cert.year || 'Certified'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            <div className="bg-white dark:bg-darkbg-surface rounded-3xl border border-neutral-200 dark:border-darkbg-border p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Spoken Languages
              </h2>
              <div className="flex flex-wrap gap-2">
                {(worker.languagesKnown || worker.languagesList)?.map((l, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-neutral-100 dark:bg-darkbg-base text-neutral-700 dark:text-neutral-300 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-darkbg-border"
                  >
                    {l.name} ({l.proficiency})
                  </span>
                )) || (
                  <span className="text-xs text-neutral-500">Hindi, English</span>
                )}
              </div>
            </div>

            {/* Privacy & Trust Badge */}
            <div className="bg-neutral-50 dark:bg-darkbg-base p-5 rounded-3xl border border-neutral-200 dark:border-darkbg-border space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                <Lock className="w-4 h-4 text-[#123B32] dark:text-emerald-400" />
                ROZGO Privacy & Safety Shield
              </div>
              <p className="text-[11px] leading-relaxed">
                Personal identity records (masked Aadhaar, residential street address, bank accounts) are securely held by cooperative administrative officers. Only verified work credentials and rating data are displayed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Badge Details Modal */}
      <VerifiedBadgeModal
        isOpen={isVerifiedModalOpen}
        onClose={() => setIsVerifiedModalOpen(false)}
        worker={worker}
      />

      {/* Share Profile Modal */}
      <ShareProfileModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        worker={worker}
      />

    </div>
  );
};
export default PublicWorkerProfilePage;
