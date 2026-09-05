import uuid
from fastapi import APIRouter, HTTPException, Request
from typing import Dict, Any, List, Optional
from app.database import get_supabase_client
from app.routers.workers import format_worker_profile
from app.routers.employers import format_employer_profile
from app.utils.storage import upload_base64_to_supabase
from app.utils.worker_id import generate_worker_id
from app.config import settings

router = APIRouter(prefix="/sync", tags=["Frontend Auto-Sync"])

@router.post("/worker")
async def sync_worker_profile(data: Dict[str, Any]):
    """Syncs worker profile directly from frontend localStorage to Supabase."""
    phone = data.get("phone", "").strip()
    if not phone:
        return {"success": False, "message": "No phone number found in profile"}

    supabase = get_supabase_client()
    if not supabase:
        return {"success": True, "message": "Mock sync (Supabase not connected)", "profile": data}

    try:
        # 1. Ensure user exists
        user_res = supabase.table("users").select("id").eq("phone", phone).execute()
        if user_res.data and len(user_res.data) > 0:
            user_id = user_res.data[0]["id"]
        else:
            new_u = supabase.table("users").insert({"phone": phone, "role": "worker"}).execute()
            user_id = new_u.data[0]["id"] if new_u.data else str(uuid.uuid4())

        # 2. Check if worker already exists or generate sequential rj-jp-0001 format ID
        existing_worker = supabase.table("worker_profiles").select("id, labour_no").eq("phone", phone).execute()
        if existing_worker.data and len(existing_worker.data) > 0:
            worker_id = existing_worker.data[0]["id"]
            labour_no = existing_worker.data[0]["labour_no"]
        else:
            labour_no = await generate_worker_id(
                state=data.get("state"),
                city=data.get("city"),
                district=data.get("district"),
                location=data.get("location")
            )
            worker_id = labour_no

        skills = data.get("skills")
        if not isinstance(skills, list):
            skills = [data.get("primarySkill", "Worker")]

        avatar_raw = data.get("avatar", "")
        avatar_url = await upload_base64_to_supabase(avatar_raw, settings.SUPABASE_BUCKET_MEDIA)

        profile_row = {
            "id": str(worker_id),
            "user_id": user_id,
            "labour_no": str(labour_no),
            "name": data.get("name", "Worker"),
            "phone": phone,
            "avatar": avatar_url,
            "location": data.get("location", "Delhi NCR"),
            "service_area": data.get("serviceArea", "Within 10 km"),
            "primary_skill": data.get("primarySkill", "Trade Worker"),
            "skills": skills,
            "experience_years": int(data.get("experienceYears") or 2),
            "daily_rate": float(data.get("dailyRate") or data.get("expectedDailyWage") or 500),
            "hourly_rate": float(data.get("hourlyRate") or 80),
            "rating": float(data.get("rating") or 5.0),
            "reviews_count": int(data.get("completedJobsCount") or data.get("reviewsCount") or 0),
            "verification_status": data.get("verificationStatus", "pending"),
            "bio": data.get("bio", ""),
            "work_locations": data.get("workLocations", []),
            "languages": data.get("languages", []),
            "education": data.get("education", []),
            "certifications": data.get("certifications", []),
            "portfolio": data.get("portfolio", []),
            "availability": data.get("availability", []),
            "benefits": data.get("benefits", []),
            "work_history": data.get("workHistory", [])
        }

        # Upsert into worker_profiles
        res = supabase.table("worker_profiles").upsert(profile_row, on_conflict="id").execute()
        return {"success": True, "message": "Synced to Supabase", "data": res.data}
    except Exception as e:
        print(f"Error syncing worker to Supabase: {e}")
        return {"success": False, "error": str(e)}

@router.post("/employer")
async def sync_employer_profile(data: Dict[str, Any]):
    """Syncs employer profile directly from frontend localStorage to Supabase."""
    phone = data.get("phone", "").strip()
    if not phone:
        return {"success": False, "message": "No phone number found in profile"}

    supabase = get_supabase_client()
    if not supabase:
        return {"success": True, "message": "Mock sync (Supabase not connected)", "profile": data}

    try:
        user_res = supabase.table("users").select("id").eq("phone", phone).execute()
        if user_res.data and len(user_res.data) > 0:
            user_id = user_res.data[0]["id"]
        else:
            new_u = supabase.table("users").insert({"phone": phone, "role": "employer"}).execute()
            user_id = new_u.data[0]["id"] if new_u.data else str(uuid.uuid4())

        # Employer unique ID is their phone number
        employer_id = phone
        avatar_raw = data.get("avatar", "")
        avatar_url = await upload_base64_to_supabase(avatar_raw, settings.SUPABASE_BUCKET_MEDIA)

        employer_row = {
            "id": str(employer_id),
            "user_id": user_id,
            "name": data.get("name", "Employer"),
            "phone": phone,
            "email": data.get("email"),
            "avatar": avatar_url,
            "employer_type": data.get("employerType", "individual"),
            "business_name": data.get("businessName", ""),
            "business_type": data.get("businessType", ""),
            "employee_count": str(data.get("employeeCount", "")),
            "location": data.get("location", "Delhi NCR"),
            "bio": data.get("bio", ""),
            "hiring_preferences": data.get("hiringPreferences", {}),
            "verification_details": data.get("verificationDetails", {}),
            "work_locations": data.get("workLocations", [])
        }

        res = supabase.table("employer_profiles").upsert(employer_row, on_conflict="id").execute()
        return {"success": True, "message": "Synced to Supabase", "data": res.data}
    except Exception as e:
        print(f"Error syncing employer to Supabase: {e}")
        return {"success": False, "error": str(e)}

@router.post("/booking")
async def sync_booking(data: Dict[str, Any]):
    """Syncs active or completed bookings from frontend localStorage to Supabase."""
    if not data or not isinstance(data, dict):
        return {"success": False, "message": "Invalid booking data"}

    supabase = get_supabase_client()
    if not supabase:
        return {"success": True, "message": "Mock sync"}

    try:
        ref_num = data.get("bookingNumber") or f"RZG-BK-{uuid.uuid4().hex[:4].upper()}"
        booking_row = {
            "booking_reference": ref_num,
            "job_title": data.get("jobTitle", "Trade Work"),
            "description": data.get("description", ""),
            "location": data.get("location", "Local"),
            "date": data.get("date", "2026-09-05"),
            "wage_offer": float(data.get("agreedWage") or 500),
            "status": data.get("status", "requested")
        }
        res = supabase.table("bookings").upsert(booking_row, on_conflict="booking_reference").execute()
        return {"success": True, "data": res.data}
    except Exception as e:
        print(f"Error syncing booking to Supabase: {e}")
        return {"success": False, "error": str(e)}

@router.post("/verification")
async def sync_verification_applications(apps: List[Dict[str, Any]]):
    """Syncs verification application queue from frontend to Supabase."""
    supabase = get_supabase_client()
    if not supabase or not apps:
        return {"success": True, "message": "No sync needed"}

    try:
        rows = []
        for a in apps:
            front_doc = a.get("frontDocumentUrl") or a.get("frontPhoto") or ""
            back_doc = a.get("backDocumentUrl") or a.get("backPhoto") or ""
            selfie_doc = a.get("selfieUrl") or a.get("selfiePhoto") or ""

            front_url = await upload_base64_to_supabase(front_doc, settings.SUPABASE_BUCKET_DOCUMENTS) if front_doc else None
            back_url = await upload_base64_to_supabase(back_doc, settings.SUPABASE_BUCKET_DOCUMENTS) if back_doc else None
            selfie_url = await upload_base64_to_supabase(selfie_doc, settings.SUPABASE_BUCKET_DOCUMENTS) if selfie_doc else None

            worker_id = a.get("workerId") or f"w-{uuid.uuid4().hex[:8]}"
            worker_phone = a.get("workerPhone") or "+91 98765 00000"
            worker_name = a.get("workerName", "Worker")

            # Verify that worker_id exists in worker_profiles to satisfy foreign key
            w_check = supabase.table("worker_profiles").select("id").eq("id", worker_id).execute()
            if not w_check.data:
                # Check by phone
                p_check = supabase.table("worker_profiles").select("id").eq("phone", worker_phone).execute()
                if p_check.data:
                    worker_id = p_check.data[0]["id"]
                else:
                    # Create stub worker so foreign key constraint is satisfied
                    try:
                        supabase.table("worker_profiles").insert({
                            "id": worker_id,
                            "name": worker_name,
                            "phone": worker_phone,
                            "labour_no": f"RZG-{uuid.uuid4().hex[:6].upper()}",
                            "primary_skill": "General Worker",
                            "location": "Delhi NCR",
                            "verification_status": "pending"
                        }).execute()
                    except Exception as e_w:
                        print(f"Stub worker insertion notice: {e_w}")

            rows.append({
                "worker_id": worker_id,
                "worker_name": worker_name,
                "worker_phone": worker_phone,
                "method": a.get("method", "aadhaar"),
                "id_type": a.get("idType", "Aadhaar Card"),
                "masked_identifier": a.get("maskedIdentifier", "XXXX XXXX 0000"),
                "front_document_url": front_url,
                "back_document_url": back_url,
                "selfie_url": selfie_url,
                "status": a.get("status", "pending")
            })
        res = supabase.table("verification_applications").insert(rows).execute()
        return {"success": True, "inserted": len(rows)}
    except Exception as e:
        print(f"Error syncing verification queue: {e}")
        return {"success": False, "error": str(e)}

@router.get("/state")
async def get_synced_state(phone: str, role: Optional[str] = "worker"):
    """Fetches user profile directly from Supabase for frontend hydration."""
    supabase = get_supabase_client()
    if not supabase or not phone:
        return {"exists": False}

    try:
        table = "worker_profiles" if role == "worker" else "employer_profiles"
        res = supabase.table(table).select("*").eq("phone", phone).execute()
        if res.data and len(res.data) > 0:
            formatter = format_worker_profile if role == "worker" else format_employer_profile
            return {"exists": True, "profile": formatter(res.data[0])}
    except Exception as e:
        print(f"Error fetching state from Supabase: {e}")

    return {"exists": False}

FALLBACK_GRIEVANCES: List[Dict[str, Any]] = []

@router.post("/grievances")
async def sync_grievances(grievances: List[Dict[str, Any]]):
    """Syncs grievances, dispute evidence, and tracking statuses to Supabase."""
    global FALLBACK_GRIEVANCES
    if not grievances:
        return {"success": True, "message": "No sync needed"}

    # Update in-memory fallback
    existing_ids = {g["id"] for g in FALLBACK_GRIEVANCES if "id" in g}
    for g in grievances:
        if g.get("id") in existing_ids:
            for idx, item in enumerate(FALLBACK_GRIEVANCES):
                if item.get("id") == g.get("id"):
                    FALLBACK_GRIEVANCES[idx] = g
        else:
            FALLBACK_GRIEVANCES.append(g)

    supabase = get_supabase_client()
    if not supabase:
        return {"success": True, "synced": len(grievances)}

    try:
        inserted_or_updated = 0
        for g in grievances:
            gid = g.get("id") or f"RG-2026-{uuid.uuid4().hex[:6].upper()}"

            # Process evidence files (upload base64 photos or screenshots to Supabase Storage)
            evidence_list = g.get("evidence") or []
            processed_evidence = []
            for ev in evidence_list:
                url = ev.get("url") or ev.get("fileUrl") or ""
                if url and url.startswith("data:image"):
                    uploaded_url = await upload_base64_to_supabase(url, settings.SUPABASE_BUCKET_DOCUMENTS)
                    ev["url"] = uploaded_url
                processed_evidence.append(ev)

            grow = {
                "id": gid,
                "user_id": g.get("userId"),
                "user_name": g.get("userName"),
                "user_phone": g.get("userPhone"),
                "user_role": g.get("userRole", "worker"),
                "category": g.get("category"),
                "category_label": g.get("categoryLabel"),
                "title": g.get("title", "Grievance Issue"),
                "description": g.get("description", ""),
                "booking_id": g.get("bookingId"),
                "booking_number": g.get("bookingNumber"),
                "status": g.get("status", "submitted"),
                "priority": g.get("priority", "medium"),
                "evidence": processed_evidence,
                "messages": g.get("messages") or [],
                "resolution": g.get("resolution")
            }
            supabase.table("grievances").upsert(grow, on_conflict="id").execute()
            inserted_or_updated += 1

        return {"success": True, "synced": inserted_or_updated}
    except Exception as e:
        print(f"Notice: Supabase grievances table sync: {e}")
        return {"success": True, "message": "Saved to fallback storage. Please run grievances table SQL in Supabase.", "synced": len(grievances)}

@router.get("/grievances")
async def get_synced_grievances(phone: Optional[str] = None):
    """Fetches grievances from Supabase or fallback cache."""
    supabase = get_supabase_client()
    if supabase:
        try:
            query = supabase.table("grievances").select("*")
            if phone:
                query = query.eq("user_phone", phone)
            res = query.order("created_at", desc=True).execute()
            if res.data and len(res.data) > 0:
                return res.data
        except Exception:
            pass

    if phone:
        return [g for g in FALLBACK_GRIEVANCES if g.get("userPhone") == phone]
    return FALLBACK_GRIEVANCES


