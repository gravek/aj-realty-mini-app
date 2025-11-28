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