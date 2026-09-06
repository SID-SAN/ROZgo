import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  ShieldCheck,
  Building2,
  Home,
  Briefcase,
  HardHat,
  Users,
  MapPin,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Check,
  AlertCircle,
  Upload,
  X,
  Phone,
  Mail,
  Sparkles,
  Copy,
  Camera,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmployerType, WorkLocationItem } from '../../types';
import { authApi } from '../../api/authApi';
import logoImg from '../../assets/logo.png';

export const EmployerOnboardingPage: React.FC = () => {
  const { registerEmployer } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idDocInputRef = useRef<HTMLInputElement>(null);
  const businessDocInputRef = useRef<HTMLInputElement>(null);

  // Wizard Navigation: 1 to 6 (step 7 is completion screen)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formError, setFormError] = useState<string | null>(null);

  // STEP 1: Basic Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dobOrAge, setDobOrAge] = useState('');
  const [gender, setGender] = useState<string>('Not Specified');
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);

  // STEP 2: Contact Details & Account Setup
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // STEP 3: Employer Type
  const [employerType, setEmployerType] = useState<EmployerType>('individual');

  // STEP 4: Address & Work Location
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Gurgaon');
  const [stateName, setStateName] = useState('Haryana');
  const [pincode, setPincode] = useState('122001');
  const [isLocating, setIsLocating] = useState(false);
  const [extraLocations, setExtraLocations] = useState<WorkLocationItem[]>([]);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [newLocLabel, setNewLocLabel] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');
  const [newLocCity, setNewLocCity] = useState('');
  const [newLocPin, setNewLocPin] = useState('');

  // STEP 5: Identity & Business Verification
  const [identityType, setIdentityType] = useState<'aadhaar' | 'driving_license' | 'voter_id' | 'pan'>('aadhaar');
  const [identityNumber, setIdentityNumber] = useState('');
  const [idDocFileName, setIdDocFileName] = useState<string | null>(null);
  const [isIdVerified, setIsIdVerified] = useState(false);
  const [businessDocType, setBusinessDocType] = useState<'gstin' | 'shop_act' | 'msme' | 'society_reg'>('gstin');
  const [businessDocNumber, setBusinessDocNumber] = useState('');
  const [businessDocFileName, setBusinessDocFileName] = useState<string | null>(null);
  const [isBusinessVerified, setIsBusinessVerified] = useState(false);

  // STEP 6: Bio, Preferences & Review
  const [bio, setBio] = useState('');
  const [preferredCommunication, setPreferredCommunication] = useState<'call' | 'app' | 'whatsapp'>('call');
  const [languagesSpoken, setLanguagesSpoken] = useState<string[]>(['Hindi', 'English']);
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [agreedToCharter, setAgreedToCharter] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Completion State
  const [generatedEmployerId, setGeneratedEmployerId] = useState<string>('');
  const [copiedId, setCopiedId] = useState(false);


  const handleSimulateLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setCity('Gurgaon');
      setStateName('Haryana');
      setPincode('122002');
      if (!addressLine) {
        setAddressLine('Sector 43, Golf Course Road');
      }
      setIsLocating(false);
    }, 600);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setCustomPhotoUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleLanguage = (lang: string) => {
    setLanguagesSpoken((prev) => {
      if (prev.includes(lang)) {
        if (prev.length === 1) return prev;
        return prev.filter((l) => l !== lang);
      }
      return [...prev, lang];
    });
  };

  const handleAddExtraLocation = () => {
    if (!newLocAddress.trim() || !newLocCity.trim()) return;
    const newLoc: WorkLocationItem = {
      id: `loc-${Date.now()}`,
      label: newLocLabel.trim() || `Location ${extraLocations.length + 2}`,
      addressLine: newLocAddress.trim(),
      city: newLocCity.trim(),
      state: stateName,
      pincode: newLocPin.trim() || pincode,
      isDefault: false,
    };
    setExtraLocations((prev) => [...prev, newLoc]);
    setNewLocLabel('');
    setNewLocAddress('');
    setNewLocCity('');
    setNewLocPin('');
    setShowAddLocationModal(false);
  };

  const handleSimulateIdVerification = () => {
    if (!identityNumber.trim() || identityNumber.length < 4) {
      setFormError('Please enter a valid document number.');
      return;
    }
    setFormError(null);
    setIsIdVerified(true);
  };

  const handleSimulateBusinessVerification = () => {
    if (!businessDocNumber.trim() || businessDocNumber.length < 4) {
      setFormError('Please enter a valid business registration / GSTIN number.');
      return;
    }
    setFormError(null);
    setIsBusinessVerified(true);
  };

  const validateStep = (step: number): boolean => {
    setFormError(null);
    if (step === 1) {
      if (!firstName.trim()) {
        setFormError('Please enter your first name.');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (phone.length !== 10) {
        setFormError('Please enter a valid 10-digit mobile number.');
        return false;
      }
      if (password.length < 4) {
        setFormError('Password must be at least 4 characters.');
        return false;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match.');
        return false;
      }
      return true;
    }
    if (step === 3) {
      // Employer Category selection
      return true;
    }
    if (step === 4) {
      if (!city.trim() || !stateName.trim()) {
        setFormError('Please provide your city and state.');
        return false;
      }
      return true;
    }
    if (step === 5) {
      // Trust & Verification is optional/skippable
      return true;
    }
    if (step === 6) {
      if (!agreedToCharter) {
        setFormError('Please agree to the ROZGO Direct Payment & Fair Wage Charter.');
        return false;
      }
      if (!agreedToTerms) {
        setFormError('Please accept the Terms of Service & Privacy Policy.');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setFormError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteRegistration = async () => {
    if (!validateStep(6)) return;

    const fullEmployerName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const displayLocation = [addressLine.split(',')[0], city, stateName].filter(Boolean).join(', ') || `${city}, ${stateName}`;

    const defaultLoc: WorkLocationItem = {
      id: 'loc-primary',
      label: 'Primary Location',
      addressLine: addressLine || city,
      landmark: landmark || undefined,
      city,
      state: stateName,
      pincode,
      isDefault: true,
    };

    const isVerified = isIdVerified || isBusinessVerified;

    try {
      const newEmployerId = await registerEmployer({
        name: fullEmployerName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: `+91 ${phone}`,
        email: email.trim() || undefined,
        password,
        dobOrAge: dobOrAge || undefined,
        gender,
        avatar: customPhotoUrl || undefined,
        employerType,
        location: displayLocation,
        workLocations: [defaultLoc, ...extraLocations],
        hiringPreferences: {
          frequentlyNeededTrades: ['plumber', 'electrician'],
          hiringFrequency: 'occasional',
          workersUsuallyNeeded: '1',
          preferredWorkTimes: ['Flexible'],
        },
        bio: bio.trim() || undefined,
        preferredCommunication,
        languagesSpoken,
        emergencyContactName: emergencyContactName.trim() || undefined,
        emergencyContactPhone: emergencyContactPhone.trim() || undefined,
        verificationDetails: {
          mobileVerified: true,
          identityVerified: isIdVerified,
          identityType: isIdVerified ? identityType : undefined,
          identityMasked: isIdVerified ? `XXXX XXXX ${identityNumber.slice(-4) || '8219'}` : undefined,
          businessVerified: isBusinessVerified,
          businessDocType: isBusinessVerified ? businessDocType : undefined,
          businessDocNumber: isBusinessVerified ? businessDocNumber : undefined,
          status: isVerified ? 'verified' : 'not_verified',
        },
      });

      setGeneratedEmployerId(newEmployerId);
      setCurrentStep(7); // Move to completion screen
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setFormError(err.message || 'Registration failed. Please try again.');
    }
  };

  const copyEmployerId = () => {
    if (generatedEmployerId) {
      navigator.clipboard.writeText(generatedEmployerId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Step Progress Calculation (6 steps total)
  const progressPercent = Math.min(Math.round(((currentStep - 1) / 5) * 100), 100);

  return (
    <div className="min-h-screen bg-[#fafcfa] dark:bg-darkbg-base py-8 px-4 sm:px-6 lg:px-8 text-left transition-colors">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Brand Header with centered official logo */}
        <div className="text-center space-y-3 mb-6">
          <Link to="/" className="inline-block group" title="Return to Home">
            <div className="w-full max-w-[280px] sm:max-w-[320px] p-4 sm:p-5 rounded-3xl bg-white shadow-soft border border-neutral-200/90 dark:border-neutral-700 transition-all group-hover:scale-[1.03] mx-auto">
              <img
                src={logoImg}
                alt="ROZGO - Rozgaar Ka Naya Raasta"
                className="h-20 sm:h-24 w-auto max-w-[260px] sm:max-w-[300px] object-contain mx-auto"
              />
            </div>
          </Link>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-rozgo-700 dark:text-rozgo-400 bg-rozgo-100 dark:bg-rozgo-900/40 px-3 py-1 rounded-full">
              Employer Registration
            </span>
          </div>
          <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            Already registered?{' '}
            <Link
              to="/auth/login?role=employer"
              className="font-bold text-rozgo-900 dark:text-rozgo-300 underline hover:opacity-80"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Wizard Progress Header (Steps 1 to 6) */}
        {currentStep < 7 && (
          <div className="space-y-3 bg-white dark:bg-darkbg-surface p-4 sm:p-5 rounded-3xl border border-neutral-200/90 dark:border-darkbg-border shadow-xs">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-rozgo-900 dark:text-rozgo-300">
                Step {currentStep} of 6: {
                  currentStep === 1 ? 'Basic Details' :
                  currentStep === 2 ? 'Mobile & Contact' :
                  currentStep === 3 ? 'Employer Category' :
                  currentStep === 4 ? 'Location & Address' :
                  currentStep === 5 ? 'Trust & Verification' :
                  'Profile Bio & Review'
                }
              </span>
              <span className="text-neutral-500 font-semibold">{progressPercent}% Completed</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rozgo-900 dark:bg-rozgo-500 transition-all duration-300 ease-out"
                style={{ width: `${Math.max(progressPercent, 16)}%` }}
              />
            </div>

            {/* Step Pills on Desktop */}
            <div className="hidden sm:grid grid-cols-6 gap-1 pt-1 text-[11px] font-bold text-neutral-400 text-center">
              <span className={currentStep >= 1 ? 'text-rozgo-900 dark:text-rozgo-300' : ''}>1. Basic</span>
              <span className={currentStep >= 2 ? 'text-rozgo-900 dark:text-rozgo-300' : ''}>2. Contact</span>
              <span className={currentStep >= 3 ? 'text-rozgo-900 dark:text-rozgo-300' : ''}>3. Category</span>
              <span className={currentStep >= 4 ? 'text-rozgo-900 dark:text-rozgo-300' : ''}>4. Location</span>
              <span className={currentStep >= 5 ? 'text-rozgo-900 dark:text-rozgo-300' : ''}>5. Verify</span>
              <span className={currentStep >= 6 ? 'text-rozgo-900 dark:text-rozgo-300' : ''}>6. Review</span>
            </div>
          </div>
        )}

        {/* Global Form Error Banner */}
        {formError && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center gap-3 text-red-700 dark:text-red-300 text-sm font-semibold animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* STEP 1: Basic Details */}
        {currentStep === 1 && (
          <Card variant="elevated" padding="lg" className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Basic Information</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Tell us your name and details so workers can address you with respect.
              </p>
            </div>

            {/* Photo Upload (Only Button + Preview, No Avatar selector) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Profile Photo (Optional)
              </label>
              <div className="flex items-center gap-4">
                {customPhotoUrl ? (
                  <div className="relative">
                    <img
                      src={customPhotoUrl}
                      alt="Uploaded preview"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-rozgo-900 shadow-soft"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomPhotoUrl(null)}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700"
                      title="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-darkbg-surface border-2 border-dashed border-neutral-300 dark:border-darkbg-border flex flex-col items-center justify-center text-neutral-400">
                    <Camera className="w-7 h-7" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={<Upload className="w-4 h-4" />}
                  >
                    {customPhotoUrl ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  <p className="text-[11px] text-neutral-500">
                    JPG, PNG or WEBP. Max 5MB.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Rahul"
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-neutral-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-rozgo-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Sharma"
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-neutral-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-rozgo-900"
                />
              </div>
            </div>

            {/* DOB / Age and Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Age / Date of Birth (Optional)
                </label>
                <input
                  type="text"
                  value={dobOrAge}
                  onChange={(e) => setDobOrAge(e.target.value)}
                  placeholder="e.g. 35 years or DD/MM/YYYY"
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-neutral-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-rozgo-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Gender (Optional)
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-neutral-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-rozgo-900"
                >
                  <option value="Not Specified">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button variant="primary" size="lg" onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Continue to Contact Details
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 2: Contact Details & Account Setup */}
        {currentStep === 2 && (
          <Card variant="elevated" padding="lg" className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Account Setup</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Enter your mobile number and set a password. Your phone number connects you directly to local workers.
              </p>
            </div>

            {/* Phone Number Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                10-Digit Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="flex items-center px-3.5 py-3 rounded-2xl bg-neutral-100 dark:bg-darkbg-surface border border-neutral-300 dark:border-darkbg-border text-neutral-700 dark:text-neutral-300 font-bold text-sm">
                  +91
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    setPhone(clean);
                  }}
                  placeholder="98111 88234"
                  className="flex-1 px-4 py-3 rounded-2xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-neutral-900 dark:text-white font-bold text-lg tracking-wider focus:outline-hidden focus:ring-2 focus:ring-rozgo-900"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-neutral-900 dark:text-white font-mono text-base tracking-widest focus:outline-hidden focus:ring-2 focus:ring-rozgo-900"
                  required
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-neutral-900 dark:text-white font-mono text-base tracking-widest focus:outline-hidden focus:ring-2 focus:ring-rozgo-900"
                  required
                />
              </div>
            </div>



            {/* Email Address */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                <span>Email Address (Optional)</span>
                <span className="text-neutral-400 text-[11px] font-normal">For receipts & dispute summaries</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul.sharma@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-neutral-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-rozgo-900"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-darkbg-border">
              <Button variant="outline" size="md" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button variant="primary" size="lg" onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Continue to Category
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 3: Employer Type (Cards Only, NO category details card) */}
        {currentStep === 3 && (
          <Card variant="elevated" padding="lg" className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Employer Category</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Select who you are hiring for. This tailors worker matching and booking agreements to your needs.
              </p>
            </div>

            {/* Employer Type Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'individual',
                  title: 'Individual / Household',
                  desc: 'Homeowner, tenant, family hiring for personal residence',
                  icon: Home,
                },
                {
                  id: 'business',
                  title: 'Shop / Small Business',
                  desc: 'Retail store, grocery, workshop, repair store, salon',
                  icon: Building2,
                },
                {
                  id: 'company',
                  title: 'Office / Company',
                  desc: 'Corporate office, commercial building, tech enterprise',
                  icon: Briefcase,
                },
                {
                  id: 'contractor',
                  title: 'Building Contractor',
                  desc: 'Civil contractor, renovation, painting, fabrication team',
                  icon: HardHat,
                },
                {
                  id: 'property_manager',
                  title: 'Property / Society Manager',
                  desc: 'Residential welfare association, facility management',
                  icon: Users,
                },
                {
                  id: 'other',
                  title: 'Other Individual / Entity',
                  desc: 'Freelance project manager, event organizer, institution',
                  icon: Sparkles,
                },
              ].map((item) => {
                const IconComp = item.icon;
                const isSelected = employerType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEmployerType(item.id as EmployerType)}
                    className={`p-4 rounded-2xl text-left border-2 transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-rozgo-900 dark:border-rozgo-400 bg-rozgo-50/70 dark:bg-darkbg-card shadow-xs'
                        : 'border-neutral-200 dark:border-darkbg-border bg-white dark:bg-darkbg-surface hover:border-neutral-300'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-rozgo-900 text-white dark:bg-rozgo-400 dark:text-neutral-900'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                        <span>{item.title}</span>
                        {isSelected && <Check className="w-4 h-4 text-rozgo-900 dark:text-rozgo-300" />}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-snug">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-darkbg-border">
              <Button variant="outline" size="md" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button variant="primary" size="lg" onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Continue to Location
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 4: Address & Work Location (NO 'Where do you typically need workers?' card) */}
        {currentStep === 4 && (
          <Card variant="elevated" padding="lg" className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Location & Work Sites</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Tell us where you usually need workers. This matches nearby available workers within 5–10 km.
              </p>
            </div>

            {/* Privacy Shield Notice */}
            <div className="p-4 rounded-2xl bg-rozgo-50 dark:bg-darkbg-surface border border-rozgo-200 dark:border-darkbg-border flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-rozgo-700 dark:text-rozgo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1">
                <span className="font-bold text-neutral-900 dark:text-white block">
                  Strict Address Privacy Guarantee
                </span>
                <p>
                  Your exact street and house address is never displayed on public searches. Workers only see your general colony / area (e.g. &quot;Sushant Lok 1, Gurgaon&quot;) until you both confirm a booking agreement.
                </p>
              </div>
            </div>

            {/* Address Inputs with Use Current Location button */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Primary Address / Area
                </label>
                <button
                  type="button"
                  onClick={handleSimulateLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rozgo-900 dark:text-rozgo-300 hover:underline"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{isLocating ? 'Detecting...' : '📍 Use My Current Location'}</span>
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Flat / Villa / Shop No., Building Name, Street / Sector"
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-neutral-900 dark:text-white font-semibold"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City (e.g. Gurgaon)"
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-neutral-900 dark:text-white font-semibold"
                  />
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="State (e.g. Haryana)"
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-neutral-900 dark:text-white font-semibold"
                  />
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="PIN Code"
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-neutral-900 dark:text-white font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Saved Extra Work Locations */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Additional Work Sites ({extraLocations.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddLocationModal(true)}
                  className="text-xs font-bold text-rozgo-900 dark:text-rozgo-300 hover:underline"
                >
                  + Add Work Location
                </button>
              </div>

              {extraLocations.length > 0 && (
                <div className="space-y-2">
                  {extraLocations.map((loc) => (
                    <div
                      key={loc.id}
                      className="p-3 rounded-xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-neutral-900 dark:text-white">{loc.label}: </span>
                        <span className="text-neutral-600 dark:text-neutral-400">{loc.addressLine}, {loc.city}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExtraLocations((prev) => prev.filter((l) => l.id !== loc.id))}
                        className="text-red-600 hover:text-red-700 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Location Modal */}
            {showAddLocationModal && (
              <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-darkbg-surface border border-neutral-300 dark:border-darkbg-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-neutral-900 dark:text-white">Add Secondary Work Site</span>
                  <button type="button" onClick={() => setShowAddLocationModal(false)}>
                    <X className="w-4 h-4 text-neutral-500" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Location Label (e.g. Branch Store / Sector 57 Site)"
                  value={newLocLabel}
                  onChange={(e) => setNewLocLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border"
                />
                <input
                  type="text"
                  placeholder="Street / Colony Address"
                  value={newLocAddress}
                  onChange={(e) => setNewLocAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={newLocCity}
                    onChange={(e) => setNewLocCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border"
                  />
                  <input
                    type="text"
                    placeholder="PIN Code"
                    value={newLocPin}
                    onChange={(e) => setNewLocPin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setShowAddLocationModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleAddExtraLocation}>
                    Save Location
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-darkbg-border">
              <Button variant="outline" size="md" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button variant="primary" size="lg" onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Continue to Verification
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 5: Document Upload */}
        {currentStep === 5 && (
          <Card variant="elevated" padding="lg" className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Document Verification</h2>
                <Badge variant={idDocFileName ? 'verified' : 'secondary'} size="md">
                  {idDocFileName ? '✓ Document Uploaded' : 'Optional'}
                </Badge>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Upload your ID or business proof document (Aadhaar, PAN, Voter ID, GSTIN, etc.) to get a verified badge.
              </p>
            </div>

            {/* Simple Upload Section */}
            <div className="p-8 sm:p-10 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-rozgo-700 dark:hover:border-rozgo-500 transition-colors text-center space-y-4 bg-neutral-50/50 dark:bg-darkbg-card">
              <input
                type="file"
                ref={idDocInputRef}
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setIdDocFileName(file.name);
                    setIsIdVerified(true);
                  }
                }}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-full bg-rozgo-100 dark:bg-rozgo-950/60 text-rozgo-800 dark:text-rozgo-300 flex items-center justify-center mx-auto shadow-xs">
                <Upload className="w-8 h-8" />
              </div>

              {idDocFileName ? (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="truncate max-w-xs">{idDocFileName}</span>
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => idDocInputRef.current?.click()}
                    >
                      Change Document
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:text-rose-700"
                      onClick={() => {
                        setIdDocFileName(null);
                        setIsIdVerified(false);
                        if (idDocInputRef.current) idDocInputRef.current.value = '';
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Button
                      variant="primary"
                      size="lg"
                      className="!bg-[#123B32] hover:!bg-[#0D2B24] text-white font-bold"
                      onClick={() => idDocInputRef.current?.click()}
                      leftIcon={<Upload className="w-5 h-5" />}
                    >
                      Upload Document
                    </Button>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Supports JPG, PNG, or PDF (Max 5MB)
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-darkbg-border">
              <Button variant="outline" size="md" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <div className="flex gap-2">
                {!idDocFileName && (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => handleNext()}
                  >
                    Skip for Now
                  </Button>
                )}
                <Button variant="primary" size="lg" onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Continue to Final Review
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 6: Bio, Preferences & Review */}
        {currentStep === 6 && (
          <Card variant="elevated" padding="lg" className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Review & Complete</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                A brief introduction helps workers get to know you. Please review your account details before creating.
              </p>
            </div>

            {/* Bio / Intro */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Brief Introduction / About You (Optional)
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Homeowner in Sushant Lok seeking reliable plumbers & electricians. We treat workers respectfully and provide drinking water and tea."
                className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-darkbg-border bg-white dark:bg-darkbg-surface text-neutral-900 dark:text-white font-medium text-sm leading-relaxed"
              />
            </div>



            {/* Summary Review Card */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-darkbg-surface border border-neutral-200 dark:border-darkbg-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Account Summary</span>
                <span className="text-xs font-bold text-rozgo-900 dark:text-rozgo-300">
                  {isIdVerified ? '✓ Identity Verified' : 'Mobile Verified ✓'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-neutral-400 block">Employer</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{firstName} {lastName}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Phone</span>
                  <span className="font-bold text-neutral-900 dark:text-white">+91 {phone}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Type</span>
                  <span className="font-bold text-neutral-900 dark:text-white capitalize">{employerType}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Location</span>
                  <span className="font-bold text-neutral-900 dark:text-white truncate">{city}, {stateName}</span>
                </div>
              </div>
            </div>

            {/* Agreements and Charters */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToCharter}
                  onChange={(e) => setAgreedToCharter(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded-md border-neutral-300 text-rozgo-900 focus:ring-rozgo-900"
                />
                <span className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  I pledge to uphold the <strong>ROZGO Fair Wage & Dignity Charter</strong>: negotiating fair market wages directly over phone calls, paying promptly upon work completion with zero middleman deductions, and ensuring a safe work environment.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded-md border-neutral-300 text-rozgo-900 focus:ring-rozgo-900"
                />
                <span className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  I agree to the ROZGO Terms of Service, Privacy Policy, and understand that my exact street address is kept protected until a booking agreement is accepted.
                </span>
              </label>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-darkbg-border">
              <Button variant="outline" size="md" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleCompleteRegistration}
                rightIcon={<Check className="w-4 h-4" />}
                className="bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                Create Employer Account
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 7: Success Screen */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-fadeIn text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-soft">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Account Created Successfully ✓
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
                Welcome to ROZGO, {firstName}!
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
                Your employer profile is active. You can now connect directly with skilled local workers, agree on fair wages with zero platform cuts, and hire with confidence.
              </p>
            </div>

            {/* Prominent Employer ID Card */}
            <Card
              variant="elevated"
              padding="lg"
              className="max-w-md mx-auto border-2 border-rozgo-900 dark:border-rozgo-400 bg-rozgo-50/50 dark:bg-darkbg-surface text-center space-y-4"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Your Official ROZGO Employer ID
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-black font-mono text-rozgo-900 dark:text-rozgo-300 tracking-wider">
                    {generatedEmployerId}
                  </span>
                  <button
                    type="button"
                    onClick={copyEmployerId}
                    className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
                    title="Copy Employer ID"
                  >
                    {copiedId ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                {copiedId && <span className="text-xs text-emerald-600 font-bold block">Copied to clipboard!</span>}
              </div>

              <div className="pt-2 flex items-center justify-center gap-2">
                <Badge variant={isIdVerified ? 'verified' : 'secondary'} size="md">
                  {isIdVerified ? '✓ Verified Employer' : '⚠ Mobile Verified Only'}
                </Badge>
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                  {employerType === 'individual' ? 'Household Employer' : `${employerType} Employer`}
                </span>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate('/employer')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Find & Hire Workers Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => navigate('/employer/profile')}
              >
                View Employer Profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
