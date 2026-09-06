# Database Cleanup Guide - Remove Unused Worker Rate Fields

## Overview
The worker profile fields `daily_rate` and `hourly_rate` are no longer needed. All wages now come from the contract submitted by the employer.

## Why Remove These Fields?

- ✅ Wages are negotiated per contract, not based on worker profiles
- ✅ Contract wage takes priority over any hardcoded rate
- ✅ Reduces database schema complexity
- ✅ Prevents confusion with actual negotiated prices
- ✅ Cleaner frontend (no temptation to use default rates)

---

## Current Database Schema

**Table**: `worker_profiles`

**Fields to Remove**:
```sql
daily_rate NUMERIC(10, 2) DEFAULT 500
hourly_rate NUMERIC(10, 2) DEFAULT 80
```

These fields currently hold default/suggested rates but are:
- ❌ Not used in the new contract system
- ❌ Not shown to workers
- ❌ Not used in wage calculations
- ❌ Only appear in worker profile page (unused)

---

## Database Migration

### Option 1: Remove Fields Completely (Recommended)

```sql
-- Remove the unused rate fields
ALTER TABLE worker_profiles
DROP COLUMN IF EXISTS daily_rate;

ALTER TABLE worker_profiles
DROP COLUMN IF EXISTS hourly_rate;

-- Verify the changes
SELECT * FROM worker_profiles LIMIT 1;
```

### Option 2: Keep Fields But Mark as Deprecated (Conservative)

If you want to keep the data for historical reasons:

```sql
-- Rename to indicate they're deprecated
ALTER TABLE worker_profiles
RENAME COLUMN daily_rate TO daily_rate_deprecated;

ALTER TABLE worker_profiles
RENAME COLUMN hourly_rate TO hourly_rate_deprecated;

-- Add a comment
COMMENT ON COLUMN worker_profiles.daily_rate_deprecated IS 'Deprecated - Use contract wage instead';
COMMENT ON COLUMN worker_profiles.hourly_rate_deprecated IS 'Deprecated - Use contract wage instead';
```

---

## Frontend Changes Required

### ✅ Already Done
- [x] WaitingForAgreementModal - Uses contract.agreedWage
- [x] BookingAgreementModal - Shows contract.agreedWage
- [x] WorkerDashboardPage - Passes contract data

### ✅ Not Using These Fields Anymore
- [x] Contract display
- [x] Wage calculations
- [x] Payment processing
- [x] Receipt generation

### Need to Update
If you have worker profile display pages that show these rates:

**File**: `frontend/src/pages/worker/WorkerProfilePage.tsx`

```javascript
// REMOVE these lines if they exist:
// - dailyRate
// - hourlyRate
// - Show suggested rate
```

**File**: `frontend/src/pages/worker/PublicWorkerProfilePage.tsx`

```javascript
// REMOVE these lines if they exist:
// - hourlyRate display
// - dailyRate display
```

---

## Data Migration Steps

### Step 1: Backup Current Data
```sql
-- Create a backup table just in case
CREATE TABLE worker_profiles_backup AS
SELECT * FROM worker_profiles;

-- Verify backup
SELECT COUNT(*) FROM worker_profiles_backup;
```

### Step 2: Export Worker Rates (Optional)
If you want to keep historical records:

```sql
-- Export existing rates
SELECT 
  id,
  name,
  daily_rate,
  hourly_rate,
  created_at
FROM worker_profiles
WHERE daily_rate IS NOT NULL
ORDER BY created_at DESC
LIMIT 100;
```

### Step 3: Remove Columns
```sql
-- Drop the columns
ALTER TABLE worker_profiles
DROP COLUMN daily_rate;

ALTER TABLE worker_profiles
DROP COLUMN hourly_rate;
```

### Step 4: Verify
```sql
-- Check schema
\d worker_profiles

-- Should NOT show daily_rate or hourly_rate
```

---

## What Gets Affected

### ✅ Won't Break Anything
- Contract system (already uses contract wage)
- Payment processing (uses contract wage)
- Receipt generation (uses contract wage)
- Worker profiles (no rate display needed)
- Employer views (never used these rates)

### ⚠️ Need to Update
- Worker profile display pages
- Any API responses that include these fields
- Any analytics that reference these fields

---

## Verification After Cleanup

### Database Check
```sql
-- Verify fields are gone
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'worker_profiles' 
AND column_name IN ('daily_rate', 'hourly_rate');

-- Should return: (no rows)
```

### API Check
```bash
# Test worker endpoint
curl http://localhost:8000/api/v1/workers/w-ramesh

# Response should NOT include:
# - dailyRate
# - hourlyRate
# - daily_rate
# - hourly_rate
```

### Frontend Check
- Worker profile page loads without errors
- No console errors about missing fields
- No undefined values displayed
- Contract wage displays correctly (₹2,500, not 500-600 range)

---

## Rollback Plan

If something breaks:

```sql
-- Restore from backup
DROP TABLE worker_profiles;
ALTER TABLE worker_profiles_backup RENAME TO worker_profiles;

-- OR manually restore the columns
ALTER TABLE worker_profiles
ADD COLUMN daily_rate NUMERIC(10, 2) DEFAULT 500;

ALTER TABLE worker_profiles
ADD COLUMN hourly_rate NUMERIC(10, 2) DEFAULT 80;
```

---

## Schedule

### Recommended Timeline
1. **Day 1**: Backup data
2. **Day 1**: Deploy frontend changes
3. **Day 2**: Monitor for issues
4. **Day 3**: Run database migration
5. **Day 3**: Verify in staging/production
6. **Day 4**: Confirm all systems working
7. **Day 7**: Delete backup tables

---

## Post-Cleanup Benefits

✅ **Cleaner Schema**: No unused fields
✅ **Better Performance**: Smaller row size
✅ **Clear Intent**: Only contract wage matters
✅ **No Confusion**: No default rates to forget about
✅ **Easier Maintenance**: Fewer fields to manage

---

## Contract Wage Display

After cleanup, wages come ONLY from:

```
Employer submits contract → 
  Contains: agreedWage (e.g., 2500)
    ↓
Stored in: bookings.wage_offer
    ↓
Displayed in: BookingAgreementModal
    ↓
Shown as: ₹2,500 (EXACT, not default)
```

No system defaults. No fallback rates. Pure negotiated values.

---

## Commands Summary

```sql
-- One-liner to remove both fields
ALTER TABLE worker_profiles
DROP COLUMN IF EXISTS daily_rate,
DROP COLUMN IF EXISTS hourly_rate;

-- Verify
SELECT * FROM information_schema.columns 
WHERE table_name = 'worker_profiles' 
AND column_name LIKE '%rate%';
-- Should return: (no rows)
```

---

## Questions?

- Why remove these fields? → Wages are now contract-based, not profile-based
- Will it break anything? → No, contract system doesn't use them
- Can we keep the data? → Yes, export first or use Option 2 (rename)
- How to verify? → Run verification queries above

---

## Status

**Ready to Execute**: ✅ All frontend changes done
**Blocking Factors**: None
**Risk Level**: Low (fields are unused)
**Estimated Time**: 5 minutes
**Rollback Difficulty**: Easy (backup available)

---

## Checklist Before Running Migration

- [ ] Backup created
- [ ] Frontend deployed
- [ ] No code using daily_rate/hourly_rate
- [ ] Tested in development
- [ ] All team members notified
- [ ] Monitoring alerts set up
- [ ] Rollback plan documented

When all checked: Ready to proceed with cleanup!

