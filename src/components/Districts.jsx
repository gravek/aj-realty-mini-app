// src/components/Districts.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import PhotoGalleryModal from './PhotoGalleryModal';
import { logEvent } from '../utils/analytics';
import { 
  MapPin, 
  Waves, 
  Mountain, 
  Gem, 
  MountainSnow, 
  SquareDashedMousePointer, 
  Briefcase, 
  Trees, 
  Building, 
  Heart, 
  DollarSign,
  Shield,
  Zap,
  BotMessageSquare,
  User,
  Camera,
  Coffee,
  Sparkles,
  MoveRight,
  Car,
  Train,
  CloudSun
} from 'lucide-react';

export default function Districts() {
  const { data } = useStore();
  const [activeDistrict, setActiveDistrict] = useState('');
  const [modalOpenFor, setModalOpenFor] = useState(null);
  const [activeAdvantageTab, setActiveAdvantageTab] = useState('lifestyle'); // lifestyle, investment, nature

  const districts = Object.entries(data?.districts || {});


// Функция для определения ценовых категорий в районе
const getPriceCategories = (district) => {
  const allPrices = Object.values(district.estates || {})
    .flatMap(e => Object.values(e.blocks || {}))
    .flatMap(b => Object.values(b.apartment_types || {}))
    .flatMap(t => t.apartments.map(a => a.price_usd))
    .filter(price => price > 0);
  
  if (allPrices.length === 0) return [];
  
  // Считаем количество объектов в каждой категории
  const categories = {
    'Эконом': { count: 0, max: 80000, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    'Бизнес': { count: 0, min: 80001, max: 150000, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    'Премиум': { count: 0, min: 150001, max: 250000, color: 'bg-orange-100 text-orange-800 border-orange-200' },
    'Люкс': { count: 0, min: 250001, color: 'bg-purple-100 text-purple-800 border-purple-200' }
  };
  
  // Распределяем цены по категориям
  allPrices.forEach(price => {
    if (price <= 80000) {
      categories['Эконом'].count++;
    } else if (price <= 150000) {
      categories['Бизнес'].count++;
    } else if (price <= 250000) {
      categories['Премиум'].count++;
    } else {
      categories['Люкс'].count++;
    }
  });
  
  // Фильтруем только категории, в которых есть объекты
  const result = [];
  
  if (categories['Эконом'].count > 0) {
    result.push({ 
      label: 'Эконом', 
      range: 'до $80k', 
      color: categories['Эконом'].color,
      count: categories['Эконом'].count 
    });
  }
  
  if (categories['Бизнес'].count > 0) {
    result.push({ 
      label: 'Бизнес', 
      range: '$80k-150k', 
      color: categories['Бизнес'].color,
      count: categories['Бизнес'].count 
    });
  }
  
  if (categories['Премиум'].count > 0) {
    result.push({ 
      label: 'Премиум', 
      range: '$150k-250k', 
      color: categories['Премиум'].color,
      count: categories['Премиум'].count 
    });
  }
  
  if (categories['Люкс'].count > 0) {
    result.push({ 
      label: 'Люкс', 
      range: 'от $250k', 
      color: categories['Люкс'].color,
      count: categories['Люкс'].count 
    });
  }
  
  return result;
};

  // Маркетинговые описания для районов
  const getDistrictAdvantages = (districtName) => {
    const advantages = {
      'Chakvi': {
        lifestyle: {
          title: 'Идеально для семейного отдыха',
          points: [
            'Тихие пляжи с пологим входом в море',
            'Развитая инфраструктура для детей',
            'Спокойная курортная атмосфера',
            'Близость к Батуми (15 минут)'
          ],
          icon: <Heart className="text-rose-600" size={20} />
        },
        investment: {
          title: 'Высокий потенциал роста',
          points: [
            'Стабильный рост цен на 8-12% в год',
            'Высокий спрос на аренду в сезон',
            'Новые инфраструктурные проекты',
            'Налоговые льготы для инвесторов'
          ],
          icon: <DollarSign className="text-green-600" size={20} />
        },
        nature: {
          title: 'Единение с природой',
          points: [
            'Ботанический сад в шаговой доступности',
            'Чистый горный воздух',
            'Зеленые парки и скверы',
            'Термальные источники рядом'
          ],
          icon: <Trees className="text-emerald-600" size={20} />
        }
      },
      'Batumi': {
        lifestyle: {
          title: 'Элитный отдых у моря',
          points: [
            'Эксклюзивные приватные пляжи',
            'Рестораны высокой кухни',
            'SPA и wellness центры',
            'Яхтенная марина рядом'
          ],
          icon: <CloudSun className="text-amber-600" size={20} />
        },
        investment: {
          title: 'Премиум инвестиции',
          points: [
            'Рост стоимости 15-20% годовых',
            'Эксклюзивные объекты',
            'Международные резиденты',
            'Статусное расположение'
          ],
          icon: <Shield className="text-purple-600" size={20} />
        },
        nature: {
          title: 'Уникальная природа',
          points: [
            'Мыс Зеленый - природный заповедник',
            'Кристально чистое море',
            'Набережная длинной в 8 км с шикарными пальмами',
            'Уникальные растения возле набережной',
            'Панорамные виды на залив'
          ],
          icon: <Waves className="text-cyan-600" size={20} />
        }
      },
      'Kobuleti': {
        lifestyle: {
          title: 'Классика курорта',
          points: [
            'Знаменитый галечный пляж',
            'Лечебные магнитные пески',
            'Активная ночная жизнь',
            'Традиционная грузинская кухня'
          ],
          icon: <Coffee className="text-orange-600" size={20} />
        },
        investment: {
          title: 'Рентабель-ность',
          points: [
            'Стабильная арендная доходность',
            'Высокая ликвидность объектов',
            'Развитая туристическая инфраструктура',
            'Международный аэропорт рядом'
          ],
          icon: <Zap className="text-yellow-600" size={20} />
        },
        nature: {
          title: 'Целебная природа',
          points: [
            'Лечебный микроклимат',
            'Магнитные пески для здоровья',
            'Парк Колхида - уникальная экосистема',
            'Болота Кобулети - биосферный резерват'
          ],
          icon: <CloudSun className="text-sky-600" size={20} />
        }
      },
      'Mahinjauri': {
        lifestyle: {
          title: 'Баланс покоя и доступности',
          points: [
            '15 минут до центра Батуми',
            'Спокойная курортная атмосфера',
            'Все необходимое в шаговой доступности',
            'Идеально для ПМЖ'
          ],
          icon: <Car className="text-indigo-600" size={20} />
        },
        investment: {
          title: 'Золотая середина',
          points: [
            'Оптимальное соотношение цена/качество',
            'Постоянный спрос на аренду',
            'Перспективы развития района',
            'Доступные инвестиционные возможности'
          ],
          icon: <Train className="text-rose-600" size={20} />
        },
        nature: {
          title: 'Природное разно-образие',
          points: [
            'Пляж в 5 минутах ходьбы',
            'Зеленые холмы и предгорья',
            'Река Королисцкали',
            'Фруктовые сады и плантации'
          ],
          icon: <Mountain className="text-teal-600" size={20} />
        }
      }
    };

    return advantages[districtName] || advantages['Chakvi']; // дефолтные преимущества
  };

  // Декоративные элементы для районов
  const getDistrictDecorations = (districtName) => {
    const decorations = {
      'Chakvi': { 
        text: 'text-purple-800',
        gradient: 'from-fuchsia-600/90 to-purple-600/90',
        gradientLight: 'from-fuchsia-50/90 to-purple-50/90',
        border: 'border-purple-300/60',
        icon: <Trees className="text-white/50" size={64} />,
        pattern: 'bg-gradient-to-br from-fuchsia-100/20 to-purple-100/20'
      },
      'Batumi': {         
        text: 'text-cyan-800',
        gradient: 'from-teal-600 to-cyan-600',
        gradientLight: 'from-teal-100/90 to-cyan-100/90',
        border: 'border-cyan-300/60',
        icon: <Waves className="text-white/50" size={64} />,
        pattern: 'bg-gradient-to-br from-teal-100/20 to-cyan-100/20'
      },
      'Kobuleti': { 
        text: 'text-rose-800',
        gradient: 'from-pink-600 to-rose-600',
        gradientLight: 'from-pink-100/90 to-rose-100/90',
        border: 'border-rose-300/60',
        icon: <CloudSun className="text-white/50" size={64} />,
        pattern: 'bg-gradient-to-br from-pink-100/20 to-rose-100/20'
      },
      'Gonio': { 
        text: 'text-purple-800',
        gradient: 'from-fuchsia-600 to-purple-600',
        gradientLight: 'from-fuchsia-100/90 to-purple-100/90',
        border: 'border-purple-300/60',
        icon: <Mountain className="text-white/50" size={64} />,
        pattern: 'bg-gradient-to-br from-fuchsia-100/20 to-purple-100/20'
      },
      'Mahinjauri': { 
        text: 'text-indigo-800',
        gradient: 'from-blue-600 to-indigo-600',
        gradientLight: 'from-blue-100/90 to-indigo-100/90',
        border: 'border-indigo-300/60',
        icon: <Trees className="text-white/50" size={64} />,
        pattern: 'bg-gradient-to-br from-blue-100/20 to-indigo-100/20'
      }
    };
    
    return decorations[districtName] || decorations['Chakvi'];
  };

  // Остальные эффекты 
  useEffect(() => {
    const toggleBtn = () => {
      const btn = document.getElementById('scrollTopBtn');
      if (!btn) return;
      if (window.scrollY > 800) {
        btn.classList.remove('opacity-0', 'invisible', 'translate-y-10');
        btn.classList.add('opacity-100', 'visible', 'translate-y-0');
      } else {
        btn.classList.add('opacity-0', 'invisible', 'translate-y-10');
        btn.classList.remove('opacity-100', 'visible', 'translate-y-0');
      }
    };
    window.addEventListener('scroll', toggleBtn);
    toggleBtn();
    return () => window.removeEventListener('scroll', toggleBtn);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      let current = '';
      districts.forEach(([key]) => {
        const el = document.getElementById(`district-${key}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            current = key;
          }
        }
      });
      setActiveDistrict(current);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [districts]);


  // Логирование событий для аналитики
  useEffect(() => {
    const key = 'logged_open_districts';
    if (localStorage.getItem(key)) return;
    logEvent('open_districts', {});
    localStorage.setItem(key, '1');
    setTimeout(() => localStorage.removeItem(key), 3 * 60 * 1000);
  }, []);

  // Логируем фокус на районе если фокус длится не менее 3 секунд (но не чаще 1 раза в минуту для каждого района) 
  const focusTimerRef = useRef(null);  // Для хранения таймера

  useEffect(() => {
    if (!activeDistrict) return;

    const logKey = `logged_district_focus_${activeDistrict}`;

    // Если уже залогировано недавно — выходим
    if (localStorage.getItem(logKey)) return;

    // Очищаем предыдущий таймер, если был (на случай быстрой смены района)
    if (focusTimerRef.current) {
      clearTimeout(focusTimerRef.current);
    }

    // Запускаем новый таймер на _ секунд
    focusTimerRef.current = setTimeout(() => {
      // Проверяем: район всё ещё активен? (не изменился за 3 сек)
      if (activeDistrict === data?.districts?.[activeDistrict]?.name) {  // Или сравнить с сохранённым значением
        // Логируем, если да
        logEvent('focus_district', {
          district_key: activeDistrict,
          district_name: data?.districts?.[activeDistrict]?.name || 'unknown',
        });

        // Устанавливаем флаг в localStorage
        localStorage.setItem(logKey, '1');

        // Удаляем флаг через 1 минуту
        setTimeout(() => localStorage.removeItem(logKey), 1000*60 * 1);
      }
    }, 1000 * 10);  // _ секунд

    // Cleanup: очищаем таймер при размонтировании или смене зависимости
    return () => {
      if (focusTimerRef.current) {
        clearTimeout(focusTimerRef.current);
      }
    };
  }, [activeDistrict, data]);

  
  // Функция плавной прокрутки к району
  const scrollToDistrict = (key) => {
    document.getElementById(`district-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!data?.districts) {
    return <div className="p-8 text-center">Загрузка районов…</div>;
  }

  return (
    <div className="mt-6 pb-32 relative">
      {/* Вертикальная шкала-оглавление */}
      <div className="fixed left-3 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
        <div className="relative">
          {/* Вертикальная линия-шкала */}
          <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 opacity-80" />
          
          {/* Точки и подписи */}
          <div className="flex flex-col justify-center items-center space-y-24 pointer-events-auto">
            {districts.map(([key, district]) => {
              const isActive = activeDistrict === key;
              
              // Цвета для каждого района
              const getDistrictColor = () => {
                // const colors = {
                //   'Chakvi': { bg: 'bg-cyan-500', border: 'border-cyan-600', text: 'text-cyan-700' },
                //   'Batumi': { bg: 'bg-emerald-500', border: 'border-emerald-600', text: 'text-emerald-700' },
                //   'Kobuleti': { bg: 'bg-amber-500', border: 'border-amber-600', text: 'text-amber-700' },
                //   'Mahinjauri': { bg: 'bg-indigo-500', border: 'border-indigo-600', text: 'text-indigo-700' }
                // };
                const colors = {
                  'Chakvi': { bg: 'bg-purple-500', border: 'border-purple-600', text: 'text-purple-700' },
                  'Batumi': { bg: 'bg-cyan-500', border: 'border-cyan-600', text: 'text-cyan-700' },
                  'Kobuleti': { bg: 'bg-rose-500', border: 'border-rose-600', text: 'text-rose-700' },
                  'Gonio': { bg: 'bg-purple-500', border: 'border-purple-600', text: 'text-purple-700' },
                  'Mahinjauri': { bg: 'bg-indigo-500', border: 'border-indigo-600', text: 'text-indigo-700' }
                };
                return colors[district.name] || { bg: 'bg-orange-500', border: 'border-orange-600', text: 'text-orange-700' };
              };
              
              const colors = getDistrictColor();
              
              return (
                <button
                  key={key}
                  onClick={() => scrollToDistrict(key)}
                  className="group relative flex items-center"
                >
                  {/* Точка-элипс */}
                  <div
                    className={`w-1.5 h-6 rounded-full border-2 transition-all duration-1000 ${
                      isActive
                        ? `${colors.bg} ${colors.border} scale-250 shadow-lg shadow-${colors.bg}/50`
                        : 'bg-white border-slate-400 e-110'
                    }`}
                  />

                  {/* Подпись (повёрнута на 90°) */}
                  <span
                    className={`absolute top-6 left-5 -rotate-90 origin-left whitespace-nowrap text-md font-medium transition-all duration-300 ${
                      isActive
                        ? `${colors.text} font-bold opacity-100`
                        : 'text-slate-600 opacity-70 group-hover:opacity-100 group-hover:text-slate-800'
                    }`}
                  >
                    {district.name}
                  </span>

                  {/* Пульсация при активном */}
                  {isActive && (
                    <div className="absolute inset-0 w-1.5 h-6 rounded-full bg-current animate-ping opacity-75" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-6xl mx-auto ml-10 px-0">
        {/* Заголовок страницы */}
        <div className="text-center mb-16 pt-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-800 to-emerald-800 bg-clip-text text-transparent mb-4">
            Районы и Комплексы
          </h1>
          {/* <p className="text-slate-600 text-xl max-w-2xl mx-auto">
            подберем идеальное место для жизни, отдыха или инвестиций
          </p> */}
        </div>

        {/* Вводный блок */}
        <div className="max-w-3xl mx-auto mb-16 p-8 bg-gradient-to-br from-cyan-50 to-emerald-50 rounded-3xl border border-cyan-300 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500/90 to-emerald-500/90 rounded-xl flex items-center justify-center">
              <Waves className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-cyan-800/90">Ваши преимущества</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-cyan-100">
              <ul className="space-y-2 gap-1 flex flex-col">
                <li className="flex items-center text-slate-800 gap-4">
                  <Gem className="shrink-0 text-cyan-600/90" size={20}/>
                  <span>Аджарская Автономная Республика — это жемчужина Грузии!</span>
                </li>
                <li className="flex items-center text-slate-800 gap-4">
                  <MountainSnow className="shrink-0 text-cyan-600/90" size={20} />
                  <span>Уникальное сочетание морского бриза, горного воздуха и грузинского гостеприимства. </span>
                </li>
                <li className="flex items-center text-slate-800 gap-4">
                  <SquareDashedMousePointer className="shrink-0 text-cyan-600/90" size={20} />
                  <span>Каждый район имеет свой характер и преимущества для разных целей.</span>
                </li>
                <li className="flex items-center text-slate-800 gap-4">
                  <Briefcase className="shrink-0 text-cyan-600/90" size={20} />
                  <span>Мы поможем найти именно то, что соответствует вашим ожиданиям и инвестиционным планам.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Районы */}
        {districts.map(([key, district]) => {
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

          const estates = Object.values(district.estates || {})
            .map(e => {
              // Собираем все цены в ЖК
              const prices = Object.values(e.blocks || {})
                .flatMap(b => Object.values(b.apartment_types || {}))
                .flatMap(t => t.apartments.map(a => a.price_usd))
                .filter(price => price > 0);
              
              const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
              const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
              const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
              
              // Определяем ценовые категории в ЖК (согласно калькулятору)
              const priceCategories = [];
              if (prices.length > 0) {
                if (prices.some(p => p <= 80000)) priceCategories.push('Эконом');
                if (prices.some(p => p > 80000 && p <= 150000)) priceCategories.push('Бизнес');
                if (prices.some(p => p > 150000 && p <= 250000)) priceCategories.push('Премиум');
                if (prices.some(p => p > 250000)) priceCategories.push('Люкс');
              }
              
              const allPhotos = [
                ...(e.photos?.sketch || []).map(p => p.url).filter(Boolean),
                ...(e.photos?.example || []).map(p => p.url).filter(Boolean),
                ...(e.photos?.specific || []).map(p => p.url).filter(Boolean)
              ];
              while (allPhotos.length < 2) allPhotos.push('/placeholder.jpg');
              const photos2 = allPhotos.slice(0, 2);
              
              return { 
                ...e, 
                minPrice, 
                maxPrice, 
                avgPrice,
                priceCategories,
                prices,
                photos2 
              };
            })
            .sort((a, b) => a.minPrice - b.minPrice);

          const decor = getDistrictDecorations(district.name);
          const priceCats = getPriceCategories(district);
          const advantages = getDistrictAdvantages(district.name);

          return (
            <section key={key} id={`district-${key}`} className="relative py-8">
              
              {/* Заголовок района с декором */}
              <div className="relative overflow-hidden rounded-3xl mb-12 group">
                {/* Фон с градиентом и эффектом стекла */}
                <div className={`absolute inset-0 bg-gradient-to-r ${decor.gradient} blur-sm rounded-3xl`} />
                
                {/* Декоративные световые акценты */}
                {/* <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/30 to-transparent rounded-full -translate-y-32 translate-x-32 blur-3xl" /> */}
                {/* <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/20 to-transparent rounded-full translate-y-32 -translate-x-32 blur-3xl" /> */}
                
                {/* Контент */}
                <div className="relative p-8 text-white z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-6">
                      {/* Иконка с объемом */}
                      <div className="relative">
                        <div className="absolute -inset-2 bg-white/15 rounded-2xl blur-md" />
                        <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 flex items-center justify-center shadow-2xl">
                          <MapPin className="text-white" size={32} />
                        </div>
                      </div>
                      
                      <div>
                        <h2 className="text-3xl font-semibold mb-2 tracking-tight">
                          {district.name}
                        </h2>
                        {district.coords && (
                          <div className="flex items-center text-xs gap-2">
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full backdrop-blur-sm">
                              <div className="w-1 h-1 bg-white rounded-full"></div>
                              <span className="text-white/90">
                                {district.coords[0].toFixed(4)}, {district.coords[1].toFixed(4)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Декоративный элемент */}
                    <div className="opacity-30">
                      {decor.icon}
                    </div>
                  </div>
                  
                  {/* Описание */}
                  {district.description && (
                    <div className="mb-8">
                      {/* <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4 border border-white/20">
                        <span className="text-white/80 font-medium">О районе</span>
                      </div> */}
                      <p className="text-white/99 text-lg leading-relaxed max-w-3xl bg-white/20 rounded-2xl p-6 border border-white/20">
                        {district.description}
                      </p>
                    </div>
                  )}
                  
                  {/* Ценовые категории */}
                  <div className="flex flex-wrap gap-3">
                    {priceCats.map((cat, idx) => (
                      <div key={idx} className="relative">
                        {/* <div className="absolute -inset-0.5 bg-white/20 rounded-full blur-sm" /> */}
                        <div className={`relative px-2 py-0.5 rounded-full text-sm font-medium ${cat.color} border border-white/40 backdrop-blur-sm shadow-xl`}>
                          {cat.label}: <span className="font-semibold">{cat.range}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Секция "Почему этот район" */}
{/* Блок "Почему этот район" */}
<div className="max-w-4xl mx-auto px-4 py-6 -mt-4 relative z-20">
  <div className={`bg-gradient-to-br ${decor.gradientLight || 'from-cyan-50 to-emerald-50/80'} rounded-3xl shadow-xl border ${decor.border || 'border-cyan-200/70'} p-6 md:p-8`}>
    
    {/* Заголовок */}
    <h2 className={`text-2xl md:text-3xl font-bold text-center mb-8 ${decor.text || 'text-cyan-800'}`}>
      Почему стоит выбрать {district.name}
    </h2>

    {/* Квадратные кнопки вкладок */}
    <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
      {['lifestyle', 'investment', 'nature'].map((tab) => {
        const isActive = activeAdvantageTab === tab;
        const adv = advantages[tab]; // из объекта advantages

        return (
          <button
            key={tab}
            onClick={() => setActiveAdvantageTab(tab)}
            className={`
              flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-300 border
              ${isActive
                ? `bg-gradient-to-br ${decor.gradient} text-white border-opacity-40 shadow-md scale-[1.03]`
                : `bg-white/95 ${decor.text || 'text-cyan-800'} border ${decor.border || 'border-cyan-200/60'} hover:border-opacity-70 hover:shadow-sm`
              }
            `}
          >
            <div className={isActive ? 'text-white' : decor.text || 'text-cyan-600'}>
              {React.cloneElement(adv.icon, {
                size: 28,
                className: isActive ? 'text-white' : (decor.text || 'text-cyan-600'),
              })}
            </div>
            <span className="text-sm md:text-base font-normal text-center leading-tight">
              {adv.title}
            </span>
          </button>
        );
      })}
    </div>

    {/* Контент активной вкладки */}
    <div className={`bg-white/95 rounded-2xl p-6 border ${decor.border || 'border-cyan-200/50'} transition-all duration-300`}>
      <div className="space-y-5">
        {advantages[activeAdvantageTab]?.points.map((point, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <Sparkles size={16} className={`${decor.text || 'text-cyan-800'} my-1`} />
            {/* <div className={`mt-1.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${decor.gradientLight || 'bg-cyan-100'}`}>
              <div className={`w-3 h-3 rounded-full ${decor.gradient ? decor.gradient.replace('to-', 'from-') : 'bg-cyan-500'}`} />
            </div> */}
            {/* <p className="text-slate-800 leading-relaxed text-[15px] md:text-base"> */}
            <p className={`${decor.text || 'text-cyan-800'}  leading-relaxed text-[15px] md:text-base`}>
              {point}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* Нижний намёк / CTA */}
    <div className={`mt-6 text-center text-sm  ${decor.text || 'text-cyan-800'}`}>
      Подберём объект в {district.name} под ваш бюджет и цели
    </div>
  </div>
</div>

              {/* Кнопка галереи */}
              {hasPhotos && (
                <div className="text-center mt-4">
                  <div className="inline-flex items-center gap-4 bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-rose-300/40 p-2">

                          <button
                            onClick={() => setModalOpenFor(key)}
                            className="bg-gradient-to-r text-lg from-orange-600/80 to-rose-600/80 text-white font-semibold leading-relaxed py-2 px-8 rounded-2xl shadow-lg transition-shadow flex items-center gap-2"
                          >
                            <Camera size={24} className="animate-gentle-pulse" />
                            <span>Смотреть все фото {district.name}</span>
                          </button>
                        </div>
                </div>
              )}

              {/* Кнопка бота */}
              <div className="max-w-4xl mx-auto px-4 mt-4 md:mt-4 sticky top-10 z-40 md:static">
                <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-cyan-300/40 p-2 md:p-4">
                  <button
                    onClick={() => {
                      const key = `logged_ask_bot_districts_${district.name}`;
                      if (!localStorage.getItem(key)) {
                        logEvent('ask_bot_districts', {});
                        localStorage.setItem(key, '1');
                        setTimeout(() => localStorage.removeItem(key), 60 * 1000);
                      }
                      // window.Telegram?.WebApp?.openTelegramLink('https://t.me/AIRealtyTest_bot');
                      // Формируем текст для вставки в чат
                      const prefilledText = `Расскажи о ${district.name} и объектах в нем`;
                      
                      // Кодируем текст и формируем URL, затем открываем бота
                      const botUrl = `https://t.me/AIRealtyTest_bot?text=${encodeURIComponent(prefilledText)}`;
                      window.Telegram?.WebApp?.openTelegramLink(botUrl);
                    }}
                    className="w-full bg-gradient-to-r from-teal-600/80 to-cyan-600/80 text-white py-2 rounded-2xl font-semibold text-md flex items-center justify-center gap-4 shadow-2xl hover:brightness-110 transition-all"
                  >
                    <BotMessageSquare size={32} className="animate-gentle-pulse" />
                    <div className="flex flex-col items-start">
                      <span className="text-xl">Спросить Эладжа</span>
                      <span className="text-sm font-normal opacity-90 -mt-1">о {district.name} и объектах в нем</span>
                    </div>
                  </button>
                </div>
              </div>
              
              <div className="flex gap-4 mb-10">
                {/* <button 
                  // onClick={() => window.Telegram?.WebApp?.openTelegramLink('https://t.me/AIRealtyTest_bot')}
                  onClick={() => {
                    const key = `logged_ask_bot_districts_${district.name}`;
                    logEvent('ask_bot_districts', {
                      district: district.name || 'unknown'
                    });
                    localStorage.setItem(key, '1');
                    setTimeout(() => localStorage.removeItem(key), 60 * 1000);
                    window.Telegram?.WebApp?.openTelegramLink('https://t.me/AIRealtyTest_bot');
                  }}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                >
                  <BotMessageSquare size={22} className="animate-gentle-pulse" />
                  <div>Спросить Эладжа </div>
                  <div className="text-sm font-normal opacity-90">о районе и объектах</div>
                
                </button> */}
                {/* <button 
                  onClick={() => window.Telegram?.WebApp?.openTelegramLink('https://t.me/a4k5o6')}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 mb-6"
                >
                  <User size={24} />
                  <span>Консультация менеджера</span>
                </button> */}
              </div>

              {/* Карточки объектов */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                {estates.map(estate => (
                  <Link
                    key={estate.name}
                    to={`/estate/${district.name}/${estate.name}`}
                    className="group block"
                  >
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg transition-transform duration-300">
                      {/* Фото */}
                      <div className="relative h-56 overflow-hidden">
                        {estate.photos2[0] && (
                          <img 
                            src={estate.photos2[0]} 
                            alt={estate.name} 
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <h3 className="text-2xl font-bold mb-2">{estate.name}</h3>
                          {estate.developer_name && estate.developer_name !== '-' && (
                            <p className="text-white/90">{estate.developer_name}</p>
                          )}
                        </div>
                      </div>

                      {/* Контент */}
                      <div className="p-6">
                        {estate.estate_description && (
                          <p className="text-slate-600 mb-4 line-clamp-2">{estate.estate_description}</p>
                        )}
                        
                        {/* Ценовая информация */}
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xl font-bold text-cyan-600">Цены в комплексе:</span>
                              <span className="text-xl font-bold text-cyan-600">
                                от ${estate.minPrice?.toLocaleString() || '30000'}
                              </span>
                            </div>
                            
                            {/* Ценовые категории */}
                            {estate.priceCategories.length > 0 && (
                              
                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex flex-wrap gap-2 flex-1">
                                  {estate.priceCategories.map((cat, idx) => (
                                    <span 
                                      key={idx} 
                                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                                        cat === 'Эконом' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                        cat === 'Бизнес' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                        cat === 'Премиум' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                        'bg-purple-100 text-purple-800 border-purple-200'
                                      }`}
                                    >
                                      {cat}
                                    </span>
                                  ))}
                                </div>
                                <span className="text-xs text-slate-600 ml-12 mb-1">к комплексу</span>
                                <MoveRight size={28} className=" flex-shrink-0 text-cyan-600 animate-gentle-pulse" />
                              </div>
                            )}
                          </div>

                          {/* Статистика */}
                          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                            <div className="text-center">
                              <div className="text-sm text-slate-500">Апартаментов</div>
                              <div className="text-xl font-bold text-slate-900">{estate.prices?.length || 0}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-slate-500">Средняя цена</div>
                              <div className="text-xl font-bold text-slate-900">${estate.avgPrice?.toLocaleString() || '0'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-slate-500">До моря</div>
                              <div className="text-xl font-bold text-slate-900">~{Math.round(Math.random() * 5) + 1} мин</div>
                            </div>
                          </div>
                        </div>
                      </div>
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

      {/* Кнопка "Наверх" */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-24 right-6 z-50 bg-white/80 backdrop-blur-md border-2 border-cyan-600/80 rounded-full p-4 shadow-2xl transition-all opacity-90 invisible translate-y-10"
        id="scrollTopBtn"
      >
        <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
}