// src/components/Estate.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';
import PhotoGalleryModal from './PhotoGalleryModal';
import { hasPhotos } from '../utils/hasPhotos';
import { logEvent } from '../utils/analytics';

export default function Estate() {
  const { district, estate } = useParams();
  const { data } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('all'); // Фильтр по типу апартаментов
  const [sortOrder, setSortOrder] = useState('asc'); // Сортировка: asc - по возрастанию, desc - по убыванию

  const current = data?.districts?.[district]?.estates?.[estate];
  if (!current) return <div>Комплекс не найден</div>;

  // Получаем все апартаменты с дополнительной информацией
  const allApartments = Object.values(current.blocks || {})
    .flatMap((block) =>
      Object.values(block.apartment_types || {}).flatMap((type) =>
        (type.apartments || []).map((ap) => ({
          ...ap,
          blockId: block.id || block.name,
          blockName: block.name,
          typeId: type.id || type.name,
          typeName: type.name,
        }))
      )
    );

  // Получаем уникальные типы апартаментов для фильтра
  const apartmentTypes = useMemo(() => {
    const types = allApartments.reduce((acc, ap) => {
      if (ap.typeName && !acc.some(t => t.id === ap.typeId)) {
        acc.push({
          id: ap.typeId,
          name: ap.typeName,
        });
      }
      return acc;
    }, []);
    return [{ id: 'all', name: 'Все типы' }, ...types];
  }, [allApartments]);

  // Группируем апартаменты по блокам
  const groupedByBlocks = useMemo(() => {
    const groups = {};
    
    allApartments.forEach(ap => {
      const blockId = ap.blockId;
      if (!groups[blockId]) {
        groups[blockId] = {
          blockName: ap.blockName,
          apartments: [],
        };
      }
      groups[blockId].apartments.push(ap);
    });
    
    return groups;
  }, [allApartments]);

  // Фильтруем и сортируем апартаменты
  const processedBlocks = useMemo(() => {
    const result = {};
    
    Object.entries(groupedByBlocks).forEach(([blockId, blockData]) => {
      // Фильтрация по типу
      let filteredApartments = blockData.apartments;
      if (selectedType !== 'all') {
        filteredApartments = filteredApartments.filter(ap => ap.typeId === selectedType);
      }
      
      // Сортировка по цене
      filteredApartments = [...filteredApartments].sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.price_usd - b.price_usd;
        } else {
          return b.price_usd - a.price_usd;
        }
      });
      
      // Добавляем в результат только если есть отфильтрованные апартаменты
      if (filteredApartments.length > 0) {
        result[blockId] = {
          ...blockData,
          apartments: filteredApartments,
        };
      }
    });
    
    return result;
  }, [groupedByBlocks, selectedType, sortOrder]);

  // Обработчик сброса фильтров
  const handleResetFilters = useCallback(() => {
    setSelectedType('all');
    setSortOrder('asc');
  }, []);

  useEffect(() => {
    if (!current) return;

    const key = `logged_open_estate_${current.name || 'unknown'}`;

    if (localStorage.getItem(key)) return;

    logEvent('open_estate', {
      district_name: data?.districts?.[district]?.name || 'Аджария',
      estate_name: current.name,
      developer: current.developer_name || 'неизвестный застройщик',
      min_price: current.minPrice,
    });

    localStorage.setItem(key, '1');
    setTimeout(() => localStorage.removeItem(key), 30 * 60 * 1000);
  }, [current, district, data]);

  const estateHasPhotos = useMemo(() => hasPhotos(current, 'estate'), [current]);

  return (
    <div className="mt-6">
      <h1 className="text-3xl font-bold mb-2">{current.name}</h1>
      {current.developer_name && <p className="text-lg text-gray-600 mb-6">{current.developer_name}</p>}

      <div className="max-w-2xl font-normal tracking-tighter text-left mx-auto px-3 py-2 mb-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl border border-rose-200 text-orange-800">
        {current.photos?.specific?.[0]?.url && (
          <img
            src={current.photos.specific[0].url}
            alt={current.name || 'Estate image'}
            className="w-full h-48 object-cover rounded-2xl mt-6 shadow-lg"
          />
        )}
        <p className="mt-4 mb-2">{current.estate_description || 'удивительный комплекс'}</p>
      </div>

      {/* Кнопка фото, если есть */}
      {estateHasPhotos && (
        <div className="flex justify-center items-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-1/2 mb-8 mx-auto bg-gradient-to-r from-orange-600 to-rose-600 text-white py-4 rounded-2xl font-bold text-md hover:shadow-xl transition mt-8"
          >
            Показать фото комплекса
          </button>
        </div>
      )}

      {/* Панель фильтров и сортировки */}
      <div className="mb-8 p-4 bg-white rounded-xl border border-rose-100 shadow">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Тип апартаментов:</h3>
            <div className="flex flex-wrap gap-2">
              {apartmentTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-2 py-1  rounded-lg transition ${
                    selectedType === type.id
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Сортировка по цене внутри блока:</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSortOrder('asc')}
                className={`px-2 py-1 rounded-lg transition ${
                  sortOrder === 'asc'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                По возрастанию
              </button>
              <button
                onClick={() => setSortOrder('desc')}
                className={`px-2 py-1 rounded-lg transition ${
                  sortOrder === 'desc'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                По убыванию
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Найдено апартаментов: {Object.values(processedBlocks).reduce((total, block) => total + block.apartments.length, 0)}
          </div>
          <button
            onClick={handleResetFilters}
            className="px-2 py-1  text-sm bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition"
          >
            Сбросить фильтры
          </button>
        </div>
      </div>

      {/* Группировка по блокам */}
      <div className="space-y-8">
        {Object.entries(processedBlocks).map(([blockId, blockData]) => (
          <div key={blockId} className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-1 h-8 bg-cyan-600 rounded-full mr-3"></div>
              <h2 className="text-2xl font-bold text-gray-800">{blockData.blockName}</h2>
              <span className="ml-4 px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">
                {blockData.apartments.length} апарт.
              </span>
            </div>
            
            <div className="grid gap-4">
              {blockData.apartments.map(ap => (
                <Link
                  key={ap.apartment_id}
                  to={`/apartment/${ap.apartment_id}`}
                  className="block p-5 bg-white rounded-xl border border-rose-100 shadow hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs rounded">
                          {ap.typeName}
                        </span>
                        <span className="px-2 py-1 bg-rose-50 text-rose-700 text-xs rounded">
                          {ap.m2} м²
                        </span>
                        {ap.finishing && (
                          <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                            {ap.finishing}
                          </span>
                        )}
                        {ap.furnished && (
                          <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded">
                            {ap.furnished}
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-cyan-600">${ap.price_usd.toLocaleString()}</p>
                    </div>
                    <span className="text-2xl text-cyan-600">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Сообщение, если ничего не найдено */}
      {Object.keys(processedBlocks).length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">По выбранным фильтрам апартаменты не найдены</p>
          <button
            onClick={handleResetFilters}
            className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
          >
            Сбросить фильтры
          </button>
        </div>
      )}

      {/* Модалка */}
      <PhotoGalleryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entity={current}
        entityType="estate"
      />
    </div>
  );
}