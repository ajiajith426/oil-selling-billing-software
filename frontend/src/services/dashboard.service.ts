import { DashboardStats, Sale } from '@/types'
import { mockDB } from './mockStore'

export const dashboardService = {
  stats: async (): Promise<DashboardStats> => {
    await new Promise((r) => setTimeout(r, 100));
    return mockDB.getDashboardStats();
  },
  recentBills: async (limit = 10): Promise<any[]> => {
    await new Promise((r) => setTimeout(r, 100));
    return mockDB.getSales().slice(0, limit);
  },
  topProducts: async (limit = 10): Promise<any[]> => {
    await new Promise((r) => setTimeout(r, 100));
    return mockDB.getTopProducts(limit);
  },
  salesGraph: async (days = 30): Promise<any[]> => {
    await new Promise((r) => setTimeout(r, 100));
    return mockDB.getSalesGraph(days);
  },
  monthlyRevenue: async (year?: number): Promise<any[]> => {
    await new Promise((r) => setTimeout(r, 100));
    return mockDB.getMonthlyRevenue(year);
  },
}
