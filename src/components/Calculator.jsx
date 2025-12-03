import React, { useState } from 'react';

export default function Calculator() {
  const [price, setPrice] = useState(100000);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">Калькулятор доходности</h1>
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <label className="block text-lg font-medium mb-4">Цена апартаментов, $</label>
        <input
          type="range"
          min="30000"
          max="300000"
          step="5000"
          value={price}
          onChange={e => setPrice(+e.target.value)}
          className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer"
        />
        <div className="text-center text-3xl font-bold text-cyan-600 mt-6">
          ${price.toLocaleString()}
        </div>
        <div className="mt-8 space-y-3 text-lg">
          <p>Годовая аренда (10%): <strong className="text-teal-600">${(price * 0.1).toLocaleString()}</strong></p>
          <p>Годовая аренда (12%): <strong className="text-teal-600">${(price * 0.12).toLocaleString()}</strong></p>
          <p className="text-sm text-orange-400">Средняя загрузка 70%, сезон май-октябрь</p>
        </div>
      </div>
    </div>
  );
}