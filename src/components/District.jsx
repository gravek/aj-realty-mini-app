// src/components/District.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';

export default function District() {
  const { district } = useParams();
  const { data } = useStore();

  const current = data?.districts?.[district];
  if (!current) return <div>Район не найден</div>;

  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold mb-4">{current.name}</h1>
      
      {/* Новый код: изображение или градиентный блок */}
      {current.photos?.specific?.[0]?.url ? (
        <img 
          src={current.photos.specific[0].url} 
          className="w-full h-48 object-cover rounded-2xl mt-4" 
        />
      ) : (
        <div 
          className="w-full h-48 bg-gradient-to-br from-green-400 to-cyan-600 rounded-2xl mt-4 flex items-center justify-center"
        >
          <span className="text-white text-2xl font-bold">{current.name}</span>
        </div>
      )}

      <div className="grid gap-4">
        {Object.entries(current.estates || {}).map(([slug, estate]) => (
          <Link
            key={slug}
            to={`/estate/${district}/${slug}`}
            className="block p-5 bg-white rounded-xl shadow hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">{estate.name}</h3>
            {estate.developer_name && <p className="text-sm text-gray-600">{estate.developer_name}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
