import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  ShieldCheck,
  User,
  MapPin,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Calendar,
  Camera,
  Check,
  Clock,
  Briefcase,
  AlertCircle,
  Award,
  Upload,
  Image as ImageIcon,
  X,
  RefreshCw,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LabourBadge } from '../../components/workers/LabourBadge';
import { authApi } from '../../api/authApi';
import logoImg from '../../assets/logo.png';

// Sub-skills lookup mapping for specific trades
const SUB_SKILLS_MAP: Record<string, string[]> = {
  plumber: [
    'Tap repair',
    'Pipe repair',
    'Leakage repair',
    'Drain cleaning',
    'Bathroom plumbing',
    'Installation',
    'Other',
  ],
  electrician: [
    'Wiring & MCB repair',
    'Switchboard & Socket',
    'Ceiling fan repair & install',
    'Inverter wiring & battery',
    'Appliance hookup',
    'Short circuit fault check',
    'Other',
  ],
  carpenter: [
    'Furniture repair & assembly',
    'Door locks & latches',
    'Cupboard & wardrobe hinges',
    'Wooden window frames & mesh',
    'Custom shelves & tables',
    'Other',
  ],
  painter: [
    '1-2 Rooms wall painting',
    'Full house exterior / interior',
    'Waterproofing & seepage fix',
    'Door & furniture wood polish',
    'Wall putty & crack repair',
    'Other',
  ],
  mason: [
    'Brickwork & plaster repair',
    'Floor & bathroom tile fixing',
    'Small cement constructions',
    'Boundary & lintel work',
    'Other',
  ],
  driver: [
    'Hourly city driver',
    'Outstation & highway driving',
    'Monthly commercial / personal',
    'Manual & automatic transmission',
    'Other',
  ],
  domestic_help: [
    'Daily home sweeping & mopping',
    'Kitchen utensils washing',
    'Home cooking / Cook helper',
    'Dusting & deep bathroom clean',
    'Laundry & clothes ironing',
    'Other',
  ],
  ac_repair: [
    'Foam-jet deep filter servicing',
    'AC not cooling / water leakage',
    'Gas checking & top-up',
    'AC installation & uninstallation',
    'Other',
  ],
  appliance_repair: [
    'Washing machine repair',
    'Refrigerator / fridge cooling',
    'Geyser & water heater repair',
    'Microwave oven repair',
    'Other',
  ],
  gardener: [
    'Lawn mowing & weed cleanup',
    'Plant potting & soil fertilizing',
    'Hedge & tree pruning',
    'Garden design & drip maintenance',
    'Other',
  ],
  pest_control: [
    'Cockroach & ant gel treatment',
    'Termite drilling & treatment',
    'Bed bug eradication spray',
    'Rodent & mosquito control',
    'Other',
  ],
  ro_water: [
    'Routine filter & sediment service',
    'RO membrane replacement',
    'Water taste & leakage check',
    'TDS calibration',
    'Other',
  ],
  other: [
    'General helper / loader',
    'Sanitation & cleaning',
    'Event setup & shifting',
    'Handyman fixes',
  ],
};

const TRADES_LIST = [
  { id: 'electrician', label: 'Electrician' },
  { id: 'plumber', label: 'Plumber' },
  { id: 'carpenter', label: 'Carpenter' },
  { id: 'painter', label: 'Painter' },
  { id: 'mason', label: 'Mason' },
  { id: 'driver', label: 'Driver' },
  { id: 'domestic_help', label: 'Domestic Help' },
  { id: 'ac_repair', label: 'AC Repair' },
  { id: 'appliance_repair', label: 'Appliance Repair' },
  { id: 'gardener', label: 'Gardener' },
  { id: 'pest_control', label: 'Pest Control' },
  { id: 'ro_water', label: 'Water Service' },
  { id: 'other', label: 'Other' },
];

const TRAVEL_RADIUS_OPTIONS = [
  { id: '2km', title: 'Within 2 km', desc: 'Walking or short bicycle distance around your locality' },
  { id: '5km', title: 'Within 5 km', desc: 'Nearby sectors and neighbouring neighborhoods' },
  { id: '10km', title: 'Within 10 km', desc: 'Across the city or town with two-wheeler/bus' },
  { id: 'nearby', title: 'Anywhere nearby', desc: 'Flexible to go wherever good work and wages are available' },
] as const;

const EXPERIENCE_OPTIONS = [
  'Less than 1 year',
  '1–3 years',
  '3–5 years',
  '5–10 years',
  '10+ years',
];

const AVAILABILITY_SLOTS = ['Morning', 'Afternoon', 'Evening', 'Full Day'];

export const WorkerOnboardingPage: React.FC = () => {
  const { registerWorker } = useAuth();
  const { language, setLanguage, languageOptions } = useLanguage();
  const navigate = useNavigate();

  // Wizard active step: 1 = Basic Info, 2 = Location, 3 = Skills & Availability, 4 = Success Card
  const [step, setStep] = useState<number>(1);
  const [formError, setFormError] = useState<string | null>(null);

  // STEP 1 Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpFeedback, setOtpFeedback] = useState<string | null>(null);
  const [dobOrAge, setDobOrAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Male');
  const [preferredLang, setPreferredLang] = useState(language);

  // Profile Photo State (Upload or Add Later)
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle direct file upload from device gallery / computer files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setCustomPhotoUrl(event.target.result);
        setFormError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // STEP 2 Form State (Location)
  const [stateName, setStateName] = useState('Haryana');
  const [district, setDistrict] = useState('Gurgaon');
  const [cityTownVillage, setCityTownVillage] = useState('Gurgaon (Sector 45)');
  const [pincode, setPincode] = useState('122003');
  const [travelRadius, setTravelRadius] = useState<'2km' | '5km' | '10km' | 'nearby'>('5km');

  // STEP 3 Form State (Skills, Experience & Availability)
  const [selectedTrades, setSelectedTrades] = useState<string[]>(['plumber']);
  const [selectedSubSkills, setSelectedSubSkills] = useState<string[]>([
    'Tap repair',
    'Pipe repair',
    'Leakage repair',
  ]);
  const [experienceRange, setExperienceRange] = useState<string>('3–5 years');
  const [experienceDescription, setExperienceDescription] = useState<string>('');
  const [usualAvailability, setUsualAvailability] = useState<string[]>(['Morning', 'Afternoon']);
  const [availableToday, setAvailableToday] = useState<boolean>(true);

  // Completion State
  const [generatedLabourNo, setGeneratedLabourNo] = useState<string>('');

  // OTP Countdown timer
  useEffect(() => {
    let timer: any;
    if (isOtpSent && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpSent, otpCountdown]);

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number first.');
      return;
    }
    setFormError(null);
    setOtpFeedback(null);
    setIsSendingOtp(true);
    try {
      const res = await authApi.sendOtp(phone);
      setIsOtpSent(true);
      setOtpCountdown(30);
      setOtp('');
      setIsOtpVerified(false);
      setOtpFeedback(res.message + (res.demo_otp ? ` (Test OTP: ${res.demo_otp})` : ''));
    } catch (err: any) {
      setFormError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.trim().length < 4) {
      setFormError('Please enter the 4 to 6-digit OTP sent to your phone.');
      return;
    }
    setFormError(null);
    setIsVerifyingOtp(true);
    try {
      await authApi.verifyOtp(phone, otp, 'worker');
      setIsOtpVerified(true);
      setOtpFeedback('Mobile number verified successfully! ✓');
    } catch (err: any) {
      setFormError(err.message || 'Invalid OTP entered. Please try again (Demo OTP: 123456).');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const toggleTrade = (tradeId: string) => {
    setSelectedTrades((prev) => {
      if (prev.includes(tradeId)) {
        if (prev.length === 1) return prev; // Keep at least one trade
        return prev.filter((id) => id !== tradeId);
      } else {
        return [...prev, tradeId];
      }
    });
  };

  const toggleSubSkill = (skill: string) => {
    setSelectedSubSkills((prev) => {
      if (prev.includes(skill)) {
        return prev.filter((s) => s !== skill);
      } else {
        return [...prev, skill];
      }
    });
  };

  const toggleAvailabilitySlot = (slot: string) => {
    setUsualAvailability((prev) => {
      if (slot === 'Full Day') {
        // If selecting 'Full Day', deselect all other slots
        if (prev.includes('Full Day')) {
          return [];
        } else {
          return ['Full Day'];
        }
      } else {
        // If selecting an individual slot (Morning, Afternoon, Evening),
        // remove 'Full Day' and toggle this slot
        const withoutFullDay = prev.filter((s) => s !== 'Full Day');
        if (withoutFullDay.includes(slot)) {
          return withoutFullDay.filter((s) => s !== slot);
        } else {
          return [...withoutFullDay, slot];
        }
      }
    });
  };

  const validateStep1 = (): boolean => {
    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return false;
    }
    if (phone.trim().length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return false;
    }
    if (!isOtpVerified) {
      setFormError('Please verify your mobile number with the OTP.');
      return false;
    }
    if (!dobOrAge.trim()) {
      setFormError('Please provide your Date of Birth or Age.');
      return false;
    }
    setFormError(null);
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!stateName.trim() || !district.trim() || !cityTownVillage.trim() || !pincode.trim()) {
      setFormError('Please fill in your State, District, City/Village, and PIN code.');
      return false;
    }
    if (pincode.trim().length < 6) {
      setFormError('Please enter a valid 6-digit PIN code.');
      return false;
    }
    setFormError(null);
    return true;
  };

  const validateStep3 = (): boolean => {
    if (selectedTrades.length === 0) {
      setFormError('Please select at least one trade that you work in.');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    } else if (step === 3) {
      if (validateStep3()) {
        // Calculate experience years estimate for backward compatibility
        let expYrs = 3;
        if (experienceRange === 'Less than 1 year') expYrs = 1;
        else if (experienceRange === '1–3 years') expYrs = 2;
        else if (experienceRange === '3–5 years') expYrs = 4;
        else if (experienceRange === '5–10 years') expYrs = 7;
        else if (experienceRange === '10+ years') expYrs = 12;

        const labourId = registerWorker({
          name: fullName,
          phone: `+91 ${phone.replace(/\D/g, '')}`,
          location: `${cityTownVillage}, ${district}, ${stateName} - ${pincode}`,
          primarySkill: selectedTrades[0] || 'plumber',
          experienceYears: expYrs,
          dobOrAge,
          gender,
          preferredLanguage: preferredLang,
          state: stateName,
          district,
          city: cityTownVillage,
          pincode,
          travelRadius,
          selectedTrades,
          subSkills: selectedSubSkills,
          experienceRange,
          experienceDescription,
          usualAvailability,
          availableToday,
          avatar:
            customPhotoUrl ||
            (gender === 'Female'
              ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80'),
        });

        setGeneratedLabourNo(labourId);
        setStep(4);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setFormError(null);
    if (step > 1) {
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const STEPS_NAV = [
    { num: 1, label: 'Basic Info', desc: 'Identity & OTP' },
    { num: 2, label: 'Location', desc: 'Where do you work?' },
    { num: 3, label: 'Skills & Avail.', desc: 'Your craft & hours' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 text-left">
      {/* Top Brand Logo Link */}
      <div className="text-center mb-6">
        <Link to="/" className="inline-block group" title="Return to Home">
          <div className="w-full max-w-[280px] sm:max-w-[320px] p-4 sm:p-5 rounded-3xl bg-white shadow-soft border border-neutral-200/90 dark:border-neutral-700 transition-all group-hover:scale-[1.03] mx-auto">
            <img
              src={logoImg}
              alt="ROZGO - Rozgaar Ka Naya Raasta"
              className="h-20 sm:h-24 w-auto max-w-[260px] sm:max-w-[300px] object-contain mx-auto"
            />
          </div>
        </Link>
      </div>

      {/* 3-Step Wizard Indicator (Only visible before completion) */}
      {step <= 3 && (
        <div className="mb-8">
          <div className="text-center mb-5">
            <span className="text-xs uppercase font-bold tracking-widest text-rozgo-700 dark:text-rozgo-400 bg-rozgo-100 dark:bg-rozgo-900/40 px-3 py-1 rounded-full">
              Worker Registration
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mt-2">
              Create Your Worker Account
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-md mx-auto">
              Simple 3-step registration. Get your official ROZGO Labour Number and connect directly with local employers.
            </p>
            <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-2">
              Already registered?{' '}
              <Link
                to="/auth/login?role=worker"
                className="font-bold text-rozgo-900 dark:text-rozgo-300 underline hover:opacity-80"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between relative max-w-lg mx-auto px-2">
            {/* Background Line */}
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-neutral-200 dark:bg-darkbg-border -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-8 h-1 bg-rozgo-900 dark:bg-rozgo-500 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((step - 1) / (STEPS_NAV.length - 1)) * 82}%` }}
            />

            {STEPS_NAV.map((s) => {
              const isDone = s.num < step;
              const isCurrent = s.num === step;
              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                      isDone
                        ? 'bg-rozgo-900 text-white shadow-soft ring-4 ring-rozgo-100 dark:ring-rozgo-900/40'
                        : isCurrent
                        ? 'bg-rozgo-900 text-white ring-4 ring-rozgo-200 dark:ring-rozgo-800 scale-105'
                        : 'bg-white dark:bg-darkbg-card text-neutral-400 border-2 border-neutral-300 dark:border-darkbg-border'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5 text-rozgo-200" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-bold mt-2 ${
                      isCurrent ? 'text-rozgo-900 dark:text-rozgo-300' : 'text-neutral-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Card Container */}
      <Card variant="elevated" padding="xl" className="border border-neutral-200 dark:border-darkbg-border">
        {/* Error Notification */}
        {formError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-3 text-red-800 dark:text-red-200 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-semibold">{formError}</div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: Basic Information */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-neutral-100 dark:border-darkbg-border pb-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-rozgo-700 dark:text-rozgo-400">
                Step 1 of 3
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-1">
                Basic Information
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Keep this very short. Easy phone login with OTP — no complicated passwords.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center justify-between">
                  <span>Full Name <span className="text-rozgo-700 dark:text-rozgo-400 font-black">*</span></span>
                  <span className="text-[11px] font-medium text-neutral-400">Official name</span>
                </label>
                <div className="relative flex items-center">
                  <User className="w-5 h-5 absolute left-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                    required
                  />
                </div>
              </div>

              {/* Mobile Number (+91 XXXXX XXXXX) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center justify-between">
                  <span>Mobile Number <span className="text-rozgo-700 dark:text-rozgo-400 font-black">*</span></span>
                  <span className="text-[11px] font-medium text-neutral-400">Format: +91 XXXXX XXXXX</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 flex items-center">
                    <span className="absolute left-3.5 text-neutral-700 dark:text-neutral-300 font-extrabold text-sm select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPhone(val);
                        if (isOtpVerified) setIsOtpVerified(false);
                      }}
                      placeholder="98765 43210"
                      className="w-full pl-14 pr-4 py-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white font-bold text-base tracking-wider focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={phone.length !== 10 || isSendingOtp || (isOtpSent && otpCountdown > 0)}
                    className="px-5 py-3 rounded-2xl bg-rozgo-900 text-white font-bold text-sm shadow-soft disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rozgo-800 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    {isSendingOtp
                      ? 'Sending...'
                      : isOtpVerified
                      ? 'Verified ✓'
                      : isOtpSent
                      ? otpCountdown > 0
                        ? `Resend (${otpCountdown}s)`
                        : 'Resend OTP'
                      : 'Send OTP'}
                  </button>
                </div>
              </div>

              {/* OTP Field (Shown when OTP is sent) */}
              {isOtpSent && (
                <div className="sm:col-span-2 p-4 rounded-2xl bg-rozgo-50/70 dark:bg-darkbg-surface border border-rozgo-200 dark:border-darkbg-border space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-rozgo-900 dark:text-rozgo-300 flex items-center gap-2">
                      <KeyRound className="w-4 h-4" />
                      <span>Enter 4 to 6-Digit OTP <span className="text-rozgo-700">*</span></span>
                    </label>
                    {otpFeedback && (
                      <span className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">
                        {otpFeedback}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-44 px-4 py-2.5 rounded-xl bg-white dark:bg-darkbg-base border border-rozgo-300 dark:border-rozgo-700 text-neutral-900 dark:text-white font-mono font-black text-lg tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                    />
                    <Button
                      type="button"
                      variant={isOtpVerified ? 'outline' : 'primary'}
                      size="sm"
                      onClick={handleVerifyOtp}
                      disabled={otp.length < 4 || isVerifyingOtp || isOtpVerified}
                    >
                      {isVerifyingOtp ? 'Verifying...' : isOtpVerified ? 'OTP Verified ✓' : 'Verify OTP'}
                    </Button>
                    {isOtpVerified && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Mobile Number Verified
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Date of Birth / Age */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center justify-between">
                  <span>Date of Birth / Age <span className="text-rozgo-700 dark:text-rozgo-400 font-black">*</span></span>
                </label>
                <div className="relative flex items-center">
                  <Calendar className="w-5 h-5 absolute left-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={dobOrAge}
                    onChange={(e) => setDobOrAge(e.target.value)}
                    placeholder="e.g. 28 Years or 15/08/1998"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                    required
                  />
                </div>
              </div>

              {/* Gender (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center justify-between">
                  <span>Gender</span>
                  <span className="text-[11px] text-neutral-400 font-normal">Optional</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Preferred Language */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center justify-between">
                  <span>Preferred Language <span className="text-rozgo-700 dark:text-rozgo-400 font-black">*</span></span>
                  <span className="text-[11px] text-neutral-400 font-normal">For audio call & app texts</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {languageOptions.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setPreferredLang(opt.code);
                        setLanguage(opt.code);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col ${
                        preferredLang === opt.code
                          ? 'bg-rozgo-100 text-rozgo-900 dark:bg-rozgo-900/60 dark:text-white border-rozgo-900 dark:border-rozgo-400 font-bold shadow-xs'
                          : 'bg-neutral-50 dark:bg-darkbg-surface text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-darkbg-border hover:bg-neutral-100'
                      }`}
                    >
                      <span className="text-sm">{opt.nativeLabel}</span>
                      <span className="text-[11px] opacity-70 font-normal">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Photo (Upload from Device or Add Later) */}
              <div className="sm:col-span-2 p-5 rounded-3xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-black text-neutral-900 dark:text-white flex items-center gap-2">
                      <Upload className="w-4 h-4 text-rozgo-700 dark:text-rozgo-400" />
                      <span>Profile Photo</span>
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Upload an existing photo from your device, or choose to add it later.
                    </p>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-rozgo-900 hover:bg-rozgo-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-soft transition-all active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5 text-rozgo-200" />
                      <span>Upload Photo</span>
                    </button>

                    {customPhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setCustomPhotoUrl('')}
                        className="px-2.5 py-2 rounded-xl text-neutral-500 hover:text-red-600 text-xs font-semibold"
                        title="Remove uploaded photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Photo Preview or Add Later Status */}
                <div className="flex items-center gap-4 pt-1">
                  {customPhotoUrl ? (
                    <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-darkbg-card border border-rozgo-300 dark:border-rozgo-700 shadow-xs">
                      <img
                        src={customPhotoUrl}
                        alt="Preview"
                        className="w-14 h-14 rounded-xl object-cover border border-neutral-200"
                      />
                      <div>
                        <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Photo Attached
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          Ready for your ROZGO Labour profile
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-200 dark:bg-darkbg-card flex items-center justify-center text-neutral-500 dark:text-neutral-400 border border-neutral-300 dark:border-darkbg-border">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="font-bold text-neutral-700 dark:text-neutral-300">No custom photo selected.</span>
                        <span className="block text-[11px] text-neutral-400 mt-0.5">
                          We will assign a default avatar. You can change it anytime from your dashboard.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: Where do you work? (Location & Work Area) */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-neutral-100 dark:border-darkbg-border pb-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-rozgo-700 dark:text-rozgo-400">
                Step 2 of 3
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-1">
                Where do you work?
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Tell us your location and travel distance so ROZGO can match you with nearby employers.
              </p>
            </div>

            {/* Current Location Fields */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  Current Location
                </h3>
                <span className="text-xs text-rozgo-700 dark:text-rozgo-400 font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Exact address stays private
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* State */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    State <span className="text-rozgo-700">*</span>
                  </label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="e.g. Haryana, Delhi, Uttar Pradesh"
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                    required
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    District <span className="text-rozgo-700">*</span>
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Gurgaon, South Delhi, Lucknow"
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                    required
                  />
                </div>

                {/* City / Town / Village */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    City / Town / Village <span className="text-rozgo-700">*</span>
                  </label>
                  <input
                    type="text"
                    value={cityTownVillage}
                    onChange={(e) => setCityTownVillage(e.target.value)}
                    placeholder="e.g. Gurgaon (Sector 45), Rampur"
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                    required
                  />
                </div>

                {/* PIN Code */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    PIN Code <span className="text-rozgo-700">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 122003"
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white font-bold font-mono tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Work Area / Travel Distance */}
            <div className="pt-3 border-t border-neutral-100 dark:border-darkbg-border space-y-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  Work Area
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  How far are you willing to travel for work?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TRAVEL_RADIUS_OPTIONS.map((opt) => {
                  const isSelected = travelRadius === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTravelRadius(opt.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'bg-rozgo-100 text-rozgo-900 dark:bg-rozgo-900/60 dark:text-white border-rozgo-900 dark:border-rozgo-400 ring-2 ring-rozgo-900 dark:ring-rozgo-400 shadow-soft'
                          : 'bg-neutral-50 dark:bg-darkbg-surface text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-darkbg-border hover:bg-neutral-100'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'border-rozgo-900 dark:border-rozgo-300 bg-rozgo-900 dark:bg-rozgo-300'
                            : 'border-neutral-400 bg-transparent'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white dark:bg-darkbg-base" />}
                      </div>

                      <div>
                        <div className="text-sm font-black text-neutral-900 dark:text-white">
                          {opt.title}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                          {opt.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rozgo-700 dark:text-rozgo-400 flex-shrink-0" />
                <span>
                  <strong>Privacy First:</strong> Your exact street address is never shown publicly to employers. They only see your general locality and proximity distance.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: Skills, Experience & Availability */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-7">
            <div className="border-b border-neutral-100 dark:border-darkbg-border pb-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-rozgo-700 dark:text-rozgo-400">
                Step 3 of 3
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-1">
                Skills & Availability
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Select the trades you do, your detailed specific skills, years of experience, and regular working hours.
              </p>
            </div>

            {/* 4. WORKER — Skills: What work do you do? */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider">
                  What work do you do? <span className="text-rozgo-700">*</span>
                </label>
                <span className="text-xs text-rozgo-700 dark:text-rozgo-400 font-bold">
                  (Allow multiple selections)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {TRADES_LIST.map((item) => {
                  const isChecked = selectedTrades.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleTrade(item.id)}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                        isChecked
                          ? 'bg-rozgo-900 text-white border-rozgo-900 shadow-soft font-bold'
                          : 'bg-neutral-50 dark:bg-darkbg-surface text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-darkbg-border hover:bg-neutral-100'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          isChecked ? 'bg-white border-white text-rozgo-900' : 'border-neutral-400'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 text-rozgo-900 stroke-[3]" />}
                      </div>
                      <span className="text-xs sm:text-sm truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Specific Sub-skills based on selected trade(s) */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider">
                  Your Skills (Specific Tasks)
                </label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Select the specific jobs you can do. This ensures higher-paying and accurate employer matches:
                </p>
              </div>

              {selectedTrades.map((tradeId) => {
                const tradeMeta = TRADES_LIST.find((t) => t.id === tradeId);
                const subSkills = SUB_SKILLS_MAP[tradeId] || SUB_SKILLS_MAP['other'];
                return (
                  <div
                    key={tradeId}
                    className="p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border space-y-3"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rozgo-900 dark:text-rozgo-300">
                      <Briefcase className="w-4 h-4" />
                      <span>Specific skills for: {tradeMeta?.label || tradeId}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {subSkills.map((skill) => {
                        const isSkillChecked = selectedSubSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSubSkill(skill)}
                            className={`px-3 py-2 rounded-xl text-left text-xs font-bold border transition-all flex items-center gap-2 ${
                              isSkillChecked
                                ? 'bg-rozgo-100 text-rozgo-900 dark:bg-rozgo-900/60 dark:text-white border-rozgo-800'
                                : 'bg-white dark:bg-darkbg-card text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-darkbg-border hover:bg-neutral-100'
                            }`}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                                isSkillChecked
                                  ? 'bg-rozgo-900 border-rozgo-900 text-white'
                                  : 'border-neutral-300'
                              }`}
                            >
                              {isSkillChecked && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span className="truncate">{skill}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 5. EXPERIENCE */}
            <div className="space-y-4 pt-2 border-t border-neutral-100 dark:border-darkbg-border">
              <div>
                <label className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider">
                  How much experience do you have? <span className="text-rozgo-700">*</span>
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {EXPERIENCE_OPTIONS.map((exp) => {
                  const isSelected = experienceRange === exp;
                  return (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => setExperienceRange(exp)}
                      className={`p-3 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all flex flex-col items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-rozgo-900 text-white border-rozgo-900 shadow-soft'
                          : 'bg-neutral-50 dark:bg-darkbg-surface text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-darkbg-border hover:bg-neutral-100'
                      }`}
                    >
                      <Award className={`w-4 h-4 ${isSelected ? 'text-rozgo-200' : 'text-neutral-400'}`} />
                      <span>{exp}</span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center justify-between">
                  <span>Describe your experience</span>
                  <span className="text-[11px] text-neutral-400 font-normal">Optional</span>
                </label>
                <textarea
                  rows={2}
                  value={experienceDescription}
                  onChange={(e) => setExperienceDescription(e.target.value)}
                  placeholder="e.g. Worked 4 years on residential apartments doing bathroom piping, geyser installations and high-pressure pumps."
                  className="w-full px-4 py-2.5 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border text-neutral-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-rozgo-900"
                />
              </div>
            </div>

            {/* 6. WORK AVAILABILITY FOR TODAY */}
            <div className="space-y-4 pt-2 border-t border-neutral-100 dark:border-darkbg-border">
              <div>
                <label className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rozgo-700 dark:text-rozgo-400" />
                  <span>Availability For Today</span>
                </label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Are you available to take works and calls today?
                </p>
              </div>

              {/* Today Availability Choice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAvailableToday(true)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3.5 ${
                    availableToday
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500 shadow-soft'
                      : 'bg-neutral-50 dark:bg-darkbg-surface border-neutral-200 dark:border-darkbg-border hover:bg-neutral-100'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      availableToday
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-neutral-400'
                    }`}
                  >
                    {availableToday && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-neutral-900 dark:text-white">
                      Available Today
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Ready for immediate work and calls from employers today
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAvailableToday(false)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3.5 ${
                    !availableToday
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500 shadow-soft'
                      : 'bg-neutral-50 dark:bg-darkbg-surface border-neutral-200 dark:border-darkbg-border hover:bg-neutral-100'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      !availableToday
                        ? 'border-rose-600 bg-rose-600 text-white'
                        : 'border-neutral-400'
                    }`}
                  >
                    {!availableToday && <span className="text-xs font-bold">✕</span>}
                  </div>
                  <div>
                    <p className="text-sm font-black text-neutral-900 dark:text-white">
                      Not Available Today
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Resting or currently engaged (can update anytime later)
                    </p>
                  </div>
                </button>
              </div>

              {/* Time Slots for Today if available */}
              {availableToday && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Which time slot today? (Multiple select, or Full Day):
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {AVAILABILITY_SLOTS.map((slot) => {
                      const isChecked = usualAvailability.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => toggleAvailabilitySlot(slot)}
                          className={`p-3 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                            isChecked
                              ? 'bg-rozgo-100 text-rozgo-900 dark:bg-rozgo-900/60 dark:text-white border-rozgo-900 ring-1 ring-rozgo-900'
                              : 'bg-neutral-50 dark:bg-darkbg-surface text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-darkbg-border hover:bg-neutral-100'
                          }`}
                        >
                          <Clock className="w-4 h-4 text-rozgo-700 dark:text-rozgo-300" />
                          <span>{slot}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* STEP 4: Success & Verification Notice */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="text-center space-y-6 py-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-soft ring-8 ring-emerald-50 dark:ring-emerald-900/20">
              <CheckCircle2 className="w-12 h-12 text-emerald-700 dark:text-emerald-300" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Account Created Successfully ✓
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                Welcome to ROZGO, {fullName || 'Worker'}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                Your account has been created.
              </p>
            </div>

            {/* Profile Status Card: NOT VERIFIED */}
            <div className="p-6 rounded-3xl bg-amber-50/80 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-700/60 max-w-md mx-auto shadow-soft text-center space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Your profile is currently:
                </p>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-black text-sm tracking-wide border border-amber-300 dark:border-amber-700">
                  <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>NOT VERIFIED</span>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <Button
                  variant="primary"
                  size="xl"
                  fullWidth
                  className="!bg-[#123B32] hover:!bg-[#0D2B24] text-white shadow-md font-black"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  onClick={() => navigate('/worker/verify')}
                >
                  Verify My Profile
                </Button>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                  Verification helps employers know that you are a genuine worker.
                </p>
              </div>

              <div className="pt-2 border-t border-amber-200/80 dark:border-neutral-800">
                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-darkbg-border font-semibold"
                  onClick={() => navigate('/worker/dashboard')}
                >
                  Do This Later
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls for steps 1-3 */}
        {step <= 3 && (
          <div className="mt-8 pt-5 border-t border-neutral-100 dark:border-darkbg-border flex items-center justify-between">
            {step > 1 ? (
              <Button
                variant="outline"
                size="md"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={handleBack}
              >
                Back
              </Button>
            ) : (
              <Link
                to="/auth/create-account"
                className="text-xs font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Role Selection
              </Link>
            )}

            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={handleNext}
            >
              {step === 3 ? 'Complete Registration' : 'Next Step'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

