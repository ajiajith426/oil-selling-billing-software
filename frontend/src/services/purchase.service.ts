import { Purchase, PaginatedResponse } from '@/types'
import { mockDB, getPaginatedResponse } from './mockStore'

export const purchaseService = {
  list: async (params?: Record<string, unknown>): Promise<PaginatedResponse<Purchase>> => {
    await new Promise((r) => setTimeout(r, 100));
    return getPaginatedResponse(mockDB.getPurchases(), params);
  },
  get: async (id: number): Promise<Purchase> => {
    await new Promise((r) => setTimeout(r, 100));
    const purchase = mockDB.getPurchases().find(p => p.id === id);
    if (!purchase) throw new Error('Purchase record not found');
    return purchase;
  },
  create: async (data: unknown): Promise<Purchase> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.createPurchase(data);
  },
}
