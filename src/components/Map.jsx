import React, { useEffect, useRef, useState } from 'react';

const Map = ({ estates = [], center = [41.6536, 41.6416], zoom = 12 }) => {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Функция для динамической загрузки API с правильным ключом
    const loadYandexMaps = () => {
      return new Promise((resolve, reject) => {
        // Получаем ключ из переменных окружения
        const apiKey = import.meta.env.VITE_YANDEX_MAPS_KEY || '';
        
        if (!apiKey) {
          reject(new Error('API ключ Яндекс Карт не настроен'));
          return;
        }

        // Динамически загружаем API с правильным ключом
        const script = document.createElement('script');
        script.src = `https://api-maps.yandex.ru/v3/?apikey=${apiKey}&lang=ru_RU`;
        script.onload = () => {
          // Загружаем ymaps3 отдельно
          const ymaps3Script = document.createElement('script');
          ymaps3Script.src = 'https://unpkg.com/@yandex/ymaps3-types@0.0.1';
          ymaps3Script.onload = resolve;
          ymaps3Script.onerror = reject;
          document.head.appendChild(ymaps3Script);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initMap = async () => {
      try {
        // Загружаем API
        await loadYandexMaps();
        
        // Проверяем, загружена ли библиотека
        if (!window.ymaps3) {
          throw new Error('Библиотека Яндекс Карт не загружена');
        }

        // Ждем готовности API
        await window.ymaps3.ready;
        
        const { YMap, YMapDefaultSchemeLayer } = window.ymaps3;
        
        // Создаем карту
        const map = new YMap(
          mapRef.current,
          {
            location: {
              center: center,
              zoom: zoom
            }
          }
        );
        
        // Добавляем слой
        map.addChild(new YMapDefaultSchemeLayer());
        
        // Добавляем маркеры для объектов недвижимости
        if (estates.length > 0) {
          const { YMapDefaultMarker } = window.ymaps3;
          
          estates.forEach(estate => {
            if (estate.coords) {
              const marker = new YMapDefaultMarker({
                coordinates: estate.coords,
                title: estate.name,
                subtitle: estate.district || '',
              });
              map.addChild(marker);
            }
          });
        }
        
        setMapInstance(map);
        setIsLoading(false);
      } catch (err) {
        console.error('Ошибка инициализации карты:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initMap();

    // Очистка при размонтировании
    return () => {
      if (mapInstance) {
        if (mapInstance.destroy) {
          mapInstance.destroy();
        }
        setMapInstance(null);
      }
    };
  }, [center, zoom, estates]);

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Ошибка загрузки карты: {error}
        <br />
        Проверьте:
        <ul>
          <li>Переменную окружения VITE_YANDEX_MAPS_KEY в Vercel</li>
          <li>Настройки ограничений для домена в Яндекс.Кабинете разработчика</li>
        </ul>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          Загрузка карты...
        </div>
      )}
      <div 
        ref={mapRef} 
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default Map;