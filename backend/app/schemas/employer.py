from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class EmployerProfileSchema(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    avatar: Optional[str] = None
    employerType: str = "individual"
    businessName: Optional[str] = None
    businessType: Optional[str] = None
    employeeCount: Optional[str] = None
    location: str
    workLocations: Optional[List[Dict[str, Any]]] = []
    hiringPreferences: Optional[Dict[str, Any]] = {}
    bio: Optional[str] = ""
    verificationDetails: Optional[Dict[str, Any]] = {}

class EmployerProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None
    employerType: Optional[str] = None
    businessName: Optional[str] = None
    businessType: Optional[str] = None
    employeeCount: Optional[str] = None
    location: Optional[str] = None
    workLocations: Optional[List[Dict[str, Any]]] = None
    hiringPreferences: Optional[Dict[str, Any]] = None
    bio: Optional[str] = None
    verificationDetails: Optional[Dict[str, Any]] = None

