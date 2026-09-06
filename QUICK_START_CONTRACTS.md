# Contract System - Quick Start Guide

## What Was Implemented?

A complete contract management system that allows:
- ✅ Employers to submit contracts with **any wage amount** (no hardcoded prices)
- ✅ Workers to view all their pending contracts
- ✅ Workers to accept or reject contracts
- ✅ All contracts stored securely in Supabase database

## The Problem It Solves

**Before:** Contracts weren't stored anywhere workers could see them. There was no way for workers to formally accept or reject contracts. Wages were hardcoded.

**After:** Contracts are stored in database, visible to workers, and can be accepted/rejected. Each contract has the employer-negotiated wage.

## Key Endpoints (4 New)

### 1️⃣ Employer Submits Contract
```
POST /api/v1/bookings/contracts/submit
```
Worker gets a contract with an exact wage (e.g., 2500, not 1200)

### 2️⃣ Worker Sees Their Contracts  
```
GET /api/v1/bookings/contracts/worker/{worker_id}
```
Returns all pending contracts for that worker

### 3️⃣ Worker Accepts Contract
```
POST /api/v1/bookings/contracts/{contract_id}/accept
```
Work is confirmed, status becomes "active"

### 4️⃣ Worker Rejects Contract
```
POST /api/v1/bookings/contracts/{contract_id}/reject
```
Contract cancelled, employer can try again

## Database Structure

Contracts are stored in the existing `bookings` table with:
- Contract reference: `RZG-CT-XXXX` format
- Worker assignment: Specific `worker_id`
- Wage: `wage_offer` (employer-negotiated, not hardcoded)
- Status: `agreement_pending` → `active` (after acceptance)

## Complete Workflow

```
Step 1: Employer creates initial request
   └─ POST /bookings/request
   └─ Workers get matched based on skill/location

Step 2: Employer & Worker negotiate (phone call - outside system)
   └─ Agree on final wage: 2500

Step 3: Employer submits contract with negotiated wage
   └─ POST /contracts/submit (wage: 2500, not default)
   └─ Contract stored in database

Step 4: Worker views their pending contracts
   └─ GET /contracts/worker/w-ramesh
   └─ Sees full contract details with 2500 wage

Step 5: Worker accepts contract
   └─ POST /contracts/{id}/accept
   └─ Work is confirmed

Step 6: Work completes
   └─ Existing endpoints handle completion, receipt, review
```

## Code Changes Summary

### Files Modified (2 files)
1. **`backend/app/schemas/booking.py`**
   - Added `ContractSubmitSchema` class
   - Added `ContractActionSchema` class

2. **`backend/app/routers/bookings.py`**
   - Added 4 new endpoints
   - Updated imports

### Files Created (3 files)
1. `CONTRACTS_IMPLEMENTATION.md` - Full technical documentation
2. `IMPLEMENTATION_SUMMARY.md` - Detailed summary
3. `backend/tests/test_contracts.py` - Test suite with examples

### Files NOT Changed
- **All frontend files** - As required, no changes to frontend

## How It Handles "No Pre-defined Prices"

**Old way (❌ AVOIDED):**
```python
wageOffer: 1200  # Hardcoded, same for everyone
```

**New way (✅ IMPLEMENTED):**
```
Contract submitted with agreedWage: 2500
└─ Completely flexible
└─ Negotiated between employer and worker
└─ No system defaults applied
```

## For Developers

### Test the Contract Submission
```bash
curl -X POST http://localhost:8000/api/v1/bookings/contracts/submit \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "workerId": "w-ramesh",
    "serviceCategory": "plumber",
    "description": "Fix bathroom plumbing",
    "location": "Gurgaon",
    "date": "2024-09-15",
    "agreedWage": 2500
  }'
```

### Get Worker Contracts
```bash
curl http://localhost:8000/api/v1/bookings/contracts/worker/w-ramesh
```

### Run Tests
```bash
pytest backend/tests/test_contracts.py -v
```

## Security ✅

- Contract submission requires authentication token
- Employer ID extracted from token automatically
- Worker can only see contracts assigned to them
- All data encrypted in Supabase

## What's Next?

Frontend can integrate by:
1. Call `GET /contracts/worker/{worker_id}` on worker dashboard
2. Show contracts in a list
3. Add accept/reject buttons → call POST endpoints
4. Add contract submission form for employers → call POST /contracts/submit
5. All API endpoints are ready to use!

## Questions?

See `CONTRACTS_IMPLEMENTATION.md` for complete API documentation with examples.
