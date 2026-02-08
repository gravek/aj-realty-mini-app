// src/components/Estate.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';
import PhotoGalleryModal from './PhotoGalleryModal';
import { hasPhotos } from '../utils/hasPhotos';
import { logEvent } from '../utils/analytics';
import { 
  Home, 
  Layers, 
  Square, 
  MapPin,
  Waves, 
  Hotel,
  BrickWall,
  Columns3Cog,
  Building,
  Images,
  Camera,
  BotMessageSquare,
  Building2,
  MoveRight,
  Ruler,
  Calendar,
  CheckCircle,
  ChevronRight,
  Notebook
} from 'lucide-react';

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

      {/* Навигационная цепочка (путь) */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link to="/districts" className="hover:text-cyan-600 transition-colors">Объекты</Link>
        <ChevronRight size={14} className="mx-2 text-gray-400" />
        <Link 
          to={`/districts#${district?.toLowerCase() || ''}`}
          className="hover:text-cyan-600 transition-colors"
        >
          {district || 'Район'}  {/* district — "Batumi" */}
        </Link>
        <ChevronRight size={14} className="mx-2 text-gray-400" />
        <span className="text-gray-700 font-medium">
          {current?.name || estate || 'Комплекс'}  {/* current.name или fallback на params.estate */}
        </span>
      </div>

      {/* <h1 className="text-3xl font-bold mb-2">{current.name}</h1>
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
      </div> */}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        {/* <div className="flex-1">
          <h1 className="text-3xl font-bold text-cyan-700">{current.name}</h1>
          
          {current.developer_name && (
            <div className="flex items-center gap-2 mt-1">
              <BrickWall size={18} className="text-gray-400" />
              <span className="text-gray-600">{current.developer_name || 'неизвестный застройщик'}</span>
            </div>
          )}
        </div> */}

        {/* Главное описание ЖК */}
        {/* <div className="mb-8 bg-gradient-to-r from-teal-100/40 to-cyan-100/60 p-6 rounded-2xl border border-cyan-300 shadow-md">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-cyan-700">{current.name}</h1>
              
              {current.developer_name && (
                <div className="flex items-center gap-2 mt-1">
                  <BrickWall size={18} className="text-gray-400" />
                  <span className="text-gray-600">{current.developer_name || 'неизвестный застройщик'}</span>
                </div>
                
              )}
            </div>
          </div>
          {current.photos?.specific?.[0]?.url && (
            <div className="relative">
              <img
                src={current.photos.specific?.[0]?.url}
                alt={current.name || 'Estate image'}
                className="w-full h-64 object-cover rounded-2xl mt-6 shadow-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-gray-600/80 to-transparent p-6">
                <p className="text-white text-lg font-semibold">
                  {current.estate_description || 'удивительный комплекс'}
                </p>
              </div>
            </div>
          )}
        </div> */}
      </div>

              {/* Заголовок района с декором */}
              <div className="relative overflow-hidden rounded-3xl mt-8 mb-8 group">
                {/* Фон с градиентом и эффектом стекла */}
                <div className={`absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 blur-sm rounded-3xl`} />
                
                {/* Декоративные световые акценты */}
                {/* <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/30 to-transparent rounded-full -translate-y-32 translate-x-32 blur-3xl" /> */}
                {/* <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/20 to-transparent rounded-full translate-y-32 -translate-x-32 blur-3xl" /> */}
                
                {/* Контент */}
                <div className="relative p-10 text-white z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-6">
                      {/* Иконка с объемом */}
                      <div className="relative">
                        <div className="absolute -inset-2 bg-white/15 rounded-2xl blur-md" />
                        <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 flex items-center justify-center shadow-2xl">
                          <Building2 className="text-white" size={32} />
                        </div>
                      </div>
                      
                      <div>
                        <h2 className="text-4xl font-bold mb-0 tracking-tight">
                          {current.name}
                        </h2>
                        <div className="flex py-1 items-center text-xs gap-2">
                          <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                            <span className="font-normal ">Комплекс в {data?.districts?.[district]?.name}</span>
                            {/* <div className="w-1 h-1 bg-white/90 rounded-full"></div>
                            <span className="text-white/90">
                              {current.coords[0].toFixed(4)}, {current.coords[1].toFixed(4)}
                            </span> */}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                  
                  {/* Описание */}
                  {current.photos?.specific?.[0]?.url && (
                    <div className="relative overflow-hidden rounded-xl">
                      <img
                        src={current.photos.specific?.[0]?.url}
                        alt={current.name || 'Estate image'}
                        className="w-full h-64 object-cover border blur-xs shadow-md"
                      />
                      <div className="absolute inset-0 backdrop-blur-xs bg-gradient-to-t from-slate-900/80 via-slate-600/60 to-orange-600/5 " />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white text-lg leading-relaxed drop-shadow-md">
                          {current.estate_description || 'Современный комплекс с отличными апартаментами'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

      {/* Кнопка фото, если есть */}
      {estateHasPhotos && (
        // <div className="flex justify-center items-center">
        <div className="text-center mt-4">
          <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-rose-200/80 p-2">
            <button
              onClick={() => setIsModalOpen(true)}
              // className="w-1/2 mb-8 mx-auto bg-gradient-to-r from-orange-600 to-rose-600 text-white py-4 rounded-2xl font-bold text-md hover:shadow-xl transition flex items-center gap-2"
              className="text-lg text-white font-semibold bg-gradient-to-r from-orange-600/80 to-rose-600/80 py-2 px-8 rounded-xl shadow-lg transition-shadow flex items-center gap-3"
            
            >
              <Camera size={24} className="animate-gentle-pulse" />
              Посмотреть фото комплекса
            </button>
          </div>
        </div>
      )}

      {/* Кнопка бота */}
      <div className="max-w-4xl mx-auto px-4 mt-4 md:mt-4 sticky top-10 z-40 md:static">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-cyan-200/80 p-2 md:p-4">
          <button
            onClick={() => {
              const key = `logged_ask_bot_estate_${current.name}`;
              if (!localStorage.getItem(key)) {
                logEvent('ask_bot_estate', {
                  estate: current.name || 'unknown'
                });
                localStorage.setItem(key, '1');
                setTimeout(() => localStorage.removeItem(key), 60 * 1000);
              }
              // window.Telegram?.WebApp?.openTelegramLink('https://t.me/AIRealtyTest_bot');
              // Формируем текст для вставки в чат
              const prefilledText = `Расскажи о ${current.name} и апартаментах в нем`;
              
              // Кодируем текст и формируем URL, затем открываем бота
              const botUrl = `https://t.me/AIRealtyTest_bot?text=${encodeURIComponent(prefilledText)}`;
              window.Telegram?.WebApp?.openTelegramLink(botUrl);
            }}
            className="w-full bg-gradient-to-r from-teal-600/80 to-cyan-600/80 text-white py-2 rounded-2xl font-semibold text-md flex items-center justify-center gap-4 shadow-2xl hover:brightness-110 transition-all"
          >
            <BotMessageSquare size={32} className="animate-gentle-pulse" />
            <div className="flex flex-col items-start">
              <span className="text-xl">Спросить Эладжа</span>
              <span className="text-sm font-normal opacity-95 -mt-1">о {current.name} и апартаментах</span>
            </div>
          </button>
        </div>
      </div>


      {/* Кнопки связи */}
      <div className="flex gap-4 mb-10">
        {/* <button 
          onClick={() => {
            const key = `logged_ask_bot_estate_${current.name}`;
            logEvent('ask_bot_estate', {
              estate: current.name || 'unknown'
            });
            localStorage.setItem(key, '1');
            setTimeout(() => localStorage.removeItem(key), 60 * 1000);
            window.Telegram?.WebApp?.openTelegramLink('https://t.me/AIRealtyTest_bot');
          }}
          className="flex-1 bg-gradient-to-r from-teal-600/90 to-cyan-600/90 text-white py-4 rounded-xl font-bold text-md flex items-center justify-center gap-1"
        >
          <BotMessageSquare size={24} className="animate-gentle-pulse" />
          <div>Спросить Эладжа </div>
          <div className="text-md font-normal opacity-90">об этом комплексе</div>
        </button> */}
        {/* <button 
          onClick={() => window.Telegram?.WebApp?.openTelegramLink('https://t.me/a4k5o6')}
          className="flex-1 bg-gradient-to-r from-cyan-600/90 to-blue-600/90 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 mb-6"
        >
          <User size={24} />
          <span>Консультация менеджера</span>
        </button> */}
      </div>

      {/* Панель фильтров и сортировки */}
      <div className="mb-8 p-4 bg-white/90 rounded-xl border border-rose-100 shadow">
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
                      ? 'bg-cyan-600/90 text-white'
                      : 'bg-gray-100/90 text-gray-700 hover:bg-gray-200'
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
                    ? 'bg-cyan-600/90 text-white'
                    : 'bg-gray-100/90 text-gray-700 '
                }`}
              >
                По возрастанию
              </button>
              <button
                onClick={() => setSortOrder('desc')}
                className={`px-2 py-1 rounded-lg transition ${
                  sortOrder === 'desc'
                    ? 'bg-cyan-600/90 text-white'
                    : 'bg-gray-100/90 text-gray-700 '
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
            className="px-2 py-1  text-sm bg-rose-100/90 text-rose-700 rounded-lg hover:bg-rose-200 transition"
          >
            Сбросить фильтры
          </button>
        </div>
      </div>

      {/* Группировка по блокам */}
      <div className="space-y-8">
        {Object.entries(processedBlocks).map(([blockId, blockData]) => (
          <div key={blockId} className="mt-8">
            <div className="flex items-center mb-4">
              <div className="w-1 h-8 bg-cyan-600/80 rounded-full mr-2"></div>
              <h2 className="text-2xl font-bold text-gray-800">{blockData.blockName}</h2>
              <span className="ml-4 px-2 py-1 bg-cyan-100/80 text-cyan-800 rounded-full text-sm">
                {blockData.apartments.length} апарт.
              </span>
            </div>
            
            {/* Карточки апартаментов */}
            <div className="grid gap-4">
              {blockData.apartments.map(ap => (
                <Link
                  key={ap.apartment_id}
                  to={`/apartment/${ap.apartment_id}`}
                  className="block p-5 bg-white/90 rounded-xl border border-rose-100 shadow hover:shadow-lg transition"
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
                    <span className="text-xs text-slate-600 text-right ml-12 mb-1">к апарт.</span>
                    <MoveRight size={28} className="text-cyan-600 animate-gentle-pulse" />

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