import { create } from 'zustand';

export const useStore = create((set) => ({
  data: null,
  loadData: async () => {
    try {
      const res = await fetch('/data/objects.json');  // ← вот тут слеш обязателен
      if (!res.ok) throw new Error('File not found');
      const json = await res.json();
      set({ data: json });
      console.log('Data loaded:', json);
    } catch (e) {
      console.error('Failed to load objects.json →', e);
      set({ data: null });
    }
  },
}));