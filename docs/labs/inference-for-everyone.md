# Project: Inference Engineering — For Everyone (no coding needed)

How production teams make AI **10× faster and 80% cheaper** without losing quality —
using **Model Routing**, **Prefix KV Caching**, and **Streaming**.

👉 **Open it:** https://priyankavergadia.github.io/life-of-a-token/#/inference

---

## Before you start
Add a free API key in the **⚡ Go live** bar (any provider works here). No key →
demo mode.

---

## Walk it
1. **Overview** — Read the pipeline: Route (tier) → KV Cache → Stream TTFT → Fast &
   Cheap.
2. **Model Router** — Click between the **Simple** and **Complex** sample requests or
   drag the **threshold** slider. *Lesson: 80% of requests don't need a massive
   frontier model — routing simple tasks to a small, fast model cuts cost by up to 98%.*
3. **Cache & Stream** — Toggle between **⚡ Warm KV Cache + Stream** and **🐢 Cold
   Prefix + Blocking**, then click **Run & measure TTFT for real**. *Lesson: putting
   static instructions at the very top lets the GPU reuse cached math, while streaming
   shows the first word in ~200 ms instead of making users wait.*

## ✅ What you'll understand
Why fast, affordable AI isn't just about picking one model — it's about **routing**
each question to the right tier, **caching** repeated prompt prefixes, and
**streaming** tokens as they arrive.

---

### Want the actual code?
See the **[developer guide](inference-for-developers.md)** and grab the
[`.ipynb`](../../public/labs/project-inference.ipynb) or
[`.py`](../../public/labs/project-inference.py).
