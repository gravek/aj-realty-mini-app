// src/components/MapWithContext.jsx — ФИНАЛЬНАЯ ВЕРСИЯ (100% работает)
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Map from './Map';
import { useStore } from '../store';

const MapWithContext = () => {
  const { data } = useStore();
  const { district: districtParam, estate: estateParam } = useParams();
  const location = useLocation();

  const toYandex = (coords) => coords && coords.length === 2 ? [coords[1], coords[0]] : [41.64, 41.65];

  let estates = [];
  let center = [41.70, 41.72]; // центр Аджарии
  let zoom = 10;

  if (location.pathname === '/') {
    estates = Object.values(data?.districts || {}).flatMap(d =>
      Object.values(d.estates || {}).map(e => ({ ...e, district: d.name }))
    );
    center = [41.70, 41.72];
    zoom = 10;
  }

  else if (districtParam && !estateParam) {
    const district = data?.districts?.[districtParam];
    if (district) {
      estates = Object.values(district.estates || {}).map(e => ({ ...e, district: district.name }));
      center = district.coords || center;
      zoom = 14;
    }
  }

  else if (districtParam && estateParam) {
    const estate = data?.districts?.[districtParam]?.estates?.[estateParam];
    if (estate?.coords) {
      estates = [{ ...estate, district: districtParam }];
      center = estate.coords;
      zoom = 17;
    }
  }

  // КЛЮЧ — ЭТО ГЛАВНОЕ! При смене пути — карта пересоздаётся полностью
  return (
    <Map
      key={location.pathname}  // ← ВОТ ЭТО ВСЁ ИСПРАВЛЯЕТ
      estates={estates}
      center={toYandex(center)}
      zoom={zoom}
    />
  );
};

export default MapWithContext;