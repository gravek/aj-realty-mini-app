import React, { useState, useEffect, useRef } from 'react';
import { logEvent } from '../utils/analytics';

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
    if (price <= 80000)  return { label: 'Бюджетные',    color: 'text-emerald-500' };
    if (price <= 150000) return { label: 'Средние',      color: 'text-blue-500' };
    if (price <= 250000) return { label: 'Премиум',      color: 'text-orange-500' };
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
      <h1 className="text-3xl font-bold text-center">Калькулятор доходности</h1>

      {/* Легенда цен */}
      <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-emerald-500"></div> ≤ $80k</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-500"></div> $80–150k</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-orange-500"></div> $150–250k</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-purple-600"></div> от $250k</div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-xl mx-auto">
        <div className="mb-6">
          <label className="block text-lg font-medium mb-2">Цена апартаментов</label>
          <input
            type="range"
            min="30000"
            max="300000"
            step="5000"
            value={price}
            onChange={e => setPrice(+e.target.value)}
            className={`w-full h-3 rounded-lg appearance-none cursor-pointer ${priceCategory.color.replace('text-', 'bg-gradient-to-r from-') + ' to-' + priceCategory.color.split('-')[1]}`}
          />
          <div className="text-center text-3xl font-bold mt-4">
            <span className={priceCategory.color}>${price.toLocaleString()}</span>
            <div className={`text-xl opacity-80 ${priceCategory.color}`}>{priceCategory.label}</div>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-lg font-medium mb-2">
            Загрузка вне сезона: {offSeasonOccupancy}%
          </label>
          <input
            type="range"
            min="00"
            max="100"
            step="10"
            value={offSeasonOccupancy}
            onChange={e => setOffSeasonOccupancy(+e.target.value)}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-sm text-gray-500 mt-1 text-center">
            Сезон (май–окт): стабильно ~90%
          </p>
        </div>

        {/* Таблица доходов и расходов */}
        <div className="overflow-x-auto">
          <table className="w-full text-lg border-collapse">
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-4">Доход за сезон (май–окт):</td>
                <td className="py-2 text-right text-cyan-600 font-medium">${Math.round(seasonIncome).toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Доход вне сезона:</td>
                <td className="py-2 text-right text-cyan-600 font-medium">${Math.round(offSeasonIncome).toLocaleString()}</td>
              </tr>
              <tr className="border-b font-medium">
                <td className="py-2 pr-4">Итого годовой доход:</td>
                <td className="py-2 text-right text-cyan-600">${Math.round(totalGross).toLocaleString()}</td>
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

        {/* <p className="text-3xl font-bold text-center text-cyan-600 mt-6">
          ROI: {roi.toFixed(1)}% годовых
        </p> */}

        <p className="text-sm text-gray-600 mt-6 text-left leading-relaxed">
          <strong>Вне сезона:</strong> возможна долгосрочная аренда — доход стабильнее.<br/>
          <strong>Расходы:</strong> обслуживание ЖК (лифт, уборка, охрана) зависит от комплекса — менеджер подскажет точную сумму.<br/>
        </p>
      </div>
      
      <button 
        onClick={() => {
          // const key = `logged_ask_elaj_${id}`;
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
      </button>


      <button 
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
      </button>
    </div>
  );
}