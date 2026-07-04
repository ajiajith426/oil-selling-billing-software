import api from './api'
import { DashboardStats } from '@/types'

export const dashboardService = {
  stats: () => api.get<DashboardStats>('/dashboard/stats').then((r) => r.data),
  recentBills: (limit = 10) => api.get('/dashboard/recent-bills', { params: { limit } }).then((r) => r.data),
  topProducts: (limit = 10) => api.get('/dashboard/top-products', { params: { limit } }).then((r) => r.data),
  salesGraph: (days = 30) => api.get('/dashboard/sales-graph', { params: { days } }).then((r) => r.data),
  monthlyRevenue: (year?: number) =>
    api.get('/dashboard/monthly-revenue', { params: year ? { year } : {} }).then((r) => r.data),
}
