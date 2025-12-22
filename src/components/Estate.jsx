// src/components/Estate.jsx
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';
import PhotoGalleryModal from './PhotoGalleryModal';
import { hasPhotos } from '../utils/hasPhotos';

export default function Estate() {
  const { district, estate } = useParams();
  const { data } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const current = data?.districts?.[district]?.estates?.[estate];
  if (!current) return <div>Комплекс не найден</div>;

  const apartments = Object.values(current.blocks || {})
    .flatMap(b => Object.values(b.apartment_types || {}))
    .flatMap(t => t.apartments || []);

  const estateHasPhotos = useMemo(() => hasPhotos(current, 'estate'), [current]);

  return (
    <div className="mt-6">
      <h1 className="text-3xl font-bold mb-2">{current.name}</h1>
      {current.developer_name && <p className="text-lg text-gray-600 mb-6">{current.developer_name}</p>}

      <div className="max-w-2xl font-normal tracking-tighter text-left mx-auto px-3 py-2 mb-2  bg-white/90 backdrop-blur-sm rounded-lg shadow-xl border border-rose-300 text-orange-800">
        {current.description || 'estate_description'}
      </div>

      {/* Кнопка фото, если есть */}
      {estateHasPhotos && (
        <div className="flex justify-center items-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-1/2 mb-8 mx-auto bg-gradient-to-r from-orange-600 to-rose-600 text-white py-4 rounded-2xl font-bold text-md hover:shadow-xl transition mt-8"
          >
            Показать фото комплекса
          </button>
        </div>
      )}

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
              <span className="text-2xl text-cyan-600">→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Модалка */}
      <PhotoGalleryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entity={current}
        entityType="estate"
      />
    </div>
  );
}