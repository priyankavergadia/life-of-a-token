import React, { useState } from 'react'
import { StickFigure, Squiggle } from './Doodles.jsx'

/* ============================================================
   Content (from the "Vibe Code Your Business Idea" app-build assignment)
   ============================================================ */
const PHASES = [
  {
    n: 1, title: 'Discovery', time: '8 min', q: 'What problem are we solving?', color: '#2e9bd6',
    items: [
      'State the problem in ONE sentence (a real pain, not a nice-to-have).',
      'Who is the user? (internal team or customers?)',
      'What do they do today? (spreadsheets / email / manual work)',
      'What does success look like? (the tool actually gets used)',
      'Apply the "must-have" vs "add-later" filter — scope ruthlessly.',
    ],
  },
  {
    n: 2, title: 'Planning', time: '12 min', q: 'What exactly will we build?', color: '#8a5cf0',
    items: [
      'Name + a 1-line description (your "app-store pitch").',
      'Define the data model: what goes in and what comes out?',
      'List ALL screens/pages — aim for 3–5 for the MVP.',
      'Decide on authentication (sign-up? roles? permissions?).',
      'Identify integrations (email / database / external APIs).',
      'Choose a complexity level: Simple / Medium / Ambitious.',
    ],
  },
  {
    n: 3, title: 'Prompt Architecture', time: '10 min', q: 'How will we build it?', color: '#0e9a8c',
    items: [
      'Write the MASTER PROMPT (use the template below).',
      'Break the build into buildable stages (first, second, third).',
      'Define edge cases — "what if the user does X?"',
      'List test cases to run after each stage.',
    ],
  },
  {
    n: 4, title: 'Polish Criteria', time: '5 min', q: 'What makes this feel finished?', color: '#f47b20',
    items: [
      'Define "done": would you be proud to show a real user?',
      'Identify the 3 most likely failure points (errors / edge cases).',
      'Decide on mobile responsiveness / device support.',
    ],
  },
  {
    n: 5, title: 'Handoff Plan', time: '5 min', q: 'How do real users access it?', color: '#15b3a4',
    items: [
      'Where will it be deployed? (Codex, Google, Claude, Vercel, Replit, Bubble, Glide…)',
      'Write a 1-page user guide (inputs, outputs, getting started).',
      'What would version 2 add? (list 3 ideas, then set them aside).',
    ],
  },
]

const MASTER_PROMPT = `MASTER BUILD PROMPT

I want to build [app name] — a web application that
[one-sentence description].

THE PROBLEM: [business problem in plain English]
USERS: [who will use this, and their technical level]

CORE FEATURES (MVP only):
  1. [feature 1]
  2. [feature 2]
  3. [feature 3]

DATA MODEL:
  - Users table: [fields]
  - [main entity] table: [fields]

AUTHENTICATION: [email/password, Google SSO, roles]
SCREENS: [list each screen]

TREAT ME AS THE PRODUCT OWNER:
  - Explain what you are doing as you go
  - Stop and check in at the end of each stage
  - Tell me the options whenever there is a trade-off`

const PART1_DELIVERABLES = [
  { n: '01', icon: '📝', title: 'Project Brief', color: '#2e9bd6', d: 'App name, one-line pitch, business problem, target user, success metric. Max 200 words (a Google Doc shared with the instructor).' },
  { n: '02', icon: '📋', title: 'Product Spec', color: '#8a5cf0', d: 'Complete data model, screen list, auth design, complexity level, integrations needed. Table or structured list.' },
  { n: '03', icon: '🗂️', title: 'Build Prompt Pack', color: '#f47b20', d: 'Completed Master Prompt + at least 3 stage prompts (scaffold → features → auth/data). Show your prompt-iteration thinking.' },
  { n: '04', icon: '✅', title: 'Risk & Test Plan', color: '#15b3a4', d: '3 most likely failure points, 5 test cases, and 1 contingency if things break. Bullet list.' },
]

const MUST_BUILD = [
  { t: 'Clear business solution', d: 'AI applied to a crisp problem with a measurable metric.' },
  { t: 'Flawless MVP', d: 'Core features only — no crashes, well-planned.' },
  { t: 'Real auth & data', d: 'A fully functioning flow with an isolated database.' },
  { t: 'Polished UX', d: 'Clean UI and error handling — not a raw prototype.' },
  { t: 'Strategic AI prompting', d: 'Structured, staged prompts (not one giant prompt).' },
  { t: 'Comprehensive user guide', d: '1 page, assumes no prior knowledge.' },
  { t: 'Confident live demo', d: 'Full user journey on real data — nothing pre-recorded.' },
]

const RUBRIC = [
  { group: 'PLAN', pts: 30, color: '#fde2e2', rows: [['Problem Clarity', 10, 'Crisp problem, measurable'], ['Product Spec', 10, 'Complete spec, strategic scoping'], ['Prompt Engineering', 10, 'Specific, staged, edge-case thinking']] },
  { group: 'BUILD', pts: 35, color: '#fdf0c8', rows: [['Functionality', 15, 'All MVP features work'], ['Auth & Database', 10, 'Full auth flow, data persists'], ['Polish & UX', 10, 'Error handling, clean UI']] },
  { group: 'PRESENT', pts: 30, color: '#d9f2df', rows: [['Demo Quality', 10, 'Confident live demo'], ['Responsible AI', 5, 'Real, actual data'], ['Business Narrative', 5, 'Compelling story, clear value'], ['Reflection & Learnings', 5, 'Honest, iterative process']] },
  { group: 'PEER', pts: 5, color: '#fde2e2', rows: [['Peer Evaluation', 5, 'Thoughtful, specific']] },
]

const TIPS = [
  { kind: '⚠️ Mistake', t: 'Building too much', d: 'Focus on 3–4 core features. Everything else goes on the "add-later" list.' },
  { kind: '⏱️ Time-saver', t: 'Stage your prompts', d: 'Build the scaffold first, then auth, then features. One stage at a time.' },
  { kind: '⭐ Differentiator', t: 'Real users, real data', d: 'Live, real data in the demo proves the thing actually works.' },
]

const BEST_PRACTICES = [
  'Scope ruthlessly — “must-have” vs “add-later” is your most important filter.',
  'Treat the AI as your engineer: tell it to explain, check in each stage, and surface options.',
  'Never one giant prompt — stage it: scaffold → auth → features → polish.',
  'Write edge cases and test cases up front, and re-run tests after every stage.',
  'Use real data early; it exposes bugs a happy-path demo hides.',
  'Write the 1-page user guide as you build, not the night before.',
  'Deploy early and often, so “it works on my machine” never becomes a demo-day surprise.',
]

/* ============================================================
   Small UI bits
   ============================================================ */
function CopyBox({ text, label = '📋 Master Prompt Template — copy & complete' }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    try { navigator.clipboard?.writeText(text) } catch (e) { /* ignore */ }
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="vc-copy">
      <div className="vc-copy-bar">
        <span>{label}</span>
        <button onClick={copy}>{copied ? '✓ copied' : '⧉ copy'}</button>
      </div>
      <pre>{text}</pre>
    </div>
  )
}

const SectionHead = ({ kicker, title, pose, color }) => (
  <div className="vc-sechead">
    <StickFigure pose={pose} color={color} size={62} />
    <div>
      <div className="kicker">{kicker}</div>
      <h2>{title}</h2>
      <div style={{ marginTop: 4 }}><Squiggle width={160} color={color} /></div>
    </div>
  </div>
)

/* ============================================================
   Section 1 — Prompt Development (Plan & Design)
   ============================================================ */
function PromptDevelopment() {
  return (
    <div className="vc-section">
      <SectionHead kicker="Section 1 · Part 1 — Plan & Design (in-class, 30–45 min)" title="Prompt Development" pose="think" color="#8a5cf0" />
      <p className="vc-lead">Before you write a line of code, architect the vision. A great build starts
        with a great <b>plan</b> and a great <b>prompt</b>. Work the five phases in order, then assemble your submission.</p>

      <h3 className="vc-h3">📐 Phase-by-phase guide</h3>
      <div className="vc-phases">
        {PHASES.map((p) => (
          <div className="vc-phase" key={p.n} style={{ borderColor: p.color, boxShadow: `4px 5px 0 ${p.color}33` }}>
            <div className="vc-phase-top">
              <span className="vc-phase-n" style={{ background: p.color }}>{p.n}</span>
              <div>
                <div className="vc-phase-title">{p.title}</div>
                <div className="vc-phase-q">{p.q}</div>
              </div>
              <span className="vc-phase-time" style={{ color: p.color, borderColor: p.color }}>{p.time}</span>
            </div>
            <ul>{p.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
          </div>
        ))}
      </div>

      <h3 className="vc-h3">🧱 The Master Prompt</h3>
      <CopyBox text={MASTER_PROMPT} />

      <h3 className="vc-h3">📦 Part 1 submission</h3>
      <div className="vc-deliv">
        {PART1_DELIVERABLES.map((d) => (
          <div className="vc-deliv-card" key={d.n} style={{ borderColor: d.color }}>
            <div className="vc-deliv-n" style={{ color: d.color }}>{d.icon} {d.n}</div>
            <div className="vc-deliv-title">{d.title}</div>
            <div className="vc-deliv-d">{d.d}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   Section 2 — Project Creation (Build & Ship)
   ============================================================ */
function ProjectCreation() {
  return (
    <div className="vc-section">
      <SectionHead kicker="Section 2 · Part 2 — Build & Ship the real product" title="Project Creation" pose="cheer" color="#f47b20" />
      <p className="vc-lead">Now turn the plan into a <b>live, deployed app</b>. Aim for <b>excellent</b>: a real
        solution, real auth, real data, and a confident live demo.</p>

      <h3 className="vc-h3">🎯 What you must build</h3>
      <div className="vc-must">
        {MUST_BUILD.map((m, i) => (
          <div className="vc-must-row" key={i}><span className="vc-must-check">✓</span><div><b>{m.t}</b> — {m.d}</div></div>
        ))}
      </div>

      <div className="vc-two">
        <div>
          <h3 className="vc-h3">🛠️ Recommended tool stacks & tips</h3>
          <ul className="vc-ul">
            <li><b>Codex, Claude, Gemini</b> — drive them with your Master Prompt.</li>
            <li><b>Build in stages</b> and iterate — scaffold → auth → features → polish.</li>
            <li>Use AI to generate <b>test data</b> and your <b>user guide</b>.</li>
          </ul>
        </div>
        <div>
          <h3 className="vc-h3">🎤 Final deliverable & presentation</h3>
          <ul className="vc-ul">
            <li><b>Live app URL</b> (working at the time of presentation).</li>
            <li><b>Presentation</b> — first slide shows the user guide + sample inputs/outputs.</li>
            <li>Map your demo to the <b>rubric points</b>.</li>
            <li><b>8 min</b> group presentation + <b>4 min</b> Q&amp;A.</li>
          </ul>
        </div>
      </div>

      <h3 className="vc-h3">📊 Assessment rubric (100 pts)</h3>
      <div className="vc-rubric">
        {RUBRIC.map((g) => (
          <div className="vc-rgrp" key={g.group}>
            <div className="vc-rgrp-head" style={{ background: g.color }}><b>{g.group}</b><span>{g.pts} pts</span></div>
            {g.rows.map((r) => (
              <div className="vc-rrow" key={r[0]}>
                <div className="vc-rname">{r[0]} <span>{r[2]}</span></div>
                <div className="vc-rpts">{r[1]}</div>
              </div>
            ))}
          </div>
        ))}
        <div className="vc-rtotal"><div className="vc-rname"><b>Total</b></div><div className="vc-rpts"><b>100</b></div></div>
      </div>

      <h3 className="vc-h3">💡 Instructor tips & common mistakes</h3>
      <div className="vc-tips">
        {TIPS.map((t, i) => (
          <div className="vc-tip" key={i}><div className="vc-tip-k">{t.kind}</div><div className="vc-tip-t">{t.t}</div><div className="vc-tip-d">{t.d}</div></div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   Loop Engineering (for developers)
   Inspired by Cobus Greyling's "Loop Engineering" — design loops that prompt
   your agents, instead of prompting agents by hand.
   ============================================================ */
const LOOP_ANATOMY = ['⏱ Schedule', '👁 Triage', '📋 State', '🌲 Worktree', '⚙️ Implement', '✓ Verify', '🔗 PR / MCP', '🧑 Human gate']
const LOOP_PRIMS = [
  { t: 'Scheduling', d: 'Triggers via cron, automations, or a manual /loop command.' },
  { t: 'Worktrees', d: 'Parallel runs in isolated git worktrees — no collisions.' },
  { t: 'Skills', d: 'Reusable intents: triage, implement, verify, release.' },
  { t: 'Connectors', d: 'MCP access to external tools (issues, CI, docs).' },
  { t: 'Sub-agents', d: 'Maker/checker — one writes, another independently verifies.' },
  { t: 'State', d: 'Durable memory outside the model (a STATE.md the loop reads/writes).' },
]
const LOOP_PATTERNS = [
  ['Daily Triage', '1–2 days', 'Morning scan of CI, issues, recent commits'],
  ['PR Babysitter', '5–15 min', 'Shepherd PRs through review → merge'],
  ['CI Sweeper', '5–15 min', 'React to failing checks; classify flakes'],
  ['Post-Merge Cleanup', '6h–1 day', 'TODOs, deprecations, small tech debt'],
  ['Dependency Sweeper', '6h–1 day', 'Patch CVEs and stale dependencies'],
  ['Issue Triage', '2h–1 day', 'Dedupe, score, and label incoming issues'],
  ['Changelog Drafter', 'per tag', 'Draft release notes from merged work'],
]
const LOOP_PRACTICES = [
  { kind: '📈 Readiness', t: 'Score before you automate', d: 'Rate the repo L0–L3 (tests, CI, docs). Don’t hand a loop work it can’t verify.' },
  { kind: '👀 Report-only', t: 'Observe for a week', d: 'Run the loop in “suggest, don’t act” mode first; read its logs before giving it write access.' },
  { kind: '🛡️ Guardrails', t: 'Gate the risky bits', d: 'Human-approval gates, path denylists, least-privilege MCP, daily token/spawn budgets.' },
  { kind: '🧯 Failure modes', t: 'Plan for them', d: 'Catalog infinite loops, token burn, and “verifier theater” (a checker that always passes).' },
]
// The hands-on exercise: build a Daily Triage loop, one primitive per step.
const LOOP_PROJECT_STEPS = [
  { n: 1, title: 'Define the loop (scope)', teaches: 'A loop does ONE thing.', do: 'Write one sentence: the loop’s single job + its “done-for-the-day” criteria.', check: 'You can state the job and when it stops in one line.' },
  { n: 2, title: 'Schedule the trigger', teaches: 'Scheduling — design once, run continuously.', do: 'Wire a trigger: cron 0 9 * * 1-5, your agent’s /loop 1d, or a CI job. Fire it once.', check: 'It starts on its own — nobody types a prompt.' },
  { n: 3, title: 'Write the Triage step', teaches: 'Loops discover their own work.', do: 'Define what to scan (issues, failing CI, new commits, fresh TODOs) and how to rank it.', check: 'A run prints a ranked list of candidate items.' },
  { n: 4, title: 'Add State', teaches: 'Durable memory outside the model.', do: 'Create STATE.md; record the timestamp + IDs you reported. Skip them next run.', check: 'Running twice does NOT re-report the same items.' },
  { n: 5, title: 'Package a Skill', teaches: 'Reusable intents, not one-off prompts.', do: 'Move the triage prompt into triage.md your agent invokes by name.', check: 'You run it by referencing the skill, not pasting text.' },
  { n: 6, title: 'Implement — report-only', teaches: 'The report-only phase.', do: 'Produce briefing-<date>.md. No code changes, no posting yet.', check: 'A dated briefing file is generated each run.' },
  { n: 7, title: 'Verify (maker/checker)', teaches: 'Sub-agents — beat “verifier theater”.', do: 'Add a second pass that rejects duplicates / unverifiable items / bad priority.', check: 'A deliberately wrong item gets caught and dropped.' },
  { n: 8, title: 'Connect + Human gate', teaches: 'Connectors + safety.', do: 'Post via MCP (Slack / PR comment) behind your approval; add least-privilege token + token budget.', check: 'Nothing leaves the loop without your ok.' },
  { n: 9, title: 'Run a week, then graduate', teaches: 'Worktrees + staged escalation.', do: 'After ~5 report-only days, add ONE write action (e.g. auto-label issues) in a git worktree, still gated.', check: 'The loop now acts — safely — for its one job.' },
]
const LOOP_DEF_TEMPLATE = `# Loop: Daily Triage
Job (one sentence): Scan this repo each weekday morning and post a prioritized
  briefing of what needs attention. REPORT-ONLY.
Trigger: cron "0 9 * * 1-5"
Inputs: open issues, failing CI, commits since last run, new TODO/FIXME
Output: briefing-<date>.md  (posted to #eng-triage AFTER human approval)
Done-for-the-day: one accurate, de-duplicated briefing exists; nothing posted
  without approval.
Guardrails: read-only token; never edit code; max 50k tokens/run; human gate.`
const LOOP_STATE_TEMPLATE = `# Loop State — Daily Triage
last_run: 2026-01-01T09:00:00Z
reported_ids:
  - issue#142
  - ci#run-8891
  - todo:src/app.py:88
notes: |
  Anything the next run should know (open threads, deferred items).`
function LoopEngineering() {
  const base = import.meta.env.BASE_URL
  return (
    <div className="vc-bp" style={{ background: 'linear-gradient(180deg,#f1ecfb,#e7defb)' }}>
      <h3 className="vc-h3" style={{ marginTop: 0 }}>🔁 Loop Engineering — a hands-on project (for developers)</h3>
      <p className="vc-lead" style={{ marginTop: 0 }}>“You shouldn’t be prompting coding agents anymore — you should be <b>designing loops that prompt your agents</b>.”
        You’ll learn this by <b>building one</b>: take a simple use case and run it through <i>every</i> loop primitive.</p>

      <div className="vs-stage" style={{ marginBottom: 14 }}>
        <div className="g-sub" style={{ marginTop: 0, color: '#7a4fd0' }}>🎯 The project — “The Daily Triage Loop”</div>
        <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          Every weekday morning, an agent scans <i>your</i> repo (new issues, failing CI, fresh commits & TODOs)
          and posts a short <b>prioritized briefing</b>. It’s the lowest-risk pattern — it <b>reports, it doesn’t change code</b> —
          so you can learn the whole anatomy safely. <b>Golden rule: start report-only;</b> the loop earns write access later.
        </p>
      </div>

      <span className="g-sub" style={{ color: '#7a4fd0' }}>Anatomy you’ll build</span>
      <div className="vs-flow">
        {LOOP_ANATOMY.map((s, i) => (
          <React.Fragment key={i}>
            <span className="vs-chip cool">{s}</span>
            {i < LOOP_ANATOMY.length - 1 && <span className="vs-arrow">→</span>}
          </React.Fragment>
        ))}
      </div>

      <span className="g-sub" style={{ color: '#7a4fd0' }}>🧪 The exercise — do these in order (each teaches one primitive)</span>
      <div className="le-steps">
        {LOOP_PROJECT_STEPS.map((s) => (
          <div className="le-step" key={s.n}>
            <div className="le-step-top"><span className="le-step-n">{s.n}</span><span className="le-step-t">{s.title}</span><span className="le-step-teach">{s.teaches}</span></div>
            <div className="le-step-do"><b>Do:</b> {s.do}</div>
            <div className="le-step-check">✅ {s.check}</div>
          </div>
        ))}
      </div>

      <span className="g-sub" style={{ color: '#7a4fd0' }}>Starter templates (copy &amp; fill)</span>
      <CopyBox label="📄 loop.md — define the loop" text={LOOP_DEF_TEMPLATE} />
      <div style={{ height: 10 }} />
      <CopyBox label="🧠 STATE.md — durable memory" text={LOOP_STATE_TEMPLATE} />
      <div className="run-row" style={{ marginTop: 12 }}>
        <a className="lab-run" href={`${base}labs/loop-engineering-starter.md`} download style={{ textDecoration: 'none' }}>📥 Download the full starter pack (.md)</a>
      </div>

      <details style={{ marginTop: 16 }}>
        <summary className="g-sub" style={{ cursor: 'pointer', color: '#7a4fd0' }}>📚 Reference — building blocks, patterns &amp; practices</summary>
        <span className="g-sub" style={{ color: '#7a4fd0' }}>The six building blocks</span>
        <div className="vc-must">
          {LOOP_PRIMS.map((p, i) => <div className="vc-must-row" key={i}><span className="vc-must-check">▸</span><div><b>{p.t}</b> — {p.d}</div></div>)}
        </div>
        <span className="g-sub" style={{ color: '#7a4fd0' }}>Production loop patterns (swap the use case)</span>
        <div className="matrix">
          <div className="mx-head"><div /><div className="mx-c">Cadence</div><div className="mx-c">What it does</div></div>
          {LOOP_PATTERNS.map((r, i) => <div className="mx-row" key={i}><div className="mx-dim">{r[0]}</div><div className="mx-c">{r[1]}</div><div className="mx-c">{r[2]}</div></div>)}
        </div>
        <span className="g-sub" style={{ color: '#7a4fd0' }}>Engineering practices</span>
        <div className="vc-tips">
          {LOOP_PRACTICES.map((t, i) => <div className="vc-tip" key={i} style={{ background: '#faf7ff' }}><div className="vc-tip-k" style={{ color: '#7a4fd0' }}>{t.kind}</div><div className="vc-tip-t">{t.t}</div><div className="vc-tip-d">{t.d}</div></div>)}
        </div>
      </details>

      <div className="note" style={{ marginTop: 14 }}>🎓 <b>You’ve learned loop engineering when</b> you can take any repetitive task and express it as schedule → triage → state → implement → verify → connect → human gate — starting report-only and escalating behind gates. Inspired by <a href="https://cobusgreyling.github.io/loop-engineering/#interactive" target="_blank" rel="noreferrer">Cobus Greyling’s “Loop Engineering”</a>.</div>
    </div>
  )
}

/* ============================================================
   Page
   ============================================================ */
export default function VibeCoding() {
  const [sec, setSec] = useState('prompt')
  return (
    <>
      <div className="vc-hero">
        <div className="mascot">
          <StickFigure pose="wave" color="#ffc02e" size={74} />
          <div>
            <div className="kicker">Vibe Code Your Business Idea</div>
            <h1>Vibe Coding with Best Practices</h1>
            <p>Plan it like a product owner, prompt it in stages, and ship a real, live app.</p>
          </div>
        </div>
      </div>

      <div className="vc-secnav">
        <button className={sec === 'prompt' ? 'on' : ''} onClick={() => setSec('prompt')}>
          <span className="vc-secnav-n">1</span> Prompt Development<small>Plan &amp; Design</small>
        </button>
        <button className={sec === 'build' ? 'on' : ''} onClick={() => setSec('build')}>
          <span className="vc-secnav-n">2</span> Project Creation<small>Build &amp; Ship</small>
        </button>
      </div>

      {sec === 'prompt' ? <PromptDevelopment /> : <ProjectCreation />}

      {sec === 'build' && <LoopEngineering />}

      <div className="vc-bp">
        <h3 className="vc-h3">✨ Best practices (carry these through both sections)</h3>
        <ul className="vc-ul">{BEST_PRACTICES.map((b, i) => <li key={i}>{b}</li>)}</ul>
      </div>
    </>
  )
}
