// src/components/PhotoGalleryModal.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useStore } from '../store';
import { logEvent } from '../utils/analytics';


const PhotoGalleryModal = ({ isOpen, onClose, entity, entityType }) => {
  const { data } = useStore();

  // Все хуки в начале
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('all');
  const [showCaptionOpen, setCaptionOpen] = useState({});

  const allPhotos = useMemo(() => {
    
    const photos = [];

    const addPhotos = (photosObj) => {
      if (!photosObj) return;
      ['sketch', 'example', 'specific'].forEach(type => {
        photosObj[type]?.forEach(photo => {
          if (photo.url) {
            photos.push({
              url: photo.url,
              description: photo.description || '',
              type,
              label:
                type === 'sketch' ? 'Визуализация' :
                type === 'example' ? 'Реальные' :
                'Особые фото',
            });
          }
        });
      });
    };

    if (entityType === 'district') {
      addPhotos(entity.photos);
      Object.values(entity.estates || {}).forEach(estate => {
        addPhotos(estate.photos);
        Object.values(estate.blocks || {}).forEach(block => {
          addPhotos(block.photos);
          Object.values(block.apartment_types || {}).forEach(type => {
            addPhotos(type.photos);
            (type.apartments || []).forEach(ap => addPhotos(ap.photos));
          });
        });
      });
    } else if (entityType === 'estate') {
      addPhotos(entity.photos);
      Object.values(entity.blocks || {}).forEach(block => {
        addPhotos(block.photos);
        Object.values(block.apartment_types || {}).forEach(type => {
          addPhotos(type.photos);
          (type.apartments || []).forEach(ap => addPhotos(ap.photos));
        });
      });
    } else if (entityType === 'apartment') {
      addPhotos(entity.photos);
      for (const district of Object.values(data?.districts || {})) {
        for (const estate of Object.values(district.estates || {})) {
          for (const block of Object.values(estate.blocks || {})) {
            for (const type of Object.values(block.apartment_types || {})) {
              if (type.apartments?.some(ap => ap.apartment_id === entity.apartment_id)) {
                addPhotos(type.photos);
                addPhotos(block.photos);
                addPhotos(estate.photos);
                return;
              }
            }
          }
        }
      }
    }

    return photos.slice(0, 100);
  }, [entity, entityType, data]);

  
  // Вычисляем отфильтрованные фото с защитой
  const filteredPhotos = Array.isArray(allPhotos) && allPhotos.length > 0 
    ? (filter === 'all' ? allPhotos : allPhotos.filter(p => p && p.type === filter)) 
    : [];

  // Функции навигации с защитой от пустого массива
  const next = () => {
    if (filteredPhotos.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % filteredPhotos.length);
  };

  const prev = () => {
    if (filteredPhotos.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
  };

  
  // Корректировка индекса при открытии галереи
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setFilter('all');
      setCaptionOpen({});
    }
  }, [isOpen]);
  
  
  // Корректировка индекса при смене фильтра
  useEffect(() => {
    if (!Array.isArray(filteredPhotos)) return;
    if (filteredPhotos.length === 0) {
      setCurrentIndex(0);
      return;
    }
    if (currentIndex >= filteredPhotos.length || currentIndex < 0) {
      setCurrentIndex(0);
    }
  }, [filter, filteredPhotos.length, currentIndex]); 


  // для логирования следов
  useEffect(() => {
    if (!isOpen || !entity) return;

    const key = `gallery_${entityType}_${entity.name || entity.estateName || 'no_name'}`;
    if (localStorage.getItem(key)) return;  // уже логировали

    logEvent('open_gallery', {
      entity_type: entityType,
      entity_name: entity.name || entity.estateName,
      district: entity.districtName,
    });

    localStorage.setItem(key, '1');
    setTimeout(() => localStorage.removeItem(key), 5 * 60 * 1000); // 5 мин
  }, [isOpen, entity, entityType]);


  // Текущая фото с полной защитой
  const currentPhoto = filteredPhotos.length > 0 && currentIndex < filteredPhotos.length && filteredPhotos[currentIndex]
    ? filteredPhotos[currentIndex]
    : null;

  // Ранние выходы
  if (!isOpen || !entity) return null;



  return (
    <div className="fixed inset-0 bg-slate-800/95 z-50 flex flex-col" onClick={onClose}>
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-800/80 to-transparent p-4 flex justify-between items-center text-white z-10" onClick={e => e.stopPropagation()}>
        <div>
          <h2 className="text-xl font-bold">{entity.name || entity.estateName}</h2>
          <p className="text-sm opacity-90">{entity.districtName || entityType}</p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-full transition"
        >
          <X size={28} />
        </button>
      </div>

      {/* Фильтры */}
      <div className="flex gap-3 px-6 py-3 bg-slate-800/50 backdrop-blur border-y border-white/40 overflow-x-auto">
        {['all', 'sketch', 'example', 'specific'].map(key => (
          <button
            key={key}
            onClick={e => { e.stopPropagation(); setFilter(key); setCurrentIndex(0); }}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              filter === key
                ? 'bg-orange-600 text-white'
                : 'bg-white/15 border border-white/20 text-white hover:bg-white/30'
            }`}
          >
            {key === 'all' ? 'Все фото' : 
             key === 'sketch' ? 'Визуализации' :
             key === 'example' ? 'Реальные' : 'Особые фото'} 
            <span className="ml-2 opacity-70">
              ({key === 'all' ? allPhotos.length : allPhotos.filter(p => p.type === key).length})
            </span>
          </button>
        ))}
      </div>

      {/* Основное фото */}
      <div className="flex-1 relative flex items-center justify-center px-4 py-2 overflow-hidden" onClick={e => e.stopPropagation()}>
        {currentPhoto ? (
          <>
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg shadow-2xl">
              <img
                src={currentPhoto.url}
                alt=""
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Навигация и Info — только если есть фото */}
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-8 top-1/2 -translate-y-1/2 p-2 bg-slate-800/50 hover:bg-slate-800/70 text-white rounded-full backdrop-blur"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-8 top-1/2 -translate-y-1/2 p-2 bg-slate-800/50 hover:bg-slate-800/70 text-white rounded-full backdrop-blur"
            >
              <ChevronRight size={32} />
            </button>

            {currentPhoto.description && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  setCaptionOpen(prev => ({ ...prev, [currentIndex]: !prev[currentIndex] }));
                }}
                className="absolute bottom-6 right-8 p-2 bg-cyan-600 text-white rounded-full shadow-xl shadow-white/10 transition"
              >
                <Info size={30} />
              </button>
            )}
          </>
        ) : (
          <div className="text-white text-center bg-white/10 border border-white/20 rounded-2xl text-md font-medium px-4 py-4">
            Фото по этому фильтру отсутствуют<br />
            <span className="text-sm opacity-80 mt-2 block ">
              (попробуйте другой тип фото)
            </span>
          </div>
        )}

        {currentPhoto?.description && showCaptionOpen[currentIndex] && (
          <div
            className="fixed inset-0 z-40 flex items-end pb-24 px-4"
            onClick={() => setCaptionOpen(prev => {
              const newState = { ...prev };
              newState[currentIndex] = false;
              return newState;
            })}
          >
            <div
              className="w-full max-w-3xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <p className="flex justify-center items-center text-xs text-orange-600 bg-orange-100/80 border border-orange-400 px-2 py-1 rounded-full mb-4">{currentPhoto.label}</p>
              <p className="text-sm leading-relaxed text-slate-900">{currentPhoto.description}</p>
              
              <button
                onClick={() => setCaptionOpen(prev => {
                  const newState = { ...prev };
                  newState[currentIndex] = false;
                  return newState;
                })}
                className="mt-4 px-2 py-1 bg-slate-600/40 text-white rounded-full text-xs font-normal border border-slate-400 transition"
              >
                ЗАКРЫТЬ
              </button>
            </div>
          </div>
        )}

      </div>



      {/* Миниатюры */}
      <div className="p-4 pb-24 bg-slate-800/80 backdrop-blur border-t border-white/50 overflow-x-auto" onClick={e => e.stopPropagation()}>
        <div className="flex gap-2 justify-center flex-nowrap">
          {filteredPhotos.map((photo, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setCurrentIndex(i); }}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-3 transition ${
                i === currentIndex ? 'border-orange-500 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


export default PhotoGalleryModal;