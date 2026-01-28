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
  ArrowBigDownDash,
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
        <div className="bg-gradient-to-br from-cyan-50 to-emerald-50/90  rounded-3xl shadow-xl border border-cyan-300 p-6 md:p-8">
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
                      ? 'bg-cyan-600/80 text-white border-cyan-400 shadow-md'
                      : 'bg-white/90 text-slate-700 border-cyan-200 '
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
          <div className="space-y-5 bg-white/90 rounded-2xl p-6 border border-cyan-200">
            {tabContent[activeTab].points.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-4 flex-shrink-0">
                  <CloudSun size={20} className="text-cyan-600" />
                </div>
                <p className="text-slate-800 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Лучшие предложения — 2 апартамента */}
      <div className="max-w-4xl mx-auto px-4 mt-24">
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/90 to-rose-500/90 text-white px-6 py-3 rounded-xl shadow-lg">
            <Speech size={20} className="text-white" />
            <h2 className="text-lg md:text-2xl font-semibold tracking-wide">
              Горячие предложения
            </h2>
            <ArrowBigDownDash size={20} className="text-white -mb-1" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredApartments.map((apt) => (
            <Link
              key={apt.apartment_id}
              to={`/apartment/${apt.apartment_id}`}
              className="bg-white/90 rounded-2xl overflow-hidden border border-slate-200 shadow-lg"
            >
              <div className="h-56 bg-slate-100 relative">
                <img
                  src={apt.photos}
                  alt={`${apt.estateName} — ${apt.typeName}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold">{apt.estateName}</h3>
                  <p className="text-white/90">{apt.districtName}</p>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-500">{apt.typeName} • {apt.m2} м²</p>
                    <p className="text-2xl font-bold text-cyan-600">
                      ${apt.price_usd.toLocaleString()}
                    </p>
                  </div>
                  <Building size={28} className="text-cyan-600" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Призыв к полному каталогу */}
        <div className="text-center mt-10">
          <Link
            to="/districts"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/90 to-rose-500/90 text-white px-4 py-2 rounded-xl font-semibold text-lg shadow-lg"
          >
            <MapPin size={20} />
            Посмотреть все районы и комплексы
          </Link>
        </div>
      </div>

      {/* Кнопка бота внизу */}
      <div className="fixed bottom-20 left-12 right-12 z-50 md:static md:mt-12 md:max-w-md md:mx-auto">
        <button
          onClick={() => window.Telegram?.WebApp?.openTelegramLink('https://t.me/AIRealtyTest_bot')}
          className="w-full bg-gradient-to-r from-teal-600/90 to-cyan-600/90 text-white px-2 py-1 rounded-2xl font-semibold text-md flex items-center justify-center gap-2 shadow-2xl"
        >
          <BotMessageSquare size={32} />
          <div className="flex flex-col items-start ">
            <span>Спросить Эладжа</span>
            <span className="text-sm font-normal -mt-1 opacity-90">о лучших вариантах</span>
          </div>
        </button>
      </div>
    </div>
  );
}