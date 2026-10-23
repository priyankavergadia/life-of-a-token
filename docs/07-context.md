# 7 · 🧭 Project: Context Engineering

> Part of the [Learner's Walkthrough](../WALKTHROUGH.md) · ← [Personalization](06-personalization.md) · Next → [Memory](08-memory.md)

**Goal:** curate, rank, and budget **everything the model sees** when it answers —
beating the *"Lost in the Middle"* failure mode while cutting token cost by 70%.

---

## Before you start
Add a key in the **⚡ Go live bar** (any provider works). Without a key you'll see
demos.

---

## The steps

### Overview
- **Read** the pipeline: Gather candidates → Re-rank & filter → Fit token budget →
  High-signal prompt.
- **Learn:** *Prompt engineering* is how you phrase the question; **Context
  engineering** is curating the exact information on the model's workbench when it
  answers.

### Token Budget (✎ editable)
- **Drag** the **budget** (`max_budget`) and **cutoff** (`relevance_cutoff`) sliders.
- **Watch** which candidate chunks get **packed ✓** vs **dropped** — and notice what
  happens if you lower the cutoff to `0.30` and raise the budget: an archived **2021
  draft** sneaks into the context window and contradicts the 2026 policy!
- **Learn:** a bigger context window is not a strategy. Treat the window like a
  carry-on suitcase with a strict token cap and relevance floor.

### Signal vs Noise (✎ editable)
- **Toggle** between **🧭 Engineered Context (180 tok · ranked)** and **🗑️ Stuffed
  Window (590 tok · noisy)**.
- **Click "Run both contexts for real."**
- **Compare:** the stuffed window wastes 3× the tokens and gets confused by the
  buried 2021 draft, while the engineered context puts the two verified 2026 chunks
  right at the top and answers crisply.
- **Learn:** LLMs pay the strongest attention to the **beginning and end** of a
  prompt — pruning noise and ordering by signal improves both accuracy and latency.

### Recap
- **Read** what you built and how budgeting a single prompt sets up the next
  challenge: managing state across long conversations and across days (**Memory**).

---

## ✅ Takeaway
More context ≠ better answers. Filter out stale/low-score chunks, cap tokens to a
budget, and place your highest-signal facts at the edges of the prompt.

> ← [Personalization](06-personalization.md) · Next → [Memory](08-memory.md)
