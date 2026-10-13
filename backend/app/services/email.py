import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional, Dict
from app.core.config import settings

logger = logging.getLogger(__name__)

# Development/test storage for inspecting outbound messages during testing
last_dispatched_email: Optional[Dict[str, str]] = None

def send_password_reset_email(to_email: str, recipient_name: str, reset_token: str) -> bool:
    """
    Dispatches a password reset email to the user.
    If SMTP settings are present, sends via real SMTP server with STARTTLS.
    If SMTP settings are not configured, provides a secure development fallback,
    recording the transmission for dev/test verification without leaking tokens in API responses.
    """
    global last_dispatched_email
    
    reset_url = f"{settings.FRONTEND_URL}?view=reset-password&token={reset_token}"
    subject = "Reset Your StayEase Password"
    
    plain_text = f"""Hello {recipient_name},

We received a request to reset your password for your StayEase account.
Click the link below to set a new password (valid for 15 minutes):

{reset_url}

If you did not request a password reset, please ignore this email. Your account remains secure.

Best regards,
The StayEase Team
"""

    html_content = f"""<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px;">
    <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">Stay<span style="color: #1e1b4b;">Ease</span></h2>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Accommodation & PG Living Platform</p>
        </div>
        <h3 style="color: #0f172a; margin-top: 0;">Password Reset Request</h3>
        <p style="color: #334155; line-height: 1.6; font-size: 15px;">
            Hello <strong>{recipient_name}</strong>,
        </p>
        <p style="color: #334155; line-height: 1.6; font-size: 15px;">
            We received a request to reset your password. Click the button below to choose a new password. This link is valid for <strong>15 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 28px 0;">
            <a href="{reset_url}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 15px;">
                Reset Password
            </a>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
            Or copy and paste this URL into your browser:<br/>
            <span style="color: #4f46e5; word-break: break-all;">{reset_url}</span>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; line-height: 1.4; margin: 0;">
            If you did not request this reset, you can safely ignore this email. No changes will be made to your StayEase account.
        </p>
    </div>
</body>
</html>"""

    # If SMTP is configured
    if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            msg["To"] = to_email

            msg.attach(MIMEText(plain_text, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], msg.as_string())
            
            logger.info(f"Password reset email sent to {to_email} via SMTP")
            return True
        except Exception as e:
            logger.error(f"Failed to dispatch reset email via SMTP to {to_email}: {e}")
            # If in development, don't crash
            if settings.APP_ENV != "production":
                last_dispatched_email = {
                    "to_email": to_email,
                    "recipient_name": recipient_name,
                    "reset_url": reset_url,
                    "token": reset_token
                }
                return True
            return False

    # Development fallback
    last_dispatched_email = {
        "to_email": to_email,
        "recipient_name": recipient_name,
        "reset_url": reset_url,
        "token": reset_token
    }
    logger.info(
        f"[DEV EMAIL FALLBACK] Password reset link for {to_email}: {reset_url} "
        "(Configure SMTP_HOST, SMTP_USER, SMTP_PASSWORD in .env for production SMTP)"
    )
    return True
