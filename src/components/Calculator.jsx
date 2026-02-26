import React, { useState, useEffect, useRef } from 'react';
import { logEvent } from '../utils/analytics';
import { 

  BotMessageSquare,
  UserRoundPen,
  DollarSign,
  ScanFace
} from 'lucide-react';

export default function Calculator() {
  const [price, setPrice] = useState(100000);
  const [offSeasonOccupancy, setOffSeasonOccupancy] = useState(40); // вне сезона по умолчанию 40%

  // Переменные для быстрой корректировки
  const SEASON_MONTHS = 6;                  // май–октябрь
  const SEASON_OCCUPANCY = 90;              // стабильная загрузка в сезон (не регулируем)
  const GROSS_YIELD = 0.11;                 // средняя брутто-доходность
  const COMMISSION_SEASON = 0.30;           // 30% наша комиссия (вкл. электричество)
  const OTHER_EXPENSES = 1200;              // налоги, страховка, мелкий ремонт и т.п. — фиксировано в год

  // Расчёты
  const seasonIncome = price * GROSS_YIELD * (SEASON_MONTHS / 12) * (SEASON_OCCUPANCY / 100);
  const offSeasonIncome = price * GROSS_YIELD * ((12 - SEASON_MONTHS) / 12) * (offSeasonOccupancy / 100);
  const totalGross = seasonIncome + offSeasonIncome;

  const commission = seasonIncome * COMMISSION_SEASON;
  const totalExpenses = commission + OTHER_EXPENSES;

  const netYear = totalGross - totalExpenses;
  const roi = price > 0 ? (netYear / price) * 100 : 0;

  const priceCategory = (() => {
    if (price <= 80000)  return { label: 'Эконом',    color: 'text-emerald-600' };
    if (price <= 150000) return { label: 'Бизнес',      color: 'text-blue-600' };
    if (price <= 250000) return { label: 'Премиум',      color: 'text-orange-600' };
    return { label: 'Люкс',          color: 'text-purple-600' };
  })();

  
  // Логирование: факт открытия и использование калькулятора (устойчивых значений)

  const hasRealMounted = useRef(false);

  // 1. Открытие — логируем один раз после первого монтирования
  useEffect(() => {
    logEvent('open_calculator');
  }, []);   // ← это безопасно, в dev-режиме залогируется дважды → но в production один раз, а в Telegram Mini App обычно один
  // Флаг, что пользователь уже что-то реально менял
  const hasUserInteracted = useRef(false);

  // Статистика бюджета — инициализируем null
  const [budgetStats, setBudgetStats] = useState({
    min: null,
    max: null,
    avg: null,
    count: 0
  });

  // 1. Реакция на изменение price или offSeasonOccupancy
  useEffect(() => {
    // Пропускаем дефолтные значения при первой загрузке
    if (price === 100000 && offSeasonOccupancy === 40) {
      return;
    }

    hasUserInteracted.current = true;

    // Debounce: ждём 800 мс после последнего изменения
    const timer = setTimeout(() => {
      const currentBudget = price; // или другой показатель бюджета

      setBudgetStats(prev => {
        // Если это первое реальное значение — инициализируем
        if (prev.count === 0) {
          return {
            min: currentBudget,
            max: currentBudget,
            avg: currentBudget,
            count: 1
          };
        }

        const newMin = Math.min(prev.min, currentBudget);
        const newMax = Math.max(prev.max, currentBudget);
        const newCount = prev.count + 1;
        const newAvg = ((prev.avg * prev.count) + currentBudget) / newCount;

        return { min: newMin, max: newMax, avg: newAvg, count: newCount };
      });
    }, 2000); // задержка для обновления только после паузы в движении

    return () => clearTimeout(timer);
  }, [price, offSeasonOccupancy]);

  // 2. Логируем финальную статистику только после паузы и только если было взаимодействие
  useEffect(() => {
    if (budgetStats.count === 0) return; // ещё ничего не считали

    const timer = setTimeout(() => {
      logEvent('calculator_budget_stats', {
        budget_min: Math.round(budgetStats.min),
        budget_max: Math.round(budgetStats.max),
        budget_avg: Math.round(budgetStats.avg),
        calculations_count: budgetStats.count,
        price_category: priceCategory.label,
        off_season_occupancy: offSeasonOccupancy
      });
    }, 3000);   // задержка перед отправкой

    return () => clearTimeout(timer);
  }, [budgetStats, priceCategory.label, offSeasonOccupancy]);


  return (
    <div className="space-y-8 pb-20">
      {/* <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-800 to-emerald-800 bg-clip-text text-transparent">Калькулятор доходности</h1> */}

      {/* Легенда цен */}
      {/* <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-emerald-500"></div> ≤ $80k</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-500"></div> $80–150k</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-orange-500"></div> $150–250k</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-purple-600"></div> от $250k</div>
      </div> */}

    {/* <h1 className="text-3xl font-bold text-center mb-1 bg-gradient-to-r from-cyan-700 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
      Калькулятор доходности
    </h1> */}


    
<div className="bg-cyan-50/60 backdrop-blur-2xl rounded-2xl border border-cyan-200/90 shadow-xl overflow-hidden max-w-3xl mx-auto">
  <div className="p-4 sm:p-2">
    {/* Здесь весь текущий контент: слайдер цены, occupancy, таблица и т.д. */}

    {/* Можно добавить лёгкий заголовок секции */}
      {/* <DollarSign className="text-cyan-600" size={28} /> */}
    {/* <div className="flexgap-3 mb-6">
      <h2 className="text-2xl font-medium text-cyan-800 text-center">Категории цен</h2>
    </div> */}


    {/* <div className="flex flex-wrap justify-center gap-4 mb-6 text-xs font-normal">
      <div className="flex items-center gap-2 px-2 py-1 text-emerald-700 bg-emerald-100/80 backdrop-blur-xl rounded-full border border-emerald-200 shadow-sm">
        Эконом: до $80k
      </div>
      <div className="flex items-center gap-2 px-2 py-1 text-blue-700 bg-blue-100/80 backdrop-blur-xl rounded-full border border-blue-200 shadow-sm">
        Бизнес: $80–150k
      </div>
      <div className="flex items-center gap-2 px-2 py-1 text-orange-700 bg-orange-100/80 backdrop-blur-xl rounded-full border border-orange-200 shadow-sm">
        Премиум: $150–250k
      </div>
      <div className="flex items-center gap-2 px-2 py-1 text-purple-700 bg-purple-100/80 backdrop-blur-xl rounded-full border border-purple-200 shadow-sm">
        Люкс: от $250k
      </div>
    </div> */}


    <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-700 via-teal-600 to-cyan-700 bg-clip-text text-transparent">
      Калькулятор доходности
    </h1>



<div className="bg-white/80 backdrop-blur-lg rounded-2xl border shadow-xl overflow-hidden max-w-3xl mx-auto">
  <div className="p-6 sm:p-8 md:p-10 bg-gradient-to-r from-cyan-00/80 to-teal-600/80">
    
    {/* Заголовок для блока цены */}
    <div className="flex mb-4 items-center gap-4 text-white">
      {/* Иконка с объемом */}
      <div className="relative">
        <div className="absolute -inset-2 bg-white/15 rounded-2xl blur-md" />
        <div className="relative w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center shadow-2xl">
          <DollarSign className="text-white" size={20} />
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-semibold mb-1 tracking-tight">
          Цена апартаментов
        </h3>
      </div>
    </div>

    {/* Блок шкалы и результата цены */}
    <div className="mb-4 p-4 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30">
      {/* Диапазон цен */}
      <div className="flex justify-between text-md font-medium text-slate-500  mb-0 mt-0">
        <span>$30 000</span>
        <span>$300 000</span>
      </div>

      {/* Шкала (слайдер) */}
      <input
        type="range"
        min="30000"
        max="300000"
        step="5000"
        value={price}
        onChange={e => setPrice(+e.target.value)}
        // className={`w-full h-2 rounded-full cursor-pointer appearance-none bg-gradient-to-r
        //   ${price <= 80000 ? 'from-emerald-400 to-emerald-600' :
        //     price <= 150000 ? 'from-blue-400 to-blue-600' :
        //     price <= 250000 ? 'from-orange-400 to-orange-500' :
        //     'from-purple-500 to-purple-700'}
        //   accent-cyan-600`}
        // className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${priceCategory.color.replace('text-', 'bg-gradient-to-r from-') + ' to-' + priceCategory.color.split('-')[1]}`}
        className="w-full h-2 bg-slate-300/80 rounded-lg appearance-none cursor-pointer"
      />

      {/* Результат цены */}
      <div className="text-center mt-2">
        <div className="text-2xl font-semibold">
          <span className={priceCategory.color}>${price.toLocaleString()}</span>
        </div>
        <div className={`text-lg font-semibold opacity-80 mt-1 ${priceCategory.color}`}>
          {priceCategory.label}
        </div>
      </div>
    </div>

    {/* Заголовок для блока загрузки */}
    {/* <label className="block text-2xl font-medium text-white mb-2">
      Загрузка вне сезона
    </label> */}

    {/* Заголовок для блока цены */}
    <div className="flex mt-8 mb-4 items-center gap-4 text-white">
      {/* Иконка с объемом */}
      <div className="relative">
        <div className="absolute -inset-2 bg-white/15 rounded-2xl blur-md" />
        <div className="relative w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center shadow-2xl">
          <ScanFace className="text-white" size={20} />
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-semibold mb-1 tracking-tight">
          Загрузка вне сезона
        </h3>
      </div>
    </div>



    {/* Блок шкалы и результата загрузки */}
    <div className="mb-2 p-4 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30">
      {/* Шкала (слайдер) */}

      {/* Подписи диапазона шкалы */}
      <div className="flex justify-between text-md font-medium text-slate-500 mb-0 mt-0">
        <span>0%</span>
        <span>100%</span>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        step="10"
        value={offSeasonOccupancy}
        onChange={e => setOffSeasonOccupancy(+e.target.value)}
        className="w-full h-2 bg-slate-300/80 rounded-lg appearance-none cursor-pointer"
      />

      {/* Результат загрузки */}
      <div className="text-center mt-1">
        <div className="text-2xl font-medium">
          <span className="text-cyan-600">{offSeasonOccupancy}%</span>
        </div>
        <p className="text-sm text-slate-500 mt-2">
          Сезон (май–окт): стабильно ~90%
        </p>
      </div>
    </div>
  </div>
</div>


        {/* Таблица доходов и расходов */}
        <div className="overflow-x-auto p-4  bg-cyan-100/20 backdrop-blur-lg rounded-lg border border-cyan-300/80 shadow-inner mt-4 mb-1 max-w-3xl mx-auto">
          <table className="w-full text-lg border-collapse text-cyan-600">
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-4">Доход за сезон (май–окт):</td>
                <td className="py-2 text-right  font-medium">${Math.round(seasonIncome).toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Доход вне сезона:</td>
                <td className="py-2 text-right font-medium">${Math.round(offSeasonIncome).toLocaleString()}</td>
              </tr>
              <tr className="border-t font-medium ">
                <td className="py-2 pr-4">Итого годовой доход:</td>
                <td className="py-2 text-right ">${Math.round(totalGross).toLocaleString()}</td>
              </tr>
              {/* <tr className="border-b">
                <td className="py-2 pr-4">Комиссия 30% (вкл. электричество):</td>
                <td className="py-2 text-right">- ${Math.round(commission).toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Прочие расходы (налоги, страховка):</td>
                <td className="py-2 text-right">- ${OTHER_EXPENSES.toLocaleString()}</td>
              </tr>
              <tr className="font-bold text-xl">
                <td className="py-3 pr-4">Чистая прибыль в год:</td>
                <td className="py-3 text-right text-emerald-600">${Math.round(netYear).toLocaleString()}</td>
              </tr> */}
            </tbody>
          </table>
        </div>
        {/* Расчет приблизителен и не является оффретой */}
        <h5 className="text-xs text-center text-slate-500 font-italic mt-4 mb-0 tracking-tight">
          * Расчет приблизителен и не является офертой *
        </h5>
    {/* ...  ... */}
  </div>
</div>



      
      {/* <button 
        onClick={() => {
          const key = `logged_ask_elaj_calc}`;
          // if (localStorage.getItem(key)) return; // уже кликали недавно

          logEvent('ask_bot_calc', {
            price_category: priceCategory.label,
            off_season_occupancy: offSeasonOccupancy,
          });

          localStorage.setItem(key, '1');
          setTimeout(() => localStorage.removeItem(key), 60 * 1000); // 1 минута

          window.Telegram?.WebApp?.openTelegramLink('https://t.me/AIRealtyTest_bot');
        }}
        className="w-full bg-teal-700 text-white py-4 rounded-xl font-bold text-lg"
      >
        🤖 Cпросить Эладжа 🪄
      </button> */}

      {/* Кнопка бота */}
      <div className="max-w-4xl mx-auto px-4 mt-4 md:mt-4 sticky top-10 z-40 md:static">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-cyan-200/80 p-2 md:p-4">
          <button
            onClick={() => {
              const key = `logged_ask_elaj_calc}`;
              if (!localStorage.getItem(key)) {
                logEvent('ask_bot_calc', {
                  price_category: priceCategory.label,
                  off_season_occupancy: offSeasonOccupancy,
                });
                localStorage.setItem(key, '1');
                setTimeout(() => localStorage.removeItem(key), 60 * 1000);
              }
              // window.Telegram?.WebApp?.openTelegramLink('https://t.me/AIRealtyTest_bot');
              // Формируем текст для вставки в чат
              const prefilledText = `Эладж, расскажи о подходящих для меня предложениях в категории ${priceCategory.label}`;
              
              // Кодируем текст и формируем URL, затем открываем бота
              const botUrl = `https://t.me/AIRealtyTest_bot?text=${encodeURIComponent(prefilledText)}`;
              window.Telegram?.WebApp?.openTelegramLink(botUrl);
            }}
            className="w-full border bg-gradient-to-r from-teal-600/80 to-cyan-600/80 text-white py-2 rounded-2xl font-semibold text-md flex items-center justify-center gap-4 shadow-2xl hover:brightness-110 transition-all"
          >
            <BotMessageSquare size={32} className="animate-gentle-pulse" />
            <div className="flex flex-col items-start">
              <span className="text-xl">Спросить Эладжа</span>
              <span className="text-sm font-normal opacity-95 -mt-1">о подходящих предложениях</span>
            </div>
          </button>
        </div>
      </div>


      {/* Кнопка менеджера */}
      <div className="max-w-4xl mx-auto px-4 mt-4 md:mt-4 sticky top-10 z-40 md:static">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-fuchsia-200/80 p-2 md:p-4">
          <button
            onClick={() => {
              const key = `logged_ask_manager_calc`;
              if (!localStorage.getItem(key)) {
                logEvent('ask_manager_calc', {
                  price_category: priceCategory.label,
                  off_season_occupancy: offSeasonOccupancy,
                });
                localStorage.setItem(key, '1');
                setTimeout(() => localStorage.removeItem(key), 60 * 1000);
              }
              // window.Telegram?.WebApp?.openTelegramLink('https://t.me/AIRealtyTest_bot');
              // Формируем текст для вставки в чат
              const prefilledText = `Добрый день! Интересуюсь предложениями в категории ${priceCategory.label}...`;
              
              // Кодируем текст и формируем URL, затем открываем бота
              const botUrl = `https://t.me/a4k5o6?text=${encodeURIComponent(prefilledText)}`;
              window.Telegram?.WebApp?.openTelegramLink(botUrl);
            }}
            className="w-full border bg-gradient-to-r from-fuchsia-600/80 to-purple-600/80 text-white py-2 rounded-2xl font-semibold text-md flex items-center justify-center gap-4 shadow-2xl hover:brightness-110 transition-all"
          >
            <UserRoundPen size={32} className="animate-gentle-pulse" />
            <div className="flex flex-col items-start">
              <span className="text-xl">Написать менеджеру</span>
              <span className="text-sm font-normal opacity-95 -mt-1">для личной консультации</span>
            </div>
          </button>
        </div>
      </div>


      {/* <button 
        onClick={() => {
          // const key = `logged_ask_elaj_${id}`;
          const key = `logged_ask_manager_calc`;
          // if (localStorage.getItem(key)) return; // уже кликали недавно

          logEvent('ask_manager_calc', {
            price_category: priceCategory.label,
            off_season_occupancy: offSeasonOccupancy,
          });

          localStorage.setItem(key, '1');
          setTimeout(() => localStorage.removeItem(key), 60 * 1000); // 1 минута

          window.Telegram?.WebApp?.openTelegramLink('https://t.me/a4k5o6');
        }}
        className="w-full bg-cyan-700 text-white py-4 rounded-xl font-bold text-lg"
      >
        👩🏻‍🦱 Написать менеджеру 📝
      </button> */}
    </div>
  );
}