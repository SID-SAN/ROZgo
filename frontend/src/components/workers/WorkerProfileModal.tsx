import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  Phone,
  Briefcase,
  Award,
  CheckCircle2,
  X,
  ExternalLink,
  Clock,
  Globe,
  Layers,
  Image as ImageIcon,
  FileCheck,
  MessageSquare,
} from 'lucide-react';
import { WorkerProfile } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { LabourBadge } from './LabourBadge';

interface WorkerProfileModalProps {
  worker: WorkerProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onCall?: () => void;
}

export const WorkerProfileModal: React.FC<WorkerProfileModalProps> = ({
  worker,
  isOpen,
  onClose,
  onCall,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'certifications' | 'reviews'>('overview');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!worker) return null;

  const handleCall = () => {
    if (onCall) {
      onCall();
    } else {
      const phone = worker.phone.replace(/[^0-9+]/g, '') || worker.phone;
      window.location.href = `tel:${phone}`;
    }
  };

  const certifications = worker.certifications || [];
  const portfolio = worker.portfolio || [];
  const reviews = worker.reviews || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl" title="">
      <div className="space-y-6 text-left -mt-2">
        {/* Worker Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-darkbg-border">
          <div className="flex items-center gap-4">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl object-cover border-2 border-white dark:border-darkbg-card shadow-soft shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-black text-neutral-900 dark:text-white">
                  {worker.name}
                </h2>
                <LabourBadge labourNumber={worker.labourNumber} />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{worker.rating.toFixed(1)}</span>
                  <span className="text-neutral-400">({worker.completedJobsCount} jobs completed)</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{worker.location} ({worker.distanceKm} km away)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Badge variant="verified" size="sm">
                  100% Verified Identity
                </Badge>
                <span className="text-xs font-semibold text-neutral-500">
                  {worker.experienceYears} Years Trade Experience
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto shrink-0">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Phone className="w-4 h-4" />}
              onClick={handleCall}
              className="!bg-emerald-600 hover:!bg-emerald-700 text-white font-black shadow-sm flex-1 sm:flex-initial"
            >
              Call {worker.name}
            </Button>
            <Link
              to={`/worker/${worker.labourNumber || worker.id}`}
              target="_blank"
              className="inline-flex items-center justify-center gap-1 text-xs font-bold text-rozgo-700 dark:text-rozgo-300 hover:underline py-1"
            >
              <span>Full Profile Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 dark:border-darkbg-border gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-rozgo-900 text-rozgo-900 dark:border-rozgo-400 dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Overview & Skills
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('portfolio')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'portfolio'
                ? 'border-rozgo-900 text-rozgo-900 dark:border-rozgo-400 dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Work Portfolio ({portfolio.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('certifications')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'certifications'
                ? 'border-rozgo-900 text-rozgo-900 dark:border-rozgo-400 dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Certifications ({certifications.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-rozgo-900 text-rozgo-900 dark:border-rozgo-400 dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Customer Reviews ({reviews.length})</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Bio */}
            {worker.bio && (
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-100 dark:border-darkbg-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  About Worker
                </h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {worker.bio}
                </p>
              </div>
            )}

            {/* Skills & Specialties */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Skills & Specializations
              </h4>
              <div className="flex flex-wrap gap-2">
                {worker.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-rozgo-50 dark:bg-darkbg-surface text-rozgo-900 dark:text-rozgo-200 border border-rozgo-200/80 dark:border-darkbg-border font-bold text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience Breakdown */}
            {worker.experienceBreakdown && worker.experienceBreakdown.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Experience by Field
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {worker.experienceBreakdown.map((exp, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {exp.area}
                      </span>
                      <span className="font-bold text-rozgo-900 dark:text-rozgo-300">
                        {exp.years} Years
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verified Credentials Checklist */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Verified Citizen Trust Badges</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-emerald-950 dark:text-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Aadhaar / National ID Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Phone Number OTP Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero Commission Direct Agreement</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fair Trade Wage Compliant</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Work Portfolio Pictures */}
        {activeTab === 'portfolio' && (
          <div className="space-y-4 animate-fadeIn">
            {portfolio.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-neutral-200 dark:border-darkbg-border overflow-hidden bg-white dark:bg-darkbg-card shadow-xs group"
                  >
                    <div className="relative h-44 overflow-hidden bg-neutral-100">
                      <img
                        src={item.photoUrl || item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => setSelectedPhoto(item.photoUrl || item.imageUrl || '')}
                      />
                      {item.category && (
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 text-white font-bold text-[11px] backdrop-blur-xs">
                          {item.category}
                        </span>
                      )}
                      {item.completedDate && (
                        <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-darkbg-base/90 text-neutral-800 dark:text-neutral-200 font-bold text-[11px] backdrop-blur-xs shadow-xs">
                          {item.completedDate}
                        </span>
                      )}
                    </div>
                    <div className="p-3.5 space-y-1">
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-500 text-xs">
                No past work photos uploaded yet for this worker profile.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Certifications */}
        {activeTab === 'certifications' && (
          <div className="space-y-4 animate-fadeIn">
            {certifications.length > 0 ? (
              <div className="space-y-3">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 rounded-2xl border border-neutral-200 dark:border-darkbg-border bg-white dark:bg-darkbg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-rozgo-100 dark:bg-rozgo-900/60 text-rozgo-900 dark:text-rozgo-200 flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5 text-rozgo-800 dark:text-rozgo-300" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                          {cert.name || cert.title}
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Issued by: <strong>{cert.issuingOrg || cert.issuer}</strong>
                        </p>
                        {cert.certificateNumber && (
                          <div className="text-[11px] font-mono text-neutral-400 pt-0.5">
                            Cert No: {cert.certificateNumber}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Credential</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-500 text-xs">
                No formal institutional certificates on record. Worker is verified through practical experience and citizen reviews.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Customer Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-4 animate-fadeIn">
            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-100 dark:border-darkbg-border text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 dark:text-white text-sm">
                          {rev.authorName || rev.employerName}
                        </span>
                        <div className="flex text-amber-500">
                          {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <span className="text-neutral-400">{rev.date}</span>
                    </div>

                    {rev.jobTitle && (
                      <div className="text-[11px] font-semibold text-rozgo-800 dark:text-rozgo-300">
                        Task: {rev.jobTitle}
                      </div>
                    )}

                    <p className="text-neutral-700 dark:text-neutral-300 italic leading-relaxed text-sm">
                      "{rev.comment}"
                    </p>

                    {rev.tags && rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rev.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-md bg-white dark:bg-darkbg-card border border-neutral-200 text-neutral-600 dark:text-neutral-400 text-[10px] font-semibold"
                          >
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-500 text-xs">
                No reviews recorded yet for this worker profile.
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-200 dark:border-darkbg-border">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Phone className="w-4 h-4" />}
            onClick={handleCall}
            className="!bg-emerald-600 hover:!bg-emerald-700 text-white font-bold w-full sm:w-auto"
          >
            Call {worker.name} ({worker.phone})
          </Button>
        </div>
      </div>
    </Modal>
  );
};

