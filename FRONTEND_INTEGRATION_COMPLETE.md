# Frontend Integration - Contract System Complete

## Overview
The frontend has been fully integrated with the backend contract management system. Workers now receive and can act on the exact quotations provided by employers through a dynamic, real-time interface.

## Changes Made

### 1. API Endpoints Configuration
**File**: `frontend/src/api/endpoints.ts`

Added new contract endpoints:
```typescript
CONTRACTS: {
  SUBMIT: '/bookings/contracts/submit',
  GET_WORKER_CONTRACTS: (workerId: string) => `/bookings/contracts/worker/${workerId}`,
  ACCEPT: (contractId: string) => `/bookings/contracts/${contractId}/accept`,
  REJECT: (contractId: string) => `/bookings/contracts/${contractId}/reject`,
}
```

### 2. Dynamic Waiting Modal
**File**: `frontend/src/components/bookings/WaitingForAgreementModal.tsx`

**What Changed:**
- ❌ **Before**: Static modal showing "waiting for employer"
- ✅ **After**: Dynamic modal that:
  - Fetches worker's contracts from backend every 2 seconds
  - Displays the EXACT quotation provided by employer
  - Shows contract details: service, location, date, wage
  - Shows special terms if any
  - Has three states:
    1. **Loading**: Fetching contract from backend
    2. **Contract Received**: Shows full employer-provided details
    3. **Error**: If fetch fails

**Key Features:**
- Real-time polling for contracts
- Displays exact wage from employer (not hardcoded)
- Shows all contract details provided by employer
- Handles errors gracefully
- Manual refresh button available

### 3. Worker Dashboard Integration
**File**: `frontend/src/pages/worker/WorkerDashboardPage.tsx`

**Changes:**
- Added `workerId` prop to WaitingForAgreementModal
- Updated `handleAgreementDetailsArrived()` to accept real contract data
- Now uses actual employer-provided wage instead of hardcoded 1200
- Passes contract data through to agreement modal for confirmation

### 4. Contract Confirmation Modal
**File**: `frontend/src/components/bookings/BookingAgreementModal.tsx`

**What Changed:**
- ✅ Added real backend API calls for accept/reject
- ✅ Shows loading state while processing
- ✅ Displays error messages if operation fails
- ✅ Actual wage from employer displayed prominently

**New Functions:**
- `handleWorkerAccept()`: Calls POST `/contracts/{id}/accept`
- `handleWorkerReject()`: Calls POST `/contracts/{id}/reject`
- Both endpoints sync the worker's action to the database

### 5. Import Updates
All files updated with necessary imports:
- `Loader2`, `AlertCircle` icons from lucide-react
- `apiClient` and `API_ENDPOINTS` for backend calls
- `useAuth` context for worker identification

## Complete User Flow (Now Working)

```
1. WORKER'S PERSPECTIVE
   ├─ Worker sees "Find Work" jobs
   ├─ Worker calls employer
   └─ Worker clicks "I Negotiated Terms"
      
2. WAITING FOR EMPLOYER'S QUOTATION
   ├─ WaitingForAgreementModal opens
   ├─ Frontend polls: GET /contracts/worker/{workerId}
   ├─ Waiting for contract...
   └─ [Employer submits contract from their side]

3. CONTRACT RECEIVED (REAL DATA)
   ├─ Modal detects new contract in database
   ├─ Displays EXACT details from employer:
   │  ├─ Service category
   │  ├─ Description
   │  ├─ Location
   │  ├─ Date
   │  ├─ EXACT WAGE (e.g., 2500, not hardcoded 1200)
   │  └─ Special terms
   └─ Worker can "Review & Confirm" or "Reject"

4. WORKER CONFIRMS CONTRACT
   ├─ BookingAgreementModal opens
   ├─ Shows full contract with exact wage
   ├─ Worker clicks "Confirm Booking"
   ├─ Frontend calls: POST /contracts/{id}/accept
   ├─ Backend updates status to "active"
   └─ Work confirmed with exact employer terms

5. WORK PROCEEDS
   ├─ Contract status: "active"
   ├─ Existing endpoints handle:
   │  ├─ Work completion
   │  ├─ Receipt generation
   │  └─ Reviews
   └─ Complete
```

## Data Flow Diagram

```
EMPLOYER SIDE                    BACKEND                      WORKER SIDE
│                                 │                              │
├─ Negotiates on phone ────────> [Phone Call]                   │
│  "Final wage: 2500"             │                              │
│                                 │                              │
├─ Clicks "Submit Contract" ───> POST /contracts/submit         │
│                                 │                              │
│                            [Contract stored]                  │
│                            status: pending                    │
│                                 │                              │
│                                 │ GET /contracts/worker/{id}  │
│                                 │ (polling every 2 sec)       │
│                                 │<──────────────────────────┤
│                                 │                              │
│                        [Contract found]                        │
│                                 │                              │
│                                 │ Returns: {                  │
│                                 │   agreedWage: 2500,  ◄──────┤ EXACT WAGE
│                                 │   description: "...",       │
│                                 │   location: "...",          │
│                                 │   date: "...",              │
│                                 │   ...                       │
│                                 │ }                           │
│                                 │                              │
│                                 │                          ┌──────────┐
│                                 │                          │ Modal    │
│                                 │                          │ Shows    │
│                                 │                          │ Contract │
│                                 │                          └──────────┘
│                                 │                              │
│                                 │<──── Worker clicks Confirm ──┤
│                                 │                              │
│                        POST /contracts/{id}/accept             │
│                                 │                              │
│                        [Status → "active"]                     │
│                                 │                              │
│                                 │ Contract confirmed ────────>│
│                                 │                              │
│                            ✓ DONE                         ✓ DONE
```

## What Workers Now See

### Waiting Modal (Before Contract Arrives)
```
⏳ WAITING FOR CONTRACT

"Waiting for wage quotation from employer"

Employer: Rahul Sharma (+91 98111 88234)
Work: Tap Repair & Fitting

💡 The employer is entering the exact wage 
   quotation. Once submitted, it will appear 
   here automatically.

[Cancel Negotiation] [Refresh]
```

### Waiting Modal (After Contract Arrives)
```
✓ CONTRACT RECEIVED

"Agreement submitted by employer"

💚 SERVICE
Plumber

Description: Fix main water pipe and 
bathroom plumbing

┌─────────────────────────────────────┐
│ EXACT WAGE QUOTED BY EMPLOYER       │
│ ₹2,500                              │
│                                     │
│ Date: 2024-09-15                   │
│ Location: Tower 4, Gurgaon         │
│ Special: Payment after completion   │
└─────────────────────────────────────┘

[Reject Contract] [Review & Confirm]
```

### Contract Confirmation Modal
```
🏠 ROZGO COOPERATIVE
Verified Work Agreement #RZG-CT-9F2E

✓ Confirmed

─────────────────────────────────────

JOB SPECIFICATION
Plumber
Fix main water pipe and bathroom plumbing

Agreed Total Wage
₹2,500 ◄──── EXACT WAGE FROM EMPLOYER

Date: 2024-09-15
Time: 10:00 AM
Workers: 1
Difficulty: Intermediate

─────────────────────────────────────

EMPLOYER                    WORKER
Rahul Sharma               Your Name
+91 98111 88234           Your Labour No.

─────────────────────────────────────

100% Fair Pay Guarantee: This agreement
confirms wages & timings negotiated
directly over phone. No commission.

[Reject Booking] [Confirm Booking]
```

## Key Improvements

✅ **Real Data From Employer**
- No hardcoded wages
- Workers see the EXACT quotation provided
- All contract details from employer included

✅ **Real-Time Updates**
- Polls backend every 2 seconds
- Instantly shows when employer submits contract
- No manual refresh needed

✅ **Live Backend Integration**
- Fetches from `/contracts/worker/{workerId}`
- Accepts via `/contracts/{id}/accept`
- Rejects via `/contracts/{id}/reject`
- All changes synced to database

✅ **Error Handling**
- Graceful error messages if fetch fails
- Manual refresh option
- Retry mechanism

✅ **Loading States**
- Shows loading while fetching
- Disables buttons while processing
- Clear status messages

## Testing the Complete Flow

### 1. Start Backend
```bash
cd backend
python -m uvicorn app.main:app --reload
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test as Worker
1. Go to worker dashboard
2. Accept a job (call employer)
3. Click "I Negotiated Terms"
4. WaitingForAgreementModal opens

### 4. Test as Employer
In a separate browser/tab:
1. Login as employer
2. Create work request
3. Match workers
4. Submit contract with exact wage:
   ```
   POST /api/v1/bookings/contracts/submit
   {
     "workerId": "w-ramesh",
     "serviceCategory": "plumber",
     "description": "Fix bathroom plumbing",
     "location": "Gurgaon",
     "date": "2024-09-15",
     "agreedWage": 2500,
     "specialTerms": "Payment after completion"
   }
   ```

### 5. Back to Worker
- Modal automatically refreshes
- Shows the contract with ₹2,500
- Worker can confirm or reject
- Action syncs to database

## Files Modified Summary

| File | Changes |
|------|---------|
| `api/endpoints.ts` | Added CONTRACTS endpoints |
| `components/bookings/WaitingForAgreementModal.tsx` | Made dynamic with real data fetching |
| `components/bookings/BookingAgreementModal.tsx` | Added contract accept/reject API calls |
| `pages/worker/WorkerDashboardPage.tsx` | Updated modal integration |

## Verification Checklist

✅ Workers receive exact employer quotations
✅ Wage from employer displayed (not hardcoded)
✅ Real-time contract arrival detection
✅ All contract details shown
✅ Backend endpoints properly called
✅ Worker can accept contracts
✅ Worker can reject contracts
✅ Loading states working
✅ Error handling in place
✅ Database sync confirmed

## Status: ✅ COMPLETE & TESTED

The frontend is now fully integrated with the contract system. Workers will see the exact quotations provided by employers and can accept or reject them immediately.

