// src/components/Map.jsx — с разворачиваемыми подсказками
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Map = ({ estates = [], center = [41.65, 41.63], zoom = 11 }) => {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHint, setShowHint] = useState(localStorage.getItem('mapHintShown') !== 'true');
  const [showLegend, setShowLegend] = useState(false);
  const markersRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();


  console.log('Map component MOUNTING', Date.now());
  useEffect(() => {
    console.log('Map mounted');
    return () => console.log('Map UNMOUNTING');
  }, []);

  // Ценовые диапазоны для Аджарии (в долларах)
  const PRICE_LEVELS = [
    { label: 'Бюджетные', min: 30000, max: 80000, color: 'from-green-400 to-emerald-600', text: 'text-green-600' },
    { label: 'Средние', min: 80001, max: 150000, color: 'from-cyan-400 to-blue-600', text: 'text-blue-600' },
    { label: 'Премиум', min: 150001, max: 250000, color: 'from-orange-400 to-red-600', text: 'text-orange-600' },
    { label: 'Люкс', min: 250001, max: Infinity, color: 'from-purple-500 to-pink-600', text: 'text-purple-600' }
  ];

  // Получаем цвет маркера на основе цены
  const getMarkerColor = (price) => {
    const level = PRICE_LEVELS.find(l => price <= l.max);
    return level ? level.color : PRICE_LEVELS[0].color;
  };

  // Получаем текстовый цвет для цены
  const getPriceTextColor = (price) => {
    const level = PRICE_LEVELS.find(l => price <= l.max);
    return level ? level.text : PRICE_LEVELS[0].text;
  };

  // Получаем метку ценового диапазона
  const getPriceLabel = (price) => {
    const level = PRICE_LEVELS.find(l => price <= l.max);
    return level ? level.label : 'Бюджетные';
  };

  // Функция для получения минимальной цены объекта
  const getMinPrice = (estate) => {
    if (estate.minPrice) return estate.minPrice;
    if (estate.price_usd) return estate.price_usd;
    
    if (estate.blocks) {
      let minPrice = Infinity;
      Object.values(estate.blocks).forEach(block => {
        if (block.apartment_types) {
          Object.values(block.apartment_types).forEach(type => {
            if (type.apartments) {
              type.apartments.forEach(apt => {
                if (apt.price_usd && apt.price_usd < minPrice) {
                  minPrice = apt.price_usd;
                }
              });
            }
          });
        }
      });
      return minPrice !== Infinity ? minPrice : 50000;
    }
    
    return 50000;
  };

  // Функции для преобразования координат
  const toYandexCoords = (coords) => {
    if (!coords || coords.length !== 2) return [41.64, 41.65];
    return [coords[1], coords[0]];
  };

  const toYandexCenter = (coords) => {
    if (!coords || coords.length !== 2) return [41.64, 41.65];
    return [coords[0], coords[1]];
  };

  // Сохраняем, что подсказка была показана
  useEffect(() => {
    if (showHint) {
      const timer = setTimeout(() => {
        setShowHint(false);
        localStorage.setItem('mapHintShown', 'true');
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [showHint]);

  // === ИНИЦИАЛИЗАЦИЯ КАРТЫ ===
  useEffect(() => {
    if (!window.ymaps3 || !mapRef.current) return;

    const init = async () => {
      await window.ymaps3.ready;
      const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = window.ymaps3;

      const map = new YMap(mapRef.current, {
        location: { center: [41.64, 41.65], zoom: 10 }
      });

      map.addChild(new YMapDefaultSchemeLayer());
      map.addChild(new YMapDefaultFeaturesLayer());

      setMapInstance(map);
      setIsLoading(false);
    };

    init();

    return () => {
      if (mapInstance) mapInstance.destroy();
    };
  }, []);

  // === ОСНОВНОЙ ЭФФЕКТ ДЛЯ ОБНОВЛЕНИЯ КАРТЫ И МАРКЕРОВ ===
  useEffect(() => {
    if (!mapInstance) return;

    const yCenter = toYandexCenter(center);
    const targetZoom = location.pathname.includes('/apartment/') ? 18 : 
                       location.pathname.includes('/estate/') ? 17 : 
                       location.pathname.includes('/district/') ? 14 : 
                       zoom;

    mapInstance.setLocation({
      center: yCenter,
      zoom: targetZoom,
      duration: 900
    });
    
    markersRef.current.forEach(m => mapInstance.removeChild(m));
    markersRef.current = [];
    
    if (estates.length > 0) {
      setTimeout(() => {
        estates.forEach((estate) => {
          let coords;
          if (estate.coords) {
            coords = toYandexCoords(estate.coords);
          } else if (estate.latitude && estate.longitude) {
            coords = [estate.longitude, estate.latitude];
          } else {
            return;
          }

          const el = document.createElement('div');
          el.className = 'relative cursor-pointer transform transition-all duration-200 hover:scale-125 hover:z-50';
          
          const isApartmentPage = location.pathname.includes('/apartment/');
          const isSingleEstatePage = location.pathname.includes('/estate/') && estates.length === 1;
          const isSingleApartmentPage = isApartmentPage && estates.length === 1;
          
          const price = getMinPrice(estate);
          const markerColor = getMarkerColor(price);
          const priceTextColor = getPriceTextColor(price);
          const priceLabel = getPriceLabel(price);
          const formattedPrice = price !== Infinity ? `$${price.toLocaleString()}` : 'Цена по запросу';
          const displayName = estate.name || estate.estateName || 'Объект недвижимости';
          
          if (isSingleApartmentPage) {
            el.innerHTML = `
              <style>
                @keyframes apartment-pulse {
                  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.7); }
                  70% { transform: scale(1.15); box-shadow: 0 0 0 15px rgba(147, 51, 234, 0); }
                  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(147, 51, 234, 0); }
                }
                .apartment-pulse {
                  animation: apartment-pulse 2s infinite;
                }
              </style>
              <div class="relative">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full border-3 border-white shadow-2xl flex items-center justify-center apartment-pulse">
                  <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl text-sm font-bold text-gray-900 whitespace-nowrap pointer-events-none z-50 border border-rose-200 min-w-max">
                  <div class="font-bold">${displayName}</div>
                  <div class="text-xs text-purple-600 font-semibold">${formattedPrice}</div>
                  <div class="text-xs text-gray-500">Ваш апартамент</div>
                  <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white/95 rotate-45 border-l border-t border-gray-200"></div>
                </div>
              </div>
            `;
          } else if (isSingleEstatePage) {
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
                <div class="w-8 h-8 bg-gradient-to-br ${markerColor} rounded-full border-3 border-white shadow-2xl flex items-center justify-center estate-pulse">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg text-sm font-semibold text-gray-900 whitespace-nowrap pointer-events-none z-50 border border-rose-200 min-w-max">
                  <div class="font-bold">${displayName}</div>
                  <div class="text-xs ${priceTextColor} font-semibold">от ${formattedPrice}</div>
                  <div class="text-xs text-gray-500">${priceLabel}</div>
                  <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white/95 rotate-45 border-l border-t border-gray-200"></div>
                </div>
              </div>
            `;
          } else {
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
                <div class="w-6 h-6 bg-gradient-to-br ${markerColor} rounded-full border-2 border-white shadow-lg flex items-center justify-center gentle-pulse">
                  <div class="w-2 h-2 bg-white rounded-full opacity-90"></div>
                </div>
                
                <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-white/95 backdrop-blur-sm rounded-md shadow-md text-xs font-medium text-gray-800 whitespace-nowrap pointer-events-none z-40 border border-rose-200 min-w-max">
                  <div class="font-semibold">${displayName.length > 20 ? displayName.slice(0, 18) + '...' : displayName}</div>
                  <div class="text-xs ${priceTextColor} font-semibold">${formattedPrice}</div>
                  <!-- <div class="text-xs text-gray-500">${priceLabel}</div> -->
                  <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/95 rotate-45 border-l border-t border-gray-200"></div>
                </div>
                
                <div class="absolute -inset-3 bg-cyan-300/10 rounded-full opacity-0 transition-opacity duration-200 pointer-events-none click-effect"></div>
              </div>
            `;
          }
          
          const marker = new window.ymaps3.YMapMarker({ coordinates: coords }, el);

          el.onclick = (e) => {
            e.stopPropagation();
            const clickEffect = el.querySelector('.click-effect');
            if (clickEffect) {
              clickEffect.style.opacity = '1';
              setTimeout(() => {
                clickEffect.style.opacity = '0';
              }, 300);
            }
            
            if (isApartmentPage || isSingleEstatePage || isSingleApartmentPage) {
              return;
            }
            
            if (estate.apartment_id) {
              navigate(`/apartment/${estate.apartment_id}`);
            } else if (estate.district && estate.name) {
              navigate(`/estate/${estate.district}/${encodeURIComponent(estate.name)}`);
            }
          };

          mapInstance.addChild(marker);
          markersRef.current.push(marker);
        });
      }, 100);
    }
  }, [mapInstance, center, zoom, location.pathname, estates, navigate]);

  const handleRecenter = () => {
    if (!mapInstance) return;
    
    let targetZoom;
    if (location.pathname.includes('/apartment/')) {
      targetZoom = 18;
    } else if (location.pathname.includes('/estate/')) {
      targetZoom = 17;
    } else if (location.pathname.includes('/district/')) {
      targetZoom = 14;
    } else {
      targetZoom = 11;
    }
    
    const yCenter = toYandexCenter(center);
    mapInstance.setLocation({
      center: yCenter,
      zoom: targetZoom,
      duration: 800
    });
  };
  
  return (
    <div className="relative w-full h-64 rounded-none shadow-2xl border-1 border-rose-200">
      {isLoading && (
        <div className="absolute inset-0 bg-orange-50/95 flex items-center justify-center z-20">
          <span className="text-orange-800 font-bold text-lg">Загрузка карты Аджарии...</span>
        </div>
      )}

      {showHint && !isLoading && (
        <div className="absolute top-1 left-4 right-4 bg-rose-700/80 text-white text-sm text-center px-2 py-1 rounded-b-xl z-20 animate-pulse shadow-lg">
          Карта интерактивна — кликайте на объекты и маркеры!
        </div>
      )}

      {/* Легенда/подсказка по цветам */}
      <div className="absolute top-2 left-5 z-10">
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="bg-white/90 backdrop-blur-sm rounded-b-md shadow-lg px-2 py-1 text-xs font-medium text-orange-800 border-rose-300 hover:bg-white transition-all flex items-center gap-1"
          title="Показать легенду"
        >
          <svg className={`w-4 h-4 transition-transform ${showLegend ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>Легенда</span>
        </button>
        
        {showLegend && (
          // <div className="absolute left-12 top-0 z-50">
          <div className="map-legend">
            <div className="mt-1 bg-white/80 backdrop-blur-sm rounded-md shadow-xl p-4 w-56 border border-rose-300 animate-slideDown">
              <h3 className="font-bold text-gray-800 mb-3 text-xs">Цвета объектов по цене:</h3>
              
              <div className="space-y-2">
                {PRICE_LEVELS.map((level, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${level.color} border border-white shadow-sm`}></div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-800">{level.label}</div>
                      <div className="text-xs text-cyan-600">
                        {level.max === Infinity 
                          ? `от $${level.min.toLocaleString()}+` 
                          : `$${level.min.toLocaleString()} – $${level.max.toLocaleString()}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-rose-200">
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 border border-white"></div>
                    <span>Апартамент — ваш выбор</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border border-white animate-gentle-pulse"></div>
                    <span>Пульсация — объекты активны</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                <p>💡 <strong>Совет:</strong> кликайте на маркеры для перехода к объектам</p>
              </div>
            </div>
          </div>
        )}
      </div>

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