import React, { useState } from 'react';
import {
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Printer,
  XCircle,
  Loader2,
} from 'lucide-react';
import { BookingAgreement } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { LabourBadge } from '../workers/LabourBadge';
import { apiClient } from '../../api/apiClient';
import { API_ENDPOINTS } from '../../api/endpoints';

interface BookingAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  agreement: BookingAgreement;
  isWorkerPerspective?: boolean;
  onWorkerConfirm?: () => void;
  onWorkerReject?: () => void;
  isEmployerPerspective?: boolean;
  onEmployerReject?: () => void;
}

export const BookingAgreementModal: React.FC<BookingAgreementModalProps> = ({
  isOpen,
  onClose,
  agreement,
  isWorkerPerspective = false,
  onWorkerConfirm,
  onWorkerReject,
  isEmployerPerspective = false,
  onEmployerReject,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleWorkerAccept = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Call backend contract accept endpoint
      const contractId = agreement.id || agreement.bookingNumber;
      await apiClient.post('/bookings/agreement/worker-response', {
        bookingId: contractId,
        accept: true,
      }).catch(() => apiClient.post(API_ENDPOINTS.CONTRACTS.ACCEPT(contractId), {}));

      if (onWorkerConfirm) onWorkerConfirm();
      onClose();
    } catch (err) {
      console.error('Error accepting contract:', err);
      setSubmitError('Failed to accept contract. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWorkerReject = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Call backend contract reject endpoint
      const contractId = agreement.id || agreement.bookingNumber;
      await apiClient.post('/bookings/agreement/worker-response', {
        bookingId: contractId,
        accept: false,
        rejectReason: 'Rejected by worker',
      }).catch(() => apiClient.post(API_ENDPOINTS.CONTRACTS.REJECT(contractId), {
        contractId,
        action: 'reject',
        rejectReason: 'Rejected by worker'
      }));

      if (onWorkerReject) onWorkerReject();
      onClose();
    } catch (err) {
      console.error('Error rejecting contract:', err);
      setSubmitError('Failed to reject contract. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-6 print-agreement-container">
        {/* Document Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-darkbg-border">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rozgo-900 text-white flex items-center justify-center font-bold text-sm">
                R
              </div>
              <span className="font-extrabold text-lg text-rozgo-900 dark:text-white">
                ROZGO COOPERATIVE
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Verified Work Agreement #{agreement.bookingNumber}
            </p>
          </div>

          <Badge
            variant={
              agreement.status === 'confirmed'
                ? 'success'
                : agreement.status === 'completed'
                ? 'primary'
                : 'warning'
            }
            size="md"
          >
            {agreement.status === 'confirmed'
              ? 'Work Accepted • Confirmed'
              : agreement.status === 'completed'
              ? 'Completed'
              : 'Awaiting Worker Confirmation'}
          </Badge>
        </div>

        {/* Work Accepted Banner */}
        {agreement.status === 'confirmed' && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-emerald-900 dark:text-emerald-300">
                Work Accepted & Confirmed by Worker!
              </span>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                The worker has confirmed and accepted this booking at ₹{agreement.agreedWage.toLocaleString('en-IN')}. This job is officially active.
              </p>
            </div>
          </div>
        )}

        {/* Agreement Summary Box - REAL DATA FROM CONTRACT */}
        <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-900/50 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Job Specification (From Employer Contract)
              </span>
              <h4 className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                {agreement.workTitle}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                {agreement.description}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-neutral-500 uppercase font-semibold">💰 Exact Wage (Negotiated)</span>
              <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                ₹{agreement.agreedWage.toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-300 mt-2 block">
                No commission deducted
              </span>
            </div>
          </div>

          {/* Key Metrics - ALL FROM CONTRACT */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-emerald-200 dark:border-emerald-900/50 text-xs">
            <div>
              <div className="text-neutral-600 dark:text-neutral-400 font-medium">Date</div>
              <div className="font-bold text-neutral-900 dark:text-white mt-0.5">{agreement.date}</div>
            </div>
            <div>
              <div className="text-neutral-600 dark:text-neutral-400 font-medium">Start Time</div>
              <div className="font-bold text-neutral-900 dark:text-white mt-0.5">{agreement.time}</div>
            </div>
            <div>
              <div className="text-neutral-600 dark:text-neutral-400 font-medium">Workers</div>
              <div className="font-bold text-neutral-900 dark:text-white mt-0.5">{agreement.workersCount} Worker(s)</div>
            </div>
            <div>
              <div className="text-neutral-600 dark:text-neutral-400 font-medium">Location</div>
              <div className="font-bold text-neutral-900 dark:text-white mt-0.5 truncate">{agreement.location}</div>
            </div>
          </div>
        </div>

        {/* Parties Involved */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Employer Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Employer / Customer
            </span>
            <h5 className="text-base font-bold text-neutral-900 dark:text-white mt-1">
              {agreement.employerName}
            </h5>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5 font-medium">
              {agreement.employerPhone}
            </p>
            <div className="flex items-center gap-1 text-xs text-neutral-500 mt-2">
              <MapPin className="w-3.5 h-3.5 text-rozgo-700 flex-shrink-0" />
              <span className="truncate">{agreement.location}</span>
            </div>
          </div>

          {/* Worker(s) Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Assigned Worker(s)
            </span>
            <div className="mt-1 space-y-2">
              {agreement.workers.map((w) => (
                <div key={w.workerId} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-white">
                      {w.name}
                    </div>
                    <div className="text-xs text-neutral-500">{w.phone}</div>
                  </div>
                  <LabourBadge labourNumber={w.labourNumber} size="sm" showCopy={false} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cooperative Transparency Notice */}
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-900 dark:text-emerald-100 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">✓ Genuine Contract - Direct from Employer</p>
            <p className="mt-1">
              This agreement shows the EXACT terms submitted by the employer. Wages and conditions were negotiated directly over phone. ROZGO takes 0% commission - you receive 100% of the agreed wage (₹{agreement.agreedWage.toLocaleString('en-IN')}).
            </p>
          </div>
        </div>

        {/* Employer Perspective Notice when awaiting worker confirmation */}
        {isEmployerPerspective && agreement.status === 'awaiting_confirmation' && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/60 text-amber-950 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <div className="font-bold">Awaiting Worker Confirmation</div>
              <p className="text-xs text-amber-900/80 dark:text-amber-300/80 mt-0.5">
                These booking terms have been submitted. The booking is waiting for {agreement.workers[0]?.name || 'the worker'} to respond and confirm from their dashboard.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Error</div>
              <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isWorkerPerspective && agreement.status === 'awaiting_confirmation' ? (
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              disabled={isSubmitting}
              leftIcon={isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
              onClick={handleWorkerReject}
              className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 font-bold disabled:opacity-50"
            >
              {isSubmitting ? 'Rejecting...' : 'Reject Booking'}
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
              leftIcon={isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-rozgo-300" />}
              onClick={handleWorkerAccept}
              className="!bg-[#123B32] hover:!bg-[#0c2721] text-white font-bold disabled:opacity-50"
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Booking (Accept)'}
            </Button>
          </div>
        ) : (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
            {isEmployerPerspective && onEmployerReject && agreement.status === 'awaiting_confirmation' ? (
              <Button
                variant="outline"
                size="md"
                leftIcon={<XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                onClick={() => {
                  onEmployerReject();
                  onClose();
                }}
                className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 font-bold w-full sm:w-auto"
              >
                Reject Booking
              </Button>
            ) : <div className="hidden sm:block" />}

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={() => window.print()}
              >
                Print Agreement
              </Button>
              <Button variant="primary" size="md" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

