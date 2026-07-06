import { Customer, PaginatedResponse } from '@/types'
import { mockDB, getPaginatedResponse } from './mockStore'

export const customerService = {
  list: async (params?: Record<string, unknown>): Promise<PaginatedResponse<Customer>> => {
    await new Promise((r) => setTimeout(r, 100));
    return getPaginatedResponse(mockDB.getCustomers(), params);
  },
  get: async (id: number): Promise<Customer> => {
    await new Promise((r) => setTimeout(r, 100));
    const cust = mockDB.getCustomers().find(c => c.id === id);
    if (!cust) throw new Error('Customer not found');
    return cust;
  },
  create: async (data: Partial<Customer>): Promise<Customer> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.createCustomer(data);
  },
  update: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.updateCustomer(id, data);
  },
  delete: async (id: number): Promise<void> => {
    await new Promise((r) => setTimeout(r, 150));
    mockDB.deleteCustomer(id);
  },
}
