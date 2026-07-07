# 🛢️ MJ Agency — Oil Selling & Billing Software

> A full-stack, production-ready wholesale oil distribution management system built with **FastAPI** + **React 18 + TypeScript**.

---

## ✨ Features

| Module | Highlights |
|--------|-----------|
| 🧾 **Billing / POS** | Barcode scan, cart, multi-payment (cash/card/UPI/split), printable invoice |
| 📦 **Products** | Full CRUD, SKU, barcode, image upload, CSV export, low-stock alerts |
| 🛒 **Purchases** | Multi-item purchase invoices, auto stock increment, GST calculation |
| 📊 **Dashboard** | Live stats, sales chart, monthly revenue, top products, recent bills |
| 📁 **Categories** | Category & Sub-category management |
| 👥 **Customers & Suppliers** | Full CRUD with contact & GST details |
| 📋 **Sales History** | View/cancel sales, automatic stock restoration on cancel |
| 📦 **Stock** | Real-time inventory, movement history, manual adjustments, low-stock alerts |
| 🚛 **Vehicles** | Fleet management with fuel, maintenance & insurance expense tracking |
| 👷 **Staff & Payroll** | Employee records, daily/monthly salary, payment history |
| 📈 **Reports** | Sales, Purchase, Stock, GST, and Profit & Loss reports |
| ⚙️ **Settings** | Company profile, logo upload, invoice prefix, currency, GST mode |

---

## 🏗️ Tech Stack

**Backend:** FastAPI · PostgreSQL · SQLAlchemy · Alembic · JWT (python-jose) · Pydantic v2 · ReportLab · openpyxl

**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · React Query · React Hook Form · Axios · Recharts · lucide-react

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

---

### 1. PostgreSQL — Create Database

```sql
CREATE DATABASE billing_db;
```

---

### 2. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env — set DATABASE_URL and SECRET_KEY

# Run database migrations
alembic upgrade head

# Seed default admin user
python seed.py

# Start server
uvicorn app.main:app --reload --port 8000
```

- **API:** http://localhost:8000
- **Swagger Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

### 3. Frontend Setup

```bash
cd frontend

npm install

# Configure environment (optional — Vite proxy handles /api by default)
copy .env.example .env

npm run dev
```

- **App:** http://localhost:5173

---

## 🔑 Default Credentials

```
Email:    admin@example.com
Password: admin123
```

> ⚠️ Change the default password immediately in production!

---

## 📁 Project Structure

```
oil-selling-billing-software/
├── backend/
│   ├── app/
│   │   ├── api/v1/         # REST API routers (auth, products, sales, etc.)
│   │   ├── core/           # JWT, security, config, dependencies
│   │   ├── database/       # SQLAlchemy session & engine
│   │   ├── models/         # ORM models (12 tables)
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── services/       # Business logic layer
│   │   └── main.py         # FastAPI entry point
│   ├── migrations/         # Alembic migration versions
│   ├── seed.py             # Admin user seed script
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── components/ui/  # Shared UI components (Modal, Combobox, etc.)
        ├── context/        # AuthContext, ThemeContext
        ├── hooks/          # useDebounce
        ├── layouts/        # Sidebar, Navbar, MainLayout
        ├── pages/          # All page components (15 pages)
        ├── routes/         # AppRoutes with auth guard
        ├── services/       # Axios API service layer + Mock store
        ├── types/          # TypeScript interfaces
        └── utils/          # Format helpers (fmtCurrency, fmtDate)
```

---

## 🔌 API Overview

All API routes are prefixed with `/api/v1`. Authentication uses JWT Bearer tokens.

| Router | Endpoints |
|--------|----------|
| Auth | `POST /auth/login` · `POST /auth/refresh` · `GET /auth/me` |
| Dashboard | `GET /dashboard/stats` |
| Categories | Full CRUD `/categories` · `/subcategories` |
| Products | Full CRUD `/products` + image upload + CSV export |
| Customers | Full CRUD `/customers` |
| Suppliers | Full CRUD `/suppliers` |
| Purchases | Full CRUD `/purchases` (auto stock ++) |
| Sales | `/sales` CRUD + `/sales/{id}/cancel` (auto stock restore) |
| Stock | `GET /stock` · `POST /stock/adjust` |
| Reports | `GET /reports/sales|purchases|stock|gst|profit-loss` |
| Settings | `GET/PUT /settings` + logo upload |

---

## 🔄 Key Business Flow

```
Purchase (Supplier → Stock)
  POST /purchases → stock ↑ → StockMovement (purchase)

Sale (Stock → Customer)
  POST /sales → stock ↓ → StockMovement (sale) → Invoice

Cancel Sale
  PUT /sales/{id}/cancel → stock ↑ → StockMovement (return_in)

Manual Adjustment
  POST /stock/adjust → stock ↑↓ → StockMovement (adjustment)
```

---

## 🗄️ Database Models

```
users → categories → subcategories → products
                                        ↓
                              purchase_items ← purchases ← suppliers
                              sale_items    ← sales     ← customers
                              stock_movements
settings (singleton)
```

---

## 🧪 Development Mode (No Backend)

The frontend includes a full **mock API adapter** (`mockStore.ts`) that intercepts all Axios requests and responds with stateful in-memory data. You can run the frontend independently without a backend server for UI development.

---

## 📚 Documentation

See **[DOCUMENTATION.md](./DOCUMENTATION.md)** for full technical documentation including:
- Detailed system architecture diagram
- Complete database ERD with all fields
- Full API endpoint reference
- Frontend module guide
- All 5 key business flows
- TypeScript type reference

---

## 📄 License

Private — MJ Agency Internal Software
