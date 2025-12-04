// src/components/Map.jsx — ФИНАЛЬНАЯ РАБОЧАЯ ВЕРСИЯ
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Map = ({ estates = [], center = [41.65, 41.63], zoom = 11 }) => {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const markersRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Конвертация [lat, lng] → [lng, lat]
  const toYandex = (coords) => coords && coords.length === 2 ? [coords[0], coords[1]] : [41.64, 41.65];
  console.log('toYandex:', toYandex);


  // === ИНИЦИАЛИЗАЦИЯ КАРТЫ ОДИН РАЗ ===
  useEffect(() => {
    if (!window.ymaps3 || !mapRef.current) return;

    const init = async () => {
      await window.ymaps3.ready;
      const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = window.ymaps3;

      // Создаём карту БЕЗ начальных координат — они будут установлены позже
      const map = new YMap(mapRef.current, {
        location: { center: [41.64, 41.65], zoom: 10 } // нейтральная точка
      });

      map.addChild(new YMapDefaultSchemeLayer());
      map.addChild(new YMapDefaultFeaturesLayer()); // ← ВКЛЮЧАЕТ POI (Carrefour, ТЦ и т.д.)

      setMapInstance(map);
      setIsLoading(false);

      // Подсказка
      setTimeout(() => setShowHint(false), 5000);
    };

    init();

    return () => {
      if (mapInstance) mapInstance.destroy();
    };
  }, []); // ← Только один раз!

  // === ВСЕГДА ОБНОВЛЯЕМ ЦЕНТР И ЗУМ ===
  useEffect(() => {
    if (!mapInstance) return;

    const yCenter = toYandex(center);
    const targetZoom = location.pathname.includes('/estate') ? 17 : location.pathname.includes('/district') ? 14 : zoom;
    console.log('useEffect location.pathname:', location.pathname, 'yCenter:', yCenter, 'targetZoom:', targetZoom);

    mapInstance.setLocation({
      center: yCenter,
      zoom: targetZoom,
      duration: 900
    });
  }, [mapInstance, center, zoom, location.pathname]);

  // === ОБНОВЛЕНИЕ МАРКЕРОВ ===
  useEffect(() => {
    if (!mapInstance) return;

    markersRef.current.forEach(m => mapInstance.removeChild(m));
    markersRef.current = [];

    estates.forEach(estate => {
      const coords = toYandex(estate.coords);
      if (!coords) return;

      const el = document.createElement('div');
      el.className = 'shadow-xl rounded-full bg-rose-50/60 backdrop-blur px-3 py-2 text-sm font-bold text-rose-900 border-2 border-rose-400 whitespace-nowrap hover:scale-110 transition';
      el.innerHTML = estate.name.length > 16 ? estate.name.slice(0, 13) + '...' : estate.name;

      const marker = new window.ymaps3.YMapMarker({ coordinates: coords }, el);

      el.onclick = () => {
        navigate(`/estate/${estate.district}/${encodeURIComponent(estate.name)}`);
      };

      mapInstance.addChild(marker);
      markersRef.current.push(marker);
    });
  }, [mapInstance, estates, navigate]);

  // Центрирование по кнопке
  const handleRecenter = () => {
    if (!mapInstance) return;
    const targetZoom = location.pathname.includes('/estate') ? 17 : 14;
    mapInstance.setLocation({
      center: toYandex(center),
      zoom: targetZoom,
      duration: 800
    });
  };

  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-orange-200">
      {isLoading && (
        <div className="absolute inset-0 bg-orange-50/95 flex items-center justify-center z-20">
          <span className="text-orange-800 font-bold text-lg">Загрузка карты Аджарии...</span>
        </div>
      )}

      {showHint && !isLoading && (
        <div className="absolute top-4 left-4 right-4 bg-rose-700/62 text-white text-sm px-4 py-3 rounded-xl z-20 animate-pulse shadow-lg">
          Карта интерактивна — кликайте на объекты и маркеры!
        </div>
      )}

      <button
        onClick={handleRecenter}
        className="absolute bottom-4 right-4 bg-rose-100/50 border backdrop-blur-sm shadow-xl rounded-full p-3 z-10 hover:scale-110 transition active:scale-95"
        title="Вернуться к объекту"
      >
        <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={2.5} viewBox="0 0 24 24">
          <path d="M4 12h16" />
          <path d="M12 4v16" />
          <circle cx="12" cy="12" r="2" fill="none" strokeWidth="2" />
        </svg>

      </button>

      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default Map;