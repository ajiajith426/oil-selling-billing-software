import { Staff, SalaryPayment, PaginatedResponse } from '@/types'
import { mockDB, getPaginatedResponse } from './mockStore'

export const staffService = {
  list: async (params?: Record<string, unknown>): Promise<PaginatedResponse<Staff>> => {
    await new Promise((r) => setTimeout(r, 100));
    return getPaginatedResponse(mockDB.getStaff(), params);
  },
  get: async (id: number): Promise<Staff> => {
    await new Promise((r) => setTimeout(r, 100));
    const item = mockDB.getStaff().find(s => s.id === id);
    if (!item) throw new Error('Staff not found');
    return item;
  },
  create: async (data: Partial<Staff>): Promise<Staff> => {
    await new Promise((r) => setTimeout(r, 100));
    return mockDB.createStaff(data);
  },
  update: async (id: number, data: Partial<Staff>): Promise<Staff> => {
    await new Promise((r) => setTimeout(r, 100));
    return mockDB.updateStaff(id, data);
  },
  delete: async (id: number): Promise<any> => {
    await new Promise((r) => setTimeout(r, 100));
    return mockDB.deleteStaff(id);
  },

  // Salary Payments / Payouts
  listSalaries: async (params?: Record<string, unknown>): Promise<PaginatedResponse<SalaryPayment>> => {
    await new Promise((r) => setTimeout(r, 100));
    return getPaginatedResponse(mockDB.getSalaries(), params);
  },
  createSalary: async (data: Partial<SalaryPayment>): Promise<SalaryPayment> => {
    await new Promise((r) => setTimeout(r, 100));
    return mockDB.createSalary(data);
  },
  updateSalary: async (id: number, data: Partial<SalaryPayment>): Promise<SalaryPayment> => {
    await new Promise((r) => setTimeout(r, 100));
    return mockDB.updateSalary(id, data);
  },
  deleteSalary: async (id: number): Promise<any> => {
    await new Promise((r) => setTimeout(r, 100));
    return mockDB.deleteSalary(id);
  },
}
