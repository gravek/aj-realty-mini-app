// src/components/Apartment.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store';
import PhotoGalleryModal from './PhotoGalleryModal';
import { logEvent } from '../utils/analytics';

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


  useEffect(() => {
    if (!apartment) return;

    // Флаг, чтобы не дублировать в StrictMode
    const eventSent = localStorage.getItem(`view_apartment_${id}`);
    if (eventSent) return;

    logEvent('view_apartment', {
      apartment_id: id,
      estate: apartment.estateName,
      district: apartment.districtName,
    });

    // Запоминаем, что событие уже отправлено (на 5 минут, например)
    localStorage.setItem(`view_apartment_${id}`, '1');
    setTimeout(() => localStorage.removeItem(`view_apartment_${id}`), 1 * 60 * 1000);

  }, [apartment, id]);



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
      <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow">
        <p className="text-4xl font-bold text-cyan-600">${apartment.price_usd.toLocaleString()}</p>
        <p className="text-xl mt-2">{apartment.m2} м² • {apartment.finishing} • {apartment.furnished}</p>
        <p className="text-gray-600 mt-4">Этаж: {apartment.floor} • {apartment.ap_specifications || ''}</p>
      </div>

      {/* ← Кнопка галереи — только если есть фото */}
      {/* Кнопка всегда видна, если апартамент найден */}
      {apartment && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-orange-700 bg-gradient-to-r from-orange-600 to-rose-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition"
        >
          📸 Посмотреть фото для апартамента 👀
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
        onClick={() => {
          const key = `logged_ask_elaj_${id}`;
          // if (localStorage.getItem(key)) return; // уже кликали недавно

          logEvent('click_ask_bot', {
            apartment_id: id,
            estate: apartment?.estateName || 'unknown',
            district: apartment?.districtName || 'unknown'
          });

          localStorage.setItem(key, '1');
          setTimeout(() => localStorage.removeItem(key), 60 * 1000); // 1 минута

          window.Telegram?.WebApp?.openTelegramLink('https://t.me/AIRealtyTest_bot');
        }}
        className="w-full bg-teal-700 text-white py-4 rounded-xl font-bold text-lg"
      >
        🤖 Cпросить Эладжа 🪄
      </button>


      <button 
        onClick={() => {
          const key = `logged_ask_elaj_${id}`;
          // if (localStorage.getItem(key)) return; // уже кликали недавно

          logEvent('click_ask_manager', {
            apartment_id: id,
            estate: apartment?.estateName || 'unknown',
            district: apartment?.districtName || 'unknown'
          });

          localStorage.setItem(key, '1');
          setTimeout(() => localStorage.removeItem(key), 60 * 1000); // 1 минута

          window.Telegram?.WebApp?.openTelegramLink('https://t.me/a4k5o6');
        }}
        className="w-full bg-cyan-700 text-white py-4 rounded-xl font-bold text-lg"
      >
        👩🏻‍🦱 Написать менеджеру 📝
      </button>


      {/* <button 
        onClick={() => window.Telegram?.WebApp?.openTelegramLink('https://t.me/a4k5o6')}
        className="w-full bg-cyan-600 text-white py-4 rounded-xl font-bold text-lg"
      >
        👩🏻‍🦱 Написать менеджеру 📝
      </button> */}

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