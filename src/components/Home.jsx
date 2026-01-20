// src/components/Home.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { logEvent } from '../utils/analytics';


export default function Home() {
  const { data } = useStore();
  
  const home_about_text = (
    <div>
      <p className="font-bold mt-2 mb-2">Жемчужина Грузии на берегу Чёрного моря</p>
      <p className="font-normal mb-2">Живописные пляжи 🏖️🌊, мягкий климат ☀️ и богатая культура 🏛️ делают этот регион идеальным местом для жизни и инвестиций 💰</p>
      <p className="font-normal mb-2">Мы предлагаем эксклюзивные объекты недвижимости 🏢 на первой линии моря с доходностью 10–15% годовых 📈</p>
      <p className="font-semibold mb-2">Откройте свой уголок рая с нами! 🌴✨</p>
    </div>
  );



  const hot = Object.values(data?.districts || {})
    .flatMap(d => Object.values(d.estates || {})
      .map(e => {
        const minPrice = Math.min(...Object.values(e.blocks || {})
          .flatMap(b => Object.values(b.apartment_types || {}))
          .flatMap(t => t.apartments.map(a => a.price_usd || Infinity)));

        // Собираем первые 2 фото из sketch и example, заполняем плейсхолдером при необходимости
        const allPhotos = [
          ...(e.photos?.sketch || []).map(p => p.url).filter(Boolean),
          ...(e.photos?.example || []).map(p => p.url).filter(Boolean)
        ];
        while (allPhotos.length < 2) allPhotos.push('/placeholder.jpg');
        const photos2 = allPhotos.slice(0, 2);

        return { ...e, district: d.name, minPrice, photos2 };
      }))
    .sort((a, b) => a.minPrice - b.minPrice)
    .slice(0, 6);

  useEffect(() => {
    const key = 'logged_open_home';
    if (localStorage.getItem(key)) return;

    const unsubscribe = useStore.subscribe((state) => {
      if (state.userId) {                      // ← ждём, пока userId появится
        logEvent('open_home', {
          // можно добавить детали, если нужно
        });
        localStorage.setItem(key, '1');
        setTimeout(() => localStorage.removeItem(key), 30 * 60 * 1000);
        unsubscribe();                         // ← сразу отписываемся, чтобы не висеть
      }
    });

    // Если userId уже есть прямо сейчас — логируем мгновенно
    if (useStore.getState().userId) {
      logEvent('open_home', {});
      localStorage.setItem(key, '1');
      setTimeout(() => localStorage.removeItem(key), 30 * 60 * 1000);
    }

    // cleanup на всякий случай
    return () => unsubscribe();
  }, []);



  return (
    <div className="mt-6">
      {/* <h1 className="text-3xl font-extralight mb-6 text-">Горячие предложения в Аджарии</h1> */}
      <div className="text-center tracking-wider mb-8 p-6 bg-gradient-to-b from-cyan-400 to-sky-700 rounded-3xl text-white">
        <h1 className="text-2xl font-bold mb-2">🌅 А Д Ж А Р И Я 🌇</h1>
        <p className="text-md opacity-90">ЖИВИ НА ПЕРВОЙ ЛИНИИ</p>
        <p className="text-md font-serif mt-2">Доход 10-15%</p>
      </div>
      {/* <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl text-sm font-bold text-gray-900 whitespace-nowrap pointer-events-none z-50 border border-rose-200 min-w-max"> */}
      
      <div className="max-w-2xl mx-auto px-4 mb-12 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl tracking-tighter text-left font-bold border border-rose-200 text-orange-900">
        {home_about_text}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {hot.map(estate => (
          <Link
            key={estate.name}
            to={`/estate/${estate.district}/${estate.name}`}
            className="group block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition"
          >
            <div className="aspect-w-16 aspect-h-9 relative h-56 bg-white-200 overflow-hidden">
              <div className="grid grid-cols-2 gap-0 h-full">
                <img
                  src={estate.photos2[0]}
                  alt={estate.name + ' 1'}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <img
                  src={estate.photos2[1]}
                  alt={estate.name + ' 2'}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 z-10">
                 <h3 className="text-xl font-bold text-white">{estate.name}</h3>
                 <p className="text-white/90">{estate.district}</p>
               </div>
             </div>
              <div className="p-5">
              <p className="text-2xl font-bold text-cyan-600">
                от ${estate.minPrice.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}