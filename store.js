import { create } from 'zustand'

export const useStore = create((set) => ({
  theme: {},
  data: {},
  favorites: [],
  setTheme: (theme) => set({ theme }),
  fetchData: async () => {
    const res = await fetch('https://elaj-bot-backend-new.vercel.app/api/objects.json')
    const data = await res.json()
    set({ data })
  },
  addToFavorites: (id) => set((state) => ({ favorites: [...state.favorites, id] })),
  syncWithUpstash: async (userId) => {
    // Fetch/save to Upstash via fetch('/api/upstash', { method: 'POST', body: JSON.stringify({ userId, favorites }) })
    // Логика: POST на backend, который пишет в Redis
  },
}))