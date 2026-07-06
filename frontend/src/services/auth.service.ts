import { TokenResponse, User } from '@/types'

export const authService = {
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const user: User = {
      id: 1,
      name: 'MJ Admin',
      email: email || 'admin@mjagency.com',
      role: 'admin',
      is_active: true,
      created_at: new Date().toISOString()
    };
    localStorage.setItem('access_token', 'mock-access-token');
    localStorage.setItem('refresh_token', 'mock-refresh-token');
    localStorage.setItem('user', JSON.stringify(user));
    
    // Slight delay to simulate network latency
    await new Promise((r) => setTimeout(r, 150));
    return {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      token_type: 'bearer',
      user
    };
  },

  refresh: async (refresh_token: string) => {
    localStorage.setItem('access_token', 'mock-new-access-token');
    await new Promise((r) => setTimeout(r, 100));
    return {
      access_token: 'mock-new-access-token',
      refresh_token: 'mock-new-refresh-token',
    };
  },

  me: async (): Promise<User> => {
    const storedUser = localStorage.getItem('user');
    await new Promise((r) => setTimeout(r, 100));
    return storedUser ? JSON.parse(storedUser) : {
      id: 1,
      name: 'MJ Admin',
      email: 'admin@mjagency.com',
      role: 'admin',
      is_active: true,
      created_at: new Date().toISOString()
    };
  },

  register: async (data: { name: string; email: string; password: string; role: string }): Promise<User> => {
    await new Promise((r) => setTimeout(r, 150));
    return {
      id: 99,
      name: data.name,
      email: data.email,
      role: data.role as any || 'staff',
      is_active: true,
      created_at: new Date().toISOString()
    };
  }
}
