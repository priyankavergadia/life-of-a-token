import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StickFigure, Squiggle, ArrowDoodle } from './Doodles.jsx'

/* ============================================================
   Tiny Python syntax highlighter (safe — builds React spans)
   ============================================================ */
const KW = new Set(['def', 'class', 'if', 'elif', 'else', 'import', 'from', 'for', 'while', 'return', 'in', 'and', 'or', 'not', 'with', 'as', 'try', 'except', 'True', 'False', 'None', 'await', 'async', 'lambda', 'print', 'raise', 'is'])
function highlightPython(code) {
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

function CodeBlock({ code, file = 'lab.py' }) {
  return (
    <div className="code-block">
      <div className="code-bar">
        <span className="cdot r" /><span className="cdot y" /><span className="cdot g" />
        <span className="code-file">{file}</span>
      </div>
      <pre className="code-pre"><code>{highlightPython(code)}</code></pre>
    </div>
  )
}

const Reveal = ({ children, d = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d, duration: 0.35 }}>{children}</motion.div>
)

/* ============================================================
   VISUALS — one per lab
   ============================================================ */

function V_Intro() {
  const labs = [
    { icon: '🔌', t: 'The Toggle', d: 'Swap Gemini ⇄ OpenAI with one line' },
    { icon: '🌡️', t: 'Temperature', d: 'Dial creativity up or down' },
    { icon: '🧲', t: 'Embeddings', d: 'Turn words into numbers with meaning' },
    { icon: '🛡️', t: 'Context / RAG', d: 'Feed the AI your private facts' },
    { icon: '🤖', t: 'Agents + Tools', d: 'Let the AI take actions' },
    { icon: '👁️', t: 'Vision', d: 'Give the AI eyes' },
  ]
  return (
    <div className="lab-grid2">
      {labs.map((l, i) => (
        <Reveal d={i * 0.08} key={i}>
          <div className="lab-card">
            <div className="lab-card-ic">{l.icon}</div>
            <div><div className="lab-card-t">{l.t}</div><div className="lab-card-d">{l.d}</div></div>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

function V_Toggle() {
  const [prov, setProv] = useState('GEMINI')
  const engines = {
    GEMINI: { name: 'Google Gemini', model: 'gemini-2.5-flash', color: '#2e9bd6', ic: '✦' },
    OPENAI: { name: 'OpenAI GPT-4o', model: 'gpt-4o', color: '#15b3a4', ic: '◇' },
  }
  return (
    <div>
      <div className="toggle-row">
        {Object.entries(engines).map(([k, e]) => (
          <button key={k} className={`engine-card ${prov === k ? 'on' : ''}`} onClick={() => setProv(k)} style={prov === k ? { borderColor: e.color, boxShadow: `4px 5px 0 ${e.color}` } : {}}>
            <div className="engine-ic" style={{ color: e.color }}>{e.ic}</div>
            <div className="engine-name">{e.name}</div>
            <div className="engine-model">{e.model}</div>
            {prov === k && <div className="engine-live" style={{ background: e.color }}>● live</div>}
          </button>
        ))}
      </div>
      <div className="big-switch" onClick={() => setProv((p) => (p === 'GEMINI' ? 'OPENAI' : 'GEMINI'))}>
        <span>flip the engine</span>
        <div className={`switch-track ${prov === 'OPENAI' ? 'right' : ''}`}><motion.div layout className="switch-knob" /></div>
      </div>
      <div className="logic-box">
        <div className="logic-cap">Your business logic</div>
        <code>answer = llm.invoke(prompt)</code>
        <div className="logic-note">↑ never changes — that’s why you’re not locked to one vendor.</div>
      </div>
    </div>
  )
}

function V_Temperature() {
  const cold = 'Brewed for the bold future.'
  const hots = ['Sip tomorrow, brewed today.', 'Caffeine from another galaxy.', 'Where robots pour poetry.', 'Espresso at light speed.', 'Your daily dose of the future.']
  const [i, setI] = useState(0)
  return (
    <div>
      <div className="temp-prompt">prompt: <b>“Write a 5-word tagline for a futuristic coffee shop.”</b></div>
      <div className="temp-cols">
        <div className="temp-col cold">
          <div className="temp-h">❄️ Temperature 0.0</div>
          <div className="temp-sub">deterministic · same answer every run</div>
          {[0, 1, 2].map((n) => <div key={n} className="temp-out">{cold}</div>)}
        </div>
        <div className="temp-col hot">
          <div className="temp-h">🔥 Temperature 1.0</div>
          <div className="temp-sub">creative · changes every run</div>
          {[0, 1, 2].map((n) => <div key={n} className="temp-out">{hots[(i + n) % hots.length]}</div>)}
        </div>
      </div>
      <button className="lab-run" onClick={() => setI((v) => (v + 3) % hots.length)}>🎲 Run again</button>
    </div>
  )
}

function V_Embeddings() {
  const pts = [
    { w: 'Cat', x: 26, y: 34, c: '#2e9bd6' },
    { w: 'Feline', x: 40, y: 24, c: '#2e9bd6' },
    { w: 'Stock Market', x: 74, y: 74, c: '#f2553d' },
    { w: 'Investment', x: 64, y: 64, c: '#f2553d' },
  ]
  const sims = [
    { a: 'Cat', b: 'Feline', v: 0.89, hi: true },
    { a: 'Cat', b: 'Stock Market', v: 0.18, hi: false },
  ]
  return (
    <div>
      <div className="embed-map">
        <svg viewBox="0 0 100 100" style={{ width: '100%', filter: 'url(#sketch)' }}>
          <line x1="50" y1="6" x2="50" y2="94" stroke="var(--line)" strokeWidth="0.5" />
          <line x1="6" y1="50" x2="94" y2="50" stroke="var(--line)" strokeWidth="0.5" />
          <ellipse cx="33" cy="29" rx="20" ry="16" fill="#2e9bd6" opacity="0.1" stroke="#2e9bd6" strokeWidth="0.6" strokeDasharray="2 2" />
          <ellipse cx="69" cy="69" rx="20" ry="16" fill="#f2553d" opacity="0.1" stroke="#f2553d" strokeWidth="0.6" strokeDasharray="2 2" />
          {pts.map((p, i) => (
            <g key={i}>
              <motion.circle cx={p.x} cy={p.y} r="2.6" fill={p.c} stroke="#2b261e" strokeWidth="0.7"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.12 }} />
              <text x={p.x + 4} y={p.y + 1.5} fontSize="4.2" fontFamily="var(--mono)" fontWeight="700" fill="var(--ink)">{p.w}</text>
            </g>
          ))}
        </svg>
        <div className="embed-cap">animals cluster · finance clusters — purely from meaning</div>
      </div>
      {sims.map((s, i) => (
        <div className="sim-row" key={i}>
          <div className="sim-label">{s.a} ↔ {s.b}</div>
          <div className="sim-bar"><motion.i initial={{ width: 0 }} animate={{ width: `${s.v * 100}%` }} transition={{ delay: 0.4 + i * 0.2, duration: 0.6 }} style={{ background: s.hi ? 'var(--teal)' : 'var(--coral)' }} /></div>
          <div className="sim-val">{s.v.toFixed(2)}</div>
        </div>
      ))}
      <div className="fade-key">Cosine similarity: <b>1.0</b> = identical meaning, <b>0.0</b> = unrelated.</div>
    </div>
  )
}

function V_RAG() {
  const [ctx, setCtx] = useState(false)
  return (
    <div>
      <div className="rag-q">❓ “What’s the guest Wi-Fi password?”</div>
      <AnimatePresence mode="wait">
        {ctx && (
          <motion.div className="rag-ctx" key="ctx" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            📋 <b>Injected context:</b> Guest network “Acme_Guest”, password “P@ssw0rd2026!”.
          </motion.div>
        )}
      </AnimatePresence>
      <div className={`rag-answer ${ctx ? 'good' : 'bad'}`}>
        <div className="rag-a-h">{ctx ? '✅ Grounded answer' : '❌ No context → guesses'}</div>
        <div className="rag-a-body">
          {ctx
            ? 'The guest network is “Acme_Guest” and the password is “P@ssw0rd2026!”.'
            : 'It might be “password123” or “guestwifi”… (the model is making this up.)'}
        </div>
      </div>
      <button className="lab-run" onClick={() => setCtx((c) => !c)}>{ctx ? '↩︎ Remove the context' : '📋 Inject the facts (RAG)'}</button>
    </div>
  )
}

const AGENT_STEPS = [
  { t: '🧠 Think', d: '“This needs a shipping cost — I have a tool for that.”', c: '#8a5cf0' },
  { t: '🔧 Act', d: 'calls calculate_shipping_cost(5, "Paris")', c: '#f47b20' },
  { t: '👀 Observe', d: 'tool returns → “Shipping to Paris: $22.50”', c: '#2e9bd6' },
  { t: '✅ Answer', d: '“It costs $22.50 to ship a 5 kg box to Paris.”', c: '#15b3a4' },
]
function V_Agents() {
  const [phase, setPhase] = useState(-1)
  return (
    <div>
      <div className="agent-q">🙋 “How much to ship a 5 kg box to Paris?”</div>
      <div className="agent-flow">
        {AGENT_STEPS.map((s, i) => (
          <div key={i} className={`agent-step ${phase >= i ? 'on' : ''}`} style={phase >= i ? { borderColor: s.c } : {}}>
            <div className="agent-step-t" style={phase >= i ? { color: s.c } : {}}>{s.t}</div>
            <div className="agent-step-d">{s.d}</div>
          </div>
        ))}
      </div>
      <button className="lab-run" onClick={() => setPhase((p) => (p >= AGENT_STEPS.length - 1 ? -1 : p + 1))}>
        {phase < 0 ? '▶ Run the agent' : phase >= AGENT_STEPS.length - 1 ? '↺ Reset' : 'Next step →'}
      </button>
      <div className="fade-key">A chatbot <b>talks</b>; an agent <b>acts</b> — it picks the right tool and uses it.</div>
    </div>
  )
}

function V_Vision() {
  const [sent, setSent] = useState(false)
  return (
    <div>
      <div className="vision-row">
        <div className="vision-img">
          <svg viewBox="0 0 80 70" style={{ width: '100%', filter: 'url(#sketch)' }}>
            <rect x="4" y="44" width="72" height="22" fill="#ffe9bd" stroke="#2b261e" strokeWidth="1.4" />
            <rect x="14" y="22" width="14" height="44" fill="#fff4d4" stroke="#2b261e" strokeWidth="1.4" />
            <rect x="52" y="22" width="14" height="44" fill="#fff4d4" stroke="#2b261e" strokeWidth="1.4" />
            <rect x="34" y="30" width="12" height="36" fill="#ffe9bd" stroke="#2b261e" strokeWidth="1.4" />
            <path d="M12 22 l4 -6 l4 6 l4 -6 l4 6 z" fill="#f47b20" stroke="#2b261e" strokeWidth="1.2" />
            <path d="M50 22 l4 -6 l4 6 l4 -6 l4 6 z" fill="#f47b20" stroke="#2b261e" strokeWidth="1.2" />
            <rect x="37" y="48" width="6" height="18" fill="#2b261e" />
            <circle cx="40" cy="14" r="3" fill="#ffc02e" stroke="#2b261e" strokeWidth="1.2" />
          </svg>
          <div className="vision-cap">castle.png → Base64 string</div>
        </div>
        <div className="vision-arrow"><ArrowDoodle /><div className="vision-eye">👁️</div></div>
        <div className="vision-out">
          {sent ? (
            <Reveal>
              <div className="vision-out-h">✅ Vision model says:</div>
              <div className="vision-out-body">“A fairy-tale <b>castle</b> with two turrets, an arched gate, and a small flag on the central tower, set against a clear sky.”</div>
            </Reveal>
          ) : <div className="vision-placeholder">the model hasn’t looked yet…</div>}
        </div>
      </div>
      <button className="lab-run" onClick={() => setSent((s) => !s)}>{sent ? '↺ Reset' : '👁️ Send image to the model'}</button>
      <div className="fade-key">No OCR, no special parser — the model reads pixels the same way it reads words.</div>
    </div>
  )
}

function V_Recap() {
  const got = ['Swap AI vendors freely', 'Control creativity with temperature', 'Turn words into meaning (embeddings)', 'Ground answers in your data (RAG)', 'Let AI take actions (agents + tools)', 'Give AI eyes (vision)']
  return (
    <div className="recap">
      {got.map((g, i) => (
        <Reveal d={i * 0.1} key={i}><div className="recap-row"><span className="recap-check">✓</span> {g}</div></Reveal>
      ))}
      <Reveal d={0.7}><div className="recap-done">🎓 You can now reason about real AI systems — not just chatbots.</div></Reveal>
    </div>
  )
}

/* ============================================================
   STEPS
   ============================================================ */
const LAB_STEPS = [
  {
    id: 'intro', tab: 'Overview', kicker: 'Hands-on lab', title: 'From Zero to Scale', file: 'README',
    pose: 'wave', color: '#ffc02e', Visual: V_Intro,
    code: `# 🚀 Build Real AI Applications
#
# Not "cute chatbots" — enterprise engines.
# We'll build a model-agnostic, framework-agnostic
# battle-station and learn 6 core superpowers:
#
#   1. Swap AI vendors with one line
#   2. Control creativity (Temperature)
#   3. Embeddings  — words as numbers
#   4. RAG         — feed it your facts
#   5. Agents      — let it take actions
#   6. Vision      — give it eyes
#
# Click through, one step at a time. →`,
    explain: <p>This walkthrough turns a real Colab notebook into a <b>click-through tour</b>. On the left is the actual code; on the right is a picture of what that code <i>does</i>. No setup, no API keys — just the ideas.</p>,
  },
  {
    id: 'toggle', tab: 'The Toggle', kicker: 'Setup', title: 'One line, any AI vendor', file: 'setup.py',
    pose: 'point', color: '#2e9bd6', Visual: V_Toggle,
    code: `# The Architect's Toggle — pick your engine
ACTIVE_PROVIDER = "GEMINI"   # ← flip to "OPENAI"

if ACTIVE_PROVIDER == "GEMINI":
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
else:
    llm = ChatOpenAI(model="gpt-4o")

# ...the rest of your app never changes.
answer = llm.invoke(prompt)`,
    explain: <><p>Relying on a single AI vendor is a business risk. By hiding the model behind one variable, you can <b>swap Google ⇄ OpenAI</b> without rewriting your app.</p><div className="note"><b>Try the switch →</b> the engine flips, but the line <code>llm.invoke(prompt)</code> stays identical.</div></>,
  },
  {
    id: 'temp', tab: 'Temperature', kicker: 'Lab 1 · The Physics of LLMs', title: 'The creativity dial', file: 'lab1_temperature.py',
    pose: 'think', color: '#f47b20', Visual: V_Temperature,
    code: `# Same prompt, two "personalities" via Temperature
llm_cold = ChatGoogleGenerativeAI(temperature=0.0)
llm_hot  = ChatGoogleGenerativeAI(temperature=1.0)

prompt = "Write a 5-word tagline for a coffee shop."

llm_cold.invoke(prompt)  # ❄️ steady, repeatable
llm_hot.invoke(prompt)   # 🔥 different every time`,
    explain: <><p>LLMs don’t look up facts — they <b>predict the next word by probability</b>. <b>Temperature</b> is the dial on that randomness.</p><div className="note analogy"><b>0.0</b> = factual & rigid (coding, data extraction). <b>1.0</b> = creative & wild (brainstorming, marketing). <b>Hit “Run again” →</b></div></>,
  },
  {
    id: 'embed', tab: 'Embeddings', kicker: 'Lab 2 · The Embedding Explorer', title: 'Words become numbers', file: 'lab2_embeddings.py',
    pose: 'point', color: '#2e9bd6', Visual: V_Embeddings,
    code: `words = ["Cat", "Feline", "Stock Market", "Investment"]
vectors = embedder.embed_documents(words)  # → numbers

# How close in meaning? 1.0 = same, 0.0 = unrelated
cosine_similarity([vectors[0]], [vectors[1]])  # Cat·Feline → 0.89
cosine_similarity([vectors[0]], [vectors[2]])  # Cat·Stocks → 0.18`,
    explain: <><p>How does a model know a “Cat” is a “Feline”? No dictionary — just a <b>mathematical secret handshake</b>. Each word becomes a list of numbers (a <b>vector</b>); similar meanings get similar numbers.</p><div className="note"><b>Cosine similarity</b> measures the angle between two vectors — high for Cat↔Feline, low for Cat↔Stocks.</div></>,
  },
  {
    id: 'rag', tab: 'Context / RAG', kicker: 'Lab 3 · The Control Room', title: 'Fixing the amnesiac genius', file: 'lab3_rag.py',
    pose: 'think', color: '#8a5cf0', Visual: V_RAG,
    code: `question = "What's the guest Wi-Fi password?"

# ❌ No context → the model guesses (hallucinates)
llm.invoke(question)

# ✅ Paste the facts straight into the prompt = RAG
context = "Guest 'Acme_Guest', password 'P@ssw0rd2026!'."
prompt = ChatPromptTemplate.from_messages([
    ("system", "Answer using ONLY: {context}"),
    ("human", "{question}"),
])
(prompt | llm).invoke({"context": context,
                       "question": question})`,
    explain: <><p>Your LLM knows quantum physics but <b>nothing about your private data</b>. <b>RAG</b> (Retrieval-Augmented Generation) is the bridge: physically paste the facts into the prompt so it can’t hallucinate.</p><div className="note"><b>Toggle the context →</b> watch the answer flip from a wild guess to the exact truth.</div></>,
  },
  {
    id: 'agents', tab: 'Agents', kicker: 'Lab 4 · Your First Agent', title: 'From talking to doing', file: 'lab4_agents.py',
    pose: 'cheer', color: '#15b3a4', Visual: V_Agents,
    code: `# A "tool" is just a Python function the AI can call
@tool
def calculate_shipping_cost(weight_kg, destination):
    total = 10.0 + weight_kg * 2.5
    return f"Shipping to {destination}: \${total:.2f}"

agent = create_tool_calling_agent(llm, [calculate_shipping_cost], prompt)
executor = AgentExecutor(agent=agent, tools=[calculate_shipping_cost])

executor.invoke({"input": "Ship a 5kg box to Paris?"})
# → the agent calls the tool, then answers: $22.50`,
    explain: <><p>A chatbot generates text; an <b>agent executes transactions</b>. You hand the LLM <b>tools</b> (plain functions) and it decides when to use them — reason, act, observe, answer.</p><div className="note"><b>Run the agent →</b> step through its “ReAct” loop and watch it route to the calculator.</div></>,
  },
  {
    id: 'vision', tab: 'Vision', kicker: 'Lab 5 · The Multimodal Bridge', title: 'Giving the AI eyes', file: 'lab5_vision.py',
    pose: 'point', color: '#f2553d', Visual: V_Vision,
    code: `# Give the AI eyes: send an image as a Base64 string
image_data = base64.b64encode(response.content).decode()

message = HumanMessage(content=[
    {"type": "text", "text": "What is in this image?"},
    {"type": "image_url",
     "image_url": {"url": f"data:image/png;base64,{image_data}"}},
])

llm.invoke([message]).content   # → a written description`,
    explain: <><p>Modern models are <b>multimodal</b> — they read images the same way they read text. Encode a picture as a Base64 string, drop it in the message, and ask away.</p><div className="note analogy"><b>This kills legacy OCR.</b> No special pipeline — the model just “looks.” <b>Send the image →</b></div></>,
  },
  {
    id: 'recap', tab: 'Recap', kicker: 'Graduation', title: 'You built the foundations', file: 'done.py',
    pose: 'cheer', color: '#ffc02e', Visual: V_Recap,
    code: `# 🎓 Congratulations!
#
# You've now seen, end to end:
#   ✓ Model-agnostic vendor swapping
#   ✓ Temperature & non-determinism
#   ✓ Embeddings & cosine similarity
#   ✓ Context injection (RAG)
#   ✓ Agents that call tools
#   ✓ Multimodal vision
#
# These five labs are the building blocks of
# every real GenAI application. Go build. 🚀`,
    explain: <p>Every production GenAI system — copilots, RAG search, visual auditors, autonomous agents — is assembled from exactly these pieces. You now have the <b>mental model</b> to reason about all of them.</p>,
  },
]

export default function LabJourney() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return
      if (e.key === 'ArrowRight') setStep((s) => Math.min(LAB_STEPS.length - 1, s + 1))
      if (e.key === 'ArrowLeft') setStep((s) => Math.max(0, s - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  const cur = LAB_STEPS[step]
  const Visual = cur.Visual

  return (
    <>
      <div className="journey-head">
        <p className="journey-tag">A click-through tour of a real GenAI lab — see the code <b>and</b> what it does.</p>
        <div className="pill">Step <b>{step + 1}</b> / {LAB_STEPS.length} · use <span className="kbd">←</span> <span className="kbd">→</span></div>
      </div>

      <div className="stepper">
        {LAB_STEPS.map((s, i) => (
          <button key={s.id} className={`step-tab ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} onClick={() => setStep(i)}>
            <span className="num">{i < step ? '✓' : i + 1}</span>
            {s.tab}
          </button>
        ))}
      </div>

      {/* header with mascot */}
      <motion.div key={cur.id + '-h'} className="lab-titlebar" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="mascot">
          <StickFigure pose={cur.pose} color={cur.color} size={64} />
          <div style={{ paddingBottom: 4 }}>
            <div className="kicker">{cur.kicker}</div>
            <h2>{cur.title}</h2>
          </div>
        </div>
        <Squiggle width={150} />
      </motion.div>

      {/* two panes: code | visual */}
      <div className="lab-stage">
        <motion.div key={cur.id + '-c'} className="panel code-panel" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <div className="panel-cap">📄 The code</div>
          <CodeBlock code={cur.code} file={cur.file + (cur.file.includes('.') ? '' : '.md')} />
        </motion.div>

        <motion.div key={cur.id + '-v'} className="panel viz lab-visual" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <div className="panel-cap">✨ What it does</div>
          <Visual />
          <div className="lab-explain">{cur.explain}</div>
        </motion.div>
      </div>

      <div className="nav">
        <button className="btn ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} style={{ opacity: step === 0 ? 0.4 : 1 }}>← Back</button>
        <div className="progress"><i style={{ width: `${((step + 1) / LAB_STEPS.length) * 100}%` }} /></div>
        {step < LAB_STEPS.length - 1
          ? <button className="btn" onClick={() => setStep((s) => Math.min(LAB_STEPS.length - 1, s + 1))}>Next →</button>
          : <button className="btn" onClick={() => setStep(0)}>↺ Start over</button>}
      </div>
    </>
  )
}
