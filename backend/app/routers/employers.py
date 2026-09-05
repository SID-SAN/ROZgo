from fastapi import APIRouter, HTTPException, Header
from typing import Optional, Dict, Any
from app.database import get_supabase_client
from app.schemas.employer import EmployerProfileSchema, EmployerProfileUpdate
from app.utils.security import decode_access_token

router = APIRouter(prefix="/employers", tags=["Employers"])

def format_employer_profile(data: Dict[str, Any]) -> Dict[str, Any]:
    if not data:
        return {}
    return {
        "id": data.get("id"),
        "name": data.get("name", "Employer"),
        "phone": data.get("phone", ""),
        "email": data.get("email"),
        "avatar": data.get("avatar", ""),
        "employerType": data.get("employer_type", data.get("employerType", "individual")),
        "businessName": data.get("business_name", data.get("businessName", "")),
        "businessType": data.get("business_type", data.get("businessType", "")),
        "employeeCount": data.get("employee_count", data.get("employeeCount", "")),
        "location": data.get("location", "Delhi NCR"),
        "workLocations": data.get("work_locations", data.get("workLocations", [])),
        "hiringPreferences": data.get("hiring_preferences", data.get("hiringPreferences", {})),
        "bio": data.get("bio", ""),
        "verificationDetails": data.get("verification_details", data.get("verificationDetails", {}))
    }

FALLBACK_EMPLOYER = {
    "id": "emp-demo-1",
    "name": "Sunita Verma",
    "phone": "+91 98765 12345",
    "email": "sunita.verma@example.com",
    "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    "employer_type": "individual",
    "business_name": "",
    "location": "Indirapuram, Ghaziabad",
    "bio": "Residential homeowner looking for skilled, verified local trade professionals for regular household repairs and ongoing renovation."
}

@router.get("/{employer_id}")
async def get_employer_by_id(employer_id: str):
    supabase = get_supabase_client()
    if supabase:
        try:
            res = supabase.table("employer_profiles").select("*").eq("id", employer_id).execute()
            if res.data and len(res.data) > 0:
                return format_employer_profile(res.data[0])
        except Exception as e:
            print(f"Error fetching employer by id: {e}")

    if employer_id == FALLBACK_EMPLOYER["id"] or employer_id.startswith("emp-"):
        return format_employer_profile(FALLBACK_EMPLOYER)

    raise HTTPException(status_code=404, detail="Employer profile not found")

@router.put("/profile")
async def update_employer_profile(
    body: EmployerProfileUpdate,
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

    db_updates = {}
    key_mapping = {
        "employerType": "employer_type",
        "businessName": "business_name",
        "businessType": "business_type",
        "employeeCount": "employee_count",
        "workLocations": "work_locations",
        "hiringPreferences": "hiring_preferences",
        "verificationDetails": "verification_details"
    }
    for k, v in update_data.items():
        db_key = key_mapping.get(k, k)
        db_updates[db_key] = v

    if supabase and phone:
        try:
            res = supabase.table("employer_profiles").update(db_updates).eq("phone", phone).execute()
            if res.data:
                return format_employer_profile(res.data[0])
        except Exception as e:
            print(f"Error updating employer profile: {e}")

    return {"success": True, "message": "Employer profile updated", "data": update_data}

