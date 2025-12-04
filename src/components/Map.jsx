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
  // const toYandex = (coords) => coords && coords.length === 2 ? [coords[1], coords[0]] : [41.64, 41.65];


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
    // console.log('useEffect location.pathname:', location.pathname, 'yCenter:', yCenter, 'targetZoom:', targetZoom);

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

    // Добавляем метки
    estates.forEach(estate => {
      const coords = toYandex(estate.coords);
      if (!coords) return;

      const el = document.createElement('div');
      el.className = 'relative group cursor-pointer';
      
      // Адаптивный размер в зависимости от зума
      const sizeClass = zoom >= 16 ? 'w-7 h-7' : 
                        zoom >= 14 ? 'w-6 h-6' : 
                        'w-5 h-5';
      
      const dotSizeClass = zoom >= 16 ? 'w-2.5 h-2.5' : 
                          zoom >= 14 ? 'w-2 h-2' : 
                          'w-1.5 h-1.5';
      
      // Определяем, показывать ли подсказку
      const showTooltip = zoom >= 15;
      
      el.innerHTML = `
        <style>
          @keyframes gentle-pulse {
            0%, 100% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.2); opacity: 0.9; }
          }
        </style>
        
        <div class="relative flex flex-col items-center">
          <!-- Пульсирующее кольцо -->
          <div class="absolute ${sizeClass} bg-cyan-400/30 rounded-full"
              style="animation: gentle-pulse 2s ease-in-out infinite">
          </div>
          
          <!-- Основная точка -->
          <div class="relative ${sizeClass} bg-gradient-to-b from-cyan-400 to-cyan-800 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-200 group-hover:scale-125 group-hover:shadow-xl z-10">
            <div class="${dotSizeClass} bg-white/90 rounded-full"></div>
          </div>
          
          <!-- Подсказка -->
          ${showTooltip ? `
            <div class="absolute bottom-full mb-2 px-2 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg text-xs font-semibold text-cyan-900 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none border border-cyan-100 max-w-[140px] truncate">
              <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-l border-t border-cyan-100"></div>
              ${estate.name}
            </div>
          ` : ''}
        </div>
      `;
      
      const marker = new window.ymaps3.YMapMarker({ coordinates: coords }, el);

      el.onclick = (e) => {
        e.stopPropagation();
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