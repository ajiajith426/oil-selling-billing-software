# Billing & Inventory Management System

A full-stack production-ready billing and inventory management system.

## Tech Stack

**Backend:** FastAPI · PostgreSQL · SQLAlchemy · Alembic · JWT  
**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · React Query · Recharts

---

## Quick Start

### 1. PostgreSQL — Create Database

```sql
CREATE DATABASE billing_db;
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env — set DATABASE_URL, SECRET_KEY

# Seed default admin user
python seed.py

# Start server
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs  
Default login: `admin@example.com` / `admin123`

### 3. Frontend Setup

```bash
cd frontend

npm install

# Configure environment (optional — Vite proxy handles /api by default)
copy .env.example .env

npm run dev
```

Frontend: http://localhost:5173

---

## Project Structure

```
backend/
  app/
    api/v1/         # REST API routers
    core/           # JWT, security, config, dependencies
    database/       # SQLAlchemy session
    middleware/     # CORS
    models/         # SQLAlchemy ORM models
    repositories/   # Base repository
    schemas/        # Pydantic request/response schemas
    services/       # Business logic
    utils/          # Pagination helpers
    main.py         # FastAPI app entry point
  migrations/       # Alembic migrations
  seed.py           # Seed script
  requirements.txt

frontend/
  src/
    components/ui/  # Shared UI components
    context/        # AuthContext, ThemeContext
    hooks/          # useDebounce
    layouts/        # Sidebar, Navbar, MainLayout
    pages/          # All page components
    routes/         # AppRoutes
    services/       # Axios API service layer
    types/          # TypeScript interfaces
    utils/          # Format helpers
```

## Modules

| Module | Features |
|--------|---------|
| Auth | JWT login/logout, refresh tokens, role-based (Admin/Staff) |
| Dashboard | Stats cards, sales graph, monthly revenue, top products, recent bills |
| Categories | CRUD, search, pagination, active/inactive |
| Sub Categories | CRUD with category dropdown |
| Products | Full CRUD, barcode, image upload, CSV export, low stock alerts |
| Customers | Full CRUD with search |
| Suppliers | Full CRUD with search |
| Purchases | Multi-item invoice, tax calc, stock auto-update |
| Billing/POS | Barcode scan, cart, multi-payment (cash/card/UPI/split), invoice print |
| Sales History | View/cancel sales, stock restoration |
| Stock | Stock in/out/adjustment, movement history, low stock alerts |
| Reports | Sales, Purchase, Stock, GST, Profit & Loss |
| Settings | Company profile, logo upload, invoice prefix, currency, tax mode |

## Default Credentials

```
Email:    admin@example.com
Password: admin123
```
