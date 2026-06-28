import React, { useState } from 'react'
import { SketchDefs, SunDoodle } from './Doodles.jsx'
import TokenJourney from './TokenJourney.jsx'
import LabJourney from './LabJourney.jsx'
import { Capstone1, Capstone2, Capstone3, Capstone4 } from './capstones.jsx'
import { useCreds } from './labkit.jsx'

const VIEWS = [
  { id: 'token', label: 'Life of a Token', icon: '🔤', group: 'Learn' },
  { id: 'lab', label: 'GenAI Lab', icon: '🧪', group: 'Learn' },
  { id: 'c1', label: 'LLM Outputs', icon: '🛡️', group: 'Projects' },
  { id: 'c2', label: 'RAG', icon: '📚', group: 'Projects' },
  { id: 'c3', label: 'Tools', icon: '🤖', group: 'Projects' },
  { id: 'c4', label: 'Personalization', icon: '📧', group: 'Projects' },
]

export default function App() {
  const [view, setView] = useState('token')
  const [creds, setCreds] = useCreds()

  const render = () => {
    switch (view) {
      case 'token': return <TokenJourney />
      case 'lab': return <LabJourney creds={creds} setCreds={setCreds} />
      case 'c1': return <Capstone1 creds={creds} setCreds={setCreds} />
      case 'c2': return <Capstone2 creds={creds} setCreds={setCreds} />
      case 'c3': return <Capstone3 creds={creds} setCreds={setCreds} />
      case 'c4': return <Capstone4 creds={creds} setCreds={setCreds} />
      default: return null
    }
  }

  const groups = ['Learn', 'Projects']

  return (
    <div className="app">
      <SketchDefs />

      <div className="topbar">
        <div className="brand">
          <div className="logo"><SunDoodle size={52} /></div>
          <div>
            <h1>AI, Visually</h1>
            <div className="sub">Interactive explainers for how AI really works · by The Cloud Girl</div>
          </div>
        </div>
        <div className="view-tabs">
          {groups.map((g) => (
            <div className="view-group" key={g}>
              <div className="view-group-label">{g}</div>
              <div className="view-group-row">
                {VIEWS.filter((v) => v.group === g).map((v) => (
                  <button key={v.id} className={`view-tab ${view === v.id ? 'on' : ''}`} onClick={() => setView(v.id)}>
                    <span className="vt-ic">{v.icon}</span>{v.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {render()}
    </div>
  )
}
