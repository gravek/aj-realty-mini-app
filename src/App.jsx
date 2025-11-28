import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom'
import { useStore } from './store'  // Zustand
import District from './components/District.jsx'
import Estate from './components/Estate.jsx'
import Apartment from './components/Apartment.jsx'
import Map from './components/Map.jsx'
import Calculator from './components/Calculator.jsx'
import Filters from './components/Filters.jsx'
import PersonalOfferStub from './components/PersonalOfferStub.jsx'

const App = () => {
  const { setTheme, fetchData, addToFavorites, syncWithUpstash } = useStore()

  useEffect(() => {
    if (window.Telegram) {
      const tg = window.Telegram.WebApp
      tg.ready()
      setTheme(tg.themeParams)  // Telegram Theme Variables
      tg.MainButton.setText('Написать менеджеру')
      tg.MainButton.onClick(() => tg.openTelegramLink('t.me/a4k5o6'))
      tg.SecondaryButton.setText('Передать контакты (Андрей напишет первым)')
      tg.SecondaryButton.onClick(() => {
        const context = { summary_chat: '...', summary_app: '...' }  // Из localStorage/Upstash
        tg.sendData(JSON.stringify({ action: 'request_contact', context }))
      })
      // Sync избранного и истории с Upstash
      syncWithUpstash(tg.initDataUnsafe.user.id)
    }
    fetchData()  // Загружает objects.json с backend
  }, [])

  return (
    <Router>
      <div className="p-4">
        <Map />  // Главная карта + 3-5 горячих
        <Filters />  // Swipeable
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/district/:district" element={<District />} />
          <Route path="/estate/:district/:estate" element={<Estate />} />
          <Route path="/apartment/:id" element={<Apartment />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/offer/:user_id" element={<PersonalOfferStub />} />  // Заглушка
        </Routes>
      </div>
    </Router>
  )
}

export default App