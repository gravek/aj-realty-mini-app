// src/utils/analytics.js
import { useStore } from '../store';

const USER_ID_KEY = 'tg_user_id'; // ключ в localStorage для сохранения userId

// Функция для отправки профиля пользователя один раз при первом взаимодействии
export const sendProfileOnce = async () => {
  const store = useStore.getState();
  
  let userId = store.userId;

  // ждём userId максимум 3 секунды (как в logEvent)
  if (!userId) {
    console.log('⌛️ Ожидаем userId для профиля...');
    for (let i = 0; i < 6; i++) {
      await new Promise(r => setTimeout(r, 500));
      const fresh = useStore.getState();
      userId = fresh.userId;
      if (userId) break;
    }
  }

  // Если userId так и не появился (локальный запуск) — сохраняем как неизвестного пользователя
  if (!userId) {
    userId = 'UNRECOGNISED_USER';
    console.warn('Не удалось получить валидный userId для профиля');
    return;
    // выключить return — не выходлим, а сохраняем профиль UNRECOGNISED_USER
  }

  const alreadySent = localStorage.getItem('profile_sent');
  if (alreadySent) return;

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
  const userInfo = {
    first_name: tgUser.first_name || 'UNRECOGNISED',
    last_name: tgUser.last_name || 'USER',
    username: tgUser.username || 'UNRECOGNISED_USER',
    language_code: tgUser.language_code || 'ru'
  };

  console.log('Отправляем create_profile один раз');

  await logEvent('create_profile', { user_info: userInfo });

  localStorage.setItem('profile_sent', 'true');
};


// export const logEvent = async (eventType, details = {}) => {
//   const store = useStore.getState();
  
//   const USER_ID_KEY = 'tg_user_id'; // ключ в localStorage для сохранения userId


//   // 1. Пробуем взять из Telegram (нормальный сценарий)
//   let userId = store.userId;
  
//   // Ждём userId максимум 3 секунды (Telegram initData обычно приходит быстро)
//   if (!userId) {
//     console.log('⌛️ Ожидаем Telegram userId...');
//     for (let i = 0; i < 6; i++) {          // 6 × 500 мс = 3 сек
//       await new Promise(r => setTimeout(r, 500));
//       const freshState = useStore.getState();
//       userId = freshState.userId;
//       if (userId) break;
//     }
//   }
  
//   // 2. Если userId  нет (локальный запуск) — сохраняем как неизвестного пользователя
//   if (!userId) {
//     userId = 'UNRECOGNISED_USER';  // ← в том числе тестовый/локальный режим
//     console.warn('⚠️ Не удалось получить userId, логируем как:', userId);
//   }

//   const payload = {
//     user_id: userId,
//     event_type: eventType,
//     // timestamp: Date.now(),
//     // datetime: new Date().toISOString().replace('T', ' ').slice(0, 23), // YYYY-MM-DD HH:MM:SS.sss
//     datetime: new Date().toISOString().slice(0, 23), //  ISO 8601 YYYY-MM-DDThh:mm:ss.sss datetime.fromisoformat()
//     // env: userId.startsWith('UNRECOGNISED_') ? 'test' : 'prod',
//     details: {                    // специфические параметры события
//       ...details
//     }
//   };


//   try {
//     console.log('Отправляем событие:', payload); // ← для дебага

//     const response = await fetch(
//       'https://realty-tg-bot.vercel.app/api/log_event',
//       {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       }
//     );

//     if (response.ok) {
//       console.log('Событие успешно отправлено');
//     } else {
//       console.warn('Ошибка отправки:', response.status, await response.text());
//     }
//   } catch (error) {
//     console.error('Ошибка fetch:', error);
//   }
// };


export const logEvent = async (eventType, details = {}) => {
  let userId = getCachedUserId(); // сначала пытаемся быстро из кэша
  console.log('logEvent: полученный из кэша userId:', userId);

  // Если в кэше пусто — берём из стора и ждём
  if (!userId) {
    const store = useStore.getState();
    userId = store.userId;

    if (!userId) {
      console.log('⌛️ Ожидаем Telegram userId...');
      for (let i = 0; i < 6; i++) {
        await new Promise(r => setTimeout(r, 500));
        const freshState = useStore.getState();
        userId = freshState.userId;
        if (userId) break;
      }
    }

    // Если всё ещё нет — fallback
    if (!userId) {
      userId = 'UNRECOGNISED_USER';
      console.warn('⚠️ Не удалось получить userId (fallback), логируем как:', userId);
    } else {
      // Успешно получили → кэшируем
      cacheUserId(userId);
      console.log('logEvent: полученный из кэша userId:', getCachedUserId());
    }
  }

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
      console.log('Событие успешно отправлено');
    } else {
      console.warn('Ошибка отправки:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Ошибка fetch:', error);
  }
};

// ────────────────────────────────────────────────
// Хелперы для кэширования userId
// ────────────────────────────────────────────────

function getCachedUserId() {
  return localStorage.getItem(USER_ID_KEY) || null;
}

function cacheUserId(id) {
  if (id && id !== 'UNRECOGNISED_USER') {
    localStorage.setItem(USER_ID_KEY, id);
  }
}