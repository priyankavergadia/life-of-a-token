# 2 · 🧪 GenAI Lab

> Part of the [Learner's Walkthrough](../WALKTHROUGH.md) · ← [Life of a Token](01-life-of-a-token.md) · Next → [LLM Outputs](03-llm-outputs.md)

**Goal:** turn the theory into six hands-on skills you can run against a real
model. Layout mirrors a real Colab notebook: **left = the actual code, right =
what it does** (and, with a key, the **real model output**).

---

## Before you start
- **⚡ Go live bar:** pick a provider (Gemini / OpenAI / Claude) and paste an
  **API key** to unlock the "**Run for real**" buttons. No key? Everything runs in
  **demo mode**. Your key stays **only in your browser** and goes **straight to the
  provider**.
- **Editable code:** where you see "**✎ editable**", change values in the code or
  in the controls on the right — they stay in sync.
- Some labs need **embeddings** (Gemini or OpenAI) — Claude has no embeddings API.

---

## The 8 steps

### Overview
- **Read** the six superpowers you're about to learn: vendor toggle, temperature,
  embeddings, RAG, agents, vision. Orientation only.

### The Toggle
- **Click** between the Gemini / OpenAI / Claude engine cards.
- **Read** the key line: `answer = llm.invoke(prompt)` never changes.
- **Learn:** hide the model behind one variable and you can **swap vendors** without
  rewriting your app. Your choice in the ⚡ bar is what the labs actually run on.

### Temperature (✎ editable — the creativity dial)
- **Edit** the prompt, then **drag the dials**: **Temperature** (0–2),
  **Top-P** (0–1), **Top-K** (1–100). Toggle Top-P / Top-K on or off.
- **Click** "**Run 3× for real**" (or "Run again" in demo) — it sends the *same
  prompt three times.*
- **Observe:** at **temp 0** the three answers are identical (deterministic); at
  **high temp** they diverge. Top-P / Top-K shrink the pool of words allowed.
- **Notice** the code on the left updates as you drag — and vice versa.
- **Learn:** LLMs predict the next word *by probability*; these knobs control the
  randomness. *(Top-K is Gemini/Claude only — OpenAI's API has no top-k.)*

### Embeddings (✎ editable)
- **Edit** the word list (try other languages or your own words).
- **Click** "**Embed for real**" (needs Gemini or OpenAI).
- **See** words plotted on a 2D map and ranked by **cosine similarity**
  (1.0 = identical meaning, 0.0 = unrelated).
- **Learn:** similar meanings get similar numbers — even across languages — purely
  from training.

### Context / RAG (✎ editable)
- **Type** your own **question** and your own **private facts** in the context box.
  Toggle "**inject into prompt**" on and off.
- **Click** "**Ask for real (both)**" to compare:
  - **No context** → the model *guesses* (hallucinates).
  - **With context** → it answers correctly from your facts.
- **Learn:** **RAG** = paste the relevant facts into the prompt so the model can't
  make things up.

### Agents (✎ editable)
- **Edit** the request (default: *"How much to ship a 5 kg box to Paris?"*). The
  agent has one tool: `calculate_shipping_cost`.
- **Step through** the demo, or **click "Run agent for real."**
- **Watch** the loop: **🧠 Think → 🔧 Act (calls the tool with arguments it chose) →
  👀 Observe (tool result) → ✅ Answer.**
- **Learn:** a chatbot *generates text*; an **agent executes** — it decides *when*
  to use a tool.

### Vision
- **Upload an image** (or use the demo) and **click "Analyze for real."**
- **Learn:** modern models are **multimodal** — encode a picture as Base64, drop it
  in the message, and the model "looks." No OCR.

### Recap
- **Read** the checklist of all six skills. You've now run real models, not just
  chatbots.

---

## ✅ Takeaway
You should be able to swap vendors, control randomness with temperature/top-p/top-k,
create embeddings, ground answers with RAG, build a tool-using agent, and send an
image to a model.

> ← [Life of a Token](01-life-of-a-token.md) · Next → [LLM Outputs](03-llm-outputs.md)
