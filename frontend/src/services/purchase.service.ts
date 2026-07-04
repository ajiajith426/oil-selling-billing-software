import api from './api'
import { Purchase, PaginatedResponse } from '@/types'

export const purchaseService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Purchase>>('/purchases', { params }).then((r) => r.data),
  get: (id: number) => api.get<Purchase>(`/purchases/${id}`).then((r) => r.data),
  create: (data: unknown) => api.post<Purchase>('/purchases', data).then((r) => r.data),
}
