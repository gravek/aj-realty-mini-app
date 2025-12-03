// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
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
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-amber-100 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto py-3">
        <Link to="/" className={`px-6 py-2 font-medium transition ${isActive('/') ? 'text-amber-700 font-bold' : 'text-amber-600'}`}>
          Главная
        </Link>
        <Link to="/district/Chakvi" className={`px-6 py-2 font-medium transition ${isActive('/district') ? 'text-amber-700 font-bold' : 'text-amber-600'}`}>
          Районы
        </Link>
        <Link to="/calculator" className={`px-6 py-2 font-medium transition ${isActive('/calculator') ? 'text-amber-700 font-bold' : 'text-amber-600'}`}>
          Калькулятор
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-750 to-orange-800 text-orange-900 pb-20">
      {/* Хедер с кнопкой назад */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-950">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {location.pathname !== '/' && (
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 rounded-full bg-orange-100 hover:bg-orange-200 transition active:scale-95"
              >
                <svg className="w-4 h-4 text-orange-800" fill="none" stroke="currentColor" viewBox="0 0 18 18">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-2xl font-bold text-orange-800">Elaj Realty</h1>
          </div>
          <span className="text-sm font-medium text-amber-800">Аджария • 2026</span>
        </div>
      </header>

      {/* Карта — всегда сверху */}
      <div className="h-64 -mx-4 mb-6">
        <MapWithContext />
      </div>

      <main className="px-4 pb-24">
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
}