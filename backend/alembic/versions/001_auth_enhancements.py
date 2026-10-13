"""Add OAuth, reset token, and nullable password to users

Revision ID: 001_auth_enhancements
Revises: 
Create Date: 2026-10-12 19:12:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001_auth_enhancements'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Modify password_hash to allow null for OAuth-only users
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('password_hash', existing_type=sa.String(255), nullable=True)
        batch_op.add_column(sa.Column('google_id', sa.String(100), nullable=True))
        batch_op.add_column(sa.Column('reset_token_hash', sa.String(255), nullable=True))
        batch_op.add_column(sa.Column('reset_token_expires_at', sa.DateTime(), nullable=True))
        batch_op.create_index(batch_op.f('ix_users_google_id'), ['google_id'], unique=True)

def downgrade() -> None:
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_users_google_id'))
        batch_op.drop_column('reset_token_expires_at')
        batch_op.drop_column('reset_token_hash')
        batch_op.drop_column('google_id')
        batch_op.alter_column('password_hash', existing_type=sa.String(255), nullable=False)
