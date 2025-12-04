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

  // === ВСЕГДА ОБНОВЛЯЕМ ЦЕНТР И ЗУМ И МАРКЕРЫ ===
  useEffect(() => {
    if (!mapInstance) return;

    const yCenter = toYandex(center);
    const targetZoom = location.pathname.includes('/estate') ? 17 : location.pathname.includes('/district') ? 14 : zoom;
    
    console.log('useEffect location.pathname:', location.pathname, 'yCenter:', yCenter, 'targetZoom:', targetZoom);

    // Устанавливаем новое местоположение карты
    mapInstance.setLocation({
      center: yCenter,
      zoom: targetZoom,
      duration: 900
    });
    
    // Удаляем старые маркеры
    markersRef.current.forEach(m => mapInstance.removeChild(m));
    markersRef.current = [];
    
    // Создаем новые маркеры
    if (estates.length > 0) {
      // Небольшая задержка для плавности
      setTimeout(() => {
        estates.forEach(estate => {
          const coords = toYandex(estate.coords);
          if (!coords) return;

          const el = document.createElement('div');
          el.className = 'relative cursor-pointer';
          
          // Определяем, показывать ли название
          const shouldShowName = targetZoom >= 14;
          
          // Для страницы объекта (один объект) всегда показываем название и делаем маркер больше
          const isSingleEstatePage = location.pathname.includes('/estate/') && estates.length === 1;
          
          el.innerHTML = `
            <style>
              @keyframes gentle-pulse {
                0% { transform: scale(1); opacity: 0.9; }
                50% { transform: scale(1.15); opacity: 1; }
                100% { transform: scale(1); opacity: 0.9; }
              }
              @keyframes estate-pulse {
                0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.7); }
                70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(6, 182, 212, 0); }
                100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
              }
              .gentle-pulse {
                animation: gentle-pulse 2s ease-in-out infinite;
              }
              .estate-pulse {
                animation: estate-pulse 2s infinite;
              }
            </style>
            <div class="relative">
              ${isSingleEstatePage ? `
                <!-- Увеличенный маркер для страницы объекта -->
                <div class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-900 rounded-full border-3 border-white shadow-2xl flex items-center justify-center estate-pulse">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <!-- Всегда показываем название для текущего объекта -->
                <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg text-sm font-semibold text-gray-900 whitespace-nowrap pointer-events-none z-50">
                  ${estate.name}
                  <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white/95 rotate-45"></div>
                </div>
              ` : `
                <!-- Обычный маркер для списка объектов -->
                <div class="w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-800 rounded-full border-2 border-white shadow-lg flex items-center justify-center gentle-pulse">
                  <div class="w-2 h-2 bg-white rounded-full opacity-90"></div>
                </div>
                
                ${shouldShowName ? `
                  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-white/95 backdrop-blur-sm rounded-md shadow-md text-xs font-medium text-gray-800 whitespace-nowrap pointer-events-none">
                    ${estate.name.length > 16 ? estate.name.slice(0, 14) + '...' : estate.name}
                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/95 rotate-45"></div>
                  </div>
                ` : ''}
              `}
              
              <div class="absolute -inset-2 bg-cyan-300/20 rounded-full opacity-0 transition-opacity duration-200 pointer-events-none click-effect"></div>
            </div>
          `;
          
          const marker = new window.ymaps3.YMapMarker({ coordinates: coords }, el);

          el.onclick = (e) => {
            const clickEffect = el.querySelector('.click-effect');
            if (clickEffect) {
              clickEffect.style.opacity = '1';
              setTimeout(() => {
                clickEffect.style.opacity = '0';
              }, 300);
            }
            
            if (!isSingleEstatePage) {
              navigate(`/estate/${estate.district}/${encodeURIComponent(estate.name)}`);
            }
          };

          // Hover эффект только при малом зуме и не для одиночной страницы
          if (targetZoom < 14 && !isSingleEstatePage) {
            el.addEventListener('mouseenter', () => {
              const tooltip = document.createElement('div');
              tooltip.className = 'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white/95 backdrop-blur-sm rounded-md shadow-md text-xs font-medium text-gray-800 whitespace-nowrap pointer-events-none z-50';
              tooltip.textContent = estate.name.length > 20 ? estate.name.slice(0, 18) + '...' : estate.name;
              tooltip.id = `tooltip-${estate.name.replace(/\s+/g, '-')}`;
              el.appendChild(tooltip);
            });
            
            el.addEventListener('mouseleave', () => {
              const tooltip = el.querySelector(`#tooltip-${estate.name.replace(/\s+/g, '-')}`);
              if (tooltip) tooltip.remove();
            });
          }

          mapInstance.addChild(marker);
          markersRef.current.push(marker);
        });
      }, 100);
    }
  }, [mapInstance, center, zoom, location.pathname, estates, navigate]);

  // Центрирование по кнопке
  const handleRecenter = () => {
    if (!mapInstance) return;
    
    let targetZoom;
    if (location.pathname.includes('/estate')) {
      targetZoom = 17;
    } else if (location.pathname.includes('/district')) {
      targetZoom = 14;
    } else {
      targetZoom = 11;
    }
    
    const yCenter = toYandex(center);
    mapInstance.setLocation({
      center: yCenter,
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
        <div className="absolute top-4 left-4 right-4 bg-rose-700/80 text-white text-sm px-4 py-3 rounded-b-md z-20 animate-pulse shadow-lg">
          Карта интерактивна — двигайте, приближайте и кликайте!
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