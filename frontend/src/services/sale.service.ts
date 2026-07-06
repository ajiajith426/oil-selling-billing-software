import { Sale, PaginatedResponse } from '@/types'
import { mockDB, getPaginatedResponse } from './mockStore'

export const saleService = {
  list: async (params?: Record<string, unknown>): Promise<PaginatedResponse<Sale>> => {
    await new Promise((r) => setTimeout(r, 100));
    return getPaginatedResponse(mockDB.getSales(), params);
  },
  get: async (id: number): Promise<Sale> => {
    await new Promise((r) => setTimeout(r, 100));
    const sale = mockDB.getSales().find(s => s.id === id);
    if (!sale) throw new Error('Sale not found');
    return sale;
  },
  create: async (data: unknown): Promise<Sale> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.createSale(data);
  },
  cancel: async (id: number): Promise<Sale> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.cancelSale(id);
  },
}
