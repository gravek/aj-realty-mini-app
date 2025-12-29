// src/utils/analytics.js
import { useStore } from '../store';

export const logEvent = async (eventType, details = {}) => {
  const store = useStore.getState();
  
  // 1. Пробуем взять из Telegram (нормальный сценарий)
  let userId = store.userId;
  
  // 2. Если userId нет (локальный запуск) — берём тестовый
  if (!userId) {
    userId = 'TEST_LOCAL_USER_123456';  // ← твой тестовый ID
    console.log('⚠️ Локальный режим: используем тестовый userId:', userId);
  }

  const payload = {
    user_id: userId,
    event_type: eventType,
    details: {
      ...details,
      timestamp: Date.now(),
      source: 'mini_app',
      env: userId.startsWith('TEST_') ? 'local' : 'production'  // удобно фильтровать потом
    }
  };

  try {
    console.log('Отправляем событие:', payload); // ← для дебага

    const response = await fetch(
      'https://realty-tg-bot.vercel.app/api/log_event',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      console.log('Событие успешно отправлено');
    } else {
      console.warn('Ошибка отправки:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Ошибка fetch:', error);
  }
};