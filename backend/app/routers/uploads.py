from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.utils.storage import upload_file_to_supabase
from app.config import settings

router = APIRouter(prefix="/upload", tags=["Uploads & Documents"])

@router.post("/document")
async def upload_document(
    file: UploadFile = File(...),
    document_type: Optional[str] = Form(None)
):
    """
    Uploads worker KYC or verification documents (Aadhaar, e-Shram, Voter ID, Certificates)
    securely to the private Supabase storage bucket 'worker-documents'.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    contents = await file.read()
    file_url = await upload_file_to_supabase(
        bucket=settings.SUPABASE_BUCKET_DOCUMENTS,
        file_bytes=contents,
        original_filename=file.filename or "doc.pdf",
        content_type=file.content_type or "application/octet-stream"
    )

    return {
        "success": True,
        "url": file_url,
        "filename": file.filename,
        "documentType": document_type,
        "bucket": settings.SUPABASE_BUCKET_DOCUMENTS
    }

@router.post("/media")
async def upload_media(
    file: UploadFile = File(...),
    category: Optional[str] = Form("portfolio")
):
    """
    Uploads public media (profile avatar, portfolio work photos)
    to the public Supabase storage bucket 'public-media'.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    contents = await file.read()
    file_url = await upload_file_to_supabase(
        bucket=settings.SUPABASE_BUCKET_MEDIA,
        file_bytes=contents,
        original_filename=file.filename or "image.jpg",
        content_type=file.content_type or "image/jpeg"
    )

    return {
        "success": True,
        "url": file_url,
        "filename": file.filename,
        "category": category,
        "bucket": settings.SUPABASE_BUCKET_MEDIA
    }

@router.post("")
async def upload_generic(
    file: UploadFile = File(...),
    bucket: Optional[str] = Form("public-media")
):
    """Generic file uploader."""
    contents = await file.read()
    target_bucket = bucket if bucket else settings.SUPABASE_BUCKET_MEDIA
    file_url = await upload_file_to_supabase(
        bucket=target_bucket,
        file_bytes=contents,
        original_filename=file.filename or "file.bin",
        content_type=file.content_type or "application/octet-stream"
    )
    return {
        "success": True,
        "url": file_url,
        "filename": file.filename,
        "bucket": target_bucket
    }

