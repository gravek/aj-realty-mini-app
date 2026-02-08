// src/App.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from './store';
import MapWithContext from './components/MapWithContext';

import AppRoutes from './components/AppRoutes';
import PhotoGalleryModal from './components/PhotoGalleryModal';


const BottomNav = () => {
  const location = useLocation();

  const isActive = (paths) => {
    if (Array.isArray(paths)) {
      return paths.some(p => location.pathname === p || location.pathname.startsWith(p));
    }
    return location.pathname === paths || location.pathname.startsWith(paths);
  };
  
  useEffect(() => {
    // Сбрасываем только при переходе вперёд (не на history.back)
    // Простой способ: проверяем, если pathname изменился "вперёд"
    if (location.pathname.startsWith('/estate/') || location.pathname.startsWith('/apartment/')) {
      // даём React отрендерить контент, потом скроллим
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 50); // или 0–100 мс
    }
  }, [location.pathname]); 

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-amber-200 z-50 shadow-2xl">
      <div className="flex justify-around items-center max-w-md mx-auto py-4">
        <a href="/" className={`flex flex-col items-center px-2 py-1 rounded-sm transition-all ${isActive(['/']) ? 'text-orange-800 font-bold border-y-2 border-rose-600 -mb-1' : 'text-amber-600 font-medium'}`}>
          <span className="text-md">Главная</span>
        </a>
        <a href="/districts" className={`flex flex-col items-center px-2 py-1 rounded-sm transition-all ${isActive(['/districts', '/estate', '/apartment']) ? 'text-orange-800 font-bold border-y-2 border-cyan-600 -mb-1' : 'text-amber-600 font-medium'}`}>
          <span className="text-md">Объекты</span>
        </a>
        <a href="/calculator" className={`flex flex-col items-center px-2 py-1 rounded-sm transition-all ${isActive('/calculator') ? 'text-orange-800 font-bold border-y-2 border-cyan-600 -mb-1' : 'text-amber-600 font-medium'}`}>
          <span className="text-md">Расчеты</span>
        </a>
      </div>
    </div>
  );
};

export default function App() {

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      const user = tg.initDataUnsafe?.user;
      if (user?.id) {
        useStore.setState({ userId: user.id.toString() });
      }
      // Ничего лишнего не логируем — тихо работаем
    } else {
      // Локальный режим — тестовый ID
      useStore.setState({ userId: 'TEST_LOCAL_USER_123456' });
    }
  }, []);

  
  const { loadData } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const prevPathRef = useRef(null);
  const [prevPath, setPrevPath] = useState(null);

  // Галерея
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentEstate, setCurrentEstate] = useState(null);
  const [currentDistrictName, setCurrentDistrictName] = useState('');

  const openGallery = (estate, districtName) => {
    setCurrentEstate(estate);
    setCurrentDistrictName(districtName);
    setGalleryOpen(true);
  };

  useEffect(() => {
    window.openGallery = openGallery;
  }, []);

  useEffect(() => {
    setPrevPath(prevPathRef.current);
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  const getRouteName = (path) => {
    if (!path) return null;
    if (path === '/') return 'Главная';
    if (path.startsWith('/districts')) return 'Районы';
    if (path.startsWith('/estate')) return 'Комплекс';
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

      tg.MainButton.setText('Написать менеджеру');
      tg.MainButton.color = '#007595';
      tg.MainButton.textColor = '#ffffff';
      tg.MainButton.show();

      const openManagerChat = () => {
        tg.openTelegramLink('https://t.me/a4k5o6');
        tg.close();
      };

      tg.MainButton.onClick(openManagerChat);

      const handleRouteChange = () => {
        if (location.pathname === '/') tg.BackButton.hide();
        else {
          tg.BackButton.show();
          tg.BackButton.onClick(() => navigate(-1));
        }
      };

      handleRouteChange();
    }
  }, [loadData, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 via-amber-70 via-orange-80 to-orange-200 text-orange-800 pb-20">
      {/* Хедер */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-800">
        <div className="max-w-3xl mx-auto relative px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {location.pathname !== '/' && (
              <button onClick={() => navigate(-1)} className="p-2.5 rounded-full bg-orange-100 hover:bg-orange-200 transition active:scale-95 flex items-center">
                <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {prevName && <span className="ml-0 text-xs font-medium text-orange-800">{prevName}</span>}
              </button>
            )}
          </div>
          {/* <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-orange-800 pointer-events-none"> */}
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-sm font-bold text-orange-800 pointer-events-none">
            {/* • Elad Realty • */}
            • ДОХОДНАЯ НЕДВИЖИМОСТЬ •
          </h1>
          <span className="text-sm font-medium text-amber-800">Грузия</span>
        </div>
      </header>

      {/* Карта */}
      <div className="h-64 -mx-0 mb-6 overflow-hidden">
        <MapWithContext />
      </div>

      {/* Контент + модалка */}
      <main className="px-4 pb-24 relative">
        <AppRoutes />
        <PhotoGalleryModal
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          estate={currentEstate}
          districtName={currentDistrictName}
        />
      </main>

      <BottomNav />
    </div>
  );
}