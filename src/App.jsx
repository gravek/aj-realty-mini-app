// src/App.jsx
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams, useLocation } from 'react-router-dom'
import { useStore } from './store'
import Map from './components/Map'
import Filters from './components/Filters'
import Home from './components/Home'
import District from './components/District'
import Estate from './components/Estate'
import Apartment from './components/Apartment'
import Calculator from './components/Calculator'
import PersonalOfferStub from './components/PersonalOfferStub'

// Универсальный компонент-обёртка, который определяет, какие метки показывать на карте
const MapWithContext = () => {
  const { data } = useStore()
  const { district: districtParam, estate: estateParam } = useParams()
  const location = useLocation()

  // 1. Главная страница — все комплексы
  if (location.pathname === '/') {
    const allEstates = Object.values(data?.districts || {}).flatMap(d =>
      Object.values(d.estates || {}).map(e => ({ ...e, district: d.name }))
    )
    return <Map estates={allEstates} center={[41.65, 41.63]} zoom={10} />
  }

  // 2. Страница района — только его комплексы
  if (districtParam && !estateParam) {
    const district = data?.districts?.[districtParam]
    if (!district) return <div className="h-64 bg-gray-100 rounded-lg" />
    const estatesInDistrict = Object.values(district.estates || {}).map(e => ({
      ...e,
      district: district.name
    }))
    return <Map estates={estatesInDistrict} center={district.coords} zoom={13} />
  }

  }

  // 3. Страница конкретного комплекса — одна метка
  if (districtParam && estateParam) {
    const estate = data?.districts?.[districtParam]?.estates?.[estateParam]
    if (!estate || !estate.coords) return <div className="h-64 bg-gray-100 rounded-lg" />
    return <Map estates={[{ ...estate, district: districtParam }]} center={estate.coords} zoom={15} />
  }

  // По умолчанию — просто карта Батуми
  return <Map estates={[]} center={[41.65, 41.63]} zoom={11} />
}

const App = () => {
  const { loadData, setTheme } = useStore()

  useEffect(() => {
    loadData() // Загружает /data/objects.json при старте

    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()

      // Telegram Theme Variables
      const theme = tg.themeParams
      document.body.style.backgroundColor = theme.bg_color || '#ffffff'
      document.body.style.color = theme.text_color || '#000000'

      // MainButton всегда видна
      tg.MainButton.setText('Написать Андрею')
      tg.MainButton.show()
      tg.MainButton.onClick(() => tg.openTelegramLink('https://t.me/a4k5o6'))

      // Вторая кнопка — передача контакта с контекстом
      tg.enableClosingConfirmation()
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-bg_color text-text_color pb-20">
        <div className="p-4 pt-2">
          {/* Карта всегда сверху и адаптируется под текущий уровень */}
          <MapWithContext />

          {/* Фильтры только на главной и на районе */}
          <Filters />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/district/:district" element={<District />} />
            <Route path="/estate/:district/:estate" element={<Estate />} />
            <Route path="/apartment/:id" element={<Apartment />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/offer/:user_id" element={<PersonalOfferStub />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App