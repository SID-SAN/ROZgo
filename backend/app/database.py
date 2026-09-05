from supabase import create_client, Client
from app.config import settings

_supabase_client: Client | None = None

def get_supabase_client() -> Client | None:
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if settings.SUPABASE_URL and (settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY):
        key = settings.SUPABASE_SERVICE_ROLE_KEY if settings.SUPABASE_SERVICE_ROLE_KEY else settings.SUPABASE_KEY
        try:
            _supabase_client = create_client(settings.SUPABASE_URL, key)
            return _supabase_client
        except Exception as e:
            print(f"Warning: Failed to initialize Supabase client: {e}")
            return None
    return None

