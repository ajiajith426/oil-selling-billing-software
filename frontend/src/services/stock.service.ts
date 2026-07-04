import api from './api'
import { StockMovement, PaginatedResponse } from '@/types'

export const stockService = {
  movements: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<StockMovement>>('/stock/movements', { params }).then((r) => r.data),
  adjust: (data: { product_id: number; movement_type: string; quantity: number; notes?: string }) =>
    api.post<StockMovement>('/stock/adjust', data).then((r) => r.data),
}
