// src/components/Filters.jsx
import React, { useState } from 'react';
import { useStore } from '../store';

const Filters = () => {
  const { data, setFilteredApartments } = useStore(); // Добавьте setFiltered в store
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(500000);
  const [type, setType] = useState('');
  const [district, setDistrict] = useState('');
  // ... другие states для m2, finishing

  const applyFilters = () => {
    let allApts = [];
    Object.values(data?.districts || {}).forEach(d => {
      Object.values(d.estates || {}).forEach(e => {
        Object.values(e.blocks || {}).forEach(b => {
          Object.values(b.apartment_types || {}).forEach(t => {
            allApts = allApts.concat(t.apartments || []);
          });
        });
      });
    });
    const filtered = allApts.filter(a => 
      a.price_usd >= priceMin && a.price_usd <= priceMax &&
      (!type || a.type === type) && // Добавьте 'type' в apartments в json, если нет
      (!district || /* check district */)
      // ... другие условия
    );
    setFilteredApartments(filtered); // Используйте в отдельном компоненте SearchResults.jsx
  };

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-lg font-bold">Фильтры</h2>
      <div>
        <label>Цена ($)</label>
        <input type="range" min={0} max={500000} value={priceMin} onChange={e => setPriceMin(e.target.value)} className="w-full" />
        <input type="range" min={0} max={500000} value={priceMax} onChange={e => setPriceMax(e.target.value)} className="w-full" />
        <p>{priceMin} - {priceMax}</p>
      </div>
      <div>
        <label>Тип</label>
        <select value={type} onChange={e => setType(e.target.value)} className="w-full p-2 border rounded">
          <option value="">Все</option>
          <option value="Студия">Студия</option>
          <option value="1+1">1+1</option>
          <option value="2+1">2+1</option>
        </select>
      </div>
      <div>
        <label>Район</label>
        <select value={district} onChange={e => setDistrict(e.target.value)} className="w-full p-2 border rounded">
          <option value="">Все</option>
          {Object.keys(data?.districts || {}).map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      {/* Аналогично для m2 (range), finishing (checkboxes) */}
      <button onClick={applyFilters} className="w-full bg-cyan-600 text-white py-2 rounded">Применить</button>
    </div>
  );
};

export default Filters;