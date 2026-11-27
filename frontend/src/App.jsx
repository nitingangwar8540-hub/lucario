import { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard'
import HomePage from './pages/HomePage'

function App() {
  const [location, setLocation] = useState(() => window.location.hash)
  const [route, query = ''] = location.split('?')

  useEffect(() => {
    function updateLocation() {
      setLocation(window.location.hash)
    }

    window.addEventListener('hashchange', updateLocation)
    return () => window.removeEventListener('hashchange', updateLocation)
  }, [])

  useEffect(() => {
    if (route !== '#dashboard' && route) {
      document.getElementById(route.slice(1))?.scrollIntoView()
    }
  }, [route])

  return (
    <div className="min-h-screen bg-surface font-body-md text-base text-on-surface antialiased selection:bg-secondary-container selection:text-on-secondary-container">
      {route === '#dashboard' ? <Dashboard key={location} initialQuery={query} /> : <HomePage />}
    </div>
  )
}

export default App
