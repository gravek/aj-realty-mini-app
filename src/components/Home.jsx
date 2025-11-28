// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';

export default function Home() {
  const { data } = useStore();

  const hot = Object.values(data?.districts || {})
    .flatMap(d => Object.values(d.estates || {}).map(e => ({ ...e, district: d.name })))
    .slice(0, 6);

  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold mb-4">Горячие предложения</h1>
      <div className="grid gap-4">
        {hot.map(estate => (
          <Link
            key={estate.name}
            to={`/estate/${estate.district}/${estate.name}`}
            className="block p-5 bg-white rounded-xl shadow hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">{estate.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{estate.district}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}