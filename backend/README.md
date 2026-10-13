# StayEase Backend — FastAPI & MySQL REST Service

This directory contains the Python FastAPI backend for the **StayEase PG & Co-Living Platform**.

---

## 1. Architecture Overview

```
backend/
├── app/
│   ├── core/           # Configuration (Pydantic Settings) & Security (JWT, bcrypt)
│   ├── database/       # SQLAlchemy engine, session maker, connection checker, seeder
│   ├── dependencies/   # HTTPBearer Auth & Role-Based Access Control (RBAC)
│   ├── models/         # SQLAlchemy ORM Models (User, Property, Room, Bed, JoinRequest)
│   ├── schemas/        # Pydantic Schemas for request validation and response serialization
│   ├── routers/        # FastAPI API routers (/health, /auth, /properties, /rooms, /join-requests)
│   └── main.py         # Application entry point, CORS middleware, lifespan events
├── tests/              # Pytest automated test suite using isolated in-memory DB
├── alembic/            # Database schema migrations
├── alembic.ini         # Alembic configuration
├── requirements.txt    # Application dependencies
└── .env.example        # Environment variable template
```

---

## 2. Prerequisites

- **Python**: 3.10+ (Verified on Python 3.12.3)
- **MySQL**: 8.x or 9.x running on `localhost:3306`

---

## 3. Windows PowerShell Setup Instructions

### Step 1: Open PowerShell and Navigate to the Backend Directory
```powershell
cd "d:\Manasvi tech task\StayEaseProject\backend"
```

### Step 2: Create and Activate a Python Virtual Environment
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Step 3: Install Required Dependencies
```powershell
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```
Ensure your MySQL username and password in `.env` are accurate:
```env
DATABASE_URL="mysql+pymysql://root:@localhost:3306/stayease_db?charset=utf8mb4"
```

### Step 5: Create the MySQL Database
If `stayease_db` does not already exist, create it in MySQL:
```sql
CREATE DATABASE IF NOT EXISTS stayease_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 6: Start the FastAPI Development Server
```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
On startup:
- Tables are automatically verified / created.
- Initial seed data (default users, properties, rooms, beds) is loaded if empty.
- Access the interactive **Swagger UI** at: **`http://127.0.0.1:8000/docs`**
- Alternative ReDoc documentation: **`http://127.0.0.1:8000/redoc`**

---

## 4. Running Automated Tests

Tests run against an isolated in-memory SQLite database and do **not** touch or alter your MySQL database:

```powershell
pytest -v
```

---

## 5. API Endpoints Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Public | Health status & live MySQL connection test |
| **POST** | `/api/auth/register` | Public | Register new user account & return JWT |
| **POST** | `/api/auth/login` | Public | Authenticate email/password & return JWT |
| **GET** | `/api/auth/me` | Authenticated | Current authenticated user profile |
| **GET** | `/api/properties` | Public | Paginated list with city/rent/gender/keyword filters |
| **GET** | `/api/properties/{id}` | Public | Detailed property profile |
| **POST** | `/api/properties` | Owner / Admin | Create a new property listing |
| **PUT** | `/api/properties/{id}` | Owner / Admin | Update owned property |
| **DELETE** | `/api/properties/{id}` | Owner / Admin | Delete owned property |
| **GET** | `/api/rooms` | Public | List rooms (optional filter by `property_id`) |
| **POST** | `/api/rooms` | Owner / Admin | Create room with auto-generated bed slots |
| **POST** | `/api/join-requests` | Tenant | Submit booking/admission request |
| **GET** | `/api/join-requests` | Authenticated | Isolated join requests (Tenants see theirs, Owners see their properties) |
| **PATCH**| `/api/join-requests/{id}/status` | Owner / Admin | Approve or reject tenant request |

---

## 6. Default Test Personas

When initialized, the system automatically provides:
- **Tenant**: `rohan.sharma@example.com` / `password123`
- **Owner**: `rajesh.verma@stayliving.com` / `password123`
- **Admin**: `admin@stayease.com` / `password123`
