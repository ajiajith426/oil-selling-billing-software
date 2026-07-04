import api from './api'
import { TokenResponse, User } from '@/types'

export const authService = {
  login: (email: string, password: string) =>
    api.post<TokenResponse>('/auth/login', { email, password }).then((r) => r.data),

  refresh: (refresh_token: string) =>
    api.post('/auth/refresh', { refresh_token }).then((r) => r.data),

  me: () => api.get<User>('/auth/me').then((r) => r.data),

  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post<User>('/auth/register', data).then((r) => r.data),
}
