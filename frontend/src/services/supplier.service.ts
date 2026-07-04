import api from './api'
import { Supplier, PaginatedResponse } from '@/types'

export const supplierService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Supplier>>('/suppliers', { params }).then((r) => r.data),
  get: (id: number) => api.get<Supplier>(`/suppliers/${id}`).then((r) => r.data),
  create: (data: Partial<Supplier>) => api.post<Supplier>('/suppliers', data).then((r) => r.data),
  update: (id: number, data: Partial<Supplier>) => api.put<Supplier>(`/suppliers/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/suppliers/${id}`),
}
