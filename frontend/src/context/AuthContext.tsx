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
import { apiClient } from '../api/apiClient';
import { verificationQueueService, generateSequentialWorkerId } from '../services/verificationService';
import { authApi } from '../api/authApi';

export interface EmployerRegistrationData {
  password?: string;
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
  loginAsWorker: (phoneOrProfile?: string | WorkerProfile) => void;
  loginAsEmployer: (phoneOrProfile?: string | EmployerProfile) => void;
  logout: () => void;
  registerWorker: (data: {
    name: string;
    phone: string;
    password?: string;
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
  }) => Promise<string>; // returns generated labour number
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
  registerEmployer: (data: EmployerRegistrationData) => Promise<string>; // returns generated RZE-XXXXXX
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

export const emptyWorkerProfile: WorkerProfile = {
  id: '',
  labourNumber: '',
  name: '',
  phone: '',
  avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80',
  location: '',
  distanceKm: 0,
  primarySkill: 'worker',
  skills: [],
  experienceYears: 0,
  dailyRate: 500,
  hourlyRate: 80,
  rating: 5.0,
  completedJobsCount: 0,
  isVerified: false,
  verificationStatus: 'not_verified',
  verifiedItems: {
    mobile: false,
    identity: false,
    eshram: false,
    certificate: false,
  },
  availability: 'Available Today',
  joinedDate: 'Recently',
  bio: '',
  reviews: [],
  portfolio: [],
  certifications: [],
  educationTraining: [],
  benefits: [],
  languagesList: [],
  experienceBreakdown: [],
  weeklySchedule: [],
};

export const emptyEmployerProfile: EmployerProfile = {
  id: '',
  employerId: '',
  name: '',
  firstName: '',
  lastName: '',
  phone: '',
  avatar: '',
  employerType: 'individual',
  location: '',
  workLocations: [],
  hiringPreferences: {
    frequentlyNeededTrades: [],
    hiringFrequency: 'occasional',
    workersUsuallyNeeded: '1',
    preferredWorkTimes: ['Morning', 'Afternoon'],
  },
  bio: '',
  preferredCommunication: 'call',
  languagesSpoken: [],
  memberSince: '',
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
  isVerified: false,
  verificationStatus: 'not_verified',
  verificationDetails: {
    mobileVerified: false,
    identityVerified: false,
    status: 'not_verified',
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
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...emptyWorkerProfile, ...parsed };
        }
      } catch {
        // fallback
      }
    }
    return emptyWorkerProfile;
  });

  const [employerUser, setEmployerUser] = useState<EmployerProfile>(() => {
    const saved = localStorage.getItem('rozgo_employer_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...emptyEmployerProfile, ...parsed };
        }
      } catch {
        // fallback
      }
    }
    return emptyEmployerProfile;
  });

  // Sync profile data from backend on load
  useEffect(() => {
    async function syncSessionWithBackend() {
      try {
        const token = localStorage.getItem('rozgo_auth_token');
        if (!token) return;
        const res = await apiClient.get<any>('/auth/me');
        if (res && res.profile) {
          if (res.user?.role === 'worker') {
            setWorkerUser((prev) => ({
              ...emptyWorkerProfile,
              ...prev,
              ...res.profile,
              labourNumber: res.profile.labour_no || res.profile.labourNo || res.profile.labourNumber || res.profile.id,
              primarySkill: res.profile.primary_skill || res.profile.primarySkill || prev.primarySkill,
              skills: res.profile.skills || prev.skills,
              experienceYears: res.profile.experience_years ?? res.profile.experienceYears ?? prev.experienceYears,
              rating: res.profile.rating ?? prev.rating,
              reviewsCount: res.profile.reviews_count ?? prev.reviewsCount,
              isVerified: res.profile.verification_status === 'verified',
              verificationStatus: res.profile.verification_status || prev.verificationStatus,
            }));
          } else {
            setEmployerUser((prev) => ({
              ...emptyEmployerProfile,
              ...prev,
              ...res.profile,
              employerId: res.profile.id || prev.employerId,
              isVerified: res.profile.isVerified || false,
            }));
          }
        }
      } catch (err) {
        console.warn('Session sync notice:', err);
      }
    }
    syncSessionWithBackend();
  }, []);

  useEffect(() => {
    localStorage.setItem('rozgo_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('rozgo_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    if (workerUser && workerUser.id) {
      localStorage.setItem('rozgo_worker_profile', JSON.stringify(workerUser));
    }
  }, [workerUser]);

  useEffect(() => {
    if (employerUser && employerUser.id) {
      localStorage.setItem('rozgo_employer_profile', JSON.stringify(employerUser));
    }
  }, [employerUser]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const loginAsWorker = (phoneOrProfile?: string | WorkerProfile) => {
    setIsLoggedIn(true);
    setRoleState('worker');
    if (typeof phoneOrProfile === 'string') {
      setWorkerUser((prev) => ({ ...prev, phone: phoneOrProfile }));
    } else if (phoneOrProfile) {
      setWorkerUser(phoneOrProfile);
    }
  };

  const loginAsEmployer = (phoneOrProfile?: string | EmployerProfile) => {
    setIsLoggedIn(true);
    setRoleState('employer');
    if (typeof phoneOrProfile === 'string') {
      setEmployerUser((prev) => ({ ...prev, phone: phoneOrProfile }));
    } else if (phoneOrProfile) {
      setEmployerUser(phoneOrProfile);
    }
  };

  const logout = () => {
    localStorage.removeItem('rozgo_auth_token');
    localStorage.removeItem('rozgo_worker_profile');
    localStorage.removeItem('rozgo_employer_profile');
    setIsLoggedIn(false);
    setWorkerUser(emptyWorkerProfile);
    setEmployerUser(emptyEmployerProfile);
  };

  const registerWorker = async (data: {
    name: string;
    phone: string;
    password?: string;
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
  }): Promise<string> => {
    // Generate unique sequential ROZGO Labour Number: {state}-{city}-{0001}
    const labourNumber = generateSequentialWorkerId(data.state, data.city, data.location);

    const newProfile: WorkerProfile = {
      id: labourNumber,
      // Official sequential worker labour number
      labourNumber,
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
      portfolio: [],
      certifications: [],
      educationTraining: [],
      benefits: [],
      languagesList: [],
      experienceBreakdown: [],
      weeklySchedule: [],
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

    // Push to backend
    const res = await authApi.register({
      phone: data.phone,
      password: data.password,
      role: 'worker',
      name: data.name,
      location: data.location,
      primary_skill: data.primarySkill,
      experience_years: data.experienceYears,
    });

    if (res.profile && res.profile.id) {
       newProfile.id = res.profile.id;
    }

    setWorkerUser(newProfile);
    setIsLoggedIn(true);
    setRoleState('worker');
    return labourNumber;
  };

  const updateWorkerProfile = (updates: Partial<WorkerProfile>) => {
    setWorkerUser((prev) => ({ ...prev, ...updates }));
    apiClient.put('/workers/profile', updates).catch(err => console.error("Error updating worker profile in DB:", err));
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

    const labourNo = workerUser.labourNumber || generateSequentialWorkerId(workerUser.state, workerUser.city, workerUser.location);

    setWorkerUser((prev) => ({
      ...prev,
      isVerified: true,
      verificationStatus: 'verified',
      labourNumber: labourNo,
      verificationMethod: params.method,
      verificationSubmittedAt: nowFormatted,
      verifiedItems: {
        mobile: true,
        identity: true,
        eshram: params.method === 'eshram' || Boolean(prev.verifiedItems?.eshram),
        certificate: true,
      },
      verificationDetails: {
        aadhaarMasked: params.method === 'aadhaar' ? params.maskedIdentifier : (prev.verificationDetails?.aadhaarMasked || 'XXXX XXXX 6821'),
        uanNumber: params.method === 'eshram' ? params.maskedIdentifier : prev.verificationDetails?.uanNumber,
        idType: params.idType || 'Aadhaar Card',
        frontPhoto: params.frontPhoto,
        backPhoto: params.backPhoto,
        selfiePhoto: params.selfiePhoto,
        status: 'verified',
        submittedAt: nowFormatted,
        failureReason: undefined,
      },
    }));
  };

  const adminApproveWorker = (workerId: string, applicationId?: string): string => {
    const res = applicationId
      ? verificationQueueService.approveApplication(applicationId)
      : { success: true, labourNumber: generateSequentialWorkerId() };

    const labourNo = res.labourNumber || generateSequentialWorkerId();

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

  const registerEmployer = async (data: EmployerRegistrationData): Promise<string> => {
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
      phone: data.phone || '+91 98111 00000',
      email: data.email,
      dobOrAge: data.dobOrAge,
      gender: data.gender,
      avatar: data.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
      employerType: data.employerType || 'individual',
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

    // Push to backend
    const res = await authApi.register({
      phone: data.phone || '',
      password: data.password,
      role: 'employer',
      name: fullName,
      location: data.location,
      employer_type: data.employerType,
      business_name: '',
    });

    if (res.profile && res.profile.id) {
       newProfile.id = res.profile.id;
    }

    setEmployerUser(newProfile);
    setIsLoggedIn(true);
    setRoleState('employer');
    return employerId;
  };

  const updateEmployerProfile = (updates: Partial<EmployerProfile>) => {
    setEmployerUser((prev) => ({ ...prev, ...updates }));
    apiClient.put('/employers/profile', updates).catch(err => console.error("Error updating employer profile in DB:", err));
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

