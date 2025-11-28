// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';

export default function Home() {
  const { data } = useStore();

  const hot = Object.values(data?.districts || {})
    .flatMap(d => Object.values(d.estates || {})
      .map(e => {
        const minPrice = Math.min(...Object.values(e.blocks || {})
          .flatMap(b => Object.values(b.apartment_types || {}))
          .flatMap(t => t.apartments.map(a => a.price_usd || Infinity)));
        const photo = e.photos?.sketch?.[0]?.url || e.photos?.specific?.[0]?.url || '/placeholder.jpg';
        return { ...e, district: d.name, minPrice, photo };
      }))
    .sort((a, b) => a.minPrice - b.minPrice)
    .slice(0, 6);

  return (
    <div className="mt-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Горячие предложения в Аджарии</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {hot.map(estate => (
          <Link
            key={estate.name}
            to={`/estate/${estate.district}/${estate.name}`}
            className="group block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition"
          >
            <div className="aspect-w-16 aspect-h-9 relative h-56 bg-gray-200">
              <img
                src={estate.photo}
                alt={estate.name}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-xl font-bold text-white">{estate.name}</h3>
                <p className="text-white/90">{estate.district}</p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-2xl font-bold text-blue-600">
                от ${estate.minPrice.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}