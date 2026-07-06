import { StockMovement, PaginatedResponse } from '@/types'
import { mockDB, getPaginatedResponse } from './mockStore'

export const stockService = {
  movements: async (params?: Record<string, unknown>): Promise<PaginatedResponse<StockMovement>> => {
    await new Promise((r) => setTimeout(r, 100));
    return getPaginatedResponse(mockDB.getStockMovements(), params);
  },
  adjust: async (data: { product_id: number; movement_type: string; quantity: number; notes?: string }): Promise<StockMovement> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.adjustStock(data);
  },
}
