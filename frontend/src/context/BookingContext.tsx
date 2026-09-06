import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BookingAgreement,
  BookingStatus,
  BookingWorkerItem,
  DifficultyLevel,
  JobRecommendation,
  Review,
  WorkerProfile,
} from '../types';
import { MOCK_WORKERS } from '../data/mockWorkers';
import { MOCK_JOBS } from '../data/mockJobs';
import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';

export interface StartWorkRequestParams {
  serviceCategory?: string;
  serviceCategories?: string[];
  subcategory?: string;
  categoryTasks?: Record<string, string>;
  difficulty: DifficultyLevel;
  description: string;
  location: string;
  preferredDate: string;
  preferredTime: string;
  workersNeeded?: number;
  workersNeededPerCategory?: Record<string, number>;
}

interface BookingContextType {
  // Current active agreements list
  activeAgreements: BookingAgreement[];
  // Current active agreement for single-agreement demo/flows (falls back to activeAgreements[0])
  activeAgreement: BookingAgreement | null;
  // History of completed agreements
  completedAgreements: BookingAgreement[];
  // Matching state for employer
  matchedWorker: WorkerProfile | null;
  matchedWorkersByTrade: Record<string, WorkerProfile>;
  requestedCategories: string[];
  additionalWorkers: BookingWorkerItem[];
  // Live Data lists
  availableWorkersList: WorkerProfile[];
  availableJobsList: JobRecommendation[];
  // Matching state for worker
  currentJobIndex: number;
  currentJob: JobRecommendation | null;
  isSearchingNextJob: boolean;
  // Methods
  startWorkRequest: (params: StartWorkRequestParams) => WorkerProfile | null;
  addWorkerByLabourNumber: (labourNo: string, targetAgreementId?: string) => { success: boolean; message: string; worker?: WorkerProfile };
  addRecommendedWorker: (targetAgreementId?: string) => boolean;
  removeWorkerFromBooking: (workerId: string, targetAgreementId?: string) => void;
  confirmAgreementDetails: (params: {
    agreementId?: string;
    agreedWage: number;
    date: string;
    time: string;
  }) => BookingAgreement;
  confirmAllPendingAgreements: (agreedWages: Record<string, number>, date: string, time: string) => BookingAgreement[];
  selectJobAsActiveAgreement: (job: JobRecommendation, wage?: number, status?: BookingStatus) => BookingAgreement;
  workerConfirmBooking: (agreementId: string, accept: boolean) => void;
  employerRejectBooking: (reason?: string, agreementId?: string) => void;
  switchMatchedWorker: (nextWorkerId?: string, tradeCategory?: string) => WorkerProfile | null;
  rejectWorkerAndShowNext: (reason?: string, tradeCategory?: string) => { nextWorker: WorkerProfile | null; noMoreWorkers: boolean };
  previousWorkerFeedback: { workerName: string; reason: string } | null;
  clearPreviousWorkerFeedback: () => void;
  markWorkCompleted: (agreementId: string) => void;
  submitReview: (agreementId: string, rating: number, comment: string, tags?: string[]) => void;
  workerNextJob: () => void;
  resetDemoBooking: () => void;
}

const INITIAL_ACTIVE_BOOKINGS: BookingAgreement[] = [];
const INITIAL_COMPLETED_BOOKINGS: BookingAgreement[] = [];

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeAgreements, setActiveAgreements] = useState<BookingAgreement[]>(() => {
    const saved = localStorage.getItem('rozgo_active_agreements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {}
    }
    const singleSaved = localStorage.getItem('rozgo_active_agreement');
    if (singleSaved) {
      try {
        const parsed = JSON.parse(singleSaved);
        if (parsed && typeof parsed === 'object') {
          return [parsed];
        }
      } catch {}
    }
    return [];
  });

  const [completedAgreements, setCompletedAgreements] = useState<BookingAgreement[]>(() => {
    const saved = localStorage.getItem('rozgo_completed_agreements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_COMPLETED_BOOKINGS.length) {
          return parsed;
        }
      } catch {}
    }
    return [];
  });

  const [liveWorkers, setLiveWorkers] = useState<WorkerProfile[]>([]);

  useEffect(() => {
    async function fetchLiveWorkers() {
      try {
        const res = await apiClient.get<WorkerProfile[]>(API_ENDPOINTS.WORKERS.LIST);
        if (Array.isArray(res) && res.length > 0) {
          // Normalize worker fields for frontend compatibility
          const normalized = res.map((w: any) => ({
            ...w,
            labourNumber: w.labourNo || w.labourNumber,
            primarySkill: (w.primarySkill || 'plumber').toLowerCase(),
            skills: Array.isArray(w.skills) ? w.skills : [w.primarySkill || 'Plumber'],
            distanceKm: w.distanceKm || 2.5,
            completedJobsCount: w.completedJobsCount ?? 0,
            isVerified: w.verified !== undefined ? w.verified : true,
            verificationStatus: w.verificationStatus || 'verified',
            reviews: w.reviews || [],
            avatar: w.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
          }));
          setLiveWorkers(normalized);
          console.log(`%c[ROZgo Live Data]%c Loaded ${normalized.length} real workers from Supabase`, 'color: #10b981; font-weight: bold;', 'color: auto;');
        }
      } catch (e) {
        console.warn('Backend workers endpoint unreachable, using local fallback:', e);
      }
    }
    fetchLiveWorkers();
  }, []);

  const availableWorkersList = liveWorkers.length > 0 ? liveWorkers : MOCK_WORKERS;

  const [liveJobs, setLiveJobs] = useState<JobRecommendation[]>([]);

  // 1. Fetch completed bookings from DB on mount so records are preserved for future needs
  useEffect(() => {
    async function fetchCompletedFromBackend() {
      try {
        const res = await apiClient.get<any[]>('/bookings/completed');
        if (Array.isArray(res) && res.length > 0) {
          setCompletedAgreements((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const existingRefs = new Set(prev.map((a) => a.bookingNumber));
            const newCompleted: BookingAgreement[] = [];

            res.forEach((b) => {
              if (!existingIds.has(b.id) && !existingRefs.has(b.bookingNumber)) {
                newCompleted.push({
                  id: b.id,
                  bookingNumber: b.bookingNumber || `RZG-BK-${b.id.slice(0, 4).toUpperCase()}`,
                  workTitle: b.workTitle || b.jobTitle || 'Completed Service',
                  serviceCategory: b.serviceCategory || 'plumber',
                  subcategory: b.subcategory || 'General',
                  difficulty: 'Intermediate',
                  description: b.description || 'Completed cooperative service.',
                  location: b.location || 'Local Area',
                  employerId: 'emp-direct',
                  employerName: b.employerName || 'Direct Customer',
                  employerPhone: b.employerPhone || '+91 98111 88234',
                  workers: b.workers && b.workers.length > 0 ? b.workers : [
                    {
                      workerId: 'w1',
                      name: 'raj',
                      labourNumber: 'hr-gu-0001',
                      phone: '+91 1234567890',
                      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80',
                    }
                  ],
                  workersCount: b.workersCount || 1,
                  date: b.date || 'Today',
                  time: b.time || '11:00 AM',
                  agreedWage: b.agreedWage || 500,
                  status: 'completed',
                  completedAt: b.completedAt || 'Recently',
                  createdAt: b.completedAt || 'Recently',
                });
              }
            });

            if (newCompleted.length > 0) {
              return [...prev, ...newCompleted];
            }
            return prev;
          });
        }
      } catch (err) {
        console.warn('Completed bookings fetch notice:', err);
      }
    }
    fetchCompletedFromBackend();
  }, []);

  // 2. Periodic sync for active bookings: updates employer page to "confirmed/ongoing" when worker accepts, and keeps worker job queue clean
  useEffect(() => {
    let isMounted = true;

    async function syncActiveWithBackend() {
      try {
        const res = await apiClient.get<any[]>('/bookings/active');
        if (!isMounted || !Array.isArray(res)) return;

        // Filter out jobs that are already 'active' (accepted) from worker's available queue
        const unassigned = res.filter((b) => b.status !== 'active');
        if (unassigned.length > 0) {
          const mappedJobs: JobRecommendation[] = unassigned.map((b, idx) => ({
            id: b.id || `job-${idx + 1}`,
            serviceCategory: b.serviceCategory || 'plumber',
            subcategory: b.jobTitle || b.workTitle || 'General Service',
            difficulty: 'Intermediate',
            location: b.location || 'Gurgaon, Haryana',
            distanceKm: 2.2,
            workersNeeded: b.workersCount || 1,
            employerName: b.employerName || 'Direct Customer',
            employerPhone: b.employerPhone || '+91 98111 88234',
            preferredTime: `${b.date || 'Today'}, 11:00 AM`,
            estimatedHours: '2 - 3 hours',
            description: b.description || 'Mutually verified work request.',
            postedAt: 'Just now',
            wage: b.agreedWage || b.wage_offer || 1200,
          }));
          setLiveJobs(mappedJobs);
        }

        // Sync active agreements for employer and worker: merge backend active/pending bookings
        setActiveAgreements((prevAgreements) => {
          let hasChanges = false;

          // Helper to map a backend booking to a frontend BookingAgreement
          const mapBackendToAgreement = (b: any): BookingAgreement => ({
            id: String(b.id),
            bookingNumber: b.bookingNumber || `RZG-BK-${String(b.id).slice(0, 4).toUpperCase()}`,
            workTitle: b.jobTitle || b.workTitle || 'Trade Service',
            serviceCategory: b.serviceCategory || 'plumber',
            subcategory: b.subcategory || 'General',
            difficulty: 'Intermediate',
            description: b.description || '',
            location: b.location || 'Gurgaon, Haryana',
            employerId: 'emp-direct',
            employerName: b.employerName || 'Direct Customer',
            employerPhone: b.employerPhone || '+91 98111 88234',
            workers: b.workers && b.workers.length > 0 ? b.workers : [
              {
                workerId: 'w1',
                name: 'raj',
                labourNumber: 'hr-gu-0001',
                phone: '+91 1234567890',
                avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80',
              }
            ],
            workersCount: (b.workers && b.workers.length) || 1,
            date: b.date || 'Today',
            time: b.time || '11:00 AM',
            agreedWage: Number(b.agreedWage || b.wage_offer || 582),
            status: (b.status === 'active' ? 'confirmed' : 'awaiting_confirmation') as BookingStatus,
            createdAt: 'Today',
          });

          // If local activeAgreements is empty, populate directly from backend bookings
          if (prevAgreements.length === 0 && res.length > 0) {
            const validBookings = res.filter((b) => b.status === 'active' || b.status === 'agreement_pending');
            if (validBookings.length > 0) {
              return validBookings.map(mapBackendToAgreement);
            }
            return prevAgreements;
          }

          // Update existing agreements
          const updated = prevAgreements.map((agr) => {
            const dbMatch = res.find((b) =>
              b.id === agr.id ||
              b.bookingNumber === agr.bookingNumber ||
              b.bookingNumber === agr.id ||
              (agr.agreedWage === Number(b.agreedWage || b.wage_offer) &&
                b.workers?.[0]?.name &&
                agr.workers?.[0]?.name &&
                b.workers[0].name.toLowerCase() === agr.workers[0].name.toLowerCase()) ||
              // Reconcile temporary local frontend IDs (bk-...) with backend booking
              (agr.id.startsWith('bk-') && (
                b.serviceCategory === agr.serviceCategory ||
                (b.workers?.[0]?.name && agr.workers?.[0]?.name && b.workers[0].name.toLowerCase() === agr.workers[0].name.toLowerCase()) ||
                res.length === 1
              )) ||
              (res.length === 1 && prevAgreements.length === 1)
            );

            if (dbMatch) {
              const newStatus: BookingStatus = dbMatch.status === 'active' ? 'confirmed' : (dbMatch.status === 'agreement_pending' ? 'awaiting_confirmation' : agr.status);
              const hasStatusChanged = newStatus !== agr.status;
              const hasWorkerData = dbMatch.workers && dbMatch.workers.length > 0;
              const hasIdUpdated = agr.id !== String(dbMatch.id) || agr.bookingNumber !== dbMatch.bookingNumber;

              if (hasStatusChanged || hasIdUpdated || (hasWorkerData && (!agr.workers || agr.workers.length === 0 || !agr.workers[0].phone))) {
                hasChanges = true;
                return {
                  ...agr,
                  id: String(dbMatch.id || agr.id),
                  bookingNumber: dbMatch.bookingNumber || agr.bookingNumber,
                  status: newStatus,
                  workers: hasWorkerData ? dbMatch.workers : agr.workers,
                  workersCount: dbMatch.workersCount || agr.workersCount,
                  agreedWage: Number(dbMatch.agreedWage || dbMatch.wage_offer || agr.agreedWage),
                  employerName: dbMatch.employerName || agr.employerName,
                  employerPhone: dbMatch.employerPhone || agr.employerPhone,
                };
              }
            }
            return agr;
          });

          // Check if any active/pending booking from backend is missing from local list
          const existingIds = new Set(updated.map((a) => String(a.id)));
          const existingRefs = new Set(updated.map((a) => a.bookingNumber));
          const missingFromBackend = res.filter(
            (b) =>
              (b.status === 'active' || b.status === 'agreement_pending') &&
              !existingIds.has(String(b.id)) &&
              !existingRefs.has(b.bookingNumber)
          );

          if (missingFromBackend.length > 0) {
            hasChanges = true;
            const newAgreements = missingFromBackend.map(mapBackendToAgreement);
            return [...newAgreements, ...updated];
          }

          return hasChanges ? updated : prevAgreements;
        });
      } catch (err) {
        // Silently catch polling issues
      }
    }

    syncActiveWithBackend();
    const interval = setInterval(syncActiveWithBackend, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const [requestedCategories, setRequestedCategories] = useState<string[]>(['plumber']);
  const [matchedWorkersByTrade, setMatchedWorkersByTrade] = useState<Record<string, WorkerProfile>>(() => {
    return {
      plumber: MOCK_WORKERS[0],
      mason: MOCK_WORKERS.find((w) => w.primarySkill === 'mason') || MOCK_WORKERS[4],
    };
  });

  const [additionalWorkers, setAdditionalWorkers] = useState<BookingWorkerItem[]>([]);
  const [rejectedWorkerIds, setRejectedWorkerIds] = useState<string[]>([]);
  const [previousWorkerFeedback, setPreviousWorkerFeedback] = useState<{
    workerName: string;
    reason: string;
  } | null>(null);

  const clearPreviousWorkerFeedback = () => setPreviousWorkerFeedback(null);

  const [currentJobIndex, setCurrentJobIndex] = useState<number>(0);
  const [isSearchingNextJob, setIsSearchingNextJob] = useState<boolean>(false);

  const activeAgreement = activeAgreements.length > 0 ? activeAgreements[0] : null;
  const matchedWorker =
    matchedWorkersByTrade[requestedCategories[0] || 'plumber'] ||
    MOCK_WORKERS[0];

  useEffect(() => {
    localStorage.setItem('rozgo_active_agreements', JSON.stringify(activeAgreements));
    if (activeAgreements.length > 0) {
      localStorage.setItem('rozgo_active_agreement', JSON.stringify(activeAgreements[0]));
    } else {
      localStorage.removeItem('rozgo_active_agreement');
    }
  }, [activeAgreements]);

  useEffect(() => {
    localStorage.setItem('rozgo_completed_agreements', JSON.stringify(completedAgreements));
  }, [completedAgreements]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'rozgo_active_agreements') {
        if (e.newValue) {
          try {
            setActiveAgreements(JSON.parse(e.newValue));
          } catch {}
        } else {
          setActiveAgreements([]);
        }
      } else if (e.key === 'rozgo_active_agreement' && e.newValue) {
        try {
          const single = JSON.parse(e.newValue);
          if (single) {
            setActiveAgreements((prev) => {
              const idx = prev.findIndex((a) => a.id === single.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = single;
                return next;
              }
              return [single, ...prev];
            });
          }
        } catch {}
      }
      if (e.key === 'rozgo_completed_agreements' && e.newValue) {
        try {
          setCompletedAgreements(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const availableJobsList = liveJobs;
  const currentJob = availableJobsList[currentJobIndex] || null;

  const startWorkRequest = (params: StartWorkRequestParams): WorkerProfile | null => {
    setRejectedWorkerIds([]);
    setPreviousWorkerFeedback(null);

    const categories =
      params.serviceCategories && params.serviceCategories.length > 0
        ? params.serviceCategories
        : params.serviceCategory
        ? [params.serviceCategory]
        : ['plumber'];

    setRequestedCategories(categories);
    setAdditionalWorkers([]);

    const newMatchedMap: Record<string, WorkerProfile> = {};
    const createdAgreements: BookingAgreement[] = [];

    categories.forEach((cat, index) => {
      const localId = `bk-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`;
      const localRef = `RZG-BK-${Math.floor(1000 + Math.random() * 9000)}`;

      // Fire API call and adopt backend IDs when response arrives
      apiClient.post<any>('/bookings/request', {
        serviceCategory: cat,
        subcategory: (params.categoryTasks && params.categoryTasks[cat]) || params.subcategory || cat,
        description: params.description || '',
        location: params.location || '',
        preferredDate: params.preferredDate || 'Today',
        preferredTime: params.preferredTime || '11:00 AM',
        wageOffer: 1200,
        workersNeeded: (params.workersNeededPerCategory && params.workersNeededPerCategory[cat]) || params.workersNeeded || 1
      }).then(res => {
        // Update the local agreement with the real backend ID and booking number
        if (res && (res.id || res.bookingNumber)) {
          setActiveAgreements(prev =>
            prev.map(agr => {
              if (agr.id === localId) {
                return {
                  ...agr,
                  id: res.id || agr.id,
                  bookingNumber: res.bookingNumber || agr.bookingNumber,
                };
              }
              return agr;
            })
          );
        }
      }).catch(err => console.error("Error creating task in DB:", err));

      const suitable =
        availableWorkersList.find((w) => w.primarySkill.toLowerCase() === cat.toLowerCase()) ||
        availableWorkersList[index % availableWorkersList.length] ||
        availableWorkersList[0];

      newMatchedMap[cat] = suitable;

      const subtask =
        (params.categoryTasks && params.categoryTasks[cat]) ||
        params.subcategory ||
        `${cat.charAt(0).toUpperCase() + cat.slice(1)} Service`;

      const workersNeeded =
        (params.workersNeededPerCategory && params.workersNeededPerCategory[cat]) ||
        params.workersNeeded ||
        1;

      const booking: BookingAgreement = {
        id: localId,
        bookingNumber: localRef,
        workTitle: `${subtask} (${params.difficulty})`,
        serviceCategory: cat,
        subcategory: subtask,
        difficulty: params.difficulty,
        description: params.description,
        location: params.location,
        employerId: 'e1',
        employerName: 'Rahul Sharma',
        employerPhone: '+91 98111 88234',
        workers: [
          {
            workerId: suitable.id,
            name: suitable.name,
            labourNumber: suitable.labourNumber,
            phone: suitable.phone,
            avatar: suitable.avatar,
          },
        ],
        workersCount: workersNeeded,
        date: params.preferredDate || 'Today',
        time: params.preferredTime || '11:00 AM',
        agreedWage: cat === 'mason' ? 1800 : cat === 'plumber' ? 1500 : 1200,
        status: 'matching',
        createdAt: new Date().toLocaleString(),
      };

      createdAgreements.push(booking);
    });

    setMatchedWorkersByTrade(newMatchedMap);

    setActiveAgreements((prev) => {
      const nonMatchingExisting = prev.filter((a) => a.status !== 'matching');
      return [...createdAgreements, ...nonMatchingExisting];
    });

    return newMatchedMap[categories[0]] || null;
  };

  const addWorkerByLabourNumber = (labourNo: string, targetAgreementId?: string) => {
    const cleaned = labourNo.trim().toUpperCase();
    
    // Check locally registered worker profile first
    let savedWorker: WorkerProfile | null = null;
    try {
      const stored = localStorage.getItem('rozgo_worker_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.labourNumber && parsed.labourNumber.toUpperCase() === cleaned) {
          savedWorker = parsed;
        }
      }
    } catch {}

    const found = savedWorker || availableWorkersList.find(
      (w) => w.labourNumber && w.labourNumber.toUpperCase() === cleaned
    );

    if (!found) {
      return {
        success: false,
        message: `Worker with Labour Number "${cleaned}" was not found. Try rj-jp-0001 or rj-jp-0002.`,
      };
    }

    const newItem: BookingWorkerItem = {
      workerId: found.id,
      name: found.name,
      labourNumber: found.labourNumber,
      phone: found.phone,
      avatar: found.avatar,
    };

    setAdditionalWorkers((prev) => [...prev, newItem]);

    setActiveAgreements((prev) =>
      prev.map((agr) => {
        if (!targetAgreementId || agr.id === targetAgreementId || agr.status === 'matching') {
          if (agr.workers.some((w) => w.workerId === found.id)) return agr;
          return {
            ...agr,
            workers: [...agr.workers, newItem],
            workersCount: agr.workers.length + 1,
          };
        }
        return agr;
      })
    );

    return {
      success: true,
      message: `Added ${found.name} (${found.labourNumber}) to booking!`,
      worker: found,
    };
  };

  const addRecommendedWorker = (targetAgreementId?: string): boolean => {
    const candidate = availableWorkersList.find(
      (w) => !additionalWorkers.some((item) => item.workerId === w.id)
    );

    if (!candidate) return false;

    const newItem: BookingWorkerItem = {
      workerId: candidate.id,
      name: candidate.name,
      labourNumber: candidate.labourNumber,
      phone: candidate.phone,
      avatar: candidate.avatar,
    };

    setAdditionalWorkers((prev) => [...prev, newItem]);

    setActiveAgreements((prev) =>
      prev.map((agr) => {
        if (!targetAgreementId || agr.id === targetAgreementId || agr.status === 'matching') {
          return {
            ...agr,
            workers: [...agr.workers, newItem],
            workersCount: agr.workers.length + 1,
          };
        }
        return agr;
      })
    );

    return true;
  };

  const removeWorkerFromBooking = (workerId: string, targetAgreementId?: string) => {
    setAdditionalWorkers((prev) => prev.filter((w) => w.workerId !== workerId));
    setActiveAgreements((prev) =>
      prev.map((agr) => {
        if (!targetAgreementId || agr.id === targetAgreementId) {
          return {
            ...agr,
            workers: agr.workers.filter((w) => w.workerId !== workerId),
            workersCount: Math.max(1, agr.workers.length - 1),
          };
        }
        return agr;
      })
    );
  };

  const confirmAgreementDetails = (params: {
    agreementId?: string;
    agreedWage: number;
    date: string;
    time: string;
  }): BookingAgreement => {
    let updatedAgreement: BookingAgreement | null = null;

    setActiveAgreements((prev) => {
      return prev.map((agr) => {
        if (!params.agreementId || agr.id === params.agreementId || (prev.length === 1 && agr.status === 'matching')) {
          const updated: BookingAgreement = {
            ...agr,
            agreedWage: params.agreedWage,
            date: params.date,
            time: params.time,
            status: 'awaiting_confirmation',
          };
          if (!updatedAgreement) updatedAgreement = updated;
          return updated;
        }
        return agr;
      });
    });

    return updatedAgreement || activeAgreements[0] || INITIAL_ACTIVE_BOOKINGS[0];
  };

  const confirmAllPendingAgreements = (
    agreedWages: Record<string, number>,
    date: string,
    time: string
  ): BookingAgreement[] => {
    const updatedList: BookingAgreement[] = [];
    setActiveAgreements((prev) =>
      prev.map((agr) => {
        if (agr.status === 'matching') {
          const wage = agreedWages[agr.serviceCategory] || agreedWages[agr.id] || agr.agreedWage || 1500;
          const updated: BookingAgreement = {
            ...agr,
            agreedWage: wage,
            date,
            time,
            status: 'awaiting_confirmation',
          };
          updatedList.push(updated);

          // Sync to backend
          const workerId = agr.workers[0]?.workerId || '';
          apiClient.post('/bookings/agreement/confirm', {
            bookingId: agr.bookingNumber || agr.id,
            workerId,
            agreedWage: wage,
            date,
            time,
          }).catch(err => console.error("Error confirming agreement in DB:", err));

          return updated;
        }
        return agr;
      })
    );
    return updatedList;
  };

  const selectJobAsActiveAgreement = (
    job: JobRecommendation,
    wage: number = 1200,
    status: BookingStatus = 'awaiting_confirmation'
  ): BookingAgreement => {
    const newAgreement: BookingAgreement = {
      id: `bk-${Date.now()}`,
      bookingNumber: `RZG-BK-${Math.floor(1000 + Math.random() * 9000)}`,
      workTitle: job.subcategory,
      serviceCategory: job.serviceCategory,
      subcategory: job.subcategory,
      difficulty: job.difficulty,
      description: job.description,
      location: job.location,
      employerId: `emp-${job.id}`,
      employerName: job.employerName,
      employerPhone: job.employerPhone,
      workers: [
        {
          workerId: 'w1',
          name: 'Ramesh Kumar',
          labourNumber: 'RZG-104582',
          phone: '+91 98765 43210',
          avatar:
            'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80',
        },
      ],
      workersCount: job.workersNeeded || 1,
      date: 'Today',
      time: job.preferredTime || '11:00 AM',
      agreedWage: wage,
      status,
      createdAt: 'Just now',
    };

    setActiveAgreements((prev) => [newAgreement, ...prev]);

    if (status === 'confirmed') {
      // Remove from worker live opportunities queue immediately
      setLiveJobs((prev) => prev.filter((j) => j.id !== job.id && j.subcategory !== job.subcategory));
      const workerId = newAgreement.workers[0]?.workerId || '';
      apiClient.post('/bookings/agreement/confirm', {
        bookingId: newAgreement.bookingNumber || newAgreement.id,
        workerId,
        agreedWage: newAgreement.agreedWage,
        date: newAgreement.date,
        time: newAgreement.time,
      }).catch(err => console.error("Error syncing worker acceptance to DB:", err));
    }

    return newAgreement;
  };

  const workerConfirmBooking = (agreementId: string, accept: boolean) => {
    setActiveAgreements((prev) => {
      if (!accept) {
        // Declined: remove from active agreements
        const target = prev.find((a) => a.id === agreementId || !agreementId);
        if (target) {
          apiClient.post('/bookings/agreement/worker-response', {
            bookingId: target.id,
            bookingNumber: target.bookingNumber,
            accept: false,
            rejectReason: 'Declined by worker',
          }).catch((err) => console.error('Error rejecting booking:', err));
        }
        return prev.filter((a) => a.id !== agreementId);
      }

      return prev.map((agr) => {
        if (agr.id === agreementId || !agreementId) {
          // Sync acceptance to backend
          const workerId = agr.workers[0]?.workerId || '';
          apiClient.post('/bookings/agreement/worker-response', {
            bookingId: agr.id,
            bookingNumber: agr.bookingNumber,
            accept: true,
          }).catch(() => {
            // Fallback
            apiClient.post('/bookings/agreement/confirm', {
              bookingId: agr.bookingNumber || agr.id,
              workerId,
              agreedWage: agr.agreedWage,
              date: agr.date,
              time: agr.time,
              confirmedByWorker: true,
            }).catch((err) => console.error('Error syncing worker acceptance to DB:', err));
          });

          return { ...agr, status: 'confirmed' as BookingStatus };
        }
        return agr;
      });
    });
  };

  const employerRejectBooking = (reason?: string, agreementId?: string) => {
    setActiveAgreements((prev) =>
      prev.filter((agr) => {
        if (agreementId) {
          return agr.id !== agreementId;
        }
        return agr.status !== 'matching' && agr.status !== 'awaiting_confirmation';
      })
    );
  };

  const switchMatchedWorker = (nextWorkerId?: string, tradeCategory?: string): WorkerProfile | null => {
    const category = tradeCategory || requestedCategories[0] || 'plumber';
    const currentWorker = matchedWorkersByTrade[category] || matchedWorker;
    const currentId = nextWorkerId || currentWorker?.id;

    const sameTradeWorkers = availableWorkersList.filter((w) => w.primarySkill.toLowerCase() === category.toLowerCase());
    const pool = sameTradeWorkers.length > 1 ? sameTradeWorkers : availableWorkersList;
    const nextWorker = pool.find((w) => w.id !== currentId) || pool[0];

    if (!nextWorker) return null;

    setMatchedWorkersByTrade((prev) => ({ ...prev, [category]: nextWorker }));

    setActiveAgreements((prev) =>
      prev.map((agr) => {
        if (agr.serviceCategory === category && agr.status === 'matching') {
          return {
            ...agr,
            workers: [
              {
                workerId: nextWorker.id,
                name: nextWorker.name,
                labourNumber: nextWorker.labourNumber,
                phone: nextWorker.phone,
                avatar: nextWorker.avatar,
              },
            ],
          };
        }
        return agr;
      })
    );

    return nextWorker;
  };

  const rejectWorkerAndShowNext = (
    reason?: string,
    tradeCategory?: string
  ): { nextWorker: WorkerProfile | null; noMoreWorkers: boolean } => {
    const category = tradeCategory || requestedCategories[0] || 'plumber';
    const currentWorker = matchedWorkersByTrade[category] || matchedWorker;
    const currentId = currentWorker?.id;

    const newRejected = currentId
      ? Array.from(new Set([...rejectedWorkerIds, currentId]))
      : rejectedWorkerIds;
    setRejectedWorkerIds(newRejected);

    if (currentWorker) {
      setPreviousWorkerFeedback({
        workerName: currentWorker.name,
        reason: reason || 'Declined by employer',
      });
    }

    const sameTradeWorkers = availableWorkersList.filter((w) => w.primarySkill.toLowerCase() === category.toLowerCase());
    let nextCandidate: WorkerProfile | null =
      sameTradeWorkers.find((w) => !newRejected.includes(w.id)) || null;
    let noMoreWorkers = false;

    if (!nextCandidate) {
      nextCandidate =
        sameTradeWorkers.find((w) => w.id !== currentId) ||
        availableWorkersList.find((w) => !newRejected.includes(w.id)) ||
        availableWorkersList.find((w) => w.id !== currentId) ||
        null;
      noMoreWorkers = true;
    }

    if (nextCandidate) {
      setMatchedWorkersByTrade((prev) => ({ ...prev, [category]: nextCandidate! }));

      setActiveAgreements((prev) =>
        prev.map((agr) => {
          if (agr.serviceCategory === category && agr.status === 'matching') {
            return {
              ...agr,
              workers: [
                {
                  workerId: nextCandidate!.id,
                  name: nextCandidate!.name,
                  labourNumber: nextCandidate!.labourNumber,
                  phone: nextCandidate!.phone,
                  avatar: nextCandidate!.avatar,
                },
              ],
            };
          }
          return agr;
        })
      );
    }

    return { nextWorker: nextCandidate, noMoreWorkers };
  };

  const markWorkCompleted = (agreementId: string) => {
    const targetAgreement = activeAgreements.find((a) => a.id === agreementId || a.bookingNumber === agreementId) || activeAgreements[0];
    if (!targetAgreement) return;

    const completed: BookingAgreement = {
      ...targetAgreement,
      status: 'completed',
      completedAt: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };
    
    // Call backend endpoint to mark complete in DB and generate digital receipt
    apiClient.post(`/bookings/${targetAgreement.id}/complete`).catch(err => {
      // Fallback to reference if id is not matching supabase uuid
      apiClient.post(`/bookings/${targetAgreement.bookingNumber}/complete`).catch(e => console.error("Error completing in DB", e));
    });

    // 1. Remove from active agreements queue
    setActiveAgreements((prev) => prev.filter((a) => a.id !== targetAgreement.id && a.bookingNumber !== targetAgreement.bookingNumber));
    // 2. Remove from live available jobs queue
    setLiveJobs((prev) => prev.filter((j) => j.id !== targetAgreement.id && j.id !== targetAgreement.bookingNumber));
    // 3. Store in completed agreements for future needs
    setCompletedAgreements((prev) => {
      const filtered = prev.filter((a) => a.id !== targetAgreement.id && a.bookingNumber !== targetAgreement.bookingNumber);
      return [completed, ...filtered];
    });
  };

  const submitReview = (
    agreementId: string,
    rating: number,
    comment: string,
    tags?: string[]
  ) => {
    const target =
      completedAgreements.find((a) => a.id === agreementId) ||
      activeAgreements.find((a) => a.id === agreementId);

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      authorName: 'Rahul Sharma',
      authorRole: 'employer',
      rating,
      comment,
      date: 'Today',
      jobTitle: target?.workTitle || 'Completed Work',
      tags,
    };

    if (target?.workers[0]) {
      const workerMatch = MOCK_WORKERS.find((w) => w.id === target.workers[0].workerId);
      if (workerMatch) {
        workerMatch.reviews = [newReview, ...workerMatch.reviews];
        workerMatch.completedJobsCount += 1;
      }

      // Sync review to backend
      const bookingRef = target.bookingNumber || target.id;
      apiClient.post(`/bookings/${bookingRef}/review`, {
        rating,
        comment,
        tags: tags || [],
        authorName: 'Rahul Sharma',
        authorRole: 'employer',
        workerId: target.workers[0].workerId,
      }).catch(err => console.error("Error submitting review to DB:", err));
    }
  };

  const workerNextJob = () => {
    setIsSearchingNextJob(true);
    setTimeout(() => {
      setCurrentJobIndex((prev) => (prev + 1) % MOCK_JOBS.length);
      setIsSearchingNextJob(false);
    }, 500);
  };

  const resetDemoBooking = () => {
    setActiveAgreements(INITIAL_ACTIVE_BOOKINGS);
  };

  return (
    <BookingContext.Provider
      value={{
        activeAgreements,
        activeAgreement,
        completedAgreements,
        matchedWorker,
        matchedWorkersByTrade,
        requestedCategories,
        additionalWorkers,
        availableWorkersList,
        availableJobsList,
        currentJobIndex,
        currentJob,
        isSearchingNextJob,
        startWorkRequest,
        addWorkerByLabourNumber,
        addRecommendedWorker,
        removeWorkerFromBooking,
        confirmAgreementDetails,
        confirmAllPendingAgreements,
        selectJobAsActiveAgreement,
        workerConfirmBooking,
        employerRejectBooking,
        switchMatchedWorker,
        rejectWorkerAndShowNext,
        previousWorkerFeedback,
        clearPreviousWorkerFeedback,
        markWorkCompleted,
        submitReview,
        workerNextJob,
        resetDemoBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
