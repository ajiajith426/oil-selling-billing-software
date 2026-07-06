import { mockDB } from './mockStore'

export const reportService = {
  sales: async (from_date: string, to_date: string): Promise<any> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.getReportsSales(from_date, to_date);
  },
  purchases: async (from_date: string, to_date: string): Promise<any> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.getReportsPurchases(from_date, to_date);
  },
  stock: async (): Promise<any> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.getReportsStock();
  },
  gst: async (from_date: string, to_date: string): Promise<any> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.getReportsGst(from_date, to_date);
  },
  profitLoss: async (from_date: string, to_date: string): Promise<any> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.getReportsProfitLoss(from_date, to_date);
  },
}
