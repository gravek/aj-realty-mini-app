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

  // Функции для преобразования координат
  // Яндекс Карты 3.0 использует [долгота, широта] = [lng, lat]
  // Если ваши координаты из веб-версии - это [широта, долгота] = [lat, lng]
  const toYandexCoords = (coords) => {
    if (!coords || coords.length !== 2) return [41.64, 41.65];
    // Если пришли [lat, lng] -> преобразуем в [lng, lat]
    return [coords[1], coords[0]];
  };

  const toYandexCenter = (coords) => {
    if (!coords || coords.length !== 2) return [41.64, 41.65];
    // Для center используем тот же порядок, что и в координатах объектов
    return [coords[1], coords[0]];
  };

  // === ИНИЦИАЛИЗАЦИЯ КАРТЫ ОДИН РАЗ ===
  useEffect(() => {
    if (!window.ymaps3 || !mapRef.current) return;

    const init = async () => {
      await window.ymaps3.ready;
      const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = window.ymaps3;

      // Создаём карту с начальными координатами Аджарии [lng, lat]
      const map = new YMap(mapRef.current, {
        location: { center: [41.64, 41.65], zoom: 10 }
      });

      map.addChild(new YMapDefaultSchemeLayer());
      map.addChild(new YMapDefaultFeaturesLayer());

      setMapInstance(map);
      setIsLoading(false);

      setTimeout(() => setShowHint(false), 5000);
    };

    init();

    return () => {
      if (mapInstance) mapInstance.destroy();
    };
  }, []);

  // === ОСНОВНОЙ ЭФФЕКТ ДЛЯ ОБНОВЛЕНИЯ КАРТЫ И МАРКЕРОВ ===
  useEffect(() => {
    if (!mapInstance) return;

    console.log('=== ОБНОВЛЕНИЕ КАРТЫ ===');
    console.log('estates:', estates.length, 'items');
    console.log('center from props:', center);
    console.log('location.pathname:', location.pathname);

    const yCenter = toYandexCenter(center);
    const targetZoom = location.pathname.includes('/estate') ? 17 : location.pathname.includes('/district') ? 14 : zoom;
    
    console.log('Setting center to:', yCenter, 'zoom:', targetZoom);

    // Устанавливаем центр и зум
    mapInstance.setLocation({
      center: yCenter,
      zoom: targetZoom,
      duration: 900
    });
    
    // Очищаем старые маркеры
    markersRef.current.forEach(m => mapInstance.removeChild(m));
    markersRef.current = [];
    
    // Создаем новые маркеры
    if (estates.length > 0) {
      console.log('Creating markers for', estates.length, 'estates');
      
      // Небольшая задержка для анимации
      setTimeout(() => {
        estates.forEach((estate, index) => {
          if (!estate.coords) {
            console.log('No coordinates for estate:', estate.name);
            return;
          }
          
          const coords = toYandexCoords(estate.coords);
          console.log(`Estate "${estate.name}":`, estate.coords, '->', coords);

          const el = document.createElement('div');
          el.className = 'relative cursor-pointer transform transition-transform hover:scale-125';
          
          // Определяем, показывать ли название
          // Для отладки: всегда показывать название
          const shouldShowName = targetZoom >= 12; // Уменьшил порог с 14 до 12
          
          // Для страницы объекта (один объект) всегда показываем название
          const isSingleEstatePage = location.pathname.includes('/estate/') && estates.length === 1;
          
          // Разные стили маркеров в зависимости от контекста
          if (isSingleEstatePage) {
            // Увеличенный маркер для страницы объекта
            el.innerHTML = `
              <style>
                @keyframes estate-pulse {
                  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.7); }
                  70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(6, 182, 212, 0); }
                  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
                }
                .estate-pulse {
                  animation: estate-pulse 2s infinite;
                }
              </style>
              <div class="relative">
                <div class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-900 rounded-full border-3 border-white shadow-2xl flex items-center justify-center estate-pulse">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg text-sm font-semibold text-gray-900 whitespace-nowrap pointer-events-none z-50 border border-gray-200">
                  ${estate.name}
                  <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white/95 rotate-45 border-l border-t border-gray-200"></div>
                </div>
              </div>
            `;
          } else {
            // Обычный маркер для списка объектов
            el.innerHTML = `
              <style>
                @keyframes gentle-pulse {
                  0% { transform: scale(1); opacity: 0.9; }
                  50% { transform: scale(1.15); opacity: 1; }
                  100% { transform: scale(1); opacity: 0.9; }
                }
                .gentle-pulse {
                  animation: gentle-pulse 2s ease-in-out infinite;
                }
              </style>
              <div class="relative">
                <div class="w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-800 rounded-full border-2 border-white shadow-lg flex items-center justify-center gentle-pulse">
                  <div class="w-2 h-2 bg-white rounded-full opacity-90"></div>
                </div>
                
                ${shouldShowName ? `
                  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-white/95 backdrop-blur-sm rounded-md shadow-md text-xs font-medium text-gray-800 whitespace-nowrap pointer-events-none z-50 border border-gray-200">
                    ${estate.name.length > 16 ? estate.name.slice(0, 14) + '...' : estate.name}
                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/95 rotate-45 border-l border-t border-gray-200"></div>
                  </div>
                ` : ''}
                
                <div class="absolute -inset-2 bg-cyan-300/20 rounded-full opacity-0 transition-opacity duration-200 pointer-events-none click-effect"></div>
              </div>
            `;
          }
          
          const marker = new window.ymaps3.YMapMarker({ coordinates: coords }, el);
          console.log(`Created marker for "${estate.name}" at`, coords);

          el.onclick = (e) => {
            e.stopPropagation();
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
          if (targetZoom < 12 && !isSingleEstatePage) {
            el.addEventListener('mouseenter', () => {
              const tooltip = document.createElement('div');
              tooltip.className = 'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white/95 backdrop-blur-sm rounded-md shadow-md text-xs font-medium text-gray-800 whitespace-nowrap pointer-events-none z-50 border border-gray-200';
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
        
        console.log('Total markers created:', markersRef.current.length);
      }, 150);
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
    
    const yCenter = toYandexCenter(center);
    console.log('Recenter to:', yCenter, 'zoom:', targetZoom);
    
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
        <div className="absolute top-2 left-4 right-4 bg-rose-700/80 text-white text-sm px-4 py-3 rounded-b-xl z-20 animate-pulse shadow-lg">
          Карта интерактивна — двигайте, удерживайте маркеры, кликайте!
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