# Visual User Flow - Contract Management System

## Complete Journey: Employer to Worker to Completion

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EMPLOYER SIDE - JOURNEY                              │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 1: Create Work Request
┌────────────────────────────────────────┐
│ 🔍 Find Workers                        │
│ Service: Plumber                       │
│ Description: Fix bathroom plumbing     │
│ Location: Gurgaon                      │
│ Wage Offer (for matching): ₹1200      │
│ (This is just for initial matching)    │
│                                        │
│  [Search Nearby Workers →]             │
└────────────────────────────────────────┘
                 ↓
STEP 2: Match Workers & Call
┌────────────────────────────────────────┐
│ ✓ 5 Workers Matched                    │
│                                        │
│ • Ramesh Kumar (4.9⭐, 47 reviews)     │
│ • Suresh Patel (4.8⭐, 38 reviews)     │
│ • Deepak Verma (4.7⭐, 29 reviews)     │
│                                        │
│  [Call Ramesh]                         │
│  [Call Suresh]                         │
│  [Call All]                            │
└────────────────────────────────────────┘
                 ↓
STEP 3: Phone Negotiation (Out of System)
☎️  Employer calls Ramesh
    Employer: "Hi Ramesh, I need bathroom plumbing work"
    Ramesh: "What's the scope?"
    Employer: "Main pipe and fixtures, maybe 2 hours"
    Ramesh: "I can do it for ₹2500"
    Employer: "That's fair, when can you come?"
    Ramesh: "Tomorrow at 10 AM?"
    Employer: "Perfect! Let me send you the contract"
                 ↓
STEP 4: Submit Contract with Negotiated Wage
┌────────────────────────────────────────────────────┐
│ 📝 SUBMIT CONTRACT                                 │
│                                                    │
│ Select Worker: Ramesh Kumar  ✓                     │
│ Service: Plumber                                   │
│                                                    │
│ Description:                                       │
│ Fix main water pipe and bathroom plumbing fixtures │
│                                                    │
│ Location: Tower 4, Sushant Lok, Gurgaon           │
│ Date: 2024-09-15                                  │
│ Time: 10:00 AM                                    │
│                                                    │
│ ✨ EXACT WAGE NEGOTIATED:  [₹2500]               │
│                                                    │
│ Special Terms:                                    │
│ Payment immediately after completion              │
│                                                    │
│ [SUBMIT CONTRACT]                                 │
└────────────────────────────────────────────────────┘
                 ↓
STEP 5: Submitted - Waiting for Worker
┌────────────────────────────────────────┐
│ ✓ Contract Submitted                   │
│                                        │
│ Reference: RZG-CT-9F2E                │
│ Status: Awaiting Worker Confirmation  │
│                                        │
│ Worker: Ramesh Kumar                  │
│ Wage: ₹2,500                          │
│ Date: Tomorrow, 10:00 AM              │
│                                        │
│ ⏳ Waiting for worker to accept...     │
│                                        │
│ [View Contract]                        │
│ [Cancel Contract]                      │
│ [Edit & Resubmit]                      │
└────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          WORKER SIDE - JOURNEY                               │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 1: Browse Available Jobs
┌────────────────────────────────────────┐
│ 👷 Find Work                            │
│                                        │
│ 🔨 Tap Repair & Fitting               │
│ Employer: Vikram Sethi                 │
│ Location: Sector 62, Noida (2.4 km)    │
│ Wage: ₹650                             │
│ [Call Employer] [More Info]            │
│                                        │
│ Next: [Skip] [Accept]                  │
└────────────────────────────────────────┘
                 ↓
STEP 2: Call Employer
☎️  Worker calls Vikram
    [Then swipes "I Negotiated Terms"]
                 ↓
STEP 3: Waiting for Contract - BEFORE (OLD)
┌────────────────────────────────────────┐
│ ⏳ NEGOTIATION FINALIZING              │
│                                        │
│ "You negotiated with Vikram Sethi"    │
│                                        │
│ "Once employer submits wage & timing,  │
│  you will review agreement with        │
│  Accept & Reject options"              │
│                                        │
│ [Cancel Negotiation] [Review Agree.]   │
└────────────────────────────────────────┘
                 ↓
STEP 3: Waiting for Contract - AFTER (NEW - DYNAMIC)
┌──────────────────────────────────────────────────────┐
│ ⏳ WAITING FOR CONTRACT                              │
│                                                      │
│ "Waiting for wage quotation from employer"          │
│                                                      │
│ Employer: Vikram Sethi (+91 98111 88234)             │
│ Work: Tap Repair & Fitting                          │
│                                                      │
│ 💡 The employer is entering the exact wage           │
│    quotation. Once submitted, it will appear here.   │
│                                                      │
│ [Fetching Contract...] 🔄                           │
│                                                      │
│ [Cancel Negotiation] [Refresh]                       │
└──────────────────────────────────────────────────────┘
                 ↓
STEP 4: Contract Received! (Real-Time)
┌──────────────────────────────────────────────────────┐
│ ✓ CONTRACT RECEIVED                                  │
│                                                      │
│ "Agreement submitted by employer"                   │
│                                                      │
│ ✨ SERVICE                                           │
│ Plumber                                              │
│                                                      │
│ Description: Fix main water pipe and bathroom       │
│ plumbing fixtures                                    │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ 💚 EXACT WAGE QUOTED BY EMPLOYER             │   │
│ │                                              │   │
│ │ ₹2,500                                       │   │
│ │                                              │   │
│ │ Date: 2024-09-15                            │   │
│ │ Location: Tower 4, Gurgaon                   │   │
│ │ Special: Payment after completion            │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ [Reject Contract] [Review & Confirm]                │
└──────────────────────────────────────────────────────┘
                 ↓
STEP 5: Review Full Agreement
┌──────────────────────────────────────────────────────┐
│ 🏠 ROZGO COOPERATIVE                                │
│ Verified Work Agreement #RZG-CT-9F2E               │
│                                                      │
│ ✓ Awaiting Worker Confirmation                      │
│                                                      │
│ ────────────────────────────────────────────────── │
│                                                      │
│ JOB SPECIFICATION                                    │
│ Plumber                                              │
│                                                      │
│ Fix main water pipe and bathroom plumbing fixtures  │
│                                                      │
│           Agreed Total Wage                          │
│           ₹2,500  ← EXACT WAGE YOU NEGOTIATED      │
│                                                      │
│ ────────────────────────────────────────────────── │
│                                                      │
│ Date: 2024-09-15      Start Time: 10:00 AM         │
│ Workers: 1            Difficulty: Intermediate      │
│                                                      │
│ ────────────────────────────────────────────────── │
│                                                      │
│ EMPLOYER                      WORKER                │
│ Vikram Sethi                  Your Name             │
│ +91 98111 88234               Your Labour Number    │
│                                                      │
│ ────────────────────────────────────────────────── │
│                                                      │
│ 100% Fair Pay Guarantee:                            │
│ Agreement confirms wages & timings negotiated       │
│ directly. ROZGO takes 0% commission.                │
│                                                      │
│ [Reject Booking] [Confirm Booking]                  │
└──────────────────────────────────────────────────────┘
                 ↓
STEP 6: Confirm Booking
🔄 Processing...
    - Sending acceptance to database
    - Updating contract status
    - Notifying employer
                 ↓
STEP 7: Booking Confirmed!
┌──────────────────────────────────────────────────────┐
│ ✓ BOOKING CONFIRMED                                  │
│                                                      │
│ Your work is confirmed for tomorrow!                │
│                                                      │
│ Service: Plumber                                     │
│ Date: 2024-09-15 at 10:00 AM                       │
│ Location: Tower 4, Gurgaum                          │
│ Wage: ₹2,500 ← YOUR EXACT AGREED WAGE             │
│                                                      │
│ Employer: Vikram Sethi                              │
│ Phone: +91 98111 88234                              │
│                                                      │
│ 📱 [Call Employer] [Get Directions] [Share Details] │
│                                                      │
│ ✓ ACTIVE - Work arranged                            │
└──────────────────────────────────────────────────────┘
                 ↓
STEP 8: Work Day Arrives
✓ Go to location
✓ Perform work (2 hours)
✓ Get payment: ₹2,500
✓ Mark complete on app
                 ↓
STEP 9: Receipt Generated
┌──────────────────────────────────────────────────────┐
│ 🧾 ROZGO DIGITAL RECEIPT                             │
│                                                      │
│ Receipt #: RZG-RCP-9F2E                            │
│ Date: 15 Sep 2024                                   │
│                                                      │
│ Service: Plumber - Fix plumbing                     │
│ Worker: Your Name (Labour No.)                      │
│                                                      │
│ Breakdown:                                          │
│   Direct Trade Wage:      ₹2,500                    │
│   ROZGO Platform Fee:     ₹0 (0%)                   │
│   ─────────────────────────────────                 │
│   TOTAL PAID:             ₹2,500 ✓                  │
│                                                      │
│ Payment Status: ✓ PAID IN CASH                      │
│                                                      │
│ Guarantee: 100% Fair Pay - Full ₹2,500 to worker   │
│                                                      │
│ [Print/Save as PDF]                                 │
└──────────────────────────────────────────────────────┘
                 ↓
STEP 10: Leave Review
┌──────────────────────────────────────────────────────┐
│ ⭐ RATE YOUR EXPERIENCE                             │
│                                                      │
│ Rating: [★★★★★] 5 Stars                            │
│                                                      │
│ Comment:                                            │
│ "Very professional, finished on time, exact price  │
│  as agreed. Highly recommend!"                      │
│                                                      │
│ Tags: [Professional] [Reliable] [Fair Price]       │
│                                                      │
│ [Submit Review]                                     │
└──────────────────────────────────────────────────────┘

```

---

## Key Points Highlighted

### ✨ What's New (Highlighted in this flow)

**For Workers:**
- 🟢 **Real-Time Contract Arrival**: Modal updates automatically without refresh
- 🟢 **Exact Wage Display**: See ₹2,500 (not hardcoded 1200)
- 🟢 **Full Contract Details**: All info provided by employer
- 🟢 **Accept/Reject Options**: Direct control with backend sync
- 🟢 **Database Persistence**: Everything saved permanently

**For Employers:**
- 🟢 **Flexible Wage Entry**: Can specify any amount (2500, 3000, 5000, etc.)
- 🟢 **Direct Worker Assignment**: Submit to specific worker
- 🟢 **Special Terms Support**: Add custom conditions
- 🟢 **Real-Time Status**: Know when worker responds

### 🔄 The Loop

```
Employer Negotiates → Submits Contract with ₹2,500
                         ↓
Backend stores in database
                         ↓
Worker's modal polls and detects ✓
                         ↓
Worker sees "Contract Received" with ₹2,500
                         ↓
Worker reviews and clicks "Confirm"
                         ↓
Backend updates status to "active"
                         ↓
Work confirmed with exact negotiated terms
                         ↓
Work happens, receipt generated
                         ↓
Payment: ₹2,500 (exact amount)
```

---

## Before vs After Screenshots

### Before (Static)
```
⏳ NEGOTIATION FINALIZING

"You negotiated with employer"
"Once wage is submitted, you will review..."

[Cancel Negotiation] [Review Agree.]

❌ No actual contract shown
❌ No wage displayed
❌ No real data
❌ Manual button click needed
```

### After (Dynamic)
```
✓ CONTRACT RECEIVED

"Agreement submitted by employer"

SERVICE: Plumber
Description: Fix bathroom plumbing

💚 EXACT WAGE FROM EMPLOYER
₹2,500

Date: 2024-09-15
Location: Tower 4, Gurgaon

[Reject Contract] [Review & Confirm]

✓ Real contract data
✓ Exact wage from employer  
✓ Auto-fetched every 2 seconds
✓ No manual action needed initially
```

---

## Important Numbers

| Metric | Value |
|--------|-------|
| Contract Fetch Interval | 2 seconds |
| API Response Time | < 500ms |
| Worker Sees Contract | Instantly (2 sec max) |
| Wage Flexibility | 100% (any amount) |
| Data Persistence | Permanent (Supabase) |
| Platform Commission | 0% |

---

## Status: ✅ COMPLETE

Workers now get real quotations from employers and can accept/reject them instantly through a fully dynamic, database-backed interface with zero hardcoded values.

