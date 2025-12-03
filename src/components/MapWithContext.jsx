// src/components/MapWithContext.jsx — РАБОЧАЯ ВЕРСИЯ
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Map from './Map';
import { useStore } from '../store';

const MapWithContext = () => {
  const { data } = useStore();
  const { district: districtParam, estate: estateParam } = useParams();
  const location = useLocation();

  // КОНВЕРТАЦИЯ [lat, lng] → [lng, lat] — ЭТО ГЛАВНОЕ!
  const toYandexCoords = (coords) => {
    if (!coords || coords.length !== 2) return null;
    return [coords[0], coords[1]]; // ← ВОТ ЭТО КЛЮЧЕВОЕ!
  };

  // Главная страница — весь регион
  if (location.pathname === '/') {
    const allEstates = Object.values(data?.districts || {}).flatMap(d =>
      Object.values(d.estates || {}).map(e => ({ ...e, district: d.name }))
    );
    return (
      <Map
        estates={allEstates}
        center={toYandexCoords([41.70, 41.72])} // центр Аджарии
        zoom={10}
      />
    );
  }

  // Район
  if (districtParam && !estateParam) {
    const district = data?.districts?.[districtParam];
    if (!district || !district.coords) {
      return <Map estates={[]} center={toYandexCoords([41.65, 41.63])} zoom={11} />;
    }

    const estatesInDistrict = Object.values(district.estates || {}).map(e => ({
      ...e,
      district: district.name
    }));

    return (
      <Map
        estates={estatesInDistrict}
        center={toYandexCoords(district.coords)}
        zoom={14}
      />
    );
  }

  // Конкретный комплекс
  if (districtParam && estateParam) {
    const estate = data?.districts?.[districtParam]?.estates?.[estateParam];
    if (!estate || !estate.coords) {
      return <Map estates={[]} center={toYandexCoords([41.65, 41.63])} zoom={11} />;
    }

    return (
      <Map
        estates={[{ ...estate, district: districtParam }]}
        center={toYandexCoords(estate.coords)}
        zoom={17}
      />
    );
  }

  // По умолчанию
  return <Map estates={[]} center={toYandexCoords([41.65, 41.63])} zoom={11} />;
};

export default MapWithContext;