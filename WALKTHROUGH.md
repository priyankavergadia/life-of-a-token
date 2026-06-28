# The Life of a Token — Learner's Walkthrough

A guided, click-by-click exercise for understanding how modern AI (LLMs like
Claude, Gemini, and GPT) actually works — from a single word to a finished,
production-grade application.

**Live app:** https://priyankavergadia.github.io/life-of-a-token/

This guide is written for someone going through the app as a self-paced
exercise. For each section it tells you **what to do, where to click, what to
read, and what you should walk away understanding.**

---

## How the app is organised

There are two groups of tabs at the top:

- **Learn**
  - **🔤 Life of a Token** — the *theory*: what happens inside a transformer.
  - **🧪 GenAI Lab** — the *foundations*: six core skills, runnable for real.
- **Projects** (four end-to-end builds that combine the foundations)
  - **🛡️ LLM Outputs** · **📚 RAG** · **🤖 Tools** · **📧 Personalization**

> 🐈 *Don't be surprised by the ginger cat strolling across the bottom of the
> screen — she's just here to keep things fun.*

### Two things that apply to every tab except "Life of a Token"

1. **The ⚡ Go live bar.** GenAI Lab and all four Projects have a bar near the
   top where you pick a provider (**Google Gemini**, **OpenAI**, or
   **Anthropic Claude**) and paste an **API key**.
   - **No key?** Everything still works in **demo mode** — you see realistic
     pre-baked results so you can learn the flow.
   - **With a key?** "**Run for real**" buttons appear and call the actual model
     live. Your key is stored **only in your browser** and sent **directly to
     the provider** — it never touches any server.
   - Get a key from the "get a key ↗" link in the bar. Gemini's free tier is the
     easiest place to start.

2. **The code is editable.** In GenAI Lab and the Projects, the left panel shows
   real Python. Where you see "**✎ editable**", you can change values in the code
   *or* in the controls on the right — they stay in sync. (It parses the
   important values; it doesn't run arbitrary Python.)

**Navigation:** click the numbered step tabs, use the **← Back / Next →**
buttons at the bottom, or press the **← / →** arrow keys.

---

# 1. 🔤 Life of a Token

**Goal:** understand, with no code, what physically happens to your words inside
a transformer. This is the *mental model* everything else builds on.

**Before you start:** in the **"Your query to Claude"** box at the top, type any
prompt (or click one of the `try:` chips like *"Why is the sky blue?"*), then
click **Trace it ↦**. Every visualisation on the following steps recomputes from
*your actual words* — so pick something short and meaningful to you.

Walk the 9 steps in order (top stepper or → key):

### Step 1 · Start
- **Read** the intro: an LLM doesn't *look anything up*. It turns words into
  numbers, lets those numbers interact, and predicts the next word — over and
  over.
- **Learn:** think of the whole thing as an **assembly line**. Each station
  transforms the words a little more.

### Step 2 · Tokenize
- **Look at** how your sentence is chopped into **tokens** — common words stay
  whole; rare/long words shatter into pieces; spaces ride along at the front.
- **Read** why: a fixed vocabulary (~100,000 tokens) can't hold every word, so
  sub-word pieces let the model spell out anything.
- **Learn:** from here on, your sentence is just a list of **token IDs** (numbers).

### Step 3 · Embed
- **See** each token become a long list of numbers — its **embedding vector**.
  The bars show 8 of those numbers.
- **Learn:** words with similar meaning get similar vectors. This isn't
  hand-coded — it falls out of training. *Analogy: an embedding is GPS
  coordinates for meaning.*

### Step 4 · Meaning map
- **Hover** the dots. The thousand-dimension vectors are squashed to a **2D map**;
  each dot is one of your tokens, and related meanings cluster together.
- **Learn — this is the "aha":** *meaning becomes geometry.* "Close together"
  literally means "similar." Attention (next) exploits exactly this.

### Step 5 · Position
- **Read** the twist: a transformer looks at **every token at once**, so it would
  have no idea which word came first.
- **See** how each position gets a unique **fingerprint** (sine/cosine waves)
  added into its vector, so "dog bites man" ≠ "man bites dog."
- **Learn:** *like numbering the seats in a theatre — same people, but now
  everyone knows where they sit.*

### Step 6 · Attention (the heart of the transformer)
- **Study the grid:** every token asks a question (its **Query**) and every token
  offers an answer (its **Key**); strong matches let one word pull **information**
  (the **Value**) from another.
- **Switch heads** — multiple attention "heads" run in parallel, each
  specialising in different relationships. Watch how their focus differs.
- **Notice** the blank upper-right triangle: the **causal mask** — when
  predicting the next word, a token may only look at words *before* it.
- **Watch** the animated matrix multiply (Query · Keys) play out term by term.
- **Learn:** this is how "it" finds what it refers to, and "blue" reaches back to
  "sky."

### Step 7 · Feed-forward
- **See** each token sent *solo* through a small neural network that widens the
  vector ~4×, lights up pattern-recognising neurons, then shrinks it back.
  (Another animated matrix multiply shows word · weights.)
- **Learn:** attention = "gather context"; feed-forward = "think privately about
  it." This is where most of the model's **factual knowledge** lives.

### Step 8 · Stack ×N
- **Watch** a packet of numbers flow down through repeated **blocks**
  (attention + feed-forward). The output of one block is the input to the next.
- **Learn:** early blocks catch grammar; deeper blocks assemble meaning, tone,
  and reasoning. **Depth is where capability comes from.** *Residual
  connections* mean each block adds to the running representation rather than
  replacing it.

### Step 9 · Predict
- **See** the final token's vector scored against the *entire* vocabulary, and
  **Softmax** turn those scores into probabilities that sum to 100%.
- **Learn — the big reveal:** the model picks one word (usually the top, with a
  dash of randomness), **appends it**, and runs the *whole pipeline again* for
  the next word. One token at a time — it never plans the whole sentence first.

> **✅ After this tab you should be able to explain:** tokenization → embeddings
> → positional encoding → attention → feed-forward → stacking → next-token
> prediction, and why an LLM "predicts" rather than "looks up."

---

# 2. 🧪 GenAI Lab

**Goal:** turn the theory into six hands-on skills you can run against a real
model. This mirrors a real Colab notebook: **left = the actual code, right =
what it does** (and, with a key, the **real model output**).

**Do this first:** if you have an API key, paste it in the **⚡ Go live** bar so
you can click "**Run for real**" on each lab. No key is fine — you'll see demos.

Walk the 8 steps:

### Overview
- **Read** the six superpowers you're about to learn (vendor toggle,
  temperature, embeddings, RAG, agents, vision). Orientation only.

### The Toggle
- **Click** between Google Gemini / OpenAI GPT / Anthropic Claude engine cards.
- **Read** the key line: `answer = llm.invoke(prompt)` never changes.
- **Learn:** hide the model behind one variable and you can **swap vendors**
  without rewriting your app — that's insurance against vendor lock-in. (Your
  choice in the ⚡ bar is what the rest of the labs actually run on.)

### Temperature (✎ editable — the creativity dial)
- **Edit** the prompt, then **drag the dials**: **Temperature** (0–2),
  **Top-P** (0–1), and **Top-K** (1–100). Toggle Top-P/Top-K on or off.
- **Click** "**Run 3× for real**" (or "Run again" in demo): it sends the *same
  prompt three times.*
- **Observe:** at **temp 0** the three answers are identical (deterministic); at
  **high temp** they diverge wildly. Top-P / Top-K shrink the pool of words the
  model is allowed to pick from.
- **Notice** the code on the left updates as you drag — and vice versa.
- **Learn:** LLMs predict the next word *by probability*; these three knobs
  control how much randomness is allowed.
  *(Note: Top-K is Gemini/Claude only — OpenAI's API has no top-k.)*

### Embeddings (✎ editable)
- **Edit** the word list (try other languages or your own words).
- **Click** "**Embed for real**" (needs Gemini or OpenAI — Claude has no
  embeddings API).
- **See** the words plotted on a 2D map and ranked by **cosine similarity**
  (1.0 = identical meaning, 0.0 = unrelated).
- **Learn:** similar meanings get similar numbers — even across languages —
  purely from training.

### Context / RAG (✎ editable)
- **Type** your own **question** and your own **private facts** in the context
  box. Toggle "**inject into prompt**" on and off.
- **Click** "**Ask for real (both)**" to compare:
  - **No context** → the model *guesses* (hallucinates).
  - **With context** → it answers correctly from your facts.
- **Learn:** **RAG** = paste the relevant facts into the prompt so the model
  can't make things up. This is the #1 way to ground an LLM in private data.

### Agents (✎ editable)
- **Edit** the request (default: *"How much to ship a 5 kg box to Paris?"*). The
  agent has one tool: `calculate_shipping_cost`.
- **Step through** the demo, or **click "Run agent for real."**
- **Watch** the loop: **🧠 Think → 🔧 Act (calls the tool with arguments it chose)
  → 👀 Observe (tool result) → ✅ Answer.**
- **Learn:** a chatbot *generates text*; an **agent executes**. You give the LLM
  tools and it decides *when* to use them.

### Vision
- **Upload an image** (or use the demo) and **click "Analyze for real."**
- **Learn:** modern models are **multimodal** — encode a picture as Base64, drop
  it in the message, and the model "looks" and describes it. No OCR.

### Recap
- **Read** the checklist of all six skills. You've now run real models, not just
  chatbots.

> **✅ After this tab you should be able to:** swap vendors, control randomness
> with temperature/top-p/top-k, turn words into embeddings, ground answers with
> RAG, build a tool-using agent, and send an image to a model.

---

# 3. Projects

Each project is an **end-to-end build** that combines the foundations into
something a real company would ship. Same layout: editable code on the left,
interactive result on the right, **⚡ Go live** bar to run it for real. Walk each
project's steps in order.

---

## 3a. 🛡️ LLM Outputs (structured output + vision)

**Goal:** stop "chatting" with a model and instead force it to return **strict,
trustworthy data** a downstream system can rely on — demonstrated with a
document-auditing pipeline.

### Overview
- **Read** the pipeline: Identify → Extract to schema → Validate → Decision gate.
- **Learn:** a picture goes in, a **PASS/FAIL decision** comes out — no human
  typing.

### Schema
- **Read** the `ShippingDocument` schema (sender, weight, is_international,
  tracking_id, confidence).
- **Learn:** instead of a chatty paragraph, the model is **forced** to fill in
  exactly these fields, so the next system (a database, an API) can trust them.

### Extract & Audit
- **Upload** a shipping label / document image (or use the sample).
- **Click "Audit for real."** The model reads the image into the schema; then
  **plain Python rules** decide PASS/FAIL (e.g. weight > 50 kg fails;
  international with no tracking ID fails).
- **Learn:** the model does the **reading**; deterministic code does the
  **judging** — so the verdict is auditable and never hallucinated.

### Recap
- **Read** what you built; note the same pipeline works for invoices, passports,
  insurance claims.

> **✅ Takeaway:** schema-enforced output + code-based rules = AI you can put in a
> production decision path.

---

## 3b. 📚 RAG (retrieval-augmented generation, done strictly)

**Goal:** build an "Oracle" that answers **only** from approved documents and
**refuses** everything else — the cure for confident hallucination. This project
also contrasts RAG with fine-tuning.

### Overview
- **Read** the pipeline: Ingest docs → Embed + index → Retrieve → Answer or
  refuse.
- **Learn:** the biggest enterprise risk is *confident wrong answers*; this
  design answers strictly from your text.

### Knowledge (✎ editable + uploadable)
- **Edit** the policy list directly (one item per line), **or** click
  "**upload .txt/.md**" to load your own document as the knowledge base.
- **Learn:** each item becomes a vector in a search index; the change flows live
  into the next step. Search is by **meaning**, not keywords.

### Retrieve + Answer
- **Pick** one of the sample questions *or* type your own.
- **Click "Retrieve + answer for real"** (needs Gemini/OpenAI for embeddings).
- **Watch:** vector search pulls the top-2 matching policies, and the model
  answers using *only* those — and **refuses** out-of-bounds or jailbreak
  questions.
- **Learn:** retrieval + a strict system instruction = grounded answers, or an
  honest "I don't know."

### RAG vs Fine-tune (interactive)
- **Toggle** the two buttons — they demonstrate two *different* jobs:
  - **📚 RAG · new knowledge:** a fact changes *today* → RAG reads the updated
    doc and answers fresh, instantly. Click "Answer with RAG for real."
  - **🧬 Fine-tuning · new behaviour:** browse a sample of ~5,000
    **tone-training pairs** that teach a funny, cat-like voice, then compare the
    **base** answer vs the **fine-tuned** answer to the same question. Click
    "Hear the tone change for real."
- **Learn the distinction:**
  - **RAG changes what the model KNOWS** (facts) — instant, just edit data.
  - **Fine-tuning changes how the model BEHAVES** (tone/style/format) — slow and
    costly, baked into the weights.
  - Real systems often use **both**.

### Recap
- **Read** the recap; the same pattern scales to Confluence, contracts, or
  clinical guidelines.

> **✅ Takeaway:** RAG grounds answers in your data and refuses the rest; reach
> for fine-tuning only when you need to change *behaviour*, not facts.

---

## 3c. 🤖 Tools (a multi-step, tool-using agent)

**Goal:** build a "digital worker" that answers a real business question by
**chaining tools** — because LLMs are great at language but terrible at math and
can't see your database.

### Overview
- **Read** the loop: Question → Pick a tool → Run it → Chain + answer.

### Forge tools
- **Read** the two tools and their **docstrings**: `query_sales_db(product_name)`
  and `calculate_profit_margin(revenue, cost)`.
- **Learn:** the model doesn't read your Python — it reads the **description** to
  decide *when* to use each tool. Good docstrings = good agents. Offloading math
  and lookups to code guarantees **0% hallucination on numbers.**

### Execute (✎ editable)
- **Edit** the executive's question (default asks for SuperWidget profit margin
  given $4,500 cost).
- **Click "Run the agent for real."**
- **Watch the trace:** the agent realises it must `query_sales_db` *first* to get
  revenue, then feed that into `calculate_profit_margin` *second* — multi-step
  reasoning, no human in the loop.
- **Learn:** the agent decides the order of operations itself.

### Recap
- **Read** how adding tools (`run_sql_query`, `restart_server`,
  `get_exchange_rate`) turns this same loop into text-to-SQL bots, DevOps
  remediation, and live auditors.

> **✅ Takeaway:** tools turn a text generator into something that can *act* and
> *chain steps* reliably.

---

## 3d. 📧 Personalization (the finale — combine everything)

**Goal:** hyper-personalised marketing at scale, combining **embeddings** (find
related products), **high temperature** (creative copy), and **structured
output** (strict JSON an email API can send).

### Overview
- **Read** the pipeline: Match (embeddings) → Create (temp 0.8) → Lock to JSON →
  Auto-send.

### Matchmaker
- **Edit** what the customer bought (default: a camping tent).
- **Click "Match for real"** (needs Gemini/OpenAI).
- **See** vector math recommend related products (boots, rain jacket) while
  unrelated items (office chair) stay far away.
- **Learn:** recommendations by **meaning**, not keyword overlap.

### Generate
- **Edit** the purchase if you like; the recommendations carry over from
  Matchmaker.
- **Click "Generate for real (temp 0.8)."**
- **See** the *same output two ways:* a friendly marketing email **and** the
  strict **JSON payload** behind it (subject, body, discount code, CTA).
- **Learn:** high temperature makes it creative; the schema **traps** that
  creativity in a structure an automated email server (SendGrid/Mailchimp) can
  actually send.

### Recap
- **Read** how the same pattern powers cold-email SDRs, push notifications, and
  SEO content factories.

> **✅ Takeaway:** you can have *both* creativity and reliability — creative copy
> locked inside a predictable payload.

---

## Suggested learning path

1. **Life of a Token** — build the mental model (no key needed).
2. **GenAI Lab** — learn the six foundations; add a key and run each one for real.
3. **Projects, in order** — LLM Outputs → RAG → Tools → Personalization — to see
   the foundations assembled into real applications.

**Tips while you go:**
- Always try the **editable code / inputs** — change a value and re-run to see
  cause and effect.
- Compare **demo vs "for real"** to appreciate that these are genuine model
  behaviours, not canned tricks.
- For embedding-based steps (Embeddings, RAG retrieval, Personalization match),
  use **Gemini** or **OpenAI** — Claude has no embeddings API.

> **By the end you should understand**, end to end: how an LLM turns text into a
> prediction, and how the six foundational skills combine into the kinds of AI
> systems companies actually ship.
