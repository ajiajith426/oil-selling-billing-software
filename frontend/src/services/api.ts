import axios, { AxiosAdapter } from 'axios'
import toast from 'react-hot-toast'
import { mockDB, getPaginatedResponse } from './mockStore'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

// ── Custom Mock Adapter: intercepts all API calls and returns stateful static data ──
const mockAdapter: AxiosAdapter = async (config) => {
  const method = (config.method || 'get').toLowerCase();
  
  // Extract and clean url path
  let url = config.url || '';
  if (config.baseURL && url.startsWith(config.baseURL)) {
    url = url.replace(config.baseURL, '');
  }
  if (url.startsWith('/')) {
    url = url.substring(1);
  }

  // Parse query params out of URL if any
  const urlObj = new URL(url, 'http://localhost');
  const path = urlObj.pathname;
  const params = { ...config.params, ...Object.fromEntries(urlObj.searchParams.entries()) };
  
  let body: any = {};
  if (config.data) {
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {
      body = config.data;
    }
  }

  console.log(`[MOCK API] ${method.toUpperCase()} /${path}`, { params, body });

  let responseData: any = null;
  let status = 200;

  try {
    // ── AUTH ──
    if (path === 'auth/login' && method === 'post') {
      responseData = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        token_type: 'bearer',
        user: { id: 1, name: 'MJ Admin', email: body.email || 'admin@mjagency.com', role: 'admin', is_active: true, created_at: new Date().toISOString() }
      };
      localStorage.setItem('access_token', 'mock-access-token');
      localStorage.setItem('refresh_token', 'mock-refresh-token');
      localStorage.setItem('user', JSON.stringify(responseData.user));
    }
    else if (path === 'auth/refresh' && method === 'post') {
      responseData = {
        access_token: 'mock-new-access-token',
        refresh_token: 'mock-new-refresh-token',
      };
      localStorage.setItem('access_token', 'mock-new-access-token');
    }
    else if (path === 'auth/me' && method === 'get') {
      const storedUser = localStorage.getItem('user');
      responseData = storedUser ? JSON.parse(storedUser) : { id: 1, name: 'MJ Admin', email: 'admin@mjagency.com', role: 'admin', is_active: true, created_at: new Date().toISOString() };
    }
    else if (path === 'auth/register' && method === 'post') {
      responseData = { id: 99, name: body.name, email: body.email, role: body.role || 'staff', is_active: true, created_at: new Date().toISOString() };
    }

    // ── DASHBOARD ──
    else if (path === 'dashboard/stats' && method === 'get') {
      responseData = mockDB.getDashboardStats();
    }
    else if (path === 'dashboard/recent-bills' && method === 'get') {
      const limit = Number(params.limit || 10);
      responseData = mockDB.getSales().slice(0, limit);
    }
    else if (path === 'dashboard/top-products' && method === 'get') {
      const limit = Number(params.limit || 10);
      responseData = mockDB.getTopProducts(limit);
    }
    else if (path === 'dashboard/sales-graph' && method === 'get') {
      const days = Number(params.days || 30);
      responseData = mockDB.getSalesGraph(days);
    }
    else if (path === 'dashboard/monthly-revenue' && method === 'get') {
      const year = params.year ? Number(params.year) : undefined;
      responseData = mockDB.getMonthlyRevenue(year);
    }

    // ── CATEGORIES ──
    else if (path === 'categories' && method === 'get') {
      responseData = getPaginatedResponse(mockDB.getCategories(), params);
    }
    else if (path === 'categories' && method === 'post') {
      responseData = mockDB.createCategory(body);
      status = 201;
    }
    else if (path.startsWith('categories/') && method === 'put') {
      const id = Number(path.split('/')[1]);
      responseData = mockDB.updateCategory(id, body);
    }
    else if (path.startsWith('categories/') && method === 'delete') {
      const id = Number(path.split('/')[1]);
      responseData = mockDB.deleteCategory(id);
    }

    // ── SUB-CATEGORIES ──
    else if (path === 'subcategories' && method === 'get') {
      responseData = getPaginatedResponse(mockDB.getSubCategories(), params);
    }
    else if (path === 'subcategories' && method === 'post') {
      responseData = mockDB.createSubCategory(body);
      status = 201;
    }
    else if (path.startsWith('subcategories/') && method === 'put') {
      const id = Number(path.split('/')[1]);
      responseData = mockDB.updateSubCategory(id, body);
    }
    else if (path.startsWith('subcategories/') && method === 'delete') {
      const id = Number(path.split('/')[1]);
      responseData = mockDB.deleteSubCategory(id);
    }

    // ── PRODUCTS ──
    else if (path === 'products' && method === 'get') {
      responseData = getPaginatedResponse(mockDB.getProducts(), params);
    }
    else if (path === 'products/low-stock' && method === 'get') {
      responseData = mockDB.getProducts().filter(p => p.current_stock <= p.minimum_stock);
    }
    else if (path.startsWith('products/barcode/') && method === 'get') {
      const barcode = path.split('/')[2];
      const prod = mockDB.getProducts().find(p => p.barcode === barcode);
      if (!prod) {
        status = 404;
        responseData = { detail: 'Product with this barcode not found' };
      } else {
        responseData = prod;
      }
    }
    else if (path === 'products/export/csv' && method === 'get') {
      const csvContent = 'ID,Name,SKU,Barcode,Purchase Price,Selling Price,GST %,Unit,Stock,Min Stock,Brand\n' +
        mockDB.getProducts().map(p => 
          `"${p.id}","${p.name}","${p.sku || ''}","${p.barcode || ''}",${p.purchase_price},${p.selling_price},${p.gst_percent},"${p.unit}",${p.current_stock},${p.minimum_stock},"${p.brand || ''}"`
        ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      responseData = blob;
    }
    else if (path.startsWith('products/') && path.endsWith('/upload-image') && method === 'post') {
      responseData = { image_url: 'https://images.unsplash.com/photo-1598209279122-8541218a0387?auto=format&fit=crop&q=80&w=400' };
    }
    else if (path.startsWith('products/') && method === 'get') {
      const id = Number(path.split('/')[1]);
      const prod = mockDB.getProducts().find(p => p.id === id);
      if (!prod) {
        status = 404;
        responseData = { detail: 'Product not found' };
      } else {
        responseData = prod;
      }
    }
    else if (path === 'products' && method === 'post') {
      responseData = mockDB.createProduct(body);
      status = 201;
    }
    else if (path.startsWith('products/') && method === 'put') {
      const id = Number(path.split('/')[1]);
      responseData = mockDB.updateProduct(id, body);
    }
    else if (path.startsWith('products/') && method === 'delete') {
      const id = Number(path.split('/')[1]);
      responseData = mockDB.deleteProduct(id);
    }

    // ── CUSTOMERS ──
    else if (path === 'customers' && method === 'get') {
      responseData = getPaginatedResponse(mockDB.getCustomers(), params);
    }
    else if (path.startsWith('customers/') && method === 'get') {
      const id = Number(path.split('/')[1]);
      const cust = mockDB.getCustomers().find(c => c.id === id);
      if (!cust) {
        status = 404;
        responseData = { detail: 'Customer not found' };
      } else {
        responseData = cust;
      }
    }
    else if (path === 'customers' && method === 'post') {
      responseData = mockDB.createCustomer(body);
      status = 201;
    }
    else if (path.startsWith('customers/') && method === 'put') {
      const id = Number(path.split('/')[1]);
      responseData = mockDB.updateCustomer(id, body);
    }
    else if (path.startsWith('customers/') && method === 'delete') {
      const id = Number(path.split('/')[1]);
      responseData = mockDB.deleteCustomer(id);
    }

    // ── SUPPLIERS ──
    else if (path === 'suppliers' && method === 'get') {
      responseData = getPaginatedResponse(mockDB.getSuppliers(), params);
    }
    else if (path.startsWith('suppliers/') && method === 'get') {
      const id = Number(path.split('/')[1]);
      const supp = mockDB.getSuppliers().find(s => s.id === id);
      if (!supp) {
        status = 404;
        responseData = { detail: 'Supplier not found' };
      } else {
        responseData = supp;
      }
    }
    else if (path === 'suppliers' && method === 'post') {
      responseData = mockDB.createSupplier(body);
      status = 201;
    }
    else if (path.startsWith('suppliers/') && method === 'put') {
      const id = Number(path.split('/')[1]);
      responseData = mockDB.updateSupplier(id, body);
    }
    else if (path.startsWith('suppliers/') && method === 'delete') {
      const id = Number(path.split('/')[1]);
      responseData = mockDB.deleteSupplier(id);
    }

    // ── SALES ──
    else if (path === 'sales' && method === 'get') {
      responseData = getPaginatedResponse(mockDB.getSales(), params);
    }
    else if (path.startsWith('sales/') && path.endsWith('/cancel') && method === 'post') {
      const id = Number(path.split('/')[1]);
      responseData = mockDB.cancelSale(id);
    }
    else if (path.startsWith('sales/') && method === 'get') {
      const id = Number(path.split('/')[1]);
      const sale = mockDB.getSales().find(s => s.id === id);
      if (!sale) {
        status = 404;
        responseData = { detail: 'Sale not found' };
      } else {
        responseData = sale;
      }
    }
    else if (path === 'sales' && method === 'post') {
      responseData = mockDB.createSale(body);
      status = 201;
    }

    // ── PURCHASES ──
    else if (path === 'purchases' && method === 'get') {
      responseData = getPaginatedResponse(mockDB.getPurchases(), params);
    }
    else if (path.startsWith('purchases/') && method === 'get') {
      const id = Number(path.split('/')[1]);
      const purchase = mockDB.getPurchases().find(p => p.id === id);
      if (!purchase) {
        status = 404;
        responseData = { detail: 'Purchase not found' };
      } else {
        responseData = purchase;
      }
    }
    else if (path === 'purchases' && method === 'post') {
      responseData = mockDB.createPurchase(body);
      status = 201;
    }

    // ── STOCK MOVEMENT & ADJUSTMENT ──
    else if (path === 'stock/movements' && method === 'get') {
      responseData = getPaginatedResponse(mockDB.getStockMovements(), params);
    }
    else if (path === 'stock/adjust' && method === 'post') {
      responseData = mockDB.adjustStock(body);
      status = 201;
    }

    // ── SETTINGS ──
    else if (path === 'settings' && method === 'get') {
      responseData = mockDB.getSettings();
    }
    else if (path === 'settings' && method === 'put') {
      mockDB.setSettings({ ...mockDB.getSettings(), ...body });
      responseData = mockDB.getSettings();
    }

    // ── REPORTS ──
    else if (path === 'reports/sales' && method === 'get') {
      responseData = mockDB.getReportsSales(params.from_date, params.to_date);
    }
    else if (path === 'reports/purchases' && method === 'get') {
      responseData = mockDB.getReportsPurchases(params.from_date, params.to_date);
    }
    else if (path === 'reports/stock' && method === 'get') {
      responseData = mockDB.getReportsStock();
    }
    else if (path === 'reports/gst' && method === 'get') {
      responseData = mockDB.getReportsGst(params.from_date, params.to_date);
    }
    else if (path === 'reports/profit-loss' && method === 'get') {
      responseData = mockDB.getReportsProfitLoss(params.from_date, params.to_date);
    }

    else {
      status = 404;
      responseData = { detail: `Route mock not implemented: ${method.toUpperCase()} /${path}` };
    }

  } catch (error: any) {
    status = 500;
    responseData = { detail: error.message || 'Mock Server Error' };
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 150));

  if (status >= 200 && status < 300) {
    return {
      data: responseData,
      status,
      statusText: 'OK',
      headers: {},
      config,
      request: {}
    };
  } else {
    const error: any = new Error(`Request failed with status code ${status}`);
    error.response = {
      data: responseData,
      status,
      statusText: status === 404 ? 'Not Found' : 'Internal Server Error',
      headers: {},
      config,
      request: {}
    };
    throw error;
  }
};

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  adapter: mockAdapter,
})

// ── Request interceptor: attach JWT ─────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor: handle 401 & errors ────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config

    // Auto-refresh on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          })
          localStorage.setItem('access_token', data.access_token)
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`
          return api(originalRequest)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
      } else {
        window.location.href = '/login'
      }
    }

    const message = error.response?.data?.detail || error.message || 'Something went wrong'
    if (error.response?.status !== 401) {
      toast.error(Array.isArray(message) ? message[0]?.msg || 'Validation error' : message)
    }

    return Promise.reject(error)
  },
)

export default api
