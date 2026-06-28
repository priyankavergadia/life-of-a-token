import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const r1 = (x) => Math.round(x * 10) / 10
const r2 = (x) => Math.round(x * 100) / 100
const fmt = (x) => (x >= 0 ? '' : '−') + Math.abs(x).toFixed(1)
const fmt2 = (x) => (x >= 0 ? '' : '−') + Math.abs(x).toFixed(2)

/* Build a frame-by-frame timeline for C = A · B.
   One frame per multiply (one term of one dot product). */
function buildTimeline(A, B) {
  const rows = A.length
  const K = A[0].length
  const cols = B[0].length
  const frames = []
  const resultAt = {} // 'i-j' -> { value, lastFrame }
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let sum = 0
      for (let t = 0; t < K; t++) {
        const term = A[i][t] * B[t][j]
        sum += term
        frames.push({ i, j, t, aVal: A[i][t], bVal: B[t][j], term, partial: sum, last: t === K - 1 })
      }
      resultAt[`${i}-${j}`] = { value: r2(sum), lastFrame: frames.length - 1 }
    }
  }
  return { frames, resultAt, rows, K, cols }
}

const CELL = 44

export function MatrixMultiply({
  A, B, rowLabels, colLabels, kLabels,
  aName = 'A', bName = 'B', cName = 'C',
  accent = '#f47b20', signature = '', speed = 720, autoplay = true,
}) {
  const tl = useMemo(() => buildTimeline(A, B), [signature]) // eslint-disable-line
  const { frames, resultAt, rows, K, cols } = tl

  const [frame, setFrame] = useState(0) // 0..frames.length (== done)
  const [playing, setPlaying] = useState(autoplay)
  const sigRef = useRef(signature)

  // reset when inputs change
  useEffect(() => {
    if (sigRef.current !== signature) {
      sigRef.current = signature
      setFrame(0)
      setPlaying(autoplay)
    }
  }, [signature, autoplay])

  const done = frame >= frames.length
  useEffect(() => {
    if (!playing || done) return
    const id = setTimeout(() => setFrame((f) => Math.min(frames.length, f + 1)), speed)
    return () => clearTimeout(id)
  }, [playing, frame, done, frames.length, speed])

  const cur = done ? null : frames[frame]
  const completed = (i, j) => frame > resultAt[`${i}-${j}`].lastFrame
  const cellValue = (i, j) => resultAt[`${i}-${j}`].value

  // current dot-product terms (for the work strip)
  const curTerms = []
  if (cur) {
    for (let t = 0; t <= cur.t; t++) {
      curTerms.push({ t, a: A[cur.i][t], b: B[t][cur.j], term: A[cur.i][t] * B[t][cur.j] })
    }
  }

  const reset = () => { setFrame(0); setPlaying(true) }
  const skip = () => { setFrame(frames.length); setPlaying(false) }
  const stepBack = () => { setPlaying(false); setFrame((f) => Math.max(0, f - 1)) }
  const stepFwd = () => { setPlaying(false); setFrame((f) => Math.min(frames.length, f + 1)) }

  const inCol = (j) => cur && cur.j === j
  const inRow = (i) => cur && cur.i === i

  return (
    <div className="mm-root">
      <div
        className="mm-grid"
        style={{
          gridTemplateColumns: `auto ${K * CELL}px ${cols * CELL}px`,
          gridTemplateRows: `auto ${K * CELL}px ${rows * CELL}px`,
        }}
      >
        {/* corner spacer (row1col1) */}
        <div /> <div />
        {/* B column labels */}
        <div className="mm-collabels" style={{ gridColumn: 3 }}>
          {colLabels.map((l, j) => (
            <div key={j} className="mm-axis" style={{ width: CELL, color: inCol(j) ? accent : undefined, fontWeight: inCol(j) ? 700 : 600 }}>{l}</div>
          ))}
        </div>

        {/* row2: corner label + (empty under kcorner) + B matrix */}
        <div className="mm-name" style={{ alignSelf: 'center' }}>{bName}</div>
        <div />
        <div className="mm-mat" style={{ gridTemplateColumns: `repeat(${cols}, ${CELL}px)`, gridTemplateRows: `repeat(${K}, ${CELL}px)` }}>
          {Array.from({ length: K }).map((_, t) =>
            B[t].map((v, j) => {
              const hot = cur && cur.j === j && cur.t === t
              const band = inCol(j)
              return (
                <div key={`${t}-${j}`} className={`mm-cell ${band ? 'band' : ''} ${hot ? 'hot' : ''}`}
                  style={hot ? { background: accent, color: '#fff', borderColor: '#2b261e' } : band ? { background: `${accent}22` } : undefined}>
                  {fmt(v)}
                </div>
              )
            }),
          )}
        </div>

        {/* row3: A label (role + word stacked) + A matrix + C matrix */}
        <div className="mm-aname" style={{ alignSelf: 'center' }}>
          <div className="mm-role">{aName}</div>
          {rowLabels.map((rl, i) => (
            <div key={'rl' + i} className="mm-word" style={{ color: inRow(i) ? accent : undefined }}>{rl}</div>
          ))}
        </div>
        <div className="mm-mat" style={{ gridTemplateColumns: `repeat(${K}, ${CELL}px)`, gridTemplateRows: `repeat(${rows}, ${CELL}px)` }}>
          {A.map((rowArr, i) =>
            rowArr.map((v, t) => {
              const hot = cur && cur.i === i && cur.t === t
              const band = inRow(i)
              return (
                <div key={`${i}-${t}`} className={`mm-cell ${band ? 'band' : ''} ${hot ? 'hot' : ''}`}
                  style={hot ? { background: accent, color: '#fff', borderColor: '#2b261e' } : band ? { background: `${accent}22` } : undefined}>
                  {fmt(v)}
                </div>
              )
            }),
          )}
        </div>
        <div className="mm-mat mm-c" style={{ gridTemplateColumns: `repeat(${cols}, ${CELL}px)`, gridTemplateRows: `repeat(${rows}, ${CELL}px)` }}>
          {Array.from({ length: rows }).map((_, i) =>
            Array.from({ length: cols }).map((_, j) => {
              const isDone = completed(i, j)
              const isCur = cur && cur.i === i && cur.j === j
              return (
                <div key={`${i}-${j}`} className={`mm-cell mm-out ${isCur ? 'target' : ''} ${isDone ? 'filled' : ''}`}
                  style={isDone ? { background: accent, color: '#fff', borderColor: '#2b261e' } : isCur ? { borderColor: accent, borderStyle: 'solid' } : undefined}>
                  {isDone ? <motion.span key="d" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>{fmt2(cellValue(i, j))}</motion.span>
                    : isCur ? <span className="mm-partial">{fmt2(cur.partial)}</span> : ''}
                </div>
              )
            }),
          )}
        </div>
      </div>

      {/* work strip: the live dot product */}
      <div className="mm-work">
        {cur ? (
          <div className="mm-eq">
            <span className="mm-eq-label" style={{ color: accent }}>
              {rowLabels[cur.i]} · {colLabels[cur.j]} =
            </span>
            <span className="mm-terms">
              {curTerms.map((tm, idx) => (
                <span key={idx} className={`mm-term ${tm.t === cur.t ? 'active' : ''}`} style={tm.t === cur.t ? { color: accent } : undefined}>
                  {idx > 0 && <span className="mm-plus">+</span>}
                  ({fmt(tm.a)}×{fmt(tm.b)})
                </span>
              ))}
            </span>
            <span className="mm-sum">= <b style={{ color: accent }}>{fmt2(cur.partial)}</b></span>
          </div>
        ) : (
          <div className="mm-eq done"><b style={{ color: accent }}>✓ All cells computed.</b> Each output number is one row‑dot‑column. That’s a matrix multiply.</div>
        )}
      </div>

      {/* controls */}
      <div className="mm-controls">
        <button className="mm-btn" onClick={() => setPlaying((p) => !p)} disabled={done}>{playing ? '⏸ Pause' : '▶ Play'}</button>
        <button className="mm-btn" onClick={stepBack} disabled={frame === 0}>◀ Step</button>
        <button className="mm-btn" onClick={stepFwd} disabled={done}>Step ▶</button>
        <button className="mm-btn" onClick={skip} disabled={done}>Skip ⏭</button>
        <button className="mm-btn" onClick={reset}>↺ Replay</button>
        <span className="mm-progress">{Math.min(frame, frames.length)} / {frames.length} multiplies</span>
      </div>
    </div>
  )
}
