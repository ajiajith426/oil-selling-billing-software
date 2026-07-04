import api from './api'
import { Category, SubCategory, PaginatedResponse } from '@/types'

export const categoryService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Category>>('/categories', { params }).then((r) => r.data),
  create: (data: Partial<Category>) => api.post<Category>('/categories', data).then((r) => r.data),
  update: (id: number, data: Partial<Category>) => api.put<Category>(`/categories/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/categories/${id}`),

  listSub: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<SubCategory>>('/subcategories', { params }).then((r) => r.data),
  createSub: (data: Partial<SubCategory>) => api.post<SubCategory>('/subcategories', data).then((r) => r.data),
  updateSub: (id: number, data: Partial<SubCategory>) =>
    api.put<SubCategory>(`/subcategories/${id}`, data).then((r) => r.data),
  deleteSub: (id: number) => api.delete(`/subcategories/${id}`),
}
