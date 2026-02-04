// src/components/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { logEvent } from '../utils/analytics';
import {
  Waves,
  Mountain,
  Trees,
  DollarSign,
  Heart,
  Shield,
  Speech,
  Flame,
  MoveRight,
  ArrowDown,
  Sparkles,
  MapPin,
  CloudSun,
  Building,
  Coffee,
  BotMessageSquare,
} from 'lucide-react';

export default function Home() {
  const { data } = useStore();
  const [activeTab, setActiveTab] = useState('lifestyle');


  // Выбранные 2 апартамента (по apartment_id)
  const featuredApartmentIds = ['0ca3e94f', '5c82d886']; // пример: 1+1 в Alliance Centropolis и 1+1 в другом ЖК

  const featuredApartments = featuredApartmentIds
    .map((id) => {
      // Ищем апартамент по всему дереву
      let found = null;
      Object.values(data?.districts || {}).forEach((district) => {
        Object.values(district.estates || {}).forEach((estate) => {
          Object.values(estate.blocks || {}).forEach((block) => {
            Object.values(block.apartment_types || {}).forEach((type) => {
              const apt = type.apartments?.find((a) => a.apartment_id === id);
              if (apt) {
                found = {
                  ...apt,
                  estateName: estate.name,
                  districtName: district.name,
                  typeName: type.name,
                  photos: estate.photos?.specific?.[0]?.url || estate.photos?.example?.[0]?.url || '/placeholder.jpg',
                };
              }
            });
          });
        });
      });
      return found;
    })
    .filter(Boolean);


  // Логирование открытия главной страницы
  useEffect(() => {
    const key = 'logged_open_home';
    if (localStorage.getItem(key)) return;

    logEvent('open_home', {});
    localStorage.setItem(key, '1');
    setTimeout(() => localStorage.removeItem(key), 30 * 60 * 1000);
  }, []);


  // Контент вкладок "Почему Аджария"
  const tabContent = {
    lifestyle: {
      icon: <Heart className="text-rose-600" size={20} />,
      title: 'Стиль жизни у моря',
      points: [
        'Просыпаться под шум волн и пить кофе на балконе с видом на закат',
        'Прогулки по набережной Батуми круглый год',
        'Мягкий субтропический климат — +15…+28 °C зимой и летом',
        'Грузинская кухня, вино и гостеприимство в шаговой доступности',
      ],
    },
    investment: {
      icon: <Shield className="text-green-600" size={20} />,
      title: 'Надёжная инвестиция',
      points: [
        'Доходность от долгосрочной аренды 10–12% годовых',
        'Стабильный рост цен на первой линии 10–20% в год',
        'Безвизовый режим для граждан 95+ стран',
        'Низкие налоги на недвижимость и доход от аренды',
      ],
    },
    nature: {
      icon: <Trees className="text-emerald-600" size={20} />,
      title: 'Природа и экология',
      points: [
        'Чистое Чёрное море и галечные / песчаные пляжи',
        'Ботанический сад, горы и термальные источники рядом',
        'Сосновые рощи и свежий горный воздух в 10–15 минутах',
        'Экологически чистый регион с мягким климатом',
      ],
    },
  };

  return (
    <div className="pb-20">
      {/* <h1 className="flex-full text-xl md:text-sm leading-relaxed text-center opacity-90 font-bold bg-gradient-to-r from-orange-700 to-rose-600 bg-clip-text text-transparent mb-2">
        ДОХОДНАЯ НЕДВИЖИМОСТЬ В ГРУЗИИ 
      </h1> */}
      {/* Hero блок */}
      <div className="relative h-80 md:h-96 overflow-hidden rounded-b-3xl">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-100/20 via-black/40 to-slate-900/90 z-10" />
        <img
          src="https://res.cloudinary.com/dpmxeg2un/image/upload/v1766514389/jbq69geubsaesghjyajz.jpg"
          alt="Закат в Батуми"
          className="w-full h-full object-cover blur-xs"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white text-center px-6 ">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 -mt-12 tracking-wide">АДЖАРИЯ</h1>
          <p className="text-xl md:text-2xl leading-relaxed font-light opacity-90 mb-6">Первая линия Чёрного моря</p>
          <div className="flex items-center gap-6 text-lg">
            <div className="flex flex-col items-center">
              <Waves size={32} />
              <span className="text-sm mt-1">Море</span>
            </div>
            <div className="flex flex-col items-center">
              <Mountain size={32} />
              <span className="text-sm mt-1">Горы</span>
            </div>
            <div className="flex flex-col items-center">
              <Sparkles size={32} />
              <span className="text-sm mt-1">Стиль</span>
            </div>
            <div className="flex flex-col items-center">
              <DollarSign size={32} />
              <span className="text-sm mt-1">10–12%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Вкладки "Почему Аджария" */}
      <div className="max-w-4xl mx-auto px-4 py-0 -mt-16 relative z-30">
        <div className="bg-gradient-to-br from-cyan-50 to-emerald-50/90  rounded-3xl shadow-xl border border-cyan-400/80 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-cyan-700">
            Почему выбирают Аджарию
          </h2>

          {/* Квадратные вкладки */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
            {Object.keys(tabContent).map((key) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-200 border ${
                    isActive
                      ? 'bg-cyan-600/80 text-white border-cyan-400/80 shadow-md'
                      : 'bg-white/90 text-slate-700 border-cyan-200/80 '
                  }`}
                >
                  <div className={isActive ? 'text-white' : 'text-cyan-600'}>
                    {React.cloneElement(tabContent[key].icon, {
                      size: 28,
                      className: isActive ? 'text-white' : 'text-cyan-600',
                    })}
                  </div>
                  <span className="text-sm md:text-base font-medium text-center leading-tight">
                    {tabContent[key].title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Содержимое активной вкладки */}
          <div className="space-y-5 bg-white/90 rounded-2xl p-6 border border-cyan-200/80 shadow-sm">
            {tabContent[activeTab].points.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-4 flex-shrink-0">
                  <Sparkles size={20} className="text-cyan-600" />
                </div>
                <p className="text-slate-800 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Кнопка бота */}
      <div className="max-w-4xl mx-auto px-4 mt-10 md:mt-12 sticky top-10 z-40 md:static">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-cyan-200/80 p-2 md:p-4">
          <button
            onClick={() => {
              const key = `logged_ask_bot_home`;
              if (!localStorage.getItem(key)) {
                logEvent('ask_bot_home', {});
                localStorage.setItem(key, '1');
                setTimeout(() => localStorage.removeItem(key), 60 * 1000);
              }
              // window.Telegram?.WebApp?.openTelegramLink('https://t.me/AIRealtyTest_bot');
              // Формируем текст для вставки
              const prefilledText = `Эладж, расскажи о лучших предложениях недвижимости в Аджарии!`;
              
              // Кодируем текст и формируем URL, затем открываем бота
              const botUrl = `https://t.me/AIRealtyTest_bot?text=${encodeURIComponent(prefilledText)}`;
              window.Telegram?.WebApp?.openTelegramLink(botUrl);
            }}
            className="w-full bg-gradient-to-r from-teal-600/80 to-cyan-600/80 text-white py-2 rounded-2xl font-semibold text-md flex items-center justify-center gap-4 shadow-2xl hover:brightness-110 transition-all"
          >
            <BotMessageSquare size={32} className="animate-gentle-pulse" />
            <div className="flex flex-col items-start">
              <span className="text-xl">Спросить Эладжа</span>
              <span className="text-sm font-normal opacity-90 -mt-1">о лучших вариантах и ценах</span>
            </div>
          </button>
        </div>
      </div>

      {/* Лучшие предложения — 2 апартамента */}
      <div className="max-w-4xl mx-auto px-4 mt-20">
        <div className="relative flex flex-col items-center mb-10">
          {/* Верхняя "крепёжная" линия */}
          <div className="w-3/4 md:w-3/4 h-0.5 mb-6 bg-gradient-to-r from-rose-600/80 via-orange-600/60 to-rose-600/80 rounded-full shadow-sm animate-gentle-pulse" />

          {/* Плашка + боковые стрелки */}
          <div className="relative flex items-center justify-center gap-6 md:gap-10">
            {/* Левая стрелка */}
            {/* <ArrowDown
              size={24}
              className="text-orange-400 -rotate-90 -mb-16 animate-gentle-pulse absolute -left-8 md:-left-12"
            /> */}
            {/* Колечки */}
            <div className="absolute z-20 -top-7 left-1/4 transform -translate-x-1/2 flex flex-col items-center">
              <div className="w-1 h-2 bg-rose-400"></div>
              <div className="w-2 h-4 rounded-full border-2 border-rose-400"></div>
              <div className="w-1 h-2 bg-rose-400"></div>
            </div>
            <div className="absolute z-20 -top-7 left-3/4 transform -translate-x-1/2 flex flex-col items-center">
              <div className="w-1 h-2 bg-rose-400"></div>
              <div className="w-2 h-4 rounded-full border-2 border-rose-400"></div>
              <div className="w-1 h-2 bg-rose-400"></div>
            </div>

            {/* Плашка о горячих предложениях */}
            <div className="inline-flex items-center gap-4 bg-white/80  text-white border border-rose-200/60 px-6 py-3 rounded-md shadow-md z-10">
              <Speech size={32} className="text-rose-600/80 animate-gentle-pulse" />
              <h2 className="text-2xl text-center md:text-2xl font-semibold bg-gradient-to-r from-orange-600/90 to-rose-600/90 bg-clip-text text-transparent tracking-tight">
                Горячие предложения апартаментов
              </h2>
              <Flame size={32} className="text-orange-600/80 animate-gentle-pulse" />
            </div>

            {/* Правая стрелка */}
            {/* <ArrowDown
              size={24}
              className="text-rose-400 rotate-90 -mb-16 animate-gentle-pulse absolute -right-8 md:-right-12"
            /> */}
          </div>

          {/* Нижняя линия (опционально — для симметрии) */}
          {/* <div className="w-1/2 md:w-1/2 h-1 bg-gradient-to-r from-transparent via-orange-400/60 to-transparent rounded-full mt-4 shadow-sm animate-gentle-pulse" /> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredApartments.map((apt) => (
            <Link
              key={apt.apartment_id}
              to={`/apartment/${apt.apartment_id}`}
              className="bg-white/90 rounded-2xl overflow-hidden border border-slate-200/80 shadow-lg"
            >
              <div className="h-56 bg-slate-100 relative">
                <img
                  src={apt.photos}
                  alt={`${apt.estateName} — ${apt.typeName}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-bold">{apt.estateName}</h3>
                  <p className="text-white/90">{apt.districtName}</p>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-cyan-50/90 text-cyan-700 text-xs rounded">
                        {apt.typeName}
                      </span>
                      <span className="px-2 py-1 bg-rose-50/90 text-rose-700 text-xs rounded">
                        {apt.m2} м²
                      </span>
                      {apt.finishing && (
                        <span className="px-2 py-1 bg-green-50/90 text-green-700 text-xs rounded">
                          {apt.finishing}
                        </span>
                      )}
                      {apt.furnished && (
                        <span className="px-2 py-1 bg-orange-50/90 text-orange-700 text-xs rounded">
                          {apt.furnished}
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-cyan-600">
                      ${apt.price_usd.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs text-slate-600 ml-12 mb-1">к апарт.</span>
                  <MoveRight size={28} className="text-cyan-600 animate-gentle-pulse" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Призыв к полному каталогу */}
        <div className="text-center mt-10">
          <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-rose-200/80 p-2">

            <Link
              to="/districts"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600/80 to-rose-600/80 text-white px-4 py-2 rounded-2xl font-semibold text-lg shadow-lg"
            >
              <MapPin size={20} />
              Посмотреть все районы и комплексы
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}