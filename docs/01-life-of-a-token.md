# 1 · 🔤 Life of a Token

> Part of the [Learner's Walkthrough](../WALKTHROUGH.md) · Next → [GenAI Lab](02-genai-lab.md)

**Goal:** understand, with no code, what physically happens to your words inside
a transformer. This is the *mental model* everything else builds on.

**No API key needed** — this tab is fully interactive on its own.

---

## Before you start
In the **"Your query to Claude"** box at the top, type any prompt (or click a
`try:` chip like *"Why is the sky blue?"*), then click **Trace it ↦**. Every
visualisation recomputes from *your actual words*, so pick something short and
meaningful.

**Navigation:** click the numbered step tabs, use **← Back / Next →**, or press
the **← / →** arrow keys.

---

## The 9 steps

### Step 1 · Start
- **Read** the intro: an LLM doesn't *look anything up*. It turns words into
  numbers, lets those numbers interact, and predicts the next word — over and over.
- **Learn:** picture the whole thing as an **assembly line**; each station
  transforms the words a little more.

### Step 2 · Tokenize
- **Look at** how your sentence is chopped into **tokens** — common words stay
  whole; rare/long words shatter into pieces; spaces ride along at the front.
- **Read** why: a fixed vocabulary (~100,000 tokens) can't hold every word, so
  sub-word pieces let the model spell out anything.
- **Learn:** from here on, your sentence is just a list of **token IDs** (numbers).

### Step 3 · Embed
- **See** each token become a long list of numbers — its **embedding vector**
  (the bars show 8 of them).
- **Learn:** words with similar meaning get similar vectors — not hand-coded, it
  falls out of training. *Analogy: an embedding is GPS coordinates for meaning.*

### Step 4 · Meaning map
- **Hover** the dots. The thousand-dimension vectors are squashed to a **2D map**;
  each dot is one of your tokens, and related meanings cluster together.
- **Learn — the "aha":** *meaning becomes geometry.* "Close together" literally
  means "similar." Attention (next) exploits exactly this.

### Step 5 · Position
- **Read** the twist: a transformer looks at **every token at once**, so it would
  have no idea which word came first.
- **See** each position get a unique **fingerprint** (sine/cosine waves) added
  into its vector, so "dog bites man" ≠ "man bites dog."
- **Learn:** *like numbering theatre seats — same people, but now everyone knows
  where they sit.*

### Step 6 · Attention (the heart of the transformer)
- **Study the grid:** every token asks a question (its **Query**) and every token
  offers an answer (its **Key**); strong matches let one word pull **information**
  (the **Value**) from another.
- **Switch heads** — multiple attention "heads" run in parallel, each specialising.
  Watch how their focus differs.
- **Notice** the blank upper-right triangle — the **causal mask**: when predicting
  the next word, a token may only look at words *before* it.
- **Watch** the animated matrix multiply (Query · Keys) play out term by term.
- **Learn:** this is how "it" finds what it refers to, and "blue" reaches back to
  "sky."

### Step 7 · Feed-forward
- **See** each token sent *solo* through a small neural network that widens the
  vector ~4×, lights up pattern-recognising neurons, then shrinks it back (another
  animated matrix multiply shows word · weights).
- **Learn:** attention = "gather context"; feed-forward = "think privately." This
  is where most of the model's **factual knowledge** lives.

### Step 8 · Stack ×N
- **Watch** a packet of numbers flow down through repeated **blocks**
  (attention + feed-forward); the output of one block is the input to the next.
- **Learn:** early blocks catch grammar; deeper blocks assemble meaning, tone, and
  reasoning. **Depth is where capability comes from.** *Residual connections* mean
  each block adds to the running representation rather than replacing it.

### Step 9 · Predict
- **See** the final token's vector scored against the *entire* vocabulary, and
  **Softmax** turn those scores into probabilities that sum to 100%.
- **Learn — the big reveal:** the model picks one word (usually the top, with a
  dash of randomness), **appends it**, and runs the *whole pipeline again* for the
  next word. One token at a time — it never plans the whole sentence first.

---

## ✅ Takeaway
You should be able to explain the full path — tokenize → embed → position →
attention → feed-forward → stack → next-token prediction — and *why* an LLM
predicts rather than looks up.

> Next → [GenAI Lab](02-genai-lab.md)
