# ROZgo Contract Management System Implementation

## Overview
This document describes the contract management system that allows employers to submit negotiated contracts and workers to view, accept, or reject them through the database and API.

## Key Features
- Employers can submit detailed contracts with negotiated wages directly to workers
- No pre-defined/hardcoded prices - each contract has an employer-negotiated wage
- Contracts are stored in Supabase and immediately accessible to workers
- Workers can see all pending contracts assigned to them
- Workers can accept or reject contracts with optional reasons

## Database Schema
Contracts are stored in the existing `bookings` table with the following relevant fields:
- `id`: UUID primary key
- `booking_reference`: Unique reference number (RZG-CT-XXXX for contracts)
- `employer_id`: References employer_profiles
- `worker_id`: References worker_profiles  
- `service_id`: Service category (plumber, electrician, etc.)
- `job_title`: Title of the work
- `description`: Detailed job description
- `location`: Work location/address
- `date`: Work date
- `wage_offer`: The negotiated wage (NO pre-defined/default values)
- `wage_type`: Payment type (daily, hourly, etc.)
- `duration_days`: Duration of work
- `special_terms`: Any special terms or conditions
- `status`: "agreement_pending" (awaiting worker acceptance) or "active" (accepted)
- `agreement_confirmed_by_employer`: TRUE for contracts (employer submits them)
- `agreement_confirmed_by_worker`: FALSE until worker accepts
- `created_at`: Timestamp when contract was created

## New API Endpoints

### 1. Submit Contract (Employer Action)
**POST** `/api/v1/bookings/contracts/submit`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "workerId": "w-ramesh",
  "serviceCategory": "plumber",
  "description": "Replace main water pipe and fix bathroom leakage",
  "location": "Tower 4, Sushant Lok 1, Gurgaon",
  "date": "2024-09-15",
  "time": "10:00 AM",
  "agreedWage": 2500,
  "specialTerms": "Payment after completion, include materials cost",
  "duration": 2
}
```

**Response:**
```json
{
  "success": true,
  "contractId": "ct-a1b2c3d4",
  "bookingReference": "RZG-CT-9F2E",
  "workerId": "w-ramesh",
  "agreedWage": 2500,
  "status": "agreement_pending",
  "message": "Contract submitted successfully. Waiting for worker acceptance."
}
```

### 2. Get Worker's Pending Contracts
**GET** `/api/v1/bookings/contracts/worker/{worker_id}`

**Response:**
```json
{
  "contracts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "bookingReference": "RZG-CT-9F2E",
      "serviceCategory": "plumber",
      "jobTitle": "plumber Contract",
      "description": "Replace main water pipe and fix bathroom leakage",
      "location": "Tower 4, Sushant Lok 1, Gurgaon",
      "date": "2024-09-15",
      "agreedWage": 2500,
      "specialTerms": "Payment after completion, include materials cost",
      "status": "agreement_pending",
      "employerName": "Rahul Sharma",
      "employerPhone": "+91 98111 88234",
      "confirmedByWorker": false,
      "createdAt": "2024-09-06T10:30:00Z"
    }
  ],
  "count": 1
}
```

### 3. Worker Accepts Contract
**POST** `/api/v1/bookings/contracts/{contract_id}/accept`

**Response:**
```json
{
  "success": true,
  "contractId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Contract accepted successfully. Work arrangement confirmed!"
}
```

Updates contract status to "active" and sets `agreement_confirmed_by_worker` to TRUE.

### 4. Worker Rejects Contract
**POST** `/api/v1/bookings/contracts/{contract_id}/reject`

**Request Body:**
```json
{
  "contractId": "550e8400-e29b-41d4-a716-446655440000",
  "action": "reject",
  "rejectReason": "Wage too low for 2-day work"
}
```

**Response:**
```json
{
  "success": true,
  "contractId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Contract rejected successfully."
}
```

Updates contract status to "cancelled" and stores the rejection reason.

## Workflow

### Current Flow (with Contract System)
1. **Employer creates initial work request** (POST `/bookings/request`)
   - Current frontend sends a suggested wage (1200)
   - This creates initial matching and communication

2. **Workers are matched** (POST `/bookings/match`)
   - System finds suitable workers based on skill/location

3. **Employer and Worker Negotiate** (Out of system - Phone call)
   - Employer calls matched worker
   - They discuss final wage, date, terms
   - Agree on specific amount (e.g., 2500)

4. **Employer Submits Negotiated Contract** (POST `/bookings/contracts/submit`)
   - Employer specifies exact worker ID
   - Includes the agreed wage (no defaults used)
   - Includes job details and special terms
   - Contract is stored in database with status "agreement_pending"

5. **Worker Views Contracts** (GET `/bookings/contracts/worker/{worker_id}`)
   - Worker sees all pending contracts sent to them
   - Each contract shows full details including the negotiated wage
   - Worker can review before accepting

6. **Worker Accepts/Rejects** (POST `/bookings/contracts/{id}/accept` or `/reject`)
   - Worker accepts → Status becomes "active", work is confirmed
   - Worker rejects → Status becomes "cancelled", employer can submit new contract or find another worker

7. **Work Completion**
   - Existing endpoints handle work completion, receipts, and reviews

## Key Design Decisions

### 1. No Pre-defined Prices
- Contracts always include an `agreedWage` specified by the employer
- This wage is completely flexible and negotiated between employer and worker
- No system defaults or pre-calculated rates are used in contracts

### 2. Direct Worker Assignment
- Contracts are submitted directly to a specific worker ID
- Not a broadcast to multiple workers - targeted assignment
- Worker knows exactly who is hiring them

### 3. Contract Status Flow
- `agreement_pending`: Contract submitted, awaiting worker response
- `active`: Worker has accepted, work is confirmed
- `cancelled`: Worker rejected, or cancelled by employer
- Existing `completed` status for finished work

### 4. Employer Authentication
- Contract submission requires Bearer token authentication
- Worker ID is automatically extracted from the token
- Worker ID can be optionally extracted and stored as employer_id

### 5. Database Persistence
- All contracts are stored in Supabase
- Data survives app restarts and is accessible across devices
- Full audit trail through timestamps and status changes

## Implementation Details

### Schema Extensions Used
No new tables were added. The system uses the existing:
- `bookings` table (contracts are bookings with `status = 'agreement_pending'`)
- `worker_profiles` table
- `employer_profiles` table

### Special Handling
- Contract IDs can be UUID or booking_reference (handled via try/except in endpoints)
- Employer lookup from phone number in authentication token
- Automatic employer_id population if authenticated

## Security Considerations
- Contract submission requires authentication token
- Worker can only see contracts assigned to their ID
- Employer can submit contracts only if authenticated
- All data is persisted in Supabase (secure cloud database)

## Testing the System

### Test Case 1: Submit Contract
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

### Test Case 2: Get Worker Contracts
```bash
curl http://localhost:8000/api/v1/bookings/contracts/worker/w-ramesh
```

### Test Case 3: Accept Contract
```bash
curl -X POST http://localhost:8000/api/v1/bookings/contracts/{contract_id}/accept
```

### Test Case 4: Reject Contract
```bash
curl -X POST http://localhost:8000/api/v1/bookings/contracts/{contract_id}/reject \
  -H "Content-Type: application/json" \
  -d '{
    "contractId": "{contract_id}",
    "action": "reject",
    "rejectReason": "Wage is too low"
  }'
```

## Frontend Integration Notes
(No changes made to frontend as per requirements)

The frontend can integrate this system by:
1. Adding a contracts viewing page for workers
2. Calling GET `/bookings/contracts/worker/{worker_id}` on worker dashboard
3. Adding accept/reject buttons that call the respective endpoints
4. Adding a contract submission form for employers
5. The hardcoded 1200 wage in the initial request is fine - it's just for matching

## Future Enhancements
- Real-time notifications when contracts are submitted
- Contract templates for common job types
- Dispute resolution if wage/terms are disputed
- Contract history and analytics
- Multi-worker contracts (one contract for multiple workers)
- Contract modifications/amendments before acceptance

