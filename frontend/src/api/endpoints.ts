/**
 * ROZGO Central API Endpoints
 * When connecting to your real backend, these endpoints map directly to your REST or GraphQL server.
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN_OTP: '/auth/otp/send',
    VERIFY_OTP: '/auth/otp/verify',
    LOGIN_PASSWORD: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  WORKERS: {
    LIST: '/workers',
    GET_BY_ID: (id: string) => `/workers/${id}`,
    GET_BY_LABOUR_NO: (labourNo: string) => `/workers/labour-no/${labourNo}`,
    UPDATE_PROFILE: '/workers/profile',
    RECOMMENDED_JOBS: '/workers/jobs/recommended',
  },
  EMPLOYERS: {
    GET_BY_ID: (id: string) => `/employers/${id}`,
    UPDATE_PROFILE: '/employers/profile',
  },
  SERVICES: {
    LIST: '/services',
    CATEGORIES: '/services/categories',
  },
  BOOKINGS: {
    CREATE_REQUEST: '/bookings/request',
    MATCH_WORKERS: '/bookings/match',
    CONFIRM_AGREEMENT: '/bookings/agreement/confirm',
    GET_BY_ID: (id: string) => `/bookings/${id}`,
    LIST_ACTIVE: '/bookings/active',
    COMPLETE_WORK: (id: string) => `/bookings/${id}/complete`,
    SUBMIT_REVIEW: (id: string) => `/bookings/${id}/review`,
  },
  CONTRACTS: {
    SUBMIT: '/bookings/contracts/submit',
    GET_WORKER_CONTRACTS: (workerId: string) => `/bookings/contracts/worker/${workerId}`,
    ACCEPT: (contractId: string) => `/bookings/contracts/${contractId}/accept`,
    REJECT: (contractId: string) => `/bookings/contracts/${contractId}/reject`,
  },
};

