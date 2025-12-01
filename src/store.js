// src/store.js
import { create } from 'zustand';

const useStore = create((set) => ({
  data: null,
  loadData: async () => {
    try {
      const res = await fetch('/data/objects.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log('Данные успешно загружены:', json);
      set({ data: json });
    } catch (err) {
      console.error('Ошибка загрузки objects.json:', err);
      set({ data: { districts: {} } });
    }
  },
}));

// Автоматически запускаем загрузку при первом импорте
useStore.getState().loadData();

export { useStore };