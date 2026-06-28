import React, { useState, useEffect, useRef } from 'react'

/* The hand-drawn wobble filter. Rendered once, globally, then referenced by
   CSS (filter: url(#sketch)) and by individual doodles. feTurbulence +
   feDisplacementMap nudges every straight edge so it looks marker-drawn. */
export function SketchDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        <filter id="sketch" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="sketch-strong" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}

const INK = '#2b261e'

/* A friendly stick figure that changes pose to match each step. */
export function StickFigure({ pose = 'wave', color = '#ffc02e', size = 74 }) {
  // arm/leg/extra paths per pose
  const poses = {
    wave: {
      arms: 'M24 27 L11 16 M24 28 L35 33',
      extra: null,
    },
    point: {
      arms: 'M24 28 L13 34 M24 27 L41 22',
      extra: 'M41 22 l5 -1 M41 22 l1 5', // little pointing spark
    },
    think: {
      arms: 'M24 29 L15 35 M24 27 L31 17',
      extra: 'M36 11 a2.4 2.4 0 1 0 0.1 0 M40 7 a1.6 1.6 0 1 0 0.1 0', // thought bubbles
    },
    cheer: {
      arms: 'M24 26 L11 12 M24 26 L37 12',
      extra: 'M9 9 l-3 -3 M39 9 l3 -3 M24 4 l0 -4', // celebration ticks
    },
    walk: {
      arms: 'M24 28 L14 24 M24 28 L34 32',
      extra: null,
      legs: 'M24 45 L15 58 M24 45 L33 56',
    },
  }
  const p = poses[pose] || poses.wave
  return (
    <svg viewBox="0 0 50 66" width={size} height={size * 1.32} style={{ filter: 'url(#sketch)', overflow: 'visible' }}>
      <g fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {/* head */}
        <circle cx="24" cy="13" r="8.5" fill={color} />
        {/* face */}
        <circle cx="21" cy="12" r="0.9" fill={INK} stroke="none" />
        <circle cx="27" cy="12" r="0.9" fill={INK} stroke="none" />
        <path d="M20.5 16 q3.5 3 7 0" />
        {/* body */}
        <path d="M24 21.5 L24 45" />
        {/* legs */}
        <path d={p.legs || 'M24 45 L16 60 M24 45 L32 60'} />
        {/* arms */}
        <path d={p.arms} />
        {/* extra doodle bits */}
        {p.extra && <path d={p.extra} stroke={color === '#ffc02e' ? '#f47b20' : color} strokeWidth="2" />}
      </g>
    </svg>
  )
}

/* A doodled sun with rays. */
export function SunDoodle({ size = 46 }) {
  const rays = []
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const x1 = 24 + Math.cos(a) * 14
    const y1 = 24 + Math.sin(a) * 14
    const x2 = 24 + Math.cos(a) * 21
    const y2 = 24 + Math.sin(a) * 21
    rays.push(<path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} />)
  }
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} style={{ filter: 'url(#sketch)', overflow: 'visible' }}>
      <g fill="none" stroke="#f47b20" strokeWidth="2.4" strokeLinecap="round">
        <circle cx="24" cy="24" r="11" fill="#ffc02e" />
        {rays}
      </g>
    </svg>
  )
}

/* A hand-drawn squiggle underline. */
export function Squiggle({ width = 130, color = '#f47b20' }) {
  return (
    <svg viewBox="0 0 130 10" width={width} height={10} style={{ filter: 'url(#sketch)', display: 'block' }}>
      <path d="M2 6 Q 14 1 26 6 T 50 6 T 74 6 T 98 6 T 128 6" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

/* A little curved doodle arrow (used between flow nodes). */
export function ArrowDoodle({ color = '#2b261e' }) {
  return (
    <svg viewBox="0 0 26 20" width="22" height="17" style={{ filter: 'url(#sketch)', overflow: 'visible' }}>
      <g fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 10 q 10 -6 20 0" />
        <path d="M22 10 l -5 -3 M22 10 l -5 4" />
      </g>
    </svg>
  )
}

export function StarDoodle({ size = 20, color = '#15b3a4' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ filter: 'url(#sketch)' }}>
      <path d="M12 2 L14.6 9 L22 9 L16 13.5 L18.5 21 L12 16.5 L5.5 21 L8 13.5 L2 9 L9.4 9 Z"
        fill={color} stroke="#2b261e" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

/* ---- Cloud Girl brand: a fluffy teal cloud (bold marker outline) ---- */
export function CloudDoodle({ size = 60, teal = '#4ec5d4', light = '#bdeef4', ink = '#15140f' }) {
  return (
    <svg viewBox="0 0 104 64" width={size} height={size * 0.62} style={{ filter: 'url(#sketch)', overflow: 'visible', display: 'block' }} aria-hidden>
      <path d="M26 56 C9 56 3 42 16 37 C11 24 30 18 37 28 C41 13 65 13 69 28 C84 21 98 33 88 45 C99 48 95 58 80 58 Z"
        fill={teal} stroke={ink} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M22 38 C20 31 30 27 35 31" fill="none" stroke={light} strokeWidth="3" strokeLinecap="round" />
      <path d="M48 24 C53 21 60 23 62 28" fill="none" stroke={light} strokeWidth="3" strokeLinecap="round" />
      {/* little motion ticks, like the logo */}
      <path d="M96 20 l7 -3 M96 28 l8 0" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

/* The Cloud Girl wordmark logo: teal clouds + stacked "CLOUD GIRL". */
export function CloudGirlLogo({ size = 50 }) {
  return (
    <div className="cg-logo" aria-label="Cloud Girl">
      <CloudDoodle size={size} />
      <div className="cg-word"><span>CLOUD</span><span>GIRL</span></div>
    </div>
  )
}

/* A teal "cloud cat" (styled to match the Cloud Girl logo) that teleport-strolls
   to random spots on screen now and then, and sometimes waves a "hi!". */
export function WalkingCat({ teal = '#4ec5d4', light = '#cdeff4', ink = '#15140f' }) {
  const [pos, setPos] = useState({ x: 12, y: 78 })   // vw / vh
  const [facing, setFacing] = useState(1)
  const [moving, setMoving] = useState(false)
  const [hi, setHi] = useState(false)
  const xRef = useRef(pos.x)

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let moveT, hiT, stopT
    const roam = () => {
      const nx = 4 + Math.random() * 82            // keep within viewport
      const ny = 16 + Math.random() * 70
      setFacing(nx >= xRef.current ? 1 : -1)
      xRef.current = nx
      setMoving(true)
      setPos({ x: nx, y: ny })
      if (Math.random() < 0.45) { setHi(true); hiT = setTimeout(() => setHi(false), 2600) }
      stopT = setTimeout(() => setMoving(false), 2300)   // matches CSS transition
      moveT = setTimeout(roam, 4500 + Math.random() * 7000)
    }
    moveT = setTimeout(roam, 2500)
    return () => { clearTimeout(moveT); clearTimeout(hiT); clearTimeout(stopT) }
  }, [])

  return (
    <div className={`cloud-cat ${moving ? 'moving' : ''}`} style={{ left: `${pos.x}vw`, top: `${pos.y}vh` }} aria-hidden="true">
      {hi && <div className="cc-hi">hi! <span>👋</span></div>}
      <div className="cc-inner" style={{ transform: `scaleX(${facing})` }}>
        <svg viewBox="0 0 100 56" width="78" style={{ filter: 'url(#sketch)', overflow: 'visible' }}>
          <g className="cat-body-bob">
            <path className="cat-tail" d="M18 32 q -14 -2 -12 -16 q 1 -7 8 -7" fill="none" stroke={ink} strokeWidth="3.6" strokeLinecap="round" />
            <g className="cat-leg leg-b"><rect x="26" y="37" width="5" height="14" rx="2.5" fill={teal} stroke={ink} strokeWidth="2.4" /></g>
            <g className="cat-leg leg-a"><rect x="36" y="37" width="5" height="14" rx="2.5" fill={teal} stroke={ink} strokeWidth="2.4" /></g>
            <g className="cat-leg leg-a"><rect x="58" y="37" width="5" height="14" rx="2.5" fill={teal} stroke={ink} strokeWidth="2.4" /></g>
            <g className="cat-leg leg-b"><rect x="67" y="37" width="5" height="14" rx="2.5" fill={teal} stroke={ink} strokeWidth="2.4" /></g>
            {/* body */}
            <ellipse cx="46" cy="30" rx="31" ry="15" fill={teal} stroke={ink} strokeWidth="3" />
            {/* light belly highlight (cloud-like) */}
            <path d="M28 34 q 18 9 38 0" fill="none" stroke={light} strokeWidth="3.2" strokeLinecap="round" />
            {/* head */}
            <circle cx="77" cy="24" r="13" fill={teal} stroke={ink} strokeWidth="3" />
            {/* ears */}
            <path d="M67 14 l-1 -10 l10 6 z" fill={teal} stroke={ink} strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M85 12 l5 -9 l4 10 z" fill={teal} stroke={ink} strokeWidth="2.4" strokeLinejoin="round" />
            {/* eye + smile */}
            <circle cx="81" cy="22" r="2" fill={ink} />
            <path d="M83 28 q 3 2 6 0" fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
            <path d="M87 25 l2.4 1.2 l-2.4 1.2 z" fill={ink} />
            <path d="M85 25 l10 -1.5 M85 28 l10 2" stroke={ink} strokeWidth="1.2" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    </div>
  )
}
