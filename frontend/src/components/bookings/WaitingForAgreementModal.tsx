import React, { useEffect } from 'react';
import { Clock, ShieldAlert, Phone, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface WaitingForAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  employerName: string;
  employerPhone: string;
  workTitle: string;
  onAgreementArrived: () => void;
  onReject?: () => void;
}

export const WaitingForAgreementModal: React.FC<WaitingForAgreementModalProps> = ({
  isOpen,
  onClose,
  employerName,
  employerPhone,
  workTitle,
  onAgreementArrived,
  onReject,
}) => {
  const { activeAgreement } = useBooking();

  // If employer submits agreement in real-time while modal is open, trigger arrival immediately
  useEffect(() => {
    if (isOpen && activeAgreement && activeAgreement.status === 'awaiting_confirmation') {
      onAgreementArrived();
    }
  }, [isOpen, activeAgreement, onAgreementArrived]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="text-center py-3 space-y-6">
        {/* Animated Waiting Icon */}
        <div className="relative inline-block mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-soft">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        </div>

        {/* Heading & Status */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Negotiation Finalizing</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
            Waiting for agreement details by employer
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            You negotiated with <strong className="text-neutral-900 dark:text-white">{employerName}</strong> ({employerPhone}). Once the employer submits the agreed wage & timings, you will review the agreement popup with Accept & Reject options.
          </p>
        </div>

        {/* Job Details Card */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border text-left space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-500 uppercase tracking-wider">
            <span>Work Request</span>
            <span className="text-[#123B32] dark:text-emerald-400">Step 1 of 2</span>
          </div>
          <h4 className="font-black text-base text-neutral-900 dark:text-white">
            {workTitle}
          </h4>
          <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
            <Phone className="w-3.5 h-3.5 text-neutral-500" />
            <span>Employer: {employerName} • {employerPhone}</span>
          </div>
        </div>

        {/* Informative Step Box */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-left text-xs text-blue-900 dark:text-blue-200 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <span>What happens next?</span>
          </p>
          <p className="text-[11px] text-blue-800 dark:text-blue-300">
            The employer is currently entering the agreed wage amount and work time. When submitted, the official ROZGO Cooperative agreement will pop up immediately on your screen.
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="md"
            fullWidth
            onClick={() => {
              if (onReject) onReject();
              onClose();
            }}
            className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300"
          >
            Cancel Negotiation
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            fullWidth
            onClick={() => {
              onClose();
              onAgreementArrived();
            }}
            className="!bg-[#123B32] hover:!bg-[#0c2721] text-white font-bold"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Review Agreement
          </Button>
        </div>
      </div>
    </Modal>
  );
};
