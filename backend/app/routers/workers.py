from fastapi import APIRouter, HTTPException, Query, Header, Depends
from typing import Optional, List, Dict, Any
from app.database import get_supabase_client
from app.schemas.worker import WorkerProfileSchema, WorkerProfileUpdate
from app.utils.security import decode_access_token

router = APIRouter(prefix="/workers", tags=["Workers"])

def format_worker_profile(data: Dict[str, Any]) -> Dict[str, Any]:
    """Converts DB snake_case columns to frontend camelCase keys."""
    if not data:
        return {}
    return {
        "id": data.get("id"),
        "labourNo": data.get("labour_no", data.get("labourNo", "")),
        "name": data.get("name", ""),
        "phone": data.get("phone", ""),
        "avatar": data.get("avatar", ""),
        "location": data.get("location", ""),
        "serviceArea": data.get("service_area", data.get("serviceArea", "Within 10 km")),
        "primarySkill": data.get("primary_skill", data.get("primarySkill", "")),
        "skills": data.get("skills", []),
        "experienceYears": data.get("experience_years", data.get("experienceYears", 0)),
        "dailyRate": float(data.get("daily_rate", data.get("dailyRate", 500))),
        "hourlyRate": float(data.get("hourly_rate", data.get("hourlyRate", 80))),
        "rating": float(data.get("rating", 5.0)),
        "reviewsCount": int(data.get("reviews_count", data.get("reviewsCount", 0))),
        "verified": data.get("verification_status") == "verified",
        "verificationStatus": data.get("verification_status", data.get("verificationStatus", "pending")),
        "bio": data.get("bio", ""),
        "workLocations": data.get("work_locations", data.get("workLocations", [])),
        "languages": data.get("languages", []),
        "education": data.get("education", []),
        "certifications": data.get("certifications", []),
        "portfolio": data.get("portfolio", []),
        "availability": data.get("availability", []),
        "benefits": data.get("benefits", []),
        "workHistory": data.get("work_history", data.get("workHistory", []))
    }

# Fallback mock worker data if Supabase has not yet been seeded
FALLBACK_WORKERS = [
    {
        "id": "w-ramesh",
        "labour_no": "UP-LBR-2024-88412",
        "name": "Ramesh Kumar",
        "phone": "+91 98765 43210",
        "avatar": "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80",
        "location": "Noida Sector 62, Uttar Pradesh",
        "service_area": "Within 12 km",
        "primary_skill": "Mason & Construction",
        "skills": ["Brickwork", "Plastering", "Tile Laying", "Concrete Slab", "Waterproofing"],
        "experience_years": 8,
        "daily_rate": 650,
        "hourly_rate": 90,
        "rating": 4.9,
        "reviews_count": 47,
        "verification_status": "verified",
        "bio": "Experienced master mason specializing in residential and commercial brickwork, wall plastering, and floor tile installation with 8+ years of field experience."
    },
    {
        "id": "w-suresh",
        "labour_no": "DL-LBR-2023-41209",
        "name": "Suresh Patel",
        "phone": "+91 98123 45678",
        "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
        "location": "Laxmi Nagar, East Delhi",
        "service_area": "Within 15 km",
        "primary_skill": "Plumber",
        "skills": ["Pipe Repair", "Bathroom Fittings", "Drain Cleaning", "Water Tank Installation"],
        "experience_years": 6,
        "daily_rate": 550,
        "hourly_rate": 80,
        "rating": 4.8,
        "reviews_count": 38,
        "verification_status": "verified",
        "bio": "Certified residential plumbing expert handling complete sanitary setups, concealed leak detection, and rapid pipe fitting."
    },
    {
        "id": "w-deepak",
        "labour_no": "HR-LBR-2025-10934",
        "name": "Deepak Verma",
        "phone": "+91 98345 67890",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        "location": "Cyber City, Gurugram, Haryana",
        "service_area": "Within 10 km",
        "primary_skill": "Electrician",
        "skills": ["Home Wiring", "Switchboard Fitting", "MCB Installation", "Inverter Wiring"],
        "experience_years": 5,
        "daily_rate": 600,
        "hourly_rate": 85,
        "rating": 4.7,
        "reviews_count": 29,
        "verification_status": "verified",
        "bio": "ITI-certified electrician specializing in home wiring, appliance installation, and circuit maintenance with full safety compliance."
    }
]

from app.utils.rotation import prioritize_worker_rotation, get_busy_worker_ids

@router.get("", response_model=List[Dict[str, Any]])
async def list_workers(
    category: Optional[str] = None,
    skill: Optional[str] = None,
    location: Optional[str] = None,
    q: Optional[str] = None,
):
    supabase = get_supabase_client()
    raw_workers = []
    if supabase:
        try:
            query = supabase.table("worker_profiles").select("*")
            if category:
                query = query.ilike("primary_skill", f"%{category}%")
            if skill:
                query = query.contains("skills", [skill])
            if location:
                query = query.ilike("location", f"%{location}%")
            if q:
                query = query.or_(f"name.ilike.%{q}%,primary_skill.ilike.%{q}%,location.ilike.%{q}%")

            res = query.execute()
            if res.data and len(res.data) > 0:
                raw_workers = [format_worker_profile(w) for w in res.data]
        except Exception as e:
            print(f"Error querying worker_profiles from Supabase: {e}")

    if not raw_workers:
        raw_workers = [format_worker_profile(w) for w in FALLBACK_WORKERS]

    if q:
        raw_workers = [w for w in raw_workers if q.lower() in w["name"].lower() or q.lower() in w["primarySkill"].lower()]

    # Apply Fair Work Rotation (Prioritize workers with NO work first)
    busy_ids = get_busy_worker_ids()
    return prioritize_worker_rotation(raw_workers, busy_ids)

@router.get("/labour-no/{labour_no}")
async def get_worker_by_labour_no(labour_no: str):
    supabase = get_supabase_client()
    if supabase:
        try:
            res = supabase.table("worker_profiles").select("*").eq("labour_no", labour_no).execute()
            if res.data and len(res.data) > 0:
                return format_worker_profile(res.data[0])
        except Exception as e:
            print(f"Error finding worker by labour no: {e}")

    for w in FALLBACK_WORKERS:
        if w["labour_no"].lower() == labour_no.lower():
            return format_worker_profile(w)

    raise HTTPException(status_code=404, detail=f"Worker with Labour Number {labour_no} not found")

@router.get("/jobs/recommended")
async def get_recommended_jobs(authorization: Optional[str] = Header(None)):
    # Standard recommended jobs for registered workers
    return [
        {
            "id": "job-rec-1",
            "title": "Bathroom Plumbing & Sanitary Fitting",
            "category": "Plumber",
            "employerName": "Vikram Sethi",
            "location": "Sector 62, Noida",
            "distance": "2.4 km",
            "wageOffer": 650,
            "duration": "1 Day",
            "postedAgo": "20 mins ago",
            "urgency": "Immediate"
        },
        {
            "id": "job-rec-2",
            "title": "Apartment Wall Plastering & Brick Repair",
            "category": "Mason & Construction",
            "employerName": "Sharma Constructions",
            "location": "Indirapuram, Ghaziabad",
            "distance": "4.1 km",
            "wageOffer": 800,
            "duration": "3 Days",
            "postedAgo": "1 hour ago",
            "urgency": "Tomorrow Morning"
        }
    ]

@router.get("/{worker_id}")
async def get_worker_by_id(worker_id: str):
    supabase = get_supabase_client()
    if supabase:
        try:
            res = supabase.table("worker_profiles").select("*").eq("id", worker_id).execute()
            if res.data and len(res.data) > 0:
                return format_worker_profile(res.data[0])
        except Exception as e:
            print(f"Error getting worker by id: {e}")

    for w in FALLBACK_WORKERS:
        if w["id"] == worker_id:
            return format_worker_profile(w)

    raise HTTPException(status_code=404, detail="Worker profile not found")

@router.put("/profile")
async def update_worker_profile(
    body: WorkerProfileUpdate,
    authorization: Optional[str] = Header(None)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication token required")
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    phone = payload.get("sub")
    supabase = get_supabase_client()
    update_data = body.dict(exclude_unset=True)

    # Convert camelCase to snake_case for DB
    db_updates = {}
    key_mapping = {
        "serviceArea": "service_area",
        "primarySkill": "primary_skill",
        "experienceYears": "experience_years",
        "dailyRate": "daily_rate",
        "hourlyRate": "hourly_rate",
        "workLocations": "work_locations"
    }
    for k, v in update_data.items():
        db_key = key_mapping.get(k, k)
        db_updates[db_key] = v

    if supabase and phone:
        try:
            res = supabase.table("worker_profiles").update(db_updates).eq("phone", phone).execute()
            if res.data:
                return format_worker_profile(res.data[0])
        except Exception as e:
            print(f"Error updating worker profile: {e}")

    return {"success": True, "message": "Profile updated", "data": update_data}

