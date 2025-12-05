// src/components/MapWithContext.jsx — useLocation
import React from 'react';
import { useLocation } from 'react-router-dom';
import Map from './Map';
import { useStore } from '../store';

const MapWithContext = () => {
  const { data } = useStore();
  const location = useLocation();

  // Парсим путь вручную
  const pathParts = location.pathname.split('/').filter(Boolean);
  
  const toYandex = (coords) => coords && coords.length === 2 ? [coords[1], coords[0]] : [41.64, 41.65];

  let estates = [];
  let center = [41.70, 41.72]; // центр Аджарии
  let zoom = 10;

  if (location.pathname === '/') {
    // Главная страница
    estates = Object.values(data?.districts || {}).flatMap(d =>
      Object.values(d.estates || {}).map(e => ({ ...e, district: d.name }))
    );
    center = [41.70, 41.72];
    zoom = 10;
  }
  else if (pathParts[0] === 'district' && pathParts.length === 2) {
    // Страница района: /district/Kobuleti
    const districtName = decodeURIComponent(pathParts[1]);
    const district = data?.districts?.[districtName];
    
    if (district) {
      estates = Object.values(district.estates || {}).map(e => ({ ...e, district: district.name }));
      center = district.coords || center;
      zoom = 14;
    }
  }
  else if (pathParts[0] === 'estate' && pathParts.length === 3) {
    // Страница объекта: /estate/Kobuleti/Coastline%20Kobuleti
    const districtName = decodeURIComponent(pathParts[1]);
    const estateName = decodeURIComponent(pathParts[2]);
    const estate = data?.districts?.[districtName]?.estates?.[estateName];
    
    if (estate?.coords) {
      estates = [{ ...estate, district: districtName }];
      center = estate.coords;
      zoom = 17;
    }
  }

  return (
    <Map
      // key={location.pathname}
      // key={`${estates.length}-${zoom}`}
      key="main-map"
      estates={estates}
      center={toYandex(center)}
      zoom={zoom}
    />
  );
};

export default MapWithContext;