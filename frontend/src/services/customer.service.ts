import api from './api'
import { Customer, PaginatedResponse } from '@/types'

export const customerService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Customer>>('/customers', { params }).then((r) => r.data),
  get: (id: number) => api.get<Customer>(`/customers/${id}`).then((r) => r.data),
  create: (data: Partial<Customer>) => api.post<Customer>('/customers', data).then((r) => r.data),
  update: (id: number, data: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/customers/${id}`),
}
