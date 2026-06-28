import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { StickFigure, Squiggle } from './Doodles.jsx'
import { PROVIDERS } from './llm.js'

/* ---------------- Python syntax highlighter (safe React spans) ------------- */
const KW = new Set(['def', 'class', 'if', 'elif', 'else', 'import', 'from', 'for', 'while', 'return', 'in', 'and', 'or', 'not', 'with', 'as', 'try', 'except', 'True', 'False', 'None', 'await', 'async', 'lambda', 'print', 'raise', 'is'])
export function highlightPython(code) {
  const re = /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|f?"[^"]*"|f?'[^']*')|(\b\d+\.?\d*\b)|(@[A-Za-z_]\w*)|([A-Za-z_]\w*)/g
  const out = []
  let last = 0, m, key = 0
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(<span key={key++}>{code.slice(last, m.index)}</span>)
    const t = m[0]
    let cls = 'c-plain'
    if (m[1]) cls = 'c-comment'
    else if (m[2]) cls = 'c-str'
    else if (m[3]) cls = 'c-num'
    else if (m[4]) cls = 'c-deco'
    else if (m[5]) cls = KW.has(t) ? 'c-kw' : 'c-name'
    out.push(<span key={key++} className={cls}>{t}</span>)
    last = m.index + t.length
  }
  if (last < code.length) out.push(<span key={key++}>{code.slice(last)}</span>)
  return out
}
export function CodeBlock({ code, file = 'lab.py' }) {
  return (
    <div className="code-block">
      <div className="code-bar"><span className="cdot r" /><span className="cdot y" /><span className="cdot g" /><span className="code-file">{file}</span></div>
      <pre className="code-pre"><code>{highlightPython(code)}</code></pre>
    </div>
  )
}

/* ---------------- Live-call helpers ---------------- */
export const Reveal = ({ children, d = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d, duration: 0.35 }}>{children}</motion.div>
)
export function useRun() {
  const [s, setS] = useState({ loading: false, error: null, data: null })
  const run = async (fn) => {
    setS({ loading: true, error: null, data: null })
    try { setS({ loading: false, error: null, data: await fn() }) }
    catch (e) { setS({ loading: false, error: e.message || String(e), data: null }) }
  }
  return [s, run, setS]
}
export const Spinner = () => <span className="spin" />
export const LiveErr = ({ msg }) => <div className="live-err">⚠️ {msg}</div>
export const LiveBadge = () => <span className="live-badge">● LIVE</span>
export function NeedKey() {
  return <div className="need-key">🔌 Connect a provider in the ⚡ bar above to run this for real. Showing the demo for now.</div>
}

/* ---------------- Credentials (shared across all live tabs) ---------------- */
export function useCreds() {
  const [c, setC] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aiv_creds')) || { provider: 'gemini', keys: {} } }
    catch { return { provider: 'gemini', keys: {} } }
  })
  const save = (next) => { setC(next); try { localStorage.setItem('aiv_creds', JSON.stringify(next)) } catch (e) { /* ignore */ } }
  return [c, save]
}
export function liveCredsOf(creds) {
  return { provider: creds.provider, key: creds.keys[creds.provider] || '', connected: !!creds.keys[creds.provider] }
}

export function ConnectBar({ creds, setCreds }) {
  const p = PROVIDERS[creds.provider]
  const key = creds.keys[creds.provider] || ''
  const connected = !!key
  return (
    <div className="connect-bar">
      <div className="cb-row">
        <span className="cb-title">⚡ Go live:</span>
        <select className="cb-select" value={creds.provider} onChange={(e) => setCreds({ ...creds, provider: e.target.value })}>
          {Object.entries(PROVIDERS).map(([id, pr]) => <option key={id} value={id}>{pr.label}</option>)}
        </select>
        <input className="cb-key" type="password" autoComplete="off" spellCheck={false}
          placeholder={`paste your ${p.label} key (${p.keyHint})`} value={key}
          onChange={(e) => setCreds({ ...creds, keys: { ...creds.keys, [creds.provider]: e.target.value } })} />
        {connected
          ? <><span className="cb-ok">✓ connected</span><button className="cb-clear" onClick={() => setCreds({ ...creds, keys: { ...creds.keys, [creds.provider]: '' } })}>clear</button></>
          : <a className="cb-getkey" href={p.keyUrl} target="_blank" rel="noreferrer">get a key ↗</a>}
      </div>
      <div className="cb-note">🔒 Your key is stored <b>only in this browser</b> and sent <b>directly to {p.label}</b> — it never touches our servers. {!p.embeds && <span> · note: Claude has no embeddings API (embedding-based labs need Gemini or OpenAI).</span>}</div>
    </div>
  )
}

/* ---------------- Generic step-journey shell (code | visual) ----------------
   steps: [{ id, tab, kicker, title, file, pose, color, code, explain, Visual }]
   Each step's Visual receives { creds } (liveCreds). */
export function StepJourney({ steps, creds, setCreds, tagline }) {
  const [step, setStep] = useState(0)
  const live = liveCredsOf(creds)
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowRight') setStep((s) => Math.min(steps.length - 1, s + 1))
      if (e.key === 'ArrowLeft') setStep((s) => Math.max(0, s - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [steps.length])
  const cur = steps[step]
  const Visual = cur.Visual

  return (
    <>
      <div className="journey-head">
        <p className="journey-tag">{tagline}</p>
        <div className="pill">Step <b>{step + 1}</b> / {steps.length} · use <span className="kbd">←</span> <span className="kbd">→</span></div>
      </div>

      <ConnectBar creds={creds} setCreds={setCreds} />

      <div className="stepper">
        {steps.map((s, i) => (
          <button key={s.id} className={`step-tab ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} onClick={() => setStep(i)}>
            <span className="num">{i < step ? '✓' : i + 1}</span>{s.tab}
          </button>
        ))}
      </div>

      <motion.div key={cur.id + '-h'} className="lab-titlebar" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="mascot">
          <StickFigure pose={cur.pose} color={cur.color} size={64} />
          <div style={{ paddingBottom: 4 }}><div className="kicker">{cur.kicker}</div><h2>{cur.title}</h2></div>
        </div>
        <Squiggle width={150} />
      </motion.div>

      <div className="lab-stage">
        <motion.div key={cur.id + '-c'} className="panel code-panel" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <div className="panel-cap">📄 The code</div>
          <CodeBlock code={cur.code} file={cur.file} />
        </motion.div>
        <motion.div key={cur.id + '-v'} className="panel viz lab-visual" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <div className="panel-cap">✨ What it does {live.connected && <span className="cap-live">· live on {PROVIDERS[live.provider].label}</span>}</div>
          <Visual creds={live} />
          <div className="lab-explain">{cur.explain}</div>
        </motion.div>
      </div>

      <div className="nav">
        <button className="btn ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} style={{ opacity: step === 0 ? 0.4 : 1 }}>← Back</button>
        <div className="progress"><i style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
        {step < steps.length - 1
          ? <button className="btn" onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}>Next →</button>
          : <button className="btn" onClick={() => setStep(0)}>↺ Start over</button>}
      </div>
    </>
  )
}
