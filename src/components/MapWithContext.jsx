// src/components/MapWithContext.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import Map from './Map';
import { useStore } from '../store';

const MapWithContext = () => {
  const { data } = useStore();
  const location = useLocation();

  // Парсим путь вручную
  const pathParts = location.pathname.split('/').filter(Boolean);
  
  let estates = [];
  let center = [41.70, 41.72]; // центр Аджарии
  let zoom = 11;

  if (location.pathname === '/' || location.pathname === '/districts') {
  // if (location.pathname === '/') {
    // Главная страница
    estates = Object.values(data?.districts || {}).flatMap(d =>
      Object.values(d.estates || {}).map(e => ({ 
        ...e, 
        district: d.name,
        minPrice: Math.min(...Object.values(e.blocks || {})
          .flatMap(b => Object.values(b.apartment_types || {}))
          .flatMap(t => t.apartments?.map(a => a.price_usd) || [Infinity]))
      }))
    );
    center = [41.70, 41.72];
    zoom = 11;
  }
  else if (pathParts[0] === 'district' && pathParts.length === 2) {
    // Страница района: /district/Kobuleti
    const districtName = decodeURIComponent(pathParts[1]);
    const district = data?.districts?.[districtName];
    
    if (district) {
      estates = Object.values(district.estates || {}).map(e => ({ 
        ...e, 
        district: district.name,
        minPrice: Math.min(...Object.values(e.blocks || {})
          .flatMap(b => Object.values(b.apartment_types || {}))
          .flatMap(t => t.apartments?.map(a => a.price_usd) || [Infinity]))
      }));
      center = district.coords || center;
      zoom = 14;
    }
  }
  else if (pathParts[0] === 'estate' && pathParts.length === 3) {
    // Страница объекта: /estate/Kobuleti/Coastline%20Kobuleti
    const districtName = decodeURIComponent(pathParts[1]);
    const estateName = decodeURIComponent(pathParts[2]);
    const estate = data?.districts?.[districtName]?.estates?.[estateName];
    
    if (estate) {
      estates = [{ 
        ...estate, 
        district: districtName,
        minPrice: Math.min(...Object.values(estate.blocks || {})
          .flatMap(b => Object.values(b.apartment_types || {}))
          .flatMap(t => t.apartments?.map(a => a.price_usd) || [Infinity]))
      }];
      center = estate.coords || center;
      zoom = 17;
    }
  }
  else if (pathParts[0] === 'apartment' && pathParts.length === 2) {
    // Страница апартамента: /apartment/53dcf3ef
    const apartmentId = pathParts[1];
    // console.log('Looking for apartment:', apartmentId);
    
    // Ищем апартамент по всему дереву
    for (const districtKey of Object.keys(data?.districts || {})) {
      const district = data.districts[districtKey];
      for (const estateKey of Object.keys(district?.estates || {})) {
        const estate = district.estates[estateKey];
        for (const blockKey of Object.keys(estate?.blocks || {})) {
          const block = estate.blocks[blockKey];
          for (const typeKey of Object.keys(block?.apartment_types || {})) {
            const type = block.apartment_types[typeKey];
            const apartment = type.apartments?.find(a => a.apartment_id === apartmentId);
            
            if (apartment) {
              // console.log('Found apartment:', apartment);
              // console.log('Apartment coords:', apartment.coords);
              // console.log('Estate coords:', estate.coords);
              // console.log('District coords:', district.coords);
              
              // Приоритет координат: апартамент > объект > район
              const coords = apartment.coords || estate.coords || district.coords;
              console.log('Selected coords:', coords);
              
              estates = [{
                ...apartment,
                name: `Апартамент ${apartment.apartment_id}`,
                estateName: estate.name,
                district: district.name,
                price_usd: apartment.price_usd,
                coords: coords, // Важно: передаем найденные координаты
                m2: apartment.m2,
                finishing: apartment.finishing
              }];
              
              center = coords || center;
              zoom = 18;
              console.log('Final estates:', estates);
              console.log('Final center:', center);
              break;
            }
          }
          if (estates.length > 0) break;
        }
        if (estates.length > 0) break;
      }
      if (estates.length > 0) break;
    }
    
    if (estates.length === 0) {
      console.log('Apartment not found:', apartmentId);
    }
  }

  console.log('MapWithContext returning:', { 
    estatesCount: estates.length, 
    center, 
    zoom,
    path: location.pathname 
  });

  return (
    <Map
      key={location.pathname}
      estates={estates}
      center={center}
      zoom={zoom}
    />
  );
};

export default MapWithContext;