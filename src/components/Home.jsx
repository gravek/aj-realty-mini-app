// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';

const Home = () => {
  const { data } = useStore();

  // Топ-5 горячих объектов для главной
  const hotEstates = Object.values(data?.districts || {})
    .flatMap(d => Object.entries(d.estates || {}))
    .map(([slug, estate]) => ({ ...estate, slug, district: d.name }))
    .slice(0, 5);

  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold mb-4">Горячие предложения в Аджарии</h1>
      <div className="grid gap-4">
        {hotEstates.map(estate => (
          <Link
            key={estate.slug}
            to={`/estate/${estate.district}/${estate.slug}`}
            className="block p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
          >
            <h3 className="font-semibold text-lg">{estate.name}</h3>
            <p className="text-gray-600">{estate.district} • от ${Math.min(...Object.values(estate.blocks || {})
              .flatMap(b => Object.values(b.apartment_types || {}))
              .flatMap(t => t.apartments.map(a => a.price_usd))
            )} </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;