// src/components/MapWithContext.jsx — с отладкой
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Map from './Map';
import { useStore } from '../store';

const MapWithContext = () => {
  const { data } = useStore();
  const { district: districtParam, estate: estateParam } = useParams();
  const location = useLocation();

  console.log('=== MapWithContext DEBUG ===');
  console.log('pathname:', location.pathname);
  console.log('districtParam:', districtParam);
  console.log('estateParam:', estateParam);
  console.log('data:', data);

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
    console.log('Home page: center', center);
  }

  else if (districtParam && !estateParam) {
    const decodedDistrict = decodeURIComponent(districtParam);
    const district = data?.districts?.[decodedDistrict];
    console.log('District page: decodedDistrict', decodedDistrict, 'district', district);
    
    if (district) {
      estates = Object.values(district.estates || {}).map(e => ({ ...e, district: district.name }));
      center = district.coords || center;
      zoom = 14;
      console.log('District coords:', district.coords);
    }
  }

  else if (districtParam && estateParam) {
    const decodedDistrict = decodeURIComponent(districtParam);
    const decodedEstate = decodeURIComponent(estateParam);
    const estate = data?.districts?.[decodedDistrict]?.estates?.[decodedEstate];
    console.log('Estate page: decodedDistrict', decodedDistrict, 'decodedEstate', decodedEstate, 'estate', estate);
    
    if (estate?.coords) {
      estates = [{ ...estate, district: decodedDistrict }];
      center = estate.coords;
      zoom = 17;
      console.log('Estate coords:', estate.coords);
    } else {
      console.log('Estate NOT FOUND or no coords');
    }
  }

  console.log('Final center:', center, 'zoom:', zoom);
  console.log('=== END DEBUG ===');

  return (
    <Map
      key={location.pathname}
      estates={estates}
      center={toYandex(center)}
      zoom={zoom}
    />
  );
};

export default MapWithContext;