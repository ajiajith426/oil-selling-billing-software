import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import MainLayout from '@/layouts/MainLayout'
import LoginPage from '@/pages/auth/LoginPage'
import Dashboard from '@/pages/dashboard/Dashboard'
import CategoriesPage from '@/pages/categories/CategoriesPage'
import SubCategoriesPage from '@/pages/categories/SubCategoriesPage'
import ProductsPage from '@/pages/products/ProductsPage'
import CustomersPage from '@/pages/customers/CustomersPage'
import SuppliersPage from '@/pages/suppliers/SuppliersPage'
import PurchasesPage from '@/pages/purchases/PurchasesPage'
import NewPurchasePage from '@/pages/purchases/NewPurchasePage'
import BillingPage from '@/pages/billing/BillingPage'
import SalesPage from '@/pages/billing/SalesPage'
import StockPage from '@/pages/stock/StockPage'
import ReportsPage from '@/pages/reports/ReportsPage'
import SettingsPage from '@/pages/settings/SettingsPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading…</div>
  // if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="subcategories" element={<SubCategoriesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="purchases/new" element={<NewPurchasePage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="stock" element={<StockPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
