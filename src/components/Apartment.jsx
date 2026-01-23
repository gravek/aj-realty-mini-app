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
  Building,
  Ruler,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Notebook
} from 'lucide-react';

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
            const found = type.apartments.find(a => a.apartment_id === id);
            if (found) {
              // Создаем объект апартамента с дополнительными данными
              const apartmentData = {
                ...found,
                estateName: estate.name,
                estateDeveloper: estate.developer_name,
                estateDescription: estate.estate_description,
                districtName: district.name,
                districtDescription: district.description,
                estatePhoto: estate.photos?.sketch?.[0]?.url || estate.photos?.specific?.[0]?.url,
                blockName: block.name || 'один блок',
                blockSpecifications: block.block_specifications,
                blockPhoto: block.photos?.sketch?.[0]?.url || block.photos?.specific?.[0]?.url,
                app_type: type.name,
                typeDescription: type.description,
                amenities: estate.amenities || [],
                location: estate.location || {},
              };
              
              setApartment(apartmentData);
              
              // Создаем специальный объект для модалки с фото только из блока и типа
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
                        apartments: []
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

    logEvent('view_apartment', {
      apartment_id: id,
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
  const hasPhotos = () => {
    if (!parentEntity) return false;
    
    let count = 0;
    const countPhotos = (obj) => {
      if (!obj) return;
      ['sketch', 'example', 'specific'].forEach(t => {
        count += (obj[t] || []).filter(p => p && p.url).length;
      });
    };
    
    // Проверяем фото апартамента
    countPhotos(parentEntity.photos);
    
    // Проверяем фото блока
    Object.values(parentEntity.blocks || {}).forEach(block => {
      countPhotos(block.photos);
      
      // Проверяем фото типа
      Object.values(block.apartment_types || {}).forEach(type => {
        countPhotos(type.photos);
      });
    });
    
    return count > 0;
  };

  // Рассчитываем цену за м²
  const pricePerM2 = apartment.price_usd / apartment.m2;

  return (
    <div className="space-y-6 pb-20">
      {/* Путь */}
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <Link to="/" className="hover:text-cyan-600 transition">Главная</Link>
        <ChevronLeft size={16} className="mx-1" />
        <Link to={`/district/${apartment.districtName}`} className="hover:text-cyan-600 transition">
          {apartment.districtName}
        </Link>
        <ChevronLeft size={16} className="mx-1" />
        <span className="text-gray-700 font-medium">{apartment.estateName}</span>
      </div>

      {/* Заголовок и основная информация */}
      <div className="bg-gradient-to-r from-orange-100/60 to-cyan-100/40 p-6 rounded-2xl border border-cyan-300 shadow-md">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{apartment.estateName}</h1>
            
            {apartment.estateDeveloper && (
              <div className="flex items-center gap-2 mt-3">
                <Building size={18} className="text-gray-400" />
                <span className="text-gray-700">Застройщик: {apartment.estateDeveloper}</span>
              </div>
            )}
          </div>
          
          <p className="text-xl text-gray-600 mt-1">{apartment.blockName}</p>
          
          <div className="bg-white p-5 rounded-xl shadow-lg border border-cyan-100 min-w-[250px]">
            <div className="text-4xl font-bold text-cyan-600 mb-1">
              ${apartment.price_usd.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mb-3">
              {pricePerM2.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} $/м²
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <Home size={20} className="mx-auto text-orange-600 mb-1" />
                <div className="font-bold text-gray-900 text-sm truncate">{apartment.app_type}</div>
              </div>
              <div className="text-center p-2 bg-rose-50 rounded-lg">
                <Square size={20} className="mx-auto text-rose-600 mb-1" />
                <div className="font-bold text-gray-900">{apartment.m2} м²</div>
              </div>
              <div className="text-center p-2 bg-cyan-50 rounded-lg">
                <Layers size={20} className="mx-auto text-cyan-600 mb-1" />
                <div className="font-bold text-gray-900">{apartment.floor}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Главное фото */}
      {apartment.estatePhoto && (
        <div className="relative rounded-2xl overflow-hidden shadow-xl">
          <img 
            src={apartment.estatePhoto} 
            alt={apartment.estateName} 
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-gray-600/80 to-transparent p-6">
            <p className="text-white text-lg font-semibold">{apartment.estateDescription}</p>
          </div>
        </div>
      )}

      {/* Табы с информацией */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-4 text-center font-medium transition ${
              activeTab === 'details'
                ? 'text-cyan-600 border-b-2 border-cyan-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Детали апартамента
          </button>
          {/* <button
            onClick={() => setActiveTab('specs')}
            className={`flex-1 py-4 text-center font-medium transition ${
              activeTab === 'specs'
                ? 'text-cyan-600 border-b-2 border-cyan-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Характеристики
          </button> */}
          <button
            onClick={() => setActiveTab('location')}
            className={`flex-1 py-4 text-center font-medium transition ${
              activeTab === 'location'
                ? 'text-cyan-600 border-b-2 border-cyan-600'
                : 'text-gray-500 hover:text-gray-700'
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
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Home size={20} className="text-cyan-600" />
                    Основные параметры
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Тип апартамента</span>
                      <span className="font-semibold">{apartment.app_type}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Блок</span>
                      <span className="font-semibold">{apartment.blockName}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Отделка</span>
                      <span className="font-semibold">{apartment.finishing || 'Не указана'}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Меблировка</span>
                      <span className="font-semibold">{apartment.furnished || 'Не указана'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Notebook size={18} className="text-purple-600" />
                    Дополнительно
                  </h4>
                  <div className="space-y-2">
                    {apartment.ap_specifications && (
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-sm text-gray-600">Особенности апартамента</div>
                        <div className="text-gray-800">{apartment.ap_specifications}</div>
                      </div>
                    )}
                    {apartment.typeDescription && (
                      <div className="p-3 bg-indigo-50 rounded-lg">
                        <div className="text-sm text-gray-600">Описание типа</div>
                        <div className="text-gray-800">{apartment.typeDescription}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600" />
                    О блоке:
                  </h3>
                  {apartment.blockSpecifications ? (
                    <p className="text-gray-700 bg-green-50 p-4 rounded-lg border border-green-100">
                      {apartment.blockSpecifications}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">Уточните, пожалуйста у менеджера</p>
                  )}
                  
                  {apartment.blockPhoto && (
                    <div className="mt-4">
                      <img 
                        src={apartment.blockPhoto} 
                        alt={`Блок ${apartment.blockName}`} 
                        className="w-full h-48 object-cover rounded-xl shadow"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* {activeTab === 'specs' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Ruler size={18} className="text-cyan-600" />
                  Площадь и цена
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-cyan-50 rounded-lg">
                    <div className="text-sm text-gray-600">Общая площадь</div>
                    <div className="text-xl font-bold text-cyan-700">{apartment.m2} м²</div>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-lg">
                    <div className="text-sm text-gray-600">Цена за м²</div>
                    <div className="text-xl font-bold text-rose-700">
                      {pricePerM2.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} $
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Layers size={18} className="text-orange-600" />
                  Этаж
                </h4>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 text-center">
                    {apartment.floor}
                  </div>
                  <div className="text-center text-gray-600 mt-2">этаж</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar size={18} className="text-purple-600" />
                  Дополнительно
                </h4>
                <div className="space-y-2">
                  {apartment.ap_specifications && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm text-gray-600">Спецификации апартамента</div>
                      <div className="text-gray-800">{apartment.ap_specifications}</div>
                    </div>
                  )}
                  {apartment.typeDescription && (
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <div className="text-sm text-gray-600">Описание типа</div>
                      <div className="text-gray-800">{apartment.typeDescription}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )} */}

          {activeTab === 'location' && (
            <div className="space-y-4">
              {/* Район - компактно */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-rose-600" />
                  <h3 className="font-semibold text-gray-900">Район: {apartment.districtName}</h3>
                </div>
                
                {apartment.districtDescription && (
                  <p className="text-gray-700 bg-rose-50 p-3 rounded-lg text-sm">
                    {apartment.districtDescription}
                  </p>
                )}
              </div>

              {/* ЖК - компактно */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building size={20} className="text-cyan-600" />
                  <h3 className="font-semibold text-gray-900">О комплексе</h3>
                </div>
                
                {apartment.estateDescription && (
                  <p className="text-gray-700 bg-cyan-50 p-3 rounded-lg text-sm">
                    {apartment.estateDescription}
                  </p>
                )}
              </div>

              {/* Инфраструктура - компактно */}
              {apartment.amenities && apartment.amenities.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Инфраструктура ЖК</h3>
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
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{apartment.amenities.length - 8} ещё
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Детали расположения - компактно */}
              {apartment.location && Object.keys(apartment.location).length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Детали расположения</h3>
                  <div className="space-y-2">
                    {Object.entries(apartment.location).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">{key.replace('_', ' ')}</span>
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

      {/* Кнопки действий */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Кнопка фото */}
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!hasPhotos()}
          className={`p-5 rounded-xl font-bold text-lg shadow-lg transition flex items-center justify-center gap-3 ${
            hasPhotos()
              ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white hover:shadow-xl'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {hasPhotos() ? (
            <>
              <span className="text-2xl">📸</span>
              <div className="text-left">
                <div>Посмотреть фото</div>
                <div className="text-sm font-normal opacity-90">для этого апртамента</div>
              </div>
            </>
          ) : (
            'Фото отсутствуют'
          )}
        </button>

        {/* Кнопка бота */}
        <button 
          onClick={() => {
            const key = `logged_ask_elaj_${id}`;
            logEvent('click_ask_bot_about_this_object', {
              apartment_id: id,
              estate: apartment?.estateName || 'unknown',
              district: apartment?.districtName || 'unknown'
            });
            localStorage.setItem(key, '1');
            setTimeout(() => localStorage.removeItem(key), 60 * 1000);
            window.Telegram?.WebApp?.openTelegramLink('https://t.me/AIRealtyTest_bot');
          }}
          className="p-5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition flex items-center justify-center gap-3"
        >
          <span className="text-2xl">🤖</span>
          <div className="text-left">
            <div>Спросить Эладжа</div>
            <div className="text-sm font-normal opacity-90">об этом объекте</div>
          </div>
        </button>

        {/* Кнопка менеджера */}
        <button 
          onClick={() => {
            const key = `logged_wright_manager_${id}`;
            logEvent('click_ask_manager', {
              apartment_id: id,
              estate: apartment?.estateName || 'unknown',
              district: apartment?.districtName || 'unknown'
            });
            localStorage.setItem(key, '1');
            setTimeout(() => localStorage.removeItem(key), 60 * 1000);
            window.Telegram?.WebApp?.openTelegramLink('https://t.me/a4k5o6');
          }}
          className="p-5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition flex items-center justify-center gap-3"
        >
          <span className="text-2xl">👩🏻‍🦱</span>
          <div className="text-left">
            <div>Написать менеджеру</div>
            <div className="text-sm font-normal opacity-90">для личной консультации</div>
          </div>
        </button>
      </div>

      {/* Модалка */}
      <PhotoGalleryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entity={parentEntity}
        entityType="estate" // Используем "estate" для совместимости с модалкой
      />
    </div>
  );
}