// engine.js
// A deliberately transparent, illustrative model of what happens inside a
// transformer LLM. None of this is a real neural network — instead every step
// is a hand-built heuristic chosen so the *shape* of the computation matches
// the real thing: tokens, vectors, positions, attention, FFN, logits, softmax.
// The numbers are believable and internally consistent so the visuals teach
// the right intuition without pretending to be GPT-scale weights.

/* ----------------------------------------------------------------------------
 * 0. Tiny deterministic hash so the same word always lands in the same place.
 * ------------------------------------------------------------------------- */
function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295 // 0..1
}
function hashRange(str, min, max) {
  return min + hash(str) * (max - min)
}

/* ----------------------------------------------------------------------------
 * 1. TOKENIZER
 * Real tokenizers (BPE) split text into subword chunks. We approximate that:
 * we keep common whole words, peel off frequent prefixes/suffixes, and break
 * rare/long words into pieces — exactly the behavior people find surprising.
 * ------------------------------------------------------------------------- */
const COMMON_WORDS = new Set(
  ('the of and a to in is was he for it with as his on be at by i this had not are but from or have an they '
    + 'which one you were her all she there would their we him been has when who will more no if out so said what '
    + 'up its about into them can only other new some could time these two may then do first any my now such like '
    + 'why how where does did why sky blue cat sat mat dog run red green sun light why because water why is are '
    + 'write code please help me tell explain make think know want need give find use work good day people year '
    + 'claude model word words token tokens learn learning brain idea story').split(' '),
)
const SUFFIXES = ['ing', 'tion', 'ed', 'ly', 'er', 'ness', 'ment', 'able', 'ful', 's', 'es', 'berry', 'ation']
const PREFIXES = ['un', 're', 'in', 'pre', 'sub', 'inter', 'anti', 'over', 'under', 'blue']

function splitWord(word) {
  const lower = word.toLowerCase()
  if (COMMON_WORDS.has(lower) || lower.length <= 4) return [word]

  const pieces = []
  let rest = word

  // peel a known prefix
  for (const p of PREFIXES) {
    if (rest.toLowerCase().startsWith(p) && rest.length > p.length + 2) {
      pieces.push(rest.slice(0, p.length))
      rest = rest.slice(p.length)
      break
    }
  }
  // peel a known suffix
  let suffix = null
  for (const s of SUFFIXES) {
    if (rest.toLowerCase().endsWith(s) && rest.length > s.length + 2) {
      suffix = rest.slice(rest.length - s.length)
      rest = rest.slice(0, rest.length - s.length)
      break
    }
  }
  if (rest) pieces.push(rest)
  if (suffix) pieces.push(suffix)

  // very long leftover chunks get hard-split so nothing is too big
  const out = []
  for (const piece of pieces) {
    if (piece.length > 7) {
      for (let i = 0; i < piece.length; i += 5) out.push(piece.slice(i, i + 5))
    } else out.push(piece)
  }
  return out.length ? out : [word]
}

export function tokenize(text) {
  const tokens = []
  // split into words + punctuation, keeping leading spaces conceptually
  const rawMatches = text.match(/\s+|[^\s\w]+|[\w']+/g) || []
  let wordIndex = -1

  for (const raw of rawMatches) {
    if (/^\s+$/.test(raw)) continue // skip pure whitespace; we mark space via leadingSpace
    const isWord = /[\w']/.test(raw)
    if (isWord) {
      wordIndex++
      const parts = splitWord(raw)
      parts.forEach((part, i) => {
        const display = (i === 0 ? '·' : '') + part // · marks a word boundary (a leading space)
        tokens.push({
          text: part,
          display: i === 0 ? part : part,
          leadingSpace: i === 0,
          word: raw,
          isSubword: parts.length > 1,
          subwordPart: parts.length > 1 ? `${i + 1}/${parts.length}` : null,
          kind: 'word',
        })
      })
    } else {
      tokens.push({
        text: raw,
        display: raw,
        leadingSpace: false,
        word: raw,
        isSubword: false,
        subwordPart: null,
        kind: 'punct',
      })
    }
  }

  return tokens.map((t, i) => ({
    ...t,
    pos: i,
    // a fake but stable vocabulary id, like a row number in the embedding table
    id: 100 + Math.floor(hash(t.text.toLowerCase()) * 49900),
  }))
}

/* ----------------------------------------------------------------------------
 * 2. EMBEDDINGS
 * Each token id looks up a row of numbers (its vector). We show an 8-number
 * vector for readability and a 2D "semantic map" coordinate so learners can
 * literally see related words land near each other.
 * ------------------------------------------------------------------------- */

// Hand-placed semantic regions on a -1..1 map. Words near a region inherit its
// neighborhood + color, so "sky/blue/sun" cluster, "cat/dog/run" cluster, etc.
const SEMANTIC_REGIONS = [
  { name: 'sky & light', color: '#2e9bd6', x: -0.62, y: 0.55, words: ['sky', 'blue', 'sun', 'light', 'cloud', 'air', 'day', 'bright', 'star', 'moon', 'rainbow', 'color', 'green', 'red'] },
  { name: 'animals', color: '#f47b20', x: 0.6, y: 0.5, words: ['cat', 'dog', 'sat', 'mat', 'run', 'pet', 'animal', 'tail', 'fur', 'paw', 'mouse', 'bird'] },
  { name: 'questions', color: '#8a5cf0', x: -0.55, y: -0.6, words: ['why', 'how', 'what', 'where', 'who', 'when', 'which', 'is', 'are', 'does', 'do', '?'] },
  { name: 'people & self', color: '#f2553d', x: 0.55, y: -0.55, words: ['i', 'me', 'you', 'we', 'he', 'she', 'they', 'people', 'claude', 'human', 'name'] },
  { name: 'making & code', color: '#15b3a4', x: 0.0, y: 0.72, words: ['write', 'code', 'make', 'build', 'create', 'help', 'explain', 'work', 'idea', 'story', 'word'] },
  { name: 'connectors', color: '#c9a14a', x: 0.0, y: -0.78, words: ['the', 'a', 'of', 'on', 'in', 'to', 'and', 'with', 'for', 'because', 'so', 'that', 'this', 'it'] },
]

function regionFor(text) {
  const lower = text.toLowerCase()
  for (const r of SEMANTIC_REGIONS) if (r.words.includes(lower)) return r
  return null
}

export function embed(token) {
  const region = regionFor(token.text)
  let x, y, color
  if (region) {
    // jitter around the region center, deterministically
    x = region.x + hashRange(token.text + 'x', -0.16, 0.16)
    y = region.y + hashRange(token.text + 'y', -0.16, 0.16)
    color = region.color
  } else {
    // unknown word: scatter, tinted neutral
    x = hashRange(token.text + 'x', -0.85, 0.85)
    y = hashRange(token.text + 'y', -0.85, 0.85)
    color = '#b59a5e'
  }
  // 8 display dimensions derived from the position + hash, so the bar chart
  // and the 2D map agree (first two dims ≈ the map coords).
  const vec = [
    x,
    y,
    hashRange(token.text + '2', -1, 1),
    hashRange(token.text + '3', -1, 1),
    hashRange(token.text + '4', -1, 1),
    hashRange(token.text + '5', -1, 1),
    hashRange(token.text + '6', -1, 1),
    hashRange(token.text + '7', -1, 1),
  ]
  return { x, y, color, vec, region: region ? region.name : 'unknown' }
}

/* ----------------------------------------------------------------------------
 * 3. POSITIONAL ENCODING
 * Transformers see all tokens at once, so position is *added* as a wave pattern
 * (sinusoids). We return the real sinusoidal values so the viz is honest.
 * ------------------------------------------------------------------------- */
export function positionalEncoding(pos, dims = 8) {
  const out = []
  for (let i = 0; i < dims; i++) {
    const denom = Math.pow(10000, (2 * Math.floor(i / 2)) / dims)
    out.push(i % 2 === 0 ? Math.sin(pos / denom) : Math.cos(pos / denom))
  }
  return out
}

/* ----------------------------------------------------------------------------
 * 4. SELF-ATTENTION
 * Each token builds a Query, Key, Value. Attention weight(i, j) ~ how much
 * token i looks at token j. Real models compute softmax(Q·K / sqrt(d)) with a
 * causal mask (you can only look left). We mimic that with a relatedness score:
 *   - semantic similarity (close on the 2D map),
 *   - a recency bias (nearby tokens matter),
 *   - content words outrank filler.
 * Different "heads" weight these ingredients differently, which is exactly why
 * real heads specialize (one tracks the previous word, one tracks syntax, etc.)
 * ------------------------------------------------------------------------- */
const HEADS = [
  { name: 'Head 1 · previous-word', hue: '#2e9bd6', recency: 1.0, semantic: 0.15, content: 0.1, desc: 'Tends to look at the word immediately before — tracks local flow.' },
  { name: 'Head 2 · syntax / glue', hue: '#15b3a4', recency: 0.35, semantic: 0.25, content: -0.4, desc: 'Locks onto connector words (the, of, on) that hold grammar together.' },
  { name: 'Head 3 · meaning', hue: '#f47b20', recency: 0.1, semantic: 1.0, content: 0.6, desc: 'Connects words by meaning, even far apart — "sky" reaches for "blue".' },
  { name: 'Head 4 · the subject', hue: '#f2553d', recency: 0.2, semantic: 0.4, content: 1.0, desc: 'Hunts for the main nouns/verbs the sentence is really about.' },
]

const CONTENT_KINDS = (t) => (t.kind === 'word' && t.text.length > 2 && !SEMANTIC_REGIONS[5].words.includes(t.text.toLowerCase()))

export function attention(tokens, embeds) {
  // softmax helper
  const softmax = (arr) => {
    const m = Math.max(...arr)
    const ex = arr.map((v) => Math.exp(v - m))
    const s = ex.reduce((a, b) => a + b, 0)
    return ex.map((v) => v / s)
  }

  return HEADS.map((head) => {
    const matrix = tokens.map((qi, i) => {
      const scores = tokens.map((kj, j) => {
        if (j > i) return -Infinity // causal mask: can't look at the future
        const ei = embeds[i]
        const ej = embeds[j]
        const dist = Math.hypot(ei.x - ej.x, ei.y - ej.y) // 0..~2.8
        const semantic = 1 - dist / 2.8 // 1 = identical neighborhood
        const recency = 1 / (1 + (i - j)) // 1 for self, decays going back
        const content = CONTENT_KINDS(kj) ? 1 : 0
        let s =
          head.recency * recency * 3 +
          head.semantic * semantic * 3 +
          head.content * content * 1.5
        if (i === j) s += 0.3 // mild self-attention baseline
        return s
      })
      return softmax(scores)
    })
    return { ...head, matrix }
  })
}

/* ----------------------------------------------------------------------------
 * 5. FEED-FORWARD NETWORK (per token)
 * After attention mixes information between tokens, each token is pushed
 * through a 2-layer MLP that expands to ~4x width, applies a nonlinearity
 * (GELU/ReLU), then projects back. This is where most "knowledge" is stored.
 * We produce neuron activations for the LAST token to visualize.
 * ------------------------------------------------------------------------- */
export function ffn(vec, expand = 32) {
  const gelu = (x) => 0.5 * x * (1 + Math.tanh(0.797885 * (x + 0.044715 * x ** 3)))
  // expand: random-but-fixed projection up
  const hidden = []
  for (let n = 0; n < expand; n++) {
    let s = 0
    for (let d = 0; d < vec.length; d++) {
      s += vec[d] * (hashRange(`w${n}-${d}`, -1, 1))
    }
    hidden.push(gelu(s))
  }
  // project back down to vec.length
  const out = vec.map((v, d) => {
    let s = 0
    for (let n = 0; n < expand; n++) s += hidden[n] * hashRange(`o${d}-${n}`, -1, 1)
    return v + s * 0.05 // residual: add a nudge, don't overwrite
  })
  return { hidden, out }
}

/* ----------------------------------------------------------------------------
 * 6. OUTPUT: logits -> softmax -> next token
 * The final token's vector is compared against the whole vocabulary to score
 * every possible next word (logits); softmax turns scores into probabilities.
 * We pick believable continuations based on the query's last content word.
 * ------------------------------------------------------------------------- */
const CONTINUATIONS = [
  { trigger: ['sky', 'blue'], options: [['because', 0.42], ['?', 0.18], ['and', 0.12], ['light', 0.1], ['due', 0.08]] },
  { trigger: ['sat', 'cat', 'mat'], options: [['mat', 0.51], ['floor', 0.16], ['chair', 0.12], ['rug', 0.1], ['couch', 0.06]] },
  { trigger: ['write', 'code'], options: [['that', 0.31], ['for', 0.22], ['in', 0.16], ['to', 0.14], ['which', 0.07]] },
  { trigger: ['why', 'how', 'what'], options: [['the', 0.34], ['it', 0.19], ['this', 0.14], ['you', 0.12], ['we', 0.09]] },
  { trigger: ['claude', 'you'], options: [['can', 0.3], ['is', 0.2], ['will', 0.16], ['help', 0.14], ['are', 0.1]] },
]
const DEFAULT_OPTIONS = [['the', 0.28], ['a', 0.18], ['to', 0.15], ['and', 0.13], ['is', 0.1]]

export function predictNext(tokens) {
  const recent = tokens.slice(-4).map((t) => t.text.toLowerCase())
  let chosen = DEFAULT_OPTIONS
  for (const c of CONTINUATIONS) {
    if (c.trigger.some((t) => recent.includes(t))) {
      chosen = c.options
      break
    }
  }
  // normalize to probabilities (they may not sum to 1)
  const sum = chosen.reduce((a, [, p]) => a + p, 0)
  const probs = chosen.map(([w, p]) => ({ token: w, prob: p / sum }))
  // matching "logits" (pre-softmax) for the viz: log of prob + offset
  const withLogits = probs.map((o) => ({ ...o, logit: Math.log(o.prob) + 6 }))
  return withLogits
}

/* ----------------------------------------------------------------------------
 * Build the whole pipeline for a query in one call.
 * ------------------------------------------------------------------------- */
export function buildPipeline(text) {
  const tokens = tokenize(text)
  const embeds = tokens.map(embed)
  const positions = tokens.map((t) => positionalEncoding(t.pos))
  const heads = attention(tokens, embeds)
  const lastVec = embeds.length ? embeds[embeds.length - 1].vec : new Array(8).fill(0)
  const ffnResult = ffn(lastVec)
  const predictions = predictNext(tokens)
  return { text, tokens, embeds, positions, heads, ffnResult, predictions, regions: SEMANTIC_REGIONS }
}

export { SEMANTIC_REGIONS, HEADS }
