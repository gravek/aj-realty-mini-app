// src/utils/analytics.js
import { useStore } from '../store';

export const logEvent = async (eventType, details = {}) => {
  const store = useStore.getState();
  
  // 1. Пробуем взять из Telegram (нормальный сценарий)
  let userId = store.userId;
  
  // Ждём userId максимум 3 секунды (Telegram initData обычно приходит быстро)
  if (!userId) {
    console.log('⌛️ Ожидаем Telegram userId...');
    for (let i = 0; i < 6; i++) {          // 6 × 500 мс = 3 сек
      await new Promise(r => setTimeout(r, 500));
      const freshState = useStore.getState();
      userId = freshState.userId;
      if (userId) break;
    }
  }
  
  // 2. Если userId  нет (локальный запуск) — сохраняем как неизвестного пользователя
  if (!userId) {
    userId = 'UNRECOGNISED_USER';  // ← в том числе тестовый/локальный режим
    console.warn('⚠️ Не удалось получить userId, логируем как:', userId);
  }

  const payload = {
    user_id: userId,
    event_type: eventType,
    // timestamp: Date.now(),
    // datetime: new Date().toISOString().replace('T', ' ').slice(0, 23), // YYYY-MM-DD HH:MM:SS.sss
    datetime: new Date().toISOString().slice(0, 23), //  ISO 8601 YYYY-MM-DDThh:mm:ss.sss datetime.fromisoformat()
    // env: userId.startsWith('UNRECOGNISED_') ? 'test' : 'prod',
    details: {                    // специфические параметры события
      ...details
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