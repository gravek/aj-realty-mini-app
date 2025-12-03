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

  // КОНВЕРТАЦИЯ: [lat, lng] → [lng, lat] для Яндекса
  const toYandex = (coords) => coords && coords.length === 2 ? [coords[1], coords[0]] : null;

  // === ИНИЦИАЛИЗАЦИЯ КАРТЫ (только один раз) ===
  useEffect(() => {
    if (!window.ymaps3) return;

    const init = async () => {
      await window.ymaps3.ready;
      const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = window.ymaps3;

      const map = new YMap(mapRef.current, {
        location: {
          center: toYandex(center),
          zoom,
        },
      });

      map.addChild(new YMapDefaultSchemeLayer());
      map.addChild(new YMapDefaultFeaturesLayer()); // ← POI кликабельны!

      setMapInstance(map);
      setIsLoading(false);

      setTimeout(() => setShowHint(false), 4000);
    };

    init();

    return () => {
      if (mapInstance) mapInstance.destroy();
    };
  }, []); // ← Только один раз

  // === ОБНОВЛЕНИЕ ЦЕНТРА И ЗУМА ПРИ СМЕНЕ ПРОПСОВ ===
  useEffect(() => {
    if (!mapInstance) return;

    mapInstance.setLocation({
      center: toYandex(center),
      zoom,
      duration: 800,
    });
  }, [mapInstance, center, zoom]); // ← ВОТ ЭТО ГЛАВНОЕ!

  // === ОБНОВЛЕНИЕ МАРКЕРОВ ===
  useEffect(() => {
    if (!mapInstance) return;

    // Удаляем старые
    markersRef.current.forEach(m => mapInstance.removeChild(m));
    markersRef.current = [];

    estates.forEach(estate => {
      const coords = toYandex(estate.coords);
      if (!coords) return;

      const el = document.createElement('div');
      el.className = 'shadow-lg rounded-full bg-white px-2 py-1 text-xs font-bold text-amber-800 border border-rose-500 whitespace-nowrap';
      el.innerHTML = estate.name.length > 18 ? estate.name.slice(0, 15) + '...' : estate.name;
      el.style.cursor = 'pointer';

      const marker = new window.ymaps3.YMapMarker(
        { coordinates: coords },
        el
      );

      el.onclick = () => {
        navigate(`/estate/${estate.district}/${encodeURIComponent(estate.name)}`);
      };

      mapInstance.addChild(marker);
      markersRef.current.push(marker);
    });
  }, [mapInstance, estates, navigate]);

  // Кнопка центрирования
  const handleRecenter = () => {
    if (mapInstance) {
      mapInstance.setLocation({
        center: toYandex(center),
        zoom: location.pathname.includes('/estate') ? 17 : 14,
        duration: 800,
      });
    }
  };

  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-orange-100">
      {isLoading && (
        <div className="absolute inset-0 bg-orange-50/90 flex items-center justify-center z-10">
          <span className="text-orange-800 font-semibold">Загрузка карты...</span>
        </div>
      )}

      {showHint && !isLoading && (
        <div className="absolute top-3 left-3 right-3 bg-rose-600/75 text-white text-sm px-4 py-2 rounded-lg z-10 animate-pulse">
          💡 Двигайте карту и нажимайте на объекты
        </div>
      )}

      <button
        onClick={handleRecenter}
        className="absolute bottom-4 right-4 bg-rose-100/0 border backdrop-blur-sm shadow-xl rounded-full p-3 z-10 hover:scale-110 transition active:scale-95"
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