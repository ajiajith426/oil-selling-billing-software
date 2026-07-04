import api from './api'
import { Product, PaginatedResponse } from '@/types'

export const productService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Product>>('/products', { params }).then((r) => r.data),
  get: (id: number) => api.get<Product>(`/products/${id}`).then((r) => r.data),
  getByBarcode: (barcode: string) => api.get<Product>(`/products/barcode/${barcode}`).then((r) => r.data),
  create: (data: Partial<Product>) => api.post<Product>('/products', data).then((r) => r.data),
  update: (id: number, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/products/${id}`),
  lowStock: () => api.get<Product[]>('/products/low-stock').then((r) => r.data),
  exportCsv: () =>
    api.get('/products/export/csv', { responseType: 'blob' }).then((r) => {
      const url = URL.createObjectURL(r.data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'products.csv'
      a.click()
      URL.revokeObjectURL(url)
    }),
  uploadImage: (id: number, file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post<{ image_url: string }>(`/products/${id}/upload-image`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
}
