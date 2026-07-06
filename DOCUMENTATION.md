# MJ Agency — Oil Selling & Billing Software
### Comprehensive Technical Documentation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Project Structure](#4-project-structure)
5. [Database Models (ERD)](#5-database-models-erd)
6. [Backend — API Reference](#6-backend--api-reference)
7. [Frontend — Module Guide](#7-frontend--module-guide)
8. [Data Flow & Application Lifecycle](#8-data-flow--application-lifecycle)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Key Business Flows](#10-key-business-flows)
11. [Environment Variables](#11-environment-variables)
12. [TypeScript Types Reference](#12-typescript-types-reference)

---

## 1. Project Overview

**MJ Agency Billing Software** is a full-stack, production-ready wholesale oil distribution management system. It handles the complete business cycle from stock procurement to customer billing, with real-time inventory tracking, GST management, vehicle fleet tracking, staff & payroll, and financial reporting.

### Key Capabilities

| Area | What It Does |
|------|-------------|
| Billing / POS | Barcode-scanned cart, multi-payment modes, printable invoice |
| Purchases | Multi-item purchase invoices with automatic stock increment |
| Inventory | Real-time stock tracking with movement history and low-stock alerts |
| Reports | Sales, Purchase, Stock, GST, and Profit & Loss reports |
| Vehicles | Fleet management with expense (fuel, maintenance, insurance) tracking |
| Staff | Employee records, daily/monthly salary, payment history |
| Settings | Company profile, logo, invoice prefix, currency, GST mode |

---

## 2. Tech Stack

### Backend
| Package | Version | Role |
|---------|---------|------|
| FastAPI | 0.111.0 | Web framework & OpenAPI documentation |
| SQLAlchemy | 2.0.30 | ORM for PostgreSQL |
| Alembic | 1.13.1 | Database migrations |
| psycopg2-binary | 2.9.9 | PostgreSQL driver |
| Pydantic v2 | 2.7.1 | Data validation & serialisation |
| python-jose | 3.3.0 | JWT token creation & verification |
| passlib[bcrypt] | 1.7.4 | Password hashing |
| reportlab | 4.2.2 | PDF invoice generation |
| openpyxl | 3.1.2 | Excel report export |
| Pillow | 10.3.0 | Image processing for uploads |

### Frontend
| Package | Role |
|---------|------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| @tanstack/react-query | Server-state management & caching |
| React Hook Form | Form state & validation |
| Axios | HTTP client with interceptors |
| Recharts | Dashboard charts |
| lucide-react | Icon library |
| react-hot-toast | Toast notifications |
| Tailwind CSS | Utility-first styling |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│  React 18 + TypeScript (Vite)                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Pages    │  │Components│  │ Services │  │  Contexts  │  │
│  │ (Routes) │→ │   (UI)   │  │ (Axios)  │  │Auth, Theme │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│                                    │                        │
└────────────────────────────────────┼────────────────────────┘
                                     │ HTTP/JSON (REST)
                                     │ /api/v1/*
┌────────────────────────────────────┼────────────────────────┐
│                   BACKEND          ▼                        │
│                                                             │
│  FastAPI (Uvicorn ASGI)                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Routers │→ │ Services │→ │  Models  │→ │  Alembic   │  │
│  │  (v1)    │  │(Business)│  │(SQLAlch.)│  │Migrations  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│                                    │                        │
└────────────────────────────────────┼────────────────────────┘
                                     │ SQLAlchemy ORM
┌────────────────────────────────────▼────────────────────────┐
│                    PostgreSQL Database                       │
│  Tables: users, categories, subcategories, products,        │
│          customers, suppliers, purchases, purchase_items,    │
│          sales, sale_items, stock_movements, settings        │
└─────────────────────────────────────────────────────────────┘
                         │
              /uploads (static files)
              Product images, Company logo
```

---

## 4. Project Structure

```
oil-selling-billing-software/
├── README.md
├── DOCUMENTATION.md          ← This file
│
├── backend/
│   ├── .env.example
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── seed.py               ← Creates default admin user
│   ├── migrations/           ← Alembic migration versions
│   └── app/
│       ├── main.py           ← FastAPI app entry point, CORS, static files
│       ├── api/
│       │   └── v1/
│       │       ├── router.py          ← Aggregates all routers under /api/v1
│       │       ├── auth.py            ← POST /login, POST /refresh, GET /me
│       │       ├── dashboard.py       ← GET /dashboard/stats
│       │       ├── categories.py      ← CRUD /categories, /subcategories
│       │       ├── products.py        ← CRUD /products, image upload, CSV export
│       │       ├── customers.py       ← CRUD /customers
│       │       ├── suppliers.py       ← CRUD /suppliers
│       │       ├── purchases.py       ← CRUD /purchases (multi-item)
│       │       ├── sales.py           ← CRUD /sales (POS billing)
│       │       ├── stock.py           ← GET /stock, POST /stock/adjust
│       │       ├── reports.py         ← GET /reports/* (sales/purchase/gst/pnl)
│       │       └── settings.py        ← GET/PUT /settings, logo upload
│       ├── core/
│       │   ├── config.py              ← Pydantic Settings (env vars)
│       │   ├── security.py            ← JWT create/verify, password hashing
│       │   └── dependencies.py        ← get_current_user, get_db
│       ├── database/
│       │   └── session.py             ← SQLAlchemy engine & session factory
│       ├── middleware/
│       │   └── cors.py                ← CORS configuration
│       ├── models/                    ← SQLAlchemy ORM models
│       │   ├── user.py
│       │   ├── category.py
│       │   ├── subcategory.py
│       │   ├── product.py
│       │   ├── customer.py
│       │   ├── supplier.py
│       │   ├── purchase.py            ← Purchase + PurchaseItem
│       │   ├── sale.py                ← Sale + SaleItem
│       │   ├── stock.py               ← StockMovement
│       │   └── settings.py            ← CompanySettings
│       ├── schemas/                   ← Pydantic request/response schemas
│       ├── services/                  ← Business logic layer
│       ├── repositories/              ← Base CRUD repository pattern
│       └── utils/
│           └── pagination.py          ← Paginated response helper
│
└── frontend/
    ├── .env.example
    ├── package.json
    ├── vite.config.ts                 ← Proxy /api → :8000
    ├── tailwind.config.js
    └── src/
        ├── App.tsx                    ← Root component
        ├── main.tsx                   ← ReactDOM.render, QueryClient, BrowserRouter
        ├── index.css                  ← Global styles
        ├── assets/                    ← Static assets
        ├── context/
        │   ├── AuthContext.tsx        ← JWT storage, login/logout, user state
        │   └── ThemeContext.tsx       ← Dark/light mode toggle
        ├── hooks/
        │   └── useDebounce.ts         ← Debounce hook for search inputs
        ├── layouts/
        │   ├── MainLayout.tsx         ← Shell: Sidebar + Navbar + <Outlet />
        │   ├── Sidebar.tsx            ← Navigation menu
        │   └── Navbar.tsx             ← Top bar with user info & theme toggle
        ├── routes/
        │   └── AppRoutes.tsx          ← Route definitions, RequireAuth guard
        ├── pages/
        │   ├── auth/LoginPage.tsx
        │   ├── dashboard/Dashboard.tsx
        │   ├── categories/CategoriesPage.tsx
        │   ├── categories/SubCategoriesPage.tsx
        │   ├── products/ProductsPage.tsx
        │   ├── customers/CustomersPage.tsx
        │   ├── suppliers/SuppliersPage.tsx
        │   ├── purchases/PurchasesPage.tsx
        │   ├── purchases/NewPurchasePage.tsx
        │   ├── billing/BillingPage.tsx     ← POS / cash register
        │   ├── billing/SalesPage.tsx       ← Sales history list
        │   ├── billing/SaleDetailPage.tsx  ← Single sale detail + print
        │   ├── stock/StockPage.tsx
        │   ├── vehicles/VehicleManagementPage.tsx
        │   ├── staff/StaffManagementPage.tsx
        │   ├── reports/ReportsPage.tsx
        │   └── settings/SettingsPage.tsx
        ├── services/
        │   ├── api.ts                 ← Axios instance + mock adapter
        │   ├── auth.service.ts
        │   ├── category.service.ts
        │   ├── product.service.ts
        │   ├── customer.service.ts
        │   ├── supplier.service.ts
        │   ├── purchase.service.ts
        │   ├── sale.service.ts
        │   ├── stock.service.ts
        │   ├── dashboard.service.ts
        │   ├── report.service.ts
        │   ├── settings.service.ts
        │   ├── staff.service.ts
        │   ├── vehicle.service.ts
        │   └── mockStore.ts           ← In-memory mock DB for offline dev
        ├── components/ui/             ← Reusable UI primitives
        │   ├── Modal.tsx
        │   ├── ConfirmDialog.tsx
        │   ├── Pagination.tsx
        │   ├── Combobox.tsx
        │   ├── DatePicker.tsx
        │   ├── StatCard.tsx
        │   └── LoadingSkeleton.tsx
        ├── types/index.ts             ← All TypeScript interfaces
        └── utils/
            └── format.ts              ← fmtCurrency, fmtDate helpers
```

---

## 5. Database Models (ERD)

```
users
  id PK | name | email | hashed_password | role (admin|staff) | is_active | created_at

categories
  id PK | name | description | is_active | created_at

subcategories
  id PK | name | category_id FK→categories | description | is_active | created_at

products
  id PK | name | category_id FK→categories | subcategory_id FK→subcategories
  sku (unique) | barcode (unique) | purchase_price | selling_price | gst_percent
  unit | current_stock | minimum_stock | brand | description | image_url
  is_active | created_at | updated_at

customers
  id PK | name | mobile | email | gst_number | address | city | state | pincode | created_at

suppliers
  id PK | name | mobile | email | gst_number | address | city | state | pincode | created_at

purchases
  id PK | invoice_number (unique) | supplier_id FK→suppliers | purchase_date
  subtotal | discount_amount | tax_amount | grand_total | paid_amount | due_amount
  status (pending|received|cancelled) | notes | created_by FK→users | created_at

purchase_items
  id PK | purchase_id FK→purchases | product_id FK→products
  quantity | unit_price | gst_percent | gst_amount
  discount_percent | discount_amount | total_amount

sales
  id PK | invoice_number (unique) | customer_id FK→customers | sale_date
  subtotal | discount_amount | tax_amount | grand_total
  paid_amount | change_amount | payment_method (cash|card|upi|split)
  cash_amount | card_amount | upi_amount
  status (completed|cancelled|refunded) | notes | created_by FK→users | created_at

sale_items
  id PK | sale_id FK→sales | product_id FK→products
  quantity | unit_price | gst_percent | gst_amount
  discount_percent | discount_amount | total_amount

stock_movements
  id PK | product_id FK→products
  movement_type (stock_in|stock_out|adjustment|purchase|sale|return_in|return_out)
  quantity | stock_before | stock_after | reference_id | reference_type | notes | created_at

settings (singleton row)
  id PK | company_name | gst_number | phone | email | address | city | state | pincode
  logo_url | invoice_prefix | purchase_prefix | currency | currency_symbol
  tax_inclusive | website
```

### Relationship Summary

```
Category ──< SubCategory
Category ──< Product
SubCategory ──< Product
Product ──< PurchaseItem >── Purchase ──< Supplier
Product ──< SaleItem >── Sale ──< Customer
Product ──< StockMovement
User ──< Sale (created_by)
User ──< Purchase (created_by)
```

---

## 6. Backend — API Reference

**Base URL:** `http://localhost:8000/api/v1`  
**Swagger UI:** `http://localhost:8000/docs`  
**ReDoc:** `http://localhost:8000/redoc`

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Email + password → access_token + refresh_token |
| POST | `/auth/refresh` | Refresh token → new access_token |
| GET | `/auth/me` | Returns current user from JWT |

**Token usage:** All protected routes require `Authorization: Bearer <access_token>` header.  
**Token lifetime:** Access token = 30 min · Refresh token = 7 days

---

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Today sales, monthly revenue, product/customer counts, low-stock count |

---

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List with pagination & search |
| POST | `/categories` | Create category |
| PUT | `/categories/{id}` | Update category |
| DELETE | `/categories/{id}` | Delete |
| GET | `/subcategories` | List subcategories (filter by category_id) |
| POST | `/subcategories` | Create subcategory |
| PUT | `/subcategories/{id}` | Update subcategory |
| DELETE | `/subcategories/{id}` | Delete subcategory |

---

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List with pagination, search, category filter |
| POST | `/products` | Create product |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |
| POST | `/products/{id}/image` | Upload product image |
| GET | `/products/export/csv` | Export all products as CSV |

---

### Customers & Suppliers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | Paginated list with search |
| POST | `/customers` | Create customer |
| PUT | `/customers/{id}` | Update |
| DELETE | `/customers/{id}` | Delete |
| GET | `/suppliers` | Paginated list with search |
| POST | `/suppliers` | Create supplier |
| PUT | `/suppliers/{id}` | Update |
| DELETE | `/suppliers/{id}` | Delete |

---

### Purchases

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/purchases` | List purchase invoices |
| GET | `/purchases/{id}` | Single purchase with items |
| POST | `/purchases` | Create purchase (auto-increments stock) |
| PUT | `/purchases/{id}` | Update purchase |
| DELETE | `/purchases/{id}` | Cancel/delete purchase |

---

### Sales

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sales` | List sales with date/status filters |
| GET | `/sales/{id}` | Single sale detail with items |
| POST | `/sales` | Create sale (auto-decrements stock) |
| PUT | `/sales/{id}/cancel` | Cancel sale (restores stock) |

---

### Stock

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stock` | List products with current stock & movements |
| GET | `/stock/movements` | All stock movement history |
| POST | `/stock/adjust` | Manual stock adjustment (in/out) |

---

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/sales` | Sales summary with date range filter |
| GET | `/reports/purchases` | Purchase summary |
| GET | `/reports/stock` | Current stock valuation |
| GET | `/reports/gst` | GST collected/paid report |
| GET | `/reports/profit-loss` | Revenue vs cost P&L report |

---

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings` | Get company settings |
| PUT | `/settings` | Update company settings |
| POST | `/settings/logo` | Upload company logo |

---

## 7. Frontend — Module Guide

### Routing (AppRoutes.tsx)

All authenticated routes are wrapped by `RequireAuth` guard and rendered inside `MainLayout`.

| Path | Page Component | Description |
|------|---------------|-------------|
| `/login` | `LoginPage` | Public login page |
| `/` | `Dashboard` | Home with stats & charts |
| `/categories` | `CategoriesPage` | Category CRUD |
| `/subcategories` | `SubCategoriesPage` | Sub-category CRUD |
| `/products` | `ProductsPage` | Product CRUD + CSV export |
| `/customers` | `CustomersPage` | Customer CRUD |
| `/suppliers` | `SuppliersPage` | Supplier CRUD |
| `/purchases` | `PurchasesPage` | Purchase invoice list |
| `/purchases/new` | `NewPurchasePage` | Multi-item purchase form |
| `/billing` | `BillingPage` | POS / cash register |
| `/sales` | `SalesPage` | Sales history list |
| `/sales/:id` | `SaleDetailPage` | Sale detail + print invoice |
| `/stock` | `StockPage` | Stock levels & movements |
| `/vehicles` | `VehicleManagementPage` | Fleet + expenses |
| `/staff` | `StaffManagementPage` | Staff + salary payments |
| `/reports` | `ReportsPage` | All reports |
| `/settings` | `SettingsPage` | Company profile |

---

### Service Layer (src/services/)

Each service wraps Axios calls and is consumed via `@tanstack/react-query`:

```
api.ts              ← Axios instance (baseURL, auth header, token refresh interceptor)
                       + Mock Adapter (in-memory DB for offline/dev mode)
auth.service.ts     ← login(), refresh(), me(), logout()
category.service.ts ← list(), create(), update(), delete(), listSub()
product.service.ts  ← list(), create(), update(), delete(), uploadImage(), exportCsv()
customer.service.ts ← list(), create(), update(), delete()
supplier.service.ts ← list(), create(), update(), delete()
purchase.service.ts ← list(), get(), create(), update(), delete()
sale.service.ts     ← list(), get(), create(), cancel()
stock.service.ts    ← listWithMovements(), adjust()
dashboard.service.ts← getStats(), getSalesChart()
report.service.ts   ← getSales(), getPurchases(), getStock(), getGST(), getPnL()
settings.service.ts ← get(), update(), uploadLogo()
staff.service.ts    ← list(), create(), update(), delete(), payroll endpoints
vehicle.service.ts  ← list(), create(), update(), delete(), expenses endpoints
mockStore.ts        ← Stateful in-memory data store for development without backend
```

---

### State Management Pattern

```
Component
  └── useQuery({ queryKey, queryFn })        ← Read (cached, auto-refetch)
  └── useMutation({ mutationFn, onSuccess }) ← Write
        └── onSuccess: qc.invalidateQueries() ← Refetch affected queries
```

---

## 8. Data Flow & Application Lifecycle

### App Boot Sequence

```
1. main.tsx
   → Wraps app in: <QueryClientProvider> <BrowserRouter> <AuthProvider> <ThemeProvider>

2. AuthContext.tsx
   → Reads access_token from localStorage
   → Calls GET /auth/me to verify session
   → Sets user state (or clears if token expired)

3. AppRoutes.tsx
   → RequireAuth checks isAuthenticated
   → If not authenticated → redirect to /login
   → If authenticated → render MainLayout + nested route
```

### Request Lifecycle (Data Fetching)

```
Page mounts
  → useQuery fires queryFn (service function)
  → Axios request with Authorization: Bearer <token>
  → If 401 → interceptor auto-calls POST /auth/refresh
     → Retry original request with new token
     → If refresh fails → logout() → redirect /login
  → Response cached by React Query (keyed by queryKey)
  → Component re-renders with data
```

### Mock Mode (Development)

When the backend is unavailable, the Axios `mockAdapter` in `api.ts` intercepts all requests and returns data from `mockStore.ts` — a stateful in-memory store. This allows full frontend development without a running backend.

---

## 9. Authentication & Authorization

### JWT Flow

```
Login  →  POST /auth/login
           ↓
       { access_token (30 min), refresh_token (7 days) }
           ↓
       Stored in localStorage
           ↓
       All requests: Authorization: Bearer <access_token>
           ↓
       On 401 → POST /auth/refresh → new access_token
           ↓
       Refresh fails → Clear tokens → Redirect /login
```

### Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access to all modules including Settings, Staff, Reports |
| `staff` | Access to Billing/POS, Products, Customers, Stock (limited) |

---

## 10. Key Business Flows

### Flow 1: Creating a Sale (POS Billing)

```
BillingPage
  1. Scan barcode or search product → add to cart
  2. Apply item-level discount or cart-level discount
  3. Select customer (optional — walk-in allowed)
  4. Choose payment method: cash / card / UPI / split
  5. Click "Complete Sale"
     → POST /sales
        → Creates Sale + SaleItem records
        → Decrements product.current_stock for each item
        → Creates StockMovement (type: 'sale') for each item
        → Returns sale with invoice_number
  6. Print invoice (browser print dialog)
```

### Flow 2: Creating a Purchase

```
NewPurchasePage
  1. Select supplier (optional)
  2. Add multiple items: product + qty + price + GST + discount
  3. Review totals (subtotal, tax, grand_total, paid, due)
  4. Click "Save Purchase"
     → POST /purchases
        → Creates Purchase + PurchaseItem records
        → Increments product.current_stock for each item
        → Creates StockMovement (type: 'purchase') for each item
```

### Flow 3: Stock Adjustment

```
StockPage
  1. Find product in stock list
  2. Click "Adjust"
  3. Enter quantity and type (stock_in / stock_out / adjustment)
  4. Enter notes/reason
     → POST /stock/adjust
        → Updates product.current_stock
        → Creates StockMovement record
```

### Flow 4: Cancelling a Sale

```
SaleDetailPage / SalesPage
  1. Find sale in history
  2. Click "Cancel" → Confirm dialog
     → PUT /sales/{id}/cancel
        → Updates sale.status = 'cancelled'
        → Restores product.current_stock for each item
        → Creates StockMovement (type: 'return_in') for each item
```

### Flow 5: Reports Generation

```
ReportsPage
  1. Select report type (Sales / Purchase / Stock / GST / P&L)
  2. Set date range filter
  3. Click "Generate"
     → GET /reports/{type}?from_date=&to_date=
        → Backend aggregates from DB
        → Returns summary + line items
  4. Optional: Export to PDF or Excel
```

---

## 11. Environment Variables

### Backend (backend/.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/billing_db` | PostgreSQL connection string |
| `SECRET_KEY` | *(required)* | JWT signing secret — change in production |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token TTL |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token TTL |
| `DEBUG` | `false` | Debug mode |
| `UPLOAD_DIR` | `uploads` | Directory for file uploads (images, logos) |

### Frontend (frontend/.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api/v1` | Backend API base URL (Vite proxies `/api` to `:8000` in dev) |

---

## 12. TypeScript Types Reference

All interfaces are defined in `frontend/src/types/index.ts`.

| Interface | Key Fields |
|-----------|-----------|
| `User` | `id, name, email, role ('admin'\|'staff'), is_active` |
| `TokenResponse` | `access_token, refresh_token, user` |
| `Category` | `id, name, description, is_active` |
| `SubCategory` | `id, name, category_id, category_name, is_active` |
| `Product` | `id, name, category_id, sku, barcode, purchase_price, selling_price, gst_percent, unit, current_stock, minimum_stock` |
| `Customer` | `id, name, mobile, email, gst_number, address, total_sales, total_due` |
| `Supplier` | `id, name, mobile, email, gst_number, address` |
| `Purchase` | `id, invoice_number, supplier_id, grand_total, status ('pending'\|'received'\|'cancelled'), items[]` |
| `PurchaseItem` | `product_id, quantity, unit_price, gst_percent, gst_amount, total_amount` |
| `Sale` | `id, invoice_number, customer_id, grand_total, payment_method, status ('completed'\|'cancelled'\|'refunded'), items[]` |
| `SaleItem` | `product_id, quantity, unit_price, gst_percent, gst_amount, total_amount` |
| `StockMovement` | `product_id, movement_type, quantity, stock_before, stock_after, reference_id` |
| `Settings` | `company_name, gst_number, logo_url, invoice_prefix, currency, currency_symbol, tax_inclusive` |
| `DashboardStats` | `today_sales, monthly_sales, total_products, total_customers, low_stock_count` |
| `Vehicle` | `id, vehicle_no, model, type, driver_id, is_active` |
| `VehicleExpense` | `vehicle_id, expense_type ('fuel'\|'maintenance'\|'insurance'\|'permit'\|'other'), amount, liters` |
| `Staff` | `id, name, mobile, role, salary_type ('daily'\|'monthly'), base_salary` |
| `SalaryPayment` | `staff_id, payment_type, amount, payment_period, payment_date` |
| `PaginatedResponse<T>` | `total, items: T[]` |

---

## Appendix: Default Credentials

```
Email:    admin@example.com
Password: admin123
```

> **Change the default password immediately after first login in production.**

---

*Documentation generated for MJ Agency Oil Selling & Billing Software — v1.0*
