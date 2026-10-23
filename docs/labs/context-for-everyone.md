# Project: Context Engineering — For Everyone (no coding needed)

How to curate **everything the AI sees** when it answers — filtering out stale drafts
and noise so the model stays accurate and uses 70% fewer tokens.

👉 **Open it:** https://priyankavergadia.github.io/life-of-a-token/#/context

---

## Before you start
Add a free API key in the **⚡ Go live** bar (any provider works here). No key →
demo mode.

---

## Walk it
1. **Overview** — Read the pipeline: Gather candidates → Re-rank & filter → Fit token
   budget → High-signal prompt.
2. **Token Budget** — Drag the **budget** and **cutoff** sliders. Watch what happens
   when the cutoff is too low (`0.30`): an archived **2021 draft** sneaks into the
   window and contradicts the current 2026 policy! *Lesson: treat the context window
   like a carry-on suitcase, not a trash can.*
3. **Signal vs Noise** — Toggle between **🧭 Engineered Context** and **🗑️ Stuffed
   Window**, then click **Run both contexts for real**. *Lesson: fewer, higher-signal
   tokens produce a better answer at a fraction of the cost.*

## ✅ What you'll understand
The difference between *Prompt Engineering* (how you phrase a question) and **Context
Engineering** (curating, ranking, and budgeting the information on the model's desk).

---

### Want the actual code?
See the **[developer guide](context-for-developers.md)** and grab the
[`.ipynb`](../../public/labs/project-context.ipynb) or
[`.py`](../../public/labs/project-context.py).
