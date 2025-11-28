import React from 'react'
import { YMaps, Map, Placemark } from '@yandex/ymaps3-reactify'

const YMap = () => (
  <YMaps query={{ apikey: 'YOUR_YANDEX_API_KEY' }}>
    <Map location={{ center: [41.65, 41.63], zoom: 12 }} />  // Батуми coords
    {/* Placemarks из data */}
  </YMaps>
)

export default YMap