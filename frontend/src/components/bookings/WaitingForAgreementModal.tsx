import React, { useEffect, useState } from 'react';
import { Clock, ShieldAlert, Phone, ArrowRight, Loader2, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { apiClient } from '../../api/apiClient';
import { API_ENDPOINTS } from '../../api/endpoints';

interface Contract {
  id: string;
  bookingReference: string;
  serviceCategory: string;
  description: string;
  location: string;
  date: string;
  agreedWage: number;
  specialTerms?: string;
  status: string;
  employerName: string;
  employerPhone: string;
}

interface WaitingForAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  employerName: string;
  employerPhone: string;
  workTitle: string;
  onAgreementArrived: (contract?: Contract) => void;
  onReject?: () => void;
  workerId?: string;
}

export const WaitingForAgreementModal: React.FC<WaitingForAgreementModalProps> = ({
  isOpen,
  onClose,
  employerName,
  employerPhone,
  workTitle,
  onAgreementArrived,
  onReject,
  workerId,
}) => {
  const { activeAgreement } = useBooking();
  const { workerUser } = useAuth();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentWorkerId = workerId || workerUser?.id;

  // Fetch worker's pending contracts from backend
  useEffect(() => {
    if (!isOpen || !currentWorkerId) {
      console.log('WaitingForAgreement: skipping - isOpen:', isOpen, 'workerId:', currentWorkerId);
      return;
    }

    const fetchContracts = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = API_ENDPOINTS.CONTRACTS.GET_WORKER_CONTRACTS(currentWorkerId);
        console.log('Fetching contracts from:', endpoint);
        const response = await apiClient.get<{ contracts: Contract[]; count: number }>(endpoint);

        console.log('Contract response:', response);
        if (response && response.contracts && response.contracts.length > 0) {
          console.log(`Found ${response.contracts.length} contracts for worker ${currentWorkerId}`);
          // Find the most recent pending contract
          const pendingContract = response.contracts.find(
            (c) => c.status === 'agreement_pending'
          );
          if (pendingContract) {
            console.log('Found pending contract:', pendingContract);
            setContract(pendingContract);
            onAgreementArrived(pendingContract);
          } else {
            console.log('No pending contracts found, statuses:', response.contracts.map(c => c.status));
          }
        } else {
          console.log('No contracts found for worker:', currentWorkerId);
        }
      } catch (err) {
        console.error('Error fetching contracts:', err);
        setError('Failed to fetch contract details');
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately and then poll every 2 seconds
    fetchContracts();
    const interval = setInterval(fetchContracts, 2000);

    return () => clearInterval(interval);
  }, [isOpen, currentWorkerId, onAgreementArrived]);

  // If employer submits agreement in real-time while modal is open, trigger arrival immediately
  useEffect(() => {
    if (isOpen && activeAgreement && activeAgreement.status === 'awaiting_confirmation') {
      onAgreementArrived();
    }
  }, [isOpen, activeAgreement, onAgreementArrived]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="text-center py-3 space-y-6">
        {/* Contract Received - Success State */}
        {contract && (
          <>
            {/* Success Icon */}
            <div className="relative inline-block mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-300 dark:border-emerald-700/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-soft">
                <Check className="w-10 h-10" />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
                <Check className="w-3.5 h-3.5" />
                <span>Contract Received</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                Agreement submitted by employer
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                <strong className="text-neutral-900 dark:text-white">{contract.employerName}</strong> has submitted the contract with exact wage quotation.
              </p>
            </div>

            {/* Contract Details Card - Real Data from Employer */}
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-900/50 text-left space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                    Service
                  </div>
                  <h4 className="font-black text-base text-neutral-900 dark:text-white mt-1">
                    {contract.serviceCategory}
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    {contract.description}
                  </p>
                </div>
              </div>

              {/* Wage Quotation - EXACT AMOUNT FROM EMPLOYER */}
              <div className="pt-4 border-t border-emerald-200 dark:border-emerald-900/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Exact Wage Quoted by Employer
                    </div>
                    <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                      ₹{contract.agreedWage.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Date
                    </div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-white mt-1">
                      {contract.date}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="text-left text-xs">
                <div className="text-neutral-500 font-bold uppercase tracking-wider">Location</div>
                <div className="text-neutral-900 dark:text-white font-bold mt-1">{contract.location}</div>
              </div>

              {/* Special Terms if any */}
              {contract.specialTerms && (
                <div className="text-left text-xs pt-3 border-t border-emerald-200 dark:border-emerald-900/50">
                  <div className="text-neutral-500 font-bold uppercase tracking-wider">Special Terms</div>
                  <div className="text-neutral-900 dark:text-white font-medium mt-1">
                    {contract.specialTerms}
                  </div>
                </div>
              )}
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
                Reject Contract
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                fullWidth
                onClick={() => {
                  onClose();
                  onAgreementArrived(contract);
                }}
                className="!bg-[#123B32] hover:!bg-[#0c2721] text-white font-bold"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Review & Confirm
              </Button>
            </div>
          </>
        )}

        {/* Loading State - Waiting for Contract */}
        {!contract && !error && (
          <>
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
                <span>Waiting for Contract</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                Waiting for wage quotation from employer
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                You negotiated with <strong className="text-neutral-900 dark:text-white">{employerName}</strong> ({employerPhone}). Once the employer submits the contract with the exact wage quotation, it will appear here automatically.
              </p>
            </div>

            {/* Job Details Card */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border text-left space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-500 uppercase tracking-wider">
                <span>Work Request</span>
                <span className="text-[#123B32] dark:text-emerald-400">Fetching Contract...</span>
              </div>
              <h4 className="font-black text-base text-neutral-900 dark:text-white">
                {workTitle}
              </h4>
              <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                <Phone className="w-3.5 h-3.5 text-neutral-500" />
                <span>Employer: {employerName} • {employerPhone}</span>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-left text-xs text-blue-900 dark:text-blue-200 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>What you will see next?</span>
              </p>
              <p className="text-[11px] text-blue-800 dark:text-blue-300">
                The employer is entering the exact wage quotation and work details. Once submitted, you will see the full contract with the exact wage amount here automatically.
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
                disabled={loading}
                onClick={() => {
                  // Manual refresh
                  setLoading(true);
                }}
                className="!bg-[#123B32] hover:!bg-[#0c2721] text-white font-bold disabled:opacity-50"
                leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </>
        )}

        {/* Error State */}
        {error && !contract && (
          <>
            <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-700/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-soft mx-auto">
              <AlertCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                Unable to fetch contract
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                {error}. Please try refreshing or contact the employer.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
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
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                fullWidth
                onClick={() => {
                  setError(null);
                  setContract(null);
                }}
                className="!bg-[#123B32] hover:!bg-[#0c2721] text-white font-bold"
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Try Again
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
