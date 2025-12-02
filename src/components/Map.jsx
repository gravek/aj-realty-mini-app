import React, { useEffect, useRef, useState } from 'react';

const Map = () => {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Проверяем, загружена ли библиотека
    if (!window.ymaps3) {
      setError('Библиотека Яндекс Карт не загружена');
      setIsLoading(false);
      return;
    }

    const initMap = async () => {
      try {
        // Ждем готовности API
        await window.ymaps3.ready;
        
        const { YMap, YMapDefaultSchemeLayer } = window.ymaps3;
        
        // Создаем карту
        const map = new YMap(
          mapRef.current,
          {
            location: {
              center: [41.6536, 41.6416], // Пример: Батуми
              zoom: 12
            }
          }
        );
        
        // Добавляем слой
        map.addChild(new YMapDefaultSchemeLayer());
        
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
        // Если в API есть метод destroy
        if (mapInstance.destroy) {
          mapInstance.destroy();
        }
        setMapInstance(null);
      }
    };
  }, []);

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Ошибка загрузки карты: {error}
        <br />
        Проверьте:
        <ul>
          <li>Подключен ли скрипт в index.html</li>
          <li>Корректность API-ключа</li>
          <li>Настройки ограничений для домена</li>
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