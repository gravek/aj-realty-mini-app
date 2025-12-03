// src/components/Map.jsx
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

  // Yandex: [lng, lat], наши данные: [lat, lng]
  const toYandex = (coords) => coords ? [coords[1], coords[0]] : null;

  useEffect(() => {
    if (!window.ymaps3) return;

    const init = async () => {
      await window.ymaps3.ready;
      const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = window.ymaps3;

      const map = new YMap(mapRef.current, {
        location: { center: toYandex(center), zoom },
      });

      map.addChild(new YMapDefaultSchemeLayer());
      map.addChild(new YMapDefaultFeaturesLayer()); // ← ВАЖНО: включает POI (ТЦ, магазины и т.д.)

      setMapInstance(map);
      setIsLoading(false);

      // Подсказка исчезает через 4 сек
      const timer = setTimeout(() => setShowHint(false), 4000);
      return () => clearTimeout(timer);
    };

    init();
  }, []);

  // Обновление центра и зума
  useEffect(() => {
    if (mapInstance) {
      mapInstance.setLocation({
        center: toYandex(center),
        zoom,
        duration: 600,
      });
    }
  }, [mapInstance, center, zoom]);

  // Маркеры комплексов
  useEffect(() => {
    if (!mapInstance) return;

    // Очистка старых
    markersRef.current.forEach(m => mapInstance.removeChild(m));
    markersRef.current = [];

    estates.forEach(estate => {
      const coords = toYandex(estate.coords);
      if (!coords) return;

      const el = document.createElement('div');
      el.className = 'shadow-lg rounded-full bg-white/80 px-2 py-1 text-xs font-bold text-orange-800 border-1 border-amber-800 whitespace-nowrap';
      el.innerHTML = estate.name.length > 18 ? estate.name.slice(0, 15) + '...' : estate.name;

      const marker = new window.ymaps3.YMapMarker(
        { coordinates: coords, draggable: false },
        el
      );

      el.onclick = () => {
        if (estate.district && estate.name) {
          navigate(`/estate/${estate.district}/${encodeURIComponent(estate.name)}`);
        }
      };

      mapInstance.addChild(marker);
      markersRef.current.push(marker);
    });
  }, [mapInstance, estates, navigate]);

  // Кнопка "Вернуться к объекту"
  const handleRecenter = () => {
    if (mapInstance) {
      mapInstance.setLocation({
        center: toYandex(center),
        zoom: location.pathname.includes('/estate') ? 17 : 14,
        duration: 800,
      });
    }
  };

  if (!window.ymaps3) {
    return <div className="h-64 bg-gray-200 flex items-center justify-center text-red-600">Карта недоступна</div>;
  }

  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-xl">
      {isLoading && (
        <div className="absolute inset-0 bg-amber-50/90 flex items-center justify-center z-10">
          <span className="text-red-500 font-medium">Загрузка карты Аджарии...</span>
        </div>
      )}

      {/* Подсказка */}
      {showHint && !isLoading && (
        <div className="absolute top-3 left-3 right-3 bg-red-500/70 text-white text-sm px-4 py-2 rounded-b-lg z-10 animate-pulse">
          Тапните на карту или маркер комплекса
        </div>
      )}

      {/* Кнопка "Вернуться к объекту" */}
      <button
        onClick={handleRecenter}
        className="absolute bottom-4 right-4 bg-white/85 backdrop-blur shadow-xl rounded-full p-3 z-10 hover:scale-110 transition"
        title="Вернуться к объекту"
      >
        <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={2.5} viewBox="0 0 24 24">
          <path d="M4 12h16" />
          <path d="M12 4v16" />
          <circle cx="12" cy="12" r="3" fill="none" strokeWidth="2.5" />
        </svg>

      </button>

      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default Map;