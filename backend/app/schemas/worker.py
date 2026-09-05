from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class WorkerProfileSchema(BaseModel):
    id: str
    labourNo: str
    name: str
    phone: str
    avatar: Optional[str] = None
    location: str
    serviceArea: Optional[str] = "Within 10 km"
    primarySkill: str
    skills: List[str] = []
    experienceYears: int = 0
    dailyRate: float = 500.0
    hourlyRate: float = 80.0
    rating: float = 5.0
    reviewsCount: int = 0
    verified: bool = False
    verificationStatus: str = "pending"
    bio: Optional[str] = ""
    workLocations: Optional[List[Dict[str, Any]]] = []
    languages: Optional[List[Dict[str, Any]]] = []
    education: Optional[List[Dict[str, Any]]] = []
    certifications: Optional[List[Dict[str, Any]]] = []
    portfolio: Optional[List[Dict[str, Any]]] = []
    availability: Optional[List[Dict[str, Any]]] = []
    benefits: Optional[List[Dict[str, Any]]] = []
    workHistory: Optional[List[Dict[str, Any]]] = []

class WorkerProfileUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    serviceArea: Optional[str] = None
    primarySkill: Optional[str] = None
    skills: Optional[List[str]] = None
    experienceYears: Optional[int] = None
    dailyRate: Optional[float] = None
    hourlyRate: Optional[float] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    workLocations: Optional[List[Dict[str, Any]]] = None
    languages: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[Dict[str, Any]]] = None
    portfolio: Optional[List[Dict[str, Any]]] = None
    availability: Optional[List[Dict[str, Any]]] = None

