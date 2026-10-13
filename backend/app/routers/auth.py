from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.config import settings
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    GoogleAuthRequest,
    GoogleStatusResponse,
    MessageResponse
)
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    generate_reset_token,
    hash_reset_token
)
from app.dependencies.auth import get_current_user
from app.services.email import send_password_reset_email
from app.services.google_auth import (
    verify_google_id_token,
    is_google_oauth_configured
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

def _set_auth_cookie(response: Response, token: str):
    """Sets secure HttpOnly session cookie on the response."""
    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.COOKIE_SECURE
    )

def _clear_auth_cookie(response: Response):
    """Clears the authentication session cookie."""
    response.delete_cookie(
        key=settings.AUTH_COOKIE_NAME,
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.COOKIE_SECURE
    )

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, response: Response, db: Session = Depends(get_db)):
    """
    Registers a new tenant or PG owner account.
    Prevents self-assignment of administrator privileges.
    Enforces email uniqueness, hashes password, sets HttpOnly cookie and returns JWT.
    """
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    role = (user_in.role or "tenant").lower()
    if role not in ["tenant", "owner"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration is only allowed for 'tenant' or 'owner' roles. Administrator accounts cannot be self-registered."
        )

    if len(user_in.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    hashed_pw = get_password_hash(user_in.password)
    avatar = user_in.name[:2].upper() if len(user_in.name) >= 2 else "SE"

    new_user = User(
        name=user_in.name.strip(),
        email=user_in.email.lower().strip(),
        phone=user_in.phone.strip() if user_in.phone else None,
        password_hash=hashed_pw,
        role=role,
        avatar=avatar,
        kyc_status="pending",
        status="active"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(subject=new_user.id, role=new_user.role)
    _set_auth_cookie(response, token)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login_user(credentials: UserLogin, response: Response, db: Session = Depends(get_db)):
    """
    Authenticates email and password.
    Returns generic error for invalid credentials.
    Sets secure HttpOnly session cookie and returns JWT.
    """
    user = db.query(User).filter(User.email == credentials.email.lower()).first()
    if not user or not user.password_hash or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended or deactivated. Please contact support."
        )

    token = create_access_token(subject=user.id, role=user.role)
    _set_auth_cookie(response, token)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/logout", response_model=MessageResponse)
def logout_user(response: Response):
    """Clears the session cookie and completes sign-out."""
    _clear_auth_cookie(response)
    return MessageResponse(message="Successfully logged out.")

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's current profile and role."""
    return UserResponse.model_validate(current_user)

@router.get("/google/status", response_model=GoogleStatusResponse)
def get_google_oauth_status():
    """Returns whether Google OAuth credentials are configured on the backend."""
    return GoogleStatusResponse(
        configured=is_google_oauth_configured(),
        client_id=settings.GOOGLE_CLIENT_ID if is_google_oauth_configured() else None
    )

@router.post("/google", response_model=TokenResponse)
async def google_sign_in(req: GoogleAuthRequest, response: Response, db: Session = Depends(get_db)):
    """
    Authenticates or registers a user via verified Google ID token.
    Validates audience, issuer, expiration, and verified email directly via Google servers.
    Requires role choice (tenant or owner) for new users. Never assigns admin role.
    """
    verified = await verify_google_id_token(req.id_token)
    google_id = verified["google_id"]
    email = verified["email"]
    name = verified["name"]

    user = db.query(User).filter(
        (User.google_id == google_id) | (User.email == email)
    ).first()

    if user:
        # Existing user: update google_id if linking
        if not user.google_id:
            user.google_id = google_id
            db.commit()
            db.refresh(user)
    else:
        # New Google user: register with requested role
        desired_role = (req.role or "tenant").lower()
        if desired_role not in ["tenant", "owner"]:
            desired_role = "tenant"

        avatar = name[:2].upper() if len(name) >= 2 else "G"
        user = User(
            name=name,
            email=email,
            google_id=google_id,
            password_hash=None, # OAuth accounts do not have local password unless later set
            role=desired_role,
            avatar=avatar,
            kyc_status="pending",
            status="active"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended or deactivated. Please contact support."
        )

    token = create_access_token(subject=user.id, role=user.role)
    _set_auth_cookie(response, token)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/forgot-password", response_model=MessageResponse)
def request_password_reset(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Initiates password recovery.
    Generates a cryptographically secure, single-use, 15-minute token.
    Stores only the SHA-256 hash in the database.
    Sends reset link via configured email service.
    Returns generic message to prevent email enumeration.
    """
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if user and user.status == "active":
        raw_token = generate_reset_token()
        token_hash = hash_reset_token(raw_token)
        
        user.reset_token_hash = token_hash
        user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
        db.commit()

        send_password_reset_email(
            to_email=user.email,
            recipient_name=user.name,
            reset_token=raw_token
        )

    return MessageResponse(
        message="If your email address is registered, you will receive password reset instructions shortly."
    )

@router.post("/reset-password", response_model=MessageResponse)
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Validates single-use reset token hash and expiration.
    Updates the password hash and invalidates the token immediately.
    """
    if len(req.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    token_hash = hash_reset_token(req.token)
    user = db.query(User).filter(User.reset_token_hash == token_hash).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or already used password reset token."
        )

    # Check expiration
    now_utc = datetime.now(timezone.utc)
    expires_at = user.reset_token_expires_at
    if expires_at:
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < now_utc:
            # Invalidate expired token
            user.reset_token_hash = None
            user.reset_token_expires_at = None
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password reset token has expired. Please request a new link."
            )

    # Update password and invalidate single-use token
    user.password_hash = get_password_hash(req.new_password)
    user.reset_token_hash = None
    user.reset_token_expires_at = None
    db.commit()

    return MessageResponse(
        message="Password has been reset successfully. You may now sign in with your new password."
    )

