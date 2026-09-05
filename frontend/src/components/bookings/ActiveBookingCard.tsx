import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, FileText, CheckCircle2, AlertTriangle, Calendar, Clock, MapPin, Users, ShieldAlert, XCircle } from 'lucide-react';
import { BookingAgreement } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface ActiveBookingCardProps {
  booking: BookingAgreement;
  role: 'worker' | 'employer';
  onCall: () => void;
  onViewAgreement: () => void;
  onCompleteWork: () => void;
  onRejectBooking?: () => void;
}

export const ActiveBookingCard: React.FC<ActiveBookingCardProps> = ({
  booking,
  role,
  onCall,
  onViewAgreement,
  onCompleteWork,
  onRejectBooking,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Unable to reach agreement on wage or timing');

  const counterpartyName =
    role === 'worker' ? booking.employerName : booking.workers[0]?.name || 'Worker';
  const counterpartyPhone =
    role === 'worker' ? booking.employerPhone : booking.workers[0]?.phone || '';

  return (
    <>
      <Card
        variant="elevated"
        padding="lg"
        className="border-2 border-rozgo-900 dark:border-rozgo-700 relative overflow-hidden"
      >
        {/* Top Status Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-darkbg-border mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black tracking-wider uppercase text-rozgo-900 dark:text-rozgo-300">
              ACTIVE BOOKING IN PROGRESS
            </span>
          </div>

          <Badge variant="success" size="sm">
            #{booking.bookingNumber}
          </Badge>
        </div>

        {/* Title & Wage */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
              {booking.workTitle}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {booking.description}
            </p>
          </div>

          <div className="sm:text-right">
            <div className="text-xs text-neutral-400 font-bold uppercase">Agreed Wage</div>
            <div className="text-2xl sm:text-3xl font-black text-rozgo-900 dark:text-emerald-400">
              ₹{booking.agreedWage.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Schedule & Personnel Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-rozgo-50/70 dark:bg-darkbg-surface border border-rozgo-100 dark:border-darkbg-border text-xs mb-5">
          <div>
            <span className="text-neutral-500 font-medium">Date & Time</span>
            <div className="font-bold text-neutral-900 dark:text-white mt-0.5">
              {booking.date} • {booking.time}
            </div>
          </div>

          <div>
            <span className="text-neutral-500 font-medium">Workers</span>
            <div className="font-bold text-neutral-900 dark:text-white mt-0.5">
              {booking.workersCount} assigned
            </div>
          </div>

          <div className="col-span-2 sm:col-span-2">
            <span className="text-neutral-500 font-medium">
              {role === 'worker' ? 'Employer Contact' : 'Worker Contact'}
            </span>
            <div className="font-bold text-neutral-900 dark:text-white mt-0.5 truncate">
              {counterpartyName} ({counterpartyPhone})
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-2.5 pt-2 border-t border-neutral-100 dark:border-darkbg-border">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Phone className="w-4 h-4" />}
            onClick={onCall}
          >
            Call {role === 'worker' ? 'Employer' : 'Worker'}
          </Button>

          <Button
            variant="secondary"
            size="md"
            leftIcon={<FileText className="w-4 h-4" />}
            onClick={onViewAgreement}
          >
            View Agreement
          </Button>

          <Link
            to={`/grievances/new?bookingId=${booking.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-bold transition-all"
            title="Report a dispute, wage issue, or misconduct"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Report a Problem</span>
          </Link>

          {role === 'employer' && onRejectBooking && booking.status !== 'completed' && booking.status !== 'rejected' && (
            <Button
              variant="outline"
              size="md"
              leftIcon={<XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
              onClick={() => setIsRejectOpen(true)}
              className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 font-bold"
            >
              Reject Booking
            </Button>
          )}

          <Button
            variant="success"
            size="md"
            className="sm:ml-auto"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            onClick={() => setIsConfirmOpen(true)}
          >
            Work Completed
          </Button>
        </div>
      </Card>

      {/* Reject Booking Confirmation Dialog */}
      <Modal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        title="Reject / Cancel Booking"
        maxWidth="sm"
      >
        <div className="text-center py-2 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8" />
          </div>

          <h4 className="text-xl font-bold text-neutral-900 dark:text-white">
            Reject this booking?
          </h4>

          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            This will cancel your booking with {counterpartyName}. You can then find and book another verified worker directly.
          </p>

          <div className="text-left space-y-2 pt-2">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Reason for rejection:
            </label>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-neutral-900 dark:text-white"
            >
              <option value="Unable to reach agreement on wage or timing">Unable to reach agreement on wage or timing</option>
              <option value="Worker unavailable at scheduled time">Worker unavailable at scheduled time</option>
              <option value="Found alternative arrangement / no longer required">Found alternative arrangement / no longer required</option>
              <option value="Miscommunication on job requirements">Miscommunication on job requirements</option>
              <option value="Other reason">Other reason</option>
            </select>
          </div>

          <div className="flex gap-3 pt-3">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => setIsRejectOpen(false)}
            >
              Keep Booking
            </Button>
            <Button
              variant="danger"
              size="md"
              fullWidth
              onClick={() => {
                setIsRejectOpen(false);
                if (onRejectBooking) onRejectBooking();
              }}
            >
              Yes, Reject Booking
            </Button>
          </div>
        </div>
      </Modal>

      {/* Work Completion Confirmation Dialog */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Work Completion"
        maxWidth="sm"
      >
        <div className="text-center py-2 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h4 className="text-xl font-bold text-neutral-900 dark:text-white">
            Are you sure the work is completed?
          </h4>

          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            This will mark the booking as finished and open the mutual review screen so you can rate your experience.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => setIsConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              size="md"
              fullWidth
              onClick={() => {
                setIsConfirmOpen(false);
                onCompleteWork();
              }}
            >
              Yes, Complete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

