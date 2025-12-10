// src/components/Estate.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';

export default function Estate() {
  const { district, estate } = useParams();
  const { data } = useStore();

  const current = data?.districts?.[district]?.estates?.[estate];
  if (!current) return <div>Комплекс не найден</div>;

  const apartments = Object.values(current.blocks || {})
    .flatMap(b => Object.values(b.apartment_types || {}))
    .flatMap(t => t.apartments || []);

  return (
    <div className="mt-6">
      <h1 className="text-3xl font-bold mb-2">{current.name}</h1>
      {current.developer_name && <p className="text-lg text-gray-600 mb-6">{current.developer_name}</p>}

      <div className="max-w-2xl font-normal tracking-tighter text-left mx-auto px-4 mb-8  bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-rose-300 text-orange-800">
        {current.description || 'estate_about_text'}
      </div>

      <div className="grid gap-4">
        {apartments.map(ap => (
          <Link
            key={ap.apartment_id}
            to={`/apartment/${ap.apartment_id}`}
            className="block p-5 bg-white rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{ap.m2} м² • {ap.finishing || '—'}</p>
                <p className="text-2xl font-bold text-cyan-600">${ap.price_usd.toLocaleString()}</p>
              </div>
              <span className="text-sm text-gray-500">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}