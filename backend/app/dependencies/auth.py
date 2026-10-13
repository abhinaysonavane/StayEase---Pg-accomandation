from typing import Optional, List
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.config import settings
from app.core.security import decode_access_token
from app.models.user import User

security_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Authenticates user from either Authorization Bearer header or secure HttpOnly cookie.
    Validates token expiration, signature, and user active status.
    """
    token = None
    if credentials and credentials.credentials:
        token = credentials.credentials
    elif settings.AUTH_COOKIE_NAME in request.cookies:
        token = request.cookies[settings.AUTH_COOKIE_NAME]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication session",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject identifier",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = None
    if str(sub).isdigit():
        user = db.query(User).filter(User.id == int(sub)).first()
    if not user:
        user = db.query(User).filter(User.email == str(sub)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authenticated user no longer exists",
        )
    
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is suspended or inactive",
        )
    
    return user

def get_optional_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Returns authenticated User if cookie or token is present and valid; None otherwise."""
    try:
        return get_current_user(request, credentials, db)
    except HTTPException:
        return None

def require_role(allowed_roles: List[str]):
    """Role-based access control (RBAC) dependency factory."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role '{current_user.role}'. Required one of: {allowed_roles}"
            )
        return current_user
    return role_checker
