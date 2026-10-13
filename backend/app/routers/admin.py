from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.connection import get_db
from app.models.user import User
from app.models.property import Property
from app.models.bed import Bed
from app.models.join_request import JoinRequest
from app.models.complaint import Complaint
from app.models.payment import Payment
from app.models.audit_log import AuditLog
from app.schemas.user import UserCreate, UserResponse
from app.schemas.property import PropertyResponse
from app.schemas.audit_log import AuditLogResponse
from app.core.security import get_password_hash
from app.dependencies.auth import require_role
from app.services.audit import log_audit_event

router = APIRouter(prefix="/admin", tags=["Administration"])

# -----------------------------------------------------------------------------
# 1. Platform Statistics & KPI Aggregates
# -----------------------------------------------------------------------------
@router.get("/stats", response_model=dict)
def get_platform_stats(
    current_user: User = Depends(require_role(["admin", "super_admin"])),
    db: Session = Depends(get_db)
):
    """
    Returns platform-wide operational statistics.
    Accessible to both Admins and Super Admins.
    """
    total_users = db.query(User).count()
    tenants_count = db.query(User).filter(User.role == "tenant").count()
    owners_count = db.query(User).filter(User.role == "owner").count()
    admins_count = db.query(User).filter(User.role.in_(["admin", "super_admin"])).count()

    total_properties = db.query(Property).count()
    verified_properties = db.query(Property).filter(Property.verified == True).count()
    
    total_beds = db.query(Bed).count()
    vacant_beds = db.query(Bed).filter(Bed.availability_status == "vacant").count()

    total_requests = db.query(JoinRequest).count()
    pending_requests = db.query(JoinRequest).filter(JoinRequest.status == "pending").count()

    total_complaints = db.query(Complaint).count()
    open_complaints = db.query(Complaint).filter(Complaint.status.in_(["open", "in_progress"])).count()

    total_invoices = db.query(Payment).count()
    paid_revenue = db.query(func.coalesce(func.sum(Payment.amount), 0.0)).filter(Payment.status == "paid").scalar() or 0.0

    return {
        "users": {
            "total": total_users,
            "tenants": tenants_count,
            "owners": owners_count,
            "admins": admins_count,
        },
        "properties": {
            "total": total_properties,
            "verified": verified_properties,
        },
        "inventory": {
            "total_beds": total_beds,
            "vacant_beds": vacant_beds,
        },
        "requests": {
            "total": total_requests,
            "pending": pending_requests,
        },
        "complaints": {
            "total": total_complaints,
            "open": open_complaints,
        },
        "finance": {
            "total_invoices": total_invoices,
            "total_revenue": float(paid_revenue),
        }
    }


# -----------------------------------------------------------------------------
# 2. User Directory & Role-Isolated Listing
# -----------------------------------------------------------------------------
@router.get("/users", response_model=List[UserResponse])
def list_users_for_admin(
    role: Optional[str] = Query(None, description="Filter by role ('tenant', 'owner', 'admin', 'super_admin')"),
    current_user: User = Depends(require_role(["admin", "super_admin"])),
    db: Session = Depends(get_db)
):
    """
    Lists users across the platform:
    - Super Admin can view all accounts across all roles.
    - Admin can ONLY view Tenants and PG Owners (cannot view or manage administrative accounts).
    """
    if current_user.role == "admin":
        if role and role.lower() in ["admin", "super_admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admins are not permitted to inspect administrative accounts."
            )
        # Force filter to only operational roles for regular Admin
        query = db.query(User).filter(User.role.in_(["tenant", "owner"]))
        if role:
            query = query.filter(User.role == role.lower())
        return query.order_by(User.id.desc()).all()

    # Super Admin can view everything
    query = db.query(User)
    if role:
        query = query.filter(User.role == role.lower())
    return query.order_by(User.id.desc()).all()


# -----------------------------------------------------------------------------
# 3. Super Admin User Provisioning
# -----------------------------------------------------------------------------
@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def provision_admin_account(
    user_in: UserCreate,
    request: Request,
    current_user: User = Depends(require_role(["super_admin"])),
    db: Session = Depends(get_db)
):
    """
    Provisions a new administrative account.
    Restricted strictly to authorized Super Admins.
    Prevents self-escalation or unauthorized privilege grants.
    """
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    target_role = (user_in.role or "admin").lower()
    if target_role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target role must be either 'admin' or 'super_admin'."
        )

    hashed_pw = get_password_hash(user_in.password)
    avatar = user_in.name[:2].upper() if len(user_in.name) >= 2 else "AD"

    new_admin = User(
        name=user_in.name.strip(),
        email=user_in.email.lower().strip(),
        phone=user_in.phone.strip() if user_in.phone else None,
        password_hash=hashed_pw,
        role=target_role,
        avatar=avatar,
        kyc_status="verified",
        status="active"
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    # Log audit trail
    client_ip = request.client.host if request.client else None
    log_audit_event(
        db=db,
        actor=current_user,
        action="CREATE_ADMIN",
        target_type="user",
        target_id=str(new_admin.id),
        details=f"Created administrative account {new_admin.email} with role {new_admin.role}",
        ip_address=client_ip
    )

    return new_admin


# -----------------------------------------------------------------------------
# 4. Super Admin Role Management
# -----------------------------------------------------------------------------
@router.patch("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    new_role: str = Query(..., description="Target role ('tenant', 'owner', 'admin', 'super_admin')"),
    request: Request = None,
    current_user: User = Depends(require_role(["super_admin"])),
    db: Session = Depends(get_db)
):
    """
    Updates a user's role. Accessible strictly to Super Admins.
    Prevents users from modifying their own roles.
    """
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Super Admins cannot change their own role."
        )

    target_role = new_role.lower()
    if target_role not in ["tenant", "owner", "admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role specified."
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} was not found."
        )

    old_role = user.role
    user.role = target_role
    db.commit()
    db.refresh(user)

    client_ip = request.client.host if request and request.client else None
    log_audit_event(
        db=db,
        actor=current_user,
        action="UPDATE_USER_ROLE",
        target_type="user",
        target_id=str(user.id),
        details=f"Altered role of {user.email} from {old_role} to {target_role}",
        ip_address=client_ip
    )

    return user


# -----------------------------------------------------------------------------
# 5. Super Admin User Account Status (Activation / Suspension)
# -----------------------------------------------------------------------------
@router.patch("/users/{user_id}/status", response_model=UserResponse)
def update_user_status(
    user_id: int,
    new_status: str = Query(..., description="Target status ('active', 'suspended', 'inactive')"),
    request: Request = None,
    current_user: User = Depends(require_role(["super_admin"])),
    db: Session = Depends(get_db)
):
    """
    Suspends or reactivates a user account.
    Accessible strictly to Super Admins. Prevents self-suspension.
    """
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Super Admins cannot suspend their own account."
        )

    target_status = new_status.lower()
    if target_status not in ["active", "suspended", "inactive"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Permitted values: 'active', 'suspended', 'inactive'."
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} was not found."
        )

    old_status = user.status
    user.status = target_status
    db.commit()
    db.refresh(user)

    client_ip = request.client.host if request and request.client else None
    log_audit_event(
        db=db,
        actor=current_user,
        action="UPDATE_USER_STATUS",
        target_type="user",
        target_id=str(user.id),
        details=f"Updated status of {user.email} from {old_status} to {target_status}",
        ip_address=client_ip
    )

    return user


# -----------------------------------------------------------------------------
# 6. Listing Moderation (Admins & Super Admins)
# -----------------------------------------------------------------------------
@router.patch("/properties/{property_id}/moderate", response_model=PropertyResponse)
def moderate_property(
    property_id: int,
    verified: Optional[bool] = Query(None, description="Set verification badge status"),
    is_available: Optional[bool] = Query(None, description="Set listing availability visibility"),
    request: Request = None,
    current_user: User = Depends(require_role(["admin", "super_admin"])),
    db: Session = Depends(get_db)
):
    """
    Moderates a PG listing (verification badge and visibility).
    Accessible to both Admins and Super Admins.
    """
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} was not found."
        )

    changes = []
    if verified is not None:
        prop.verified = verified
        changes.append(f"verified={verified}")
    if is_available is not None:
        prop.is_available = is_available
        changes.append(f"is_available={is_available}")

    db.commit()
    db.refresh(prop)

    client_ip = request.client.host if request and request.client else None
    log_audit_event(
        db=db,
        actor=current_user,
        action="MODERATE_PROPERTY",
        target_type="property",
        target_id=str(prop.id),
        details=f"Moderated '{prop.name}': {', '.join(changes)}",
        ip_address=client_ip
    )

    return prop


# -----------------------------------------------------------------------------
# 7. Audit Logs Feed (Super Admin Only)
# -----------------------------------------------------------------------------
@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_role(["super_admin"])),
    db: Session = Depends(get_db)
):
    """
    Fetches the immutable security and operational audit trail.
    Accessible strictly to Super Admins.
    """
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
