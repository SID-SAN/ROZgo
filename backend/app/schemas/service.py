from pydantic import BaseModel
from typing import List, Optional

class SubcategorySchema(BaseModel):
    id: str
    nameKey: str
    defaultName: str

class ServiceCategorySchema(BaseModel):
    id: str
    nameKey: str
    defaultName: str
    iconName: str
    shortDescKey: str
    defaultShortDesc: str
    subcategories: List[SubcategorySchema] = []

