# Quick Action Checklist - Fix Modal Not Working

## Do This RIGHT NOW

### 1️⃣ Check if contract is stored in database

```sql
-- Open Supabase dashboard → SQL Editor
-- Run this query:

SELECT * FROM bookings 
WHERE status = 'agreement_pending' 
ORDER BY created_at DESC 
LIMIT 5;
```

**What you should see:**
- Rows with data (not empty)
- `worker_id` column has values (not NULL)
- `wage_offer` has the actual wage (e.g., 2500)
- `description` has job details

**If EMPTY**: Contract is not being stored
- Go to Debugging Guide → Step 2 (Test backend endpoint)

**If NOT EMPTY**: Contract is stored ✓
- Go to next step

---

### 2️⃣ Test backend endpoint directly

```bash
# In terminal, run this:
curl http://localhost:8000/api/v1/bookings/contracts/worker/w-ramesh

# Or with a different worker ID:
curl http://localhost:8000/api/v1/bookings/contracts/worker/{your-worker-id}
```

**What you should get:**
```json
{
  "contracts": [
    {
      "id": "...",
      "agreedWage": 2500,
      "status": "agreement_pending",
      ...
    }
  ],
  "count": 1
}
```

**If ERROR or EMPTY**: Backend not returning contracts
- Check Debugging Guide → Step 3 (Issue 2)

**If DATA RETURNED**: Backend works ✓
- Go to next step

---

### 3️⃣ Check frontend is sending correct worker ID

Open browser → Press F12 → Go to Console tab

Paste this:
```javascript
console.log("Worker ID:", JSON.parse(localStorage.getItem('auth_user') || '{}').id);
```

**What you should see:**
- A worker ID (e.g., "w-ramesh")

**If UNDEFINED or NULL**: Worker not logged in
- Login as worker first

**If HAS VALUE**: ✓
- Go to next step

---

### 4️⃣ Check modal is receiving worker ID

Add this to **WaitingForAgreementModal.tsx** line 1:

```javascript
useEffect(() => {
  console.log("🔍 DEBUG - Modal Info:");
  console.log("  isOpen:", isOpen);
  console.log("  workerId:", currentWorkerId);
  console.log("  workerUser.id:", workerUser?.id);
}, [isOpen, currentWorkerId]);
```

Then:
1. Open browser console (F12)
2. Click "I Negotiated Terms" to open modal
3. Look for "DEBUG - Modal Info" in console

**Should show:**
```
🔍 DEBUG - Modal Info:
  isOpen: true
  workerId: w-ramesh
  workerUser.id: w-ramesh
```

**If workerId is undefined**: Modal isn't receiving worker ID
- Check WorkerDashboardPage passes `workerId={workerUser?.id}` to modal

**If workerId has value**: ✓
- Go to next step

---

### 5️⃣ Check API requests are being made

1. Open browser → F12 → Network tab
2. Click "I Negotiated Terms"
3. Look for requests to `/bookings/contracts/worker/`

**Should see:**
- Multiple requests (every 2 seconds)
- Status: 200 (success)
- Response contains contracts

**If NO requests**: Modal not fetching
- Check browser console for errors

**If requests with data**: ✓
- Modal should be showing contracts!

---

## If Still Not Working

### Issue A: Contract stored but modal doesn't show it

**Cause**: Worker ID mismatch

```sql
-- Check what worker IDs have contracts
SELECT DISTINCT worker_id FROM bookings 
WHERE status = 'agreement_pending';

-- Check what worker ID is logged in
-- (From step 3 above)

-- They must match!
```

**Fix**:
- Make sure you're logged in as the SAME worker who the contract is assigned to
- Or submit contract for the worker you're logged in as

---

### Issue B: Contract not stored at all

**Cause**: Backend not storing when `/contracts/submit` is called

**Check**:
1. Are you sending authentication header?
   ```bash
   curl -X POST http://localhost:8000/api/v1/bookings/contracts/submit \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"workerId": "w-ramesh", ...}'
   ```

2. Check backend logs for errors
   ```bash
   # Terminal where backend is running
   # Should show "Contract submitted" or error
   ```

---

### Issue C: Modal opens but shows "Fetching..." forever

**Cause**: API not responding or worker ID is undefined

**Check**: 
- Is `currentWorkerId` undefined? (from step 4)
- Is backend running? (`curl http://localhost:8000/health`)
- Are there API errors in console? (F12 → Console tab)

---

## The Most Common Issue

**90% of the time, the issue is:**

Worker ID is not being passed to the modal!

**Fix in WorkerDashboardPage.tsx** (around line 609):

```javascript
// BEFORE (missing workerId)
<WaitingForAgreementModal
  isOpen={isWaitingAgreement}
  onClose={() => setIsWaitingAgreement(false)}
  employerName={activeCallTarget.name}
  employerPhone={activeCallTarget.phone}
  workTitle={activeCallTarget.title}
  onAgreementArrived={handleAgreementDetailsArrived}
  onReject={handleRejectCallNegotiation}
/>

// AFTER (with workerId) ✓
<WaitingForAgreementModal
  isOpen={isWaitingAgreement}
  onClose={() => setIsWaitingAgreement(false)}
  employerName={activeCallTarget.name}
  employerPhone={activeCallTarget.phone}
  workTitle={activeCallTarget.title}
  workerId={workerUser?.id}  ← ADD THIS LINE
  onAgreementArrived={handleAgreementDetailsArrived}
  onReject={handleRejectCallNegotiation}
/>
```

---

## Follow This Order

1. ✓ Check database (Step 1)
2. ✓ Test backend endpoint (Step 2)
3. ✓ Check worker ID in localStorage (Step 3)
4. ✓ Add debug to modal (Step 4)
5. ✓ Check Network requests (Step 5)

Let me know which step fails!

