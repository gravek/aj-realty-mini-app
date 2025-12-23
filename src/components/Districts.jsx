// src/components/Districts.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import PhotoGalleryModal from './PhotoGalleryModal';

export default function Districts() {
  const { data } = useStore();
  const [activeDistrict, setActiveDistrict] = useState('');
  const [modalOpenFor, setModalOpenFor] = useState(null);
  const [modalEstate, setModalEstate] = useState(null);

  const districts = Object.entries(data?.districts || {});

  const districts_about_text = (
    <div>
      <p className="font-mono mt-2 mb-2">Представьте утро на первой линии Чёрного моря 🌊: панорамный вид на закат 🌅, свежий бриз 🌬️, кофе на балконе вашего апартамента ☕...</p>
      <p className="font-normal mb-2">Это не просто дом — это стиль жизни, где природа 🏞️ и инфраструктура 🏙️ дарят гармонию 💚 и удобство ✨!</p>
    </div>
  );



  // Эффект для кнопки прокрутки наверх
  useEffect(() => {
    const toggleBtn = () => {
      const btn = document.getElementById('scrollTopBtn'); // Ищем кнопку каждый раз
      if (!btn) return; // Если вдруг нет — выходим

      // console.log('Scroll Y:', window.scrollY);

      if (window.scrollY > 800) {  // Можно 400-600, чтобы появлялась раньше
        btn.classList.remove('opacity-0', 'invisible', 'translate-y-10');
        btn.classList.add('opacity-100', 'visible', 'translate-y-0');
      } else {
        btn.classList.add('opacity-0', 'invisible', 'translate-y-10');
        btn.classList.remove('opacity-100', 'visible', 'translate-y-0');
      }
    };

    window.addEventListener('scroll', toggleBtn);
    toggleBtn(); // Проверка при загрузке

    return () => window.removeEventListener('scroll', toggleBtn);
  }, []); // Зависимостей нет — эффект один раз

  // Отслеживаем, какой район сейчас вверху экрана
  useEffect(() => {

    const handleScroll = () => {
      let current = '';
      districts.forEach(([key]) => {
        const el = document.getElementById(`district-${key}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) { // чуть ниже шапки
            current = key;
          }
        }
      });
      setActiveDistrict(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // при загрузке
    return () => window.removeEventListener('scroll', handleScroll);
  }, [districts]);

  const scrollToDistrict = (key) => {
    document.getElementById(`district-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!data?.districts) {
    return <div className="p-8 text-center">Загрузка районов…</div>;
  }

  return (
    <div className="mt-6 pb-20 relative">
      {/* Вертикальная шкала-оглавление */}
      <div className="fixed left-3 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
        <div className="relative">
          {/* Вертикальная линия-шкала */}
          <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-orange-500 to-transparent opacity-60" />
          
          {/* Точки и подписи */}
          <div className="flex flex-col justify-center items-center space-y-24 pointer-events-auto">
            {districts.map(([key, district]) => (
              <button
                key={key}
                onClick={() => scrollToDistrict(key)}
                className="group relative flex items-center"
              >
                {/* Точка-элипс */}
                <div
                  className={`w-1 h-6 rounded-full border-2 transition-all duration-1000 ${
                    activeDistrict === key
                      ? 'bg-orange-600 border-rose-600 scale-250 shadow-lg shadow-orange-500/50'
                      : 'bg-white border-amber-500 group-hover:border-orange-500 group-hover:scale-110'
                  }`}
                />

                {/* Подпись (повёрнута на 90°) */}
                <span
                  className={`absolute top-6 left-3 -rotate-90 origin-left whitespace-nowrap text-xs font-medium transition-all duration-300 ${
                    activeDistrict === key
                      ? 'text-orange-900 font-bold opacity-100'
                      : 'text-amber-600 opacity-70 group-hover:opacity-100 group-hover:text-orange-800'
                  }`}
                >
                  {district.name}
                </span>

                {/* Пульсация при активном */}
                {activeDistrict === key && (
                  <div className="absolute inset-0 w-1 h-6 rounded-full bg-orange-500 animate-ping opacity-75" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-5xl mx-auto ml-6"> {/* отступ под боковую панель */}
        <div className="text-center mb-12 px-8">
          <h1 className="text-4xl font-bold text-orange-900 mb-3">Районы Аджарии</h1>
          <p className="text-amber-700 text-lg">выберите свой идеальный уголок у моря</p>
        </div>

        <div className="max-w-2xl mx-auto px-4 mb-12 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl tracking-tighter text-left font-bold border border-rose-300 text-orange-800">
          {districts_about_text}
        </div>

        {districts.map(([key, district]) => {
          // ← Считаем наличие фото (просто обычная функция)
          const hasPhotos = (() => {
            let count = 0;
            const countPhotos = (obj) => {
              if (!obj) return;
              ['sketch', 'example', 'specific'].forEach(t => {
                count += (obj[t] || []).filter(p => p.url).length;
              });
            };
            countPhotos(district.photos);
            Object.values(district.estates || {}).forEach(e => {
              countPhotos(e.photos);
              Object.values(e.blocks || {}).forEach(b => {
                countPhotos(b.photos);
                Object.values(b.apartment_types || {}).forEach(t => {
                  countPhotos(t.photos);
                  (t.apartments || []).forEach(a => countPhotos(a.photos));
                });
              });
            });
            return count > 0;
          })();

          // ← Находим estates
          const estates = Object.values(district.estates || {})
            .map(e => {
              const minPrice = Math.min(...Object.values(e.blocks || {})
                .flatMap(b => Object.values(b.apartment_types || {}))
                .flatMap(t => t.apartments.map(a => a.price_usd || Infinity)));
              const allPhotos = [
                ...(e.photos?.sketch || []).map(p => p.url).filter(Boolean),
                ...(e.photos?.example || []).map(p => p.url).filter(Boolean)
              ];
              while (allPhotos.length < 2) allPhotos.push('/placeholder.jpg');
              const photos2 = allPhotos.slice(0, 2);
              return { ...e, minPrice, photos2 };
            })
            .sort((a, b) => a.minPrice - b.minPrice);

          return (
            <section key={key} id={`district-${key}`} className="relative py-4 px-2">
              
              {/* Разделитель (линия) */}
              <div className="my-12 h-px bg-gradient-to-r from-rose-200 via-orange-300 to-rose-200" />

              {/* Заголовок района */}
              <div className="my-2 bg-gradient-to-r from-cyan-600 to-sky-600 rounded-3xl p-8 text-white shadow-2xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{district.name}</h2>
                {district.description && (
                  <p className="text-white/95 text-lg leading-relaxed max-w-3xl">
                    {district.description}
                  </p>
                )}
                {district.photos?.specific?.[0]?.url && (
                  <img
                    src={district.photos.specific[0].url}
                    alt={district.name}
                    className="w-full h-48 object-cover rounded-2xl mt-6 shadow-xl"
                  />
                )}
              </div>

              {/* Кнопка всех фото района */}
              <div className="flex my-8 justify-center items-center">
                {hasPhotos && (
                  <button
                    onClick={() => setModalOpenFor(key)}
                    className="mt-6 bg-gradient-to-r from-orange-600 to-rose-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition"
                  >
                    Показать все фото района
                  </button>
                )}
              </div>

              {/* Карточки объектов */}
              <div className="sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {estates.map(estate => (
                  <Link
                    key={estate.name}
                    to={`/estate/${district.name}/${estate.name}`}
                    className="group block my-4 bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <div className="grid grid-cols-1 h-full w-full">
                        <img src={estate.photos2[0]} alt={`Фото объекта ${estate.name}`} className="object-cover group-hover:scale-110 transition h-full w-full" />
                        <img src={estate.photos2[1]} alt={`Фото объекта ${estate.name}`} className="object-cover group-hover:scale-110 transition h-full w-full" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-2xl font-bold">{estate.name}</h3>
                        {estate.developer_name && estate.developer_name !== '-' && (
                          <p className="text-sm opacity-90">{estate.developer_name}</p>
                        )}
                      </div>
                    </div>
                    <div className="p-6 relative">
                      {estate.description && (
                        <p className="text-gray-700 text-sm line-clamp-3 mb-4">{estate.description}</p>
                      )}
                      {estate.minPrice && (
                        <p className="text-3xl font-bold text-cyan-600">
                          от ${estate.minPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              <PhotoGalleryModal
                isOpen={modalOpenFor === key}
                onClose={() => setModalOpenFor(null)}
                entity={district}
                entityType="district"
              />
            </section>
          );
        })}
      </div>
      
      {/* Кнопка "Наверх" — появляется при скролле вниз */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-24 right-6 z-50 bg-white/80 backdrop-blur-md border border-rose-400 rounded-full p-3 shadow-2xl hover:shadow-orange-500 hover:scale-110 transition-all opacity-0 invisible translate-y-10"
        id="scrollTopBtn"
      >
        <svg className="w-6 h-6 text-orange-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
}