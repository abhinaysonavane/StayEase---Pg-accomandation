# StayEase — PG Accommodation & Co-Living Management Platform

StayEase is a full-stack, enterprise-grade PG accommodation and co-living platform designed to connect paying guests with property owners. It provides secure role-based access control (RBAC), database-backed property and bed inventory management, automated join requests, rent invoicing and receipt verification, maintenance complaint workflows, and Google OAuth 2.0 / OpenID Connect integration.

---

## 1. Architecture & Technology Stack

- **Frontend**: React 19, Vite 8, React Router, Tailwind/Modern CSS Component System, Google Identity Services SDK.
- **Backend**: Python 3.12, FastAPI, Pydantic v2 validation, SQLAlchemy 2.0 ORM, PyMySQL, Alembic migrations, PyJWT, Bcrypt.
- **Database**: MySQL 8.0 (primary) with resilient SQLite fallback (`stayease.db`) for isolated development & test environments.
- **Containerization**: Multi-stage Docker builds and Docker Compose orchestration.

---

## 2. Default Seed Accounts

The platform automatically seeds initial administrative personas upon first startup:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@stayease.com` | `password123` | Platform governance, admin user creation, role modification |
| **Admin** | `admin@stayease.com` | `password123` | Listing moderation, complaint resolution, join request oversight |
| **PG Owner** | `rajesh.verma@stayliving.com`| `password123` | Property & bed management, request approvals, rent invoicing |
| **Tenant** | `rohan.sharma@example.com` | `password123` | Property discovery, booking requests, rent payment, complaints |

> [!NOTE]
> Public self-registration is strictly restricted to **Tenant** and **PG Owner**. Admin and Super Admin accounts can never be created via public registration.

---

## 3. Quickstart: Local Development

### 3.1 Prerequisites
- Python 3.12+
- Node.js 20+ / 22+ & npm
- MySQL 8.0 (Optional — SQLite fallback activates automatically if MySQL is unreachable)

### 3.2 Environment Setup
Copy the sample environment configuration:
```bash
# In the project root
cp .env.example .env
```

### 3.3 Backend Setup & Startup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start FastAPI development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The FastAPI backend and interactive Swagger documentation will be available at:
- **API Base**: `http://127.0.0.1:8000/api`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/health`

### 3.4 Frontend Setup & Startup
In a separate terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend SPA will be accessible at `http://localhost:5173`.

---

## 4. Automated Testing & Verification

### 4.1 Backend Pytest Suite
Run the 47-test comprehensive automated test suite covering RBAC, authentication, properties, rooms, beds, join requests, payments, complaints, and notifications:
```bash
cd backend
.\venv\Scripts\python.exe -m pytest -v
```
*Result: 47 passed in ~12 seconds.*

### 4.2 Frontend Production Bundle Build
Test the production Vite build:
```bash
cd frontend
npm run build
```
*Result: 1,935 modules transformed with 0 errors in ~1.5s.*

---

## 5. Dockerized Deployment

To launch the complete multi-container stack (MySQL 8.0, FastAPI backend, React frontend on Nginx):

```bash
docker compose up --build -d
```

- **Frontend Application**: `http://localhost:80`
- **Backend API**: `http://localhost:8000/api`
- **Health Check**: `http://localhost:8000/health`
- **MySQL Database**: `localhost:3306`

To shut down:
```bash
docker compose down
```

---

## 6. Production Deployment & Database Management

### 6.1 Database Backup & Recovery

#### Backup MySQL Database:
```bash
mysqldump -u stayease_user -p -h localhost stayease_db > stayease_backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Restore MySQL Database:
```bash
mysql -u stayease_user -p -h localhost stayease_db < stayease_backup_YYYYMMDD_HHMMSS.sql
```

### 6.2 Applying Migrations in Production:
```bash
alembic upgrade head
```

### 6.3 Rollback Plan:
If an issue occurs after a release:
```bash
# Rollback database schema by 1 revision:
alembic downgrade -1

# Rollback container containers:
docker compose down
git checkout <previous-release-tag>
docker compose up --build -d
```

---

## 7. Architecture & Standalone Database Assets

- **Database Schemas & Seed Data**: Available directly in [`database/`](file:///d:/Manasvi%20tech%20task/StayEaseProject/database) (`schema.sql` and `seeds.sql`).
- **Interactive Backend API Documentation**: Hosted live on the FastAPI ASGI server at `http://127.0.0.1:8000/docs` (Swagger UI) and `http://127.0.0.1:8000/redoc` (ReDoc).
- **Automated Verification**: Complete test suites available in `backend/tests/` running via `pytest -v`.


