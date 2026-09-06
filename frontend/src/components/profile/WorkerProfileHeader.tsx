import React, { useState } from 'react';
import {
  ShieldCheck,
  Star,
  MapPin,
  Briefcase,
  Copy,
  Check,
  Share2,
  Edit3,
  Camera,
  X,
  Upload,
  AlertTriangle,
  Info,
  LogOut,
} from 'lucide-react';
import { WorkerProfile } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { LabourBadge } from '../workers/LabourBadge';
import { VerifiedBadgeModal } from './VerifiedBadgeModal';

interface WorkerProfileHeaderProps {
  worker: WorkerProfile;
  onEditProfile: () => void;
  onShareProfile: () => void;
  onUpdatePhoto?: (newPhotoUrl: string) => void;
  onLogout?: () => void;
}

export const WorkerProfileHeader: React.FC<WorkerProfileHeaderProps> = ({
  worker,
  onEditProfile,
  onShareProfile,
  onUpdatePhoto,
  onLogout,
}) => {
  const [copied, setCopied] = useState(false);
  const [isVerifiedModalOpen, setIsVerifiedModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  const handleCopyLabourId = () => {
    if (worker.labourNumber) {
      navigator.clipboard.writeText(worker.labourNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedPhotoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    if (selectedPhotoPreview && onUpdatePhoto) {
      onUpdatePhoto(selectedPhotoPreview);
    }
    setIsPhotoModalOpen(false);
  };

  const handleRemovePhoto = () => {
    const defaultAvatar =
      'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80';
    if (onUpdatePhoto) {
      onUpdatePhoto(defaultAvatar);
    }
    setIsPhotoModalOpen(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-darkbg-card rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-darkbg-border shadow-soft relative overflow-hidden text-left">
        {/* Decorative subtle brand background highlight */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rozgo-50/50 dark:bg-rozgo-950/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* Profile Photo with Edit trigger */}
          <div className="relative group flex-shrink-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-white dark:border-darkbg-surface shadow-soft bg-neutral-100 dark:bg-neutral-800">
              <img
                src={worker.avatar}
                alt={worker.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Change photo button */}
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="absolute bottom-2 right-2 p-2.5 rounded-2xl bg-[#123B32] text-white shadow-md hover:bg-[#0d2822] hover:scale-110 active:scale-95 transition-all"
              title="Change Profile Photo"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Verified Icon on photo if verified */}
            {worker.isVerified && (
              <button
                type="button"
                onClick={() => setIsVerifiedModalOpen(true)}
                className="absolute -top-1.5 -left-1.5 p-1.5 rounded-full bg-emerald-600 text-white shadow-md border-2 border-white dark:border-darkbg-surface"
                title="Verified Profile"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Central Details */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                    {worker.name}
                  </h1>
                  {worker.isVerified ? (
                    <button
                      type="button"
                      onClick={() => setIsVerifiedModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-300 dark:border-emerald-700/60 hover:bg-emerald-200 transition-colors shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Verified Worker</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-300 dark:border-amber-700">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Not Verified</span>
                    </span>
                  )}
                </div>

                {/* Primary Trade & Location */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-semibold mt-1">
                  <div className="flex items-center gap-1.5 text-[#123B32] dark:text-rozgo-300 font-bold">
                    <Briefcase className="w-4 h-4" />
                    <span className="capitalize">{worker.primarySkill.replace('_', ' ')}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    <span>{worker.location}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Edit & Share */}
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 pt-1 md:pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit3 className="w-4 h-4 text-[#123B32]" />}
                  onClick={onEditProfile}
                  className="font-bold border-neutral-300 dark:border-darkbg-border"
                >
                  Edit Profile
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Share2 className="w-4 h-4" />}
                  onClick={onShareProfile}
                  className="!bg-[#123B32] hover:!bg-[#0d2822] text-white font-bold shadow-sm"
                >
                  Share Profile
                </Button>
                {onLogout && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />}
                    onClick={onLogout}
                    className="font-bold border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Logout
                  </Button>
                )}
              </div>
            </div>

            {/* Rating & Jobs Stats */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs font-black">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{(worker.rating || 0).toFixed(1)}</span>
                <span className="text-neutral-400 font-medium font-mono">({(worker.reviews || []).length} reviews)</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rozgo-50 dark:bg-rozgo-950/30 border border-rozgo-200 dark:border-rozgo-900/40 text-neutral-800 dark:text-neutral-200 text-xs font-bold">
                <span className="text-[#123B32] dark:text-rozgo-300 font-black">{worker.completedJobsCount}</span>
                <span>Jobs Completed</span>
              </div>
            </div>

            {/* Prominent ROZGO Labour Number Strip */}
            <div className="pt-2 border-t border-neutral-100 dark:border-darkbg-border flex flex-col sm:flex-row items-center sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  ROZGO Labour No.
                </span>
                <div
                  className="group relative cursor-pointer"
                  title="This is your unique ROZGO worker ID. Use this ID for direct hiring, grievances, and identification."
                >
                  <Info className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-700" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {worker.labourNumber ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-neutral-100 dark:bg-darkbg-surface border border-neutral-300 dark:border-darkbg-border">
                    <span className="font-mono text-sm font-black text-[#123B32] dark:text-rozgo-300 tracking-wider">
                      {worker.labourNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLabourId}
                      className="p-1 rounded-lg text-neutral-500 hover:text-[#123B32] dark:hover:text-white transition-colors"
                      title="Copy Labour ID"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 px-3 py-1 rounded-xl">
                    Issued After Verification
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Profile Modal */}
      <VerifiedBadgeModal
        isOpen={isVerifiedModalOpen}
        onClose={() => setIsVerifiedModalOpen(false)}
        worker={worker}
      />

      {/* Change Photo Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkbg-card rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-neutral-200 dark:border-darkbg-border animate-scaleUp text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-neutral-900 dark:text-white">
                Change Profile Photo
              </h3>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              Use a clear photo where your face is visible and well-lit. This helps employers recognize you on site.
            </p>

            {selectedPhotoPreview && (
              <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border-2 border-[#123B32] shadow-sm">
                <img src={selectedPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-2 pt-2">
              <label className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-darkbg-border text-xs font-bold text-neutral-700 dark:text-neutral-200 flex items-center justify-center gap-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-darkbg-surface">
                <Upload className="w-4 h-4" />
                <span>Upload New Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleRemovePhoto}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
              >
                Remove Photo / Reset to Default
              </button>
            </div>

            {selectedPhotoPreview && (
              <Button
                variant="primary"
                size="md"
                fullWidth
                className="!bg-[#123B32] text-white font-bold mt-2"
                onClick={handleSavePhoto}
              >
                Save New Photo
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

