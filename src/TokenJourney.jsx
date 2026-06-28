import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { buildPipeline } from './engine.js'
import {
  IntroView, TokenFlow, VectorList, EmbeddingMap, PositionalWave,
  AttentionView, FFNView, LayersView, OutputView,
} from './components.jsx'
import { StickFigure, Squiggle } from './Doodles.jsx'
import { GuidePanel } from './labkit.jsx'

const TOKEN_GUIDE = {
  files: { ipynb: 'life-of-a-token.ipynb', py: 'life-of-a-token.py' },
  everyone: (
    <>
      <h4>🙂 For everyone — a guided walk (no key, no code)</h4>
      <p>This tab shows, step by step, what happens inside an AI the moment it reads your words. Follow along in order — it takes about 5 minutes.</p>
      <span className="g-sub">Set it up</span>
      <ol>
        <li>In the <b>“Your query to Claude”</b> box at the very top, type a short prompt — e.g. <i>“Why is the sky blue?”</i> (or click one of the grey <b>try:</b> chips).</li>
        <li>Click <b>Trace it ↦</b>.<span className="g-expect">Every chart below now rebuilds from <i>your</i> exact words.</span></li>
        <li>Move between steps with the numbered tabs, the <b>← Back / Next →</b> buttons, or your keyboard <b>← / →</b> keys.</li>
      </ol>
      <span className="g-sub">Walk the 9 steps</span>
      <ol>
        <li><b>Start</b> — read the intro. Mental model: an AI is an <i>assembly line</i> that transforms your words a little at each station.</li>
        <li><b>Tokenize</b> — see your sentence chopped into <b>tokens</b>. Notice long/rare words split into pieces and spaces attach to words. Each token has an ID number.</li>
        <li><b>Embed</b> — each token becomes a row of bars (its <b>vector</b>).<span className="g-expect">Words with similar meaning have similar bar patterns.</span></li>
        <li><b>Meaning map</b> — hover the dots. Closer dots = more similar meaning. This is the key idea: <b>meaning becomes position</b>.</li>
        <li><b>Position</b> — see a wave “fingerprint” added to each token so the model knows word order (“dog bites man” ≠ “man bites dog”).</li>
        <li><b>Attention</b> — read the grid: each word decides how much to “look at” the others. Click the <b>head</b> buttons to see different focus patterns. The blank top-right triangle means a word can only look <i>backward</i>.</li>
        <li><b>Feed-forward</b> — each word is processed on its own. This is where most learned <b>facts</b> live.</li>
        <li><b>Stack ×N</b> — watch the numbers flow through the block again and again. <b>Depth</b> is where capability comes from.</li>
        <li><b>Predict</b> — the model scores every possible next word and turns it into <b>percentages</b>. It picks one, adds it, and runs the whole pipeline again — one word at a time.</li>
      </ol>
      <span className="g-note">✅ <b>You’re done when</b> you can explain the path in your own words: text → tokens → vectors → +position → attention → feed-forward → repeat → next word. Try a very different prompt and watch every visual change.</span>
    </>
  ),
  developers: (
    <>
      <h4>👩‍💻 For developers — run the same journey in code</h4>
      <p>Reproduce every step on a real open model (GPT-2) with 🤗 <code>transformers</code>. Each step is a tiny function you can poke at.</p>
      <span className="g-sub">Setup — pick one</span>
      <ol>
        <li><b>🚀 Open in Colab</b> (zero setup): click <b>Open in Colab</b> above → run the first cell (<code>%pip install …</code>) → run the rest. No API key needed (GPT-2 downloads from Hugging Face).</li>
        <li><b>💻 Local Python:</b>
          <ul>
            <li><code>python -m venv .venv &amp;&amp; source .venv/bin/activate</code> (Windows: <code>.venv\Scripts\activate</code>)</li>
            <li><code>pip install transformers torch tiktoken numpy</code></li>
            <li>Notebook: <code>pip install jupyterlab &amp;&amp; jupyter lab life-of-a-token.ipynb</code> — or script: <code>python life-of-a-token.py</code></li>
          </ul>
        </li>
      </ol>
      <span className="g-sub">Run it, cell by cell</span>
      <ol>
        <li><b>Load:</b> <code>GPT2LMHeadModel.from_pretrained("gpt2", output_attentions=True, output_hidden_states=True)</code> + the tokenizer. Set <code>TEXT</code> to your prompt.</li>
        <li><b>Tokenize:</b> <code>tokenize(text)</code> returns ids + decoded pieces.<span className="g-expect">Prints each token with its ID.</span></li>
        <li><b>Embed:</b> <code>model.transformer.wte(ids)</code> → vectors; <code>cosine()</code> compares two tokens (~0.8 for related, ~0.1 for unrelated).</li>
        <li><b>Position:</b> <code>model.transformer.wpe(positions)</code>; add it to the token embeddings — order is now encoded.</li>
        <li><b>Attention:</b> <code>out.attentions[layer][0, head]</code> prints a matrix; the upper-right ≈ 0 is the causal mask.</li>
        <li><b>Stack:</b> <code>out.hidden_states</code> (n_layers+1 tensors); the printed “drift” shows how the last token’s vector evolves with depth.</li>
        <li><b>Predict:</b> <code>softmax(out.logits[0,-1])</code> + <code>topk</code> for the next-token probabilities; <code>model.generate(...)</code> for a greedy continuation.</li>
      </ol>
      <span className="g-note">🧪 <b>Experiment:</b> change <code>TEXT</code> and re-run; print a different layer/head; swap <code>"gpt2"</code> for <code>"distilgpt2"</code> for a faster run.</span>
    </>
  ),
}

// which pose the little guide strikes on each step
const POSES = ['wave', 'point', 'think', 'point', 'think', 'cheer', 'think', 'cheer', 'cheer']
const POSE_COLORS = ['#ffc02e', '#f47b20', '#15b3a4', '#2e9bd6', '#8a5cf0', '#f47b20', '#15b3a4', '#ffc02e', '#f2553d']

const STEPS = [
  {
    id: 'intro', tab: 'Start', kicker: 'The journey',
    title: 'The life of a token',
    body: (
      <>
        <p>This is what happens <b>under the hood</b> when you send a message to an LLM like Claude. No magic, no database lookup — just numbers flowing through the same handful of operations, repeated at enormous scale.</p>
        <p>Use the steps at the top, or the arrows below, to follow your words from raw text all the way to a predicted next word.</p>
        <div className="note analogy"><b>Mental model:</b> think of it as an assembly line. Each station transforms the words a little more, and information flows forward until a confident answer pops out the end.</div>
      </>
    ),
  },
  {
    id: 'tokens', tab: 'Tokenize', kicker: 'Step 1 · Tokenization',
    title: 'Words become tokens',
    body: (
      <>
        <p>The model can’t read letters. First it chops your text into <b>tokens</b> — common words stay whole, but rare or long words shatter into pieces (and a space usually rides along at the front).</p>
        <p>Each token maps to a number, its <b>ID</b> — a row in a giant lookup table of ~100,000 possible tokens. From here on, your sentence is just a list of these IDs.</p>
        <div className="note"><b>Why split words?</b> A fixed vocabulary can’t hold every word ever. Sub-word pieces let the model spell out anything — even words it has never seen — by combining parts.</div>
      </>
    ),
  },
  {
    id: 'embed', tab: 'Embed', kicker: 'Step 2 · Embeddings',
    title: 'Tokens become vectors',
    body: (
      <>
        <p>Each token ID is swapped for a long list of numbers — its <b>embedding vector</b> (thousands of dimensions in real models). This vector is the token’s <b>meaning</b>, learned from reading the internet.</p>
        <p>The bars show 8 of those numbers. The key idea: words that mean similar things get similar vectors. That’s not hand-coded — it falls out of training.</p>
        <div className="note analogy"><b>Analogy:</b> an embedding is like GPS coordinates for meaning. “king” and “queen” live in the same neighborhood; “banana” is across town.</div>
      </>
    ),
  },
  {
    id: 'map', tab: 'Meaning map', kicker: 'Step 2½ · See the meaning',
    title: 'Where the words land',
    body: (
      <>
        <p>Those thousand-dimension vectors are impossible to picture, so here they’re squashed down to a <b>2D map</b>. Each dot is one of your tokens; the glowing zones are regions of related meaning.</p>
        <p>Hover any dot. Notice how words about the sky drift together, animals cluster elsewhere, and little glue-words (the, of, on) pool in their own corner — purely from how they’re used.</p>
        <div className="note"><b>This is the “aha”:</b> meaning becomes geometry. “Close together” literally means “similar.” Attention, coming next, exploits exactly this.</div>
      </>
    ),
  },
  {
    id: 'pos', tab: 'Position', kicker: 'Step 3 · Positional encoding',
    title: 'Adding a sense of order',
    body: (
      <>
        <p>Here’s a twist: the transformer looks at <b>every token at once</b>, not left-to-right. Fast — but it would have no idea which word came first.</p>
        <p>So each position gets a unique <b>fingerprint</b> made of sine and cosine waves, added right into the vector. Now “dog bites man” and “man bites dog” are no longer the same.</p>
        <div className="note analogy"><b>Analogy:</b> like numbering seats in a theater. The people (meanings) are the same, but now everyone knows exactly where they’re sitting.</div>
      </>
    ),
  },
  {
    id: 'attn', tab: 'Attention', kicker: 'Step 4 · Self-attention',
    title: 'Words look at each other',
    body: (
      <>
        <p>This is the heart of the transformer. Every token asks a question (its <b>Query</b>) and every token offers an answer (its <b>Key</b>). Strong matches let one word pull in <b>information</b> (the <b>Value</b>) from another.</p>
        <p>So “it” can find what it refers to; “blue” can reach back to “sky”. The grid shows who’s paying attention to whom. Multiple <b>heads</b> run in parallel, each specializing — switch heads to watch their different obsessions.</p>
        <div className="note"><b>Causal mask:</b> when predicting the next word, a token may only look at words <b>before</b> it — never the future. That’s the blank upper-right triangle.</div>
      </>
    ),
  },
  {
    id: 'ffn', tab: 'Feed-forward', kicker: 'Step 5 · Feed-forward network',
    title: 'Each word thinks for itself',
    body: (
      <>
        <p>After attention mixes information <i>between</i> words, every token is sent solo through a small neural network — the <b>feed-forward network</b>. It widens the vector ~4×, lights up the neurons that recognize a pattern, then shrinks it back.</p>
        <p>This is where most of the model’s <b>factual knowledge</b> is stored. Think of attention as “gather context” and feed-forward as “process it”.</p>
        <div className="note analogy"><b>Analogy:</b> attention is the group conversation; the feed-forward step is each person going off to think privately about what they just heard.</div>
      </>
    ),
  },
  {
    id: 'layers', tab: 'Stack ×N', kicker: 'Step 6 · Stacking layers',
    title: 'Do it again. And again.',
    body: (
      <>
        <p>Attention + feed-forward together make one <b>block</b>. Then the whole thing repeats — dozens of times. The output of one block is the input to the next.</p>
        <p>Early blocks pick up grammar and simple links. Deeper blocks assemble meaning, tone, intent, and the beginnings of reasoning. <b>Depth</b> is where capability comes from.</p>
        <div className="note"><b>Residual connections:</b> each block <i>adds</i> to the running representation instead of replacing it — so nothing important gets lost on the way up.</div>
      </>
    ),
  },
  {
    id: 'output', tab: 'Predict', kicker: 'Step 7 · The prediction',
    title: 'Out comes the next word',
    body: (
      <>
        <p>After the final block, the last token’s vector is matched against the entire vocabulary, scoring every possible next word. <b>Softmax</b> turns those raw scores into probabilities that sum to 100%.</p>
        <p>The model picks one (usually the top, with a dash of randomness), <b>appends it</b>, and runs the <i>entire</i> pipeline again to choose the word after that. That loop, repeated, is your full answer.</p>
        <div className="note analogy"><b>The big reveal:</b> Claude writes one token at a time. It never plans the whole sentence first — each word is the most likely next step, given everything so far.</div>
      </>
    ),
  },
]

const EXAMPLES = ['Why is the sky blue?', 'The cat sat on the', 'Write code to reverse a list', 'Explain how you think, Claude']

export default function TokenJourney() {
  const [query, setQuery] = useState('Why is the sky blue?')
  const [draft, setDraft] = useState(query)
  const [step, setStep] = useState(0)

  const pipe = useMemo(() => buildPipeline(query || ' '), [query])
  const lastTokenText = pipe.tokens.length ? pipe.tokens[pipe.tokens.length - 1].text : ''

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return
      if (e.key === 'ArrowRight') setStep((s) => Math.min(STEPS.length - 1, s + 1))
      if (e.key === 'ArrowLeft') setStep((s) => Math.max(0, s - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const run = () => { setQuery(draft.trim() || ' '); setStep(1) }
  const cur = STEPS[step]

  const renderViz = () => {
    switch (cur.id) {
      case 'intro': return <IntroView />
      case 'tokens': return <TokenFlow tokens={pipe.tokens} />
      case 'embed': return <VectorList tokens={pipe.tokens} embeds={pipe.embeds} />
      case 'map': return <EmbeddingMap tokens={pipe.tokens} embeds={pipe.embeds} regions={pipe.regions} />
      case 'pos': return <PositionalWave tokens={pipe.tokens} positions={pipe.positions} />
      case 'attn': return <AttentionView tokens={pipe.tokens} embeds={pipe.embeds} heads={pipe.heads} />
      case 'ffn': return <FFNView ffnResult={pipe.ffnResult} lastToken={lastTokenText} lastVec={pipe.embeds.length ? pipe.embeds[pipe.embeds.length - 1].vec : []} />
      case 'layers': return <LayersView firstToken={pipe.tokens.length ? pipe.tokens[0].text : 'Why'} nextToken={pipe.predictions[0]?.token || '…'} />
      case 'output': return <OutputView predictions={pipe.predictions} context={query} />
      default: return null
    }
  }

  return (
    <>
      <div className="journey-head">
        <p className="journey-tag">Follow your words through a transformer, one click at a time.</p>
        <div className="pill">Step <b>{step + 1}</b> / {STEPS.length} · use <span className="kbd">←</span> <span className="kbd">→</span></div>
      </div>

      {/* query bar */}
      <div>
        <div className="querybar">
          <div className="field">
            <label>Your query to Claude</label>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && run()}
              placeholder="Type anything…"
              spellCheck={false}
            />
          </div>
          <button className="btn" onClick={run}>Trace it ↦</button>
        </div>
        <div className="chips">
          <span style={{ fontSize: 12, color: 'var(--text-faint)', alignSelf: 'center' }}>try:</span>
          {EXAMPLES.map((ex) => (
            <button key={ex} className="chip" onClick={() => { setDraft(ex); setQuery(ex); setStep(1) }}>{ex}</button>
          ))}
        </div>
      </div>

      <GuidePanel guide={TOKEN_GUIDE} />

      {/* stepper */}
      <div className="stepper">
        {STEPS.map((s, i) => (
          <button key={s.id} className={`step-tab ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} onClick={() => setStep(i)}>
            <span className="num">{i < step ? '✓' : i + 1}</span>
            {s.tab}
          </button>
        ))}
      </div>

      {/* stage */}
      <div className="stage">
        <motion.div key={cur.id + query} className="panel viz" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {renderViz()}
        </motion.div>

        <motion.div key={cur.id} className="panel explain" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <div>
            <div className="mascot">
              <StickFigure pose={POSES[step]} color={POSE_COLORS[step]} size={70} />
              <div style={{ paddingBottom: 6 }}>
                <div className="kicker">{cur.kicker}</div>
                <h2>{cur.title}</h2>
              </div>
            </div>
            <div style={{ marginTop: 4 }}><Squiggle width={170} /></div>
          </div>
          {cur.body}
        </motion.div>
      </div>

      {/* footer nav */}
      <div className="nav">
        <button className="btn ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} style={{ opacity: step === 0 ? 0.4 : 1 }}>← Back</button>
        <div className="progress"><i style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
        {step < STEPS.length - 1 ? (
          <button className="btn" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>Next →</button>
        ) : (
          <button className="btn" onClick={() => setStep(0)}>↺ Start over</button>
        )}
      </div>
    </>
  )
}
