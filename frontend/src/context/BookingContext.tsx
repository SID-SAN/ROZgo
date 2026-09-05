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

interface BookingContextType {
  // Current active agreement for demo/flows
  activeAgreement: BookingAgreement | null;
  // History of completed agreements
  completedAgreements: BookingAgreement[];
  // Matching state for employer
  matchedWorker: WorkerProfile | null;
  additionalWorkers: BookingWorkerItem[];
  // Matching state for worker
  currentJobIndex: number;
  currentJob: JobRecommendation | null;
  isSearchingNextJob: boolean;
  // Methods
  startWorkRequest: (params: {
    serviceCategory: string;
    subcategory: string;
    difficulty: DifficultyLevel;
    description: string;
    location: string;
    preferredDate: string;
    preferredTime: string;
    workersNeeded: number;
  }) => WorkerProfile | null;
  addWorkerByLabourNumber: (labourNo: string) => { success: boolean; message: string; worker?: WorkerProfile };
  addRecommendedWorker: () => boolean;
  removeWorkerFromBooking: (workerId: string) => void;
  confirmAgreementDetails: (params: {
    agreedWage: number;
    date: string;
    time: string;
  }) => BookingAgreement;
  selectJobAsActiveAgreement: (job: JobRecommendation, wage?: number) => BookingAgreement;
  workerConfirmBooking: (agreementId: string, accept: boolean) => void;
  employerRejectBooking: (reason?: string) => void;
  switchMatchedWorker: (nextWorkerId?: string) => WorkerProfile | null;
  rejectWorkerAndShowNext: (reason?: string) => { nextWorker: WorkerProfile | null; noMoreWorkers: boolean };
  previousWorkerFeedback: { workerName: string; reason: string } | null;
  clearPreviousWorkerFeedback: () => void;
  markWorkCompleted: (agreementId: string) => void;
  submitReview: (agreementId: string, rating: number, comment: string, tags?: string[]) => void;
  workerNextJob: () => void;
  resetDemoBooking: () => void;
}

const INITIAL_ACTIVE_BOOKING: BookingAgreement = {
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
      name: 'Amit Kumar',
      labourNumber: 'RZG-849201',
      phone: '+91 98712 34567',
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80',
    },
  ],
  workersCount: 1,
  date: '12 Sept 2026',
  time: '10:00 AM',
  agreedWage: 1500,
  status: 'confirmed',
  createdAt: '12 Sept 2026, 09:15 AM',
};

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
        workerId: 'w1',
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
        workerId: 'w1',
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
        workerId: 'w1',
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
        workerId: 'w1',
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
        workerId: 'w1',
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
        workerId: 'w1',
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
        workerId: 'w1',
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
  const [activeAgreement, setActiveAgreement] = useState<BookingAgreement | null>(() => {
    const saved = localStorage.getItem('rozgo_active_agreement');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_ACTIVE_BOOKING;
  });

  const [completedAgreements, setCompletedAgreements] = useState<BookingAgreement[]>(() => {
    const saved = localStorage.getItem('rozgo_completed_agreements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_COMPLETED_BOOKINGS.length) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_COMPLETED_BOOKINGS;
  });

  const [matchedWorker, setMatchedWorker] = useState<WorkerProfile | null>(MOCK_WORKERS[0]);
  const [additionalWorkers, setAdditionalWorkers] = useState<BookingWorkerItem[]>([]);
  const [rejectedWorkerIds, setRejectedWorkerIds] = useState<string[]>([]);
  const [previousWorkerFeedback, setPreviousWorkerFeedback] = useState<{
    workerName: string;
    reason: string;
  } | null>(null);

  const clearPreviousWorkerFeedback = () => setPreviousWorkerFeedback(null);

  // Worker match recommendations
  const [currentJobIndex, setCurrentJobIndex] = useState<number>(0);
  const [isSearchingNextJob, setIsSearchingNextJob] = useState<boolean>(false);

  useEffect(() => {
    if (activeAgreement) {
      localStorage.setItem('rozgo_active_agreement', JSON.stringify(activeAgreement));
    } else {
      localStorage.removeItem('rozgo_active_agreement');
    }
  }, [activeAgreement]);

  useEffect(() => {
    localStorage.setItem('rozgo_completed_agreements', JSON.stringify(completedAgreements));
  }, [completedAgreements]);

  const currentJob = MOCK_JOBS[currentJobIndex] || null;

  const startWorkRequest = (params: {
    serviceCategory: string;
    subcategory: string;
    difficulty: DifficultyLevel;
    description: string;
    location: string;
    preferredDate: string;
    preferredTime: string;
    workersNeeded: number;
  }): WorkerProfile | null => {
    setRejectedWorkerIds([]);
    setPreviousWorkerFeedback(null);

    // Find workers matching category
    const suitableWorker =
      MOCK_WORKERS.find((w) => w.primarySkill === params.serviceCategory) || MOCK_WORKERS[0];

    setMatchedWorker(suitableWorker);
    setAdditionalWorkers([]);

    // Initialize draft agreement
    const newBooking: BookingAgreement = {
      id: `bk-${Date.now()}`,
      bookingNumber: `RZG-BK-${Math.floor(1000 + Math.random() * 9000)}`,
      workTitle: `${params.subcategory} (${params.difficulty})`,
      serviceCategory: params.serviceCategory,
      subcategory: params.subcategory,
      difficulty: params.difficulty,
      description: params.description,
      location: params.location,
      employerId: 'e1',
      employerName: 'Rahul Sharma',
      employerPhone: '+91 98111 88234',
      workers: [
        {
          workerId: suitableWorker.id,
          name: suitableWorker.name,
          labourNumber: suitableWorker.labourNumber,
          phone: suitableWorker.phone,
          avatar: suitableWorker.avatar,
        },
      ],
      workersCount: params.workersNeeded || 1,
      date: params.preferredDate || 'Today',
      time: params.preferredTime || '11:00 AM',
      agreedWage: 1200,
      status: 'matching',
      createdAt: new Date().toLocaleString(),
    };

    setActiveAgreement(newBooking);
    return suitableWorker;
  };

  const addWorkerByLabourNumber = (labourNo: string) => {
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

    // Check if already added
    const alreadyAdded =
      matchedWorker?.id === found.id ||
      additionalWorkers.some((w) => w.workerId === found.id);

    if (alreadyAdded) {
      return {
        success: false,
        message: `${found.name} is already included in this work booking.`,
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

    if (activeAgreement) {
      setActiveAgreement((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          workers: [...prev.workers, newItem],
          workersCount: prev.workers.length + 1,
        };
      });
    }

    return {
      success: true,
      message: `Added ${found.name} (${found.labourNumber}) to booking!`,
      worker: found,
    };
  };

  const addRecommendedWorker = (): boolean => {
    // Pick another worker not yet in list
    const candidate = MOCK_WORKERS.find(
      (w) =>
        w.id !== matchedWorker?.id &&
        !additionalWorkers.some((item) => item.workerId === w.id)
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

    if (activeAgreement) {
      setActiveAgreement((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          workers: [...prev.workers, newItem],
          workersCount: prev.workers.length + 1,
        };
      });
    }

    return true;
  };

  const removeWorkerFromBooking = (workerId: string) => {
    setAdditionalWorkers((prev) => prev.filter((w) => w.workerId !== workerId));
    if (activeAgreement) {
      setActiveAgreement((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          workers: prev.workers.filter((w) => w.workerId !== workerId),
          workersCount: Math.max(1, prev.workers.length - 1),
        };
      });
    }
  };

  const confirmAgreementDetails = (params: {
    agreedWage: number;
    date: string;
    time: string;
  }): BookingAgreement => {
    const updated: BookingAgreement = {
      ...(activeAgreement || INITIAL_ACTIVE_BOOKING),
      agreedWage: params.agreedWage,
      date: params.date,
      time: params.time,
      status: 'awaiting_confirmation',
    };
    setActiveAgreement(updated);
    return updated;
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
          name: 'Amit Kumar',
          labourNumber: 'RZG-849201',
          phone: '+91 98712 34567',
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
    setActiveAgreement(newAgreement);
    return newAgreement;
  };

  const workerConfirmBooking = (_agreementId: string, accept: boolean) => {
    if (!activeAgreement) return;
    if (accept) {
      setActiveAgreement((prev) => (prev ? { ...prev, status: 'confirmed' } : null));
    } else {
      setActiveAgreement((prev) =>
        prev
          ? {
              ...prev,
              status: 'rejected',
              rejectedBy: 'worker',
              rejectionReason: 'Declined by worker',
            }
          : null
      );
    }
  };

  const employerRejectBooking = (reason?: string) => {
    if (!activeAgreement) return;
    setActiveAgreement((prev) =>
      prev
        ? {
            ...prev,
            status: 'rejected',
            rejectedBy: 'employer',
            rejectionReason: reason || 'Declined by employer',
          }
        : null
    );
  };

  const switchMatchedWorker = (nextWorkerId?: string): WorkerProfile | null => {
    const currentId = nextWorkerId || matchedWorker?.id;
    const category = activeAgreement?.serviceCategory || 'plumber';
    const sameTradeWorkers = MOCK_WORKERS.filter((w) => w.primarySkill === category);
    const pool = sameTradeWorkers.length > 1 ? sameTradeWorkers : MOCK_WORKERS;
    const nextWorker = pool.find((w) => w.id !== currentId) || pool[0];

    if (!nextWorker) return null;

    setMatchedWorker(nextWorker);
    setAdditionalWorkers([]);

    if (activeAgreement) {
      setActiveAgreement((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'matching',
          rejectionReason: undefined,
          rejectedBy: undefined,
          workers: [
            {
              workerId: nextWorker.id,
              name: nextWorker.name,
              labourNumber: nextWorker.labourNumber,
              phone: nextWorker.phone,
              avatar: nextWorker.avatar,
            },
          ],
          workersCount: 1,
        };
      });
    }

    return nextWorker;
  };

  const rejectWorkerAndShowNext = (
    reason?: string
  ): { nextWorker: WorkerProfile | null; noMoreWorkers: boolean } => {
    const currentWorker = matchedWorker;
    const category = activeAgreement?.serviceCategory || currentWorker?.primarySkill || 'plumber';
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

    // Find next available worker in this specific trade who has not been rejected yet
    const sameTradeWorkers = MOCK_WORKERS.filter((w) => w.primarySkill === category);
    let nextCandidate: WorkerProfile | null =
      sameTradeWorkers.find((w) => !newRejected.includes(w.id)) || null;
    let noMoreWorkers = false;

    if (!nextCandidate) {
      // If all workers in this trade were rejected in current session, pick the other available worker
      nextCandidate =
        sameTradeWorkers.find((w) => w.id !== currentId) ||
        MOCK_WORKERS.find((w) => !newRejected.includes(w.id)) ||
        MOCK_WORKERS.find((w) => w.id !== currentId) ||
        null;
      noMoreWorkers = true;
    }

    if (nextCandidate) {
      setMatchedWorker(nextCandidate);
      setAdditionalWorkers([]);

      if (activeAgreement) {
        setActiveAgreement((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: 'matching',
            rejectionReason: undefined,
            rejectedBy: undefined,
            workers: [
              {
                workerId: nextCandidate!.id,
                name: nextCandidate!.name,
                labourNumber: nextCandidate!.labourNumber,
                phone: nextCandidate!.phone,
                avatar: nextCandidate!.avatar,
              },
            ],
            workersCount: 1,
          };
        });
      }
    }

    return { nextWorker: nextCandidate, noMoreWorkers };
  };

  const markWorkCompleted = (_agreementId: string) => {
    if (!activeAgreement) return;
    const completed: BookingAgreement = {
      ...activeAgreement,
      status: 'completed',
      completedAt: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };
    setActiveAgreement(completed);
    setCompletedAgreements((prev) => [completed, ...prev]);
  };

  const submitReview = (
    _agreementId: string,
    rating: number,
    comment: string,
    tags?: string[]
  ) => {
    if (activeAgreement) {
      setActiveAgreement((prev) => (prev ? { ...prev, ratingGiven: true } : null));
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      authorName: 'Rahul Sharma',
      authorRole: 'employer',
      rating,
      comment,
      date: 'Today',
      jobTitle: activeAgreement?.workTitle || 'Completed Work',
      tags,
    };

    // Append review to first worker
    if (MOCK_WORKERS[0]) {
      MOCK_WORKERS[0].reviews = [newReview, ...MOCK_WORKERS[0].reviews];
      MOCK_WORKERS[0].completedJobsCount += 1;
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
    setActiveAgreement(INITIAL_ACTIVE_BOOKING);
  };

  return (
    <BookingContext.Provider
      value={{
        activeAgreement,
        completedAgreements,
        matchedWorker,
        additionalWorkers,
        currentJobIndex,
        currentJob,
        isSearchingNextJob,
        startWorkRequest,
        addWorkerByLabourNumber,
        addRecommendedWorker,
        removeWorkerFromBooking,
        confirmAgreementDetails,
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

