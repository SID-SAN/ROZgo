import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Grievance,
  GrievanceStatus,
  GrievancePriority,
  GrievanceEvidence,
  GrievanceMessage,
  UserRole,
} from '../types';
import { INITIAL_MOCK_GRIEVANCES } from '../data/mockGrievances';
import { useAuth } from './AuthContext';

interface RaiseGrievanceParams {
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
  agreedWage?: number;
  actualPaid?: number;
  whoCancelled?: 'worker' | 'employer' | 'both';
  inImmediateDanger?: boolean;
  agreedCallDetails?: string;
  evidence?: GrievanceEvidence[];
}

interface GrievanceContextType {
  grievances: Grievance[];
  userGrievances: Grievance[];
  activeGrievancesCount: number;
  raiseGrievance: (params: RaiseGrievanceParams) => Grievance;
  getGrievanceById: (id: string) => Grievance | undefined;
  addMessage: (grievanceId: string, message: string, attachments?: GrievanceEvidence[]) => void;
  provideRequestedInformation: (grievanceId: string, reply: string) => void;
  requestReconsideration: (grievanceId: string, reason: string) => void;
  // Admin Operations
  adminResolveGrievance: (grievanceId: string, resolution: string) => void;
  adminRequestMoreInfo: (grievanceId: string, question: string) => void;
  adminEscalateGrievance: (grievanceId: string, reason?: string) => void;
  adminUpdatePriority: (grievanceId: string, priority: GrievancePriority) => void;
  adminUpdateStatus: (grievanceId: string, status: GrievanceStatus) => void;
}

const GrievanceContext = createContext<GrievanceContextType | undefined>(undefined);

export const GrievanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, workerUser, employerUser } = useAuth();

  const [grievances, setGrievances] = useState<Grievance[]>(() => {
    const saved = localStorage.getItem('rozgo_grievances');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved grievances:', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('rozgo_grievances', JSON.stringify(grievances));
  }, [grievances]);

  // Current active user details
  const currentUserId = role === 'worker' ? workerUser.id : employerUser.id;
  const currentUserName = role === 'worker' ? workerUser.name : employerUser.name;
  const currentUserPhone = role === 'worker' ? workerUser.phone : employerUser.phone;

  // Filter grievances relevant to this user role/account
  const userGrievances = grievances.filter((g) => {
    // If matching user ID or matching phone
    if (g.userId === currentUserId || g.userPhone === currentUserPhone) return true;
    // Allow demo visibility based on role if created in this session
    return g.userRole === role;
  });

  const activeGrievancesCount = userGrievances.filter(
    (g) => g.status !== 'resolved' && g.status !== 'closed'
  ).length;

  const getGrievanceById = (id: string): Grievance | undefined => {
    return grievances.find((g) => g.id.toUpperCase() === id.trim().toUpperCase());
  };

  const raiseGrievance = (params: RaiseGrievanceParams): Grievance => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const grievanceId = `RG-${year}-00${randomNum}`;

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const timestampStr = `${dateFormatted}, ${timeFormatted}`;

    const priority: GrievancePriority = params.inImmediateDanger
      ? 'critical'
      : params.category === 'safety_concern'
      ? 'high'
      : params.category === 'payment_wage'
      ? 'medium'
      : 'low';

    const newGrievance: Grievance = {
      id: grievanceId,
      userId: currentUserId,
      userName: currentUserName,
      userRole: role,
      userPhone: currentUserPhone,
      category: params.category,
      categoryLabel: params.categoryLabel,
      title: params.title || `${params.categoryLabel} issue reported`,
      description: params.description,
      bookingId: params.bookingId,
      bookingTitle: params.bookingTitle,
      bookingNumber: params.bookingNumber,
      bookingDate: params.bookingDate,
      bookingAmount: params.bookingAmount,
      counterpartyName: params.counterpartyName,
      counterpartyPhone: params.counterpartyPhone,
      agreedWage: params.agreedWage,
      actualPaid: params.actualPaid,
      whoCancelled: params.whoCancelled,
      inImmediateDanger: params.inImmediateDanger,
      agreedCallDetails: params.agreedCallDetails,
      evidence: params.evidence || [],
      status: 'submitted',
      priority,
      createdAt: timestampStr,
      updatedAt: timestampStr,
      timeline: [
        {
          id: `tl-${Date.now()}-1`,
          title: 'Grievance Submitted',
          description: 'Received at ROZGO Redressal Desk. Assigned unique tracking ID.',
          date: timestampStr,
          status: 'submitted',
          completed: true,
          current: true,
        },
        {
          id: `tl-${Date.now()}-2`,
          title: 'Under Review',
          description: 'Case Officer assigned to examine booking details and direct call notes.',
          date: 'Pending',
          status: 'under_review',
          completed: false,
        },
        {
          id: `tl-${Date.now()}-3`,
          title: 'Fair Dispute Assessment',
          description: 'Contacting counterparty for peaceful cooperative resolution.',
          date: 'Pending',
          status: 'decision_made',
          completed: false,
        },
        {
          id: `tl-${Date.now()}-4`,
          title: 'Resolution & Cooperative Settlement',
          description: 'Final closure note provided to both parties.',
          date: 'Pending',
          status: 'resolved',
          completed: false,
        },
      ],
      messages: [
        {
          id: `msg-${Date.now()}-sys`,
          senderId: 'system',
          senderName: 'ROZGO Redressal Bot',
          senderRole: 'support',
          message: `Your grievance ${grievanceId} has been logged in our secure system. An officer from the ROZGO Civic Redressal Desk will review your issue shortly.`,
          timestamp: timestampStr,
        },
      ],
    };

    setGrievances((prev) => [newGrievance, ...prev]);
    return newGrievance;
  };

  const addMessage = (
    grievanceId: string,
    message: string,
    attachments?: GrievanceEvidence[]
  ) => {
    if (!message.trim() && (!attachments || attachments.length === 0)) return;

    const now = new Date();
    const timestamp = `${now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    })} · ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

    const newMsg: GrievanceMessage = {
      id: `m-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: role === 'worker' ? 'worker' : 'employer',
      message: message.trim(),
      timestamp,
      attachments,
    };

    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id === grievanceId) {
          return {
            ...g,
            updatedAt: timestamp,
            messages: [...g.messages, newMsg],
          };
        }
        return g;
      })
    );
  };

  const provideRequestedInformation = (grievanceId: string, reply: string) => {
    const now = new Date();
    const timestamp = `${now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    })} · ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

    const userMsg: GrievanceMessage = {
      id: `m-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: role === 'worker' ? 'worker' : 'employer',
      message: reply.trim(),
      timestamp,
    };

    const sysAck: GrievanceMessage = {
      id: `m-${Date.now() + 1}`,
      senderId: 'sys',
      senderName: 'ROZGO Grievance Desk',
      senderRole: 'support',
      message: 'Thank you for providing the requested clarification. Our review team has resumed case evaluation.',
      timestamp,
    };

    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id === grievanceId) {
          const updatedTimeline = g.timeline.map((item) => {
            if (item.status === 'more_info_needed') {
              return { ...item, completed: true, current: false };
            }
            if (item.status === 'under_review') {
              return { ...item, current: true };
            }
            return item;
          });

          return {
            ...g,
            status: 'under_review',
            infoRequestedPrompt: undefined,
            updatedAt: timestamp,
            timeline: updatedTimeline,
            messages: [...g.messages, userMsg, sysAck],
          };
        }
        return g;
      })
    );
  };

  const requestReconsideration = (grievanceId: string, reason: string) => {
    const now = new Date();
    const timestamp = `${now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    })} · ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

    const requestMsg: GrievanceMessage = {
      id: `m-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: role === 'worker' ? 'worker' : 'employer',
      message: `Request for Reconsideration: ${reason.trim()}`,
      timestamp,
    };

    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id === grievanceId) {
          return {
            ...g,
            status: 'under_review',
            reconsiderationRequested: true,
            reconsiderationReason: reason,
            updatedAt: timestamp,
            messages: [...g.messages, requestMsg],
          };
        }
        return g;
      })
    );
  };

  // -------------------------------------------------------------
  // Admin Redressal Actions
  // -------------------------------------------------------------
  const adminResolveGrievance = (grievanceId: string, resolutionText: string) => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const timestamp = `${dateFormatted} · ${timeFormatted}`;

    const resolutionMsg: GrievanceMessage = {
      id: `m-adm-${Date.now()}`,
      senderId: 'admin-1',
      senderName: 'ROZGO Grievance Officer',
      senderRole: 'admin',
      message: `Grievance Resolved. Official Resolution: ${resolutionText}`,
      timestamp,
    };

    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id === grievanceId) {
          const updatedTimeline = g.timeline.map((item) => {
            if (item.status === 'resolved') {
              return { ...item, completed: true, current: true, date: timestamp };
            }
            return { ...item, completed: true, current: false };
          });

          return {
            ...g,
            status: 'resolved',
            resolution: resolutionText,
            resolvedAt: `${dateFormatted}, ${timeFormatted}`,
            updatedAt: timestamp,
            timeline: updatedTimeline,
            messages: [...g.messages, resolutionMsg],
          };
        }
        return g;
      })
    );
  };

  const adminRequestMoreInfo = (grievanceId: string, question: string) => {
    const now = new Date();
    const timestamp = `${now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    })} · ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

    const questionMsg: GrievanceMessage = {
      id: `m-adm-${Date.now()}`,
      senderId: 'admin-1',
      senderName: 'ROZGO Grievance Officer',
      senderRole: 'admin',
      message: `Additional Information Needed: ${question}`,
      timestamp,
    };

    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id === grievanceId) {
          const updatedTimeline = g.timeline.map((item) => {
            if (item.status === 'more_info_needed') {
              return { ...item, current: true, date: timestamp };
            }
            return item;
          });

          return {
            ...g,
            status: 'more_info_needed',
            infoRequestedPrompt: question,
            updatedAt: timestamp,
            timeline: updatedTimeline,
            messages: [...g.messages, questionMsg],
          };
        }
        return g;
      })
    );
  };

  const adminEscalateGrievance = (grievanceId: string, reason?: string) => {
    const now = new Date();
    const timestamp = `${now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    })} · ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

    const escalationMsg: GrievanceMessage = {
      id: `m-adm-${Date.now()}`,
      senderId: 'admin-1',
      senderName: 'ROZGO Trust & Safety Lead',
      senderRole: 'admin',
      message: `This case has been escalated for high-priority review. ${reason || ''}`,
      timestamp,
    };

    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id === grievanceId) {
          return {
            ...g,
            status: 'escalated',
            priority: 'critical',
            updatedAt: timestamp,
            messages: [...g.messages, escalationMsg],
          };
        }
        return g;
      })
    );
  };

  const adminUpdatePriority = (grievanceId: string, priority: GrievancePriority) => {
    setGrievances((prev) =>
      prev.map((g) => (g.id === grievanceId ? { ...g, priority } : g))
    );
  };

  const adminUpdateStatus = (grievanceId: string, status: GrievanceStatus) => {
    setGrievances((prev) =>
      prev.map((g) => (g.id === grievanceId ? { ...g, status } : g))
    );
  };

  return (
    <GrievanceContext.Provider
      value={{
        grievances,
        userGrievances,
        activeGrievancesCount,
        raiseGrievance,
        getGrievanceById,
        addMessage,
        provideRequestedInformation,
        requestReconsideration,
        adminResolveGrievance,
        adminRequestMoreInfo,
        adminEscalateGrievance,
        adminUpdatePriority,
        adminUpdateStatus,
      }}
    >
      {children}
    </GrievanceContext.Provider>
  );
};

export const useGrievance = (): GrievanceContextType => {
  const context = useContext(GrievanceContext);
  if (!context) {
    throw new Error('useGrievance must be used within a GrievanceProvider');
  }
  return context;
};
