import { VerificationApplication, WorkerVerificationMethod } from '../types';

// ============================================================================
// Service Abstraction: Aadhaar Verification
// In production, connect UIDAI authentication/e-KYC partner gateway here.
// ============================================================================
export const aadhaarVerificationService = {
  maskAadhaar(raw: string): string {
    const cleaned = raw.replace(/\D/g, '');
    const last4 = cleaned.length >= 4 ? cleaned.slice(-4) : '4821';
    return `XXXX XXXX ${last4}`;
  },

  validateAadhaarNumber(raw: string): { isValid: boolean; error?: string } {
    const cleaned = raw.replace(/\D/g, '');
    if (!cleaned) return { isValid: true }; // optional input since photos are primary
    if (cleaned.length !== 12 && cleaned.length !== 4) {
      return { isValid: false, error: 'Please enter a valid 12-digit Aadhaar number or last 4 digits.' };
    }
    return { isValid: true };
  },

  async verify(params: {
    aadhaarNumber?: string;
    frontPhoto: string;
    backPhoto: string;
    selfiePhoto?: string;
  }): Promise<{ success: boolean; maskedAadhaar: string; message: string }> {
    // Simulated verification delay
    await new Promise((res) => setTimeout(res, 600));

    const masked = this.maskAadhaar(params.aadhaarNumber || '4821');
    return {
      success: true,
      maskedAadhaar: masked,
      message: 'Aadhaar documents captured successfully for administrative review.',
    };
  },
};

// ============================================================================
// Service Abstraction: e-Shram Verification
// In production, connect Ministry of Labour & Employment e-Shram API here.
// ============================================================================
export const eShramVerificationService = {
  formatUAN(raw: string): string {
    const cleaned = raw.replace(/\D/g, '').slice(0, 12);
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      parts.push(cleaned.slice(i, i + 4));
    }
    return parts.join(' ');
  },

  validateUAN(raw: string): { isValid: boolean; error?: string } {
    const cleaned = raw.replace(/\D/g, '');
    if (cleaned.length !== 12) {
      return { isValid: false, error: 'e-Shram UAN must be exactly 12 digits.' };
    }
    return { isValid: true };
  },

  async verify(params: {
    uanNumber: string;
  }): Promise<{ success: boolean; maskedUAN: string; note: string }> {
    await new Promise((res) => setTimeout(res, 600));

    const formatted = this.formatUAN(params.uanNumber);
    return {
      success: true,
      maskedUAN: `UAN: ${formatted}`,
      note: 'Verification connection will be added with the official e-Shram integration.',
    };
  },
};

// ============================================================================
// Service Abstraction: Other Government ID Verification (Voter ID, DL, PAN)
// ============================================================================
export const documentVerificationService = {
  maskIdNumber(idType: string, rawNumber?: string): string {
    if (!rawNumber) return `${idType} Document Uploaded`;
    const trimmed = rawNumber.trim().toUpperCase();
    if (trimmed.length > 4) {
      return `${trimmed.slice(0, 2)}••••${trimmed.slice(-3)}`;
    }
    return trimmed;
  },

  async verifyOtherId(params: {
    idType: string;
    idNumber?: string;
    frontPhoto: string;
    backPhoto?: string;
  }): Promise<{ success: boolean; maskedId: string }> {
    await new Promise((res) => setTimeout(res, 500));
    return {
      success: true,
      maskedId: this.maskIdNumber(params.idType, params.idNumber),
    };
  },
};

// ============================================================================
// Verification Queue Repository (Admin demo + persistence)
// ============================================================================
const INITIAL_APPLICATIONS: VerificationApplication[] = [
  {
    id: 'va-101',
    workerId: 'w-ramesh',
    workerName: 'Ramesh Kumar',
    workerPhone: '+91 98765 43210',
    method: 'aadhaar',
    idType: 'Aadhaar Card',
    maskedIdentifier: 'XXXX XXXX 4821',
    frontDocumentUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    backDocumentUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    selfieUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    submittedAt: '5 Sept 2026',
    status: 'pending',
  },
  {
    id: 'va-102',
    workerId: 'w-suresh',
    workerName: 'Suresh Patel',
    workerPhone: '+91 98123 45678',
    method: 'eshram',
    idType: 'e-Shram UAN Card',
    maskedIdentifier: 'UAN: 1009 2837 4192',
    frontDocumentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    submittedAt: '4 Sept 2026',
    status: 'pending',
  },
  {
    id: 'va-103',
    workerId: 'w-deepak',
    workerName: 'Deepak Verma',
    workerPhone: '+91 98345 67890',
    method: 'other_id',
    idType: 'Voter ID Card',
    maskedIdentifier: 'DL••••891',
    frontDocumentUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    submittedAt: '3 Sept 2026',
    status: 'rejected',
    rejectionReason: 'The document photo is too blurry and name text is illegible.',
    reviewedAt: '3 Sept 2026',
    reviewedBy: 'Officer Anjali Gupta',
  },
];

export const verificationQueueService = {
  getApplications(): VerificationApplication[] {
    const saved = localStorage.getItem('rozgo_verification_queue');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing verification queue:', e);
      }
    }
    return INITIAL_APPLICATIONS;
  },

  saveApplications(apps: VerificationApplication[]): void {
    localStorage.setItem('rozgo_verification_queue', JSON.stringify(apps));
  },

  getApplicationByWorkerId(workerId: string): VerificationApplication | undefined {
    return this.getApplications().find((a) => a.workerId === workerId);
  },

  submitApplication(data: {
    workerId: string;
    workerName: string;
    workerPhone: string;
    method: WorkerVerificationMethod;
    idType?: string;
    maskedIdentifier: string;
    frontDocumentUrl?: string;
    backDocumentUrl?: string;
    selfieUrl?: string;
  }): VerificationApplication {
    const applications = this.getApplications();
    const existingIndex = applications.findIndex((a) => a.workerId === data.workerId);

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const newApp: VerificationApplication = {
      id: `va-${Date.now()}`,
      workerId: data.workerId,
      workerName: data.workerName,
      workerPhone: data.workerPhone,
      method: data.method,
      idType: data.idType || (data.method === 'aadhaar' ? 'Aadhaar Card' : data.method === 'eshram' ? 'e-Shram UAN' : 'National ID'),
      maskedIdentifier: data.maskedIdentifier,
      frontDocumentUrl: data.frontDocumentUrl,
      backDocumentUrl: data.backDocumentUrl,
      selfieUrl: data.selfieUrl,
      submittedAt: dateFormatted,
      status: 'pending',
    };

    if (existingIndex >= 0) {
      applications[existingIndex] = newApp;
    } else {
      applications.unshift(newApp);
    }

    this.saveApplications(applications);
    return newApp;
  },

  approveApplication(
    id: string,
    reviewer = 'ROZGO Verification Desk'
  ): { success: boolean; labourNumber: string; app?: VerificationApplication } {
    const applications = this.getApplications();
    const app = applications.find((a) => a.id === id);
    if (!app) return { success: false, labourNumber: '' };

    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const labourNumber = `RZG-${randomDigits}`;

    app.status = 'verified';
    app.reviewedAt = new Date().toLocaleDateString('en-GB');
    app.reviewedBy = reviewer;

    this.saveApplications(applications);
    return { success: true, labourNumber, app };
  },

  rejectApplication(
    id: string,
    reason: string,
    reviewer = 'ROZGO Verification Desk'
  ): { success: boolean; app?: VerificationApplication } {
    const applications = this.getApplications();
    const app = applications.find((a) => a.id === id);
    if (!app) return { success: false };

    app.status = 'rejected';
    app.rejectionReason = reason;
    app.reviewedAt = new Date().toLocaleDateString('en-GB');
    app.reviewedBy = reviewer;

    this.saveApplications(applications);
    return { success: true, app };
  },

  requestBetterPhoto(
    id: string,
    reason: string
  ): { success: boolean; app?: VerificationApplication } {
    const applications = this.getApplications();
    const app = applications.find((a) => a.id === id);
    if (!app) return { success: false };

    app.status = 'photo_resubmit_needed';
    app.rejectionReason = reason || 'The document photo is too blurry or text is not clearly readable.';
    app.reviewedAt = new Date().toLocaleDateString('en-GB');

    this.saveApplications(applications);
    return { success: true, app };
  },
};

