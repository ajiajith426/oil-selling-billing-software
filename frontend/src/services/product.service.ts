import { Product, PaginatedResponse } from '@/types'
import { mockDB, getPaginatedResponse } from './mockStore'

export const productService = {
  list: async (params?: Record<string, unknown>): Promise<PaginatedResponse<Product>> => {
    await new Promise((r) => setTimeout(r, 100));
    return getPaginatedResponse(mockDB.getProducts(), params);
  },
  get: async (id: number): Promise<Product> => {
    await new Promise((r) => setTimeout(r, 100));
    const prod = mockDB.getProducts().find(p => p.id === id);
    if (!prod) throw new Error('Product not found');
    return prod;
  },
  getByBarcode: async (barcode: string): Promise<Product> => {
    await new Promise((r) => setTimeout(r, 100));
    const prod = mockDB.getProducts().find(p => p.barcode === barcode);
    if (!prod) throw new Error('Product with this barcode not found');
    return prod;
  },
  create: async (data: Partial<Product>): Promise<Product> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.createProduct(data);
  },
  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockDB.updateProduct(id, data);
  },
  delete: async (id: number): Promise<void> => {
    await new Promise((r) => setTimeout(r, 150));
    mockDB.deleteProduct(id);
  },
  lowStock: async (): Promise<Product[]> => {
    await new Promise((r) => setTimeout(r, 100));
    return mockDB.getProducts().filter(p => p.current_stock <= p.minimum_stock);
  },
  exportCsv: async (): Promise<void> => {
    const csvContent = 'ID,Name,SKU,Barcode,Purchase Price,Selling Price,GST %,Unit,Stock,Min Stock,Brand\n' +
      mockDB.getProducts().map(p => 
        `"${p.id}","${p.name}","${p.sku || ''}","${p.barcode || ''}",${p.purchase_price},${p.selling_price},${p.gst_percent},"${p.unit}",${p.current_stock},${p.minimum_stock},"${p.brand || ''}"`
      ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
  uploadImage: async (id: number, file: File): Promise<{ image_url: string }> => {
    await new Promise((r) => setTimeout(r, 200));
    return { image_url: 'https://images.unsplash.com/photo-1598209279122-8541218a0387?auto=format&fit=crop&q=80&w=400' };
  },
}
