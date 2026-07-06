import { Vehicle, VehicleExpense, PaginatedResponse } from '@/types'
import { mockDB, getPaginatedResponse } from './mockStore'

export const vehicleService = {
  list: async (params?: Record<string, unknown>): Promise<PaginatedResponse<Vehicle>> => {
    await new Promise((r) => setTimeout(r, 100));
    return getPaginatedResponse(mockDB.getVehicles(), params);
  },
  get: async (id: number): Promise<Vehicle> => {
    await new Promise((r) => setTimeout(r, 100));
    const item = mockDB.getVehicles().find(v => v.id === id);
    if (!item) throw new Error('Vehicle not found');
    return item;
  },
  create: async (data: Partial<Vehicle>): Promise<Vehicle> => {
    await new Promise((r) => setTimeout(r, 100));
    return mockDB.createVehicle(data);
  },
  update: async (id: number, data: Partial<Vehicle>): Promise<Vehicle> => {
    await new Promise((r) => setTimeout(r, 100));
    return mockDB.updateVehicle(id, data);
  },
  delete: async (id: number): Promise<any> => {
    await new Promise((r) => setTimeout(r, 100));
    return mockDB.deleteVehicle(id);
  },

  // Vehicle Expenses
  listExpenses: async (params?: Record<string, unknown>): Promise<PaginatedResponse<VehicleExpense>> => {
    await new Promise((r) => setTimeout(r, 100));
    return getPaginatedResponse(mockDB.getVehicleExpenses(), params);
  },
  createExpense: async (data: Partial<VehicleExpense>): Promise<VehicleExpense> => {
    await new Promise((r) => setTimeout(r, 100));
    return mockDB.createVehicleExpense(data);
  },
  updateExpense: async (id: number, data: Partial<VehicleExpense>): Promise<VehicleExpense> => {
    await new Promise((r) => setTimeout(r, 100));
    return mockDB.updateVehicleExpense(id, data);
  },
  deleteExpense: async (id: number): Promise<any> => {
    await new Promise((r) => setTimeout(r, 100));
    return mockDB.deleteVehicleExpense(id);
  },
}
