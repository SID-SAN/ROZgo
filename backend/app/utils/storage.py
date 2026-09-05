import uuid
from typing import Optional
from app.database import get_supabase_client
from app.config import settings

async def upload_file_to_supabase(
    bucket: str,
    file_bytes: bytes,
    original_filename: str,
    content_type: str = "application/octet-stream"
) -> str:
    """
    Uploads a file to a Supabase Storage bucket and returns its accessible URL.
    """
    supabase = get_supabase_client()
    file_ext = original_filename.split(".")[-1] if "." in original_filename else "bin"
    unique_filename = f"{uuid.uuid4().hex}.{file_ext}"
    path = f"uploads/{unique_filename}"

    if supabase:
        try:
            supabase.storage.from_(bucket).upload(
                path=path,
                file=file_bytes,
                file_options={"content-type": content_type}
            )
            # If public bucket, get public URL
            if bucket == settings.SUPABASE_BUCKET_MEDIA:
                res = supabase.storage.from_(bucket).get_public_url(path)
                return res
            else:
                # For private bucket (like worker-documents), generate a signed URL valid for 7 days
                signed_res = supabase.storage.from_(bucket).create_signed_url(path, 604800)
                if isinstance(signed_res, dict) and "signedURL" in signed_res:
                    return signed_res["signedURL"]
                return f"{settings.SUPABASE_URL}/storage/v1/object/{bucket}/{path}"
        except Exception as e:
            print(f"Error uploading to Supabase Storage: {e}")

    # Fallback/mock URL if Supabase client not connected
    return f"https://mock-storage.rozgo.in/{bucket}/{path}"

import base64
import re

async def upload_base64_to_supabase(base64_data: str, bucket: str) -> str:
    """
    Detects if string is a base64 data URI (e.g. data:image/jpeg;base64,...),
    decodes it, uploads it to the Supabase Storage bucket, and returns the storage URL.
    If it's already an HTTP/HTTPS URL, returns it unchanged.
    """
    if not base64_data or not isinstance(base64_data, str):
        return ""
    if not base64_data.startswith("data:image"):
        return base64_data

    try:
        match = re.match(r"data:image/(\w+);base64,(.+)", base64_data)
        if match:
            ext = match.group(1)
            raw_base64 = match.group(2)
        else:
            ext = "jpeg"
            raw_base64 = base64_data.split(",")[-1]

        file_bytes = base64.b64decode(raw_base64)
        content_type = f"image/{ext}"
        return await upload_file_to_supabase(
            bucket=bucket,
            file_bytes=file_bytes,
            original_filename=f"photo.{ext}",
            content_type=content_type
        )
    except Exception as e:
        print(f"Error converting base64 to Supabase storage: {e}")
        return base64_data


