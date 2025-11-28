// src/store.js
import { create } from 'zustand';

export const useStore = create((set, get) => ({
  data: null,
  loadData: async () => {
    try {
      console.log('Loading data...');  // Для дебага в консоли
      const res = await fetch('/data/objects.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      console.log('Data loaded:', data);  // Проверим, что data пришла
      set({ data });
    } catch (error) {
      console.error('Error loading data:', error);  // Ошибка в консоли
      set({ data: null });
    }
  },
  // Другие методы (favorites и т.д.) позже
}));