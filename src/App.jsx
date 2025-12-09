// src/App.jsx
import React, { useEffect } from 'react';
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
              ? 'text-orange-900 font-bold border-y-2 border-rose-600 -mb-1'
              : 'text-amber-600 font-medium'
          }`}
        >
          <span className="text-lg">Главная</span>
        </Link>

        {/* ОБЪЕКТЫ / Районы */}
        <Link
          to="/districts"
          className={`flex flex-col items-center px-2 py-1 rounded-sm transition-all ${
            isActive(['/districts', '/estate', '/apartment'])
              ? 'text-orange-900 font-bold border-y-2 border-cyan-600 -mb-1'
              : 'text-amber-600 font-medium'
          }`}
        >
          <span className="text-lg">Объекты</span>
        </Link>

        {/* Калькулятор */}
        <Link
          to="/calculator"
          className={`flex flex-col items-center px-2 py-1 rounded-sm transition-all ${
            isActive('/calculator')
              ? 'text-orange-900 font-bold border-y-2 border-cyan-600 -mb-1'
              : 'text-amber-600 font-medium'
          }`}
        >
          <span className="text-lg">Расчеты</span>
        </Link>
      </div>
    </div>
  );
};

export default function App() {
  const { loadData } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadData();

    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // MainButton — всегда виден
      tg.MainButton.setText('Написать менеджеру →');
      tg.MainButton.show();
      tg.MainButton.color = '#f5740bff';
      tg.MainButton.onClick(() => tg.openTelegramLink('https://t.me/a4k5o6'));

      // BackButton — только если не на главной
      if (location.pathname !== '/') {
        tg.BackButton.show();
        tg.BackButton.onClick(() => navigate(-1));
      } else {
        tg.BackButton.hide();
      }
    }
  }, [loadData, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 via-amber-70 via-orange-80 to-orange-200 text-orange-900 pb-20">
      {/* Хедер с кнопкой назад */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-950">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {location.pathname !== '/' && (
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 rounded-full bg-orange-100 hover:bg-orange-200 transition active:scale-95"
              >
                <svg className="w-6 h-6 text-orange-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-2xl font-bold text-orange-800">Elad Realty</h1>
          </div>
          <span className="text-sm font-medium text-amber-800">Грузия • 2026</span>
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