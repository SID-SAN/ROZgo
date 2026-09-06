export type Language = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'bn' | 'gu';

export type UserRole = 'worker' | 'employer';

export type DifficultyLevel = 'Easy' | 'Intermediate' | 'High';

export interface ServiceCategory {
  id: string;
  nameKey: string;
  defaultName: string;
  iconName: string;
  shortDescKey: string;
  defaultShortDesc: string;
  subcategories: Array<{
    id: string;
    nameKey: string;
    defaultName: string;
  }>;
}

export interface Review {
  id: string;
  authorName: string;
  employerName?: string;
  authorRole: 'employer' | 'worker';
  rating: number; // 1 to 5
  comment: string;
  date: string;
  jobTitle?: string;
  tags?: string[];
}

export type WorkerVerificationStatus =
  | 'not_verified'
  | 'pending'
  | 'in_progress'
  | 'in_review'
  | 'verified'
  | 'failed';

export type WorkerVerificationMethod = 'aadhaar' | 'eshram' | 'other_id';

export interface VerificationApplication {
  id: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  method: WorkerVerificationMethod;
  idType?: string; // e.g. "Aadhaar Card", "Voter ID", "Driving Licence", "PAN Card"
  maskedIdentifier: string; // e.g. "XXXX XXXX 4821"
  frontDocumentUrl?: string;
  backDocumentUrl?: string;
  selfieUrl?: string;
  submittedAt: string;
  status: 'pending' | 'verified' | 'rejected' | 'photo_resubmit_needed';
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface WorkerCertificate {
  id: string;
  name: string;
  title?: string;
  issuingOrg: string;
  issuer?: string;
  certificateNumber?: string;
  issueDate?: string;
  year?: string;
  credentialId?: string;
  status: 'verified' | 'pending' | 'rejected';
  documentUrl?: string;
}

export interface WorkerPortfolioItem {
  id: string;
  title: string;
  category?: string;
  photoUrl: string;
  imageUrl?: string;
  completedDate?: string;
  description?: string;
}

export interface WorkerExperienceItem {
  area: string;
  years: number;
  trade?: string;
  specialization?: string;
}

export interface WorkerLanguageItem {
  name: string;
  proficiency: 'Fluent' | 'Conversational' | 'Basic';
}

export interface WorkerEducationItem {
  title: string;
  field: string;
  year: string;
  type: 'ITI' | 'Vocational' | 'School' | 'Other';
}

export interface WorkerAvailabilitySlot {
  day: string;
  status: 'available' | 'unavailable';
  hours: string;
}

export interface WorkerBenefitItem {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'active' | 'eligible' | 'explore';
  link?: string;
}

export interface WorkerCompletedWorkItem {
  id: string;
  title: string;
  employerName: string;
  completedDate: string;
  wage: number;
  rating: number;
  category?: string;
}

export interface WorkerProfile {
  id: string;
  labourNumber?: string; // e.g. "RZG-104582" (only given after verification)
  name: string;
  phone: string;
  avatar: string;
  location: string;
  distanceKm: number;
  primarySkill: string;
  skills: string[];
  experienceYears: number;
  rating: number;
  completedJobsCount: number;
  reviewsCount?: number;
  dailyRate?: number;
  hourlyRate?: number;
  secondarySkills?: string[];
  isVerified: boolean;
  verificationStatus?: WorkerVerificationStatus;
  verificationMethod?: WorkerVerificationMethod;
  verificationSubmittedAt?: string;
  verificationDetails?: {
    aadhaarMasked?: string;
    uanNumber?: string;
    maskedIdentifier?: string;
    idType?: string;
    frontPhoto?: string;
    backPhoto?: string;
    selfiePhoto?: string;
    failureReason?: string;
  };
  verifiedItems?: {
    mobile: boolean;
    identity: boolean;
    eshram: boolean;
    certificate: boolean;
  };
  availability: 'Available Today' | 'Busy' | 'Available Tomorrow';
  joinedDate: string;
  bio: string;
  reviews: Review[];
  // Extended profile & portfolio details
  certifications?: WorkerCertificate[];
  portfolio?: WorkerPortfolioItem[];
  experienceBreakdown?: WorkerExperienceItem[];
  languagesList?: WorkerLanguageItem[];
  languagesKnown?: WorkerLanguageItem[];
  educationTraining?: WorkerEducationItem[];
  weeklySchedule?: WorkerAvailabilitySlot[];
  benefits?: WorkerBenefitItem[];
  completedWorks?: WorkerCompletedWorkItem[];
  serviceAreaList?: string[];
  maxTravelDistanceKm?: number;
  serviceRadiusKm?: number;
  profileVisibility?: 'all_employers' | 'only_requested';
  // Extended onboarding details
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
}

export type EmployerType =
  | 'individual'
  | 'business'
  | 'company'
  | 'contractor'
  | 'property_manager'
  | 'service_manager'
  | 'other';

export interface WorkLocationItem {
  id: string;
  label: string;
  addressLine: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface EmployerHiringPreferences {
  frequentlyNeededTrades: string[];
  hiringFrequency: 'occasional' | 'weekly' | 'daily' | 'project';
  workersUsuallyNeeded: '1' | '2-5' | '6-10' | '10+';
  preferredWorkTimes: string[];
}

export interface EmployerVerificationDetails {
  mobileVerified: boolean;
  identityVerified: boolean;
  identityType?: 'aadhaar' | 'driving_license' | 'voter_id' | 'pan';
  identityMasked?: string;
  identityDocUrl?: string;
  businessVerified?: boolean;
  businessDocType?: 'gstin' | 'shop_act' | 'msme' | 'society_reg';
  businessDocNumber?: string;
  businessDocUrl?: string;
  status: 'not_verified' | 'in_progress' | 'verified';
  submittedAt?: string;
}

export interface EmployerReview {
  id: string;
  workerName: string;
  workerSkill: string;
  workerAvatar?: string;
  workerLabourId?: string;
  rating: number;
  comment: string;
  date: string;
  jobTitle: string;
}

export interface EmployerCompletedBookingItem {
  id: string;
  bookingNumber: string;
  workerId: string;
  workerName: string;
  workerTrade: string;
  workerLabourId: string;
  workerPhone: string;
  workerAvatar?: string;
  avatar?: string;
  completedDate: string;
  wagePaid: number;
  location: string;
}

export interface EmployerProfile {
  id: string;
  employerId: string; // "RZE-XXXXXX"
  name: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  email?: string;
  dobOrAge?: string;
  gender?: string;
  avatar?: string;
  employerType: EmployerType;

  // Specific details based on employerType
  hiringPurpose?: string; // For Individual / Household
  businessName?: string;  // For Business/Company/Contractor/Property
  businessType?: string;  // e.g. Retail, Grocery, IT, Construction
  employeeCount?: string; // 1-5, 6-15, 15+
  designation?: string;   // Owner, Manager, HR, etc.
  contractorWorkTypes?: string[];
  typicalWorkersNeeded?: string[];
  propertyUnitsCount?: string;
  propertyType?: 'residential' | 'commercial' | 'both';

  location: string;
  workLocations: WorkLocationItem[];
  hiringPreferences: EmployerHiringPreferences;

  bio?: string;
  preferredCommunication: 'call' | 'app' | 'whatsapp';
  languagesSpoken: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;

  memberSince: string;
  totalBookings: number;
  rating: number;
  ratingBreakdown: {
    professionalism: number;
    clarityOfScope: number;
    paymentReliability: number;
    workplaceSafety: number;
  };
  reviews: EmployerReview[];
  completedBookings: EmployerCompletedBookingItem[];

  isVerified: boolean;
  verificationStatus: 'not_verified' | 'in_progress' | 'verified';
  verificationDetails?: EmployerVerificationDetails;
}

export type BookingStatus =
  | 'matching'
  | 'negotiating'
  | 'awaiting_confirmation'
  | 'confirmed'
  | 'completed'
  | 'rejected';

export interface BookingWorkerItem {
  workerId: string;
  name: string;
  labourNumber?: string;
  phone: string;
  avatar?: string;
}

export interface BookingAgreement {
  id: string;
  bookingNumber: string; // e.g. "RZG-BK-9204"
  workTitle: string;
  serviceCategory: string;
  subcategory: string;
  difficulty: DifficultyLevel;
  description: string;
  location: string;
  employerId: string;
  employerName: string;
  employerPhone: string;
  workerName?: string;
  workerPhone?: string;
  workers: BookingWorkerItem[];
  workersCount: number;
  date: string;
  time: string;
  agreedWage: number; // in INR ₹
  status: BookingStatus;
  createdAt: string;
  completedAt?: string;
  ratingGiven?: boolean;
  rejectionReason?: string;
  rejectedBy?: 'employer' | 'worker';
}

export interface JobRecommendation {
  id: string;
  serviceCategory: string;
  subcategory: string;
  difficulty: DifficultyLevel;
  location: string;
  distanceKm: number;
  workersNeeded: number;
  employerName: string;
  employerPhone: string;
  preferredTime: string;
  estimatedHours: string;
  description: string;
  postedAt: string;
  wage?: number;
}

// -------------------------------------------------------------
// Grievance & Redressal Types
// -------------------------------------------------------------
export type GrievanceStatus =
  | 'submitted'
  | 'pending'
  | 'under_review'
  | 'more_info_needed'
  | 'info_requested'
  | 'decision_made'
  | 'resolved'
  | 'escalated'
  | 'rejected'
  | 'closed';

export type GrievancePriority = 'low' | 'medium' | 'high' | 'critical';

export interface GrievanceEvidence {
  id: string;
  name?: string;
  fileName?: string;
  type?: 'photo' | 'document' | 'video' | 'other' | 'image' | 'audio' | string;
  fileType?: 'photo' | 'document' | 'video' | 'other' | 'image' | 'audio' | string;
  url: string;
  size?: string;
  fileSize?: string;
  uploadedAt?: string;
  uploadDate?: string;
}

export interface GrievanceTimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  timestamp?: string;
  status: GrievanceStatus;
  completed: boolean;
  current?: boolean;
}

export interface GrievanceMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'support' | 'worker' | 'employer' | 'admin' | 'user';
  message: string;
  timestamp: string;
  attachments?: GrievanceEvidence[];
}

export interface Grievance {
  id: string; // e.g. "RG-2026-001284"
  userId: string;
  userName: string;
  userRole: UserRole;
  userPhone: string;
  category: string;
  categoryLabel: string;
  title: string;
  description: string;
  bookingId?: string;
  bookingTitle?: string;
  bookingNumber?: string;
  bookingDate?: string;
  bookingAmount?: number;
  counterpartyName?: string;
  counterpartyPhone?: string;
  // Guided questions
  agreedWage?: number;
  actualPaid?: number;
  whoCancelled?: 'worker' | 'employer' | 'both';
  inImmediateDanger?: boolean;
  agreedCallDetails?: string;
  // Evidence
  evidence: GrievanceEvidence[];
  // Progress & Workflow
  status: GrievanceStatus;
  priority: GrievancePriority;
  createdAt: string;
  updatedAt: string;
  timeline: GrievanceTimelineItem[];
  messages: GrievanceMessage[];
  // Support decision & resolution
  rozgoResponse?: string;
  infoRequestedPrompt?: string;
  requestedInfoQuery?: string;
  resolution?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  assignedOfficer?: string;
  // Reconsideration / appeal
  reconsiderationRequested?: boolean;
  reconsiderationReason?: string;
}
