import logging
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.audit_log import AuditLog

logger = logging.getLogger("stayease.audit")

def log_audit_event(
    db: Session,
    actor: User,
    action: str,
    target_type: str,
    target_id: Optional[str] = None,
    details: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """
    Persists an immutable audit log record for administrative and security actions.
    Never logs credentials, passwords, or tokens.
    """
    audit = AuditLog(
        actor_id=actor.id if actor else None,
        actor_name=actor.name if actor else "System",
        actor_role=actor.role if actor else "system",
        action=action,
        target_type=target_type,
        target_id=str(target_id) if target_id is not None else None,
        details=details,
        ip_address=ip_address,
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    logger.info(f"[AUDIT] {actor.name} ({actor.role}) performed {action} on {target_type}:{target_id}")
    return audit
