// src/components/Apartment.jsx — автономная версия
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store';

export default function Apartment() {
  const { id } = useParams();
  const { data } = useStore();
  const [apartment, setApartment] = useState(null);

  useEffect(() => {
    if (!data) return;

    // Ищем по всему дереву objects.json
    for (const district of Object.values(data.districts || {})) {
      for (const estate of Object.values(district.estates || {})) {
        for (const block of Object.values(estate.blocks || {})) {
          for (const type of Object.values(block.apartment_types || {})) {
            const found = type.apartments.find(a => a.apartment_id === id);
            if (found) {
              setApartment({
                ...found,
                estateName: estate.name,
                districtName: district.name,
                estatePhoto: estate.photos?.sketch?.[0]?.url || estate.photos?.specific?.[0]?.url
              });
              return;
            }
          }
        }
      }
    }
  }, [data, id]);

  if (!apartment) return <div className="p-8 text-center">Апартамент не найден</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{apartment.estateName}</h1>
      {apartment.estatePhoto && (
        <img src={apartment.estatePhoto} alt={apartment.estateName} className="w-full h-64 object-cover rounded-2xl" />
      )}
      <div className="bg-white p-6 rounded-2xl shadow">
        <p className="text-4xl font-bold text-cyan-600">${apartment.price_usd.toLocaleString()}</p>
        <p className="text-xl mt-2">{apartment.m2} м² • {apartment.finishing}</p>
        <p className="text-gray-600 mt-4">Этаж: {apartment.floor} • {apartment.specifications || '—'}</p>
      </div>
      {/* <button 
        onClick={() => window.Telegram?.WebApp?.openTelegramLink('https://t.me/a4k5o6')}
        className="w-full bg-cyan-600 text-white py-4 rounded-xl font-bold text-lg"
      >
        Написать менеджеру
      </button> */}
    </div>
  );
}