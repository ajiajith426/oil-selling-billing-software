import { Settings } from '@/types'
import { mockDB } from './mockStore'

export const settingsService = {
  get: async (): Promise<Settings> => {
    await new Promise((r) => setTimeout(r, 100));
    return mockDB.getSettings();
  },
  update: async (data: Partial<Settings>): Promise<Settings> => {
    await new Promise((r) => setTimeout(r, 150));
    const updated = { ...mockDB.getSettings(), ...data };
    mockDB.setSettings(updated);
    return updated;
  },
  uploadLogo: async (file: File): Promise<{ logo_url: string }> => {
    await new Promise((r) => setTimeout(r, 200));
    return { logo_url: 'https://images.unsplash.com/photo-1598209279122-8541218a0387?auto=format&fit=crop&q=80&w=100' };
  },
}
