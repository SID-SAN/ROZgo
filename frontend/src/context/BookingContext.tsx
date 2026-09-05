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
  selectJobAsActiveAgreement: (job: JobRecommendation, wage?: number) => BookingAgreement;
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

const INITIAL_ACTIVE_BOOKINGS: BookingAgreement[] = [
  {
    id: 'bk-demo-1',
    bookingNumber: 'RZG-BK-8419',
    workTitle: 'Tap Repair & Washroom Leakage',
    serviceCategory: 'plumber',
    subcategory: 'Tap Repair & Fitting',
    difficulty: 'Intermediate',
    description: 'Bathroom wall mixer dripping continuously, need angle valve servicing.',
    location: 'Tower 4, Sushant Lok 1, Gurgaon',
    employerId: 'e1',
    employerName: 'Rahul Sharma',
    employerPhone: '+91 98111 88234',
    workers: [
      {
        workerId: 'w1',
        name: 'Ramesh Kumar',
        labourNumber: 'RZG-104582',
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80',
      },
    ],
    workersCount: 1,
    date: '12 Sept 2026',
    time: '10:00 AM',
    agreedWage: 1500,
    status: 'confirmed',
    createdAt: '12 Sept 2026, 09:15 AM',
  },
];

const INITIAL_COMPLETED_BOOKINGS: BookingAgreement[] = [
  {
    id: 'bk-comp-1',
    bookingNumber: 'RZG-BK-7302',
    workTitle: 'Kitchen Drain Clearing',
    serviceCategory: 'plumber',
    subcategory: 'Drain Blockage & Cleaning',
    difficulty: 'Easy',
    description: 'Blocked drain trap under kitchen sink.',
    location: 'Sector 54, Gurgaon',
    employerId: 'e2',
    employerName: 'Priya Mehra',
    employerPhone: '+91 98103 44102',
    workers: [
      {
        workerId: 'w10',
        name: 'Amit Kumar',
        labourNumber: 'RZG-849201',
        phone: '+91 98712 34567',
      },
    ],
    workersCount: 1,
    date: '12 Aug 2026',
    time: '02:30 PM',
    agreedWage: 750,
    status: 'completed',
    createdAt: '12 Aug 2026, 01:45 PM',
    completedAt: '12 Aug 2026, 04:00 PM',
    ratingGiven: true,
  },
  {
    id: 'bk-comp-2',
    bookingNumber: 'RZG-BK-6819',
    workTitle: 'Bathroom Tap Replacement & Sealing',
    serviceCategory: 'plumber',
    subcategory: 'Tap & Shower Fitting',
    difficulty: 'Intermediate',
    description: 'Replacing leaking brass mixer tap in master bathroom.',
    location: 'DLF Phase 2, Gurgaon',
    employerId: 'e3',
    employerName: 'Sanjay Sharma',
    employerPhone: '+91 98210 55921',
    workers: [
      {
        workerId: 'w10',
        name: 'Amit Kumar',
        labourNumber: 'RZG-849201',
        phone: '+91 98712 34567',
      },
    ],
    workersCount: 1,
    date: '04 Aug 2026',
    time: '10:00 AM',
    agreedWage: 1200,
    status: 'completed',
    createdAt: '04 Aug 2026, 09:15 AM',
    completedAt: '04 Aug 2026, 12:30 PM',
    ratingGiven: true,
  },
  {
    id: 'bk-comp-3',
    bookingNumber: 'RZG-BK-5904',
    workTitle: 'Overhead Tank Pipeline Joint Repair',
    serviceCategory: 'plumber',
    subcategory: 'Pipeline Installation & Repair',
    difficulty: 'High',
    description: 'Fixing cracked PVC joint connecting terrace overhead storage tank.',
    location: 'Sushant Lok 1, Gurgaon',
    employerId: 'e4',
    employerName: 'Anil Verma',
    employerPhone: '+91 98731 22890',
    workers: [
      {
        workerId: 'w10',
        name: 'Amit Kumar',
        labourNumber: 'RZG-849201',
        phone: '+91 98712 34567',
      },
    ],
    workersCount: 1,
    date: '28 Jul 2026',
    time: '11:30 AM',
    agreedWage: 1650,
    status: 'completed',
    createdAt: '28 Jul 2026, 10:45 AM',
    completedAt: '28 Jul 2026, 03:00 PM',
    ratingGiven: true,
  },
  {
    id: 'bk-comp-4',
    bookingNumber: 'RZG-BK-5211',
    workTitle: 'Water Geyser Inlet Valve & Pipe Leakage',
    serviceCategory: 'plumber',
    subcategory: 'Geyser Installation & Repair',
    difficulty: 'Easy',
    description: 'Replaced rusted brass angle valve and flexible braided hose pipe.',
    location: 'South City 1, Gurgaon',
    employerId: 'e5',
    employerName: 'Kavita Singh',
    employerPhone: '+91 98118 77201',
    workers: [
      {
        workerId: 'w10',
        name: 'Amit Kumar',
        labourNumber: 'RZG-849201',
        phone: '+91 98712 34567',
      },
    ],
    workersCount: 1,
    date: '21 Jul 2026',
    time: '03:15 PM',
    agreedWage: 850,
    status: 'completed',
    createdAt: '21 Jul 2026, 02:30 PM',
    completedAt: '21 Jul 2026, 04:30 PM',
    ratingGiven: true,
  },
  {
    id: 'bk-comp-5',
    bookingNumber: 'RZG-BK-4780',
    workTitle: 'Kitchen Sink Faucet & Mixer Replacement',
    serviceCategory: 'plumber',
    subcategory: 'Tap & Shower Fitting',
    difficulty: 'Intermediate',
    description: 'Removed damaged swivel faucet and fitted chrome quarter-turn mixer.',
    location: 'Sector 45, Gurgaon',
    employerId: 'e6',
    employerName: 'Deepak Joshi',
    employerPhone: '+91 98711 44521',
    workers: [
      {
        workerId: 'w10',
        name: 'Amit Kumar',
        labourNumber: 'RZG-849201',
        phone: '+91 98712 34567',
      },
    ],
    workersCount: 1,
    date: '15 Jul 2026',
    time: '09:30 AM',
    agreedWage: 1100,
    status: 'completed',
    createdAt: '15 Jul 2026, 08:45 AM',
    completedAt: '15 Jul 2026, 11:45 AM',
    ratingGiven: true,
  },
  {
    id: 'bk-comp-6',
    bookingNumber: 'RZG-BK-3912',
    workTitle: 'Submersible Pump Pipe Connection',
    serviceCategory: 'plumber',
    subcategory: 'Motor & Pump Repair',
    difficulty: 'High',
    description: 'Secured high-pressure delivery pipe joint with heavy clamp and non-return valve.',
    location: 'Sector 31, Gurgaon',
    employerId: 'e7',
    employerName: 'Ramesh Chawla',
    employerPhone: '+91 98102 99182',
    workers: [
      {
        workerId: 'w10',
        name: 'Amit Kumar',
        labourNumber: 'RZG-849201',
        phone: '+91 98712 34567',
      },
    ],
    workersCount: 1,
    date: '08 Jul 2026',
    time: '01:00 PM',
    agreedWage: 1450,
    status: 'completed',
    createdAt: '08 Jul 2026, 12:15 PM',
    completedAt: '08 Jul 2026, 03:45 PM',
    ratingGiven: true,
  },
  {
    id: 'bk-comp-7',
    bookingNumber: 'RZG-BK-3105',
    workTitle: 'Bathroom Waste Pipe Clogging & Cleanout',
    serviceCategory: 'plumber',
    subcategory: 'Drain Blockage & Cleaning',
    difficulty: 'Easy',
    description: 'High-pressure rod cleaning through external nahani trap.',
    location: 'Sector 23, Gurgaon',
    employerId: 'e8',
    employerName: 'Sunita Rao',
    employerPhone: '+91 98991 33412',
    workers: [
      {
        workerId: 'w10',
        name: 'Amit Kumar',
        labourNumber: 'RZG-849201',
        phone: '+91 98712 34567',
      },
    ],
    workersCount: 1,
    date: '02 Jul 2026',
    time: '11:00 AM',
    agreedWage: 650,
    status: 'completed',
    createdAt: '02 Jul 2026, 10:20 AM',
    completedAt: '02 Jul 2026, 12:15 PM',
    ratingGiven: true,
  },
];

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
    return INITIAL_ACTIVE_BOOKINGS;
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
    return INITIAL_COMPLETED_BOOKINGS;
  });

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

  const currentJob = MOCK_JOBS[currentJobIndex] || null;

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
      const suitable =
        MOCK_WORKERS.find((w) => w.primarySkill === cat) ||
        MOCK_WORKERS[index % MOCK_WORKERS.length] ||
        MOCK_WORKERS[0];

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
        id: `bk-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
        bookingNumber: `RZG-BK-${Math.floor(1000 + Math.random() * 9000)}`,
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
    const found = MOCK_WORKERS.find(
      (w) => w.labourNumber && w.labourNumber.toUpperCase() === cleaned
    );

    if (!found) {
      return {
        success: false,
        message: `Worker with Labour Number "${cleaned}" was not found. Try RZG-419032 or RZG-620194.`,
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
    const candidate = MOCK_WORKERS.find(
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
          return updated;
        }
        return agr;
      })
    );
    return updatedList;
  };

  const selectJobAsActiveAgreement = (
    job: JobRecommendation,
    wage: number = 1200
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
      status: 'awaiting_confirmation',
      createdAt: 'Just now',
    };

    setActiveAgreements((prev) => [newAgreement, ...prev]);
    return newAgreement;
  };

  const workerConfirmBooking = (agreementId: string, accept: boolean) => {
    setActiveAgreements((prev) =>
      prev.map((agr) => {
        if (agr.id === agreementId || !agreementId) {
          if (accept) {
            return { ...agr, status: 'confirmed' as BookingStatus };
          }
          return {
            ...agr,
            status: 'rejected' as BookingStatus,
            rejectedBy: 'worker',
            rejectionReason: 'Declined by worker',
          };
        }
        return agr;
      })
    );
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

    const sameTradeWorkers = MOCK_WORKERS.filter((w) => w.primarySkill === category);
    const pool = sameTradeWorkers.length > 1 ? sameTradeWorkers : MOCK_WORKERS;
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

    const sameTradeWorkers = MOCK_WORKERS.filter((w) => w.primarySkill === category);
    let nextCandidate: WorkerProfile | null =
      sameTradeWorkers.find((w) => !newRejected.includes(w.id)) || null;
    let noMoreWorkers = false;

    if (!nextCandidate) {
      nextCandidate =
        sameTradeWorkers.find((w) => w.id !== currentId) ||
        MOCK_WORKERS.find((w) => !newRejected.includes(w.id)) ||
        MOCK_WORKERS.find((w) => w.id !== currentId) ||
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
    const targetAgreement = activeAgreements.find((a) => a.id === agreementId) || activeAgreements[0];
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

    setActiveAgreements((prev) => prev.filter((a) => a.id !== targetAgreement.id));
    setCompletedAgreements((prev) => [completed, ...prev]);
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
