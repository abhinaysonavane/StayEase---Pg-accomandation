import time
import logging
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"

def is_google_oauth_configured() -> bool:
    """Returns True if Google Client ID is configured in settings."""
    return bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_ID.strip())

async def verify_google_id_token(id_token: str) -> Dict[str, Any]:
    """
    Verifies a genuine Google ID token via Google's OAuth2 / OpenID Connect tokeninfo endpoint.
    Strictly validates issuer, audience, expiration, and verified email status.
    """
    if not id_token or not id_token.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google ID token is required."
        )

    if not is_google_oauth_configured():
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=(
                "Google Sign-In is not configured on this server. "
                "Please configure GOOGLE_CLIENT_ID in your backend environment (.env). "
                "Standard email and password authentication is available."
            )
        )


    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{GOOGLE_TOKENINFO_URL}?id_token={id_token}")
            
            if resp.status_code != 200:
                logger.warning(f"Google tokeninfo returned status {resp.status_code}: {resp.text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired Google authentication token."
                )
            
            payload = resp.json()

        # 1. Verify Issuer
        issuer = payload.get("iss")
        if issuer not in ["accounts.google.com", "https://accounts.google.com"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Google token issuer: {issuer}"
            )

        # 2. Verify Audience
        audience = payload.get("aud")
        if audience != settings.GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google token audience does not match configured GOOGLE_CLIENT_ID."
            )

        # 3. Verify Expiration
        exp = int(payload.get("exp", 0))
        if exp < time.time():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google token has expired."
            )

        # 4. Verify Email presence and verification status
        email = payload.get("email")
        email_verified = payload.get("email_verified")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google account does not provide an email address."
            )
        
        if str(email_verified).lower() not in ["true", "1"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google email address has not been verified by Google."
            )

        return {
            "google_id": str(payload.get("sub")),
            "email": email.lower(),
            "name": payload.get("name") or email.split("@")[0],
            "picture": payload.get("picture"),
        }

    except httpx.RequestError as e:
        logger.error(f"Network error contacting Google OAuth endpoints: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to reach Google OAuth verification servers. Please try again later."
        )
