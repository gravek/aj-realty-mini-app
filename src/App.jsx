// src/App.jsx — ФИНАЛЬНАЯ ВЕРСИЯ
import React, { useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from './store';
import MapWithContext from './components/MapWithContext';
import Home from './components/Home';
import District from './components/District';
import Estate from './components/Estate';
import Apartment from './components/Apartment';
import Calculator from './components/Calculator';
import PersonalOfferStub from './components/PersonalOfferStub';

const BottomNav = () => {
  const location = useLocation();
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <Link to="/" className={`py-3 px-6 rounded-lg font-medium ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-600'}`}>
          Главная
        </Link>
        <Link to="/district/Chakvi" className={`py-3 px-6 rounded-lg font-medium ${location.pathname.startsWith('/district') ? 'text-blue-600' : 'text-gray-600'}`}>
          Районы
        </Link>
        <Link to="/calculator" className={`py-3 px-6 rounded-lg font-medium ${location.pathname === '/calculator' ? 'text-blue-600' : 'text-gray-600'}`}>
          Калькулятор
        </Link>
      </div>
    </div>
  );
};

const Layout = () => {
  const { loadData } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadData();

    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      tg.MainButton.setText('Написать Андрею');
      tg.MainButton.show();
      tg.MainButton.color = '#229ED9';
      tg.MainButton.onClick(() => tg.openTelegramLink('https://t.me/a4k5o6'));

      if (location.pathname !== '/') {
        tg.BackButton.show();
        tg.BackButton.onClick(() => navigate(-1));
      } else {
        tg.BackButton.hide();
      }

      return () => tg.BackButton.offClick();
    }
  }, [loadData, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Хедер */}
      // Внутри Layout, сразу после header
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            {/* ← КНОПКА НАЗАД (всегда, кроме главной) */}
            {location.pathname !== '/' && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 transition"
              >
                <svg className="w-6 h-6 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-2xl font-bold text-amber-900">Elaj Realty</h1>
          </div>
          <span className="text-sm text-amber-700">Аджария • 2025</span>
        </div>
      </header>

      {/* Карта */}
      <div className="h-64 -mx-6 -mt-4 mb-6">
        <MapWithContext />
      </div>

      {/* Контент */}
      <main className="px-4 pb-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/district/:district" element={<District />} />
          <Route path="/estate/:district/:estate" element={<Estate />} />
          <Route path="/apartment/:id" element={<Apartment />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/offer/:user_id" element={<PersonalOfferStub />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
};

export default Layout;