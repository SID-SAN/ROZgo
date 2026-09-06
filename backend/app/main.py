import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings

# Import API routers
from app.routers.auth import router as auth_router
from app.routers.workers import router as workers_router
from app.routers.employers import router as employers_router
from app.routers.services import router as services_router
from app.routers.bookings import router as bookings_router
from app.routers.uploads import router as uploads_router
from app.routers.sync import router as sync_router

app = FastAPI(
    title="ROZgo API",
    description="Universal backend REST API for ROZgo Labour & Trade Workers Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration to allow requests from Vercel, localhost, and custom domains
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]
if settings.CORS_ORIGIN and settings.CORS_ORIGIN != "*":
    origins.append(settings.CORS_ORIGIN)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_origin_regex=r"^https?:\/\/.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Healthcheck endpoints
@app.get("/")
async def root():
    return {
        "service": "ROZgo API",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints_prefix": "/api/v1"
    }

@app.get("/health")
@app.get("/api/v1/health")
async def health():
    return {"status": "healthy", "service": "rozgo-backend"}

# Mount all routers under /api/v1
API_PREFIX = "/api/v1"
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(workers_router, prefix=API_PREFIX)
app.include_router(employers_router, prefix=API_PREFIX)
app.include_router(services_router, prefix=API_PREFIX)
app.include_router(bookings_router, prefix=API_PREFIX)
app.include_router(uploads_router, prefix=API_PREFIX)
app.include_router(sync_router, prefix=API_PREFIX)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": str(exc), "path": request.url.path}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)

