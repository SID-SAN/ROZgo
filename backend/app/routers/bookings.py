import uuid
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import HTMLResponse
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
    target_booking = None
    for b in ACTIVE_AGREEMENTS:
        if b["id"] == booking_id:
            b["status"] = "completed"
            target_booking = b
            break

    wage = float(target_booking.get("agreedWage", 500)) if target_booking else 500.0
    worker = target_booking.get("worker", {}) if target_booking else {}
    worker_id = worker.get("id") or worker.get("labourNo")

    # Generate Official Digital Receipt
    receipt = {
        "receiptNumber": f"RZG-RCP-{uuid.uuid4().hex[:6].upper()}",
        "bookingId": booking_id,
        "date": datetime.utcnow().strftime("%d %b %Y"),
        "completedAt": datetime.utcnow().isoformat() + "Z",
        "totalAmount": wage,
        "currency": "INR",
        "paymentStatus": "PAID",
        "paymentMethod": "Cash / UPI",
        "jobTitle": target_booking.get("jobTitle", "Trade Work") if target_booking else "Trade Work",
        "worker": {
            "id": worker_id,
            "name": worker.get("name", "Worker"),
            "labourNo": worker.get("labourNo", "")
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
            # 1. Update booking status in Supabase (check UUID or booking_reference)
            try:
                uuid.UUID(str(booking_id))
                supabase.table("bookings").update({"status": "completed"}).eq("id", booking_id).execute()
            except (ValueError, AttributeError):
                ref = target_booking.get("bookingNumber", booking_id) if target_booking else booking_id
                supabase.table("bookings").update({"status": "completed"}).eq("booking_reference", ref).execute()

            # 2. Append to worker's work_history
            if worker_id:
                w_res = supabase.table("worker_profiles").select("work_history, reviews_count").eq("id", worker_id).execute()
                if w_res.data:
                    current_history = w_res.data[0].get("work_history") or []
                    current_history.insert(0, {
                        "id": f"wh-{uuid.uuid4().hex[:6]}",
                        "bookingId": booking_id,
                        "receiptNumber": receipt["receiptNumber"],
                        "jobTitle": target_booking.get("jobTitle", "Trade Work") if target_booking else "Trade Work",
                        "completedDate": receipt["date"],
                        "wage": wage,
                        "status": "completed"
                    })
                    supabase.table("worker_profiles").update({"work_history": current_history}).eq("id", worker_id).execute()
        except Exception as e:
            print(f"Error persisting completion and history in Supabase: {e}")

    return {
        "success": True,
        "message": "Work completed successfully. Receipt generated.",
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

    # Fallback to local memory if demo booking
    if not b_data:
        for b in ACTIVE_AGREEMENTS:
            if b.get("id") == booking_id or b.get("bookingNumber") == booking_id:
                b_data = {
                    "id": b.get("id"),
                    "booking_reference": b.get("bookingNumber", "RZG-BK-8419"),
                    "job_title": b.get("jobTitle", "Trade Work"),
                    "wage_offer": b.get("agreedWage", 500),
                    "date": b.get("date", "Today"),
                    "status": "completed",
                    "worker_id": (b.get("worker") or {}).get("id", "rj-jp-0001")
                }
                break

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
            # 1. Insert review into reviews table
            supabase.table("reviews").insert({
                "author_name": rev.authorName or "Employer",
                "author_role": rev.authorRole or "employer",
                "rating": rev.rating,
                "comment": rev.comment,
                "tags": rev.tags or [],
                "worker_id": rev.workerId
            }).execute()

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

