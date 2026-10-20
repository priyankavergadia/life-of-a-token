# Project: Memory — For Everyone (no coding needed)

How to cure AI amnesia using two memory layers: **Short-Term Memory** (a rolling
summary + recent window within a chat) and **Long-Term Memory** (extracting durable
user facts into a persistent vault across days).

👉 **Open it:** https://priyankavergadia.github.io/life-of-a-token/#/memory

---

## Before you start
Add a free API key in the **⚡ Go live** bar (any provider works here). No key →
demo mode.

---

## Walk it
1. **Overview** — Read the pipeline: Chat turn → Short-term window → Extract facts →
   Long-term recall.
2. **Short-Term** — Drag the **window** slider from `1` to `6`. Watch how older
   messages get folded into a compact **55-token Rolling Summary** while the most
   recent turns stay word-for-word. *Lesson: summarizing older turns keeps the chat
   from overflowing its context window.*
3. **Long-Term** — Edit what the user shares in **Session 1 (Monday)**, then click
   **🧠 Extract facts & test Session 2 for real**. *Lesson: even in a brand-new
   Session 2 chat on Friday, the AI recalls the extracted profile facts (diet, role,
   stack) and personalizes its answer.*

## ✅ What you'll understand
Why LLMs are stateless by default — and how combining a rolling summary (short-term)
with extracted profile facts (long-term) turns a forgetful chatbot into a persistent
companion.

---

### Want the actual code?
See the **[developer guide](memory-for-developers.md)** and grab the
[`.ipynb`](../../public/labs/project-memory.ipynb) or
[`.py`](../../public/labs/project-memory.py).
