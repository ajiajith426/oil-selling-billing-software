// ── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'staff'
  is_active: boolean
  created_at: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

// ── Category / SubCategory ────────────────────────────────────────────────
export interface Category {
  id: number
  name: string
  description?: string
  is_active: boolean
  created_at: string
}

export interface SubCategory {
  id: number
  name: string
  category_id: number
  category_name?: string
  description?: string
  is_active: boolean
  created_at: string
}

// ── Product ───────────────────────────────────────────────────────────────
export interface Product {
  id: number
  name: string
  category_id?: number
  subcategory_id?: number
  category_name?: string
  subcategory_name?: string
  sku?: string
  barcode?: string
  purchase_price: number
  selling_price: number
  gst_percent: number
  unit: string
  current_stock: number
  minimum_stock: number
  brand?: string
  description?: string
  image_url?: string
  is_active: boolean
  created_at: string
}

// ── Customer ──────────────────────────────────────────────────────────────
export interface Customer {
  id: number
  name: string
  mobile?: string
  email?: string
  gst_number?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  created_at: string
}

// ── Supplier ──────────────────────────────────────────────────────────────
export interface Supplier {
  id: number
  name: string
  mobile?: string
  email?: string
  gst_number?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  created_at: string
}

// ── Purchase ──────────────────────────────────────────────────────────────
export interface PurchaseItem {
  id: number
  product_id: number
  product_name?: string
  quantity: number
  unit_price: number
  gst_percent: number
  gst_amount: number
  discount_percent: number
  discount_amount: number
  total_amount: number
}

export interface Purchase {
  id: number
  invoice_number: string
  supplier_id?: number
  supplier_name?: string
  purchase_date: string
  subtotal: number
  discount_amount: number
  tax_amount: number
  grand_total: number
  paid_amount: number
  due_amount: number
  status: 'pending' | 'received' | 'cancelled'
  notes?: string
  items: PurchaseItem[]
  created_at: string
}

// ── Sale ──────────────────────────────────────────────────────────────────
export interface SaleItem {
  id: number
  product_id: number
  product_name?: string
  quantity: number
  unit_price: number
  gst_percent: number
  gst_amount: number
  discount_percent: number
  discount_amount: number
  total_amount: number
}

export interface Sale {
  id: number
  invoice_number: string
  customer_id?: number
  customer_name?: string
  sale_date: string
  subtotal: number
  discount_amount: number
  tax_amount: number
  grand_total: number
  paid_amount: number
  change_amount: number
  payment_method: 'cash' | 'card' | 'upi' | 'split'
  cash_amount: number
  card_amount: number
  upi_amount: number
  status: 'completed' | 'cancelled' | 'refunded'
  notes?: string
  items: SaleItem[]
  created_at: string
}

// ── Stock ─────────────────────────────────────────────────────────────────
export interface StockMovement {
  id: number
  product_id: number
  product_name?: string
  movement_type: 'stock_in' | 'stock_out' | 'adjustment' | 'purchase' | 'sale' | 'return_in' | 'return_out'
  quantity: number
  stock_before: number
  stock_after: number
  reference_id?: number
  reference_type?: string
  notes?: string
  created_at: string
}

// ── Settings ──────────────────────────────────────────────────────────────
export interface Settings {
  id: number
  company_name: string
  gst_number?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  logo_url?: string
  invoice_prefix: string
  purchase_prefix: string
  currency: string
  currency_symbol: string
  tax_inclusive: string
  website?: string
}

// ── Pagination ────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  total: number
  items: T[]
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export interface DashboardStats {
  today_sales: number
  monthly_sales: number
  total_products: number
  total_categories: number
  total_customers: number
  total_suppliers: number
  low_stock_count: number
}
