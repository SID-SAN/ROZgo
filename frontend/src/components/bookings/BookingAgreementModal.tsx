import React from 'react';
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
} from 'lucide-react';
import { BookingAgreement } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { LabourBadge } from '../workers/LabourBadge';

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
              ? 'Confirmed'
              : agreement.status === 'completed'
              ? 'Completed'
              : 'Awaiting Worker Confirmation'}
          </Badge>
        </div>

        {/* Agreement Summary Box */}
        <div className="p-5 rounded-2xl bg-rozgo-50/70 dark:bg-darkbg-surface border border-rozgo-100 dark:border-darkbg-border space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rozgo-700 dark:text-rozgo-300">
                Job Specification
              </span>
              <h4 className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                {agreement.workTitle}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                {agreement.description}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-neutral-500 uppercase font-semibold">Agreed Total Wage</span>
              <div className="text-2xl font-black text-rozgo-900 dark:text-emerald-400">
                ₹{agreement.agreedWage.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-rozgo-200/60 dark:border-darkbg-border text-xs">
            <div>
              <div className="text-neutral-500 font-medium">Date</div>
              <div className="font-bold text-neutral-900 dark:text-white mt-0.5">{agreement.date}</div>
            </div>
            <div>
              <div className="text-neutral-500 font-medium">Start Time</div>
              <div className="font-bold text-neutral-900 dark:text-white mt-0.5">{agreement.time}</div>
            </div>
            <div>
              <div className="text-neutral-500 font-medium">Workers Engaged</div>
              <div className="font-bold text-neutral-900 dark:text-white mt-0.5">{agreement.workersCount} Worker(s)</div>
            </div>
            <div>
              <div className="text-neutral-500 font-medium">Difficulty Level</div>
              <div className="font-bold text-neutral-900 dark:text-white mt-0.5">{agreement.difficulty}</div>
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
        <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-darkbg-surface text-xs text-neutral-600 dark:text-neutral-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-rozgo-700 flex-shrink-0 mt-0.5" />
          <p>
            This agreement confirms that wages, timings, and worker count were negotiated directly over phone calls. ROZGO does not deduct intermediary commissions.
          </p>
        </div>

        {/* Action Buttons */}
        {isWorkerPerspective && agreement.status === 'awaiting_confirmation' ? (
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              leftIcon={<XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
              onClick={() => {
                if (onWorkerReject) onWorkerReject();
                onClose();
              }}
              className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 font-bold"
            >
              Reject Booking
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={<CheckCircle2 className="w-5 h-5 text-rozgo-300" />}
              onClick={() => {
                if (onWorkerConfirm) onWorkerConfirm();
                onClose();
              }}
              className="!bg-[#123B32] hover:!bg-[#0c2721] text-white font-bold"
            >
              Confirm Booking (Accept)
            </Button>
          </div>
        ) : (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
            {isEmployerPerspective && onEmployerReject && agreement.status !== 'completed' && agreement.status !== 'rejected' ? (
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

