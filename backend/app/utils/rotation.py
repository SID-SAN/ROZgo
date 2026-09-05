from typing import List, Dict, Any, Set
from app.database import get_supabase_client

def prioritize_worker_rotation(workers: List[Dict[str, Any]], busy_worker_ids: Set[str] = None) -> List[Dict[str, Any]]:
    """
    Equal Opportunity Worker Rotation Algorithm:
    Prioritizes workers who have NO work or the least work, ensuring fair job rotation
    across the community.

    Ranking Criteria:
    1. Zero-Work Priority (Tier 0): Workers with 0 completed jobs / 0 reviews get FIRST priority.
    2. Rotation Priority (Tier 1): Available workers with fewer completed jobs get next priority.
    3. Busy/Active (Tier 2): Workers currently engaged in an active job are placed at the bottom.
    """
    if busy_worker_ids is None:
        busy_worker_ids = set()

    def rank_key(w: Dict[str, Any]):
        wid = str(w.get("id") or w.get("labourNo") or "")
        is_busy = wid in busy_worker_ids

        history = w.get("workHistory") or []
        reviews_count = int(w.get("reviewsCount") or 0)
        completed_jobs = max(len(history), reviews_count)

        if is_busy:
            tier = 2
        elif completed_jobs == 0:
            tier = 0  # No work yet -> TOP PRIORITY
        else:
            tier = 1

        rating = float(w.get("rating") or 5.0)
        # Tier ascending, completed jobs ascending (least work first), rating descending (best quality)
        return (tier, completed_jobs, -rating)

    return sorted(workers, key=rank_key)

def get_busy_worker_ids() -> Set[str]:
    """Queries Supabase for workers currently engaged in ongoing jobs."""
    busy_ids = set()
    supabase = get_supabase_client()
    if supabase:
        try:
            res = (
                supabase.table("bookings")
                .select("worker_id")
                .in_("status", ["active", "in_progress", "agreement_pending", "matched"])
                .execute()
            )
            if res.data:
                for row in res.data:
                    wid = row.get("worker_id")
                    if wid:
                        busy_ids.add(str(wid))
        except Exception as e:
            print(f"Error fetching active bookings for rotation: {e}")
    return busy_ids

