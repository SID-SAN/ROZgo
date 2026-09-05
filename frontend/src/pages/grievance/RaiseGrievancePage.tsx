import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  Trash2,
  Mic,
  Volume2,
  Copy,
  Check,
  Calendar,
  DollarSign,
  User,
  Phone,
  Briefcase,
  HelpCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { useGrievance } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { GRIEVANCE_CATEGORIES, getCategoryDisplay } from '../../data/mockGrievances';
import { GrievanceEvidence } from '../../types';
import { renderCategoryIcon } from './GrievanceLandingPage';

export const RaiseGrievancePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { role, workerUser, employerUser } = useAuth();
  const { activeAgreement, completedAgreements } = useBooking();
  const { raiseGrievance } = useGrievance();
  const { language } = useLanguage();
  const isHindi = language === 'hi';

  // Filter categories strictly for the current logged-in role
  const roleCategories = GRIEVANCE_CATEGORIES.filter((cat) =>
    cat.relevantRoles.includes(role)
  );

  const initialCategoryParam = searchParams.get('category') || '';
  const initialBookingIdParam = searchParams.get('bookingId') || '';

  // Ensure initial category param is valid for this role
  const validInitialCategory = roleCategories.some((c) => c.id === initialCategoryParam)
    ? initialCategoryParam
    : (roleCategories[0]?.id || '');

  // Multi-step state (1: Category, 2: Booking, 3: Details, 4: Review, 5: Success)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<string>(validInitialCategory);
  const [safetyConfirmation, setSafetyConfirmation] = useState<boolean>(false);

  // Booking selection
  const [selectedBookingId, setSelectedBookingId] = useState<string>(initialBookingIdParam || 'none');
  const [customCounterpartyName, setCustomCounterpartyName] = useState<string>('');
  const [customCounterpartyPhone, setCustomCounterpartyPhone] = useState<string>('');

  // Details
  const [title, setTitle] = useState<string>('');
  const [incidentDate, setIncidentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState<string>('');
  const [agreedWage, setAgreedWage] = useState<number | ''>('');
  const [actualPaid, setActualPaid] = useState<number | ''>('');
  const [whoCancelled, setWhoCancelled] = useState<'worker' | 'employer' | 'both'>('employer');

  // Evidence
  const [evidenceList, setEvidenceList] = useState<GrievanceEvidence[]>([]);
  const [newEvidenceName, setNewEvidenceName] = useState<string>('');
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [recordedAudioDuration, setRecordedAudioDuration] = useState<number>(0);

  // Review & Confirmation
  const [declarationConfirmed, setDeclarationConfirmed] = useState<boolean>(false);

  // Success State
  const [submittedGrievanceId, setSubmittedGrievanceId] = useState<string>('');
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Combine bookings
  const allBookings = [
    ...(activeAgreement ? [activeAgreement] : []),
    ...completedAgreements,
  ];

  // Auto-fill from booking selection
  useEffect(() => {
    if (selectedBookingId && selectedBookingId !== 'none') {
      const found = allBookings.find((b) => b.id === selectedBookingId);
      if (found) {
        if (role === 'worker') {
          setCustomCounterpartyName(found.employerName || 'Demo Employer');
          setCustomCounterpartyPhone(found.employerPhone || '+91 98765 43210');
        } else {
          setCustomCounterpartyName(found.workerName || 'Demo Worker');
          setCustomCounterpartyPhone(found.workerPhone || '+91 98123 45678');
        }
        if (found.agreedWage && !agreedWage) {
          setAgreedWage(found.agreedWage);
        }
      }
    }
  }, [selectedBookingId, role]);

  const categoryMeta = GRIEVANCE_CATEGORIES.find((c) => c.id === selectedCategory);
  const isSafetyCategory = categoryMeta?.isSafety;

  // Handler for adding simulated evidence
  const handleAddSampleEvidence = (sampleName: string, type: 'photo' | 'screenshot' | 'audio' | 'document') => {
    const newEv: GrievanceEvidence = {
      id: `ev-${Date.now()}`,
      fileName: sampleName,
      fileType: type === 'photo' || type === 'screenshot' ? 'image' : type === 'audio' ? 'audio' : 'document',
      fileSize: '1.4 MB',
      uploadDate: new Date().toLocaleDateString('en-GB'),
      url: '#',
    };
    setEvidenceList((prev) => [...prev, newEv]);
  };

  const handleCustomEvidenceAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvidenceName.trim()) return;
    const newEv: GrievanceEvidence = {
      id: `ev-${Date.now()}`,
      fileName: newEvidenceName.trim(),
      fileType: 'image',
      fileSize: '820 KB',
      uploadDate: new Date().toLocaleDateString('en-GB'),
      url: '#',
    };
    setEvidenceList((prev) => [...prev, newEv]);
    setNewEvidenceName('');
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceList((prev) => prev.filter((item) => item.id !== id));
  };

  // Simulate audio recording
  const handleRecordVoiceNote = () => {
    if (isRecordingAudio) {
      setIsRecordingAudio(false);
      const audioEv: GrievanceEvidence = {
        id: `ev-audio-${Date.now()}`,
        fileName: `Voice_Note_${recordedAudioDuration}s.mp3`,
        fileType: 'audio',
        fileSize: '450 KB',
        uploadDate: new Date().toLocaleDateString('en-GB'),
        url: '#',
      };
      setEvidenceList((prev) => [...prev, audioEv]);
      setRecordedAudioDuration(0);
    } else {
      setIsRecordingAudio(true);
      setRecordedAudioDuration(1);
      const timer = setInterval(() => {
        setRecordedAudioDuration((sec) => {
          if (sec >= 15) {
            clearInterval(timer);
            return 15;
          }
          return sec + 1;
        });
      }, 1000);
    }
  };

  // Step Validation
  const canProceedStep1 = selectedCategory && (!isSafetyCategory || safetyConfirmation);
  const canProceedStep2 = true; // Booking is optional or selected
  const canProceedStep3 = title.trim().length > 3 && description.trim().length >= 10;
  const canProceedStep4 = declarationConfirmed;

  // Submission handler
  const handleSubmitGrievance = () => {
    const selectedBooking = allBookings.find((b) => b.id === selectedBookingId);
    const categoryDisplay = categoryMeta
      ? getCategoryDisplay(categoryMeta, role)
      : { label: 'General Issue', description: '' };

    const createdGrievance = raiseGrievance({
      category: selectedCategory,
      categoryLabel: categoryDisplay.label,
      title: title.trim(),
      description: description.trim(),
      bookingId: selectedBooking ? selectedBooking.id : undefined,
      bookingTitle: selectedBooking ? selectedBooking.workTitle : undefined,
      bookingNumber: selectedBooking ? selectedBooking.bookingNumber : undefined,
      bookingDate: selectedBooking ? selectedBooking.date : incidentDate,
      bookingAmount: selectedBooking ? selectedBooking.agreedWage : undefined,
      counterpartyName: customCounterpartyName || (role === 'worker' ? 'Employer' : 'Worker'),
      counterpartyPhone: customCounterpartyPhone || '+91 98XXX XXXXX',
      agreedWage: agreedWage ? Number(agreedWage) : undefined,
      actualPaid: actualPaid ? Number(actualPaid) : undefined,
      whoCancelled: selectedCategory === 'cancellation' ? whoCancelled : undefined,
      inImmediateDanger: false,
      evidence: evidenceList,
    });

    setSubmittedGrievanceId(createdGrievance.id);
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyId = () => {
    if (submittedGrievanceId) {
      navigator.clipboard.writeText(submittedGrievanceId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafcfa] dark:bg-darkbg-base py-8 sm:py-12 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Step Progress Header */}
        {currentStep < 5 && (
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between">
              <Link
                to="/grievances"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 dark:text-neutral-400 hover:text-rozgo-900 dark:hover:text-rozgo-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isHindi ? 'शिकायत पोर्टल पर वापस जाएं' : 'Back to Grievance Center'}</span>
              </Link>
              <span className="text-xs font-bold text-neutral-400">
                {isHindi ? `चरण ${currentStep} / 4` : `Step ${currentStep} of 4`}
              </span>
            </div>

            {/* Stepper Dots */}
            <div className="flex items-center gap-2">
              {[
                { step: 1, label: isHindi ? 'श्रेणी' : 'Category' },
                { step: 2, label: isHindi ? 'बुकिंग' : 'Booking' },
                { step: 3, label: isHindi ? 'विवरण व साक्ष्य' : 'Details' },
                { step: 4, label: isHindi ? 'समीक्षा' : 'Review' },
              ].map((item) => (
                <div key={item.step} className="flex-1">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      currentStep >= item.step
                        ? 'bg-rozgo-900 dark:bg-rozgo-400'
                        : 'bg-neutral-200 dark:bg-neutral-800'
                    }`}
                  />
                  <p
                    className={`text-[11px] font-bold mt-1.5 hidden sm:block ${
                      currentStep >= item.step
                        ? 'text-rozgo-900 dark:text-rozgo-300'
                        : 'text-neutral-400'
                    }`}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: CATEGORY SELECTION */}
        {currentStep === 1 && (
          <div className="bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-rozgo-900 dark:text-rozgo-300 bg-rozgo-100 dark:bg-darkbg-surface px-2.5 py-0.5 rounded-md">
                  {role === 'worker'
                    ? isHindi
                      ? 'श्रमिक रिपोर्ट पोर्टल'
                      : 'Worker Reporting'
                    : isHindi
                    ? 'नियोक्ता रिपोर्ट पोर्टल'
                    : 'Employer Reporting'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                {role === 'worker'
                  ? isHindi
                    ? 'एक श्रमिक के रूप में आपकी शिकायत किस विषय में है?'
                    : 'What is your grievance as a Worker?'
                  : isHindi
                  ? 'एक नियोक्ता के रूप में आपकी शिकायत किस विषय में है?'
                  : 'What is your grievance as an Employer?'}
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {role === 'worker'
                  ? isHindi
                    ? 'नीचे दी गई सूची में से अपनी समस्या चुनें (मजदूरी, रद्दीकरण, अत्यधिक काम, या अनुचित व्यवहार)।'
                    : 'Select the primary issue you experienced with your employer or site for expedited investigation.'
                  : isHindi
                  ? 'नीचे दी गई सूची में से अपनी समस्या चुनें (काम की गुणवत्ता, अनुपस्थिति, या भुगतान विवाद)।'
                  : 'Select the primary issue you experienced with the worker or booking for neutral resolution.'}
              </p>
            </div>

            {/* Safety Alert Callout if Safety Concern Selected */}
            {isSafetyCategory && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-rose-900 dark:text-rose-200">
                      {isHindi ? 'तत्काल व्यक्तिगत सुरक्षा सूचना' : 'Immediate Personal Safety Notice'}
                    </h3>
                    <p className="text-xs sm:text-sm text-rose-800 dark:text-rose-300 leading-relaxed">
                      {isHindi
                        ? 'यदि आपको शारीरिक हमले, धमकी या गंभीर खतरे का सामना करना पड़ रहा है, तो तुरंत 112 डायल करें। ROZGO शिकायत व्यवस्था कार्यस्थल विवादों और निष्पक्ष जांच के लिए है।'
                        : 'If you are facing violence, harassment, or imminent threat to your safety, call 112 immediately. ROZGO grievance portal records and acts upon platform conduct.'}
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-2.5 pt-2 border-t border-rose-200 dark:border-rose-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyConfirmation}
                    onChange={(e) => setSafetyConfirmation(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded border-rose-300 focus:ring-rose-500"
                  />
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    {isHindi
                      ? 'मैं पुष्टि करता हूँ कि यह कोई आपातकालीन स्थिति नहीं है और मैं ROZGO में शिकायत दर्ज करना चाहता हूँ।'
                      : 'I confirm this is not an immediate life-threatening emergency and I wish to report this to ROZGO.'}
                  </span>
                </label>
              </div>
            )}

            {/* Category Grid - Strictly Filtered By Current Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {roleCategories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const display = getCategoryDisplay(cat, role);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      if (!cat.isSafety) setSafetyConfirmation(false);
                    }}
                    className={`text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-rozgo-900 bg-rozgo-50/50 dark:border-rozgo-400 dark:bg-rozgo-950/40 shadow-sm'
                        : 'border-neutral-200 dark:border-darkbg-border hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        cat.isSafety
                          ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400'
                          : isSelected
                          ? 'bg-rozgo-900 dark:bg-rozgo-400 text-white dark:text-rozgo-950'
                          : 'bg-neutral-100 dark:bg-darkbg-surface text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {renderCategoryIcon(cat.iconName, 'w-5 h-5')}
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                        <span>{display.label}</span>
                        {cat.isSafety && (
                          <span className="text-[10px] font-extrabold text-rose-600 bg-rose-100 dark:bg-rose-900/40 px-1.5 py-0.2 rounded">
                            Alert
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-snug">
                        {display.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-neutral-100 dark:border-darkbg-border flex justify-end">
              <button
                type="button"
                disabled={!canProceedStep1}
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rozgo-900 hover:bg-rozgo-800 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm transition-all active:scale-95"
              >
                <span>{isHindi ? 'आगे बढ़ें (बुकिंग विवरण)' : 'Next: Related Booking'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: RELATED BOOKING SELECTION */}
        {currentStep === 2 && (
          <div className="bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                {isHindi ? 'क्या यह किसी बुकिंग से संबंधित है?' : 'Is this related to a specific booking?'}
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {isHindi
                  ? 'बुकिंग जोड़ने से हमें दोनों पक्षों की बातचीत, तय मजदूरी और समझौते को तुरंत सत्यापित करने में मदद मिलती है।'
                  : 'Linking a booking enables us to instantly review the agreed terms, contact records, and timeline.'}
              </p>
            </div>

            <div className="space-y-3">
              {/* Option: No specific booking */}
              <label
                className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 cursor-pointer transition-all ${
                  selectedBookingId === 'none'
                    ? 'border-rozgo-900 bg-rozgo-50/50 dark:border-rozgo-400 dark:bg-rozgo-950/40'
                    : 'border-neutral-200 dark:border-darkbg-border hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="booking"
                  value="none"
                  checked={selectedBookingId === 'none'}
                  onChange={() => setSelectedBookingId('none')}
                  className="mt-1 text-rozgo-900 focus:ring-rozgo-500"
                />
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                    {isHindi ? 'सामान्य समस्या / कोई विशेष बुकिंग नहीं' : 'General Platform Issue / No Specific Booking'}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {isHindi
                      ? 'प्रोफ़ाइल सत्यापन, ऐप समस्या या सामान्य व्यवहार संबंधी शिकायत।'
                      : 'Verification delay, account access, or general inquiry not tied to a completed/active work order.'}
                  </p>
                </div>
              </label>

              {/* Bookings List */}
              {allBookings.map((b) => {
                const isSelected = selectedBookingId === b.id;
                const counterparty = role === 'worker' ? b.employerName : b.workerName;
                return (
                  <label
                    key={b.id}
                    className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-rozgo-900 bg-rozgo-50/50 dark:border-rozgo-400 dark:bg-rozgo-950/40'
                        : 'border-neutral-200 dark:border-darkbg-border hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="booking"
                      value={b.id}
                      checked={isSelected}
                      onChange={() => setSelectedBookingId(b.id)}
                      className="mt-1 text-rozgo-900 focus:ring-rozgo-500"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-neutral-900 dark:text-white">
                          {b.workTitle}
                        </span>
                        <span className="text-xs font-mono font-bold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                          {b.bookingNumber}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                        <span>
                          {role === 'worker' ? 'Employer: ' : 'Worker: '}
                          <strong>{counterparty || 'Participant'}</strong>
                        </span>
                        <span>Date: {b.date}</span>
                        {b.agreedWage && (
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">
                            ₹{b.agreedWage}
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Custom Counterparty details if no booking is linked */}
            {selectedBookingId === 'none' && (
              <div className="pt-4 border-t border-neutral-100 dark:border-darkbg-border space-y-4">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  {isHindi ? 'विपक्षी व्यक्ति का विवरण (वैकल्पिक)' : 'Other Party Information (Optional)'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      {isHindi ? 'व्यक्ति का नाम' : "Person's Name"}
                    </label>
                    <input
                      type="text"
                      value={customCounterpartyName}
                      onChange={(e) => setCustomCounterpartyName(e.target.value)}
                      placeholder={role === 'worker' ? 'Employer Name' : 'Worker Name'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      {isHindi ? 'मोबाइल नंबर (यदि उपलब्ध हो)' : 'Phone Number (If known)'}
                    </label>
                    <input
                      type="tel"
                      value={customCounterpartyPhone}
                      onChange={(e) => setCustomCounterpartyPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-neutral-100 dark:border-darkbg-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isHindi ? 'पीछे' : 'Back'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rozgo-900 hover:bg-rozgo-800 text-white font-bold text-sm transition-all active:scale-95"
              >
                <span>{isHindi ? 'आगे बढ़ें (विवरण दर्ज करें)' : 'Next: Incident Details'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: GUIDED DETAILS & EVIDENCE */}
        {currentStep === 3 && (
          <div className="bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                {isHindi ? 'घटना का विवरण और प्रमाण' : 'Incident Details & Evidence'}
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {isHindi
                  ? 'कृपया स्पष्ट और सच विवरण दें। तस्वीरें या रसीदें जोड़ने से समाधान तेजी से होता है।'
                  : 'Be as specific as possible. Clear descriptions and screenshots expedite resolution.'}
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              {/* Title / Summary */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                  {isHindi ? 'शिकायत का शीर्षक / संक्षिप्त विषय *' : 'Grievance Subject / Short Summary *'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    selectedCategory === 'payment_wage'
                      ? isHindi
                        ? 'उदा. 4 घंटे काम के बाद केवल 300 रुपये दिए'
                        : 'e.g., Only Rs. 400 paid out of agreed Rs. 750'
                      : isHindi
                      ? 'उदा. बिना पूर्व सूचना के बुकिंग रद्द कर दी'
                      : 'e.g., Employer cancelled after I reached site'
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                />
              </div>

              {/* Date of incident */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                    {isHindi ? 'घटना की तिथि *' : 'Date of Incident *'}
                  </label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                  />
                </div>

                {/* Conditional Cancellation: Who cancelled */}
                {selectedCategory === 'cancellation' && (
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                      {isHindi ? 'किसने रद्द किया?' : 'Who cancelled?'}
                    </label>
                    <select
                      value={whoCancelled}
                      onChange={(e) => setWhoCancelled(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                    >
                      <option value="employer">Employer</option>
                      <option value="worker">Worker</option>
                      <option value="both">Mutual Disagreement</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Conditional Payment Dispute Fields */}
              {selectedCategory === 'payment_wage' && (
                <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 sm:p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    <span>{isHindi ? 'मजदूरी राशि का विवरण' : 'Wage Dispute Breakdown'}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        {isHindi ? 'तय राशि (₹)' : 'Agreed Wage (₹)'}
                      </label>
                      <input
                        type="number"
                        value={agreedWage}
                        onChange={(e) => setAgreedWage(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="700"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-rozgo-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        {isHindi ? 'वास्तविक प्राप्त राशि (₹)' : 'Amount Actually Paid (₹)'}
                      </label>
                      <input
                        type="number"
                        value={actualPaid}
                        onChange={(e) => setActualPaid(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="350"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-rozgo-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        {isHindi ? 'विवादित अंतर (₹)' : 'Disputed Balance (₹)'}
                      </label>
                      <div className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border text-sm font-bold text-rose-600 dark:text-rose-400">
                        ₹{Number(agreedWage || 0) - Number(actualPaid || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Description */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                  {isHindi ? 'विस्तृत विवरण (क्या हुआ था?) *' : 'Detailed Explanation (What happened?) *'}
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isHindi
                      ? 'कृपया विस्तार से बताएं: क्या तय हुआ था, स्थल पर क्या हुआ, और समझौते का क्या उल्लंघन हुआ...'
                      : 'Please describe the situation in detail: what was initially agreed, what happened on site, and what resolution you are requesting...'
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  {description.length < 10
                    ? isHindi
                      ? `कम से कम 10 अक्षर आवश्यक हैं (${description.length}/10)`
                      : `Minimum 10 characters required (${description.length}/10)`
                    : `${description.length} characters`}
                </p>
              </div>

              {/* Evidence & Documents Upload Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                      {isHindi ? 'प्रमाण व साक्ष्य संलग्न करें' : 'Attach Supporting Evidence'}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {isHindi
                        ? 'भुगतान स्क्रीनशॉट, कार्यस्थल की फोटो, या ऑडियो संदेश जोड़ें।'
                        : 'Screenshots, UPI receipts, photos of work site, or voice notes.'}
                    </p>
                  </div>
                  {/* Voice Note Simulation Button */}
                  <button
                    type="button"
                    onClick={handleRecordVoiceNote}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isRecordingAudio
                        ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                        : 'bg-neutral-100 dark:bg-darkbg-surface hover:bg-neutral-200 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-darkbg-border'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>
                      {isRecordingAudio
                        ? `Recording (${recordedAudioDuration}s) - Click to Save`
                        : isHindi
                        ? 'वॉयस नोट रिकॉर्ड करें'
                        : 'Record Audio Note'}
                    </span>
                  </button>
                </div>

                {/* Evidence List */}
                {evidenceList.length > 0 && (
                  <div className="space-y-2">
                    {evidenceList.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-white dark:bg-darkbg-card text-rozgo-900 dark:text-rozgo-300 border border-neutral-200 dark:border-darkbg-border">
                            {ev.fileType === 'audio' ? (
                              <Volume2 className="w-4 h-4" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-neutral-900 dark:text-white">
                              {ev.fileName}
                            </p>
                            <p className="text-[10px] text-neutral-400">
                              {ev.fileSize || '1 MB'} • {(ev.fileType || ev.type || 'FILE').toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEvidence(ev.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Add Preset Samples (for convenience during testing) */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-darkbg-surface/50 space-y-3">
                  <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 text-center">
                    {isHindi ? 'त्वरित नमूना साक्ष्य जोड़ें (Quick Add)' : 'Click to quickly attach sample proof:'}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => handleAddSampleEvidence('UPI_Payment_Transaction.png', 'screenshot')}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:border-rozgo-400"
                    >
                      + UPI Receipt
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSampleEvidence('Worksite_Photo_BeforeAfter.jpg', 'photo')}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:border-rozgo-400"
                    >
                      + Work Site Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSampleEvidence('WhatsApp_Chat_Screenshot.png', 'screenshot')}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:border-rozgo-400"
                    >
                      + WhatsApp Chat
                    </button>
                  </div>

                  {/* Or Custom File Upload input */}
                  <form onSubmit={handleCustomEvidenceAdd} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={newEvidenceName}
                      onChange={(e) => setNewEvidenceName(e.target.value)}
                      placeholder={isHindi ? 'फ़ाइल का नाम लिखें...' : 'Enter file description (e.g. Call_recording.m4a)'}
                      className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 dark:border-darkbg-border bg-white dark:bg-darkbg-card text-xs text-neutral-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={!newEvidenceName.trim()}
                      className="px-4 py-2 rounded-xl bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-900 text-white text-xs font-bold disabled:opacity-40"
                    >
                      {isHindi ? 'जोड़ें' : 'Attach'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-neutral-100 dark:border-darkbg-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isHindi ? 'पीछे' : 'Back'}</span>
              </button>

              <button
                type="button"
                disabled={!canProceedStep3}
                onClick={() => setCurrentStep(4)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rozgo-900 hover:bg-rozgo-800 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm transition-all active:scale-95"
              >
                <span>{isHindi ? 'आगे बढ़ें (समीक्षा करें)' : 'Next: Review Grievance'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & DECLARATION */}
        {currentStep === 4 && (
          <div className="bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                {isHindi ? 'शिकायत की समीक्षा करें' : 'Review & Submit Grievance'}
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {isHindi
                  ? 'कृपया सबमिट करने से पहले सभी विवरणों की जांच करें।'
                  : 'Please double-check the details below before official submission.'}
              </p>
            </div>

            {/* Review Summary Card */}
            <div className="bg-neutral-50 dark:bg-darkbg-surface rounded-2xl p-5 border border-neutral-200 dark:border-darkbg-border space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-darkbg-border/60 pb-3">
                <span className="text-xs font-bold uppercase text-neutral-400">
                  {isHindi ? 'श्रेणी' : 'Category'}
                </span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  {renderCategoryIcon(categoryMeta?.iconName || '', 'w-4 h-4 text-rozgo-900 dark:text-rozgo-400')}
                  {categoryMeta ? getCategoryDisplay(categoryMeta, role).label : 'General Issue'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-darkbg-border/60 pb-3">
                <span className="text-xs font-bold uppercase text-neutral-400">
                  {isHindi ? 'बुकिंग संदर्भ' : 'Booking Reference'}
                </span>
                <span className="text-sm font-mono font-bold text-neutral-900 dark:text-white">
                  {selectedBookingId !== 'none'
                    ? allBookings.find((b) => b.id === selectedBookingId)?.bookingNumber || 'Linked'
                    : isHindi
                    ? 'कोई विशेष बुकिंग नहीं'
                    : 'None / General Issue'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-darkbg-border/60 pb-3">
                <span className="text-xs font-bold uppercase text-neutral-400">
                  {isHindi ? 'विपक्षी व्यक्ति' : 'Counterparty'}
                </span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                  {customCounterpartyName || (role === 'worker' ? 'Employer' : 'Worker')}
                </span>
              </div>

              {selectedCategory === 'payment_wage' && agreedWage && (
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-darkbg-border/60 pb-3">
                  <span className="text-xs font-bold uppercase text-neutral-400">
                    {isHindi ? 'विवादित मजदूरी' : 'Disputed Wage Amount'}
                  </span>
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                    ₹{Number(agreedWage) - Number(actualPaid || 0)} (Agreed: ₹{agreedWage}, Paid: ₹{actualPaid || 0})
                  </span>
                </div>
              )}

              <div className="space-y-1 border-b border-neutral-200 dark:border-darkbg-border/60 pb-3">
                <span className="text-xs font-bold uppercase text-neutral-400">
                  {isHindi ? 'विवरण' : 'Subject & Description'}
                </span>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">{title}</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap mt-1">
                  {description}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-neutral-400">
                  {isHindi ? 'संलग्न साक्ष्य' : 'Attached Evidence'}
                </span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {evidenceList.length === 0 ? (
                    <span className="text-xs text-neutral-400 italic">
                      {isHindi ? 'कोई फ़ाइल संलग्न नहीं' : 'No files attached'}
                    </span>
                  ) : (
                    evidenceList.map((e) => (
                      <span
                        key={e.id}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border text-xs font-bold text-neutral-700 dark:text-neutral-300"
                      >
                        📎 {e.fileName}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Truthfulness Declaration */}
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-rozgo-50/60 dark:bg-darkbg-surface border border-rozgo-200 dark:border-darkbg-border cursor-pointer">
              <input
                type="checkbox"
                checked={declarationConfirmed}
                onChange={(e) => setDeclarationConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 text-rozgo-900 rounded border-neutral-300 focus:ring-rozgo-500"
              />
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 leading-relaxed">
                {isHindi
                  ? 'मैं पुष्टि करता हूँ कि मेरे द्वारा दी गई सभी जानकारियां और साक्ष्य सत्य हैं। मैं ROZGO शिकायत निवारण टीम द्वारा निष्पक्ष जांच में सहयोग करने के लिए सहमत हूँ।'
                  : 'I declare that the information and evidence submitted are true to the best of my knowledge, and I agree to cooperate with ROZGO Redressal Officers for neutral mediation.'}
              </span>
            </label>

            {/* Actions */}
            <div className="pt-4 border-t border-neutral-100 dark:border-darkbg-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isHindi ? 'संपादन करें' : 'Back / Edit'}</span>
              </button>

              <button
                type="button"
                disabled={!canProceedStep4}
                onClick={handleSubmitGrievance}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-rozgo-900 hover:bg-rozgo-800 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-sm shadow-md transition-all active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5 text-rozgo-200" />
                <span>{isHindi ? 'शिकायत दर्ज करें' : 'Submit Grievance Officially'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SUBMISSION SUCCESS */}
        {currentStep === 5 && (
          <div className="bg-white dark:bg-darkbg-card border-2 border-rozgo-200 dark:border-rozgo-800 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-7 animate-fadeIn">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-soft">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                {isHindi ? 'शिकायत सफलतापूर्वक दर्ज की गई!' : 'Grievance Registered Successfully!'}
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto">
                {isHindi
                  ? 'आपकी शिकायत हमारे शिकायत निवारण डेस्क को सौंप दी गई है। एक समर्पित अधिकारी 24 घंटे के भीतर इसकी समीक्षा करेगा।'
                  : 'Your complaint has been assigned to our Redressal Cell. An investigation officer will review it within 24 hours.'}
              </p>
            </div>

            {/* Grievance Tracking ID Card */}
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border max-w-md mx-auto space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                {isHindi ? 'आपकी विशिष्ट शिकायत ID' : 'Your Unique Grievance ID'}
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-mono font-black text-rozgo-900 dark:text-rozgo-300">
                  {submittedGrievanceId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-2 rounded-xl bg-white dark:bg-darkbg-card border border-neutral-200 dark:border-darkbg-border hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-all active:scale-90"
                  title="Copy Grievance ID"
                >
                  {copiedId ? (
                    <Check className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              {copiedId && (
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {isHindi ? 'ID कॉपी हो गई!' : 'Copied to clipboard!'}
                </p>
              )}
            </div>

            {/* Next steps notice */}
            <div className="bg-rozgo-50/70 dark:bg-rozgo-950/30 rounded-2xl p-4 text-left max-w-lg mx-auto border border-rozgo-200/80 dark:border-rozgo-800/80 space-y-2">
              <h4 className="text-xs font-bold text-rozgo-900 dark:text-rozgo-200 uppercase tracking-wider">
                {isHindi ? 'आगे क्या होगा?' : 'What Happens Next?'}
              </h4>
              <ul className="text-xs text-neutral-700 dark:text-neutral-300 space-y-1.5 list-disc list-inside">
                <li>
                  {isHindi
                    ? 'ROZGO अधिकारी दोनों पक्षों के रिकॉर्ड और प्रमाणों की जांच करेंगे।'
                    : 'ROZGO officer reviews booking records, call logs, and submitted proof.'}
                </li>
                <li>
                  {isHindi
                    ? 'यदि अतिरिक्त स्पष्टीकरण की आवश्यकता होगी तो टिकट में संदेश भेजा जाएगा।'
                    : 'If clarification is needed, you will receive an alert in your ticket.'}
                </li>
                <li>
                  {isHindi
                    ? 'निर्णय होने पर आधिकारिक समाधान नोट जारी किया जाएगा।'
                    : 'A fair resolution and mediation note will be provided upon review.'}
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/grievances/${submittedGrievanceId}`)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-rozgo-900 hover:bg-rozgo-800 text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <span>{isHindi ? 'स्थिति ट्रैक करें' : 'Track This Grievance Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate(role === 'employer' ? '/employer' : '/worker/dashboard')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-neutral-100 dark:bg-darkbg-surface hover:bg-neutral-200 text-neutral-800 dark:text-white font-bold text-sm border border-neutral-300 dark:border-darkbg-border transition-all"
              >
                <span>{isHindi ? 'डैशबोर्ड पर वापस जाएं' : 'Return to Dashboard'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
