import api from './api'
import { Sale, PaginatedResponse } from '@/types'

export const saleService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Sale>>('/sales', { params }).then((r) => r.data),
  get: (id: number) => api.get<Sale>(`/sales/${id}`).then((r) => r.data),
  create: (data: unknown) => api.post<Sale>('/sales', data).then((r) => r.data),
  cancel: (id: number) => api.post<Sale>(`/sales/${id}/cancel`).then((r) => r.data),
}
