import { Supplier, PaginatedResponse } from '@/types'
import { mockDB, getPaginatedResponse } from './mockStore'

export const supplierService = {
  list: async (params?: Record<string, unknown>): Promise<PaginatedResponse<Supplier>> => {
    await new Promise((r) => setTimeout(r, 100));
    return getPaginatedResponse(mockDB.getSuppliers(), params);
  },
  get: async (id: number): Promise<Supplier> => {
    await new Promise((r) => setTimeout(r, 100));
    const supp = mockDB.getSuppliers().find(s => s.id === id);
    if (!supp) throw new Error('Supplier not found');
    return supp;
  },
  create: async (data: Partial<Supplier>): Promise<Supplier> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.createSupplier(data);
  },
  update: async (id: number, data: Partial<Supplier>): Promise<Supplier> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.updateSupplier(id, data);
  },
  delete: async (id: number): Promise<void> => {
    await new Promise((r) => setTimeout(r, 150));
    mockDB.deleteSupplier(id);
  },
}
