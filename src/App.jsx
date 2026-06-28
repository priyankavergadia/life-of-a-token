import React, { useState } from 'react'
import { SketchDefs, SunDoodle } from './Doodles.jsx'
import TokenJourney from './TokenJourney.jsx'
import LabJourney from './LabJourney.jsx'

const VIEWS = [
  { id: 'token', label: 'The Life of a Token', icon: '🔤' },
  { id: 'lab', label: 'GenAI Lab · Zero to Scale', icon: '🧪' },
]

export default function App() {
  const [view, setView] = useState('token')

  return (
    <div className="app">
      <SketchDefs />

      {/* top bar: brand + the two-experience switcher */}
      <div className="topbar">
        <div className="brand">
          <div className="logo"><SunDoodle size={52} /></div>
          <div>
            <h1>AI, Visually</h1>
            <div className="sub">Interactive explainers for how AI really works · by The Cloud Girl</div>
          </div>
        </div>
        <div className="view-tabs">
          {VIEWS.map((v) => (
            <button key={v.id} className={`view-tab ${view === v.id ? 'on' : ''}`} onClick={() => setView(v.id)}>
              <span className="vt-ic">{v.icon}</span>{v.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'token' ? <TokenJourney /> : <LabJourney />}
    </div>
  )
}
