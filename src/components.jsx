import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDoodle, StickFigure, StarDoodle } from './Doodles.jsx'
import { MatrixMultiply } from './Matmul.jsx'

const stagger = (i) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.035, duration: 0.3 },
})

// small deterministic pseudo-weight for demo matrices, rounded to 1 decimal
const r1 = (x) => Math.round(x * 10) / 10
function seeded(a, b) {
  let h = (a * 374761393 + b * 668265263) >>> 0
  h = (h ^ (h >>> 13)) * 1274126177
  return r1(((h >>> 0) / 4294967295) * 2 - 1)
}

/* ------------------------------------------------------------------ TOKENS */
export function TokenFlow({ tokens }) {
  return (
    <div>
      <div className="section-title">{tokens.length} tokens</div>
      <div className="token-flow">
        {tokens.map((t, i) => (
          <motion.div
            key={i}
            className={`tok ${t.isSubword ? 'sub' : ''} ${t.kind === 'punct' ? 'punct' : ''}`}
            {...stagger(i)}
          >
            <span>
              {t.leadingSpace && <span className="lead">␣</span>}
              {t.text}
            </span>
            <span className="meta">
              #{t.id}
              {t.isSubword ? ` · piece ${t.subwordPart}` : ''}
              {t.kind === 'punct' ? ' · punct' : ''}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="legend">
        <span><i style={{ background: 'var(--panel-2)', border: '1px solid var(--line)' }} /> whole word</span>
        <span><i style={{ background: 'rgba(230,161,90,0.5)' }} /> sub-word piece</span>
        <span><i style={{ background: 'rgba(21,179,164,0.5)' }} /> punctuation</span>
        <span>␣ = a leading space (part of the token)</span>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- VECTORS */
function Bars({ vec, color = 'var(--orange)' }) {
  return (
    <div className="vec-bars">
      {vec.map((v, i) => {
        const h = Math.min(100, Math.abs(v) * 100)
        const up = v >= 0
        return (
          <div className="vec-cell" key={i} title={v.toFixed(2)}>
            <motion.i
              initial={{ height: 0 }}
              animate={{ height: `${h / 2}%` }}
              transition={{ delay: i * 0.03, duration: 0.4 }}
              style={{
                top: up ? '50%' : 'auto',
                bottom: up ? 'auto' : '50%',
                background: up ? color : 'var(--coral)',
                transform: up ? 'none' : 'none',
              }}
            />
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--line)' }} />
          </div>
        )
      })}
    </div>
  )
}

export function VectorList({ tokens, embeds, max = 6 }) {
  const shown = tokens.slice(0, max)
  return (
    <div>
      <div className="section-title">Embedding vectors · 8 of ~5,000 dimensions shown</div>
      {shown.map((t, i) => (
        <motion.div className="vec-row" key={i} {...stagger(i)}>
          <div className="vec-label" style={{ color: embeds[i].color }}>{t.text}</div>
          <Bars vec={embeds[i].vec} color={embeds[i].color} />
        </motion.div>
      ))}
      {tokens.length > max && <div className="fade-key">+ {tokens.length - max} more tokens…</div>}
      <div className="fade-key" style={{ marginTop: 14 }}>
        Each bar is one number. Up = positive, down = negative. Similar words have similar bar patterns.
      </div>
    </div>
  )
}

/* ----------------------------------------------------------- EMBEDDING MAP */
export function EmbeddingMap({ tokens, embeds, regions }) {
  const [hover, setHover] = useState(null)
  const W = 460, H = 378, pad = 26
  const sx = (x) => pad + ((x + 1) / 2) * (W - pad * 2)
  const sy = (y) => pad + ((1 - (y + 1) / 2)) * (H - pad * 2)

  return (
    <div className="map-wrap">
      <svg className="map-svg" viewBox={`0 0 ${W} ${H}`}>
        {/* grid */}
        {[...Array(9)].map((_, i) => (
          <line key={'v' + i} x1={pad + (i * (W - pad * 2)) / 8} y1={pad} x2={pad + (i * (W - pad * 2)) / 8} y2={H - pad} stroke="var(--line-soft)" strokeWidth="0.5" />
        ))}
        {[...Array(8)].map((_, i) => (
          <line key={'h' + i} x1={pad} y1={pad + (i * (H - pad * 2)) / 7} x2={W - pad} y2={pad + (i * (H - pad * 2)) / 7} stroke="var(--line-soft)" strokeWidth="0.5" />
        ))}
        {/* region halos + labels */}
        {regions.map((r, i) => (
          <g key={i}>
            <circle cx={sx(r.x)} cy={sy(r.y)} r="58" fill={r.color} opacity="0.12" stroke={r.color} strokeWidth="1.5" strokeDasharray="4 5" />
            <text className="region-label" x={sx(r.x)} y={sy(r.y) - 64} textAnchor="middle" fill={r.color} opacity="0.75">{r.name}</text>
          </g>
        ))}
        {/* points */}
        {tokens.map((t, i) => {
          const e = embeds[i]
          const active = hover === i
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <motion.circle
                className="map-pt"
                cx={sx(e.x)} cy={sy(e.y)}
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: active ? 9 : 6, opacity: 1 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                fill={e.color}
                stroke="#2b261e"
                strokeWidth={active ? 2.6 : 1.8}
              />
              <text className="map-label" x={sx(e.x) + 9} y={sy(e.y) + 3} opacity={active ? 1 : 0.7}>{t.text}</text>
            </g>
          )
        })}
      </svg>
      {hover != null && (
        <div className="tooltip" style={{ left: sx(embeds[hover].x) / W * 100 + '%', top: sy(embeds[hover].y) / H * 100 + '%' }}>
          “{tokens[hover].text}” → {embeds[hover].region}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------ POSITIONAL WAVES */
export function PositionalWave({ tokens, positions }) {
  const W = 460, H = 300, pad = 26
  const dims = 8
  const colW = (W - pad * 2) / Math.max(tokens.length, 1)
  const rowH = (H - pad * 2) / dims
  return (
    <div>
      <div className="section-title">Position fingerprints · row = dimension, column = token slot</div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', filter: 'url(#sketch)' }}>
        {tokens.map((t, ti) =>
          positions[ti].map((v, di) => {
            const val = (v + 1) / 2 // 0..1
            return (
              <motion.rect
                key={`${ti}-${di}`}
                x={pad + ti * colW + 1}
                y={pad + di * rowH + 1}
                width={colW - 2}
                height={rowH - 2}
                rx="3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (ti * dims + di) * 0.006 }}
                fill={`rgba(244,123,32,${0.12 + val * 0.85})`}
              />
            )
          }),
        )}
        {tokens.map((t, ti) => (
          <text key={ti} x={pad + ti * colW + colW / 2} y={H - 8} textAnchor="middle" className="attn-axis">{ti}</text>
        ))}
      </svg>
      <div className="fade-key">
        Every position gets a unique pattern of light/dark cells — built from sine &amp; cosine waves. The model adds this to each
        token so it knows word order without reading left-to-right.
      </div>
    </div>
  )
}

/* ----------------------------------------------------------- ATTENTION */
const softmax = (arr) => {
  const m = Math.max(...arr)
  const ex = arr.map((v) => Math.exp(v - m))
  const s = ex.reduce((a, b) => a + b, 0)
  return ex.map((v) => v / s)
}

function AttentionHeatmap({ tokens, heads }) {
  const [head, setHead] = useState(2)
  const m = heads[head].matrix
  const n = tokens.length
  return (
    <div>
      <div className="head-tabs">
        {heads.map((h, i) => (
          <button key={i} className={`head-tab ${i === head ? 'active' : ''}`} onClick={() => setHead(i)}>
            <i style={{ background: h.hue }} />
            {h.name.split(' · ')[1]}
          </button>
        ))}
      </div>
      <div className="attn-grid" style={{ gridTemplateColumns: `48px repeat(${n}, 1fr)` }}>
        <div />
        {tokens.map((t, j) => (
          <div key={j} className="attn-axis" style={{ textAlign: 'center', alignSelf: 'end', overflow: 'hidden' }}>{t.text.slice(0, 4)}</div>
        ))}
        {tokens.map((t, i) => (
          <React.Fragment key={i}>
            <div className="attn-axis" style={{ alignSelf: 'center', textAlign: 'right', paddingRight: 6, overflow: 'hidden' }}>{t.text.slice(0, 5)}</div>
            {tokens.map((_, j) => {
              const w = m[i][j]
              return (
                <motion.div key={j} className="attn-cell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (i * n + j) * 0.004 }}
                  style={{ background: j > i ? 'transparent' : `${heads[head].hue}${Math.round(w * 220 + 18).toString(16).padStart(2, '0')}` }}
                  title={`“${tokens[i].text}” → “${tokens[j].text}”: ${(w * 100).toFixed(0)}%`}>
                  {w > 0.22 ? Math.round(w * 100) : ''}
                </motion.div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="note" style={{ marginTop: 14, borderLeftColor: heads[head].hue }}>
        <b style={{ color: heads[head].hue }}>{heads[head].name}</b> — {heads[head].desc}
      </div>
      <div className="fade-key">
        Read a row: how much that word (left) <b>looks at</b> each earlier word (top). Brighter = more attention. The upper-right is empty — a word can’t see the future.
      </div>
    </div>
  )
}

function AttentionMath({ tokens, embeds }) {
  // default query = the last real word (skip trailing punctuation)
  const defaultQ = (() => {
    for (let i = tokens.length - 1; i >= 0; i--) if (tokens[i].kind === 'word') return i
    return Math.max(0, tokens.length - 1)
  })()
  const [q, setQ] = useState(defaultQ)
  const qi = Math.min(q, tokens.length - 1)
  const D = 4 // reduced head dimension for legibility

  // A = the query word's vector (1×4); B = every token's key vector as columns (4×N up to qi, causal)
  const visible = tokens.slice(0, qi + 1)
  const A = [embeds[qi].vec.slice(0, D).map(r1)]
  const B = Array.from({ length: D }, (_, t) => visible.map((_, j) => r1(embeds[j].vec[t])))
  const rowLabels = [tokens[qi].text]
  const colLabels = visible.map((t) => t.text.slice(0, 5))
  const sig = `attn-${qi}-${tokens.map((t) => t.text).join('_')}`

  // scores → softmax for the payoff
  const scores = visible.map((_, j) => A[0].reduce((s, a, t) => s + a * B[t][j], 0))
  const weights = softmax(scores.map((s) => s / Math.sqrt(D)))

  return (
    <div>
      <div className="qpick">
        <span>which word is asking?</span>
        {tokens.map((t, i) => (
          <button key={i} className={i === qi ? 'on' : ''} onClick={() => setQ(i)}>{t.text}</button>
        ))}
      </div>
      <div className="mm-scroll">
        <MatrixMultiply A={A} B={B} rowLabels={rowLabels} colLabels={colLabels} aName="Query" bName="Keys" accent="#f47b20" signature={sig} />
      </div>
      <div className="note analogy" style={{ marginTop: 16 }}>
        <b>What you just watched:</b> the word “{tokens[qi].text}” (the Query) is compared against every earlier word (the Keys) by
        multiplying their number-lists and adding up — one <b>raw score</b> per word. A higher score = a better match.
      </div>
      <div className="section-title" style={{ marginTop: 18 }}>…then softmax turns scores into attention %</div>
      {visible.map((t, j) => (
        <div className="pred-row" key={j}>
          <div className={`pred-token ${weights[j] === Math.max(...weights) ? 'win' : ''}`}>{t.text}</div>
          <div className="pred-bar"><motion.i initial={{ width: 0 }} animate={{ width: `${weights[j] * 100}%` }} transition={{ duration: 0.5 }} /></div>
          <div className="pred-pct">{Math.round(weights[j] * 100)}%</div>
        </div>
      ))}
      <div className="fade-key">“{tokens[qi].text}” pulls most of its information from the highlighted word. That’s attention.</div>
    </div>
  )
}

export function AttentionView({ tokens, embeds, heads }) {
  const [mode, setMode] = useState('math')
  return (
    <div>
      <div className="mode-toggle">
        <button className={mode === 'math' ? 'on' : ''} onClick={() => setMode('math')}>▶ Watch the math</button>
        <button className={mode === 'heat' ? 'on' : ''} onClick={() => setMode('heat')}>Heat-map · all words</button>
      </div>
      {mode === 'math' ? <AttentionMath tokens={tokens} embeds={embeds} /> : <AttentionHeatmap tokens={tokens} heads={heads} />}
    </div>
  )
}

/* ----------------------------------------------------------------- FFN */
export function FFNView({ ffnResult, lastToken, lastVec }) {
  const hidden = ffnResult.hidden
  const maxAbs = Math.max(...hidden.map((v) => Math.abs(v)), 0.001)

  // animated demo: input (1×4) · weights (4×6) → 6 neuron pre-activations
  const D = 4, NEUR = 6
  const A = [(lastVec || []).slice(0, D).map(r1)]
  const B = Array.from({ length: D }, (_, t) => Array.from({ length: NEUR }, (_, j) => seeded(t + 1, j + 3)))
  const rowLabels = [lastToken || 'word']
  const colLabels = Array.from({ length: NEUR }, (_, j) => `n${j + 1}`)
  const sig = `ffn-${lastToken}-${A[0].join(',')}`

  return (
    <div>
      <div className="section-title">Feed-forward · multiply “{lastToken}” by the weight matrix</div>
      <div className="mm-scroll">
        <MatrixMultiply A={A} B={B} rowLabels={rowLabels} colLabels={colLabels} aName="word" bName="weights" cName="neurons" accent="#15b3a4" signature={sig} />
      </div>
      <div className="note" style={{ marginTop: 16 }}>
        <b>Each neuron</b> is just the word’s numbers multiplied by that neuron’s personal weights and summed. Do it for every neuron and the
        word lights up a unique pattern — then a nonlinearity (GELU) keeps the strong signals and mutes the rest.
      </div>

      <div className="section-title" style={{ marginTop: 20 }}>The real layer fires ~32 neurons at once</div>
      <div className="neuron-grid">
        {hidden.map((v, i) => {
          const a = Math.abs(v) / maxAbs
          const on = v > 0
          return (
            <motion.div key={i} className="neuron"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, background: a > 0.05 ? `${on ? 'rgba(21,179,164,' : 'rgba(244,123,32,'}${0.15 + a * 0.8})` : 'var(--panel-3)' }}
              transition={{ delay: i * 0.012, duration: 0.4 }} title={v.toFixed(2)} />
          )
        })}
      </div>
      <div className="legend">
        <span><i style={{ background: 'rgba(21,179,164,0.8)' }} /> firing (+)</span>
        <span><i style={{ background: 'rgba(244,123,32,0.8)' }} /> firing (−)</span>
        <span><i style={{ background: 'var(--panel-3)' }} /> quiet</span>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- LAYERS */
const FLOW_BLOCKS = [
  { n: 'Block 1', what: 'grammar & nearby words' },
  { n: 'Block 2', what: 'who-refers-to-what' },
  { n: 'Block 3', what: 'phrases & relationships' },
  { n: 'Block 4', what: 'meaning & intent' },
  { n: 'Block 5', what: 'reasoning & nuance' },
  { n: 'Block 6', what: 'what should come next' },
]
const FLOW_STEP = 70

export function LayersView({ firstToken = 'Why', nextToken = '…' }) {
  const [active, setActive] = useState(-1) // -1 = entering, 0..5 = inside block, 6 = exited
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a >= FLOW_BLOCKS.length ? -1 : a + 1)), 1050)
    return () => clearInterval(id)
  }, [])

  const idx = Math.max(0, Math.min(active, FLOW_BLOCKS.length - 1))
  // packet numbers "transform" as they pass through each block
  const nums = [0, 1, 2, 3].map((d) => r1(Math.sin((active + 2) * 1.27 + d * 1.9) * 0.9))
  const packetTop = active < 0 ? -56 : active >= FLOW_BLOCKS.length ? FLOW_BLOCKS.length * FLOW_STEP - 6 : active * FLOW_STEP + 8

  return (
    <div>
      <div className="section-title">Watch a word travel down the stack</div>
      <div className="flow-io" style={{ marginBottom: 10 }}>
        <span style={{ color: 'var(--orange)' }}>in:</span>
        <span className="flow-num" style={{ background: 'var(--panel-2)' }}>“{firstToken}”</span>
        <ArrowDoodle />
        <span style={{ fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--sans)', fontWeight: 500 }}>becomes a list of numbers…</span>
      </div>

      <div className="flow-stack" style={{ height: FLOW_BLOCKS.length * FLOW_STEP }}>
        <motion.div className="flow-packet" animate={{ top: packetTop }} transition={{ type: 'spring', stiffness: 120, damping: 18 }}>
          {nums.map((v, i) => (
            <motion.div key={i} className="flow-num" animate={{ scale: active === idx ? [1, 1.12, 1] : 1 }} transition={{ duration: 0.5 }}>{v >= 0 ? ' ' : ''}{v.toFixed(1)}</motion.div>
          ))}
        </motion.div>
        {FLOW_BLOCKS.map((b, i) => (
          <div key={i} className={`flow-block ${active === i ? 'active' : ''}`} style={{ height: FLOW_STEP - 12 }}>
            <div className="bname">{b.n}</div>
            <div className="lbar" style={{ flex: 'none', width: 50 }} />
            <div className="bwhat">attention + feed-forward → <b style={{ color: 'var(--ink)' }}>{b.what}</b></div>
          </div>
        ))}
      </div>

      <div className="flow-io" style={{ marginTop: 12 }}>
        <span style={{ color: 'var(--teal-deep)' }}>out:</span>
        <motion.span className="flow-num" animate={{ background: active >= FLOW_BLOCKS.length ? 'var(--teal)' : 'var(--panel-2)', color: active >= FLOW_BLOCKS.length ? '#fff' : 'var(--ink)' }} style={{ fontFamily: 'var(--mono)' }}>“{nextToken}”</motion.span>
        <span style={{ fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'var(--sans)', fontWeight: 500 }}>a confident guess at the next word</span>
      </div>

      <div className="fade-key" style={{ marginTop: 14 }}>
        Same two moves in every block — <b>attention</b> (mix between words) then <b>feed-forward</b> (think per word) — and the numbers get
        richer each pass. Early blocks catch grammar; deeper blocks build meaning and reasoning. Big models stack dozens.
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- OUTPUT */
export function OutputView({ predictions, context }) {
  const winner = predictions.reduce((a, b) => (b.prob > a.prob ? b : a), predictions[0])
  return (
    <div>
      <div className="section-title">Next-token probabilities</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 14, marginBottom: 16, color: 'var(--text-dim)' }}>
        {context} <span style={{ color: 'var(--teal)' }}>▮</span>
      </div>
      {predictions.map((p, i) => (
        <motion.div className="pred-row" key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
          <div className={`pred-token ${p === winner ? 'win' : ''}`}>{p.token}</div>
          <div className="pred-bar">
            <motion.i initial={{ width: 0 }} animate={{ width: `${p.prob * 100}%` }} transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }} />
          </div>
          <div className="pred-pct">{(p.prob * 100).toFixed(0)}%</div>
        </motion.div>
      ))}
      <div className="fade-key" style={{ marginTop: 14 }}>
        Every word in the vocabulary gets a score (a <b style={{ color: 'var(--text)' }}>logit</b>). <b style={{ color: 'var(--text)' }}>Softmax</b> turns scores into
        percentages that add to 100%. The model samples one — usually the top, with a little randomness (“temperature”) for variety.
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- INTRO */
export function IntroView() {
  const nodes = ['Your words', 'Tokens', 'Embeddings', 'Positions', 'Attention', 'Feed-forward', '×N blocks', 'Next word']
  return (
    <div className="hero">
      <div className="big">
        You type a question. A fraction of a second later, <em>Claude answers.</em><br />
        What actually happens in between?
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 15, lineHeight: 1.65, margin: 0 }}>
        An LLM doesn’t look anything up. It turns your words into <b style={{ color: 'var(--text)' }}>numbers</b>, lets those numbers
        talk to each other thousands of times, and out the other side falls the single most likely next word — over and over.
        This is that journey, one click at a time.
      </p>
      <div className="flowmap">
        {nodes.map((n, i) => (
          <React.Fragment key={i}>
            <motion.div className="node" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <span style={{ color: 'var(--orange)', fontFamily: 'var(--hand)', fontWeight: 700, fontSize: 18 }}>{i + 1}</span> {n}
            </motion.div>
            {i < nodes.length - 1 && <span className="arrow"><ArrowDoodle /></span>}
          </React.Fragment>
        ))}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: nodes.length * 0.08 }} style={{ marginLeft: 4 }}>
          <StickFigure pose="walk" color="#15b3a4" size={56} />
        </motion.div>
      </div>
      <div className="note analogy">
        <b>Try it:</b> change the query up top to anything you like, then walk through the steps.
        Every visual recomputes from your actual words.
      </div>
    </div>
  )
}
