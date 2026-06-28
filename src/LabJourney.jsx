import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDoodle } from './Doodles.jsx'
import { PROVIDERS, chat, embed, chatWithImage, runAgent, cosine, mds2d } from './llm.js'
import { Reveal, useRun, Spinner, LiveErr, LiveBadge, NeedKey, StepJourney } from './labkit.jsx'

/* ============================================================
   VISUALS — one per lab (each accepts `creds`)
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
          <div className="lab-card"><div className="lab-card-ic">{l.icon}</div><div><div className="lab-card-t">{l.t}</div><div className="lab-card-d">{l.d}</div></div></div>
        </Reveal>
      ))}
    </div>
  )
}

function V_Toggle({ creds }) {
  const [prov, setProv] = useState(creds.provider)
  useEffect(() => { setProv(creds.provider) }, [creds.provider])
  const engines = {
    gemini: { name: 'Google Gemini', model: 'gemini-2.5-flash', color: '#2e9bd6', ic: '✦' },
    openai: { name: 'OpenAI GPT', model: 'gpt-4o-mini', color: '#15b3a4', ic: '◇' },
    anthropic: { name: 'Anthropic Claude', model: 'claude-haiku-4.5', color: '#f47b20', ic: '✲' },
  }
  const keys = Object.keys(engines)
  return (
    <div>
      <div className="toggle-row">
        {keys.map((k) => (
          <button key={k} className={`engine-card ${prov === k ? 'on' : ''}`} onClick={() => setProv(k)} style={prov === k ? { borderColor: engines[k].color, boxShadow: `4px 5px 0 ${engines[k].color}` } : {}}>
            <div className="engine-ic" style={{ color: engines[k].color }}>{engines[k].ic}</div>
            <div className="engine-name">{engines[k].name}</div>
            <div className="engine-model">{engines[k].model}</div>
            {prov === k && <div className="engine-live" style={{ background: engines[k].color }}>● active</div>}
          </button>
        ))}
      </div>
      <div className="logic-box">
        <div className="logic-cap">Your business logic</div>
        <code>answer = llm.invoke(prompt)</code>
        <div className="logic-note">↑ never changes — that’s why you’re not locked to one vendor.</div>
      </div>
      <div className="fade-key">Pick your engine in the <b>⚡ Go live</b> bar at the top — the very same labs below will run on whichever you choose.</div>
    </div>
  )
}

function V_Temperature({ creds }) {
  const cold = 'Brewed for the bold future.'
  const hots = ['Sip tomorrow, brewed today.', 'Caffeine from another galaxy.', 'Where robots pour poetry.', 'Espresso at light speed.', 'Your daily dose of the future.']
  const [i, setI] = useState(0)
  const [prompt, setPrompt] = useState('Write a 5-word tagline for a futuristic coffee shop.')
  const [s, run] = useRun()

  const goLive = () => run(async () => {
    const [c, ...h] = await Promise.all([
      chat(creds.provider, creds.key, { prompt, temperature: 0, maxTokens: 40 }),
      chat(creds.provider, creds.key, { prompt, temperature: 1, maxTokens: 40 }),
      chat(creds.provider, creds.key, { prompt, temperature: 1, maxTokens: 40 }),
      chat(creds.provider, creds.key, { prompt, temperature: 1, maxTokens: 40 }),
    ])
    return { cold: c, hots: h }
  })

  const live = s.data
  const coldOut = live ? live.cold : cold
  const hotOut = (n) => (live ? live.hots[n] : hots[(i + n) % hots.length])

  return (
    <div>
      <div className="temp-prompt">prompt:
        <input className="inline-input" value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={s.loading} />
      </div>
      <div className="temp-cols">
        <div className="temp-col cold">
          <div className="temp-h">❄️ Temperature 0.0 {live && <LiveBadge />}</div>
          <div className="temp-sub">deterministic · same answer every run</div>
          {[0, 1, 2].map((n) => <div key={n} className="temp-out">{s.loading ? '…' : coldOut}</div>)}
        </div>
        <div className="temp-col hot">
          <div className="temp-h">🔥 Temperature 1.0 {live && <LiveBadge />}</div>
          <div className="temp-sub">creative · changes every run</div>
          {[0, 1, 2].map((n) => <div key={n} className="temp-out">{s.loading ? '…' : hotOut(n)}</div>)}
        </div>
      </div>
      {s.error && <LiveErr msg={s.error} />}
      <div className="run-row">
        {creds.connected
          ? <button className="lab-run" onClick={goLive} disabled={s.loading}>{s.loading ? <><Spinner /> calling {PROVIDERS[creds.provider].label}…</> : '⚡ Run for real'}</button>
          : <button className="lab-run" onClick={() => setI((v) => (v + 3) % hots.length)}>🎲 Run again (demo)</button>}
      </div>
      {!creds.connected && <NeedKey connected={false} />}
    </div>
  )
}

function V_Embeddings({ creds }) {
  const demoPts = [
    { w: 'Cat', x: -0.48, y: 0.32, c: '#2e9bd6' }, { w: 'Feline', x: -0.2, y: 0.52, c: '#2e9bd6' },
    { w: 'Stock Market', x: 0.5, y: -0.46, c: '#f2553d' }, { w: 'Investment', x: 0.28, y: -0.26, c: '#f2553d' },
  ]
  const [wordsStr, setWordsStr] = useState('Cat, Feline, Stock Market, Investment')
  const [s, run] = useRun()
  const noEmbed = !PROVIDERS[creds.provider]?.embeds

  const goLive = () => run(async () => {
    const words = wordsStr.split(',').map((w) => w.trim()).filter(Boolean).slice(0, 8)
    const vecs = await embed(creds.provider, creds.key, words)
    const coords = mds2d(vecs)
    const colorOf = (i) => ['#2e9bd6', '#f2553d', '#15b3a4', '#8a5cf0', '#f4a81d', '#ff7ca8', '#0e9a8c', '#f47b20'][i % 8]
    const pts = words.map((w, i) => ({ w, x: coords[i][0] * 0.8, y: coords[i][1] * 0.8, c: colorOf(i) }))
    const sims = []
    for (let a = 0; a < Math.min(words.length, 3); a++) for (let b = a + 1; b < words.length; b++) sims.push({ a: words[a], b: words[b], v: cosine(vecs[a], vecs[b]) })
    sims.sort((p, q) => q.v - p.v)
    return { pts, sims: sims.slice(0, 4), dims: vecs[0].length }
  })

  const pts = s.data ? s.data.pts : demoPts
  const sims = s.data ? s.data.sims : [{ a: 'Cat', b: 'Feline', v: 0.89 }, { a: 'Cat', b: 'Stock Market', v: 0.18 }]
  const sx = (x) => 50 + x * 44, sy = (y) => 50 - y * 44

  return (
    <div>
      <div className="temp-prompt">words:
        <input className="inline-input" value={wordsStr} onChange={(e) => setWordsStr(e.target.value)} disabled={s.loading} />
      </div>
      <div className="embed-map">
        <svg viewBox="0 0 100 100" style={{ width: '100%', filter: 'url(#sketch)' }}>
          <line x1="50" y1="6" x2="50" y2="94" stroke="var(--line)" strokeWidth="0.5" />
          <line x1="6" y1="50" x2="94" y2="50" stroke="var(--line)" strokeWidth="0.5" />
          {pts.map((p, i) => (
            <g key={i}>
              <motion.circle cx={sx(p.x)} cy={sy(p.y)} r="2.6" fill={p.c} stroke="#2b261e" strokeWidth="0.7" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} />
              <text x={sx(p.x) + 4} y={sy(p.y) + 1.5} fontSize="4" fontFamily="var(--mono)" fontWeight="700" fill="var(--ink)">{p.w}</text>
            </g>
          ))}
        </svg>
        <div className="embed-cap">{s.data ? <>real {PROVIDERS[creds.provider].label} vectors ({s.data.dims} dims) → 2D <LiveBadge /></> : 'demo · similar meanings sit close together'}</div>
      </div>
      {sims.map((sim, i) => (
        <div className="sim-row" key={i}>
          <div className="sim-label">{sim.a} ↔ {sim.b}</div>
          <div className="sim-bar"><motion.i initial={{ width: 0 }} animate={{ width: `${Math.max(0, sim.v) * 100}%` }} transition={{ duration: 0.6 }} style={{ background: sim.v > 0.5 ? 'var(--teal)' : 'var(--coral)' }} /></div>
          <div className="sim-val">{sim.v.toFixed(2)}</div>
        </div>
      ))}
      {s.error && <LiveErr msg={s.error} />}
      <div className="run-row">
        {creds.connected && !noEmbed && <button className="lab-run" onClick={goLive} disabled={s.loading}>{s.loading ? <><Spinner /> embedding…</> : '⚡ Embed for real'}</button>}
        {creds.connected && noEmbed && <div className="need-key">Claude has no embeddings API — switch to <b>Gemini</b> or <b>OpenAI</b> in the bar above to run this live.</div>}
      </div>
      {!creds.connected && <NeedKey connected={false} />}
    </div>
  )
}

function V_RAG({ creds }) {
  const [ctx, setCtx] = useState(false)
  const [s, run] = useRun()
  const question = 'What is the guest Wi-Fi password for Acme Corp?'
  const context = "Acme Corp IT Policy: guest network is 'Acme_Guest', current password is 'P@ssw0rd2026!'."

  const goLive = () => run(async () => {
    const [no, yes] = await Promise.all([
      chat(creds.provider, creds.key, { prompt: question, maxTokens: 120, temperature: 0.3 }),
      chat(creds.provider, creds.key, { system: `Answer using ONLY this context. If unknown, say so.\nContext: ${context}`, prompt: question, maxTokens: 120, temperature: 0 }),
    ])
    return { no, yes }
  })
  const live = s.data
  const showGood = live ? true : ctx
  const answer = live ? (ctx ? live.yes : live.no) : (ctx ? 'The guest network is “Acme_Guest” and the password is “P@ssw0rd2026!”.' : 'It might be “password123” or “guestwifi”… (the model is making this up.)')

  return (
    <div>
      <div className="rag-q">❓ “{question}”</div>
      <AnimatePresence mode="wait">
        {ctx && <motion.div className="rag-ctx" key="ctx" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>📋 <b>Injected context:</b> {context}</motion.div>}
      </AnimatePresence>
      <div className={`rag-answer ${ctx ? 'good' : 'bad'}`}>
        <div className="rag-a-h">{ctx ? '✅ With context' : '❌ No context → guesses'} {live && <LiveBadge />}</div>
        <div className="rag-a-body">{s.loading ? '…thinking…' : answer}</div>
      </div>
      {s.error && <LiveErr msg={s.error} />}
      <div className="run-row">
        <button className="lab-run ghost" onClick={() => setCtx((c) => !c)}>{ctx ? '↩︎ Remove context' : '📋 Inject the facts'}</button>
        {creds.connected && <button className="lab-run" onClick={goLive} disabled={s.loading}>{s.loading ? <><Spinner /> asking…</> : '⚡ Ask for real (both)'}</button>}
      </div>
      {!creds.connected && <NeedKey connected={false} />}
    </div>
  )
}

const DEMO_AGENT = [
  { t: '🧠 Think', d: '“This needs a shipping cost — I have a tool for that.”', c: '#8a5cf0' },
  { t: '🔧 Act', d: 'calls calculate_shipping_cost(5, "Paris")', c: '#f47b20' },
  { t: '👀 Observe', d: 'tool returns → “Shipping to Paris: $22.50”', c: '#2e9bd6' },
  { t: '✅ Answer', d: '“It costs $22.50 to ship a 5 kg box to Paris.”', c: '#15b3a4' },
]
function V_Agents({ creds }) {
  const [phase, setPhase] = useState(-1)
  const [s, run] = useRun()
  const query = 'How much to ship a 5 kg box to Paris?'

  const goLive = () => run(async () => {
    const r = await runAgent(creds.provider, creds.key, query)
    return r
  })
  const live = s.data
  const steps = live ? [
    { t: '🧠 Think', d: 'the model reads the request and picks a tool', c: '#8a5cf0' },
    { t: '🔧 Act', d: live.args ? `calls calculate_shipping_cost(${live.args.weight_kg}, "${live.args.destination}")` : 'no tool needed', c: '#f47b20' },
    { t: '👀 Observe', d: live.toolResult || '—', c: '#2e9bd6' },
    { t: '✅ Answer', d: live.answer || '—', c: '#15b3a4' },
  ] : DEMO_AGENT
  const allOn = live || s.loading

  return (
    <div>
      <div className="agent-q">🙋 “{query}”</div>
      <div className="agent-flow">
        {steps.map((st, i) => (
          <div key={i} className={`agent-step ${allOn || phase >= i ? 'on' : ''}`} style={(allOn || phase >= i) ? { borderColor: st.c } : {}}>
            <div className="agent-step-t" style={(allOn || phase >= i) ? { color: st.c } : {}}>{st.t} {live && i === 3 && <LiveBadge />}</div>
            <div className="agent-step-d">{s.loading && i > 0 ? '…' : st.d}</div>
          </div>
        ))}
      </div>
      {s.error && <LiveErr msg={s.error} />}
      <div className="run-row">
        <button className="lab-run ghost" onClick={() => setPhase((p) => (p >= DEMO_AGENT.length - 1 ? -1 : p + 1))}>{phase < 0 ? '▶ Step through (demo)' : phase >= DEMO_AGENT.length - 1 ? '↺ Reset' : 'Next step →'}</button>
        {creds.connected && <button className="lab-run" onClick={goLive} disabled={s.loading}>{s.loading ? <><Spinner /> running agent…</> : '⚡ Run agent for real'}</button>}
      </div>
      {!creds.connected && <NeedKey connected={false} />}
    </div>
  )
}

function V_Vision({ creds }) {
  const [img, setImg] = useState(null) // {base64, mime, url}
  const [s, run] = useRun()
  const onFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return
    const reader = new FileReader()
    reader.onload = () => { const url = reader.result; setImg({ url, base64: url.split(',')[1], mime: f.type || 'image/png' }) }
    reader.readAsDataURL(f)
  }
  const goLive = () => run(async () => chatWithImage(creds.provider, creds.key, { prompt: 'Describe what is in this image in 2–3 sentences.', base64: img.base64, mime: img.mime }))

  return (
    <div>
      <div className="vision-row">
        <div className="vision-img">
          {img ? <img src={img.url} alt="upload" style={{ width: '100%', borderRadius: 8 }} /> : (
            <svg viewBox="0 0 80 70" style={{ width: '100%', filter: 'url(#sketch)' }}>
              <rect x="4" y="44" width="72" height="22" fill="#ffe9bd" stroke="#2b261e" strokeWidth="1.4" />
              <rect x="14" y="22" width="14" height="44" fill="#fff4d4" stroke="#2b261e" strokeWidth="1.4" />
              <rect x="52" y="22" width="14" height="44" fill="#fff4d4" stroke="#2b261e" strokeWidth="1.4" />
              <rect x="34" y="30" width="12" height="36" fill="#ffe9bd" stroke="#2b261e" strokeWidth="1.4" />
              <path d="M12 22 l4 -6 l4 6 l4 -6 l4 6 z" fill="#f47b20" stroke="#2b261e" strokeWidth="1.2" />
              <path d="M50 22 l4 -6 l4 6 l4 -6 l4 6 z" fill="#f47b20" stroke="#2b261e" strokeWidth="1.2" />
              <circle cx="40" cy="14" r="3" fill="#ffc02e" stroke="#2b261e" strokeWidth="1.2" />
            </svg>
          )}
          <div className="vision-cap">{img ? 'your image → Base64' : 'demo image (upload your own ↓)'}</div>
        </div>
        <div className="vision-arrow"><ArrowDoodle /><div className="vision-eye">👁️</div></div>
        <div className="vision-out">
          {s.loading ? <Spinner /> : s.data ? <Reveal><div className="vision-out-h">✅ The model sees: <LiveBadge /></div><div className="vision-out-body">{s.data}</div></Reveal>
            : <div className="vision-out-body">“A fairy-tale <b>castle</b> with two turrets and a small flag.” <span style={{ color: 'var(--text-faint)' }}>(demo)</span></div>}
        </div>
      </div>
      {s.error && <LiveErr msg={s.error} />}
      <div className="run-row">
        <label className="lab-run ghost" style={{ cursor: 'pointer' }}>📁 Upload image<input type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} /></label>
        {creds.connected && <button className="lab-run" onClick={goLive} disabled={s.loading || !img}>{s.loading ? <><Spinner /> looking…</> : '👁️ Analyze for real'}</button>}
      </div>
      {!creds.connected && <NeedKey connected={false} />}
    </div>
  )
}

function V_Recap() {
  const got = ['Swap AI vendors freely', 'Control creativity with temperature', 'Turn words into meaning (embeddings)', 'Ground answers in your data (RAG)', 'Let AI take actions (agents + tools)', 'Give AI eyes (vision)']
  return (
    <div className="recap">
      {got.map((g, i) => <Reveal d={i * 0.1} key={i}><div className="recap-row"><span className="recap-check">✓</span> {g}</div></Reveal>)}
      <Reveal d={0.7}><div className="recap-done">🎓 You ran real models — not just chatbots.</div></Reveal>
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
# A model-agnostic, framework-agnostic battle-station.
# Six core superpowers:
#
#   1. Swap AI vendors with one line
#   2. Control creativity (Temperature)
#   3. Embeddings  — words as numbers
#   4. RAG         — feed it your facts
#   5. Agents      — let it take actions
#   6. Vision      — give it eyes
#
# Add your API key in the ⚡ bar above to run
# every step against a REAL model. →`,
    explain: <p>This walkthrough turns a real Colab notebook into a click-through tour. On the left is the actual code; on the right is what it <i>does</i> — and with your key, the <b>real model output</b>.</p>,
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
    explain: <><p>Relying on a single AI vendor is a business risk. Hide the model behind one variable and you can <b>swap Google ⇄ OpenAI ⇄ Claude</b> without rewriting your app.</p><div className="note"><b>Choose your engine in the ⚡ bar at the top</b> — the labs below will run on it.</div></>,
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
    explain: <><p>LLMs don’t look up facts — they <b>predict the next word by probability</b>. <b>Temperature</b> is the dial on that randomness.</p><div className="note analogy"><b>0.0</b> = factual & rigid. <b>1.0</b> = creative & wild. <b>Run it for real →</b> watch temp 1.0 change every time.</div></>,
  },
  {
    id: 'embed', tab: 'Embeddings', kicker: 'Lab 2 · The Embedding Explorer', title: 'Words become numbers', file: 'lab2_embeddings.py',
    pose: 'point', color: '#2e9bd6', Visual: V_Embeddings,
    code: `words = ["Cat", "Feline", "Stock Market", "Investment"]
vectors = embedder.embed_documents(words)  # → numbers

# How close in meaning? 1.0 = same, 0.0 = unrelated
cosine_similarity([vectors[0]], [vectors[1]])  # Cat·Feline → 0.89
cosine_similarity([vectors[0]], [vectors[2]])  # Cat·Stocks → 0.18`,
    explain: <><p>How does a model know a “Cat” is a “Feline”? No dictionary — each word becomes a list of numbers (a <b>vector</b>); similar meanings get similar numbers.</p><div className="note"><b>Edit the words and embed for real</b> — even other languages cluster by meaning.</div></>,
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
    explain: <><p>Your LLM knows quantum physics but <b>nothing about your private data</b>. <b>RAG</b> pastes the facts into the prompt so it can’t hallucinate.</p><div className="note"><b>Ask for real →</b> compare the wild guess with the grounded answer.</div></>,
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
# → the agent calls the tool, then answers`,
    explain: <><p>A chatbot generates text; an <b>agent executes</b>. You hand the LLM <b>tools</b> and it decides when to use them — reason, act, observe, answer.</p><div className="note"><b>Run the agent for real →</b> watch the actual model pick the tool and fill in the arguments.</div></>,
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
    explain: <><p>Modern models are <b>multimodal</b> — they read images like text. Encode a picture as Base64, drop it in the message, and ask.</p><div className="note analogy"><b>Upload any image and analyze it for real →</b> no OCR, the model just “looks.”</div></>,
  },
  {
    id: 'recap', tab: 'Recap', kicker: 'Graduation', title: 'You built the foundations', file: 'done.py',
    pose: 'cheer', color: '#ffc02e', Visual: V_Recap,
    code: `# 🎓 Congratulations!
#
# End to end, you've now run for real:
#   ✓ Model-agnostic vendor swapping
#   ✓ Temperature & non-determinism
#   ✓ Embeddings & cosine similarity
#   ✓ Context injection (RAG)
#   ✓ Agents that call tools
#   ✓ Multimodal vision
#
# These are the building blocks of every
# real GenAI application. Go build. 🚀`,
    explain: <p>Every production GenAI system is assembled from these pieces. You now have the <b>mental model</b> — and you’ve seen them run live.</p>,
  },
]

export default function LabJourney({ creds, setCreds }) {
  return <StepJourney steps={LAB_STEPS} creds={creds} setCreds={setCreds} tagline="A click-through tour of the foundations lab — see the code and run it live." />
}
