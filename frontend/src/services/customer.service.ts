import { Customer, PaginatedResponse } from '@/types'
import { mockDB, getPaginatedResponse } from './mockStore'

export const customerService = {
  list: async (params?: Record<string, unknown>): Promise<PaginatedResponse<Customer>> => {
    await new Promise((r) => setTimeout(r, 100));
    const customers = mockDB.getCustomers();
    const sales = mockDB.getSales();
    const items = customers.map(c => {
      let total_sales = 0;
      let total_paid = 0;
      let total_due = 0;
      sales.forEach(s => {
        if (s.customer_id === c.id && s.status !== 'cancelled') {
          total_sales += s.grand_total;
          total_paid += s.paid_amount;
          const due = s.grand_total - s.paid_amount;
          total_due += due > 0 ? due : 0;
        }
      });
      return { ...c, total_sales, total_paid, total_due };
    });
    return getPaginatedResponse(items, params);
  },
  get: async (id: number): Promise<Customer> => {
    await new Promise((r) => setTimeout(r, 100));
    const cust = mockDB.getCustomers().find(c => c.id === id);
    if (!cust) throw new Error('Customer not found');
    const sales = mockDB.getSales();
    let total_sales = 0;
    let total_paid = 0;
    let total_due = 0;
    sales.forEach(s => {
      if (s.customer_id === cust.id && s.status !== 'cancelled') {
        total_sales += s.grand_total;
        total_paid += s.paid_amount;
        const due = s.grand_total - s.paid_amount;
        total_due += due > 0 ? due : 0;
      }
    });
    return { ...cust, total_sales, total_paid, total_due };
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
