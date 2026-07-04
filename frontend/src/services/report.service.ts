import api from './api'

export const reportService = {
  sales: (from_date: string, to_date: string) =>
    api.get('/reports/sales', { params: { from_date, to_date } }).then((r) => r.data),
  purchases: (from_date: string, to_date: string) =>
    api.get('/reports/purchases', { params: { from_date, to_date } }).then((r) => r.data),
  stock: () => api.get('/reports/stock').then((r) => r.data),
  gst: (from_date: string, to_date: string) =>
    api.get('/reports/gst', { params: { from_date, to_date } }).then((r) => r.data),
  profitLoss: (from_date: string, to_date: string) =>
    api.get('/reports/profit-loss', { params: { from_date, to_date } }).then((r) => r.data),
}
