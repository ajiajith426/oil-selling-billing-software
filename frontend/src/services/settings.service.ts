import api from './api'
import { Settings } from '@/types'

export const settingsService = {
  get: () => api.get<Settings>('/settings').then((r) => r.data),
  update: (data: Partial<Settings>) => api.put<Settings>('/settings', data).then((r) => r.data),
  uploadLogo: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api
      .post<{ logo_url: string }>('/settings/upload-logo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
}
