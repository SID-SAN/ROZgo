import secrets
import time
import re
import httpx
from typing import Dict, Any, Tuple
from app.config import settings

# In-memory storage for active OTPs: { phone: {"otp": "123456", "expires_at": 1725567890} }
ACTIVE_OTPS: Dict[str, Dict[str, Any]] = {}
OTP_EXPIRY_SECONDS = 600  # 10 minutes

def clean_phone_for_sms(raw_phone: str) -> Tuple[str, str]:
    """
    Cleans phone numbers into:
    1. 10-digit Indian standard (e.g. 9876543210 for Fast2SMS / 2Factor)
    2. Full E.164 format (e.g. +919876543210 for Twilio / International)
    """
    cleaned = re.sub(r"[^\d+]", "", raw_phone)
    if cleaned.startswith("+91"):
        ten_digit = cleaned[3:]
        e164 = cleaned
    elif cleaned.startswith("91") and len(cleaned) == 12:
        ten_digit = cleaned[2:]
        e164 = f"+{cleaned}"
    elif len(cleaned) == 10:
        ten_digit = cleaned
        e164 = f"+91{cleaned}"
    else:
        ten_digit = cleaned[-10:] if len(cleaned) >= 10 else cleaned
        e164 = cleaned if cleaned.startswith("+") else f"+91{cleaned}"
    return ten_digit, e164

def generate_otp(length: int = 6) -> str:
    """Generates a secure 6-digit numeric OTP."""
    min_val = 10 ** (length - 1)
    max_val = (10 ** length) - 1
    return str(secrets.randbelow(max_val - min_val + 1) + min_val)

def store_otp(phone: str, otp: str):
    """Stores the OTP with 10-minute validity."""
    _, e164 = clean_phone_for_sms(phone)
    ACTIVE_OTPS[e164] = {
        "otp": otp,
        "expires_at": time.time() + OTP_EXPIRY_SECONDS
    }

async def verify_stored_otp(phone: str, entered_otp: str) -> bool:
    """Validates the entered OTP against the stored code or Twilio Verify API."""
    cleaned_entered = entered_otp.strip()

    # Allow universal demo OTP 123456 in development
    if settings.ENVIRONMENT == "development" and cleaned_entered == "123456":
        return True

    _, e164 = clean_phone_for_sms(phone)

    # 1. Twilio Verify Check (if Twilio Verify was used)
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_VERIFY_SERVICE_SID:
        try:
            url = f"https://verify.twilio.com/v2/Services/{settings.TWILIO_VERIFY_SERVICE_SID}/VerificationCheck"
            data = {
                "To": e164,
                "Code": cleaned_entered
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    url,
                    data=data,
                    auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                )
                if res.status_code == 200:
                    check_data = res.json()
                    if check_data.get("status") == "approved":
                        return True
        except Exception as e:
            print(f"Twilio Verify Check error: {e}")

    # 2. In-memory local check (for Fast2SMS or Console dev)
    record = ACTIVE_OTPS.get(e164)
    if not record:
        return False

    # Check expiry
    if time.time() > record["expires_at"]:
        del ACTIVE_OTPS[e164]
        return False

    if record["otp"] == cleaned_entered:
        del ACTIVE_OTPS[e164]  # Consumed once
        return True

    return False

async def send_real_sms_otp(phone: str, otp: str) -> Dict[str, Any]:
    """
    Dispatches a real SMS OTP using the configured provider.
    Supported Free Providers:
    1. Twilio Verify API (Official carrier SMS delivery to verified numbers)
    2. Fast2SMS (Free signup credits for Indian phone numbers)
    3. 2Factor.in (Free trial API for Indian phone numbers)
    """
    ten_digit, e164 = clean_phone_for_sms(phone)
    store_otp(phone, otp)

    # 1. Twilio Verify API (Direct, official SMS delivery)
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_VERIFY_SERVICE_SID:
        try:
            url = f"https://verify.twilio.com/v2/Services/{settings.TWILIO_VERIFY_SERVICE_SID}/Verifications"
            data = {
                "To": e164,
                "Channel": "sms"
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    url,
                    data=data,
                    auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                )
                res_data = res.json()
                if res.status_code in (200, 201) and res_data.get("status") == "pending":
                    return {
                        "success": True,
                        "provider": "twilio_verify",
                        "message": f"Real SMS OTP dispatched via Twilio to {phone}",
                        "sid": res_data.get("sid")
                    }
                else:
                    print(f"Twilio Verify error response ({res.status_code}): {res.text}")
        except Exception as e:
            print(f"Twilio Verify dispatch error: {e}")

    # 2. Fast2SMS Provider (When activated)
    if settings.FAST2SMS_API_KEY and settings.OTP_PROVIDER != "twilio":
        try:
            url = "https://www.fast2sms.com/dev/bulkV2"
            headers = {
                "authorization": settings.FAST2SMS_API_KEY,
                "Content-Type": "application/json"
            }
            payload = {
                "variables_values": otp,
                "route": "otp",
                "numbers": ten_digit
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                data = res.json()
                if res.status_code == 200 and data.get("return"):
                    return {
                        "success": True,
                        "provider": "fast2sms",
                        "message": f"Real SMS OTP dispatched to {phone}",
                        "details": data
                    }
                else:
                    print(f"Fast2SMS API Response: {data}")
        except Exception as e:
            print(f"Fast2SMS SMS dispatch error: {e}")

    # 2. 2Factor.in Provider (Free Trial API for India)
    if settings.TWOFACTOR_API_KEY:
        try:
            url = f"https://2factor.in/API/V1/{settings.TWOFACTOR_API_KEY}/SMS/{ten_digit}/{otp}/ROZGO"
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url)
                data = res.json()
                if data.get("Status") == "Success":
                    return {
                        "success": True,
                        "provider": "2factor",
                        "message": f"Real SMS OTP sent via 2Factor to {phone}",
                        "details": data
                    }
        except Exception as e:
            print(f"2Factor API error: {e}")

    # 3. Twilio Provider (Free $15 Trial for Global SMS)
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_PHONE_NUMBER:
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
            data = {
                "From": settings.TWILIO_PHONE_NUMBER,
                "To": e164,
                "Body": f"Your ROZgo verification code is: {otp}. Valid for 10 minutes. Do not share this code with anyone."
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    url,
                    data=data,
                    auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                )
                if res.status_code in (200, 201):
                    return {
                        "success": True,
                        "provider": "twilio",
                        "message": f"Real SMS OTP sent via Twilio to {phone}"
                    }
                else:
                    print(f"Twilio error response: {res.text}")
        except Exception as e:
            print(f"Twilio SMS dispatch error: {e}")

    # 4. Development Console Gateway (Always active if no SMS gateway key is configured yet)
    print("\n" + "=" * 60)
    print(f" [ROZGO REAL OTP DISPATCH]")
    print(f" Destination Phone : {e164} ({ten_digit})")
    print(f" Verification Code : {otp}")
    print(f" Validity          : 10 Minutes")
    print(f" Note: Add FAST2SMS_API_KEY or TWILIO credentials in .env to deliver real SMS.")
    print("=" * 60 + "\n")

    return {
        "success": True,
        "provider": "console_dev",
        "message": f"OTP generated for {phone}. (In dev mode, code is {otp})",
        "demo_otp": otp if settings.ENVIRONMENT == "development" else None
    }

