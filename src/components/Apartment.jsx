// src/components/Apartment.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';
import PhotoGalleryModal from './PhotoGalleryModal';
import { logEvent } from '../utils/analytics';
import { 
  Home, 
  Layers, 
  Square, 
  MapPin, 
  HandCoins,
  Hotel,
  BrickWall,
  Blocks,
  Columns3Cog,
  FileDigit,
  Building2,
  Camera,
  BotMessageSquare,
  UserRoundPen,
  ChevronRight,
  Notebook,
  MoveRight,
  MoveDown
} from 'lucide-react';

// import { hasPhotos } from '../utils/hasPhotos';

export default function Apartment() {
  const { id } = useParams();
  const { data } = useStore();
  const [apartment, setApartment] = useState(null);
  const [parentEntity, setParentEntity] = useState(null); // Для фото модалки
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (!data) return;

    for (const district of Object.values(data.districts || {})) {
      for (const estate of Object.values(district.estates || {})) {
        for (const block of Object.values(estate.blocks || {})) {
          for (const type of Object.values(block.apartment_types || {})) {
            // const found = type.apartments.find(a => a.apartment_id === id);
            const found = Object.values(type.apartments || {}).find(a => a.apartment_id === id);
            if (found) {
              // Создаем объект апартамента с дополнительными данными
              const apartmentData = {
                ...found,
                estateName: estate.name,
                estateDeveloper: estate.developer_name,
                estateDescription: estate.estate_description,
                districtID: district.id,
                districtName: district.name,
                districtDescription: district.description,
                estatePhoto: estate.photos?.specific?.[0]?.url || estate.photos?.sketch?.[0]?.url,
                blockName: block.name || 'один блок',
                blockCoords: block.coords || 'один блок',
                blockSpecifications: block.block_specifications,
                blockPhoto: block.photos?.specific?.[0]?.url || block.photos?.sketch?.[0]?.url,
                app_type: type.name,
                typeDescription: type.ap_type_descr,
                amenities: estate.amenities || [],
                location: estate.location || {},
              };
              
              setApartment(apartmentData);
              
              // Создаем специальный объект для модалки с фото только из блока и типа апартамента
              const modalEntity = {
                ...found, // Базовые данные апартамента
                name: apartmentData.estateName,
                estateName: estate.name,
                districtName: district.name,
                photos: found.photos || {}, // Фото самого апартамента
                // Добавляем блок с его фото
                blocks: {
                  [block.name || 'default']: {
                    name: block.name,
                    photos: block.photos || {}, // Фото блока
                    apartment_types: {
                      [type.name || 'default']: {
                        name: type.name,
                        photos: type.photos || {}, // Фото типа апартамента
                        // apartments: []
                        apartments: {
                          [found.apartment_id]: {
                            name: found.apartment_id,
                            photos: found.photos || {}, // Фото апартамента
                          }
                        }
                      }
                    }
                  }
                }
              };
              
              setParentEntity(modalEntity);
              return;
            }
          }
        }
      }
    }
  }, [data, id]);

  useEffect(() => {
    if (!apartment) return;

    const eventSent = localStorage.getItem(`view_apartment_${id}`);
    if (eventSent) return;

    logEvent('open_apartment', {
      apartment_id: id,
      apartment_number: apartment.apartment_number,
      apartment_price_usd: apartment.price_usd,
      apartment_type: apartment.app_type,
      apartment_m2: apartment.m2,
      apartment_finishing: apartment.finishing,
      apartment_furnished: apartment.furnished,
      apartment_floor: apartment.floor,
      block: apartment.blockName,
      estate: apartment.estateName,
      district: apartment.districtName,
    });

    localStorage.setItem(`view_apartment_${id}`, '1');
    setTimeout(() => localStorage.removeItem(`view_apartment_${id}`), 1 * 60 * 1000);
  }, [apartment, id]);

  if (!apartment) return <div className="p-8 text-center">Апартамент не найден</div>;

  // Проверяем наличие фото в parentEntity
  // const hasPhotos = () => {
  //   if (!parentEntity) return false;
    
  //   let count = 0;
  //   const countPhotos = (obj) => {
  //     if (!obj) return;
  //     // ['sketch', 'example', 'specific'].forEach(t => {
  //     ['sketch', 'example'].forEach(t => {
  //       count += (obj[t] || []).filter(p => p && p.url).length;
  //     });
  //   };
    
  //   // Проверяем фото апартамента
  //   countPhotos(parentEntity.photos);
    
  //   // Проверяем фото блока
  //   Object.values(parentEntity.blocks || {}).forEach(block => {
  //     countPhotos(block.photos);
      
  //     // Проверяем фото типа
  //     Object.values(block.apartment_types || {}).forEach(type => {
  //       countPhotos(type.photos);
  //     });


  //     // выводим в консоль для проверки, что есть в apartment.photos
  //     // console.log(apartment.photos);

  //     // Проверяем фото апартамента
  //     (type.apartments || []).forEach(ap => countPhotos(ap.photos));
  //     // Object.values(app_type.apartments || {}).forEach(apartment => countPhotos(apartment.photos));

  //   });
    
  //   return count > 0;
  // };

// Проверяем наличие фото в parentEntity
const hasPhotos = () => {
  if (!parentEntity) return false;
  
  let count = 0;
  const countPhotos = (obj) => {
    if (!obj) return;
    ['sketch', 'example'].forEach(t => {           // specific пока не используем
      count += (obj[t] || []).filter(p => p && p.url).length;
    });
  };
  
  // Фото самого апартамента (top-level в parentEntity)
  countPhotos(parentEntity.photos);
  
  // Проходим по блокам и типам
  Object.values(parentEntity.blocks || {}).forEach(block => {
    countPhotos(block.photos);
    
    Object.values(block.apartment_types || {}).forEach(type => {
      countPhotos(type.photos);
      
      // ←←← ГЛАВНОЕ ИСПРАВЛЕНИЕ: теперь считаем фото именно апартамента
      Object.values(type.apartments || {}).forEach(apartment => {
        countPhotos(apartment.photos);
      });
    });
  });
  
  return count > 0;
};



  // Рассчитываем цену за м²
  const pricePerM2 = apartment.price_usd / apartment.m2;

  return (
      <div className="space-y-6 pb-20">
        {/* Путь */}
        {/* <div className="flex items-center text-sm text-slate-500 mb-2">
          <Link to="/" className="hover:text-cyan-600 transition">Главная</Link>
          <ChevronRight size={16} className="mx-1" />
          <Link to={`/district/${apartment.districtName}`} className="hover:text-cyan-600 transition">
            {apartment.districtName}
          </Link>
          <ChevronRight size={16} className="mx-1" />
          <span className="text-slate-700 font-medium">{apartment.estateName}</span>
        </div> */}

      {/* Путь */}
      <div className="flex items-center text-sm text-slate-500 mb-2">
        <Link to="/" className="hover:text-cyan-600 transition">Объекты</Link>
        <ChevronRight size={16} className="mx-1" />
        <Link 
          to={`/districts#${apartment.districtName.toLowerCase().replace(/\s+/g, '-')}`} 
          className="hover:text-cyan-600 transition"
        >
          {apartment.districtName}
        </Link>
        <ChevronRight size={16} className="mx-1" />
        <Link 
          to={`/estate/${apartment.districtID}/${apartment.estateName}`} 
          className="hover:text-cyan-600 transition"
        >
          {apartment.estateName}
        </Link>
        <ChevronRight size={16} className="mx-1" />
        <span className="text-slate-700 font-medium">{apartment.apartmentType} Апартамент</span> {/* Добавил для полноты, если нужно */}
      </div>


      <div className="flex-1 pb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-700 to-teal-600 bg-clip-text text-transparent mb-2">{apartment.estateName}</h1>
        
        {apartment.estateDeveloper && (
          <div className="flex items-center gap-2 mt-1">
            <BrickWall size={18} className="text-slate-400" />
            <span className="text-slate-500">{apartment.estateDeveloper}</span>
          </div>
        )}
      </div>



      {/* Апартамент и основная информация from-cyan-600/80 to-teal-600/80 */}
      <div className="bg-gradient-to-r from-cyan-50/90 to-teal-50/90 p-6 rounded-2xl border border-cyan-300 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-cyan-700">Апартамент {apartment.apartment_number || ''}</h2>
            
            <div className="flex items-center gap-2">
              <FileDigit size={16} className="text-slate-400" />
              <p className="text-md text-slate-500">ID: {apartment.apartment_id}</p>
            </div>


            {/* {apartment.estateDeveloper && (
              <div className="flex items-center gap-2 mt-1">
                <BrickWall size={18} className="text-slate-400" />
                <span className="text-slate-600">{apartment.estateDeveloper}</span>
              </div>
            )} */}
          </div>
          
          <div className="flex items-center justify-between gap-2 mt-0">
            {/* иконка + название блока */}
            <div className="flex items-center gap-1">
              <Hotel size={21} className="text-slate-400" />
              <p className="text-xl text-slate-600">{apartment.blockName}</p>
            </div>

            {/* координаты блока (если есть) */}
            {apartment.blockCoords && (
              <div className="flex items-center gap-2 px-3 py-1 text-xs bg-white/95 border border-slate-200/80 rounded-full">
                <MapPin className="text-slate-400" size={16} />
                <span className="text-slate-600">
                  {apartment.blockCoords[0].toFixed(4)}, {apartment.blockCoords[1].toFixed(4)}
                </span>
              </div>
            )}
          </div>

          {/* Цена и основные спецификации апартамента */}
          <div className="bg-white p-5 rounded-xl shadow-lg border border-cyan-100 min-w-[250px]">
            <div className="flex items-center justify-between gap-2 mt-0">
              <div className="text-2xl font-bold text-cyan-600 mb-1">
                ${apartment.price_usd.toLocaleString()}
              </div>
              {apartment.credit && (
                <div className="text-sm font-semibold text-rose-500 bg-rose-200/20 px-3 py-1 rounded-full mb-1 items-center gap-2 flex">
                  <HandCoins size={20} className="scale-x-[-1]" />
                  кредит {apartment.credit.toLocaleString()}%
                </div>
              )}
            </div>
            <div className="text-sm text-slate-500 mb-3">
              {pricePerM2.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} $/м²
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <Blocks size={20} className="mx-auto text-orange-600 mb-1" />
                <div className="font-bold text-slate-900 text-sm truncate">{apartment.app_type}</div>
              </div>
              <div className="text-center p-2 bg-rose-50 rounded-lg">
                <Square size={20} className="mx-auto text-rose-600 mb-1" />
                <div className="font-bold text-slate-900">{apartment.m2} м²</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <Layers size={20} className="mx-auto text-purple-600 mb-1" />
                <div className="font-bold text-slate-900">{apartment.floor}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Главное фото */}
      {/* {apartment.estatePhoto && (
        <div className="relative rounded-2xl overflow-hidden shadow-xl">
          <img 
            src={apartment.estatePhoto} 
            alt={apartment.estateName} 
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-slate-600/80 to-transparent p-6">
            <p className="text-white text-lg font-semibold">{apartment.estateDescription}</p>
          </div>
        </div>
      )} */}

      {/* Табы с информацией */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-4 text-center font-medium transition ${
              activeTab === 'details'
                ? 'text-cyan-600 border-b-2 border-cyan-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Детали апартамента
          </button>
          {/* <button
            onClick={() => setActiveTab('specs')}
            className={`flex-1 py-4 text-center font-medium transition ${
              activeTab === 'specs'
                ? 'text-cyan-600 border-b-2 border-cyan-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Характеристики
          </button> */}
          <button
            onClick={() => setActiveTab('location')}
            className={`flex-1 py-4 text-center font-medium transition ${
              activeTab === 'location'
                ? 'text-cyan-600 border-b-2 border-cyan-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Расположение
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Home size={20} className="text-orange-600" />
                    Основные параметры
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Тип апартамента</span>
                      <span className="text-cyan-600 font-semibold">{apartment.app_type}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Метраж общий</span>
                      <span className="text-cyan-600 font-semibold">{apartment.m2} м²</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Этаж</span>
                      <span className="text-cyan-600 font-semibold">{apartment.floor}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Отделка</span>
                      <span className="text-cyan-600 font-semibold">{apartment.finishing || 'Не указана'}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Меблировка</span>
                      <span className="text-cyan-600 font-semibold">{apartment.furnished || 'Не указана'}</span>
                    </div>
                    {apartment.not_used && (
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">Не использовался</span>
                        <span className="text-cyan-600 font-semibold">{apartment.not_used || 'нет'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Notebook size={18} className="text-rose-600" />
                    Дополнительно
                  </h4>
                  <div className="space-y-2">
                    {apartment.typeDescription && (
                      <div className="p-4 bg-rose-100/20 rounded-lg">
                        <div className="font-semibold text-sm text-slate-600 bg-white/80 backdrop-blur-md inline-block border border-slate-200 py-1 px-2 mb-2 rounded-md">О типе апартамента</div>
                        <div className="text-slate-800 whitespace-pre-wrap">{apartment.typeDescription}</div>
                      </div>
                    )}
                  </div>
                    {apartment.ap_specifications && (
                      <div className="p-4 bg-rose-100/20 rounded-lg">
                        <div className="font-semibold text-sm text-slate-600 bg-white/80 backdrop-blur-md inline-block border border-slate-200 py-1 px-2 mb-2 rounded-md">Важные подробности</div>
                        <div className="text-slate-800 whitespace-pre-wrap">{apartment.ap_specifications}</div>
                      </div>
                    )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 backdrop-blur-md flex items-center gap-2">
                    <Columns3Cog size={18} className="text-purple-600" />
                    О корпусе {apartment.blockName}:
                  </h3>
                  {apartment.blockSpecifications ? (
                    <p className="whitespace-pre-wrap text-slate-700 bg-purple-100/40 p-4 rounded-lg border border-green-100">
                      {apartment.blockSpecifications}
                    </p>
                  ) : (
                    <p className="text-slate-500 italic">Уточните, пожалуйста, у менеджера</p>
                  )}
                  
                  {apartment.blockPhoto && (
                    <div className="mt-4">
                      <img 
                        src={apartment.blockPhoto} 
                        alt={`Блок ${apartment.blockName}`} 
                        className="w-full h-full object-cover rounded-xl shadow"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


          {activeTab === 'location' && (
            <div className="space-y-4">
              {/* Район - компактно */}
              {/* <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-rose-600" />
                  <h3 className="font-semibold text-slate-900">Район: {apartment.districtName}</h3>
                </div>
                
                {apartment.districtDescription && (
                  <p className="text-slate-700 bg-rose-50 p-3 rounded-lg text-sm">
                    {apartment.districtDescription}
                  </p>
                )}
              </div>

              {/* ЖК - компактно */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 size={20} className="text-cyan-600" />
                  <h3 className="font-semibold text-slate-900">О комплексе</h3>
                </div>
                
                {apartment.estateDescription && (
                  <p className="text-sm whitespace-pre-wrap text-slate-700 bg-cyan-100/20 p-3 rounded-lg">
                    {apartment.estateDescription}
                  </p>
                )}
              </div>

              {/* Инфраструктура - компактно */}
              {apartment.amenities && apartment.amenities.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900">Инфраструктура ЖК</h3>
                  <div className="flex flex-wrap gap-2">
                    {apartment.amenities.slice(0, 8).map((amenity, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs"
                      >
                        {amenity}
                      </span>
                    ))}
                    {apartment.amenities.length > 8 && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                        +{apartment.amenities.length - 8} ещё
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Детали расположения - компактно */}
              {apartment.location && Object.keys(apartment.location).length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900">Детали расположения</h3>
                  <div className="space-y-2">
                    {Object.entries(apartment.location).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span className="text-sm text-slate-600">{key.replace('_', ' ')}</span>
                        <span className="font-medium text-sm">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      {/* Кнопка фото */}
      <div className="text-center mt-4">
        <div className="inline-flex items-center bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-rose-200/80 p-2">
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!hasPhotos()}
            className={`px-4 py-2 font-semibold text-lg rounded-2xl transition flex items-center justify-center gap-4 ${
              hasPhotos()
                ? 'bg-gradient-to-r from-orange-600/80 to-rose-600/80 text-white'
                : 'bg-slate-600/30 text-slate-50 cursor-not-allowed'
            }`}
          >
            {hasPhotos() ? (
              <>
                <Camera size={32}  className="animate-gentle-pulse"/>
                <div className="text-left">
                  <div>Смотреть фото</div>
                  <div className="text-sm font-normal">для апртамента</div>
                </div>
              </>
            ) : (
              'Фото скоро появятся'
            )}
          </button>
        </div>
      </div>




      {/* Кнопка бота */}
      <div className="max-w-4xl mx-auto px-16 pb-4 sticky top-10 z-40 md:static">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-cyan-200/80 p-2 md:p-4">
          <button
            onClick={() => {
              const key = `logged_ask_bot_apartment_${id}`;
              if (!localStorage.getItem(key)) {
                logEvent('ask_bot_apartment', {
                  apartment_id: id,
                  estate: apartment?.estateName || 'unknown',
                  district: apartment?.districtName || 'unknown'
                });
                localStorage.setItem(key, '1');
                setTimeout(() => localStorage.removeItem(key), 60 * 1000);
              }
              // window.Telegram?.WebApp?.openTelegramLink('https://t.me/AIRealtyTest_bot');
              // Формируем текст для вставки в чат
              const prefilledText = `Расскажи об апартаменте ${id}`;
              
              // Кодируем текст и формируем URL, затем открываем бота
              const botUrl = `https://t.me/AIRealtyTest_bot?text=${encodeURIComponent(prefilledText)}`;
              window.Telegram?.WebApp?.openTelegramLink(botUrl);
            }}
            className="w-full bg-gradient-to-r from-teal-600/80 to-cyan-600/80 text-white py-2 rounded-2xl font-semibold text-md flex items-center justify-center gap-4 transition-all"
          >
            <BotMessageSquare size={32} className="animate-gentle-pulse" />
            <div className="flex flex-col items-start">
              <span className="text-lg">Спросить Эладжа</span>
              <span className="text-sm font-normal opacity-95 -mt-1">об этом апартаменте</span>
            </div>
          </button>
        </div>
      </div>


      {/* Целевое действие */}
      <div className="bg-gradient-to-b from-rose-100/60 via-rose-50/80 via-pink-100/80 to-pink-200/80 backdrop-blur-md pl-6 pr-6 pt-4 pb-4 rounded-2xl border border-purple-200/60 shadow-xl">
        <div className="relative flex flex-col items-center mb-6">
          {/* Верхняя "крепёжная" линия */}
          <div className="w-3/4 md:w-3/4 h-0.5 mt-2 mb-6 bg-gradient-to-r from-pink-600/80 via-rose-600/60 to-pink-600/80 rounded-full" />

          {/* Плашка + боковые стрелки */}
          <div className="relative flex items-center justify-center gap-6 shadow-sm">
            {/* Колечки */}
            <div className="absolute z-20 -top-7 left-1/4 transform -translate-x-1/2 flex flex-col items-center">
              <div className="w-1 h-2 bg-pink-400"></div>
              <div className="w-2 h-4 rounded-full border-2 border-rose-400"></div>
              <div className="w-1 h-2 bg-pink-400"></div>
            </div>
            <div className="absolute z-20 -top-7 left-3/4 transform -translate-x-1/2 flex flex-col items-center">
              <div className="w-1 h-2 bg-pink-400"></div>
              <div className="w-2 h-4 rounded-full border-2 border-rose-400"></div>
              <div className="w-1 h-2 bg-pink-400"></div>
            </div>

            {/* Плашка о горячих предложениях */}
            <div className="inline-flex items-center gap-2 bg-white border border-rose-200/80 px-8 py-4 rounded-md z-10">
              <MoveDown size={36} className="text-pink-600/80 animate-gentle-pulse" />
              <h2 className="text-xl text-center md:text-2xl font-semibold bg-gradient-to-r from-pink-600/90 to-pink-600/90 bg-clip-text text-transparent tracking-tight">
                Пожалуйста, уточните все параметры у менеджера
              </h2>
              <MoveDown size={36} className="text-pink-600/80 animate-gentle-pulse" />
            </div>

          </div>
        </div>


        {/* Кнопка менеджера */}
        <div className="max-w-4xl mx-auto px-8 pb-2 sticky top-10 z-40 md:static">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-md border border-fuchsia-200/80 p-2 md:p-4">
            <button
              onClick={() => {
                const key = `logged_ask_manager_apartment_${id}`;
                if (!localStorage.getItem(key)) {
                  logEvent('ask_manager_apartment', {
                    apartment_id: id,
                    estate: apartment?.estateName || 'unknown',
                    district: apartment?.districtName || 'unknown'
                  });
                  localStorage.setItem(key, '1');
                  setTimeout(() => localStorage.removeItem(key), 60 * 1000);
                }
                // window.Telegram?.WebApp?.openTelegramLink('https://t.me/AIRealtyTest_bot');
                // Формируем текст для вставки в чат
                const prefilledText = `Добрый день! Интересует апартамент id: ${id}. Хотелось бы узнать подробнее. (${apartment?.estateName}, ${apartment.blockName}, этаж ${apartment.floor}, N ${apartment.apartment_number || '-'}, ${apartment.app_type}, ${apartment.m2} м², ${apartment.price_usd.toLocaleString()} USD)`;
                
                // Кодируем текст и формируем URL, затем открываем бота
                const botUrl = `https://t.me/ninaabramia97?text=${encodeURIComponent(prefilledText)}`;
                window.Telegram?.WebApp?.openTelegramLink(botUrl);
              }}
              className="w-full bg-gradient-to-r from-fuchsia-600/80 to-purple-600/80 text-white py-2 rounded-2xl font-semibold text-md flex items-center justify-center gap-4 shadow-2xl hover:brightness-110 transition-all"
            >
              <UserRoundPen size={32} className="animate-gentle-pulse" />
              <div className="flex flex-col items-start">
                <span className="text-xl">Написать менеджеру</span>
                <span className="text-sm font-normal opacity-95 -mt-1">для личной консультации</span>
              </div>
            </button>
          </div>
        </div>
      </div>



        {/* К другим апартаментам комплекса */}
        <div className="text-center p-4">
          <div className="inline-flex items-center bg-white/80 backdrop-blur-md rounded-xl shadow-xl border border-rose-200/80 p-2">

            <Link
              to={`/estate/${apartment.districtID}/${apartment.estateName}`} 
              className="inline-flex items-center text-lg tracking-wider bg-gradient-to-r from-sky-600/80 to-blue-600/80 text-white px-4 py-2 rounded-lg font-semibold shadow-lg"
            >
              <Building2 size={32} />
              К другим апартаментам комплекса
              <MoveRight size={32} className="text-white animate-gentle-pulse" />
            </Link>
          </div>
        </div>




      {/* Модалка */}
      <PhotoGalleryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entity={parentEntity}
        entityType="estate" // Используем "estate" для уровня фото
        // entityType="apartment" // 
      />
    </div>
  );
}