from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class BookingRequestSchema(BaseModel):
    serviceCategory: str
    subcategory: Optional[str] = None
    difficulty: Optional[str] = "Intermediate"
    description: Optional[str] = ""
    location: str
    preferredDate: str
    preferredTime: Optional[str] = "09:00 AM"
    workersNeeded: Optional[int] = 1
    wageOffer: Optional[float] = 500.0
    employerId: Optional[str] = None

class BookingMatchRequest(BaseModel):
    serviceCategory: str
    location: Optional[str] = None
    difficulty: Optional[str] = None

class BookingAgreementConfirm(BaseModel):
    bookingId: Optional[str] = None
    workerId: str
    agreedWage: float
    date: str
    time: Optional[str] = "09:00 AM"
    terms: Optional[str] = "Standard ROZgo agreement"

class ReviewSubmitSchema(BaseModel):
    rating: float = Field(..., ge=1, le=5)
    comment: str
    tags: Optional[List[str]] = []
    authorName: Optional[str] = "Employer"
    authorRole: Optional[str] = "employer"
    workerId: Optional[str] = None

