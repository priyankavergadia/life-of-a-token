import React from 'react'
import { ArrowDoodle } from './Doodles.jsx'
import { Reveal, StepJourney } from './labkit.jsx'

const base = import.meta.env.BASE_URL
const img = (name) => `${base}greeting/${name}`

const AGENTS = [
  { name: 'Connie', role: 'Creative Director', emoji: '🎨', color: '#ff7ca8', blurb: 'Writes the witty, emotional greeting text and picks exactly 6 on-persona doodle categories.' },
  { name: 'Archie', role: 'Asset Librarian', emoji: '📚', color: '#2e9bd6', blurb: "Fetches real vector strokes from Google's Quick, Draw! dataset — and fails gracefully if one is missing." },
  { name: 'Layla', role: 'Layout Designer', emoji: '📐', color: '#8a5cf0', blurb: 'Places the doodles on a balanced grid, fiercely protecting the central text safe-zone.' },
  { name: 'Chris', role: 'Critique Agent', emoji: '🧐', color: '#f47b20', blurb: 'The quality boss. Rejects off-persona, unbalanced, or overflowing designs and routes feedback to whoever caused it.' },
  { name: 'Ren', role: 'Render Agent', emoji: '🖌️', color: '#15b3a4', blurb: 'Fuses the payload into the final Kawaii-marker SVG — pastel bleeds + crisp dark outlines.' },
]

const Pipe = ({ steps }) => (
  <div className="pipe">
    {steps.map((s, i) => (
      <React.Fragment key={i}>
        <Reveal d={i * 0.08}><div className="pipe-node"><div className="pipe-ic">{s.ic}</div><div className="pipe-t">{s.t}</div></div></Reveal>
        {i < steps.length - 1 && <span className="pipe-arrow"><ArrowDoodle /></span>}
      </React.Fragment>
    ))}
  </div>
)

function V_Overview() {
  return (
    <div>
      <Pipe steps={[{ ic: '🎨', t: 'Brainstorm' }, { ic: '📚', t: 'Fetch art' }, { ic: '📐', t: 'Lay out' }, { ic: '🧐', t: 'Critique' }, { ic: '🖌️', t: 'Render' }]} />
      <Reveal d={0.2}><img className="gc-img" src={img('ui_hero.png')} alt="Greeting card generator UI" /></Reveal>
      <div className="fade-key">Five specialized agents collaborate like a real design studio — and a <b>critique loop</b> keeps sending work back until the card is genuinely good.</div>
    </div>
  )
}

function V_Team() {
  return (
    <div>
      <div className="gc-roster">
        {AGENTS.map((a, i) => (
          <Reveal d={i * 0.08} key={a.name}>
            <div className="gc-agent" style={{ borderColor: a.color }}>
              <div className="gc-agent-ic" style={{ background: a.color }}>{a.emoji}</div>
              <div><div className="gc-agent-n">{a.name}</div><div className="gc-agent-r">{a.role}</div><div className="gc-agent-b">{a.blurb}</div></div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal d={0.4}><img className="gc-img" src={img('flow_diagram.png')} alt="Agent flow diagram" /></Reveal>
    </div>
  )
}

const REJECTIONS = [
  { who: 'Creative Director', why: '“As a baby, I don’t drink wine — I want toys!”', fix: 'off-persona items → rebrainstorm' },
  { who: 'Creative Director', why: 'Got 5 items, not 6', fix: 'unbalanced → output exactly 6' },
  { who: 'Creative Director', why: 'Text > 12 chars overflows the canvas', fix: 'too long → shorten it' },
  { who: 'Layout Designer', why: 'A doodle overlaps the text zone', fix: 'overlap → push to the borders' },
]
function V_Loop() {
  return (
    <div>
      <div className="gc-loop">
        <span className="gc-loop-node cool">Connie</span><span className="gc-loop-arrow">→</span>
        <span className="gc-loop-node cool">Archie</span><span className="gc-loop-arrow">→</span>
        <span className="gc-loop-node cool">Layla</span><span className="gc-loop-arrow">→</span>
        <span className="gc-loop-node hot">Chris 🧐</span>
        <span className="gc-loop-arrow">→ ✅ Ren</span>
      </div>
      <div className="gc-loop-back">↩︎ if Chris says “no”, feedback routes back to the agent who caused it — then the loop runs again (up to 6 times).</div>
      <div className="section-title" style={{ marginTop: 14 }}>What Chris rejects (and who gets the note)</div>
      {REJECTIONS.map((r, i) => (
        <Reveal d={i * 0.08} key={i}>
          <div className="gc-reject">
            <span className="gc-reject-x">❌</span>
            <div><b>{r.why}</b><div className="gc-reject-fix">→ back to <b>{r.who}</b>: {r.fix}</div></div>
          </div>
        </Reveal>
      ))}
      <div className="note analogy"><b>This is the key idea:</b> a self-correcting <i>critique loop</i> turns “generate once and hope” into “generate, judge, fix, repeat” — the heart of agentic systems.</div>
    </div>
  )
}

function V_Result() {
  return (
    <div>
      <Reveal><img className="gc-img" src={img('final_result.png')} alt="Final generated greeting card" /></Reveal>
      <div className="section-title" style={{ marginTop: 12 }}>How Ren makes it look hand-drawn</div>
      <ul className="gc-ul">
        <li><b>Real doodles:</b> vector strokes pulled live from Google’s Quick, Draw! dataset.</li>
        <li><b>Two-pass marker:</b> a soft pastel bleed under a crisp dark outline.</li>
        <li><b>Vector typography:</b> every letter is hand-drawn with SVG paths — no web fonts.</li>
        <li><b>Generative confetti:</b> stars, dots, and squiggles scattered around the safe-zone.</li>
      </ul>
      <div className="note"><b>Output is a real <code>.svg</code> file</b> — open the developer tab to generate your own in Colab.</div>
    </div>
  )
}

const GC_STEPS = [
  {
    id: 'o', tab: 'Overview', kicker: 'Final project', title: 'A studio of AI agents', file: 'pipeline.py', pose: 'wave', color: '#ff7ca8', Visual: V_Overview,
    code: `# A state-machine orchestrator runs the agents in a loop
while current_loop < max_loops:
    director = agents["Creative Director"].execute(...)  # Connie
    assets   = agents["Asset Librarian"].execute(...)    # Archie
    layout   = agents["Layout Designer"].execute(...)    # Layla
    verdict  = agents["Critique Agent"].execute(state)   # Chris
    if verdict["approved"]:
        break
    # else: route feedback to the blamed agent and loop again

return agents["Render Agent"].execute(state)             # Ren`,
    explain: <><p>This capstone turns “AI that writes text” into <b>AI that runs a workflow</b>. Five agents — a creative director, a librarian, a layout designer, a critic, and a renderer — collaborate to produce a finished greeting card.</p><div className="note">Built on the <b>Google Agent Development Kit (ADK)</b> pattern. The tutorial ships a self-contained mock so it runs anywhere.</div></>,
  },
  {
    id: 't', tab: 'The Team', kicker: 'Step 1 · Personas', title: 'Five specialists', file: 'agents.py', pose: 'point', color: '#2e9bd6', Visual: V_Team,
    code: `creative_director = Agent(
    name="Connie", role="Creative Director",
    instructions="Brainstorm witty, emotional text and pick exactly "
                 "6 on-persona Quick, Draw! categories...",
    model=llm_model)

critique_agent = Agent(
    name="Chris", role="Critique Agent",
    instructions="You are the aesthetic & quality boss. Reject anything "
                 "off-persona, unbalanced, or overflowing; route feedback...",
    model=llm_model)
# ...Archie (assets), Layla (layout), Ren (render)`,
    explain: <><p>Each agent is just a <b>name + role + instructions</b> (and optionally tools). Giving each a sharp persona is what makes the team behave like real collaborators.</p><div className="note"><b>Archie</b> and <b>Ren</b> also get <b>tools</b> — a Quick, Draw! fetcher and an SVG renderer.</div></>,
  },
  {
    id: 'l', tab: 'Critique Loop', kicker: 'Step 2 · Self-correction', title: 'Generate → judge → fix', file: 'critique.py', pose: 'think', color: '#f47b20', Visual: V_Loop,
    code: `# Chris evaluates the WHOLE state and routes feedback
if "baby" in prompt and "wine glass" in categories:
    return {"approved": False, "target": "Creative Director",
            "feedback": "Items too adult. Use baby-friendly toys."}
if len(categories) != 6:
    return {"approved": False, "target": "Creative Director",
            "feedback": "Output exactly 6 items for symmetry."}
if len(text) > 12:
    return {"approved": False, "target": "Creative Director",
            "feedback": "Text too long — shorten to under 12 chars."}
for item in layout_plan:
    if 250 < item["y"] < 450:
        return {"approved": False, "target": "Layout Designer",
                "feedback": "Overlap with text — push to the borders."}
return {"approved": True}`,
    explain: <><p>The critic doesn’t just say “bad” — it says <b>what’s wrong</b> and <b>who must fix it</b>. The orchestrator sends that feedback to the right agent and re-runs, up to 6 times.</p><div className="note"><b>Ask for a “baby” card</b> in the demo and you’ll watch Chris reject the wine glass, then approve the toys.</div></>,
  },
  {
    id: 'r', tab: 'The Result', kicker: 'Step 3 · Render', title: 'A hand-drawn masterpiece', file: 'render.py', pose: 'cheer', color: '#15b3a4', Visual: V_Result,
    code: `# Two-pass "marker" styling per stroke
# 1) soft pastel bleed
svg.append(f'<path d="{d}" stroke="{pastel}" stroke-width="25" '
           f'stroke-opacity="0.5" stroke-linecap="round"/>')
# 2) crisp dark outline on top
svg.append(f'<path d="{d}" stroke="#2d2d2d" stroke-width="10" '
           f'stroke-linecap="round"/>')`,
    explain: <><p><b>Ren</b> fuses the approved layout into a real <code>.svg</code> — pastel marker bleeds, crisp outlines, hand-drawn vector letters, and generative confetti — so it looks like an authentic Pinterest collage.</p><div className="note"><b>Make your own →</b> open the <i>For developers</i> tab and run it in Colab.</div></>,
  },
]

const GC_GUIDE = {
  files: { ipynb: 'greeting-card.ipynb', py: 'greeting-card.py' },
  everyone: (
    <>
      <h4>🙂 For everyone — meet a team of AI agents</h4>
      <p>This final project shows how several AIs can work together — like a design studio — to build a finished product. No key or code needed to explore it.</p>
      <span className="g-sub">Walk the steps</span>
      <ol>
        <li><b>Overview</b> — read how five agents (a director, librarian, layout designer, critic, renderer) form a pipeline.</li>
        <li><b>The Team</b> — read what each agent does. Notice each is just a <i>name + a job description</i>.</li>
        <li><b>Critique Loop</b> — this is the magic: <b>Chris</b> the critic checks the design and, if it’s wrong, sends specific feedback back to whoever caused it. The team tries again until it’s good.<span className="g-expect">Generate → judge → fix → repeat.</span></li>
        <li><b>The Result</b> — see the finished hand-drawn card and how it’s styled.</li>
      </ol>
      <span className="g-note">✅ <b>You’re done when</b> you can explain, in your own words, how 5 agents + a critique loop turn a request like <i>“a birthday card for a 1-year-old”</i> into a finished card. Want to make one yourself? Switch to <b>👩‍💻 For developers</b> and click <b>🚀 Open in Colab</b>.</span>
    </>
  ),
  developers: (
    <>
      <h4>👩‍💻 For developers — build the multi-agent system</h4>
      <p>A 5-agent <b>Google ADK</b>-style pipeline with a self-correcting critique loop that renders a Kawaii-marker SVG. Ships with a self-contained ADK mock so it runs anywhere.</p>
      <span className="g-sub">Setup — pick one</span>
      <ol>
        <li><b>🚀 Open in Colab</b> (zero setup): click <b>Open in Colab</b> above → run the cells top to bottom. No API key needed (the ADK is mocked; doodles come from a public dataset).</li>
        <li><b>💻 Local Python:</b>
          <ul>
            <li><code>python -m venv .venv &amp;&amp; source .venv/bin/activate</code></li>
            <li><code>pip install requests</code> (everything else is the standard library)</li>
            <li>Notebook: <code>jupyter lab greeting-card.ipynb</code> — or script: <code>python greeting-card.py</code></li>
          </ul>
        </li>
      </ol>
      <span className="g-sub">Run it, cell by cell</span>
      <ol>
        <li><b>Tools</b> — <code>fetch_quickdraw_asset()</code> pulls vector strokes from the Quick, Draw! GCS dataset; <code>render_svg_card()</code> draws the two-pass marker SVG.</li>
        <li><b>Agents + Orchestrator</b> — five <code>Agent</code>s and a state-machine <code>Orchestrator</code> (real <code>google_adk</code> imports with a mock fallback).</li>
        <li><b>Run</b> — set <code>user_request</code> (try <i>“a birthday card for a 1-year-old baby!”</i> to trigger the loop) and call <code>pipeline.run(...)</code>.<span className="g-expect">Watch the terminal loop through critique cycles, then write final_adk_card.svg.</span></li>
        <li><b>Display</b> — the last cell renders the SVG inline.</li>
      </ol>
      <span className="g-note">🧪 <b>Extend:</b> change <code>user_request</code>; tweak Chris’s critique rules; add a 6th agent; or swap the mock for the real ADK (<code>from google_adk.core import Agent, Orchestrator</code> + <code>VertexGeminiModel</code>).</span>
    </>
  ),
}

export default function GreetingCards({ creds, setCreds }) {
  return <StepJourney steps={GC_STEPS} creds={creds} setCreds={setCreds} guide={GC_GUIDE} tagline="Final project — five AI agents design, critique, and render a hand-drawn greeting card." />
}
