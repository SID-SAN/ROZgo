# Debugging Guide - Modal Not Showing Contract

## Step 1: Verify Contract is Being Stored

### Check if contract exists in database:

```sql
-- Check if contracts are being stored
SELECT * FROM bookings 
WHERE status = 'agreement_pending' 
ORDER BY created_at DESC 
LIMIT 5;

-- Should show contracts with:
-- - worker_id (not NULL)
-- - wage_offer (the actual wage, e.g., 2500)
-- - status: 'agreement_pending'
-- - description (job details)
-- - location
-- - date
```

If you see NO rows, the problem is: **Contract is not being stored**

---

## Step 2: Verify Backend Endpoint Works

### Test the backend endpoint directly:

```bash
# Replace with your actual worker ID
curl http://localhost:8000/api/v1/bookings/contracts/worker/w-ramesh

# Should return:
{
  "contracts": [
    {
      "id": "uuid",
      "bookingReference": "RZG-CT-XXXX",
      "serviceCategory": "plumber",
      "agreedWage": 2500,
      "status": "agreement_pending",
      ...
    }
  ],
  "count": 1
}
```

If you get an error or empty contracts array:
- Check if the worker_id is correct
- Check if contracts exist in database with that worker_id

---

## Step 3: Common Issues & Solutions

### Issue 1: Worker ID Not Being Passed

**Problem**: Modal doesn't know which worker to fetch contracts for

**Solution**: Verify workerId is being passed to the modal:

```javascript
// In WorkerDashboardPage.tsx
<WaitingForAgreementModal
  workerId={workerUser?.id}  // ← Must not be undefined!
  ...
/>
```

**Fix**:
```javascript
// Make sure workerUser is loaded
const { workerUser } = useAuth();
console.log("Worker ID:", workerUser?.id); // Add this to debug

// Pass it to modal
<WaitingForAgreementModal
  workerId={workerUser?.id}
  ...
/>
```

---

### Issue 2: Backend Not Returning Contracts

**Problem**: API returns empty array even though contracts exist

**Check 1**: Is the worker_id stored correctly in database?

```sql
-- Check what worker_ids exist in contracts
SELECT DISTINCT worker_id, COUNT(*) as count 
FROM bookings 
WHERE status = 'agreement_pending'
GROUP BY worker_id;

-- Also check if there are any NULL worker_ids
SELECT * FROM bookings 
WHERE worker_id IS NULL 
AND status = 'agreement_pending';
```

**Check 2**: Is the query working in backend?

Add logging to backend:
```python
# In app/routers/bookings.py, in get_worker_contracts function
@router.get("/contracts/worker/{worker_id}")
async def get_worker_contracts(worker_id: str):
    supabase = get_supabase_client()
    
    print(f"DEBUG: Fetching contracts for worker: {worker_id}")  # Add this
    
    if supabase:
        try:
            res = (
                supabase.table("bookings")
                .select("*")
                .eq("worker_id", worker_id)
                .in_("status", ["agreement_pending", "active"])
                .order("created_at", desc=True)
                .execute()
            )
            
            print(f"DEBUG: Found {len(res.data)} contracts")  # Add this
            print(f"DEBUG: Contract data: {res.data}")  # Add this
```

---

### Issue 3: Modal Not Polling Correctly

**Problem**: Modal opens but never fetches contracts

**Check**: Open browser DevTools → Network tab

```
1. Open modal (WaitingForAgreementModal)
2. Go to Network tab
3. Look for requests to: /bookings/contracts/worker/...
4. Should see requests every 2 seconds
```

If no requests appear:
- workerId is undefined
- API base URL is wrong
- useEffect is not running

**Fix**: Add console logs to WaitingForAgreementModal:

```javascript
// In WaitingForAgreementModal.tsx
useEffect(() => {
  if (!isOpen || !currentWorkerId) {
    console.log("Modal not ready. isOpen:", isOpen, "workerId:", currentWorkerId);
    return;
  }

  console.log("Starting contract fetch for worker:", currentWorkerId);
  
  const fetchContracts = async () => {
    console.log("Fetching contracts...");
    try {
      const response = await apiClient.get<any>(
        API_ENDPOINTS.CONTRACTS.GET_WORKER_CONTRACTS(currentWorkerId)
      );
      console.log("Response:", response);
      
      if (response && response.contracts && response.contracts.length > 0) {
        console.log("Contracts found:", response.contracts);
        // ... rest of code
      } else {
        console.log("No contracts found");
      }
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  fetchContracts();
  const interval = setInterval(fetchContracts, 2000);
  return () => clearInterval(interval);
}, [isOpen, currentWorkerId]);
```

---

## Step 4: Complete End-to-End Test

### Scenario: Submit contract and see if modal shows it

**Step 1**: Check what worker IDs are valid
```sql
SELECT id, name FROM worker_profiles LIMIT 5;
-- Copy one of these IDs (e.g., "w-ramesh")
```

**Step 2**: Submit a contract via API
```bash
curl -X POST http://localhost:8000/api/v1/bookings/contracts/submit \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "workerId": "w-ramesh",
    "serviceCategory": "plumber",
    "description": "Test plumbing work",
    "location": "Test Location",
    "date": "2024-09-20",
    "agreedWage": 2500
  }'

# Save the returned contractId
```

**Step 3**: Verify it was stored
```sql
SELECT * FROM bookings 
WHERE worker_id = 'w-ramesh' 
AND status = 'agreement_pending'
LIMIT 1;

-- Should show your contract with:
-- - wage_offer: 2500
-- - status: 'agreement_pending'
```

**Step 4**: Test backend endpoint
```bash
curl http://localhost:8000/api/v1/bookings/contracts/worker/w-ramesh

# Should return your contract in the response
```

**Step 5**: Manually trigger modal
- Frontend: Login as worker with ID "w-ramesh"
- Open dashboard
- Find a job and click "I Negotiated Terms"
- Modal should fetch contract and display it

---

## Step 5: Supabase Table Check

### Are these fields in the bookings table?

```sql
-- Check if all required fields exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- Should have:
-- ✓ id (UUID)
-- ✓ worker_id (VARCHAR)
-- ✓ wage_offer (NUMERIC)
-- ✓ status (VARCHAR)
-- ✓ description (TEXT)
-- ✓ location (VARCHAR)
-- ✓ date (DATE)
-- ✓ agreement_confirmed_by_worker (BOOLEAN)
```

If any are missing, you need to add them:

```sql
-- Add missing wage_offer if not exists
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS wage_offer NUMERIC(10, 2);

-- Add missing agreement_confirmed_by_worker if not exists
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS agreement_confirmed_by_worker BOOLEAN DEFAULT FALSE;
```

---

## Step 6: Real-Time Debugging

### In Frontend Console:

```javascript
// Paste this in browser console to test API
const testWorker = "w-ramesh";
fetch(`http://localhost:8000/api/v1/bookings/contracts/worker/${testWorker}`)
  .then(r => r.json())
  .then(data => {
    console.log("Contracts:", data);
    console.log("Count:", data.count);
    if (data.contracts && data.contracts.length > 0) {
      console.log("First contract:", data.contracts[0]);
    }
  })
  .catch(e => console.error("Error:", e));
```

This will show you immediately if:
- API is responding
- Data is being returned
- What the actual data looks like

---

## Common Solutions

### Solution 1: Check worker_id in contract submission

```python
# In POST /contracts/submit endpoint
# Make sure worker_id is being stored, not NULL

print(f"Storing contract for worker: {req.workerId}")  # Debug log

contract_data = {
    "worker_id": req.workerId,  # ← Must not be NULL!
    "wage_offer": req.agreedWage,
    ...
}
```

### Solution 2: Verify Supabase connection

```python
# Test Supabase connection
supabase = get_supabase_client()
if not supabase:
    print("ERROR: Supabase client not initialized!")
    # Check .env file for SUPABASE_URL and SUPABASE_KEY
```

### Solution 3: Check CORS issue

If API returns error in browser console:
- Make sure CORS is configured in backend
- Check backend allows frontend origin

```python
# In main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Checklist

- [ ] Contract is stored in `bookings` table with correct `worker_id`
- [ ] `wage_offer` field contains actual wage (not NULL)
- [ ] `status` = 'agreement_pending'
- [ ] Backend endpoint returns contract when called
- [ ] WorkerDashboardPage passes `workerId` to modal
- [ ] Modal receives `workerId` (check console)
- [ ] Modal makes API requests (check Network tab)
- [ ] API returns contract data
- [ ] Modal displays contract with real wage

---

## Quick Test Command

Run all tests:

```bash
# 1. Check database
psql -c "SELECT COUNT(*) FROM bookings WHERE status = 'agreement_pending';"

# 2. Check backend
curl http://localhost:8000/api/v1/bookings/contracts/worker/w-ramesh

# 3. Check frontend console (paste this)
fetch('/api/v1/bookings/contracts/worker/w-ramesh').then(r=>r.json()).then(d=>console.log(d))
```

---

## If Still Not Working

1. **Check backend logs** - Run with verbose logging:
```bash
cd backend
python -m uvicorn app.main:app --reload --log-level DEBUG
```

2. **Check browser console** - Look for errors
3. **Check Network tab** - See actual API responses
4. **Check database directly** - Verify contracts exist

Let me know what you find!

