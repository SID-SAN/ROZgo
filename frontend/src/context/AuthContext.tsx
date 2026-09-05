import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  WorkerProfile,
  EmployerProfile,
  EmployerType,
  WorkLocationItem,
  EmployerHiringPreferences,
  EmployerVerificationDetails,
} from '../types';
import { MOCK_WORKERS } from '../data/mockWorkers';
import { verificationQueueService } from '../services/verificationService';

export interface EmployerRegistrationData {
  name: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  email?: string;
  dobOrAge?: string;
  gender?: string;
  avatar?: string;
  employerType: EmployerType;
  hiringPurpose?: string;
  businessName?: string;
  businessType?: string;
  employeeCount?: string;
  designation?: string;
  contractorWorkTypes?: string[];
  typicalWorkersNeeded?: string[];
  propertyUnitsCount?: string;
  propertyType?: 'residential' | 'commercial' | 'both';
  location: string;
  workLocations?: WorkLocationItem[];
  hiringPreferences?: EmployerHiringPreferences;
  bio?: string;
  preferredCommunication?: 'call' | 'app' | 'whatsapp';
  languagesSpoken?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  verificationDetails?: Partial<EmployerVerificationDetails>;
}

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isLoggedIn: boolean;
  workerUser: WorkerProfile;
  employerUser: EmployerProfile;
  loginAsWorker: (customPhone?: string) => void;
  loginAsEmployer: (customPhone?: string) => void;
  logout: () => void;
  registerWorker: (data: {
    name: string;
    phone: string;
    location: string;
    primarySkill: string;
    experienceYears: number;
    aadhaarLast4?: string;
    dobOrAge?: string;
    gender?: string;
    preferredLanguage?: string;
    state?: string;
    district?: string;
    city?: string;
    pincode?: string;
    travelRadius?: '2km' | '5km' | '10km' | 'nearby';
    selectedTrades?: string[];
    subSkills?: string[];
    experienceRange?: string;
    experienceDescription?: string;
    usualAvailability?: string[];
    availableToday?: boolean;
    avatar?: string;
  }) => string; // returns generated labour number
  updateWorkerProfile: (updates: Partial<WorkerProfile>) => void;
  submitWorkerVerification: (params: {
    method: WorkerProfile['verificationMethod'] extends undefined ? 'aadhaar' : NonNullable<WorkerProfile['verificationMethod']>;
    idType?: string;
    maskedIdentifier: string;
    frontPhoto?: string;
    backPhoto?: string;
    selfiePhoto?: string;
  }) => void;
  adminApproveWorker: (workerId: string, applicationId?: string) => string;
  adminRejectWorker: (workerId: string, reason: string, applicationId?: string) => void;
  adminRequestPhotoWorker: (workerId: string, reason: string, applicationId?: string) => void;
  resetWorkerVerificationDemo: () => void;
  registerEmployer: (data: EmployerRegistrationData) => string; // returns generated RZE-XXXXXX
  updateEmployerProfile: (updates: Partial<EmployerProfile>) => void;
  submitEmployerVerification: (params: {
    identityType?: 'aadhaar' | 'driving_license' | 'voter_id' | 'pan';
    identityMasked?: string;
    identityDocUrl?: string;
    businessDocType?: 'gstin' | 'shop_act' | 'msme' | 'society_reg';
    businessDocNumber?: string;
    businessDocUrl?: string;
  }) => void;
}

const defaultWorker = MOCK_WORKERS[0]; // Amit Kumar (Plumber, RZG-849201)

const defaultEmployer: EmployerProfile = {
  id: 'e1',
  employerId: 'RZE-204821',
  name: 'Rahul Sharma',
  firstName: 'Rahul',
  lastName: 'Sharma',
  phone: '+91 98111 88234',
  email: 'rahul.sharma@example.com',
  dobOrAge: '38 years',
  gender: 'Male',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  employerType: 'individual',
  hiringPurpose: 'Home maintenance and renovation',
  location: 'Sushant Lok 1, Gurgaon',
  workLocations: [
    {
      id: 'loc-1',
      label: 'Primary Residence',
      addressLine: 'Villa 42, Block B, Sushant Lok Phase 1',
      landmark: 'Near Vyapar Kendra',
      city: 'Gurgaon',
      state: 'Haryana',
      pincode: '122009',
      isDefault: true,
    },
    {
      id: 'loc-2',
      label: 'Rental Apartment',
      addressLine: 'Flat 702, Maple Heights, DLF Phase 4',
      landmark: 'Opposite Galleria',
      city: 'Gurgaon',
      state: 'Haryana',
      pincode: '122002',
      isDefault: false,
    },
  ],
  hiringPreferences: {
    frequentlyNeededTrades: ['plumber', 'electrician', 'carpenter', 'painter'],
    hiringFrequency: 'occasional',
    workersUsuallyNeeded: '1',
    preferredWorkTimes: ['Morning', 'Afternoon'],
  },
  bio: 'Homeowner in Gurgaon seeking reliable, skilled tradespeople for residential maintenance. We value punctuality, fair direct payments, and transparent communication.',
  preferredCommunication: 'call',
  languagesSpoken: ['Hindi', 'English', 'Punjabi'],
  emergencyContactName: 'Pooja Sharma',
  emergencyContactPhone: '+91 98111 77332',
  memberSince: 'January 2024',
  totalBookings: 14,
  rating: 4.9,
  ratingBreakdown: {
    professionalism: 4.9,
    clarityOfScope: 4.8,
    paymentReliability: 5.0,
    workplaceSafety: 4.9,
  },
  reviews: [
    {
      id: 'rev-1',
      workerName: 'Amit Kumar',
      workerSkill: 'Plumber',
      workerLabourId: 'RZG-849201',
      rating: 5,
      comment: 'Excellent customer. Rahul ji explained the bathroom piping leakage clearly over call. Paid the agreed wage immediately upon completion.',
      date: '18 Aug 2024',
      jobTitle: 'Bathroom Pipeline & Flush Valve Replacement',
    },
    {
      id: 'rev-2',
      workerName: 'Rajesh Verma',
      workerSkill: 'Electrician',
      workerLabourId: 'RZG-419032',
      rating: 5,
      comment: 'Very polite family, gave tea and provided all materials. Fair wage agreement and prompt direct UPI payment.',
      date: '2 Jul 2024',
      jobTitle: 'MCB Trip & Balcony Light Wiring',
    },
    {
      id: 'rev-3',
      workerName: 'Sanjay Mistri',
      workerSkill: 'Carpenter',
      workerLabourId: 'RZG-620194',
      rating: 4.8,
      comment: 'Straightforward work requirements, respectful environment. Will be happy to work again.',
      date: '14 May 2024',
      jobTitle: 'Modular Wardrobe Hinge Repair',
    },
  ],
  completedBookings: [
    {
      id: 'cb-1',
      bookingNumber: 'RZG-BK-8102',
      workerId: 'w1',
      workerName: 'Amit Kumar',
      workerTrade: 'plumber',
      workerLabourId: 'RZG-849201',
      workerPhone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80',
      completedDate: '18 Aug 2024',
      wagePaid: 850,
      location: 'Sushant Lok 1, Gurgaon',
    },
    {
      id: 'cb-2',
      bookingNumber: 'RZG-BK-7491',
      workerId: 'w2',
      workerName: 'Rajesh Verma',
      workerTrade: 'electrician',
      workerLabourId: 'RZG-419032',
      workerPhone: '+91 98765 43211',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
      completedDate: '2 Jul 2024',
      wagePaid: 700,
      location: 'Sushant Lok 1, Gurgaon',
    },
    {
      id: 'cb-3',
      bookingNumber: 'RZG-BK-6302',
      workerId: 'w3',
      workerName: 'Sanjay Mistri',
      workerTrade: 'carpenter',
      workerLabourId: 'RZG-620194',
      workerPhone: '+91 98765 43212',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
      completedDate: '14 May 2024',
      wagePaid: 1200,
      location: 'DLF Phase 4, Gurgaon',
    },
  ],
  isVerified: true,
  verificationStatus: 'verified',
  verificationDetails: {
    mobileVerified: true,
    identityVerified: true,
    identityType: 'aadhaar',
    identityMasked: 'XXXX XXXX 6821',
    status: 'verified',
    submittedAt: '15 Jan 2024',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('rozgo_role') as UserRole;
    return saved === 'worker' || saved === 'employer' ? saved : 'employer';
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('rozgo_logged_in') === 'true';
  });

  const [workerUser, setWorkerUser] = useState<WorkerProfile>(() => {
    const saved = localStorage.getItem('rozgo_worker_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return defaultWorker;
  });

  const [employerUser, setEmployerUser] = useState<EmployerProfile>(() => {
    const saved = localStorage.getItem('rozgo_employer_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultEmployer,
          ...parsed,
          employerId: parsed.employerId || defaultEmployer.employerId,
          ratingBreakdown: parsed.ratingBreakdown || defaultEmployer.ratingBreakdown,
          workLocations: parsed.workLocations && parsed.workLocations.length > 0 ? parsed.workLocations : defaultEmployer.workLocations,
          hiringPreferences: parsed.hiringPreferences || defaultEmployer.hiringPreferences,
          completedBookings: parsed.completedBookings || defaultEmployer.completedBookings,
          reviews: parsed.reviews || defaultEmployer.reviews,
        };
      } catch {
        // fallback
      }
    }
    return defaultEmployer;
  });

  useEffect(() => {
    localStorage.setItem('rozgo_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('rozgo_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('rozgo_worker_profile', JSON.stringify(workerUser));
  }, [workerUser]);

  useEffect(() => {
    localStorage.setItem('rozgo_employer_profile', JSON.stringify(employerUser));
  }, [employerUser]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const loginAsWorker = (phone?: string) => {
    setIsLoggedIn(true);
    setRoleState('worker');
    if (phone) {
      setWorkerUser((prev) => ({ ...prev, phone }));
    }
  };

  const loginAsEmployer = (phone?: string) => {
    setIsLoggedIn(true);
    setRoleState('employer');
    if (phone) {
      setEmployerUser((prev) => ({ ...prev, phone }));
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const registerWorker = (data: {
    name: string;
    phone: string;
    location: string;
    primarySkill: string;
    experienceYears: number;
    aadhaarLast4?: string;
    dobOrAge?: string;
    gender?: string;
    preferredLanguage?: string;
    state?: string;
    district?: string;
    city?: string;
    pincode?: string;
    travelRadius?: '2km' | '5km' | '10km' | 'nearby';
    selectedTrades?: string[];
    subSkills?: string[];
    experienceRange?: string;
    experienceDescription?: string;
    usualAvailability?: string[];
    availableToday?: boolean;
    avatar?: string;
  }): string => {
    // Generate unique ROZGO Labour Number: RZG-XXXXXX
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const labourNumber = `RZG-${randomDigits}`;

    const newProfile: WorkerProfile = {
      id: `w-${Date.now()}`,
      // ROZGO number will only be issued once verification is complete
      labourNumber: undefined,
      name: data.name || 'Worker',
      phone: data.phone || '+91 98765 43210',
      avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
      location: data.location || [data.city, data.state].filter(Boolean).join(', ') || 'Gurgaon, Haryana',
      distanceKm: 1.5,
      primarySkill: data.primarySkill || (data.selectedTrades && data.selectedTrades[0]) || 'plumber',
      skills: data.subSkills && data.subSkills.length > 0 ? data.subSkills : (data.selectedTrades || ['plumber']),
      experienceYears: data.experienceYears || 3,
      rating: 5.0,
      completedJobsCount: 0,
      isVerified: false,
      verificationStatus: 'not_verified',
      verifiedItems: {
        mobile: true,
        identity: false,
        eshram: false,
        certificate: false,
      },
      availability: data.availableToday === false ? 'Busy' : 'Available Today',
      joinedDate: 'Just now',
      bio: data.experienceDescription || `Professional ${data.primarySkill || 'worker'} registered on ROZGO.`,
      reviews: [],
      dobOrAge: data.dobOrAge,
      gender: data.gender,
      preferredLanguage: data.preferredLanguage,
      state: data.state,
      district: data.district,
      city: data.city,
      pincode: data.pincode,
      travelRadius: data.travelRadius,
      selectedTrades: data.selectedTrades,
      subSkills: data.subSkills,
      experienceRange: data.experienceRange,
      experienceDescription: data.experienceDescription,
      usualAvailability: data.usualAvailability,
      availableToday: data.availableToday,
    };

    setWorkerUser(newProfile);
    setIsLoggedIn(true);
    setRoleState('worker');
    return labourNumber;
  };

  const updateWorkerProfile = (updates: Partial<WorkerProfile>) => {
    setWorkerUser((prev) => ({ ...prev, ...updates }));
  };

  const submitWorkerVerification = (params: {
    method: 'aadhaar' | 'eshram' | 'other_id';
    idType?: string;
    maskedIdentifier: string;
    frontPhoto?: string;
    backPhoto?: string;
    selfiePhoto?: string;
  }) => {
    verificationQueueService.submitApplication({
      workerId: workerUser.id,
      workerName: workerUser.name,
      workerPhone: workerUser.phone,
      method: params.method,
      idType: params.idType,
      maskedIdentifier: params.maskedIdentifier,
      frontDocumentUrl: params.frontPhoto,
      backDocumentUrl: params.backPhoto,
      selfieUrl: params.selfiePhoto,
    });

    const nowFormatted = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    setWorkerUser((prev) => ({
      ...prev,
      verificationStatus: 'in_progress',
      verificationMethod: params.method,
      verificationSubmittedAt: nowFormatted,
      verificationDetails: {
        aadhaarMasked: params.method === 'aadhaar' ? params.maskedIdentifier : undefined,
        uanNumber: params.method === 'eshram' ? params.maskedIdentifier : undefined,
        idType: params.idType,
        frontPhoto: params.frontPhoto,
        backPhoto: params.backPhoto,
        selfiePhoto: params.selfiePhoto,
        failureReason: undefined,
      },
    }));
  };

  const adminApproveWorker = (workerId: string, applicationId?: string): string => {
    const res = applicationId
      ? verificationQueueService.approveApplication(applicationId)
      : { success: true, labourNumber: `RZG-${Math.floor(100000 + Math.random() * 900000)}` };

    const labourNo = res.labourNumber || `RZG-${Math.floor(100000 + Math.random() * 900000)}`;

    setWorkerUser((prev) => {
      if (prev.id === workerId || workerId === 'current' || prev.name === 'Amit Kumar') {
        return {
          ...prev,
          isVerified: true,
          verificationStatus: 'verified',
          labourNumber: labourNo,
          verifiedItems: {
            mobile: true,
            identity: true,
            eshram: prev.verificationMethod === 'eshram',
            certificate: false,
          },
        };
      }
      return prev;
    });

    return labourNo;
  };

  const adminRejectWorker = (workerId: string, reason: string, applicationId?: string) => {
    if (applicationId) {
      verificationQueueService.rejectApplication(applicationId, reason);
    }
    setWorkerUser((prev) => {
      if (prev.id === workerId || workerId === 'current' || prev.name === 'Amit Kumar') {
        return {
          ...prev,
          isVerified: false,
          verificationStatus: 'failed',
          verificationDetails: {
            ...prev.verificationDetails,
            failureReason: reason,
          },
        };
      }
      return prev;
    });
  };

  const adminRequestPhotoWorker = (workerId: string, reason: string, applicationId?: string) => {
    if (applicationId) {
      verificationQueueService.requestBetterPhoto(applicationId, reason);
    }
    setWorkerUser((prev) => {
      if (prev.id === workerId || workerId === 'current' || prev.name === 'Amit Kumar') {
        return {
          ...prev,
          isVerified: false,
          verificationStatus: 'failed',
          verificationDetails: {
            ...prev.verificationDetails,
            failureReason: reason || 'The document photo is too blurry. Please upload a clear photo.',
          },
        };
      }
      return prev;
    });
  };

  const resetWorkerVerificationDemo = () => {
    setWorkerUser((prev) => ({
      ...prev,
      isVerified: false,
      verificationStatus: 'not_verified',
      labourNumber: undefined,
      verificationMethod: undefined,
      verificationSubmittedAt: undefined,
      verificationDetails: undefined,
      verifiedItems: {
        mobile: true,
        identity: false,
        eshram: false,
        certificate: false,
      },
    }));
  };

  const registerEmployer = (data: EmployerRegistrationData): string => {
    // Generate unique ROZGO Employer ID: RZE-XXXXXX
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const employerId = `RZE-${randomDigits}`;

    const nowFormatted = new Date().toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    });

    const isVerified = Boolean(
      data.verificationDetails?.identityVerified ||
      data.verificationDetails?.status === 'verified'
    );
    const verificationStatus = isVerified
      ? 'verified'
      : (data.verificationDetails?.status || 'not_verified');

    const fullName = data.name || [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Employer';

    const newProfile: EmployerProfile = {
      id: `emp-${Date.now()}`,
      employerId,
      name: fullName,
      firstName: data.firstName || fullName.split(' ')[0] || '',
      lastName: data.lastName || fullName.split(' ').slice(1).join(' ') || '',
      phone: data.phone || '+91 98111 88234',
      email: data.email,
      dobOrAge: data.dobOrAge,
      gender: data.gender,
      avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
      employerType: data.employerType || 'individual',
      hiringPurpose: data.hiringPurpose,
      businessName: data.businessName,
      businessType: data.businessType,
      employeeCount: data.employeeCount,
      designation: data.designation,
      contractorWorkTypes: data.contractorWorkTypes,
      typicalWorkersNeeded: data.typicalWorkersNeeded,
      propertyUnitsCount: data.propertyUnitsCount,
      propertyType: data.propertyType,
      location: data.location || 'Gurgaon, Haryana',
      workLocations: data.workLocations && data.workLocations.length > 0 ? data.workLocations : [
        {
          id: 'loc-1',
          label: 'Primary Location',
          addressLine: data.location || 'Gurgaon',
          city: 'Gurgaon',
          state: 'Haryana',
          pincode: '122001',
          isDefault: true,
        },
      ],
      hiringPreferences: data.hiringPreferences || {
        frequentlyNeededTrades: ['plumber', 'electrician'],
        hiringFrequency: 'occasional',
        workersUsuallyNeeded: '1',
        preferredWorkTimes: ['Morning', 'Afternoon'],
      },
      bio: data.bio || `Registered ${data.employerType} employer on ROZGO.`,
      preferredCommunication: data.preferredCommunication || 'call',
      languagesSpoken: data.languagesSpoken && data.languagesSpoken.length > 0 ? data.languagesSpoken : ['Hindi', 'English'],
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      memberSince: nowFormatted,
      totalBookings: 0,
      rating: 5.0,
      ratingBreakdown: {
        professionalism: 5.0,
        clarityOfScope: 5.0,
        paymentReliability: 5.0,
        workplaceSafety: 5.0,
      },
      reviews: [],
      completedBookings: [],
      isVerified,
      verificationStatus,
      verificationDetails: {
        mobileVerified: true,
        identityVerified: isVerified,
        identityType: data.verificationDetails?.identityType,
        identityMasked: data.verificationDetails?.identityMasked,
        identityDocUrl: data.verificationDetails?.identityDocUrl,
        businessVerified: Boolean(data.verificationDetails?.businessVerified),
        businessDocType: data.verificationDetails?.businessDocType,
        businessDocNumber: data.verificationDetails?.businessDocNumber,
        businessDocUrl: data.verificationDetails?.businessDocUrl,
        status: verificationStatus,
        submittedAt: nowFormatted,
      },
    };

    setEmployerUser(newProfile);
    setIsLoggedIn(true);
    setRoleState('employer');
    return employerId;
  };

  const updateEmployerProfile = (updates: Partial<EmployerProfile>) => {
    setEmployerUser((prev) => ({ ...prev, ...updates }));
  };

  const submitEmployerVerification = (params: {
    identityType?: 'aadhaar' | 'driving_license' | 'voter_id' | 'pan';
    identityMasked?: string;
    identityDocUrl?: string;
    businessDocType?: 'gstin' | 'shop_act' | 'msme' | 'society_reg';
    businessDocNumber?: string;
    businessDocUrl?: string;
  }) => {
    const nowFormatted = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    setEmployerUser((prev) => ({
      ...prev,
      isVerified: true,
      verificationStatus: 'verified',
      verificationDetails: {
        mobileVerified: true,
        identityVerified: Boolean(params.identityType || prev.verificationDetails?.identityVerified),
        identityType: params.identityType || prev.verificationDetails?.identityType,
        identityMasked: params.identityMasked || prev.verificationDetails?.identityMasked || 'XXXX XXXX 8192',
        identityDocUrl: params.identityDocUrl,
        businessVerified: Boolean(params.businessDocNumber || prev.verificationDetails?.businessVerified),
        businessDocType: params.businessDocType || prev.verificationDetails?.businessDocType,
        businessDocNumber: params.businessDocNumber || prev.verificationDetails?.businessDocNumber,
        businessDocUrl: params.businessDocUrl,
        status: 'verified',
        submittedAt: nowFormatted,
      },
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        isLoggedIn,
        workerUser,
        employerUser,
        loginAsWorker,
        loginAsEmployer,
        logout,
        registerWorker,
        updateWorkerProfile,
        submitWorkerVerification,
        adminApproveWorker,
        adminRejectWorker,
        adminRequestPhotoWorker,
        resetWorkerVerificationDemo,
        registerEmployer,
        updateEmployerProfile,
        submitEmployerVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

