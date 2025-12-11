// src/components/PhotoGalleryModal.jsx
import React, { useState } from 'react';

const CloseIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LeftArrow = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
  </svg>
);

const RightArrow = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PhotoGalleryModal = ({ isOpen, onClose, estate, districtName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('all');
  const [showDescription, setShowDescription] = useState(false); // Унифицировали: одно значение (true/false)

  if (!isOpen || !estate) return null;

  // Сбор фото (без изменений)
  const allPhotos = [];
  const addPhotos = (photosObj) => {
    if (!photosObj) return;
    ['sketch', 'example', 'specific'].forEach(type => {
      photosObj[type]?.forEach(photo => {
        if (photo.url) {
          allPhotos.push({
            url: photo.url,
            description: photo.description || '',
            type,
            label: type === 'sketch' ? 'Визуализация' : type === 'example' ? 'Примеры' : 'Реальные фото'
          });
        }
      });
    });
  };

  addPhotos(estate.photos);
  Object.values(estate.blocks || {}).forEach(block => {
    addPhotos(block.photos);
    Object.values(block.apartment_types || {}).forEach(type => {
      addPhotos(type.photos);
      (type.apartments || []).forEach(ap => addPhotos(ap.photos));
    });
  });

  const filteredPhotos = filter === 'all' ? allPhotos : allPhotos.filter(p => p.type === filter);
  const currentPhoto = filteredPhotos[currentIndex] || {};

  const next = () => setCurrentIndex(i => (i + 1) % filteredPhotos.length);
  const prev = () => setCurrentIndex(i => (i - 1 + filteredPhotos.length) % filteredPhotos.length);

  // Сброс описания и индекса при смене фильтра
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentIndex(0);
    setShowDescription(false);
  };

  if (filteredPhotos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="text-white text-center">
          <p>Фотографии отсутствуют</p>
          <button onClick={onClose} className="mt-4 text-4xl">×</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col" onClick={onClose}>
      {/* Header */}
      <div className="bg-gradient-to-b from-black/80 to-transparent p-4 flex justify-between items-center text-white z-10">
        <div>
          <h2 className="text-xl font-bold">{estate.name}</h2>
          <p className="text-sm opacity-90">{districtName}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
          <CloseIcon />
        </button>
      </div>

      {/* Фильтры */}
      <div className="flex gap-3 px-6 py-3 bg-black/50 backdrop-blur border-t border-white/60 overflow-x-auto">
        {['all', 'sketch', 'example', 'specific'].map(key => (
          <button
            key={key}
            onClick={(e) => {
              e.stopPropagation();
              setFilter(key);
              setCurrentIndex(0);
              setShowDescription(false);  // сбрасываем описание при смене фильтра
            }}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              filter === key
                ? 'bg-orange-600 text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {key === 'all' ? 'Все фото' : 
            key === 'sketch' ? 'Визуализации' :
            key === 'example' ? 'Примеры' : 'Реальные фото'} 
            <span className="ml-2 opacity-70">
              ({key === 'all' ? allPhotos.length : allPhotos.filter(p => p.type === key).length})
            </span>
          </button>
        ))}
      </div>

      {/* Основное фото */}
      <div className="flex-1 relative flex items-center justify-center px-4" onClick={e => e.stopPropagation()}>
        <img src={currentPhoto.url} alt="" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />

        {/* Навигация */}
        <button
          onClick={e => { e.stopPropagation(); prev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur z-10"
        >
          <LeftArrow />
        </button>
        <button
          onClick={e => { e.stopPropagation(); next(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur z-10"
        >
          <RightArrow />
        </button>

        {/* Кнопка описания */}
        {currentPhoto.description && (
          <button
            onClick={e => {
              e.stopPropagation();
              setShowDescription(prev => !prev);
            }}
            className="absolute bottom-6 right-6 p-3 bg-cyan-700 hover:bg-cyan-800 text-white rounded-full shadow-xl transition z-10"
          >
            <InfoIcon />
          </button>
        )}
      </div>

      {/* Описание (теперь поверх всего, с возможностью закрытия) */}
      {currentPhoto.description && showDescription && (
        <div
          className="fixed inset-0 bg-rose-200/50 z-40 flex items-end pb-24 px-4"
          onClick={() => setShowDescription(false)}
        >
          <div
            className="w-full max-w-3xl mx-auto bg-white/80 backdrop-blur rounded-2xl p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-xs opacity-80 mt-3 mb-3">{currentPhoto.label}</p>
            <p className="text-sm leading-relaxed text-zinc-900">{currentPhoto.description}</p>
            <button
              onClick={() => setShowDescription(false)}
              className="mt-4 text-cyan-600 underline text-sm"
            >
              ✅ Закрыть описание
            </button>
          </div>
        </div>
      )}

      {/* Нижняя панель с миниатюрами — поднимаем выше меню */}
      <div className="p-4 bg-black/80 backdrop-blur border-t border-white/10 overflow-x-auto pb-24"> {/* pb-24 = высота BottomNav */}
        <div className="flex gap-2 justify-center">
          {filteredPhotos.map((photo, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setCurrentIndex(i); setShowDescription(false); }}
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