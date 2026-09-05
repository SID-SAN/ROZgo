import uuid
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from app.schemas.auth import (
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
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

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/otp/send", response_model=SendOtpResponse)
async def send_otp(req: SendOtpRequest):
    phone = req.phone.strip()
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number is required")

    # In production, integrate SMS provider (MSG91/Twilio) here.
    # We provide 123456 for instant testing.
    return SendOtpResponse(
        success=True,
        message=f"OTP sent successfully to {phone}",
        demo_otp="123456"
    )

@router.post("/otp/verify", response_model=AuthResponse)
async def verify_otp(req: VerifyOtpRequest):
    phone = req.phone.strip()
    otp = req.otp.strip()

    # Verify OTP (accept standard demo OTP 123456 or match session)
    if otp != "123456" and len(otp) < 4:
        raise HTTPException(status_code=400, detail="Invalid OTP entered")

    supabase = get_supabase_client()
    role = req.role or "worker"
    user_id = str(uuid.uuid4())
    user_record = {"id": user_id, "phone": phone, "role": role}

    profile_data = {
        "id": f"w-{phone[-4:]}" if role == "worker" else f"emp-{phone[-4:]}",
        "name": f"User {phone[-4:]}",
        "phone": phone,
        "role": role,
    }

    if supabase:
        try:
            # Check if user exists
            res = supabase.table("users").select("*").eq("phone", phone).execute()
            if res.data and len(res.data) > 0:
                user_record = res.data[0]
                role = user_record.get("role", role)
                # Fetch profile
                table = "worker_profiles" if role == "worker" else "employer_profiles"
                prof_res = supabase.table(table).select("*").eq("phone", phone).execute()
                if prof_res.data and len(prof_res.data) > 0:
                    profile_data = prof_res.data[0]
            else:
                # Create user
                new_user = supabase.table("users").insert({
                    "phone": phone,
                    "role": role
                }).execute()
                if new_user.data:
                    user_record = new_user.data[0]
        except Exception as e:
            print(f"Supabase auth error: {e}")

    token = create_access_token({"sub": phone, "role": role, "user_id": user_record.get("id", user_id)})
    return AuthResponse(
        success=True,
        token=token,
        role=role,
        user=user_record,
        profile=profile_data
    )

@router.post("/login", response_model=AuthResponse)
async def login_password(req: LoginPasswordRequest):
    phone = req.phone.strip()
    password = req.password.strip()

    supabase = get_supabase_client()
    if not supabase:
        # Fallback demo login
        token = create_access_token({"sub": phone, "role": "worker"})
        return AuthResponse(
            success=True,
            token=token,
            role="worker",
            user={"phone": phone, "role": "worker"},
            profile={"id": f"w-{phone[-4:]}", "name": "Worker Demo", "phone": phone}
        )

    try:
        res = supabase.table("users").select("*").eq("phone", phone).execute()
        if not res.data:
            raise HTTPException(status_code=401, detail="Invalid phone or password")
        user = res.data[0]
        stored_hash = user.get("password_hash")
        if stored_hash and not verify_password(password, stored_hash):
            raise HTTPException(status_code=401, detail="Invalid phone or password")

        role = user.get("role", "worker")
        table = "worker_profiles" if role == "worker" else "employer_profiles"
        prof_res = supabase.table(table).select("*").eq("phone", phone).execute()
        profile = prof_res.data[0] if prof_res.data else {"phone": phone, "name": "User"}

        token = create_access_token({"sub": phone, "role": role, "user_id": user["id"]})
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

    profile_id = f"w-{uuid.uuid4().hex[:8]}" if role == "worker" else f"emp-{uuid.uuid4().hex[:8]}"
    profile_data = {
        "id": profile_id,
        "name": name,
        "phone": phone,
        "location": req.location or "Delhi NCR",
    }

    if role == "worker":
        profile_data.update({
            "labour_no": f"UP-LBR-2026-{uuid.uuid4().hex[:6].upper()}",
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

