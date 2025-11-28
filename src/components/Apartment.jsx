import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from '../store'

const Apartment = () => {
  const { id } = useParams()
  const { data } = useStore()
  const [apartment, setApartment] = useState(null)

  useEffect(() => {
    fetch(`https://elaj-bot-backend-new.vercel.app/api/apartment/${id}`)
      .then(res => res.json())
      .then(setApartment)
  }, [id])

  if (!apartment) return <div>Загрузка...</div>

  return (
    <div>
      <h1>{apartment.name}</h1>
      <img loading="lazy" src={apartment.photos[0]} alt="" className="w-full" />  // Lazy + WebP если backend отдаст
      <p>Расстояние до моря: 100м | До Батуми: 10км (Haversine)</p>
      <button onClick={() => window.Telegram.WebApp.shareUrl(window.location.href)}>Поделиться</button>
      {/* Режим инвестор/жизнь: accordion */}
      <div className="collapse">Инвестиции: ROI 10-12%</div>
    </div>
  )
}

export default Apartment