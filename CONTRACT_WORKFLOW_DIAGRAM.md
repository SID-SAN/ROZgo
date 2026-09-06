# Contract Workflow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ROZgo Backend API                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  POST /bookings/request          POST /bookings/match            │
│  (Initial work request)          (Find matching workers)         │
│       │                                  │                       │
│       └──────────────┬───────────────────┘                       │
│                      ▼                                           │
│           💼 Initial Booking Created                             │
│              (wage_offer: 1200, status: requested)               │
│                      │                                           │
│                      ▼                                           │
│         👨‍💼 Employer negotiates with Worker                      │
│            (Phone call - outside system)                         │
│         Final agreed wage: 2500                                  │
│                      │                                           │
│                      ▼                                           │
│  ═══════════════════════════════════════════════════════════════│
│                 ✨ NEW CONTRACT SYSTEM ✨                        │
│  ═══════════════════════════════════════════════════════════════│
│                      │                                           │
│  POST /contracts/submit (with agreedWage: 2500)                  │
│       │                                                          │
│       ▼                                                          │
│  ✅ Employer submits contract                                   │
│     • workerId: "w-ramesh"                                       │
│     • agreedWage: 2500 (from negotiation, NOT hardcoded)         │
│     • description: "Fix bathroom plumbing"                       │
│     • location: "Gurgaon"                                        │
│     • specialTerms: "Payment after completion"                   │
│       │                                                          │
│       ▼                                                          │
│  💾 Contract Stored in Supabase                                  │
│     ┌─────────────────────────────────────┐                     │
│     │ bookings table                       │                    │
│     ├─────────────────────────────────────┤                     │
│     │ id: UUID                             │                    │
│     │ booking_reference: RZG-CT-XXXX       │                    │
│     │ worker_id: w-ramesh                  │                    │
│     │ wage_offer: 2500  ← EXACT AMOUNT     │                    │
│     │ status: agreement_pending            │                    │
│     │ agreement_confirmed_by_worker: FALSE │                    │
│     └─────────────────────────────────────┘                     │
│       │                                                          │
│       ▼                                                          │
│  GET /contracts/worker/w-ramesh                                  │
│       │                                                          │
│       ▼                                                          │
│  👷 Worker views pending contracts                               │
│     [{                                                          │
│       id: "550e8400-...",                                        │
│       agreedWage: 2500,                                          │
│       description: "Fix bathroom plumbing",                      │
│       status: "agreement_pending",                               │
│       employerName: "Rahul Sharma"                               │
│     }]                                                           │
│       │                                                          │
│       ├─────────────────┬─────────────────┐                     │
│       │                 │                 │                     │
│       ▼                 ▼                 ▼                     │
│  Accept?          Reject?           View More?                  │
│       │                 │                                       │
│       ▼                 ▼                                       │
│  POST /contracts/{id}/accept    POST /contracts/{id}/reject      │
│       │                                 │                       │
│       ▼                                 ▼                       │
│  ✅ Status: ACTIVE          ❌ Status: CANCELLED                │
│  Worker confirmed            Employer can resubmit             │
│  Work begins!                or find different worker          │
│       │                                                          │
│       ▼                                                          │
│  📞 Existing endpoints handle:                                   │
│     • Work completion                                           │
│     • Receipt generation                                        │
│     • Review submission                                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌────────────────────────────────────────────────────────────────────┐
│ EMPLOYER SIDE                                                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Creates Work Request                                           │
│     └─ POST /bookings/request                                      │
│        (wage_offer: 1200, just for matching)                       │
│                                                                     │
│  2. Receives matched workers                                       │
│     └─ Workers in suggested_workers list                           │
│                                                                     │
│  3. Calls worker on phone                                          │
│     └─ Negotiate terms                                             │
│        • Job scope                                                 │
│        • Final wage: 2500                                          │
│        • Schedule                                                  │
│                                                                     │
│  4. Submits Contract with NEGOTIATED WAGE                          │
│     └─ POST /contracts/submit                                      │
│        {                                                           │
│          workerId: "w-ramesh",                                     │
│          agreedWage: 2500,  ← ACTUAL AGREED AMOUNT               │
│          description: "...",                                       │
│          location: "..."                                           │
│        }                                                           │
│                                                                     │
│  5. Waits for worker response                                      │
│     └─ Stored in DB with status "agreement_pending"               │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ WORKER SIDE                                                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Receives notification/checks dashboard                         │
│     └─ GET /contracts/worker/w-ramesh                              │
│                                                                     │
│  2. Sees pending contracts with details                            │
│     ├─ Job description                                             │
│     ├─ Location                                                    │
│     ├─ Date & Time                                                 │
│     ├─ AGREED WAGE: 2500  ← Not guessing, exact amount             │
│     └─ Employer info                                               │
│                                                                     │
│  3. Reviews contract                                               │
│     ├─ Checks if wage is acceptable                                │
│     ├─ Verifies job scope matches discussion                       │
│     └─ Confirms location and timing                                │
│                                                                     │
│  4. ACCEPTS or REJECTS                                             │
│     ├─ Accept: POST /contracts/{id}/accept                         │
│     │  └─ Status changes to "active"                               │
│     │  └─ Work is confirmed with all details                       │
│     └─ Reject: POST /contracts/{id}/reject                         │
│        └─ Status changes to "cancelled"                            │
│        └─ Employer can submit new contract                         │
│                                                                     │
│  5. If accepted: Work begins                                       │
│     └─ Existing endpoints handle completion, receipt, reviews      │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

## Status Transitions

```
┌─────────────────┐
│   SUBMITTED     │
│ (agreement_     │
│  pending)       │
└────────┬────────┘
         │
         ├──────────────────────────────────────┐
         │                                      │
         ▼                                      ▼
    ┌────────────┐                      ┌──────────────┐
    │  ACCEPTED  │                      │  REJECTED    │
    │ (active)   │                      │(cancelled)   │
    └────────────┘                      └──────────────┘
         │
         ▼
    ┌────────────┐
    │ COMPLETED  │
    │(completed) │
    └────────────┘
```

## Contract Structure (JSON Response)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "bookingReference": "RZG-CT-ABCD",
  "serviceCategory": "plumber",
  "jobTitle": "plumber Contract",
  "description": "Fix main water pipe and bathroom plumbing",
  "location": "Tower 4, Sushant Lok 1, Gurgaum",
  "date": "2024-09-15",
  "agreedWage": 2500.0,
  "specialTerms": "Payment after completion, include materials",
  "status": "agreement_pending",
  "employerName": "Rahul Sharma",
  "employerPhone": "+91 98111 88234",
  "confirmedByWorker": false,
  "createdAt": "2024-09-06T10:30:00Z"
}
```

## Key Differences: Before vs After

### BEFORE ❌
```
Employer → Work Request (wage: 1200) → Worker matched
                ↓
           Workers listed
                ↓
           ??? Worker doesn't know if they're accepted
           ??? No contract storage
           ??? No accept/reject option
           ??? Wage is hardcoded to 1200
```

### AFTER ✅
```
Employer → Work Request → Negotiate (phone) → 
  Submit Contract with agreedWage: 2500 →
  Contract stored in DB →
  Worker sees contract →
  Worker can Accept/Reject →
  Work confirmed with all details
```

## No Hardcoded Prices Example

```python
# OLD WAY (❌ WRONG)
apiClient.post('/bookings/request', {
  wageOffer: 1200  # Always 1200, hardcoded
})

# NEW WAY (✅ CORRECT)
apiClient.post('/bookings/contracts/submit', {
  workerId: "w-ramesh",
  agreedWage: 2500  // Employer decides, fully negotiated
})
```

## Summary

The contract system ensures:
1. **Contracts are stored** - Permanently in Supabase
2. **Workers can see them** - Via GET /contracts/worker/{id}
3. **Workers can respond** - Accept or reject
4. **Wages are negotiated** - No hardcoded defaults
5. **Employer controls terms** - Not system defaults
6. **Everything is tracked** - Full audit trail
