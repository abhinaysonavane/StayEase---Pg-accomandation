# StayEase Database Architecture & Setup

This folder contains the standalone MySQL 8.0 schema definitions, initial seed datasets, and database architecture documentation for the **StayEase PG Accommodation Platform**.

---

## 1. Directory Overview & Organization

The database architecture is organized across three layers:

```
StayEaseProject/
├── database/                             # Standalone SQL & DDL Scripts (This Directory)
│   ├── schema.sql                        # Production MySQL 8.0 Table Schemas, Keys & Constraints
│   ├── seeds.sql                         # Initial test seed personas and properties
│   └── README.md                         # Database architecture guide
│
├── backend/
│   ├── app/
│   │   ├── database/                     # SQLAlchemy Connection & Auto-Migration
│   │   │   ├── connection.py             # Engine, SessionLocal, and SQLite fallback logic
│   │   │   └── init_db.py                # Table creation and seeder logic
│   │   └── models/                       # SQLAlchemy ORM Entity Models
│   │       ├── user.py                   # Users & authentication accounts
│   │       ├── property.py               # PG Properties & amenities
│   │       ├── room.py                   # Rooms & floor mappings
│   │       ├── bed.py                    # Bed inventory & occupancy status
│   │       ├── join_request.py           # Tenant booking & join requests
│   │       ├── payment.py                # Rent invoices & payment receipts
│   │       ├── complaint.py              # Maintenance tickets & resolutions
│   │       └── notification.py           # In-app notifications
│   │
│   ├── alembic/                          # Alembic Migration Engine
│   │   ├── env.py                        # Migration environment config
│   │   └── versions/
│   │       ├── 001_auth_enhancements.py  # OAuth and password reset migration
│   │       └── 002_operations_and_records.py # Payments, complaints & notifications migration
│   │
│   └── stayease.db                       # Local SQLite runtime database (auto-created if MySQL is offline)
```

---

## 2. Supported Database Engines

1. **MySQL 8.0 (Primary Production Engine)**:
   - Default Port: `3306`
   - Connection string format: `mysql+pymysql://<user>:<password>@<host>:3306/<database>`
   - Supports InnoDB engine with transactions, foreign key cascades, and JSON data types.

2. **SQLite (Resilient Local Development Fallback)**:
   - Location: `backend/stayease.db`
   - Connection string format: `sqlite:///./stayease.db`
   - Automatically activates if a local MySQL instance is not running or credentials fail, ensuring uninterrupted development and testing.

---

## 3. How to Initialize the MySQL Database

### Option A: Using the Provided SQL Scripts (Recommended for DBAs)

```bash
# 1. Log in to MySQL and create/import schema
mysql -u root -p < database/schema.sql

# 2. Populate initial test data and seed personas
mysql -u root -p < database/seeds.sql
```

### Option B: Using Python Alembic Migrations

From the `backend/` directory:

```bash
cd backend
alembic upgrade head
```

---

## 4. Default Seed Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@stayease.com` | `password123` | Platform governance, admin user creation, role modification |
| **Admin** | `admin@stayease.com` | `password123` | Listing moderation, complaint resolution, join request oversight |
| **PG Owner** | `rajesh.verma@stayliving.com`| `password123` | Property & bed management, request approvals, rent invoicing |
| **Tenant** | `rohan.sharma@example.com` | `password123` | Property discovery, booking requests, rent payment, complaints |
