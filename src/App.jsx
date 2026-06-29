import React, { useState, useEffect } from 'react'
import { SketchDefs, WalkingCat, CloudGirlLogo, CloudDoodle } from './Doodles.jsx'
import TokenJourney from './TokenJourney.jsx'
import LabJourney from './LabJourney.jsx'
import { Capstone1, Capstone2, Capstone3, Capstone4 } from './capstones.jsx'
import VibeCoding from './VibeCoding.jsx'
import GreetingCards from './GreetingCards.jsx'
import { useCreds } from './labkit.jsx'

const VIEWS = [
  { id: 'token', slug: 'token', label: 'Life of a Token', icon: '🔤', group: 'Learn' },
  { id: 'lab', slug: 'genai-lab', label: 'GenAI Lab', icon: '🧪', group: 'Learn' },
  { id: 'vibe', slug: 'vibe-coding', label: 'Vibe Coding', icon: '🛠️', group: 'Build' },
  { id: 'greeting', slug: 'greeting-cards', label: 'Greeting Cards', icon: '🎨', group: 'Build' },
  { id: 'c1', slug: 'llm-outputs', label: 'LLM Outputs', icon: '🛡️', group: 'Projects' },
  { id: 'c2', slug: 'rag', label: 'RAG', icon: '📚', group: 'Projects' },
  { id: 'c3', slug: 'tools', label: 'Tools', icon: '🤖', group: 'Projects' },
  { id: 'c4', slug: 'personalization', label: 'Personalization', icon: '📧', group: 'Projects' },
]

// Lightweight hash routing so each tab is deep-linkable, e.g. .../#/rag
const SLUG_TO_ID = Object.fromEntries(VIEWS.map((v) => [v.slug, v.id]))
const ID_TO_SLUG = Object.fromEntries(VIEWS.map((v) => [v.id, v.slug]))
function viewFromHash() {
  const h = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase()
  return SLUG_TO_ID[h] || null
}

export default function App() {
  const [view, setView] = useState(() => viewFromHash() || 'token')
  const [creds, setCreds] = useCreds()

  // Keep the tab and the URL hash in sync (supports back/forward + direct links).
  useEffect(() => {
    const onHash = () => { const id = viewFromHash(); if (id) setView(id) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = (id) => {
    setView(id)
    const slug = ID_TO_SLUG[id]
    if (slug && window.location.hash !== `#/${slug}`) window.location.hash = `#/${slug}`
  }

  const render = () => {
    switch (view) {
      case 'token': return <TokenJourney />
      case 'lab': return <LabJourney creds={creds} setCreds={setCreds} />
      case 'vibe': return <VibeCoding />
      case 'greeting': return <GreetingCards creds={creds} setCreds={setCreds} />
      case 'c1': return <Capstone1 creds={creds} setCreds={setCreds} />
      case 'c2': return <Capstone2 creds={creds} setCreds={setCreds} />
      case 'c3': return <Capstone3 creds={creds} setCreds={setCreds} />
      case 'c4': return <Capstone4 creds={creds} setCreds={setCreds} />
      default: return null
    }
  }

  const groups = ['Learn', 'Projects', 'Build']

  return (
    <div className="app">
      <SketchDefs />
      <WalkingCat />

      <div className="topbar">
        <span className="cloud-deco cd1"><CloudDoodle size={74} /></span>
        <span className="cloud-deco cd2"><CloudDoodle size={48} /></span>
        <div className="brand">
          <CloudGirlLogo size={52} />
          <div className="brand-text">
            <h1>AI, Visually</h1>
            <div className="sub">Interactive explainers for how AI really works · by <b>The Cloud Girl</b></div>
          </div>
        </div>
        <div className="view-tabs">
          {groups.map((g) => (
            <div className="view-group" key={g}>
              <div className="view-group-label">{g}</div>
              <div className="view-group-row">
                {VIEWS.filter((v) => v.group === g).map((v) => (
                  <button key={v.id} className={`view-tab ${view === v.id ? 'on' : ''}`} onClick={() => go(v.id)}>
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
