// src/App.jsx
import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from './store';
import MapWithContext from './components/MapWithContext';


// AppRoutes
import AppRoutes from './components/AppRoutes';

const BottomNav = () => {
  const location = useLocation();

  const isActive = (paths) => {
    if (Array.isArray(paths)) {
      return paths.some(p => location.pathname === p || location.pathname.startsWith(p));
    }
    return location.pathname === paths || location.pathname.startsWith(paths);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-amber-200 z-50 shadow-2xl">
      <div className="flex justify-around items-center max-w-md mx-auto py-4">
        {/* Главная */}
        <Link
          to="/"
          className={`flex flex-col items-center px-2 py-1 rounded-sm transition-all ${
            isActive(['/'])
              ? 'text-orange-800 font-bold border-y-2 border-rose-600 -mb-1'
              : 'text-amber-600 font-medium'
          }`}
        >
          <span className="text-md">Главная</span>
        </Link>

        {/* ОБЪЕКТЫ / Районы */}
        <Link
          to="/districts"
          className={`flex flex-col items-center px-2 py-1 rounded-sm transition-all ${
            isActive(['/districts', '/estate', '/apartment'])
              ? 'text-orange-800 font-bold border-y-2 border-cyan-600 -mb-1'
              : 'text-amber-600 font-medium'
          }`}
        >
          <span className="text-md">Объекты</span>
        </Link>

        {/* Калькулятор */}
        <Link
          to="/calculator"
          className={`flex flex-col items-center px-2 py-1 rounded-sm transition-all ${
            isActive('/calculator')
              ? 'text-orange-800 font-bold border-y-2 border-cyan-600 -mb-1'
              : 'text-amber-600 font-medium'
          }`}
        >
          <span className="text-md">Расчеты</span>
        </Link>
      </div>
    </div>
  );
};

export default function App() {
  const { loadData } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  // фиксация предыдущего пути
  const prevPathRef = useRef(null);
  const [prevPath, setPrevPath] = useState(null);

  useEffect(() => {
    // при изменении location сохраняем предыдущее значение в состояние,
    // затем обновляем ref текущим значением
    setPrevPath(prevPathRef.current);
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  const getRouteName = (path) => {
    if (!path) return null;
    if (path === '/') return 'Главная';
    if (path.startsWith('/districts')) return 'Районы';
    if (path.startsWith('/estate')) return 'ЖК';
    if (path.startsWith('/apartment')) return 'Апартаменты';
    if (path.startsWith('/calculator')) return 'Расчёты';
    return path;
  };

  const prevName = getRouteName(prevPath);

  useEffect(() => {
    loadData();

    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // ГЛАВНАЯ КНОПКА — ВСЕГДА ВИДНА И РАБОТАЕТ НА ВСЕХ СТРАНИЦАХ
      tg.MainButton.setText('Написать менеджеру');
      tg.MainButton.color = '#f5740b'; // оранжевый, как у тебя
      tg.MainButton.textColor = '#ffffff';
      tg.MainButton.show(); // ВСЕГДА ПОКАЗЫВАЕМ

      const openManagerChat = () => {
        tg.openTelegramLink('https://t.me/a4k5o6');
        tg.close(); // опционально: закрыть WebApp после перехода в чат
      };

      tg.MainButton.onClick(openManagerChat);

      // BackButton — только если НЕ на главной
      const handleRouteChange = () => {
        if (location.pathname === '/') {
          tg.BackButton.hide();
        } else {
          tg.BackButton.show();
          tg.BackButton.onClick(() => navigate(-1));
        }
      };

      handleRouteChange(); // при загрузке

      // При смене маршрута — обновляем BackButton
      return () => {
        tg.MainButton.offClick(openManagerChat);
      };
    }
  }, [loadData, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 via-amber-70 via-orange-80 to-orange-200 text-orange-800 pb-20">
      {/* Хедер с кнопкой назад */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-800">
        <div className="max-w-3xl mx-auto relative px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {location.pathname !== '/' && (
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 rounded-full bg-orange-100 hover:bg-orange-200 transition active:scale-95 flex items-center"
                aria-label="Назад"
              >
                <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>

                {prevName && (
                  <span className="ml-0 text-xs font-medium text-orange-800">
                    {prevName}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Центрируем заголовок абсолютно */}
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-orange-800 pointer-events-none">
            • Elad Realty •
          </h1>

          <span className="text-sm font-medium text-amber-800">Грузия</span>
        </div>
      </header>

      {/* Карта — overflow-hidden*/}
      <div className="h-64 -mx-0 mb-6 overflow-hidden">
        <MapWithContext />
      </div>


      <main className="px-4 pb-24">
        <AppRoutes />
      </main>

      <BottomNav />
    </div>
  );
}