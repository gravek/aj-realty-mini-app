import React, { useEffect, useState } from 'react';
import { useStore } from '../store';  // Твои данные с coords

const Map = ({ center = [41.65, 41.63], zoom = 12, estates = [] }) => {  // estates — метки из data
  const [map, setMap] = useState(null);
  const [YMap, setYMap] = useState(null);  // Динамически импортируем компоненты

  useEffect(() => {
    const initMap = async () => {
      await window.ymaps3.ready;  // Ждём загрузки SDK
      if (window.YMAPS_KEY) {
        await window.ymaps3.import('@yandex/ymaps3', { apikey: window.YMAPS_KEY });
      }

      const { YMap: YMapComp, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = window.ymaps3;
      setYMap({ YMapComp, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker });

      // Создаём карту
      const mapInstance = new YMapComp(document.getElementById('map'), {
        location: { center, zoom },
      });
      mapInstance.addChild(new YMapDefaultSchemeLayer({}));
      mapInstance.addChild(new YMapDefaultFeaturesLayer({}));

      // Добавляем метки для estates (из objects.json)
      estates.forEach(estate => {
        if (estate.coords) {
          const marker = new YMapMarker(
            { coordinates: estate.coords },
            new ymaps3.YMapMarkerDefaultAppearance({ coordinates: estate.coords })  // Или кастомный пин
          );
          marker.events.add('click', () => {
            // Deep-link на estate, например: window.location.href = `/estate/${estate.district}/${estate.name}`;
            alert(`Открываем ${estate.name}`);  // Заглушка для роутинга
          });
          mapInstance.addChild(marker);
        }
      });

      setMap(mapInstance);
    };

    initMap();

    return () => {
      if (map) map.destroy();
    };
  }, [center, zoom, estates]);

  if (!YMap) return <div className="h-64 bg-gray-200 flex items-center justify-center">Загрузка карты...</div>;

  const { YMapComp, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer } = YMap;

  return (
    <div id="map" className="h-64 w-full rounded-lg overflow-hidden" />  // Контейнер для карты
  );
};

export default Map;