import React from 'react';
import {
  Wrench,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Coins,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { BookingAgreement, JobRecommendation } from '../../types';

interface AcceptRejectWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void | Promise<void>;
  onReject: () => void | Promise<void>;
  agreement?: BookingAgreement | null;
  job?: JobRecommendation | null;
  isSubmitting?: boolean;
  error?: string | null;
}

export const AcceptRejectWorkModal: React.FC<AcceptRejectWorkModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  onReject,
  agreement,
  job,
  isSubmitting = false,
  error = null,
}) => {
  const title = agreement?.workTitle || job?.subcategory || 'Work Opportunity';
  const category = agreement?.serviceCategory || job?.serviceCategory || 'Service';
  const description = agreement?.description || job?.description || 'Mutually verified cooperative trade service request.';
  const employerName = agreement?.employerName || job?.employerName || 'Direct Customer';
  const employerPhone = agreement?.employerPhone || job?.employerPhone || '+91 98111 88234';
  const location = agreement?.location || job?.location || 'Gurgaon, Haryana';
  const date = agreement?.date || 'Today';
  const time = agreement?.time || job?.preferredTime || '11:00 AM';
  const wage = agreement?.agreedWage || job?.wage || 582;
  const bookingRef = agreement?.bookingNumber;

  const handleCall = () => {
    const cleanPhone = employerPhone.replace(/[^0-9+]/g, '');
    if (cleanPhone) {
      window.location.href = `tel:${cleanPhone}`;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-6 text-left py-1">
        {/* Header Badge & Title */}
        <div className="pb-4 border-b border-neutral-100 dark:border-darkbg-border flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <Badge variant="warning" size="sm">
                Action Required • Worker Confirmation
              </Badge>
              {bookingRef && (
                <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                  #{bookingRef}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight mt-1">
              {title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 capitalize">
              <Wrench className="w-3.5 h-3.5 text-rozgo-600 dark:text-rozgo-400" />
              <span className="font-semibold">{category}</span>
              <span>•</span>
              <span>1 Worker Requested</span>
            </div>
          </div>
        </div>

        {/* Employer Terms Description */}
        {description && (
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200/70 dark:border-darkbg-border text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
            <span className="font-bold text-neutral-900 dark:text-white block mb-0.5">
              Work Description:
            </span>
            &ldquo;{description}&rdquo;
          </div>
        )}

        {/* Wage Highlight Card (Zero Commission Guarantee) */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-100/40 dark:from-emerald-950/40 dark:via-darkbg-surface dark:to-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-800/60 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1">
                <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Agreed Take-Home Wage</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-400">
                ₹{Number(wage).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="sm:text-right">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>0% Commission • 100% Yours</span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                Direct settlement from employer upon completion
              </p>
            </div>
          </div>
        </div>

        {/* Employer & Schedule Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          {/* Employer Card */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border flex flex-col justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                Employer Details
              </div>
              <div className="font-bold text-neutral-900 dark:text-white text-sm">
                {employerName}
              </div>
              <div className="text-neutral-500">{employerPhone}</div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCall}
              leftIcon={<Phone className="w-3.5 h-3.5 text-emerald-600" />}
              className="mt-3 font-bold w-full justify-center"
            >
              Call Employer
            </Button>
          </div>

          {/* Schedule & Location Card */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border space-y-3">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                Date & Time
              </div>
              <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white text-sm mt-0.5">
                <Clock className="w-3.5 h-3.5 text-rozgo-600 dark:text-rozgo-400" />
                <span>{date} • {time}</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                Work Location
              </div>
              <div className="flex items-start gap-1.5 font-bold text-neutral-900 dark:text-white text-xs mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="pt-2 border-t border-neutral-100 dark:border-darkbg-border flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isSubmitting}
            onClick={onReject}
            leftIcon={<XCircle className="w-5 h-5 text-rose-600" />}
            className="w-full sm:w-1/2 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 font-black justify-center disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Reject Work'}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            onClick={onAccept}
            leftIcon={
              isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              )
            }
            className="w-full sm:w-1/2 !bg-emerald-700 hover:!bg-emerald-800 text-white font-black justify-center shadow-md disabled:opacity-50"
          >
            {isSubmitting ? 'Confirming...' : `Accept Work (₹${Number(wage).toLocaleString('en-IN')})`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

