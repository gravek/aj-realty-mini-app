// src/utils/analytics.js
import { useStore } from '../store';

const USER_ID_KEY = 'tg_user_id';

// =============================================
// Хелперы кэширования (теперь кэшируем даже UNRECOGNISED для локала)
// =============================================
function getCachedUserId() {
  return localStorage.getItem(USER_ID_KEY) || null;
}

function cacheUserId(id) {
  if (id) {
    localStorage.setItem(USER_ID_KEY, id);   // ← убрали проверку на UNRECOGNISED
  }
}

// =============================================
// sendProfileOnce — теперь работает в локале
// =============================================
export const sendProfileOnce = async () => {
  const alreadySent = localStorage.getItem('profile_sent');
  if (alreadySent) return;

  let userId = getCachedUserId();
  if (!userId) {
    const store = useStore.getState();
    userId = store.userId;

    if (!userId) {
      console.log('⌛️ Ожидаем userId для профиля...');
      for (let i = 0; i < 6; i++) {           // максимум 3 сек
        await new Promise(r => setTimeout(r, 500));
        userId = useStore.getState().userId;
        if (userId) break;
      }
    }
  }

  if (!userId) {
    userId = 'UNRECOGNISED_USER';
    console.warn('Не удалось получить userId для профиля → используем UNRECOGNISED_USER');
  }

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
  const userInfo = {
    first_name: tgUser.first_name || '',
    last_name: tgUser.last_name || '',
    username: tgUser.username || 'UNRECOGNISED_USER',
    language_code: tgUser.language_code || 'ru'
  };

  console.log('Отправляем create_profile один раз');
  await logEvent('create_profile', { user_info: userInfo });

  localStorage.setItem('profile_sent', 'true');
};

// =============================================
// logEvent — быстрый кэш + минимум ожидания
// =============================================
export const logEvent = async (eventType, details = {}) => {
  let userId = getCachedUserId();

  // Если в кэше ничего нет — пробуем из стора + короткое ожидание
  if (!userId) {
    const store = useStore.getState();
    userId = store.userId;

    if (!userId) {
      console.log('⌛️ Ожидаем Telegram userId...');
      for (let i = 0; i < 6; i++) {          // максимум 3 сек
        await new Promise(r => setTimeout(r, 500));
        userId = useStore.getState().userId;
        if (userId) break;
      }
    }

    if (!userId) {
      userId = 'UNRECOGNISED_USER';
      console.warn('⚠️ Не удалось получить userId → UNRECOGNISED_USER');
    }
  }

  // Кэшируем ВСЕГДА (включая UNRECOGNISED) — чтобы локал и первый запуск не висели
  cacheUserId(userId);

  const payload = {
    user_id: userId,
    event_type: eventType,
    datetime: new Date().toISOString().slice(0, 23),
    details: { ...details }
  };

  try {
    console.log('Отправляем событие:', payload);

    const response = await fetch(
      'https://realty-tg-bot.vercel.app/api/log_event',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      console.log('✅ Событие успешно отправлено');
    } else {
      console.warn('Ошибка отправки:', response.status);
    }
  } catch (error) {
    console.error('Ошибка fetch:', error);
  }
};