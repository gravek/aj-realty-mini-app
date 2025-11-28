// src/components/MapWithContext.jsx
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Map from './Map';
import { useStore } from '../store';

const MapWithContext = () => {
  const { data } = useStore();
  const { district: districtParam, estate: estateParam } = useParams();
  const location = useLocation();

  // Главная — все комплексы
  if (location.pathname === '/') {
    const allEstates = Object.values(data?.districts || {}).flatMap(d =>
      Object.values(d.estates || {}).map(e => ({ ...e, district: d.name }))
    );
    return <Map estates={allEstates} center={[41.65, 41.63]} zoom={10} />;
  }

  // Район
  if (districtParam && !estateParam) {
    const district = data?.districts?.[districtParam];
    if (!district) return <div className="h-64 bg-gray-100 rounded-lg" />;
    const estatesInDistrict = Object.values(district.estates || {}).map(e => ({
      ...e,
      district: district.name
    }));
    return <Map estates={estatesInDistrict} center={district.coords || [41.65, 41.63]} zoom={13} />;
  }

  // Конкретный комплекс
  if (districtParam && estateParam) {
    const estate = data?.districts?.[districtParam]?.estates?.[estateParam];
    if (!estate || !estate.coords) return <div className="h-64 bg-gray-100 rounded-lg" />;
    return <Map estates={[{ ...estate, district: districtParam }]} center={estate.coords} zoom={16} />;
  }

  // По умолчанию
  return <Map estates={[]} center={[41.65, 41.63]} zoom={11} />;
};

export default MapWithContext;