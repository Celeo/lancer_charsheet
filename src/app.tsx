import { useState, useEffect } from 'preact/hooks'
import { CharacterProvider } from './store'
import { Nav } from './components/Nav'
import { CombatTracker } from './views/CombatTracker'
import { PilotSheet } from './views/PilotSheet'
import { MechSheet } from './views/MechSheet'

function getRoute() {
  return window.location.hash || '#combat'
}

export function App() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const handler = () => setRoute(getRoute())
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  return (
    <CharacterProvider>
      <div class="min-h-screen flex flex-col max-w-lg mx-auto">
        <main class="flex-1 px-4 pt-4 pb-20 overflow-y-auto">
          {route === '#combat' && <CombatTracker />}
          {route === '#pilot' && <PilotSheet />}
          {route === '#mech' && <MechSheet />}
        </main>
        <Nav current={route} />
      </div>
    </CharacterProvider>
  )
}
