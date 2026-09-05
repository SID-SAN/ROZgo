from fastapi import APIRouter
from typing import List, Dict, Any
from app.database import get_supabase_client

router = APIRouter(prefix="/services", tags=["Services"])

SERVICES_LIST = [
    {
        "id": "plumber",
        "nameKey": "services.plumber",
        "defaultName": "Plumber",
        "iconName": "Wrench",
        "shortDescKey": "services.plumberDesc",
        "defaultShortDesc": "Pipe repair, leakage, tap fixes & sanitary works",
        "subcategories": [
            {"id": "tap_repair", "nameKey": "services.tapRepair", "defaultName": "Tap Repair & Fitting"},
            {"id": "pipe_leakage", "nameKey": "services.pipeLeakage", "defaultName": "Pipe Leakage & Joint Fix"},
            {"id": "drain_cleaning", "nameKey": "services.drainCleaning", "defaultName": "Drain Blockage & Cleaning"},
            {"id": "bathroom_plumbing", "nameKey": "services.bathroomPlumbing", "defaultName": "Complete Bathroom Plumbing"},
            {"id": "tank_install", "nameKey": "services.tankInstall", "defaultName": "Water Tank & Motor Installation"},
            {"id": "other_plumbing", "nameKey": "services.other", "defaultName": "Other Plumbing Work"}
        ]
    },
    {
        "id": "electrician",
        "nameKey": "services.electrician",
        "defaultName": "Electrician",
        "iconName": "Zap",
        "shortDescKey": "services.electricianDesc",
        "defaultShortDesc": "Wiring, switches, fuse & home circuit repairs",
        "subcategories": [
            {"id": "switchboard_repair", "nameKey": "services.switchboard", "defaultName": "Switchboard & Socket Repair"},
            {"id": "fan_install", "nameKey": "services.fanInstall", "defaultName": "Ceiling Fan Install & Repair"},
            {"id": "mcb_fuse", "nameKey": "services.mcbFuse", "defaultName": "MCB Tripping & Short Circuit"},
            {"id": "light_fitting", "nameKey": "services.lightFitting", "defaultName": "LED & Decorative Lighting"},
            {"id": "inverter_setup", "nameKey": "services.inverter", "defaultName": "Inverter & Battery Wiring"},
            {"id": "other_electrical", "nameKey": "services.other", "defaultName": "Other Electrical Work"}
        ]
    },
    {
        "id": "carpenter",
        "nameKey": "services.carpenter",
        "defaultName": "Carpenter",
        "iconName": "Hammer",
        "shortDescKey": "services.carpenterDesc",
        "defaultShortDesc": "Furniture repair, door locks, hinges & custom woodwork",
        "subcategories": [
            {"id": "furniture_repair", "nameKey": "services.furniture", "defaultName": "Furniture Repair & Assembly"},
            {"id": "door_lock", "nameKey": "services.doorLock", "defaultName": "Door Lock, Latch & Hinges"},
            {"id": "wardrobe_repair", "nameKey": "services.wardrobe", "defaultName": "Cupboard & Wardrobe Fixes"},
            {"id": "window_mesh", "nameKey": "services.windowMesh", "defaultName": "Window Mesh & Wooden Frames"},
            {"id": "other_carpentry", "nameKey": "services.other", "defaultName": "Other Carpentry Work"}
        ]
    },
    {
        "id": "domestic_help",
        "nameKey": "services.domesticHelp",
        "defaultName": "Domestic Help",
        "iconName": "Home",
        "shortDescKey": "services.domesticHelpDesc",
        "defaultShortDesc": "House cleaning, dusting, utensil washing & deep cleaning",
        "subcategories": [
            {"id": "daily_cleaning", "nameKey": "services.dailyCleaning", "defaultName": "Daily Home Cleaning"},
            {"id": "deep_cleaning", "nameKey": "services.deepCleaning", "defaultName": "Deep Kitchen & Bathroom Clean"},
            {"id": "utensil_washing", "nameKey": "services.utensils", "defaultName": "Utensil Cleaning & Mopping"},
            {"id": "elderly_care", "nameKey": "services.elderlyCare", "defaultName": "Elderly & Patient Assistance"},
            {"id": "other_help", "nameKey": "services.other", "defaultName": "Other Domestic Work"}
        ]
    },
    {
        "id": "mason",
        "nameKey": "services.mason",
        "defaultName": "Mason & Construction",
        "iconName": "HardHat",
        "shortDescKey": "services.masonDesc",
        "defaultShortDesc": "Brickwork, plastering, tile fixing, flooring & masonry",
        "subcategories": [
            {"id": "tile_laying", "nameKey": "services.tileLaying", "defaultName": "Floor & Wall Tile Laying"},
            {"id": "plaster_repair", "nameKey": "services.plaster", "defaultName": "Wall Plastering & Crack Repair"},
            {"id": "brickwork", "nameKey": "services.brickwork", "defaultName": "Brickwork & Partition Wall"},
            {"id": "concrete_repair", "nameKey": "services.concrete", "defaultName": "Concrete Slab & Lintels"},
            {"id": "other_mason", "nameKey": "services.other", "defaultName": "Other Masonry Work"}
        ]
    },
    {
        "id": "painter",
        "nameKey": "services.painter",
        "defaultName": "Painter",
        "iconName": "PaintBucket",
        "shortDescKey": "services.painterDesc",
        "defaultShortDesc": "Interior & exterior wall painting, waterproof coating & putty",
        "subcategories": [
            {"id": "interior_painting", "nameKey": "services.interiorPaint", "defaultName": "Interior Wall Painting"},
            {"id": "exterior_painting", "nameKey": "services.exteriorPaint", "defaultName": "Exterior Weatherproof Coat"},
            {"id": "putty_primer", "nameKey": "services.puttyPrimer", "defaultName": "Wall Putty & Primer Base"},
            {"id": "waterproofing", "nameKey": "services.waterproofing", "defaultName": "Roof & Wall Waterproofing"},
            {"id": "other_painter", "nameKey": "services.other", "defaultName": "Other Painting Work"}
        ]
    }
]

@router.get("", response_model=List[Dict[str, Any]])
async def get_services():
    supabase = get_supabase_client()
    if supabase:
        try:
            res = supabase.table("service_categories").select("*").execute()
            if res.data and len(res.data) > 0:
                return [
                    {
                        "id": row["id"],
                        "nameKey": row["name_key"],
                        "defaultName": row["default_name"],
                        "iconName": row["icon_name"],
                        "shortDescKey": row["short_desc_key"],
                        "defaultShortDesc": row["default_short_desc"],
                        "subcategories": row.get("subcategories", [])
                    }
                    for row in res.data
                ]
        except Exception as e:
            print(f"Error fetching services from Supabase: {e}")
    return SERVICES_LIST

@router.get("/categories", response_model=List[Dict[str, Any]])
async def get_service_categories():
    return await get_services()

