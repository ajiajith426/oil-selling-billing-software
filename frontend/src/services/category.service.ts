import { Category, SubCategory, PaginatedResponse } from '@/types'
import { mockDB, getPaginatedResponse } from './mockStore'

export const categoryService = {
  list: async (params?: Record<string, unknown>): Promise<PaginatedResponse<Category>> => {
    await new Promise((r) => setTimeout(r, 100));
    return getPaginatedResponse(mockDB.getCategories(), params);
  },
  create: async (data: Partial<Category>): Promise<Category> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.createCategory(data);
  },
  update: async (id: number, data: Partial<Category>): Promise<Category> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.updateCategory(id, data);
  },
  delete: async (id: number): Promise<void> => {
    await new Promise((r) => setTimeout(r, 150));
    mockDB.deleteCategory(id);
  },

  listSub: async (params?: Record<string, unknown>): Promise<PaginatedResponse<SubCategory>> => {
    await new Promise((r) => setTimeout(r, 100));
    return getPaginatedResponse(mockDB.getSubCategories(), params);
  },
  createSub: async (data: Partial<SubCategory>): Promise<SubCategory> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.createSubCategory(data);
  },
  updateSub: async (id: number, data: Partial<SubCategory>): Promise<SubCategory> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.updateSubCategory(id, data);
  },
  deleteSub: async (id: number): Promise<void> => {
    await new Promise((r) => setTimeout(r, 150));
    mockDB.deleteSubCategory(id);
  },
}
