// src/components/Apartment.jsx
import React, { useEffect, useState } from 'react';  // useMemo НЕ нужен
import { useParams } from 'react-router-dom';
import { useStore } from '../store';
import PhotoGalleryModal from './PhotoGalleryModal';  // ← добавь импорт

export default function Apartment() {
  const { id } = useParams();
  const { data } = useStore();
  const [apartment, setApartment] = useState(null);
  const [parentEstate, setParentEstate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!data) return;

    // ← твой оригинальный поиск апартамента — полностью без изменений
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
              setParentEstate(estate); // ← сохраняем весь estate
              return;
            }
          }
        }
      }
    }
  }, [data, id]);

  if (!apartment) return <div className="p-8 text-center">Апартамент не найден</div>;

  // ← Считаем наличие фото без хуков (обычная функция)
  const hasApartmentPhotos = (() => {
    let count = 0;
    const countPhotos = (obj) => {
      if (!obj) return;
      ['sketch', 'example', 'specific'].forEach(t => {
        count += (obj[t] || []).filter(p => p.url).length;
      });
    };
    countPhotos(apartment.photos);  // фото самого апартамента

    // Если нужно учитывать фото типа/блока/ЖК — модалка и так их подтянет через data,
    // но для показа кнопки достаточно хотя бы одного фото на уровне apartment
    return count > 0;
  })();


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{apartment.estateName}</h1>
      {apartment.estatePhoto && (
        <img src={apartment.estatePhoto} alt={apartment.estateName} className="w-full h-64 object-cover rounded-2xl" />
      )}
      <div className="bg-white p-6 rounded-2xl shadow">
        <p className="text-4xl font-bold text-cyan-600">${apartment.price_usd.toLocaleString()}</p>
        <p className="text-xl mt-2">{apartment.m2} м² • {apartment.finishing}</p>
        <p className="text-gray-600 mt-4">Этаж: {apartment.floor} • {apartment.specifications || ''}</p>
      </div>

      {/* ← Кнопка галереи — только если есть фото */}
      {/* Кнопка всегда видна, если апартамент найден */}
      {apartment && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-orange-600 bg-gradient-to-r from-orange-600 to-rose-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition"
        >
          📸 Показать фото для апартамента
        </button>
      )}

      {/* Модалка — передаём найденный estate, если он есть */}
      <PhotoGalleryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entity={parentEstate || apartment}   // приоритет — estate, если найден
        entityType="estate"                  // всегда как estate — надёжно собирает всё
      />

      <button 
        onClick={() => window.Telegram?.WebApp?.openTelegramLink('https://t.me/a4k5o6')}
        className="w-full bg-cyan-600 text-white py-4 rounded-xl font-bold text-lg"
      >
        Написать менеджеру
      </button>

      {/* ← Модалка */}
      {/* <PhotoGalleryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entity={apartment}
        entityType="estate"  // ← estate, block, apartment (на выбор)
      /> */}
    </div>
  );
}