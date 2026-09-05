import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, Volume2, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCallAgreed: () => void;
  onCallRejected?: () => void;
  calleeName: string;
  calleePhone: string;
  calleeAvatar?: string;
  roleType: 'worker' | 'employer';
  serviceTitle: string;
}

export const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  onCallAgreed,
  onCallRejected,
  calleeName,
  calleePhone,
  calleeAvatar,
  roleType,
  serviceTitle,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isOpen) {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="text-center py-2">
        {/* Caller Avatar with pulsing ring */}
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-rozgo-900 mx-auto shadow-lg relative z-10">
            {calleeAvatar ? (
              <img src={calleeAvatar} alt={calleeName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-rozgo-900 text-white flex items-center justify-center text-3xl font-bold">
                {calleeName.charAt(0)}
              </div>
            )}
          </div>
          <span className="absolute -inset-2 rounded-full border-2 border-rozgo-400/50 animate-ping" />
        </div>

        {/* Name and Phone */}
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {calleeName}
        </h3>
        <p className="text-rozgo-900 dark:text-rozgo-300 font-semibold text-lg mt-0.5">
          {calleePhone}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {serviceTitle} • {roleType === 'worker' ? 'Employer' : 'Worker'}
        </p>

        {/* Live Call Duration */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-mono text-sm font-bold mt-4 border border-emerald-200 dark:border-emerald-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Call in Progress: {formatTime(callDuration)}</span>
        </div>

        {/* Direct Negotiation Reminder Box */}
        <div className="mt-5 p-4 rounded-2xl bg-rozgo-50 dark:bg-darkbg-surface text-left border border-rozgo-200 dark:border-darkbg-border">
          <div className="flex items-center gap-2 text-rozgo-900 dark:text-rozgo-200 font-bold text-sm mb-1.5">
            <ShieldCheck className="w-4 h-4 text-rozgo-700 dark:text-rozgo-400" />
            <span>Direct Wage Negotiation</span>
          </div>
          <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
            ROZGO does NOT set wages or take commission cuts. Agree directly on:
          </p>
          <ul className="text-xs text-neutral-700 dark:text-neutral-300 list-disc list-inside mt-1.5 space-y-0.5 font-medium">
            <li>Agreed Total Wage (₹)</li>
            <li>Exact arrival time / date</li>
            <li>Number of workers required</li>
            <li>Material or parts requirements</li>
          </ul>
        </div>

        {/* Simulated in-call controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-full border ${
              isMuted
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-neutral-100 text-neutral-700 dark:bg-darkbg-surface dark:text-neutral-200 border-neutral-200 dark:border-darkbg-border'
            }`}
            title="Mute/Unmute"
          >
            <Mic className="w-5 h-5" />
          </button>
          <div className="p-3 rounded-full bg-neutral-100 dark:bg-darkbg-surface text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-darkbg-border">
            <Volume2 className="w-5 h-5" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            leftIcon={<CheckCircle2 className="w-5 h-5 text-rozgo-300" />}
            onClick={() => {
              onClose();
              onCallAgreed();
            }}
          >
            {roleType === 'worker'
              ? 'Call Finished • Agree & Await Details'
              : 'Agree on Call • Confirm Booking'}
          </Button>

          {onCallRejected && (
            <Button
              variant="outline"
              size="md"
              leftIcon={<XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
              onClick={() => {
                onClose();
                onCallRejected();
              }}
              className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 font-bold"
            >
              Reject Booking on Call
            </Button>
          )}

          <Button
            variant="danger"
            size="md"
            leftIcon={<PhoneOff className="w-4 h-4" />}
            onClick={onClose}
          >
            End Call
          </Button>
        </div>
      </div>
    </Modal>
  );
};

