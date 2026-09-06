import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Shield,
  CreditCard,
  FileText,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  RefreshCw,
  Clock,
  Eye,
  Lock,
  Sparkles,
  HelpCircle,
  Check,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LabourBadge } from '../../components/workers/LabourBadge';
import {
  aadhaarVerificationService,
  eShramVerificationService,
  documentVerificationService,
} from '../../services/verificationService';
import { WorkerVerificationMethod } from '../../types';

// Default mock document images if user uses mock/sample
const SAMPLE_DOCS = {
  aadhaarFront: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
  aadhaarBack: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
  eshramFront: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
  otherIdFront: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
  selfie: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
};

export const WorkerVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { workerUser, submitWorkerVerification } = useAuth();
  const { t } = useLanguage();

  // If already submitted or verified, default step to 4 (status view)
  const isAlreadySubmitted =
    workerUser.verificationStatus === 'pending' ||
    workerUser.verificationStatus === 'in_progress' ||
    workerUser.verificationStatus === 'in_review';
  const isAlreadyVerified = workerUser.isVerified || workerUser.verificationStatus === 'verified';

  const [step, setStep] = useState<number>(isAlreadySubmitted || isAlreadyVerified ? 4 : 1);
  const [selectedMethod, setSelectedMethod] = useState<WorkerVerificationMethod>('aadhaar');

  // Form states
  // Method 1: Aadhaar
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarFront, setAadhaarFront] = useState<string>('');
  const [aadhaarBack, setAadhaarBack] = useState<string>('');
  const [workerSelfie, setWorkerSelfie] = useState<string>('');

  // Method 2: e-Shram
  const [hasEShram, setHasEShram] = useState<'yes' | 'no' | null>('yes');
  const [eshramUan, setEshramUan] = useState('');
  const [eshramFront, setEshramFront] = useState<string>('');

  // Method 3: Other ID
  const [otherIdType, setOtherIdType] = useState<'Voter ID Card' | 'Driving Licence' | 'PAN Card'>('Voter ID Card');
  const [otherIdNumber, setOtherIdNumber] = useState('');
  const [otherIdFront, setOtherIdFront] = useState<string>('');
  const [otherIdBack, setOtherIdBack] = useState<string>('');

  // Step 3 declaration checkbox
  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Camera modal state
  const [cameraActiveFor, setCameraActiveFor] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // File input refs for uploading
  const aadhaarFrontInputRef = useRef<HTMLInputElement>(null);
  const aadhaarBackInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const eshramFrontInputRef = useRef<HTMLInputElement>(null);
  const otherFrontInputRef = useRef<HTMLInputElement>(null);
  const otherBackInputRef = useRef<HTMLInputElement>(null);

  // Stop camera helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActiveFor(null);
    setCameraError('');
  };

  // Start camera helper
  const startCamera = async (targetField: string, facing: 'user' | 'environment' = 'environment') => {
    setCameraActiveFor(targetField);
    setCameraFacing(facing);
    setCameraError('');

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera error or access denied:', err);
      setCameraError('Camera access not available. You can upload a photo from your device.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      if (cameraActiveFor === 'aadhaarFront') setAadhaarFront(dataUrl);
      else if (cameraActiveFor === 'aadhaarBack') setAadhaarBack(dataUrl);
      else if (cameraActiveFor === 'workerSelfie') setWorkerSelfie(dataUrl);
      else if (cameraActiveFor === 'eshramFront') setEshramFront(dataUrl);
      else if (cameraActiveFor === 'otherIdFront') setOtherIdFront(dataUrl);
      else if (cameraActiveFor === 'otherIdBack') setOtherIdBack(dataUrl);
    }
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldSetter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        fieldSetter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step navigation validations
  const canProceedStep2 = () => {
    if (selectedMethod === 'aadhaar') {
      const val = aadhaarVerificationService.validateAadhaarNumber(aadhaarNumber);
      if (!val.isValid) return false;
      return Boolean(aadhaarFront || SAMPLE_DOCS.aadhaarFront);
    }
    if (selectedMethod === 'eshram') {
      if (hasEShram === 'no') return false;
      const val = eShramVerificationService.validateUAN(eshramUan);
      return val.isValid;
    }
    if (selectedMethod === 'other_id') {
      return Boolean(otherIdNumber.trim() && (otherIdFront || SAMPLE_DOCS.otherIdFront));
    }
    return false;
  };

  const handleStep2Next = () => {
    setSubmitError('');
    if (!canProceedStep2()) {
      if (selectedMethod === 'aadhaar') {
        const val = aadhaarVerificationService.validateAadhaarNumber(aadhaarNumber);
        if (!val.isValid) {
          setSubmitError(val.error || 'Please enter a valid Aadhaar number.');
          return;
        }
        if (!aadhaarFront) {
          setAadhaarFront(SAMPLE_DOCS.aadhaarFront);
          setAadhaarBack(SAMPLE_DOCS.aadhaarBack);
          setWorkerSelfie(SAMPLE_DOCS.selfie);
        }
      } else if (selectedMethod === 'eshram') {
        const val = eShramVerificationService.validateUAN(eshramUan);
        if (!val.isValid) {
          setSubmitError(val.error || 'Please enter 12-digit e-Shram UAN.');
          return;
        }
      } else if (selectedMethod === 'other_id') {
        if (!otherIdNumber.trim()) {
          setSubmitError('Please enter your document ID number.');
          return;
        }
        if (!otherIdFront) {
          setOtherIdFront(SAMPLE_DOCS.otherIdFront);
          setWorkerSelfie(SAMPLE_DOCS.selfie);
        }
      }
    }
    setStep(3);
  };

  // Submit Application
  const handleSubmitVerification = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      let maskedIdentifier = 'XXXX XXXX 4821';
      let idType = 'Aadhaar Card';
      let frontUrl: string = aadhaarFront || SAMPLE_DOCS.aadhaarFront;
      let backUrl: string | undefined = aadhaarBack || SAMPLE_DOCS.aadhaarBack;
      let selfieUrl: string = workerSelfie || SAMPLE_DOCS.selfie;

      if (selectedMethod === 'aadhaar') {
        maskedIdentifier = aadhaarVerificationService.maskAadhaar(aadhaarNumber || '4821');
        idType = 'Aadhaar Card';
        frontUrl = aadhaarFront || SAMPLE_DOCS.aadhaarFront;
        backUrl = aadhaarBack || SAMPLE_DOCS.aadhaarBack;
        selfieUrl = workerSelfie || SAMPLE_DOCS.selfie;
      } else if (selectedMethod === 'eshram') {
        maskedIdentifier = `UAN: ${eShramVerificationService.formatUAN(eshramUan || '100928374192')}`;
        idType = 'e-Shram UAN Card';
        frontUrl = eshramFront || SAMPLE_DOCS.eshramFront;
        backUrl = undefined;
        selfieUrl = workerSelfie || SAMPLE_DOCS.selfie;
      } else {
        maskedIdentifier = documentVerificationService.maskIdNumber(otherIdType, otherIdNumber || '8910');
        idType = otherIdType;
        frontUrl = otherIdFront || SAMPLE_DOCS.otherIdFront;
        backUrl = otherIdBack || undefined;
        selfieUrl = workerSelfie || SAMPLE_DOCS.selfie;
      }

      submitWorkerVerification({
        method: selectedMethod,
        idType,
        maskedIdentifier,
        frontPhoto: frontUrl,
        backPhoto: backUrl,
        selfiePhoto: selfieUrl,
      });

      setStep(4);
    } catch (err) {
      setSubmitError('Verification submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 text-left">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rozgo-100 dark:bg-rozgo-900/40 text-rozgo-900 dark:text-rozgo-200 flex items-center justify-center shadow-soft">
            <ShieldCheck className="w-6 h-6 text-rozgo-800 dark:text-rozgo-300" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              Worker Identity Verification
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              Build trust with employers & unlock official ROZGO Labour ID
            </p>
          </div>
        </div>

        <Link
          to="/worker/dashboard"
          className="text-xs font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>

      {/* Wizard Step Indicator (1. Choose -> 2. Verify -> 3. Complete) */}
      {step < 4 && (
        <div className="bg-white dark:bg-darkbg-card p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-darkbg-border shadow-soft">
          <div className="flex items-center justify-between relative">
            {/* Step 1 */}
            <div className="flex items-center gap-2 sm:gap-3 z-10">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-black transition-colors ${
                  step === 1
                    ? 'bg-[#123B32] text-white shadow-md'
                    : step > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                }`}
              >
                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <div className="hidden sm:block">
                <p className="text-[11px] font-extrabold uppercase text-neutral-400">Step 1</p>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">Choose ID</p>
              </div>
            </div>

            <div className="flex-1 h-0.5 bg-neutral-200 dark:bg-darkbg-border mx-2 sm:mx-4" />

            {/* Step 2 */}
            <div className="flex items-center gap-2 sm:gap-3 z-10">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-black transition-colors ${
                  step === 2
                    ? 'bg-[#123B32] text-white shadow-md'
                    : step > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                }`}
              >
                {step > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div className="hidden sm:block">
                <p className="text-[11px] font-extrabold uppercase text-neutral-400">Step 2</p>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">Capture Details</p>
              </div>
            </div>

            <div className="flex-1 h-0.5 bg-neutral-200 dark:bg-darkbg-border mx-2 sm:mx-4" />

            {/* Step 3 */}
            <div className="flex items-center gap-2 sm:gap-3 z-10">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-black transition-colors ${
                  step === 3
                    ? 'bg-[#123B32] text-white shadow-md'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                }`}
              >
                3
              </div>
              <div className="hidden sm:block">
                <p className="text-[11px] font-extrabold uppercase text-neutral-400">Step 3</p>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">Review & Submit</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: CHOOSE VERIFICATION METHOD */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">
              Choose your verification document
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              Select any one valid government identification card to verify your identity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* 1. Aadhaar Card */}
            <button
              type="button"
              onClick={() => setSelectedMethod('aadhaar')}
              className={`p-5 rounded-2xl border-2 text-left transition-all flex items-start justify-between gap-4 ${
                selectedMethod === 'aadhaar'
                  ? 'border-[#123B32] bg-rozgo-50/70 dark:bg-rozgo-950/30 ring-2 ring-[#123B32]/20'
                  : 'border-neutral-200 dark:border-darkbg-border bg-white dark:bg-darkbg-card hover:border-neutral-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-neutral-900 dark:text-white">
                      Aadhaar Card
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      Fastest / Recommended
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Enter Aadhaar number and take photos of front & back sides. Instant masking applied.
                  </p>
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedMethod === 'aadhaar'
                    ? 'border-[#123B32] bg-[#123B32] text-white'
                    : 'border-neutral-300 dark:border-neutral-700'
                }`}
              >
                {selectedMethod === 'aadhaar' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>

            {/* 2. e-Shram Card */}
            <button
              type="button"
              onClick={() => setSelectedMethod('eshram')}
              className={`p-5 rounded-2xl border-2 text-left transition-all flex items-start justify-between gap-4 ${
                selectedMethod === 'eshram'
                  ? 'border-[#123B32] bg-rozgo-50/70 dark:bg-rozgo-950/30 ring-2 ring-[#123B32]/20'
                  : 'border-neutral-200 dark:border-darkbg-border bg-white dark:bg-darkbg-card hover:border-neutral-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-neutral-900 dark:text-white">
                      e-Shram Card (UAN)
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      National Labour Registry
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    For unorganised workers. Links your 12-digit Universal Account Number (UAN).
                  </p>
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedMethod === 'eshram'
                    ? 'border-[#123B32] bg-[#123B32] text-white'
                    : 'border-neutral-300 dark:border-neutral-700'
                }`}
              >
                {selectedMethod === 'eshram' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>

            {/* 3. Other Government ID */}
            <button
              type="button"
              onClick={() => setSelectedMethod('other_id')}
              className={`p-5 rounded-2xl border-2 text-left transition-all flex items-start justify-between gap-4 ${
                selectedMethod === 'other_id'
                  ? 'border-[#123B32] bg-rozgo-50/70 dark:bg-rozgo-950/30 ring-2 ring-[#123B32]/20'
                  : 'border-neutral-200 dark:border-darkbg-border bg-white dark:bg-darkbg-card hover:border-neutral-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-neutral-900 dark:text-white">
                    Other Government ID
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Verify using Voter ID (EPIC), Driving Licence, or PAN Card.
                  </p>
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedMethod === 'other_id'
                    ? 'border-[#123B32] bg-[#123B32] text-white'
                    : 'border-neutral-300 dark:border-neutral-700'
                }`}
              >
                {selectedMethod === 'other_id' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          </div>

          {/* Privacy & Security Reassurance Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-rozgo-50/60 dark:bg-rozgo-950/20 border border-rozgo-200 dark:border-rozgo-900/40 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-rozgo-200/80 dark:bg-rozgo-800/40 flex items-center justify-center text-rozgo-900 dark:text-rozgo-200 flex-shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
              <p className="font-bold text-neutral-900 dark:text-white">
                ROZGO Values Your Privacy & Security
              </p>
              <p>
                Your identity documents are encrypted and strictly private. They will <strong>NEVER</strong> be visible or shared with employers or anyone else. Employers will only see an official <strong>Verified Worker ✓</strong> badge and your ROZGO Labour ID.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex justify-end">
            <Button
              variant="primary"
              size="xl"
              className="!bg-[#123B32] hover:!bg-[#0D2B24] text-white font-black shadow-md w-full sm:w-auto"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={() => setStep(2)}
            >
              Continue to Step 2
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: VERIFICATION DETAILS & DOCUMENT CAPTURE */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Photo Capture Guidance Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Photo Capture Guidance</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-neutral-700 dark:text-neutral-300 font-medium pt-1">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Keep card flat on table</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>All 4 corners visible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Good light, no flash glare</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Text clearly readable</span>
              </div>
            </div>
          </div>

          {/* METHOD 1 FORM: AADHAAR */}
          {selectedMethod === 'aadhaar' && (
            <div className="space-y-6 bg-white dark:bg-darkbg-card p-5 sm:p-6 rounded-3xl border border-neutral-200 dark:border-darkbg-border shadow-soft">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  12-Digit Aadhaar Number (or Last 4 Digits)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={14}
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    placeholder="e.g. 1234 5678 4821 or 4821"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-rozgo-900 dark:text-rozgo-300 font-bold font-mono text-sm tracking-widest focus:ring-2 focus:ring-[#123B32] outline-none"
                  />
                  <div className="absolute right-3 top-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Masked: <strong className="font-mono text-rozgo-900 dark:text-rozgo-300">{aadhaarVerificationService.maskAadhaar(aadhaarNumber || '4821')}</strong></span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Privacy notice: Full Aadhaar numbers are never stored in plain text or visible to employers.
                </p>
              </div>

              {/* Upload / Camera: Front & Back */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Aadhaar Front */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-darkbg-border text-center space-y-3 bg-neutral-50/50 dark:bg-darkbg-surface/50">
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Front of Aadhaar Card *
                  </p>
                  {aadhaarFront ? (
                    <div className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-darkbg-border">
                      <img src={aadhaarFront} alt="Aadhaar Front" className="w-full h-36 object-cover" />
                      <button
                        type="button"
                        onClick={() => setAadhaarFront('')}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                        Photo Added ✓
                      </span>
                    </div>
                  ) : (
                    <div className="py-6 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-rozgo-100 dark:bg-rozgo-900/40 text-rozgo-900 dark:text-rozgo-200 flex items-center justify-center mx-auto">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => startCamera('aadhaarFront', 'environment')}
                          className="px-3 py-1.5 rounded-xl bg-[#123B32] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Take Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => aadhaarFrontInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-darkbg-card border border-neutral-300 dark:border-darkbg-border text-neutral-700 dark:text-neutral-300 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload</span>
                        </button>
                        <input
                          ref={aadhaarFrontInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setAadhaarFront)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setAadhaarFront(SAMPLE_DOCS.aadhaarFront)}
                        className="text-[10px] text-rozgo-700 dark:text-rozgo-300 underline font-medium"
                      >
                        Use sample front photo
                      </button>
                    </div>
                  )}
                </div>

                {/* Aadhaar Back */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-darkbg-border text-center space-y-3 bg-neutral-50/50 dark:bg-darkbg-surface/50">
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Back of Aadhaar Card *
                  </p>
                  {aadhaarBack ? (
                    <div className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-darkbg-border">
                      <img src={aadhaarBack} alt="Aadhaar Back" className="w-full h-36 object-cover" />
                      <button
                        type="button"
                        onClick={() => setAadhaarBack('')}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                        Photo Added ✓
                      </span>
                    </div>
                  ) : (
                    <div className="py-6 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-rozgo-100 dark:bg-rozgo-900/40 text-rozgo-900 dark:text-rozgo-200 flex items-center justify-center mx-auto">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => startCamera('aadhaarBack', 'environment')}
                          className="px-3 py-1.5 rounded-xl bg-[#123B32] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Take Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => aadhaarBackInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-darkbg-card border border-neutral-300 dark:border-darkbg-border text-neutral-700 dark:text-neutral-300 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload</span>
                        </button>
                        <input
                          ref={aadhaarBackInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setAadhaarBack)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setAadhaarBack(SAMPLE_DOCS.aadhaarBack)}
                        className="text-[10px] text-rozgo-700 dark:text-rozgo-300 underline font-medium"
                      >
                        Use sample back photo
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Worker Live Selfie Match */}
              <div className="pt-2 border-t border-neutral-100 dark:border-darkbg-border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200">
                      Live Selfie Match (Optional but speeds up verification)
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Quick face photo matching the portrait on your Aadhaar card
                    </p>
                  </div>
                </div>

                {workerSelfie ? (
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border">
                    <img src={workerSelfie} alt="Worker Selfie" className="w-14 h-14 rounded-xl object-cover border" />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Selfie photo attached
                      </span>
                      <p className="text-[11px] text-neutral-500">Face clearly visible</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWorkerSelfie('')}
                      className="text-xs text-rose-600 font-bold hover:underline"
                    >
                      Retake
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => startCamera('workerSelfie', 'user')}
                      className="px-4 py-2 rounded-xl bg-rozgo-100 dark:bg-rozgo-900/40 text-rozgo-900 dark:text-rozgo-200 text-xs font-bold flex items-center gap-2 hover:bg-rozgo-200 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Selfie</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => selfieInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-darkbg-border text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Selfie</span>
                    </button>
                    <input
                      ref={selfieInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setWorkerSelfie)}
                    />
                    <button
                      type="button"
                      onClick={() => setWorkerSelfie(SAMPLE_DOCS.selfie)}
                      className="text-[11px] text-neutral-500 underline"
                    >
                      Use sample
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* METHOD 2 FORM: E-SHRAM */}
          {selectedMethod === 'eshram' && (
            <div className="space-y-6 bg-white dark:bg-darkbg-card p-5 sm:p-6 rounded-3xl border border-neutral-200 dark:border-darkbg-border shadow-soft">
              {/* Question: Do you have e-Shram? */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  Do you already have an e-Shram card?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setHasEShram('yes')}
                    className={`p-3.5 rounded-2xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      hasEShram === 'yes'
                        ? 'border-[#123B32] bg-rozgo-50 dark:bg-rozgo-950/30 text-[#123B32] dark:text-rozgo-200'
                        : 'border-neutral-200 dark:border-darkbg-border text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Yes, I have e-Shram</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasEShram('no')}
                    className={`p-3.5 rounded-2xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      hasEShram === 'no'
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                        : 'border-neutral-200 dark:border-darkbg-border text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <span>No, not yet</span>
                  </button>
                </div>
              </div>

              {hasEShram === 'yes' && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                      12-Digit Universal Account Number (UAN) *
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      value={eshramUan}
                      onChange={(e) => setEshramUan(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 1009 2837 4192"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-neutral-900 dark:text-white font-mono text-sm tracking-widest focus:ring-2 focus:ring-[#123B32] outline-none"
                    />
                    {eshramUan && (
                      <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
                        Formatted UAN: {eShramVerificationService.formatUAN(eshramUan)}
                      </p>
                    )}
                  </div>

                  {/* Optional Front Card Upload */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-darkbg-border text-center space-y-3">
                    <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      e-Shram Card Photo (Optional)
                    </p>
                    {eshramFront ? (
                      <div className="relative rounded-xl overflow-hidden border">
                        <img src={eshramFront} alt="e-Shram Front" className="w-full h-36 object-cover" />
                        <button
                          type="button"
                          onClick={() => setEshramFront('')}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => eshramFrontInputRef.current?.click()}
                          className="px-3.5 py-1.5 rounded-xl border border-neutral-300 dark:border-darkbg-border text-xs font-bold flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Card Photo</span>
                        </button>
                        <input
                          ref={eshramFrontInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setEshramFront)}
                        />
                        <button
                          type="button"
                          onClick={() => setEshramFront(SAMPLE_DOCS.eshramFront)}
                          className="text-[10px] text-rozgo-700 underline"
                        >
                          Use sample
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {hasEShram === 'no' && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-950 dark:text-amber-200 space-y-1">
                      <p className="font-bold">No problem! You can verify with Aadhaar instead.</p>
                      <p>
                        Aadhaar verification is quick and unlocks full worker features immediately. You can register for e-Shram later on the government portal (eshram.gov.in).
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-700 text-amber-900 dark:text-amber-200 font-bold"
                    onClick={() => setSelectedMethod('aadhaar')}
                  >
                    Switch to Aadhaar Verification →
                  </Button>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <span className="font-bold text-neutral-900 dark:text-white">e-Shram Disclaimer: </span>
                e-Shram is a Government of India initiative for unorganised workers. Verifying your e-Shram card links your profile to central labour registries and welfare benefits.
              </div>
            </div>
          )}

          {/* METHOD 3 FORM: OTHER ID */}
          {selectedMethod === 'other_id' && (
            <div className="space-y-6 bg-white dark:bg-darkbg-card p-5 sm:p-6 rounded-3xl border border-neutral-200 dark:border-darkbg-border shadow-soft">
              {/* Select Other ID Type */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  Select Document Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Voter ID Card', 'Driving Licence', 'PAN Card'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOtherIdType(type)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        otherIdType === type
                          ? 'border-[#123B32] bg-rozgo-50 dark:bg-rozgo-950/30 text-[#123B32] dark:text-rozgo-200 shadow-xs'
                          : 'border-neutral-200 dark:border-darkbg-border text-neutral-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* ID Number */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  {otherIdType} Number *
                </label>
                <input
                  type="text"
                  value={otherIdNumber}
                  onChange={(e) => setOtherIdNumber(e.target.value)}
                  placeholder={`Enter your ${otherIdType} number`}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-darkbg-border bg-neutral-50 dark:bg-darkbg-surface text-neutral-900 dark:text-white font-mono text-sm uppercase tracking-wider focus:ring-2 focus:ring-[#123B32] outline-none"
                />
              </div>

              {/* Photos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Front */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-darkbg-border text-center space-y-3">
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Front Photo of {otherIdType} *
                  </p>
                  {otherIdFront ? (
                    <div className="relative rounded-xl overflow-hidden border">
                      <img src={otherIdFront} alt="ID Front" className="w-full h-36 object-cover" />
                      <button
                        type="button"
                        onClick={() => setOtherIdFront('')}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-4 space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => startCamera('otherIdFront', 'environment')}
                          className="px-3 py-1.5 rounded-xl bg-[#123B32] text-white text-xs font-bold flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Take Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => otherFrontInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-darkbg-border text-xs font-bold flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload</span>
                        </button>
                        <input
                          ref={otherFrontInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setOtherIdFront)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtherIdFront(SAMPLE_DOCS.otherIdFront)}
                        className="text-[10px] text-rozgo-700 underline"
                      >
                        Use sample
                      </button>
                    </div>
                  )}
                </div>

                {/* Back */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-darkbg-border text-center space-y-3">
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Back Photo (Optional)
                  </p>
                  {otherIdBack ? (
                    <div className="relative rounded-xl overflow-hidden border">
                      <img src={otherIdBack} alt="ID Back" className="w-full h-36 object-cover" />
                      <button
                        type="button"
                        onClick={() => setOtherIdBack('')}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-4 space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => startCamera('otherIdBack', 'environment')}
                          className="px-3 py-1.5 rounded-xl bg-[#123B32] text-white text-xs font-bold flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Take Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => otherBackInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-darkbg-border text-xs font-bold flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload</span>
                        </button>
                        <input
                          ref={otherBackInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setOtherIdBack)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error notice if any */}
          {submitError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-between">
            <Button
              variant="outline"
              size="lg"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => setStep(1)}
            >
              Back to ID Selection
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="!bg-[#123B32] hover:!bg-[#0D2B24] text-white font-black shadow-md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={handleStep2Next}
            >
              Review Details
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: REVIEW & SUBMIT */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">
              Review Verification Application
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              Confirm your submitted information before final administrative review.
            </p>
          </div>

          {/* Summary Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-darkbg-border">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                  Worker Name
                </p>
                <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                  {workerUser.name}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                  Mobile Number
                </p>
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  {workerUser.phone}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-neutral-400 font-medium">Verification Method:</span>
                <p className="font-bold text-neutral-900 dark:text-white uppercase mt-0.5">
                  {selectedMethod === 'aadhaar'
                    ? 'Aadhaar Card'
                    : selectedMethod === 'eshram'
                    ? 'e-Shram UAN'
                    : otherIdType}
                </p>
              </div>
              <div>
                <span className="text-neutral-400 font-medium">Masked Identifier:</span>
                <p className="font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {selectedMethod === 'aadhaar'
                    ? aadhaarVerificationService.maskAadhaar(aadhaarNumber || '4821')
                    : selectedMethod === 'eshram'
                    ? `UAN: ${eShramVerificationService.formatUAN(eshramUan || '100928374192')}`
                    : documentVerificationService.maskIdNumber(otherIdType, otherIdNumber || '8910')}
                </p>
              </div>
            </div>

            {/* Document Checklist */}
            <div className="pt-2">
              <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                Attached Verification Items:
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Front Photo</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Back Photo</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Selfie Match</span>
                </div>
              </div>
            </div>

            {/* Declaration Checkbox */}
            <div className="pt-4 border-t border-neutral-100 dark:border-darkbg-border">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={declarationAgreed}
                  onChange={(e) => setDeclarationAgreed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-[#123B32] rounded focus:ring-[#123B32]"
                />
                <span className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                  I solemnly declare that the identity documents and information submitted are authentic, belong to me, and may be verified against government records for worker verification on ROZGO.
                </span>
              </label>
            </div>
          </div>

          {submitError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between">
            <Button
              variant="outline"
              size="lg"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => setStep(2)}
              disabled={isSubmitting}
            >
              Edit Details
            </Button>
            <Button
              variant="primary"
              size="xl"
              className="!bg-[#123B32] hover:!bg-[#0D2B24] text-white font-black shadow-md w-full sm:w-auto"
              disabled={!declarationAgreed || isSubmitting}
              isLoading={isSubmitting}
              rightIcon={<CheckCircle2 className="w-5 h-5" />}
              onClick={handleSubmitVerification}
            >
              Submit for Verification
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: SUBMISSION CONFIRMATION & LIVE STATUS TRACKER */}
      {/* ========================================================================= */}
      {step === 4 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Status Box */}
          {isAlreadyVerified ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-400 text-center space-y-4 shadow-soft">
              <div className="w-16 h-16 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 flex items-center justify-center mx-auto shadow-soft">
                <CheckCircle2 className="w-10 h-10 text-emerald-700 dark:text-emerald-300" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-300">
                  Profile Verified ✓
                </span>
                <h2 className="text-2xl font-black text-neutral-900 dark:text-white">
                  Congratulations, {workerUser.name}!
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                  Your identity has been successfully authenticated by ROZGO trust cooperative.
                </p>
              </div>

              {workerUser.labourNumber && (
                <div className="py-2">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Official ROZGO Labour Number
                  </p>
                  <LabourBadge labourNumber={workerUser.labourNumber} size="lg" />
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="!bg-[#123B32] text-white font-bold"
                  onClick={() => navigate('/worker/dashboard')}
                >
                  Go to Worker Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/worker/profile')}
                >
                  View Profile & Trust Badge
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/80 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-700/60 text-center space-y-5 shadow-soft">
              <div className="w-16 h-16 rounded-full bg-amber-200 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 flex items-center justify-center mx-auto shadow-soft">
                <Clock className="w-9 h-9 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-black text-xs uppercase tracking-wider border border-amber-300 dark:border-amber-700">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Verification in Progress</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                  Verification Application Submitted
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
                  Your identity documents are being verified by our administrative trust team. This usually takes <strong>2 to 4 hours</strong>.
                </p>
              </div>

              {/* Steps timeline card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-darkbg-card border border-amber-200 dark:border-neutral-800 text-left max-w-md mx-auto space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 dark:text-white">Documents Received</p>
                    <p className="text-[11px] text-neutral-500">Encrypted and queued for review</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold animate-pulse">
                    2
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 dark:text-white">Officer Review</p>
                    <p className="text-[11px] text-neutral-500">Legibility, ID match & face verification</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-60">
                  <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 dark:text-white">Issue ROZGO Labour ID</p>
                    <p className="text-[11px] text-neutral-500">Official RZG-XXXXXX badge unlocked</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="!bg-[#123B32] hover:!bg-[#0D2B24] text-white font-bold"
                  onClick={() => navigate('/worker/dashboard')}
                >
                  Go to Worker Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/worker/profile')}
                  className="text-xs font-bold"
                >
                  View Profile & Trust Badge
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIVE CAMERA CAPTURE MODAL */}
      {/* ========================================================================= */}
      {cameraActiveFor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 text-white rounded-3xl overflow-hidden max-w-md w-full p-4 space-y-4 shadow-2xl border border-neutral-700 animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">
                  {cameraFacing === 'user' ? 'Take Live Selfie' : 'Capture Document Photo'}
                </h3>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1.5 rounded-full bg-neutral-800 text-neutral-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {cameraError ? (
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 space-y-2 text-center">
                <p>{cameraError}</p>
                <Button variant="outline" size="sm" onClick={stopCamera} className="text-white border-rose-700">
                  Close & Upload from Device
                </Button>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* ID Frame overlay guideline */}
                {cameraFacing === 'environment' && (
                  <div className="absolute inset-4 border-2 border-white/60 border-dashed rounded-xl pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded text-white font-mono">
                      Align document inside border
                    </span>
                  </div>
                )}
              </div>
            )}

            {!cameraError && (
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() =>
                    startCamera(cameraActiveFor, cameraFacing === 'user' ? 'environment' : 'user')
                  }
                  className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Flip Camera</span>
                </button>

                <button
                  type="button"
                  onClick={capturePhoto}
                  className="w-14 h-14 rounded-full bg-white text-[#123B32] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform font-bold"
                >
                  <Camera className="w-7 h-7" />
                </button>

                <button
                  type="button"
                  onClick={stopCamera}
                  className="text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};