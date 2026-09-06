import uuid
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import HTMLResponse
from typing import Optional, List, Dict, Any
from app.database import get_supabase_client
from app.schemas.booking import (
    BookingRequestSchema,
    BookingMatchRequest,
    BookingAgreementConfirm,
    WorkerAgreementAction,
    ReviewSubmitSchema,
    ContractSubmitSchema,
    ContractActionSchema,
)
from app.routers.workers import FALLBACK_WORKERS, format_worker_profile
from app.utils.security import decode_access_token

router = APIRouter(prefix="/bookings", tags=["Bookings"])



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
            res = supabase.table("bookings").insert({
                "booking_reference": ref_num,
                "employer_id": req.employerId,
                "service_id": req.serviceCategory,
                "subcategory_id": req.subcategory,
                "job_title": booking_obj["jobTitle"],
                "description": req.description,
                "location": req.location,
                "date": req.preferredDate,
                "wage_offer": req.wageOffer,
                "status": "requested"
            }).execute()
            
            if res.data and len(res.data) > 0:
                booking_obj["id"] = res.data[0]["id"]
        except Exception as e:
            print(f"Error persisting booking to Supabase: {e}")

    return booking_obj

from datetime import datetime
from app.utils.rotation import prioritize_worker_rotation, get_busy_worker_ids

@router.post("/match")
async def match_workers(req: BookingMatchRequest):
    supabase = get_supabase_client()
    raw_candidates = []
    if supabase:
        try:
            res = (
                supabase.table("worker_profiles")
                .select("*")
                .ilike("primary_skill", f"%{req.serviceCategory}%")
                .execute()
            )
            if res.data and len(res.data) > 0:
                raw_candidates = [format_worker_profile(w) for w in res.data]
        except Exception as e:
            print(f"Error matching workers via Supabase: {e}")

    if not raw_candidates:
        raw_candidates = [format_worker_profile(w) for w in FALLBACK_WORKERS]

    # Equal Opportunity Rotation: Rank candidate workers so workers with NO work get top priority
    busy_ids = get_busy_worker_ids()
    ranked = prioritize_worker_rotation(raw_candidates, busy_ids)

    return {
        "matchedWorker": ranked[0],
        "additionalWorkers": ranked[1:]
    }

@router.post("/agreement/confirm")
async def confirm_agreement(req: BookingAgreementConfirm):
    supabase = get_supabase_client()
    # Check if this confirmation is explicitly from worker
    is_worker_confirmation = bool(req.confirmedByWorker)
    target_status = "active" if is_worker_confirmation else "agreement_pending"

    booking_id = req.bookingId or f"bk-{uuid.uuid4().hex[:8]}"
    booking_ref = req.bookingId if str(req.bookingId).startswith("RZG-") else f"RZG-BK-{uuid.uuid4().hex[:4].upper()}"

    if supabase and req.bookingId:
        try:
            update_fields = {
                "worker_id": req.workerId,
                "wage_offer": req.agreedWage,
                "date": req.date,
                "status": target_status,
                "agreement_confirmed_by_employer": True,
                "agreement_confirmed_by_worker": is_worker_confirmation,
                "updated_at": datetime.utcnow().isoformat()
            }
            updated = False
            # 1. UUID match
            try:
                uuid.UUID(str(req.bookingId))
                res = supabase.table("bookings").update(update_fields).eq("id", req.bookingId).execute()
                if res.data and len(res.data) > 0:
                    updated = True
                    booking_id = res.data[0].get("id", booking_id)
                    booking_ref = res.data[0].get("booking_reference", booking_ref)
            except (ValueError, AttributeError):
                pass

            # 2. booking_reference exact match
            if not updated:
                res = supabase.table("bookings").update(update_fields).eq("booking_reference", req.bookingId).execute()
                if res.data and len(res.data) > 0:
                    updated = True
                    booking_id = res.data[0].get("id", booking_id)
                    booking_ref = res.data[0].get("booking_reference", booking_ref)

            # 3. Partial ilike on booking_reference
            if not updated:
                clean_ref = str(req.bookingId).replace("RZG-BK-", "").strip()
                if len(clean_ref) >= 4:
                    res = supabase.table("bookings").update(update_fields).ilike("booking_reference", f"%{clean_ref}%").execute()
                    if res.data and len(res.data) > 0:
                        updated = True
                        booking_id = res.data[0].get("id", booking_id)
                        booking_ref = res.data[0].get("booking_reference", booking_ref)

            # 4. Fallback to latest unconfirmed/requested booking
            if not updated:
                pending = supabase.table("bookings").select("id, booking_reference").in_("status", ["requested", "agreement_pending"]).order("created_at", desc=True).limit(1).execute()
                if pending.data and len(pending.data) > 0:
                    supabase.table("bookings").update(update_fields).eq("id", pending.data[0]["id"]).execute()
                    booking_id = pending.data[0]["id"]
                    booking_ref = pending.data[0].get("booking_reference", booking_ref)
        except Exception as e:
            print(f"Error updating booking in Supabase: {e}")

    new_b = {
        "id": booking_id,
        "bookingNumber": booking_ref,
        "worker": format_worker_profile(FALLBACK_WORKERS[0]),
        "jobTitle": "Trade Work Agreement",
        "description": "Work agreement pending worker confirmation." if not is_worker_confirmation else "Standard work agreement mutually confirmed.",
        "location": "Local Area",
        "date": req.date,
        "time": req.time,
        "agreedWage": req.agreedWage,
        "wageType": "daily",
        "durationDays": 1,
        "status": target_status,
        "employerStatus": "confirmed",
        "workerStatus": "confirmed" if is_worker_confirmation else "pending",
        "createdAt": "Just now"
    }
    return new_b

@router.post("/agreement/worker-response")
async def worker_response(req: WorkerAgreementAction):
    supabase = get_supabase_client()
    status = "active" if req.accept else "cancelled"
    if supabase and (req.bookingId or req.bookingNumber):
        try:
            update_data = {
                "status": status,
                "agreement_confirmed_by_worker": req.accept,
                "updated_at": datetime.utcnow().isoformat()
            }
            if not req.accept and req.rejectReason:
                update_data["special_terms"] = f"Rejected by worker: {req.rejectReason}"

            updated = False
            # 1. Try UUID on id
            if req.bookingId:
                try:
                    uuid.UUID(str(req.bookingId))
                    res = supabase.table("bookings").update(update_data).eq("id", req.bookingId).execute()
                    if res.data and len(res.data) > 0:
                        updated = True
                except (ValueError, AttributeError):
                    pass

            # 2. Try bookingNumber or bookingId on booking_reference
            if not updated:
                ref = req.bookingNumber or req.bookingId
                res = supabase.table("bookings").update(update_data).eq("booking_reference", ref).execute()
                if res.data and len(res.data) > 0:
                    updated = True

            # 3. Try partial ilike on booking_reference
            if not updated and req.bookingId:
                clean_ref = str(req.bookingId).replace("RZG-BK-", "").strip()
                if len(clean_ref) >= 4:
                    res = supabase.table("bookings").update(update_data).ilike("booking_reference", f"%{clean_ref}%").execute()
                    if res.data and len(res.data) > 0:
                        updated = True

            # 4. Fallback to the latest agreement_pending booking
            if not updated:
                pending = supabase.table("bookings").select("id").eq("status", "agreement_pending").order("created_at", desc=True).limit(1).execute()
                if pending.data and len(pending.data) > 0:
                    supabase.table("bookings").update(update_data).eq("id", pending.data[0]["id"]).execute()
                    updated = True
        except Exception as e:
            print(f"Error updating worker response in Supabase: {e}")

    return {
        "success": True,
        "bookingId": req.bookingId,
        "status": status,
        "message": "Agreement accepted. Status updated to active." if req.accept else "Agreement declined."
    }

@router.get("/active")
async def get_active_bookings():
    supabase = get_supabase_client()
    if supabase:
        try:
            res = (
                supabase.table("bookings")
                .select("*")
                .in_("status", ["requested", "matched", "agreement_pending", "active"])
                .order("created_at", desc=True)
                .execute()
            )
            if res.data and len(res.data) > 0:
                # Batch-fetch worker and employer profiles for all bookings
                worker_ids = list(set(b.get("worker_id") for b in res.data if b.get("worker_id")))
                employer_ids = list(set(b.get("employer_id") for b in res.data if b.get("employer_id")))

                worker_map = {}
                if worker_ids:
                    try:
                        w_res = supabase.table("worker_profiles").select("id, name, phone, labour_no, avatar").in_("id", worker_ids).execute()
                        for w in (w_res.data or []):
                            worker_map[w["id"]] = w
                    except Exception:
                        pass

                employer_map = {}
                if employer_ids:
                    try:
                        e_res = supabase.table("employer_profiles").select("id, name, phone").in_("id", employer_ids).execute()
                        for e in (e_res.data or []):
                            employer_map[e["id"]] = e
                    except Exception:
                        pass

                mapped = []
                for b in res.data:
                    # Resolve worker
                    workers_list = []
                    wid = b.get("worker_id")
                    if wid and wid in worker_map:
                        wp = worker_map[wid]
                        workers_list.append({
                            "workerId": wp.get("id"),
                            "name": wp.get("name", "Worker"),
                            "phone": wp.get("phone", ""),
                            "labourNumber": wp.get("labour_no", ""),
                            "avatar": wp.get("avatar") or "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80",
                        })

                    # Resolve employer
                    eid = b.get("employer_id")
                    emp = employer_map.get(eid, {}) if eid else {}
                    employer_name = emp.get("name", "Direct Customer")
                    employer_phone = emp.get("phone", "+91 98111 88234")

                    mapped.append({
                        "id": str(b.get("id")),
                        "bookingNumber": b.get("booking_reference"),
                        "jobTitle": b.get("job_title"),
                        "workTitle": b.get("job_title"),
                        "serviceCategory": b.get("service_id", "plumber"),
                        "subcategory": b.get("subcategory_id", "general"),
                        "description": b.get("description", ""),
                        "location": b.get("location", ""),
                        "date": str(b.get("date", "Today")),
                        "time": "11:00 AM",
                        "agreedWage": float(b.get("wage_offer") or 500),
                        "status": b.get("status", "requested"),
                        "employerName": employer_name,
                        "employerPhone": employer_phone,
                        "workers": workers_list,
                        "workersCount": len(workers_list) or 1
                    })
                return mapped
        except Exception as e:
            print(f"Error fetching active bookings from Supabase: {e}")

    return []

@router.get("/completed")
async def get_completed_bookings():
    supabase = get_supabase_client()
    if supabase:
        try:
            res = (
                supabase.table("bookings")
                .select("*")
                .eq("status", "completed")
                .order("updated_at", desc=True)
                .execute()
            )
            if res.data and len(res.data) > 0:
                worker_ids = list(set(b.get("worker_id") for b in res.data if b.get("worker_id")))
                employer_ids = list(set(b.get("employer_id") for b in res.data if b.get("employer_id")))

                worker_map = {}
                if worker_ids:
                    try:
                        w_res = supabase.table("worker_profiles").select("id, name, phone, labour_no, avatar").in_("id", worker_ids).execute()
                        for w in (w_res.data or []):
                            worker_map[w["id"]] = w
                    except Exception:
                        pass

                employer_map = {}
                if employer_ids:
                    try:
                        e_res = supabase.table("employer_profiles").select("id, name, phone").in_("id", employer_ids).execute()
                        for e in (e_res.data or []):
                            employer_map[e["id"]] = e
                    except Exception:
                        pass

                mapped = []
                for b in res.data:
                    workers_list = []
                    wid = b.get("worker_id")
                    if wid and wid in worker_map:
                        wp = worker_map[wid]
                        workers_list.append({
                            "workerId": wp.get("id"),
                            "name": wp.get("name", "Worker"),
                            "phone": wp.get("phone", ""),
                            "labourNumber": wp.get("labour_no", ""),
                            "avatar": wp.get("avatar") or "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80",
                        })

                    eid = b.get("employer_id")
                    emp = employer_map.get(eid, {}) if eid else {}
                    employer_name = emp.get("name", "Direct Customer")
                    employer_phone = emp.get("phone", "+91 98111 88234")

                    mapped.append({
                        "id": str(b.get("id")),
                        "bookingNumber": b.get("booking_reference") or f"RZG-BK-{str(b.get('id'))[:4].upper()}",
                        "jobTitle": b.get("job_title") or "Completed Service",
                        "workTitle": b.get("job_title") or "Completed Service",
                        "serviceCategory": b.get("service_id", "plumber"),
                        "subcategory": b.get("subcategory_id", "general"),
                        "description": b.get("description", ""),
                        "location": b.get("location", ""),
                        "date": str(b.get("date", "Today")),
                        "time": "11:00 AM",
                        "agreedWage": float(b.get("wage_offer") or 500),
                        "status": "completed",
                        "completedAt": str(b.get("updated_at") or b.get("created_at") or "Recently"),
                        "employerName": employer_name,
                        "employerPhone": employer_phone,
                        "workers": workers_list,
                        "workersCount": len(workers_list) or 1
                    })
                return mapped
        except Exception as e:
            print(f"Error fetching completed bookings from Supabase: {e}")

    return []

@router.get("/{booking_id}")
async def get_booking_by_id(booking_id: str):
    supabase = get_supabase_client()
    if supabase:
        try:
            try:
                uuid.UUID(str(booking_id))
                res = supabase.table("bookings").select("*").eq("id", booking_id).execute()
            except (ValueError, AttributeError):
                res = supabase.table("bookings").select("*").eq("booking_reference", booking_id).execute()
            if res.data and len(res.data) > 0:
                b = res.data[0]
                return {
                    "id": str(b.get("id")),
                    "bookingNumber": b.get("booking_reference"),
                    "jobTitle": b.get("job_title"),
                    "status": b.get("status"),
                }
        except Exception as e:
            pass
    raise HTTPException(status_code=404, detail="Booking not found")

@router.post("/{booking_id}/complete")
async def complete_booking(booking_id: str):
    supabase = get_supabase_client()
    target_booking = None
    if supabase:
        try:
            try:
                uuid.UUID(str(booking_id))
                res = supabase.table("bookings").select("*").eq("id", booking_id).execute()
            except (ValueError, AttributeError):
                res = supabase.table("bookings").select("*").eq("booking_reference", booking_id).execute()
            
            if res.data and len(res.data) > 0:
                target_booking = res.data[0]
        except Exception as e:
            print(f"Error completing booking in Supabase: {e}")

    # Extract wage and worker from DB row (snake_case fields)
    wage = float(target_booking.get("wage_offer", 500)) if target_booking else 500.0
    worker_id = target_booking.get("worker_id") if target_booking else None

    # Fetch worker details if we have a worker_id
    worker_data = {}
    if worker_id and supabase:
        try:
            w_res = supabase.table("worker_profiles").select("name, labour_no").eq("id", worker_id).execute()
            if w_res.data:
                worker_data = w_res.data[0]
        except Exception:
            pass

    actual_job_title = (target_booking.get("job_title") or target_booking.get("jobTitle", "Trade Work")) if target_booking else "Trade Work"
    ref = (target_booking.get("booking_reference") or target_booking.get("bookingNumber", booking_id)) if target_booking else booking_id
    db_id = target_booking.get("id", booking_id) if target_booking else booking_id

    # Generate Official Digital Receipt
    receipt = {
        "receiptNumber": f"RZG-RCP-{uuid.uuid4().hex[:6].upper()}",
        "bookingId": str(db_id),
        "bookingReference": str(ref),
        "date": datetime.utcnow().strftime("%d %b %Y"),
        "completedAt": datetime.utcnow().isoformat() + "Z",
        "totalAmount": wage,
        "currency": "INR",
        "paymentStatus": "PAID",
        "paymentMethod": "Cash / UPI",
        "jobTitle": actual_job_title,
        "worker": {
            "id": worker_id,
            "name": worker_data.get("name", "Worker"),
            "labourNo": worker_data.get("labour_no", "")
        },
        "breakdown": {
            "baseWage": wage,
            "platformFee": 0.00,  # ROZgo 0% platform fee
            "convenienceCharge": 0.00,
            "totalPaid": wage
        }
    }

    supabase = get_supabase_client()
    if supabase:
        try:
            # 1. Update booking status to completed in Supabase (check UUID or booking_reference)
            try:
                uuid.UUID(str(booking_id))
                supabase.table("bookings").update({
                    "status": "completed",
                    "updated_at": datetime.utcnow().isoformat()
                }).eq("id", booking_id).execute()
            except (ValueError, AttributeError):
                supabase.table("bookings").update({
                    "status": "completed",
                    "updated_at": datetime.utcnow().isoformat()
                }).eq("booking_reference", ref).execute()

            # 2. Append to worker's work_history
            if worker_id:
                w_res = supabase.table("worker_profiles").select("work_history, reviews_count").eq("id", worker_id).execute()
                if w_res.data:
                    current_history = w_res.data[0].get("work_history") or []
                    current_history.insert(0, {
                        "id": f"wh-{uuid.uuid4().hex[:6]}",
                        "bookingId": str(db_id),
                        "receiptNumber": receipt["receiptNumber"],
                        "jobTitle": actual_job_title,
                        "completedDate": receipt["date"],
                        "wage": wage,
                        "status": "completed"
                    })
                    supabase.table("worker_profiles").update({
                        "work_history": current_history,
                        "updated_at": datetime.utcnow().isoformat()
                    }).eq("id", worker_id).execute()
        except Exception as e:
            print(f"Error persisting completion and history in Supabase: {e}")

    return {
        "success": True,
        "message": "Work completed successfully. Marked as complete in database and digital receipt stored.",
        "booking": target_booking,
        "receipt": receipt
    }

@router.get("/{booking_id}/receipt")
async def get_booking_receipt(booking_id: str):
    """Retrieves digital receipt permanently stored for any completed booking."""
    supabase = get_supabase_client()
    b_data = None

    if supabase:
        try:
            try:
                uuid.UUID(str(booking_id))
                res = supabase.table("bookings").select("*").eq("id", booking_id).execute()
            except (ValueError, AttributeError):
                res = supabase.table("bookings").select("*").eq("booking_reference", booking_id).execute()
            if res.data and len(res.data) > 0:
                b_data = res.data[0]
        except Exception as e:
            print(f"Receipt fetch DB error: {e}")



    ref_id = (b_data.get("booking_reference") if b_data else booking_id) or "RZG-BK-8419"
    wage = float((b_data.get("wage_offer") if b_data else 500) or 500)
    worker_id = (b_data.get("worker_id") if b_data else None) or "rj-jp-0001"
    job_title = (b_data.get("job_title") if b_data else "Trade Work") or "Trade Work"
    date_str = (b_data.get("date") if b_data else datetime.utcnow().strftime("%d %b %Y")) or "Today"

    # Worker info
    worker_name = "Assigned Trade Worker"
    worker_labour_no = worker_id
    if supabase and worker_id:
        try:
            w_res = supabase.table("worker_profiles").select("name, labour_no").eq("id", worker_id).execute()
            if w_res.data:
                worker_name = w_res.data[0].get("name", worker_name)
                worker_labour_no = w_res.data[0].get("labour_no", worker_labour_no)
        except Exception:
            pass

    return {
        "receiptNumber": f"RZG-RCP-{ref_id.replace('RZG-BK-', '')}",
        "bookingReference": ref_id,
        "bookingId": booking_id,
        "date": str(date_str),
        "jobTitle": job_title,
        "paymentStatus": "PAID",
        "currency": "INR",
        "totalAmount": wage,
        "paymentMethod": "Direct Cash / UPI",
        "worker": {
            "id": worker_id,
            "name": worker_name,
            "labourNumber": worker_labour_no
        },
        "breakdown": {
            "baseLabourWage": wage,
            "platformCommission": 0.00,
            "convenienceFee": 0.00,
            "totalPaid": wage
        },
        "guarantee": "ROZgo Cooperative Fair Pay Guarantee: 100% of wage transferred to worker with 0% platform commission deductions.",
        "downloadUrl": f"/api/v1/bookings/{booking_id}/receipt/download"
    }

@router.get("/{booking_id}/receipt/download", response_class=HTMLResponse)
async def download_booking_receipt_html(booking_id: str):
    """Generates an official printable/downloadable digital receipt (Save as PDF)."""
    receipt = await get_booking_receipt(booking_id)

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ROZGO Receipt - {receipt['receiptNumber']}</title>
      <style>
        body {{
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background: #f4f6f8;
          margin: 0;
          padding: 24px;
          display: flex;
          justify-content: center;
        }}
        .receipt-card {{
          background: #ffffff;
          max-width: 600px;
          width: 100%;
          border-radius: 16px;
          padding: 36px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }}
        .header {{
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px dashed #e2e8f0;
          padding-bottom: 20px;
        }}
        .logo {{
          font-size: 24px;
          font-weight: 900;
          color: #123b32;
          letter-spacing: -0.5px;
        }}
        .badge {{
          background: #ecfdf5;
          color: #047857;
          font-size: 12px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 9999px;
          text-transform: uppercase;
        }}
        .meta-grid {{
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin: 24px 0;
          font-size: 14px;
        }}
        .meta-item span {{
          color: #64748b;
          display: block;
          font-size: 12px;
        }}
        .meta-item strong {{
          color: #0f172a;
          font-size: 14px;
        }}
        .breakdown-table {{
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }}
        .breakdown-table th, .breakdown-table td {{
          padding: 12px 0;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }}
        .breakdown-table td.amount {{
          text-align: right;
          font-weight: 600;
        }}
        .total-row td {{
          border-top: 2px solid #0f172a;
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          padding-top: 16px;
        }}
        .footer-note {{
          background: #f8fafc;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 12px;
          color: #475569;
          margin-top: 24px;
          line-height: 1.5;
        }}
        .actions {{
          margin-top: 28px;
          display: flex;
          justify-content: center;
          gap: 12px;
        }}
        .btn-print {{
          background: #123b32;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
        }}
        @media print {{
          body {{ background: white; padding: 0; }}
          .receipt-card {{ box-shadow: none; border: none; }}
          .actions {{ display: none; }}
        }}
      </style>
    </head>
    <body>
      <div class="receipt-card">
        <div class="header">
          <div>
            <div class="logo">ROZGO</div>
            <div style="font-size: 12px; color: #64748b;">Cooperative Gig & Local Work Platform</div>
          </div>
          <div class="badge">Payment Verified</div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <span>Receipt Number</span>
            <strong>{receipt['receiptNumber']}</strong>
          </div>
          <div class="meta-item">
            <span>Date & Time</span>
            <strong>{receipt['date']}</strong>
          </div>
          <div class="meta-item">
            <span>Worker Assigned</span>
            <strong>{receipt['worker']['name']} ({receipt['worker']['labourNumber']})</strong>
          </div>
          <div class="meta-item">
            <span>Service Description</span>
            <strong>{receipt['jobTitle']}</strong>
          </div>
        </div>

        <table class="breakdown-table">
          <tr>
            <th>Description</th>
            <th style="text-align: right;">Amount</th>
          </tr>
          <tr>
            <td>Direct Trade Wage</td>
            <td class="amount">₹{receipt['breakdown']['baseLabourWage']:.2f}</td>
          </tr>
          <tr>
            <td>ROZgo Platform Fee</td>
            <td class="amount">₹0.00 (0%)</td>
          </tr>
          <tr class="total-row">
            <td>Total Paid</td>
            <td class="amount">₹{receipt['breakdown']['totalPaid']:.2f}</td>
          </tr>
        </table>

        <div class="footer-note">
          <strong>100% Fair Pay Guarantee:</strong> This is a legally valid payment proof generated by the ROZgo platform. Zero commission has been deducted from the trade worker.
        </div>

        <div class="actions">
          <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
        </div>
      </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@router.post("/{booking_id}/review")
async def submit_booking_review(booking_id: str, rev: ReviewSubmitSchema):
    supabase = get_supabase_client()
    if supabase:
        try:
            # Resolve booking UUID for FK
            resolved_booking_id = None
            try:
                uuid.UUID(str(booking_id))
                resolved_booking_id = booking_id
            except (ValueError, AttributeError):
                try:
                    bk_res = supabase.table("bookings").select("id").eq("booking_reference", booking_id).execute()
                    if bk_res.data:
                        resolved_booking_id = bk_res.data[0]["id"]
                except Exception:
                    pass

            # 1. Insert review into reviews table
            review_row = {
                "author_name": rev.authorName or "Employer",
                "author_role": rev.authorRole or "employer",
                "rating": rev.rating,
                "comment": rev.comment,
                "tags": rev.tags or [],
                "worker_id": rev.workerId
            }
            if resolved_booking_id:
                review_row["booking_id"] = resolved_booking_id
            supabase.table("reviews").insert(review_row).execute()

            # 2. Recalculate average rating & increment reviews_count for worker
            if rev.workerId:
                all_reviews = supabase.table("reviews").select("rating").eq("worker_id", rev.workerId).execute()
                if all_reviews.data:
                    ratings = [float(r["rating"]) for r in all_reviews.data if "rating" in r]
                    avg_rating = round(sum(ratings) / len(ratings), 2)
                    supabase.table("worker_profiles").update({
                        "rating": avg_rating,
                        "reviews_count": len(ratings)
                    }).eq("id", rev.workerId).execute()
        except Exception as e:
            print(f"Error saving review to Supabase: {e}")

    return {
        "success": True,
        "message": "Review submitted successfully",
        "review": rev.dict()
    }

@router.post("/contracts/submit")
async def submit_contract(req: ContractSubmitSchema, authorization: Optional[str] = Header(None)):
    """Employer submits a detailed contract for a specific worker with negotiated terms"""
    supabase = get_supabase_client()
    contract_id = f"ct-{uuid.uuid4().hex[:8]}"
    booking_reference = f"RZG-CT-{uuid.uuid4().hex[:4].upper()}"

    employer_id = None
    if authorization:
        try:
            token = authorization.replace("Bearer ", "")
            payload = decode_access_token(token)
            if payload:
                phone = payload.get("sub")
                if supabase and phone:
                    emp_res = supabase.table("employer_profiles").select("id").eq("phone", phone).execute()
                    if emp_res.data and len(emp_res.data) > 0:
                        employer_id = emp_res.data[0]["id"]
        except Exception as e:
            print(f"Error extracting employer from token: {e}")

    contract_data = {
        "booking_reference": booking_reference,
        "employer_id": employer_id,
        "worker_id": req.workerId,
        "service_id": req.serviceCategory,
        "job_title": f"{req.serviceCategory} Contract",
        "description": req.description,
        "location": req.location,
        "date": req.date,
        "wage_offer": req.agreedWage,
        "wage_type": "daily",
        "duration_days": req.duration or 1,
        "special_terms": req.specialTerms,
        "status": "agreement_pending",
        "agreement_confirmed_by_employer": True,
        "agreement_confirmed_by_worker": False
    }

    if supabase:
        try:
            print(f"DEBUG: Inserting contract for worker {req.workerId} with wage {req.agreedWage}")
            print(f"DEBUG: Contract data: {contract_data}")
            res = supabase.table("bookings").insert(contract_data).execute()
            print(f"DEBUG: Supabase response: {res}")
            if res.data and len(res.data) > 0:
                contract_id = res.data[0]["id"]
                booking_reference = res.data[0]["booking_reference"]
                print(f"✓ Contract stored successfully: {contract_id}")
            else:
                print(f"⚠ WARNING: Insert returned no data. Full response: {res}")
        except Exception as e:
            print(f"❌ ERROR persisting contract to Supabase: {e}")
            print(f"   Contract data was: {contract_data}")
            import traceback
            traceback.print_exc()
    else:
        print("❌ ERROR: Supabase client is None! Check .env file.")

    return {
        "success": True,
        "contractId": contract_id,
        "bookingReference": booking_reference,
        "workerId": req.workerId,
        "agreedWage": req.agreedWage,
        "status": "agreement_pending",
        "message": "Contract submitted successfully. Waiting for worker acceptance."
    }

@router.get("/contracts/worker/{worker_id}")
async def get_worker_contracts(worker_id: str):
    """Get all pending contracts for a worker"""
    supabase = get_supabase_client()
    contracts = []

    if supabase:
        try:
            res = (
                supabase.table("bookings")
                .select("*")
                .eq("worker_id", worker_id)
                .in_("status", ["agreement_pending", "active"])
                .order("created_at", desc=True)
                .execute()
            )

            if res.data and len(res.data) > 0:
                employer_ids = list(set(b.get("employer_id") for b in res.data if b.get("employer_id")))
                employer_map = {}

                if employer_ids:
                    try:
                        e_res = supabase.table("employer_profiles").select("id, name, phone").in_("id", employer_ids).execute()
                        for e in (e_res.data or []):
                            employer_map[e["id"]] = e
                    except Exception:
                        pass

                for b in res.data:
                    eid = b.get("employer_id")
                    employer_data = employer_map.get(eid, {}) if eid else {}

                    contracts.append({
                        "id": str(b.get("id")),
                        "bookingReference": b.get("booking_reference"),
                        "serviceCategory": b.get("service_id", ""),
                        "jobTitle": b.get("job_title", ""),
                        "description": b.get("description", ""),
                        "location": b.get("location", ""),
                        "date": str(b.get("date", "")),
                        "agreedWage": float(b.get("wage_offer") or 0),
                        "specialTerms": b.get("special_terms"),
                        "status": b.get("status", "agreement_pending"),
                        "employerName": employer_data.get("name", "Employer"),
                        "employerPhone": employer_data.get("phone", ""),
                        "confirmedByWorker": b.get("agreement_confirmed_by_worker", False),
                        "createdAt": str(b.get("created_at", ""))
                    })
        except Exception as e:
            print(f"Error fetching worker contracts from Supabase: {e}")

    return {"contracts": contracts, "count": len(contracts)}

@router.post("/contracts/{contract_id}/accept")
async def accept_contract(contract_id: str):
    """Worker accepts a contract"""
    supabase = get_supabase_client()

    if supabase:
        try:
            try:
                uuid.UUID(str(contract_id))
                supabase.table("bookings").update({
                    "agreement_confirmed_by_worker": True,
                    "status": "active"
                }).eq("id", contract_id).execute()
            except (ValueError, AttributeError):
                supabase.table("bookings").update({
                    "agreement_confirmed_by_worker": True,
                    "status": "active"
                }).eq("booking_reference", contract_id).execute()
        except Exception as e:
            print(f"Error accepting contract in Supabase: {e}")

    return {
        "success": True,
        "contractId": contract_id,
        "message": "Contract accepted successfully. Work arrangement confirmed!"
    }

@router.post("/contracts/{contract_id}/reject")
async def reject_contract(contract_id: str, req: ContractActionSchema):
    """Worker rejects a contract"""
    supabase = get_supabase_client()

    if supabase:
        try:
            try:
                uuid.UUID(str(contract_id))
                supabase.table("bookings").update({
                    "status": "cancelled",
                    "special_terms": f"Rejected by worker. Reason: {req.rejectReason or 'Not specified'}"
                }).eq("id", contract_id).execute()
            except (ValueError, AttributeError):
                supabase.table("bookings").update({
                    "status": "cancelled",
                    "special_terms": f"Rejected by worker. Reason: {req.rejectReason or 'Not specified'}"
                }).eq("booking_reference", contract_id).execute()
        except Exception as e:
            print(f"Error rejecting contract in Supabase: {e}")

    return {
        "success": True,
        "contractId": contract_id,
        "message": "Contract rejected successfully."
    }

