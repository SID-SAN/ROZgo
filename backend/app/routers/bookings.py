import uuid
from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List, Dict, Any
from app.database import get_supabase_client
from app.schemas.booking import (
    BookingRequestSchema,
    BookingMatchRequest,
    BookingAgreementConfirm,
    ReviewSubmitSchema,
)
from app.routers.workers import FALLBACK_WORKERS, format_worker_profile
from app.utils.security import decode_access_token

router = APIRouter(prefix="/bookings", tags=["Bookings"])

# Memory storage fallback for active demo agreements
ACTIVE_AGREEMENTS: List[Dict[str, Any]] = [
    {
        "id": "bk-demo-1",
        "bookingNumber": "RZG-BK-8419",
        "worker": format_worker_profile(FALLBACK_WORKERS[0]),
        "additionalWorkers": [],
        "jobTitle": "Bathroom Plumbing & Pipe Replacement",
        "description": "Repair leaking overhead tank pipeline and replace washbasin angle valves.",
        "location": "Sector 62, Noida, UP",
        "date": "5 Sept 2026",
        "time": "09:30 AM",
        "agreedWage": 650,
        "wageType": "daily",
        "durationDays": 1,
        "employerStatus": "confirmed",
        "workerStatus": "confirmed",
        "status": "in_progress",
        "createdAt": "5 Sept 2026, 08:30 AM",
        "workStartedAt": "5 Sept 2026, 09:35 AM"
    }
]

@router.post("/request")
async def create_booking_request(req: BookingRequestSchema):
    booking_id = f"bk-{uuid.uuid4().hex[:8]}"
    ref_num = f"RZG-BK-{uuid.uuid4().hex[:4].upper()}"

    booking_obj = {
        "id": booking_id,
        "bookingNumber": ref_num,
        "serviceCategory": req.serviceCategory,
        "subcategory": req.subcategory,
        "jobTitle": f"{req.serviceCategory} Work - {req.subcategory or 'General'}",
        "description": req.description,
        "location": req.location,
        "date": req.preferredDate,
        "time": req.preferredTime,
        "agreedWage": req.wageOffer,
        "wageType": "daily",
        "durationDays": 1,
        "workersNeeded": req.workersNeeded,
        "status": "requested",
        "employerStatus": "confirmed",
        "workerStatus": "pending",
        "worker": format_worker_profile(FALLBACK_WORKERS[0]),
        "createdAt": "Just now"
    }

    supabase = get_supabase_client()
    if supabase:
        try:
            supabase.table("bookings").insert({
                "booking_reference": ref_num,
                "service_id": req.serviceCategory,
                "subcategory_id": req.subcategory,
                "job_title": booking_obj["jobTitle"],
                "description": req.description,
                "location": req.location,
                "date": req.preferredDate,
                "wage_offer": req.wageOffer,
                "status": "requested"
            }).execute()
        except Exception as e:
            print(f"Error persisting booking to Supabase: {e}")

    ACTIVE_AGREEMENTS.insert(0, booking_obj)
    return booking_obj

@router.post("/match")
async def match_workers(req: BookingMatchRequest):
    supabase = get_supabase_client()
    if supabase:
        try:
            res = supabase.table("worker_profiles").select("*").ilike("primary_skill", f"%{req.serviceCategory}%").limit(5).execute()
            if res.data and len(res.data) > 0:
                matched = [format_worker_profile(w) for w in res.data]
                return {
                    "matchedWorker": matched[0],
                    "additionalWorkers": matched[1:]
                }
        except Exception as e:
            print(f"Error matching workers via Supabase: {e}")

    # Fallback to local worker list
    matched = [format_worker_profile(w) for w in FALLBACK_WORKERS]
    return {
        "matchedWorker": matched[0],
        "additionalWorkers": matched[1:]
    }

@router.post("/agreement/confirm")
async def confirm_agreement(req: BookingAgreementConfirm):
    # Find active or create
    for b in ACTIVE_AGREEMENTS:
        if b.get("id") == req.bookingId:
            b["agreedWage"] = req.agreedWage
            b["date"] = req.date
            b["time"] = req.time
            b["status"] = "in_progress"
            b["employerStatus"] = "confirmed"
            b["workerStatus"] = "confirmed"
            return b

    new_b = {
        "id": req.bookingId or f"bk-{uuid.uuid4().hex[:8]}",
        "bookingNumber": f"RZG-BK-{uuid.uuid4().hex[:4].upper()}",
        "worker": format_worker_profile(FALLBACK_WORKERS[0]),
        "jobTitle": "Confirmed Trade Work",
        "description": "Standard work agreement mutually confirmed.",
        "location": "Local Area",
        "date": req.date,
        "time": req.time,
        "agreedWage": req.agreedWage,
        "wageType": "daily",
        "durationDays": 1,
        "status": "in_progress",
        "employerStatus": "confirmed",
        "workerStatus": "confirmed",
        "createdAt": "Just now"
    }
    ACTIVE_AGREEMENTS.insert(0, new_b)
    return new_b

@router.get("/active")
async def get_active_bookings():
    return [b for b in ACTIVE_AGREEMENTS if b.get("status") in ("requested", "matched", "agreement_pending", "in_progress")]

@router.get("/{booking_id}")
async def get_booking_by_id(booking_id: str):
    for b in ACTIVE_AGREEMENTS:
        if b["id"] == booking_id:
            return b
    raise HTTPException(status_code=404, detail="Booking not found")

@router.post("/{booking_id}/complete")
async def complete_booking(booking_id: str):
    for b in ACTIVE_AGREEMENTS:
        if b["id"] == booking_id:
            b["status"] = "completed"
            return {"success": True, "booking": b, "message": "Booking marked as completed"}
    return {"success": True, "message": "Booking completed"}

@router.post("/{booking_id}/review")
async def submit_booking_review(booking_id: str, rev: ReviewSubmitSchema):
    supabase = get_supabase_client()
    if supabase:
        try:
            supabase.table("reviews").insert({
                "author_name": rev.authorName or "Employer",
                "author_role": rev.authorRole or "employer",
                "rating": rev.rating,
                "comment": rev.comment,
                "tags": rev.tags or [],
                "worker_id": rev.workerId
            }).execute()
        except Exception as e:
            print(f"Error saving review to Supabase: {e}")

    return {
        "success": True,
        "message": "Review submitted successfully",
        "review": rev.dict()
    }

