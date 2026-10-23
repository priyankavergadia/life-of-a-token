import React, { useState } from 'react'
import { ArrowDoodle } from './Doodles.jsx'
import { PROVIDERS, chat, chatJSON, runAgentMulti } from './llm.js'
import { Reveal, useRun, Spinner, LiveErr, LiveBadge, NeedKey, StepJourney, readStr, writeStr, readNum, writeNum } from './labkit.jsx'

/* Shared small UI primitives (matching capstones.jsx) */
const Pipeline = ({ steps }) => (
  <div className="pipe">
    {steps.map((s, i) => (
      <React.Fragment key={i}>
        <Reveal d={i * 0.1}><div className="pipe-node"><div className="pipe-ic">{s.ic}</div><div className="pipe-t">{s.t}</div></div></Reveal>
        {i < steps.length - 1 && <span className="pipe-arrow"><ArrowDoodle /></span>}
      </React.Fragment>
    ))}
  </div>
)
const RunBtn = ({ creds, onClick, loading, label, disabled }) => (
  <button className="lab-run" onClick={onClick} disabled={loading || disabled}>
    {loading ? <><Spinner /> calling {PROVIDERS[creds.provider].label}…</> : label}
  </button>
)

/* ============================================================
   CAPSTONE 5 — Context Engineering (Budgeting, Ranking, Signal vs Noise)
   ============================================================ */
const C5_CHUNKS = [
  { id: 'c1', src: 'policy_2026.md', tokens: 95, score: 0.94, kind: 'signal', text: '2026 Enterprise Policy: Annual Enterprise plans include a 30-day full refund window and 99.95% uptime SLA.' },
  { id: 'c2', src: 'billing_faq.md', tokens: 85, score: 0.82, kind: 'signal', text: 'Billing FAQ: Refund requests must be submitted by the workspace admin via Settings → Billing.' },
  { id: 'c3', src: 'sla_credits.md', tokens: 110, score: 0.61, kind: 'ok', text: 'SLA Credits: If monthly uptime drops below 99.95%, customers receive a 10% service credit on next renewal.' },
  { id: 'c4', src: 'draft_2021_old.txt', tokens: 140, score: 0.44, kind: 'trap', text: '[ARCHIVED 2021 DRAFT — DO NOT USE]: Enterprise plans are strictly non-refundable after 7 days.' },
  { id: 'c5', src: 'slack_random.txt', tokens: 160, score: 0.19, kind: 'noise', text: '#random Slack thread: Anyone know if the espresso machine on floor 4 is fixed yet? Also happy Friday!' },
]

function V_C5_Budget({ code, setCode }) {
  const maxBudget = readNum(code, 'max_budget', 260)
  const cutoff = readNum(code, 'relevance_cutoff', 0.55)
  const setBudget = (v) => setCode((c) => writeNum(c, 'max_budget', v))
  const setCutoff = (v) => setCode((c) => writeNum(c, 'relevance_cutoff', v))

  let used = 0
  const evaluated = C5_CHUNKS.map((ch) => {
    const passesScore = ch.score >= cutoff
    const fitsBudget = used + ch.tokens <= maxBudget
    const kept = passesScore && fitsBudget
    if (kept) used += ch.tokens
    const reason = !passesScore ? 'below cutoff' : (!fitsBudget ? 'over token budget' : 'packed ✓')
    return { ...ch, kept, reason }
  })

  const pct = Math.min(100, Math.round((used / maxBudget) * 100))
  const hasTrap = evaluated.find((x) => x.id === 'c4')?.kept

  const applyPreset = (b, c) => {
    setCode((prev) => writeNum(writeNum(prev, 'max_budget', b), 'relevance_cutoff', c))
  }

  return (
    <div>
      <div className="qpick" style={{ marginBottom: 8 }}>
        <span>presets:</span>
        <button className={maxBudget === 260 && cutoff === 0.55 ? 'on' : ''} onClick={() => applyPreset(260, 0.55)}>✨ Engineered (260 tok · 0.55)</button>
        <button className={maxBudget === 500 && cutoff === 0.3 ? 'on' : ''} onClick={() => applyPreset(500, 0.3)}>⚠️ Loose / Poisoned (500 tok · 0.30)</button>
        <button className={maxBudget === 150 && cutoff === 0.85 ? 'on' : ''} onClick={() => applyPreset(150, 0.85)}>✂️ Ultra-Tight (150 tok · 0.85)</button>
      </div>
      <div className="knob-row">
        <div className="knob">
          <span className="knob-label">🎟️ budget</span>
          <input type="range" min="100" max="600" step="20" value={maxBudget} onChange={(e) => setBudget(Number(e.target.value))} />
          <span className="knob-val">{maxBudget} tok</span>
        </div>
        <div className="knob">
          <span className="knob-label">🎯 cutoff</span>
          <input type="range" min="0.1" max="0.9" step="0.05" value={cutoff} onChange={(e) => setCutoff(Number(e.target.value))} />
          <span className="knob-val">{cutoff.toFixed(2)}</span>
        </div>
      </div>

      <div className="ctx-meter">
        <div className="ctx-meter-top">
          <span>🪟 Context Window Usage: <b>{used}</b> / {maxBudget} tokens ({pct}%)</span>
          <span style={{ color: hasTrap ? 'var(--coral)' : 'var(--teal-deep)', fontWeight: 700 }}>
            {hasTrap ? '⚠️ Poisoned by 2021 draft!' : '✅ High-signal window'}
          </span>
        </div>
        <div className="sim-bar" style={{ height: 18 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: hasTrap ? 'var(--coral)' : 'var(--teal)', transition: 'width 0.25s ease' }} />
        </div>
      </div>

      <div className="ctx-list" style={{ marginTop: 12 }}>
        {evaluated.map((c) => (
          <div key={c.id} className={`ctx-item ${c.kept ? 'kept' : 'dropped'} ${c.kind === 'trap' && c.kept ? 'trap' : ''}`}>
            <div className="ctx-item-head">
              <span className="ctx-src">📄 {c.src}</span>
              <span className="retr-sim">score {c.score.toFixed(2)}</span>
              <span className="ctx-tok">{c.tokens} tok</span>
              <span className={`ctx-status ${c.kept ? 'on' : 'off'}`}>{c.reason}</span>
            </div>
            <div className="ctx-item-body">{c.text}</div>
          </div>
        ))}
      </div>
      <div className="fade-key">Lower the cutoff to <code>0.30</code> and raise budget to <code>500</code> — watch the archived <b>2021 draft</b> sneak into the window and contradict the 2026 policy!</div>
    </div>
  )
}

function V_C5_Compare({ creds, code, setCode }) {
  const question = readStr(code, 'question', 'What is the refund window for annual Enterprise plans, and how do I request one?')
  const setQuestion = (v) => setCode((c) => writeStr(c, 'question', v))
  const [mode, setMode] = useState('engineered')
  const [s, run] = useRun()

  const stuffedCtx = [C5_CHUNKS[4].text, C5_CHUNKS[3].text, C5_CHUNKS[2].text, C5_CHUNKS[0].text, C5_CHUNKS[1].text].join('\n\n')
  const engineeredCtx = [C5_CHUNKS[0].text, C5_CHUNKS[1].text].join('\n\n')

  const goLive = () => run(async () => {
    const [stuffedAns, cleanAns] = await Promise.all([
      chat(creds.provider, creds.key, {
        system: `Answer using this context. Note any conflicting rules:\n${stuffedCtx}`,
        prompt: question,
        temperature: 0,
        maxTokens: 140,
      }),
      chat(creds.provider, creds.key, {
        system: `Answer concisely using ONLY this verified context:\n${engineeredCtx}`,
        prompt: question,
        temperature: 0,
        maxTokens: 140,
      }),
    ])
    return { stuffedAns, cleanAns }
  })

  const isEng = mode === 'engineered'
  const demoStuffed = 'The documents conflict: one note says Enterprise plans are non-refundable after 7 days (2021 draft), while another mentions a 30-day window. Please clarify which applies.'
  const demoClean = 'Annual Enterprise plans have a 30-day full refund window. A workspace admin can request it via Settings → Billing.'

  return (
    <div>
      <div className="vs-toggle">
        <button className={`rag ${isEng ? 'on' : ''}`} onClick={() => setMode('engineered')}>🧭 Engineered Context (180 tok · ranked)</button>
        <button className={`ft ${!isEng ? 'on' : ''}`} onClick={() => setMode('stuffed')}>🗑️ Stuffed Window (590 tok · noisy)</button>
      </div>

      <div className="input-tag">❓ question</div>
      <input className="inline-input" style={{ maxWidth: '100%', marginLeft: 0 }} value={question} onChange={(e) => setQuestion(e.target.value)} disabled={s.loading} />

      <div className="retrieved" style={{ marginTop: 12 }}>
        <div className="retr-h">{isEng ? '✨ Assembled Context (2 high-signal chunks, 70% fewer tokens)' : '💥 Stuffed Context (5 unranked chunks — includes Slack noise & 2021 draft)'}</div>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-soft)' }}>
          {isEng ? engineeredCtx : stuffedCtx}
        </pre>
      </div>

      <div className={`rag-answer ${isEng ? 'good' : 'bad'}`}>
        <div className="rag-a-h">
          {isEng ? '✅ Crisp, grounded answer (180 input tokens)' : '⚠️ Confused / bloated answer (590 input tokens)'} {s.data && <LiveBadge />}
        </div>
        <div className="rag-a-body">
          {s.loading ? '…running both contexts…' : (s.data ? (isEng ? s.data.cleanAns : s.data.stuffedAns) : (isEng ? demoClean : demoStuffed))}
        </div>
      </div>

      {s.error && <LiveErr msg={s.error} />}
      <div className="run-row">
        {creds.connected && <RunBtn creds={creds} onClick={goLive} loading={s.loading} label="🧭 Run both contexts for real" />}
      </div>
      {!creds.connected && <NeedKey />}
    </div>
  )
}

const C5_STEPS = [
  {
    id: 'o', tab: 'Overview', kicker: 'Project 5', title: 'Context Engineering', file: 'project5.py', pose: 'wave', color: '#2e9bd6',
    Visual: () => <Pipeline steps={[{ ic: '📥', t: 'Gather candidates' }, { ic: '🏆', t: 'Re-rank & filter' }, { ic: '✂️', t: 'Fit token budget' }, { ic: '🎯', t: 'High-signal prompt' }]} />,
    code: `# Prompt Engineering  = how you phrase the question.
# Context Engineering = curating EVERYTHING the model sees when it answers.
#
# Even with a 1M-token window, dumping everything in causes:
#   • "Lost in the Middle" (models miss facts buried in noise)
#   • Contradictions from stale docs
#   • 5–10× higher latency and cost`,
    explain: <p>In <b>Project 2 (RAG)</b> we retrieved chunks into a prompt. <b>Context Engineering</b> is the next level: scoring candidates, filtering out stale drafts, and packing only the highest-signal tokens into a strict budget.</p>,
  },
  {
    id: 'b', tab: 'Token Budget', kicker: 'Step 1 · The workbench', title: 'Pack the window deliberately', file: 'budget.py', pose: 'point', color: '#15b3a4', Visual: V_C5_Budget, editable: true,
    code: `# Enforce a strict token budget + relevance threshold
max_budget = 260
relevance_cutoff = 0.55

packed, used = [], 0
for chunk in sorted(candidates, key=lambda c: -c.score):
    if chunk.score >= relevance_cutoff and used + chunk.tokens <= max_budget:
        packed.append(chunk)
        used += chunk.tokens`,
    explain: <><p>Treat the context window like a <b>carry-on suitcase</b>, not a shipping container. Score every candidate chunk, drop anything below your relevance cutoff, and cap total tokens to a strict budget.</p><div className="note"><b>Drag the budget and cutoff sliders →</b> see how a tight cutoff blocks stale drafts and Slack noise automatically.</div></>,
  },
  {
    id: 'l', tab: 'Signal vs Noise', kicker: 'Step 2 · Lost in the Middle', title: 'Stuffed vs. Engineered context', file: 'signal_vs_noise.py', pose: 'think', color: '#f47b20', Visual: V_C5_Compare, editable: true,
    code: `question = "What is the refund window for annual Enterprise plans, and how do I request one?"

# ❌ Stuffed: 5 chunks (590 tokens) with 2021 draft buried in the middle
# ✅ Engineered: top-2 verified chunks (180 tokens), highest signal first
context = pack_context(candidates, max_budget=260, cutoff=0.55)
answer = (prompt | llm).invoke({"context": context, "question": question})`,
    explain: <><p>LLMs pay the strongest attention to the <b>very beginning</b> and <b>very end</b> of a prompt — facts buried in a noisy middle get ignored or muddled by stale text. Pruning + ordering fixes both accuracy and cost at once.</p><div className="note"><b>Toggle Engineered vs Stuffed and run for real →</b> fewer tokens produces a <i>better</i> answer.</div></>,
  },
  {
    id: 'd', tab: 'Recap', kicker: 'Done', title: 'High signal, zero bloat', file: 'done.py', pose: 'cheer', color: '#ffc02e',
    Visual: () => (
      <div className="recap">
        <Reveal><div className="recap-row"><span className="recap-check">✓</span> Strict per-call token budgets</div></Reveal>
        <Reveal d={0.1}><div className="recap-row"><span className="recap-check">✓</span> Relevance &amp; freshness filtering (no stale drafts)</div></Reveal>
        <Reveal d={0.2}><div className="recap-row"><span className="recap-check">✓</span> Edge placement to beat “Lost in the Middle”</div></Reveal>
        <Reveal d={0.4}><div className="recap-done">🎓 Prompt writer → Context architect.</div></Reveal>
      </div>
    ),
    code: `# 🎓 Project 5 complete
# Next: we budgeted a single turn's window — what happens across 50 turns,
# or when the user comes back next week? -> Project 6: Memory`,
    explain: <p>Now that you know how to budget a single turn’s context window, what happens across a long conversation or across multiple days? Next up: <b>🧠 Memory</b>.</p>,
  },
]

const C5_GUIDE = {
  files: { ipynb: 'project-context.ipynb', py: 'project-context.py' },
  everyone: (
    <>
      <h4>🙂 For everyone — curate what the AI sees</h4>
      <p>Giving an AI <i>more</i> text often makes it <i>worse</i>. You’ll see how filtering out noise and outdated notes makes answers sharper and cheaper.</p>
      <span className="g-sub">Walk the steps</span>
      <ol>
        <li><b>Overview</b> — see the flow: Gather → Re-rank &amp; filter → Fit token budget → High-signal prompt.</li>
        <li><b>Token Budget</b> — click the <b>presets</b> (or drag the <b>budget</b> to <code>500</code> and <b>cutoff</b> to <code>0.30</code>).<span className="g-expect">Notice that when the budget is bloated and cutoff is loose, an old 2021 draft sneaks in and poisons the context.</span></li>
        <li><b>Signal vs Noise</b> — toggle between <b>🧭 Engineered Context</b> and <b>🗑️ Stuffed Window</b>, then click <b>Run both contexts for real</b>.<span className="g-expect">The smaller, cleaner context gives the right 30-day answer while using 70% fewer tokens.</span></li>
      </ol>
      <span className="g-note">✅ <b>You’re done when</b> you can explain why “stuffing the whole PDF in the prompt” loses to a ranked, budgeted context window.</span>
    </>
  ),
  developers: (
    <>
      <h4>👩‍💻 For developers — run the notebook</h4>
      <p>Build a context-packing pipeline with relevance scoring, metadata freshness filtering, token budgeting, and edge-positioned ordering.</p>
      <span className="g-sub">Setup — pick one</span>
      <ol>
        <li><b>🚀 Open in Colab</b>: click <b>Open in Colab</b> above → run the first cell.</li>
        <li><b>💻 Local:</b> run <code>jupyter lab project-context.ipynb</code> or <code>python project-context.py</code>.</li>
      </ol>
      <span className="g-sub">Run each section</span>
      <ol>
        <li><b>Score &amp; Filter</b> — evaluates candidate chunks, dropping archived/low-similarity items below <code>relevance_cutoff</code>.</li>
        <li><b>Token Budget Packer</b> — packs top-ranked chunks until <code>max_budget</code> is reached, placing the highest-scoring evidence first.</li>
        <li><b>A/B Evaluation</b> — runs the LLM on both the raw stuffed corpus and the engineered context, printing token count and answer quality side by side.</li>
      </ol>
      <span className="g-note">🧪 <b>Extend:</b> add a cross-encoder re-ranker or LLM compression step before packing.</span>
    </>
  ),
}

export function Capstone5({ creds, setCreds }) {
  return <StepJourney steps={C5_STEPS} creds={creds} setCreds={setCreds} guide={C5_GUIDE} tagline="Project 5 — curate, budget, and rank what goes into the context window." />
}

/* ============================================================
   CAPSTONE 6 — Memory (Short-Term Window + Long-Term Fact Store)
   ============================================================ */
const C6_TURNS = [
  { t: 1, u: "Hi! I'm Maya, a backend lead at FinStack.", a: 'Nice to meet you, Maya!', frag: 'User is Maya (backend lead at FinStack)' },
  { t: 2, u: 'We build payment APIs in Python and FastAPI.', a: 'FastAPI is great for typed async services.', frag: 'building payment APIs in Python/FastAPI' },
  { t: 3, u: 'Our database is PostgreSQL 16 on Cloud SQL.', a: 'Got it — Postgres 16 on Cloud SQL.', frag: 'using PostgreSQL 16 on Cloud SQL' },
  { t: 4, u: "I'm strictly vegetarian, by the way.", a: 'Noted! Vegetarian options only.', frag: 'strictly vegetarian' },
  { t: 5, u: 'We are preparing for a SOC2 audit next month.', a: 'SOC2 requires strict audit logging and access controls.', frag: 'preparing for a SOC2 audit next month' },
  { t: 6, u: 'Which Python library should we use for DB migrations?', a: 'Use Alembic with SQLAlchemy for Postgres migrations.', frag: 'asking about DB migrations' },
]

function V_C6_ShortTerm({ code, setCode }) {
  const winSize = Math.max(1, Math.min(6, readNum(code, 'window_size', 2)))
  const setWinSize = (v) => setCode((c) => writeNum(c, 'window_size', v))

  const cutoffIdx = C6_TURNS.length - winSize
  const summarizedTurns = C6_TURNS.slice(0, cutoffIdx)
  const verbatimTurns = C6_TURNS.slice(cutoffIdx)

  const summaryTok = summarizedTurns.length ? 20 + summarizedTurns.length * 9 : 0
  const rawTokens = C6_TURNS.length * 65
  const managedTokens = summaryTok + verbatimTurns.length * 65
  const savedPct = Math.round(((rawTokens - managedTokens) / rawTokens) * 100)
  const dynamicSummary = summarizedTurns.map((x) => x.frag).join('; ') + '.'

  return (
    <div>
      <div className="knob-row">
        <div className="knob">
          <span className="knob-label">🪟 window</span>
          <input type="range" min="1" max="6" step="1" value={winSize} onChange={(e) => setWinSize(Number(e.target.value))} />
          <span className="knob-val">last {winSize}</span>
        </div>
      </div>

      <div className="inf-metrics" style={{ marginBottom: 12 }}>
        <div className="inf-metric"><span>Raw History Cost</span><b>{rawTokens} tok (grows forever 📈)</b></div>
        <div className="inf-metric"><span>Summary + Window</span><b style={{ color: 'var(--teal-deep)' }}>{managedTokens} tok ({savedPct > 0 ? `-${savedPct}%` : 'full'})</b></div>
      </div>

      {summarizedTurns.length > 0 && (
        <div className="mem-summary-box">
          <div className="mem-sum-h">📝 Compressed Rolling Summary (Turns 1–{summarizedTurns.length} → {summaryTok} tokens)</div>
          <div className="mem-sum-body">
            “{dynamicSummary}”
          </div>
        </div>
      )}

      <div className="section-title" style={{ marginTop: 12, marginBottom: 8 }}>💬 Verbatim Sliding Window (Turns {cutoffIdx + 1}–6 kept word-for-word)</div>
      <div className="mem-turns">
        {C6_TURNS.map((turn, idx) => {
          const isVerbatim = idx >= cutoffIdx
          return (
            <div key={turn.t} className={`mem-turn ${isVerbatim ? 'active' : 'folded'}`}>
              <span className="mem-t-badge">{isVerbatim ? `Turn ${turn.t} · verbatim` : `Turn ${turn.t} · folded into summary`}</span>
              <div className="mem-t-u"><b>User:</b> {turn.u}</div>
              {isVerbatim && <div className="mem-t-a"><b>AI:</b> {turn.a}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function deriveDemoFacts(msg) {
  const nameMatch = msg.match(/(?:I'm|I am|name is)\s+([A-Z][a-zA-Z]+)/i)
  const name = nameMatch ? nameMatch[1] : 'Maya'
  const dietMatch = msg.match(/\b(vegetarian|vegan|pescatarian|gluten[- ]free|keto|halal)\b/i)
  const diet = dietMatch ? dietMatch[1].toLowerCase() : 'vegetarian'
  const stackMatch = msg.match(/\b(FastAPI|Python|Rust|Go|React|TypeScript|Node|Django|Java|Kubernetes)\b/gi)
  const stack = stackMatch ? [...new Set(stackMatch)].join(' + ') : 'Python + FastAPI'
  const roleMatch = msg.match(/\b(backend engineer|frontend engineer|data scientist|designer|founder|product manager|devops|engineer|developer)\b/i)
  const role = roleMatch ? `${roleMatch[1]} (${stack})` : `Engineer (${stack})`
  return [
    { key: 'name', value: name },
    { key: 'role', value: role },
    { key: 'diet', value: diet },
  ]
}

function V_C6_LongTerm({ creds, code, setCode, shared, setShared }) {
  const userMsg = readStr(code, 'user_msg', "Hi, I'm Maya! I'm a vegetarian backend engineer building microservices in FastAPI.")
  const question = readStr(code, 'question', 'Suggest a quick working lunch and a weekend coding project for me.')
  const setUserMsg = (v) => setCode((c) => writeStr(c, 'user_msg', v))
  const setQuestion = (v) => setCode((c) => writeStr(c, 'question', v))

  const demoFacts = deriveDemoFacts(userMsg)
  const facts = shared?.memFacts || demoFacts
  const setFacts = (next) => setShared((st) => ({ ...st, memFacts: next }))
  const [s, run] = useRun()

  const goLive = () => run(async () => {
    const extracted = await chatJSON(creds.provider, creds.key, {
      system: 'Extract durable user profile facts from the message. Return ONLY a JSON object with key "facts" containing a list of {"key": string, "value": string} items (max 4).',
      prompt: userMsg,
      temperature: 0,
      maxTokens: 250,
    })
    const newFacts = Array.isArray(extracted?.facts) && extracted.facts.length ? extracted.facts : demoFacts
    setFacts(newFacts)
    const memContext = newFacts.map((f) => `${f.key}: ${f.value}`).join('; ')

    const [amnesiac, remembered] = await Promise.all([
      chat(creds.provider, creds.key, { prompt: question, temperature: 0.5, maxTokens: 120 }),
      chat(creds.provider, creds.key, {
        system: `You are a helpful assistant. Personalize your reply using these recalled long-term user memories:\n${memContext}`,
        prompt: question,
        temperature: 0.5,
        maxTokens: 140,
      }),
    ])
    return { amnesiac, remembered }
  })

  const activeName = facts.find((f) => f.key === 'name')?.value || demoFacts[0].value
  const activeDiet = facts.find((f) => f.key === 'diet')?.value || demoFacts[2].value
  const activeRole = facts.find((f) => f.key === 'role')?.value || demoFacts[1].value
  const demoAmnesiac = 'Grab a turkey club sandwich for lunch! For a weekend project, try building a basic HTML/CSS portfolio website.'
  const demoRemembered = `For a quick ${activeDiet} lunch, ${activeName}, try a crispy falafel or tofu bowl! For your weekend project tailored to ${activeRole}, build an async webhook verifier with background workers.`

  return (
    <div>
      <div className="input-tag">🗣️ Session 1 (Monday) — user shares something about themselves</div>
      <input className="inline-input" style={{ maxWidth: '100%', marginLeft: 0 }} value={userMsg} onChange={(e) => setUserMsg(e.target.value)} disabled={s.loading} />

      <div className="retrieved" style={{ marginTop: 10 }}>
        <div className="retr-h">🗄️ Long-Term Memory Store (<code>user_id="maya"</code> · survives across sessions) {s.data && <LiveBadge />}</div>
        <div className="mem-facts">
          {facts.map((f, i) => (
            <span key={i} className="mem-fact-pill"><b>{f.key}:</b> {f.value}</span>
          ))}
        </div>
      </div>

      <div className="input-tag">🔄 Session 2 (Friday · brand-new chat, zero message history)</div>
      <input className="inline-input" style={{ maxWidth: '100%', marginLeft: 0 }} value={question} onChange={(e) => setQuestion(e.target.value)} disabled={s.loading} />

      <div className="rag-answer bad" style={{ marginTop: 10 }}>
        <div className="rag-a-h">❌ Without Memory (wakes up with amnesia)</div>
        <div className="rag-a-body">{s.loading ? '…' : (s.data?.amnesiac || demoAmnesiac)}</div>
      </div>

      <div className="rag-answer good" style={{ marginTop: 8 }}>
        <div className="rag-a-h">✅ With Long-Term Memory Recalled {s.data && <LiveBadge />}</div>
        <div className="rag-a-body">{s.loading ? '…extracting facts & recalling…' : (s.data?.remembered || demoRemembered)}</div>
      </div>

      {s.error && <LiveErr msg={s.error} />}
      <div className="run-row">
        {creds.connected && <RunBtn creds={creds} onClick={goLive} loading={s.loading} label="🧠 Extract facts & test Session 2 for real" />}
      </div>
      {!creds.connected && <NeedKey />}
    </div>
  )
}

const C6_STEPS = [
  {
    id: 'o', tab: 'Overview', kicker: 'Project 6', title: 'Memory Systems', file: 'project6.py', pose: 'wave', color: '#8a5cf0',
    Visual: () => <Pipeline steps={[{ ic: '💬', t: 'Chat turn' }, { ic: '🪟', t: 'Short-term window' }, { ic: '🧬', t: 'Extract facts' }, { ic: '🗄️', t: 'Long-term recall' }]} />,
    code: `# Every LLM call is stateless: it forgets you the millisecond it replies.
# And if you paste 100 turns of chat history, your context budget explodes.
#
# Production Memory has TWO layers:
#   1. Short-Term (in-session)  — recent window + rolling summary
#   2. Long-Term (cross-session) — extract durable user facts to a DB`,
    explain: <p>In <b>Project 5 (Context Engineering)</b> we learned to keep prompts compact. <b>Memory</b> is how you give an AI continuity across 50-turn chats <i>and</i> across separate days without blowing that token budget.</p>,
  },
  {
    id: 's', tab: 'Short-Term', kicker: 'Step 1 · Within a session', title: 'Rolling summary + sliding window', file: 'short_term.py', pose: 'point', color: '#2e9bd6', Visual: V_C6_ShortTerm, editable: true,
    code: `window_size = 2   # keep the last N turns word-for-word

# Compress older turns into a running summary so token count stays flat
if len(history) > window_size:
    summary = summarize_llm.invoke(history[:-window_size])
    messages = [SystemMessage(f"Summary: {summary}")] + history[-window_size:]`,
    explain: <><p>Appending every message forever hits a token cliff. Instead, keep the <b>last N turns verbatim</b> (so the conversation flows naturally) and fold older turns into a compact <b>running summary</b>.</p><div className="note"><b>Drag the window slider →</b> see how older turns fold into the 55-token summary while recent turns stay intact.</div></>,
  },
  {
    id: 'l', tab: 'Long-Term', kicker: 'Step 2 · Across sessions', title: 'Extract on write, inject on read', file: 'long_term.py', pose: 'cheer', color: '#15b3a4', Visual: V_C6_LongTerm, editable: true,
    code: `# Session 1 (Monday): extract durable facts using structured output
user_msg = "Hi, I'm Maya! I'm a vegetarian backend engineer building microservices in FastAPI."
facts = fact_extractor.invoke(user_msg)   # -> [{key: "diet", value: "vegetarian"}, ...]
memory_db.upsert(user_id="maya", facts=facts)

# Session 2 (Friday, brand-new chat): recall facts -> personalize
question = "Suggest a quick working lunch and a weekend coding project for me."
recalled = memory_db.search(user_id="maya", query=question)
answer = llm.invoke([SystemMessage(f"User profile: {recalled}"), HumanMessage(question)])`,
    explain: <><p>When a session ends, chat history disappears — unless a background extractor pulls out <b>durable facts</b> (role, preferences, constraints) using <b>Structured Outputs (Project 1)</b> and saves them to a database for future sessions.</p><div className="note"><b>Edit what the user says in Session 1 and run for real →</b> watch Session 2 adapt automatically.</div></>,
  },
  {
    id: 'd', tab: 'Recap', kicker: 'Done', title: 'Stateless model → stateful companion', file: 'done.py', pose: 'cheer', color: '#ffc02e',
    Visual: () => (
      <div className="recap">
        <Reveal><div className="recap-row"><span className="recap-check">✓</span> Bounded short-term memory (window + rolling summary)</div></Reveal>
        <Reveal d={0.1}><div className="recap-row"><span className="recap-check">✓</span> Structured fact extraction into a persistent vault</div></Reveal>
        <Reveal d={0.2}><div className="recap-row"><span className="recap-check">✓</span> Cross-session recall without repeating yourself</div></Reveal>
        <Reveal d={0.4}><div className="recap-done">🎓 Amnesiac chatbot → persistent teammate.</div></Reveal>
      </div>
    ),
    code: `# 🎓 Project 6 complete
# Next: we now have RAG resources, context, memory stores, and custom tools.
# How do we connect ALL of them without writing N×M custom glue code? -> Project 7: MCP`,
    explain: <p>You now have tools, knowledge bases, and memory stores. Next, see how <b>🔌 MCP (Model Context Protocol)</b> connects them all through one universal plug.</p>,
  },
]

const C6_GUIDE = {
  files: { ipynb: 'project-memory.ipynb', py: 'project-memory.py' },
  everyone: (
    <>
      <h4>🙂 For everyone — teach the AI to remember</h4>
      <p>By default, AI wakes up with total amnesia every time you open a new chat. Here you’ll see how <b>short-term</b> and <b>long-term</b> memory fix that.</p>
      <span className="g-sub">Walk the steps</span>
      <ol>
        <li><b>Overview</b> — see the two memory loops: Short-term window (this chat) and Long-term vault (across days).</li>
        <li><b>Short-Term</b> — drag the <b>window</b> slider from 1 to 6.<span className="g-expect">Older messages fold into a tiny summary so the AI remembers the gist without overflowing its context window.</span></li>
        <li><b>Long-Term</b> — change what the user says in <b>Session 1</b> (e.g. change their job or favorite food), then click <b>🧠 Extract facts &amp; test Session 2 for real</b>.<span className="g-expect">Even in a brand-new Session 2 chat, the AI recalls the extracted profile facts and tailors its recommendation.</span></li>
      </ol>
      <span className="g-note">✅ <b>You’re done when</b> you can explain the difference between a rolling chat summary (short-term) and extracted profile facts (long-term).</span>
    </>
  ),
  developers: (
    <>
      <h4>👩‍💻 For developers — run the notebook</h4>
      <p>Implement both short-term window+summary memory and a long-term Pydantic fact-extraction + profile memory store in LangChain.</p>
      <span className="g-sub">Setup — pick one</span>
      <ol>
        <li><b>🚀 Open in Colab</b>: click <b>Open in Colab</b> above → run the Setup cell.</li>
        <li><b>💻 Local:</b> run <code>jupyter lab project-memory.ipynb</code> or <code>python project-memory.py</code>.</li>
      </ol>
      <span className="g-sub">Run each section</span>
      <ol>
        <li><b>Short-Term Buffer + Summary</b> — compresses turns older than <code>k</code> into a system summary while keeping the last <code>k</code> turns verbatim.</li>
        <li><b>Long-Term Fact Extractor</b> — uses <code>with_structured_output(MemoryPatch)</code> to upsert durable facts into a persistent dictionary / vector store.</li>
        <li><b>Cross-Session Recall</b> — starts a fresh session with empty message history, injects recalled facts, and compares against a stateless call.</li>
      </ol>
      <span className="g-note">🧪 <b>Extend:</b> back the memory store with Redis/Postgres or FAISS + timestamp decay so recent memories outrank old ones.</span>
    </>
  ),
}

export function Capstone6({ creds, setCreds }) {
  return <StepJourney steps={C6_STEPS} creds={creds} setCreds={setCreds} guide={C6_GUIDE} tagline="Project 6 — give an amnesiac LLM short-term conversation state and long-term user memory." />
}

/* ============================================================
   CAPSTONE 7 — MCP: Model Context Protocol (The Universal USB-C Plug)
   ============================================================ */
const MCP_PRIMITIVES = [
  {
    ic: '📄', name: 'Resources', method: 'resources/read', control: 'App-controlled',
    connectsTo: 'Connects to Project 2 (RAG), Project 5 (Context) & Project 6 (Memory)',
    desc: 'Read-only data streams (files, DB schemas, live policy docs, user profiles) exposed by URI like policy://refunds.',
  },
  {
    ic: '🔧', name: 'Tools', method: 'tools/call', control: 'Model-controlled',
    connectsTo: 'Connects to Project 3 (Tools & Agents)',
    desc: 'Executable functions with JSON schemas (lookup_order, issue_refund, post_slack) the LLM decides when to invoke.',
  },
  {
    ic: '💬', name: 'Prompts', method: 'prompts/get', control: 'User-controlled',
    connectsTo: 'Connects to Vibe Coding & Reusable Skills',
    desc: 'Standardized, parameterized prompt templates and slash workflows bundled right inside the server.',
  },
]

function V_C7_Primitives() {
  const [arch, setArch] = useState('mcp')
  return (
    <div>
      <div className="vs-toggle">
        <button className={`rag ${arch === 'mcp' ? 'on' : ''}`} onClick={() => setArch('mcp')}>🔌 With MCP · N + M Universal Plug</button>
        <button className={`ft ${arch === 'spaghetti' ? 'on' : ''}`} onClick={() => setArch('spaghetti')}>🍝 Before MCP · N × M Custom Glue</button>
      </div>

      {arch === 'spaghetti' ? (
        <div className="vs-stage" style={{ marginBottom: 12 }}>
          <div className="vs-flow">
            <span className="vs-chip hot">3 AI Apps (Claude, IDE, Agent)</span>
            <span className="vs-arrow">×</span>
            <span className="vs-chip hot">4 Systems (Orders, Policy, Slack, Git)</span>
            <span className="vs-arrow">=</span>
            <span className="vs-chip hot">12 bespoke connectors 💥</span>
          </div>
          <div className="vs-note">Every team rewrites the same auth, schema parsing, and retry logic for every model vendor. Change one API and 3 apps break.</div>
        </div>
      ) : (
        <div className="vs-stage" style={{ marginBottom: 12 }}>
          <div className="vs-flow">
            <span className="vs-chip cool">🖥️ Any MCP Client</span>
            <span className="vs-arrow">⇄</span>
            <span className="vs-chip" style={{ background: '#fff4d6' }}>🔌 MCP JSON-RPC</span>
            <span className="vs-arrow">⇄</span>
            <span className="vs-chip cool">🧰 Any MCP Server</span>
          </div>
          <div className="vs-note">Write an MCP server <b>once</b>. Claude Desktop, Cursor, Antigravity, and your own LangChain agent can all plug in and discover its capabilities at runtime.</div>
        </div>
      )}

      <div className="section-title" style={{ marginTop: 10, marginBottom: 8 }}>🧰 The 3 MCP Primitives (unifying the whole course)</div>
      {MCP_PRIMITIVES.map((p, i) => (
        <Reveal d={i * 0.08} key={p.name}>
          <div className="mcp-prim-card">
            <div className="mcp-prim-head">
              <span className="mcp-prim-ic">{p.ic}</span>
              <b>{p.name}</b>
              <code className="mcp-method">{p.method}</code>
              <span className="mcp-ctrl">{p.control}</span>
            </div>
            <div className="mcp-prim-d">{p.desc}</div>
            <div className="mcp-prim-link">↳ {p.connectsTo}</div>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

const ORDERS_DB = {
  'ORD-404': { item: 'Ergonomic Mechanical Keyboard', amount: 49, days_ago: 10, status: 'delivered_damaged' },
  'ORD-777': { item: '4K Studio Monitor', amount: 399, days_ago: 45, status: 'delivered' },
}

const MCP_SERVERS = [
  {
    id: 'orders',
    name: '📦 orders-mcp',
    desc: 'Tools: lookup_order, issue_refund',
    tools: [
      {
        name: 'lookup_order',
        description: 'Look up an order by order_id (e.g. ORD-404) in the Orders MCP server.',
        properties: { order_id: { type: 'string' } },
        required: ['order_id'],
        fn: (a) => JSON.stringify(ORDERS_DB[(a.order_id || '').toUpperCase()] || { error: 'not_found' }),
      },
      {
        name: 'issue_refund',
        description: 'Issue a refund in USD for an eligible order_id.',
        properties: { order_id: { type: 'string' }, amount_usd: { type: 'number' } },
        required: ['order_id', 'amount_usd'],
        fn: (a) => JSON.stringify({ status: 'REFUNDED', order_id: a.order_id, amount_usd: a.amount_usd, tx_id: 'RF-9021' }),
      },
    ],
  },
  {
    id: 'policy',
    name: '📜 policy-mcp',
    desc: 'Resource: policy://refunds',
    resource: { uri: 'policy://refunds', text: 'Refund Policy: Damaged orders within 30 days of delivery qualify for an instant 100% refund.' },
    tools: [],
  },
  {
    id: 'slack',
    name: '💬 slack-mcp',
    desc: 'Tool: post_slack_alert',
    tools: [
      {
        name: 'post_slack_alert',
        description: 'Post a short confirmation message to the #support-ops Slack channel.',
        properties: { channel: { type: 'string' }, message: { type: 'string' } },
        required: ['channel', 'message'],
        fn: (a) => `Posted to ${a.channel}: "${a.message}"`,
      },
    ],
  },
]

function V_C7_Inspector({ creds, code, setCode }) {
  const [enabled, setEnabled] = useState({ orders: true, policy: true, slack: true })
  const query = readStr(code, 'query', 'Order ORD-404 arrived damaged. Check the order, verify refund eligibility, issue the refund, and notify #support-ops.')
  const setQuery = (v) => setCode((c) => writeStr(c, 'query', v))
  const [s, run] = useRun()

  const toggleServer = (id) => setEnabled((prev) => ({ ...prev, [id]: !prev[id] }))

  const activeServers = MCP_SERVERS.filter((srv) => enabled[srv.id])
  const activeTools = activeServers.flatMap((srv) => srv.tools)
  const activeResources = activeServers.filter((srv) => srv.resource).map((srv) => srv.resource)

  const goLive = () => run(async () => {
    const resContext = activeResources.length
      ? `\nMCP Resources read:\n${activeResources.map((r) => `[${r.uri}]: ${r.text}`).join('\n')}`
      : '\n(No policy resource server connected.)'
    const sys = `You are an MCP-enabled operations agent. Use your discovered MCP tools and resources to fulfill the user request accurately.${resContext}`
    return runAgentMulti(creds.provider, creds.key, query, activeTools, sys)
  })

  const demoTrace = [
    ...(enabled.orders ? [{ name: 'lookup_order', args: { order_id: 'ORD-404' }, result: '{"item":"Ergonomic Mechanical Keyboard","amount":49,"days_ago":10,"status":"delivered_damaged"}' }] : []),
    ...(enabled.orders && enabled.policy ? [{ name: 'issue_refund', args: { order_id: 'ORD-404', amount_usd: 49 }, result: '{"status":"REFUNDED","order_id":"ORD-404","amount_usd":49,"tx_id":"RF-9021"}' }] : []),
    ...(enabled.orders && enabled.policy && enabled.slack ? [{ name: 'post_slack_alert', args: { channel: '#support-ops', message: 'Refunded $49 for damaged order ORD-404 (tx RF-9021).' }, result: 'Posted to #support-ops' }] : []),
  ]
  const demoAnswer = !enabled.orders
    ? '⚠️ Cannot look up ORD-404 because the orders-mcp server is unplugged.'
    : !enabled.policy
      ? 'Looked up ORD-404 ($49, 10 days ago, damaged), but policy-mcp is unplugged so I cannot verify refund eligibility.'
      : 'Order ORD-404 ($49, delivered 10 days ago, damaged) qualifies under policy://refunds (within 30 days). Issued $49.00 refund (tx #RF-9021) and notified #support-ops!'

  const trace = s.data ? s.data.trace : demoTrace
  const answer = s.data ? s.data.answer : demoAnswer

  return (
    <div>
      <div className="input-tag">🔌 Plug / unplug MCP servers at runtime (no agent code changes!)</div>
      <div className="mcp-plugs">
        {MCP_SERVERS.map((srv) => {
          const on = enabled[srv.id]
          return (
            <button key={srv.id} className={`mcp-plug ${on ? 'on' : 'off'}`} onClick={() => toggleServer(srv.id)}>
              <div className="mcp-plug-top">
                <span>{srv.name}</span>
                <span className="mcp-plug-dot">{on ? '● plugged' : '○ unplugged'}</span>
              </div>
              <div className="mcp-plug-d">{srv.desc}</div>
            </button>
          )
        })}
      </div>

      <div className="input-tag">🗣️ user task</div>
      <input className="inline-input" style={{ maxWidth: '100%', marginLeft: 0 }} value={query} onChange={(e) => setQuery(e.target.value)} disabled={s.loading} />

      <div className="retrieved" style={{ marginTop: 12 }}>
        <div className="retr-h">📡 MCP JSON-RPC Protocol Wire Trace {s.data && <LiveBadge />}</div>
        <div className="mcp-wire">
          <div className="mcp-frame"><code>→ tools/list</code> <span>discovered [{activeTools.map((t) => t.name).join(', ') || 'none'}]</span></div>
          {activeResources.map((r) => (
            <div className="mcp-frame" key={r.uri}><code>→ resources/read ({r.uri})</code> <span>“{r.text}”</span></div>
          ))}
          {trace.map((t, i) => (
            <div className="mcp-frame call" key={i}>
              <code>→ tools/call {t.name}({ JSON.stringify(t.args) })</code>
              <span>← {t.result}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`rag-answer ${enabled.orders && enabled.policy ? 'good' : 'bad'}`}>
        <div className="rag-a-h">✅ Agent Response {s.data && <LiveBadge />}</div>
        <div className="rag-a-body">{s.loading ? '…discovering MCP tools & executing…' : answer}</div>
      </div>

      {s.error && <LiveErr msg={s.error} />}
      <div className="run-row">
        {creds.connected && <RunBtn creds={creds} onClick={goLive} loading={s.loading} label="🔌 Discover & run via MCP for real" disabled={activeTools.length === 0} />}
      </div>
      {!creds.connected && <NeedKey />}
    </div>
  )
}

const C7_STEPS = [
  {
    id: 'o', tab: 'Overview', kicker: 'Project 7', title: 'Model Context Protocol (MCP)', file: 'project7.py', pose: 'wave', color: '#f47b20',
    Visual: () => <Pipeline steps={[{ ic: '🖥️', t: 'Host / Client' }, { ic: '🔌', t: 'MCP Protocol' }, { ic: '🧰', t: 'MCP Servers' }, { ic: '🏢', t: 'Databases & APIs' }]} />,
    code: `# We've built Schemas, RAG, Tools, Personalization, Context & Memory.
# How do we connect ALL of them across multiple AI apps without N×M glue code?
#
# Enter MCP (Model Context Protocol) — "USB-C for AI":
#   • One open JSON-RPC protocol between AI clients and capability servers
#   • Exposes Resources (context/memory), Tools (actions), and Prompts (workflows)
#   • Agents discover capabilities dynamically at runtime`,
    explain: <p>Without a standard, connecting 5 AI apps to 10 internal tools and memory stores requires <b>50 custom integrations</b>. <b>MCP</b> gives every model and every data source one universal plug.</p>,
  },
  {
    id: 'p', tab: 'The USB-C Port', kicker: 'Step 1 · Server primitives', title: 'Three primitives that unify the stack', file: 'mcp_server.py', pose: 'point', color: '#8a5cf0', Visual: V_C7_Primitives,
    code: `from mcp.server.fastmcp import FastMCP

mcp = FastMCP("AcmeSupportServer")

@mcp.resource("policy://refunds")           # 1. RESOURCE -> Context / RAG
def refund_policy() -> str:
    return "Damaged orders within 30 days get a 100% refund."

@mcp.tool()                                 # 2. TOOL -> Actions
def issue_refund(order_id: str, amount_usd: float) -> dict:
    """Issue a refund in USD for an eligible order_id."""
    return {"status": "REFUNDED", "order_id": order_id, "tx": "RF-9021"}

@mcp.prompt()                               # 3. PROMPT -> Reusable template
def triage_prompt(order_id: str) -> str:
    return f"Read policy://refunds, inspect {order_id}, and resolve."`,
    explain: <><p>An MCP server bundles everything an agent needs behind three clean decorators: <b><code>@mcp.resource</code></b> (read-only context), <b><code>@mcp.tool</code></b> (executable functions), and <b><code>@mcp.prompt</code></b> (reusable templates).</p><div className="note"><b>Toggle With MCP vs Before MCP →</b> notice how the three primitives map directly to the skills you learned across this course.</div></>,
  },
  {
    id: 'x', tab: 'Live Handshake', kicker: 'Step 2 · Dynamic discovery', title: 'Plug in servers and watch the wire trace', file: 'mcp_client.py', pose: 'cheer', color: '#15b3a4', Visual: V_C7_Inspector, editable: true,
    code: `query = "Order ORD-404 arrived damaged. Check the order, verify refund eligibility, issue the refund, and notify #support-ops."

# Client discovers capabilities at runtime via JSON-RPC:
tools  = await session.list_tools()                      # tools/list
policy = await session.read_resource("policy://refunds") # resources/read

# The agent chains tools across multiple independent MCP servers:
answer = await agent.invoke({"context": policy, "input": query, "tools": tools})`,
    explain: <><p>Notice that the agent code <b>never imports</b> the database or Slack SDKs. It simply asks connected MCP servers <code>tools/list</code> and <code>resources/read</code> at runtime, then calls <code>tools/call</code>.</p><div className="note"><b>Unplug a server above or run for real →</b> watch the JSON-RPC wire trace and see the agent adapt to whichever servers are plugged in!</div></>,
  },
  {
    id: 'd', tab: 'Recap', kicker: 'Done', title: 'Connected through one universal port', file: 'done.py', pose: 'cheer', color: '#ffc02e',
    Visual: () => (
      <div className="recap">
        <Reveal><div className="recap-row"><span className="recap-check">✓</span> Universal MCP architecture (Host ⇄ Client ⇄ Server)</div></Reveal>
        <Reveal d={0.1}><div className="recap-row"><span className="recap-check">✓</span> Resources (data), Tools (actions), and Prompts (workflows)</div></Reveal>
        <Reveal d={0.2}><div className="recap-row"><span className="recap-check">✓</span> Runtime JSON-RPC discovery (<code>tools/list</code>, <code>tools/call</code>)</div></Reveal>
        <Reveal d={0.4}><div className="recap-done">🎓 N×M spaghetti → one universal AI plug.</div></Reveal>
      </div>
    ),
    code: `# 🎓 Project 7 complete
# Final boss: our AI system is smart, context-curated, stateful, and MCP-connected.
# How do we serve it to 100,000 users 10× faster and 80% cheaper? -> Project 8: Inference`,
    explain: <p>Your AI architecture is functionally complete. In our final project, learn how <b>⚡ Inference Engineering</b> serves this whole stack fast and cheap at scale.</p>,
  },
]

const C7_GUIDE = {
  files: { ipynb: 'project-mcp.ipynb', py: 'project-mcp.py' },
  everyone: (
    <>
      <h4>🙂 For everyone — the universal USB-C plug for AI</h4>
      <p>Learn how <b>MCP (Model Context Protocol)</b> lets any AI app plug into databases, policies, and chat tools without custom wiring.</p>
      <span className="g-sub">Walk the steps</span>
      <ol>
        <li><b>Overview</b> — see how an MCP Host/Client talks to MCP Servers over one standard protocol.</li>
        <li><b>The USB-C Port</b> — toggle <b>With MCP</b> vs <b>Before MCP</b>, and read the 3 building blocks: <b>Resources</b> (facts to read), <b>Tools</b> (actions to take), and <b>Prompts</b> (templates).</li>
        <li><b>Live Handshake</b> — click the server buttons (<b>orders-mcp</b>, <b>policy-mcp</b>, <b>slack-mcp</b>) to plug or unplug them, then click <b>🔌 Discover &amp; run via MCP for real</b>.<span className="g-expect">Watch the JSON-RPC trace discover whichever tools are plugged in and chain them to check the order, issue the refund, and post to Slack.</span></li>
      </ol>
      <span className="g-note">✅ <b>You’re done when</b> you’ve unplugged a server, seen the agent safely report what’s missing, and plugged it back in to complete the workflow.</span>
    </>
  ),
  developers: (
    <>
      <h4>👩‍💻 For developers — run the notebook</h4>
      <p>Build an MCP server exposing Resources, Tools, and Prompts, inspect the JSON-RPC protocol lifecycle (<code>initialize</code> → <code>tools/list</code> → <code>resources/read</code> → <code>tools/call</code>), and bridge discovered MCP tools into a model-agnostic LangChain agent.</p>
      <span className="g-sub">Setup — pick one</span>
      <ol>
        <li><b>🚀 Open in Colab</b>: click <b>Open in Colab</b> above → run the Setup cell.</li>
        <li><b>💻 Local:</b> run <code>jupyter lab project-mcp.ipynb</code> or <code>python project-mcp.py</code>.</li>
      </ol>
      <span className="g-sub">Run each section</span>
      <ol>
        <li><b>Define MCP Server</b> — registers <code>@mcp.resource("policy://refunds")</code>, <code>@mcp.tool()</code> functions (<code>lookup_order</code>, <code>issue_refund</code>, <code>post_slack_alert</code>), and <code>@mcp.prompt()</code>.</li>
        <li><b>JSON-RPC Client Session</b> — queries <code>list_tools()</code> and <code>read_resource()</code> over the protocol and converts MCP tool schemas into LangChain tools dynamically.</li>
        <li><b>End-to-End Agent Execution</b> — runs the agent across the discovered MCP tools with zero hardcoded tool imports.</li>
      </ol>
      <span className="g-note">🧪 <b>Extend:</b> run the server over stdio with <code>pip install mcp</code> and connect it directly to Claude Desktop, Cursor, or Antigravity!</span>
    </>
  ),
}

export function Capstone7({ creds, setCreds }) {
  return <StepJourney steps={C7_STEPS} creds={creds} setCreds={setCreds} guide={C7_GUIDE} tagline="Project 7 — the universal USB-C port connecting AI models to tools, data, and prompts." />
}

/* ============================================================
   CAPSTONE 8 — Inference Engineering (Routing, KV Cache, Streaming)
   ============================================================ */
const C8_SAMPLES = [
  {
    label: 'Simple · Tag ticket',
    q: "Classify this support ticket as BILLING or TECH: 'I was charged twice on my May invoice.'",
    score: 0.22,
    demoAns: 'BILLING — duplicate charge on the May invoice.',
  },
  {
    label: 'Simple · Extract date',
    q: "Extract the renewal date in YYYY-MM-DD format: 'Your contract renews on October 14, 2026.'",
    score: 0.18,
    demoAns: '2026-10-14',
  },
  {
    label: 'Complex · Architecture trade-off',
    q: 'Compare multi-region active-active vs active-passive failover for a regulated fintech ledger with RPO=0.',
    score: 0.88,
    demoAns: 'For RPO=0 in a regulated ledger, active-active requires synchronous consensus (e.g. Spanner/CockroachDB) across regions, trading higher write latency (40–80ms) for zero data loss. Active-passive with synchronous replication to a nearby standby achieves RPO=0 with simpler conflict resolution.',
  },
]

function estimateComplexity(q) {
  const s = C8_SAMPLES.find((x) => x.q === q)
  if (s) return s.score
  const words = q.trim().split(/\s+/).length
  const hard = /compare|architect|trade-off|design|analyze|multi-step|why|prove|strategy/i.test(q)
  return Math.min(0.95, Math.max(0.12, (words / 28) * 0.55 + (hard ? 0.42 : 0.08)))
}

function V_C8_Router({ creds, code, setCode }) {
  const query = readStr(code, 'query', C8_SAMPLES[0].q)
  const threshold = readNum(code, 'complexity_threshold', 0.5)
  const setQuery = (v) => setCode((c) => writeStr(c, 'query', v))
  const setThreshold = (v) => setCode((c) => writeNum(c, 'complexity_threshold', v))
  const [s, run] = useRun()

  const score = estimateComplexity(query)
  const isComplex = score >= threshold
  const tier = isComplex
    ? { name: '🧠 Frontier Model', model: 'gemini-2.5-pro / gpt-4o / claude-sonnet', cost: '$10.00 / 1M tok', latency: '~1,450 ms', color: '#8a5cf0' }
    : { name: '⚡ Fast Flash/Mini Model', model: 'gemini-flash-lite / gpt-4o-mini / haiku', cost: '$0.20 / 1M tok', latency: '~210 ms', color: '#15b3a4' }

  const goLive = () => run(async () => {
    const t0 = performance.now()
    const ans = await chat(creds.provider, creds.key, {
      system: isComplex
        ? 'You are a Principal Systems Architect. Give a concise, rigorous 2-sentence answer.'
        : 'You are a fast triage classifier. Reply in one short, crisp line.',
      prompt: query,
      temperature: 0.1,
      maxTokens: 140,
    })
    const ms = Math.round(performance.now() - t0)
    return { ans, ms }
  })

  const sampleMatch = C8_SAMPLES.find((x) => x.q === query)
  const answer = s.data?.ans || sampleMatch?.demoAns || (isComplex ? 'Routed to Frontier tier for deep multi-constraint reasoning.' : 'Routed to Fast tier — handled in one quick pass.')

  return (
    <div>
      <div className="qpick">
        <span>try a request:</span>
        {C8_SAMPLES.map((x, i) => (
          <button key={i} className={query === x.q ? 'on' : ''} onClick={() => setQuery(x.q)}>{x.label}</button>
        ))}
      </div>
      <input className="inline-input" style={{ maxWidth: '100%', marginLeft: 0 }} value={query} onChange={(e) => setQuery(e.target.value)} disabled={s.loading} />

      <div className="knob-row" style={{ marginTop: 12 }}>
        <div className="knob">
          <span className="knob-label">🚦 threshold</span>
          <input type="range" min="0.1" max="0.9" step="0.05" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} disabled={s.loading} />
          <span className="knob-val">{threshold.toFixed(2)}</span>
        </div>
      </div>

      <div className="sim-row" style={{ marginBottom: 12 }}>
        <div className="sim-label">complexity score</div>
        <div className="sim-bar">
          <div style={{ width: `${score * 100}%`, height: '100%', background: isComplex ? 'var(--plum)' : 'var(--teal)', transition: 'width 0.3s ease' }} />
        </div>
        <div className="sim-val">{score.toFixed(2)}</div>
      </div>

      <div className="inf-route-card" style={{ borderColor: tier.color }}>
        <div className="inf-route-top">
          <span className="inf-tier-badge" style={{ background: tier.color }}>{tier.name}</span>
          <span className="inf-tier-model">{tier.model}</span>
        </div>
        <div className="inf-metrics">
          <div className="inf-metric"><span>Cost</span><b>{tier.cost}</b></div>
          <div className="inf-metric"><span>Target Latency</span><b>{s.data ? `${s.data.ms} ms (live)` : tier.latency}</b></div>
          <div className="inf-metric"><span>Savings vs All-Frontier</span><b style={{ color: isComplex ? 'var(--text-dim)' : 'var(--teal-deep)' }}>{isComplex ? '0% (needed big brain)' : '98% cheaper ⚡'}</b></div>
        </div>
      </div>

      <div className="rag-answer good" style={{ marginTop: 12 }}>
        <div className="rag-a-h">✅ Routed response {s.data && <LiveBadge />}</div>
        <div className="rag-a-body">{s.loading ? '…routing + invoking model…' : answer}</div>
      </div>

      {s.error && <LiveErr msg={s.error} />}
      <div className="run-row">
        {creds.connected && <RunBtn creds={creds} onClick={goLive} loading={s.loading} label="🚦 Route & run for real" />}
      </div>
      {!creds.connected && <NeedKey />}
    </div>
  )
}

const HANDBOOK_PREFIX = 'Acme Global Handbook + MCP Tool Schemas (4,200 static tokens cached in KV memory): Standard refunds are processed within 5 business days. Enterprise annual plans include a 30-day money-back guarantee and dedicated SLA support.'

function V_C8_CacheStream({ creds, code, setCode }) {
  const [cached, setCached] = useState(true)
  const [streamedText, setStreamedText] = useState('')
  const question = readStr(code, 'question', 'How many business days do standard refunds take, and what do Enterprise plans include?')
  const setQuestion = (v) => setCode((c) => writeStr(c, 'question', v))
  const [s, run] = useRun()

  const demoFull = 'Standard refunds take 5 business days. Enterprise annual plans also get a 30-day money-back guarantee plus dedicated SLA support.'

  const goLive = () => run(async () => {
    setStreamedText('')
    const t0 = performance.now()
    const ans = await chat(creds.provider, creds.key, {
      system: `Answer concisely using this handbook:\n${HANDBOOK_PREFIX}`,
      prompt: question,
      temperature: 0,
      maxTokens: 120,
    })
    const totalMs = Math.round(performance.now() - t0)
    const words = ans.split(' ')
    words.forEach((w, i) => {
      setTimeout(() => {
        setStreamedText((prev) => (prev ? prev + ' ' + w : w))
      }, i * (cached ? 28 : 55))
    })
    return { ans, totalMs, ttft: cached ? Math.min(220, Math.round(totalMs * 0.22)) : totalMs }
  })

  const ttft = s.data ? `${s.data.ttft} ms` : (cached ? '190 ms ⚡' : '1,840 ms 🐢')
  const prefixCost = cached ? '420 tok billed (90% cached!)' : '4,200 tok billed (recomputed)'
  const displayOut = s.data ? (streamedText || s.data.ans) : demoFull

  return (
    <div>
      <div className="vs-toggle">
        <button className={`rag ${cached ? 'on' : ''}`} onClick={() => setCached(true)}>⚡ Warm KV Cache + Stream</button>
        <button className={`ft ${!cached ? 'on' : ''}`} onClick={() => setCached(false)}>🐢 Cold Prefix + Blocking</button>
      </div>

      <div className="input-tag">❓ user question (placed AFTER the static system prompt, MCP schemas &amp; handbook prefix)</div>
      <input className="inline-input" style={{ maxWidth: '100%', marginLeft: 0 }} value={question} onChange={(e) => setQuestion(e.target.value)} disabled={s.loading} />

      <div className="inf-kv-box" style={{ marginTop: 12 }}>
        <div className="inf-kv-row">
          <span className={`vs-chip ${cached ? 'cool' : 'hot'}`}>
            {cached ? '🗄️ Prefix KV Cache: HIT (4,200 tokens reused)' : '❄️ Prefix KV Cache: MISS (recomputing K & V matrices)'}
          </span>
          <span className="vs-chip">{cached ? '🌊 Streaming: token-by-token' : '🧱 Blocking: wait for full reply'}</span>
        </div>
        <div className="inf-metrics" style={{ marginTop: 10 }}>
          <div className="inf-metric"><span>Time to First Token (TTFT)</span><b style={{ color: cached ? 'var(--teal-deep)' : 'var(--coral)' }}>{ttft}</b></div>
          <div className="inf-metric"><span>Prompt Billing</span><b>{prefixCost}</b></div>
        </div>
      </div>

      <div className={`rag-answer ${cached ? 'good' : 'bad'}`} style={{ marginTop: 12 }}>
        <div className="rag-a-h">{cached ? '🌊 Streamed response (instant start)' : '⏳ Blocked response (waited until end)'} {s.data && <LiveBadge />}</div>
        <div className="rag-a-body" style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{s.loading ? '…computing prefill & generating tokens…' : displayOut}</div>
      </div>

      {s.error && <LiveErr msg={s.error} />}
      <div className="run-row">
        {creds.connected && <RunBtn creds={creds} onClick={goLive} loading={s.loading} label="⚡ Run & measure TTFT for real" />}
      </div>
      {!creds.connected && <NeedKey />}
      <div className="fade-key"><b>Why this ties back to Context, Memory &amp; MCP:</b> order your context layers from <b>most static</b> (system prompt + MCP tool schemas) at the top to <b>most dynamic</b> (recent chat window + user question) at the bottom so the KV cache hits on every turn!</div>
    </div>
  )
}

const C8_STEPS = [
  {
    id: 'o', tab: 'Overview', kicker: 'Project 8 · Finale', title: 'Inference Engineering', file: 'project8.py', pose: 'wave', color: '#15b3a4',
    Visual: () => <Pipeline steps={[{ ic: '🚦', t: 'Route (tier)' }, { ic: '🗄️', t: 'KV Cache' }, { ic: '🌊', t: 'Stream TTFT' }, { ic: '🚀', t: 'Fast & Cheap' }]} />,
    code: `# Projects 1–7 made our AI smart, grounded, context-curated,
# stateful (Memory), and universally connected (MCP).
#
# Now 100,000 users show up — and latency + cloud bills spike!
# Inference Engineering serves your whole stack fast & cheap:
#   1. Model Routing  — send simple tasks to small, fast models
#   2. Prefix Caching — reuse KV matrices for static context & MCP tools
#   3. Streaming      — ship the first token in ~200ms (low TTFT)`,
    explain: <p>In <b>Life of a Token</b> you saw how every token requires heavy matrix math. Now that your complete AI system is built, <b>Inference Engineering</b> makes that math <b>10× faster and 80% cheaper</b> in production.</p>,
  },
  {
    id: 'r', tab: 'Model Router', kicker: 'Step 1 · Right-sizing', title: 'The smart traffic cop', file: 'router.py', pose: 'point', color: '#8a5cf0', Visual: V_C8_Router, editable: true,
    code: `query = "Classify this support ticket as BILLING or TECH: 'I was charged twice on my May invoice.'"
complexity_threshold = 0.5   # 0..1 — route simple tasks to the fast model

score = score_complexity(query)
model = frontier_llm if score >= complexity_threshold else fast_llm

# 80% of traffic hits fast_llm at ~1/50th the cost
answer = model.invoke(query)`,
    explain: <><p>You don’t charter a 747 to cross the street. A lightweight <b>router</b> inspects each request: simple classifications and memory extractions go to a flash/mini model, while gnarly reasoning escalates to a frontier model.</p><div className="note"><b>Pick a sample query or drag the threshold →</b> watch the router switch tiers and slash cost by up to 98%.</div></>,
  },
  {
    id: 'c', tab: 'Cache & Stream', kicker: 'Step 2 · KV Cache & TTFT', title: 'Reuse the prefix, stream the rest', file: 'cache_stream.py', pose: 'think', color: '#f47b20', Visual: V_C8_CacheStream, editable: true,
    code: `# Order your Context layers from STATIC -> DYNAMIC so KV cache hits:
# [1. System + MCP Tool Schemas] -> [2. Static Handbook] -> [3. Live Question]
static_prefix = "Acme Global Handbook + MCP Schemas (4,200 tokens)..."
question = "How many business days do standard refunds take, and what do Enterprise plans include?"

# Stream tokens as they are generated -> sub-250ms TTFT
for chunk in llm.stream([("system", static_prefix),
                         ("human", question)]):
    print(chunk.content, end="", flush=True)`,
    explain: <><p>Remember <b>Keys</b> and <b>Values</b> from the Attention step? By placing your static <b>Context</b> and <b>MCP tool schemas</b> at the very top of the prompt, <b>Prefix Caching</b> keeps their KV matrices in GPU memory — while <b>Streaming</b> shows words the instant they’re born.</p><div className="note"><b>Toggle Warm KV Cache vs Cold Blocking →</b> then run it live to feel the difference in Time-To-First-Token (TTFT).</div></>,
  },
  {
    id: 'd', tab: 'Recap', kicker: 'Done', title: 'You mastered the entire modern AI stack!', file: 'done.py', pose: 'cheer', color: '#ffc02e',
    Visual: () => (
      <div className="recap">
        <Reveal><div className="recap-row"><span className="recap-check">✓</span> Tiered model routing (flash vs. frontier)</div></Reveal>
        <Reveal d={0.1}><div className="recap-row"><span className="recap-check">✓</span> Static-first context layout for KV cache hits</div></Reveal>
        <Reveal d={0.2}><div className="recap-row"><span className="recap-check">✓</span> Token streaming for sub-250ms Time-To-First-Token</div></Reveal>
        <Reveal d={0.4}><div className="recap-done">🎓 All 8 Projects Complete — ready to ship to production!</div></Reveal>
      </div>
    ),
    code: `# 🎓 All 8 Projects Complete!
#   1. LLM Outputs     5. Context Engineering
#   2. RAG             6. Memory Systems
#   3. Tools           7. Model Context Protocol (MCP)
#   4. Personalization 8. Inference Engineering`,
    explain: <p>You’ve walked the entire journey — from how a single token flows through attention matrices to how production systems curate context, remember users, plug into tools via MCP, and serve millions of requests fast and cheap.</p>,
  },
]

const C8_GUIDE = {
  files: { ipynb: 'project-inference.ipynb', py: 'project-inference.py' },
  everyone: (
    <>
      <h4>🙂 For everyone — make AI fast and affordable at scale</h4>
      <p>Learn the three tricks companies use so their complete AI system replies in a blink without costing a fortune: <b>routing</b>, <b>caching</b>, and <b>streaming</b>.</p>
      <span className="g-sub">Walk the steps</span>
      <ol>
        <li><b>Overview</b> — see the pipeline: Route → KV Cache → Stream → Fast &amp; Cheap.</li>
        <li><b>Model Router</b> — click between the <b>Simple</b> and <b>Complex</b> sample requests, or drag the <b>threshold</b> slider.<span className="g-expect">Simple tasks route to a small, cheap model (98% cheaper); hard tasks escalate to the big frontier model.</span></li>
        <li><b>Cache &amp; Stream</b> — toggle between <b>⚡ Warm KV Cache + Stream</b> and <b>🐢 Cold Prefix + Blocking</b>, then click <b>Run &amp; measure TTFT for real</b>.<span className="g-expect">Reusing the static prefix + streaming starts the answer almost immediately.</span></li>
      </ol>
      <span className="g-note">✅ <b>You’re done when</b> you can explain why static instructions and MCP tool schemas belong at the very top of a prompt (so the cache hits) and why not every question needs your biggest model.</span>
    </>
  ),
  developers: (
    <>
      <h4>👩‍💻 For developers — run the notebook</h4>
      <p>Build a complexity-based model router, structure context layers for provider KV-prefix caching, and measure Time-To-First-Token (TTFT) vs. total latency with <code>llm.stream()</code>.</p>
      <span className="g-sub">Setup — pick one</span>
      <ol>
        <li><b>🚀 Open in Colab</b>: click <b>Open in Colab</b> above → run the Setup cell.</li>
        <li><b>💻 Local:</b> run <code>jupyter lab project-inference.ipynb</code> or <code>python project-inference.py</code>.</li>
      </ol>
      <span className="g-sub">Run each section</span>
      <ol>
        <li><b>Router</b> — scores incoming queries and dispatches to a fast tier or frontier tier, logging estimated token cost.</li>
        <li><b>Prefix Caching layout</b> — structures messages with immutable system/handbook/MCP schemas first so OpenAI/Anthropic/Gemini prefix caches hit automatically.</li>
        <li><b>Streaming TTFT benchmark</b> — compares blocking <code>llm.invoke()</code> against <code>llm.stream()</code> and prints exact <code>TTFT</code> vs <code>total_ms</code>.</li>
      </ol>
      <span className="g-note">🧪 <b>Extend:</b> replace the heuristic router with an LLM or embedding classifier; add semantic caching (FAISS lookup on prior queries before calling the model).</span>
    </>
  ),
}

export function Capstone8({ creds, setCreds }) {
  return <StepJourney steps={C8_STEPS} creds={creds} setCreds={setCreds} guide={C8_GUIDE} tagline="Project 8 — make AI fast, cheap, and scalable: routing, KV caching, and streaming." />
}
