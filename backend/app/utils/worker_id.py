import re
from typing import Tuple, Optional
from app.database import get_supabase_client

STATE_CODES = {
    "rajasthan": "rj",
    "delhi": "dl",
    "uttar pradesh": "up",
    "up": "up",
    "haryana": "hr",
    "maharashtra": "mh",
    "karnataka": "ka",
    "gujarat": "gj",
    "tamil nadu": "tn",
    "west bengal": "wb",
    "madhya pradesh": "mp",
    "mp": "mp",
    "bihar": "br",
    "punjab": "pb",
    "telangana": "ts",
    "andhra pradesh": "ap",
    "kerala": "kl",
    "odisha": "od",
    "jharkhand": "jh",
    "uttarakhand": "uk",
    "assam": "as",
    "chhattisgarh": "cg",
    "goa": "ga",
    "himachal pradesh": "hp",
}

CITY_CODES = {
    "jaipur": "jp",
    "jodhpur": "jd",
    "udaipur": "ud",
    "kota": "kt",
    "bikaner": "bk",
    "ajmer": "aj",
    "delhi": "dl",
    "new delhi": "nd",
    "noida": "no",
    "greater noida": "gn",
    "ghaziabad": "gz",
    "gurgaon": "gg",
    "gurugram": "gg",
    "faridabad": "fb",
    "mumbai": "mb",
    "pune": "pn",
    "bangalore": "bl",
    "bengaluru": "bl",
    "hyderabad": "hy",
    "chennai": "ch",
    "kolkata": "kl",
    "ahmedabad": "ah",
    "surat": "sr",
    "lucknow": "lk",
    "kanpur": "kp",
    "varanasi": "vn",
    "agra": "ag",
    "patna": "pt",
    "chandigarh": "ch",
    "indore": "id",
    "bhopal": "bp",
}

def parse_state_city(
    state: Optional[str] = None,
    city: Optional[str] = None,
    district: Optional[str] = None,
    location_str: Optional[str] = None
) -> Tuple[str, str]:
    """Extracts 2-letter state code and 2-letter city code."""
    raw_state = (state or "").strip().lower()
    raw_city = (city or district or "").strip().lower()

    if (not raw_state or not raw_city) and location_str:
        # e.g. "Jaipur, Rajasthan" or "Sector 62, Noida, Uttar Pradesh"
        parts = [p.strip().lower() for p in location_str.split(",") if p.strip()]
        for part in reversed(parts):
            if not raw_state and part in STATE_CODES:
                raw_state = part
            elif not raw_city and part in CITY_CODES:
                raw_city = part
            # Check partial match
            for s_name in STATE_CODES:
                if s_name in part:
                    raw_state = raw_state or s_name
            for c_name in CITY_CODES:
                if c_name in part:
                    raw_city = raw_city or c_name

    # Default fallback if unknown
    state_code = STATE_CODES.get(raw_state, (raw_state[:2] if len(raw_state) >= 2 else "rj"))
    city_code = CITY_CODES.get(raw_city, (raw_city[:2] if len(raw_city) >= 2 else "jp"))

    return state_code.lower(), city_code.lower()

async def generate_worker_id(
    state: Optional[str] = None,
    city: Optional[str] = None,
    district: Optional[str] = None,
    location: Optional[str] = None
) -> str:
    """
    Generates sequential worker ID in format: rj-jp-0001
    """
    state_code, city_code = parse_state_city(state, city, district, location)
    prefix = f"{state_code}-{city_code}-"

    supabase = get_supabase_client()
    next_seq = 1

    if supabase:
        try:
            # Query highest existing ID with this prefix
            res = (
                supabase.table("worker_profiles")
                .select("labour_no")
                .ilike("labour_no", f"{prefix}%")
                .execute()
            )
            max_num = 0
            if res.data:
                for row in res.data:
                    val = str(row.get("labour_no", "")).lower()
                    match = re.search(rf"{re.escape(prefix)}(\d+)", val)
                    if match:
                        num = int(match.group(1))
                        if num > max_num:
                            max_num = num
            next_seq = max_num + 1
        except Exception as e:
            print(f"Error querying sequence for {prefix}: {e}")

    return f"{prefix}{next_seq:04d}"

