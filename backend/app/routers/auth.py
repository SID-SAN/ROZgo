import uuid
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from app.schemas.auth import (
    LoginPasswordRequest,
    RegisterRequest,
    AuthResponse,
)
from app.database import get_supabase_client
from app.utils.security import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)
from app.utils.worker_id import generate_worker_id

router = APIRouter(prefix="/auth", tags=["Authentication"])
@router.post("/login", response_model=AuthResponse)
async def login_password(req: LoginPasswordRequest):
    raw_phone = req.phone.strip()
    password = req.password.strip()

    # Extract 10 digits and common formats
    digits = "".join(filter(str.isdigit, raw_phone))
    phone_10 = digits[-10:] if len(digits) >= 10 else digits
    phone_with_prefix = f"+91 {phone_10}"
    phone_compact = f"+91{phone_10}"
    search_phones = list(set([phone_10, phone_with_prefix, phone_compact, raw_phone]))

    supabase = get_supabase_client()
    if not supabase:
        # Fallback demo login
        token = create_access_token({"sub": phone_10, "role": "worker"})
        return AuthResponse(
            success=True,
            token=token,
            role="worker",
            user={"phone": phone_10, "role": "worker"},
            profile={"id": f"w-{phone_10[-4:]}", "name": "Worker Demo", "phone": phone_10}
        )

    try:
        res = supabase.table("users").select("*").in_("phone", search_phones).execute()
        user = None
        role = "worker"
        profile = None

        if res.data and len(res.data) > 0:
            user = res.data[0]
            stored_hash = user.get("password_hash")
            if stored_hash:
                if not verify_password(password, stored_hash):
                    raise HTTPException(status_code=401, detail="Invalid password. Please check and try again.")
            else:
                # Set password for OTP-registered user
                try:
                    new_hash = get_password_hash(password)
                    supabase.table("users").update({"password_hash": new_hash}).eq("id", user["id"]).execute()
                except Exception:
                    pass

            role = user.get("role", "worker")
            table = "worker_profiles" if role == "worker" else "employer_profiles"
            prof_res = supabase.table(table).select("*").in_("phone", search_phones).execute()
            profile = prof_res.data[0] if prof_res.data else {"phone": phone_10, "name": user.get("name", "User")}
        else:
            # Fallback check in worker_profiles and employer_profiles
            w_prof = supabase.table("worker_profiles").select("*").in_("phone", search_phones).execute()
            e_prof = supabase.table("employer_profiles").select("*").in_("phone", search_phones).execute()

            if w_prof.data and len(w_prof.data) > 0:
                profile = w_prof.data[0]
                role = "worker"
                user = {"id": profile.get("id"), "phone": phone_10, "role": "worker"}
            elif e_prof.data and len(e_prof.data) > 0:
                profile = e_prof.data[0]
                role = "employer"
                user = {"id": profile.get("id"), "phone": phone_10, "role": "employer"}
            else:
                raise HTTPException(status_code=401, detail="Account not found. Please register to create an account.")

        token = create_access_token({"sub": phone_10, "role": role, "user_id": user.get("id", str(uuid.uuid4()))})
        return AuthResponse(
            success=True,
            token=token,
            role=role,
            user=user,
            profile=profile
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/register", response_model=AuthResponse)
async def register_user(req: RegisterRequest):
    phone = req.phone.strip()
    role = req.role.strip()
    name = req.name.strip()

    supabase = get_supabase_client()
    user_id = str(uuid.uuid4())
    pw_hash = get_password_hash(req.password) if req.password else None

    if role == "worker":
        profile_id = await generate_worker_id(location=req.location)
    else:
        profile_id = phone

    profile_data = {
        "id": profile_id,
        "name": name,
        "phone": phone,
        "location": req.location or "Delhi NCR",
    }

    if role == "worker":
        profile_data.update({
            "labour_no": profile_id,
            "primary_skill": req.primary_skill or "Mason & Construction",
            "experience_years": req.experience_years or 2,
            "daily_rate": 500.0,
            "hourly_rate": 80.0,
            "rating": 5.0,
            "reviews_count": 0,
            "verification_status": "pending",
        })
    else:
        profile_data.update({
            "employer_type": req.employer_type or "individual",
            "business_name": req.business_name or "",
        })

    if supabase:
        try:
            u_res = supabase.table("users").insert({
                "phone": phone,
                "role": role,
                "password_hash": pw_hash
            }).execute()
            if u_res.data:
                user_id = u_res.data[0]["id"]

            table = "worker_profiles" if role == "worker" else "employer_profiles"
            profile_data["user_id"] = user_id
            p_res = supabase.table(table).insert(profile_data).execute()
            if p_res.data:
                profile_data = p_res.data[0]
        except Exception as e:
            print(f"Registration DB error: {e}")

    token = create_access_token({"sub": phone, "role": role, "user_id": user_id})
    return AuthResponse(
        success=True,
        token=token,
        role=role,
        user={"id": user_id, "phone": phone, "role": role},
        profile=profile_data
    )

@router.get("/me")
async def get_me(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication token required")

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    phone = payload.get("sub")
    role = payload.get("role", "worker")
    supabase = get_supabase_client()

    if supabase:
        table = "worker_profiles" if role == "worker" else "employer_profiles"
        res = supabase.table(table).select("*").eq("phone", phone).execute()
        if res.data:
            return {"user": payload, "profile": res.data[0]}

    return {
        "user": payload,
        "profile": {"phone": phone, "role": role, "name": f"User {phone[-4:] if phone else ''}"}
    }

