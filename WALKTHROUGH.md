# The Life of a Token — Learner's Walkthrough

A guided, click-by-click exercise for understanding how modern AI (LLMs like
Claude, Gemini, and GPT) actually works — from a single word to a finished,
production-grade application.

**Live app:** https://priyankavergadia.github.io/life-of-a-token/

Each section has its own page (under [`docs/`](docs/)). For every step they tell
you **what to do, where to click, what to read, and what to learn.**

---

## Sections

| # | Tab | Page | What you'll learn |
|---|-----|------|-------------------|
| 1 | 🔤 Life of a Token | [docs/01-life-of-a-token.md](docs/01-life-of-a-token.md) | What happens inside a transformer (theory, no key needed) |
| 2 | 🧪 GenAI Lab | [docs/02-genai-lab.md](docs/02-genai-lab.md) | Six core skills, runnable for real |
| 3 | 🛡️ LLM Outputs | [docs/03-llm-outputs.md](docs/03-llm-outputs.md) | Strict structured output + vision auditing |
| 4 | 📚 RAG | [docs/04-rag.md](docs/04-rag.md) | Grounded answers, refusals, RAG vs fine-tuning |
| 5 | 🤖 Tools | [docs/05-tools.md](docs/05-tools.md) | A multi-step, tool-using agent |
| 6 | 📧 Personalization | [docs/06-personalization.md](docs/06-personalization.md) | Embeddings + creativity + strict JSON |
| 7 | 🧭 Context | [docs/07-context.md](docs/07-context.md) | Token budgets, relevance ranking, and beating "Lost in the Middle" |
| 8 | 🧠 Memory | [docs/08-memory.md](docs/08-memory.md) | Short-term rolling summaries + long-term cross-session fact stores |
| 9 | 🔌 MCP | [docs/09-mcp.md](docs/09-mcp.md) | Model Context Protocol — universal Resources, Tools, and Prompts |
| 10 | ⚡ Inference | [docs/10-inference.md](docs/10-inference.md) | Serving at scale: Model routing, KV prefix caching, and streaming (TTFT) |
| 11 | ⚖️ Evals | [docs/11-evals.md](docs/11-evals.md) | Error analysis, code checks, a validated LLM judge, and a CI gate |

---

## 💻 Downloadable code + lab docs

Every lab also ships as **runnable code** (a `.py` and a Jupyter `.ipynb`) plus
**two docs** — a non-technical *for everyone* version and a technical *for
developers* version. See **[docs/labs/](docs/labs/README.md)**.

Direct downloads (live site): `https://priyankavergadia.github.io/life-of-a-token/labs/`
— `genai-lab`, `project-llm-outputs`, `project-rag`, `project-tools`,
`project-personalization`, `project-context`, `project-memory`, `project-mcp`,
`project-inference`, `project-evals` (each as `.ipynb` and `.py`).

## How the app is organised

Three groups of tabs at the top:

- **Learn** — 🔤 Life of a Token (theory) · 🧪 GenAI Lab (foundations)
- **Projects** — 🛡️ LLM Outputs · 📚 RAG · 🤖 Tools · 📧 Personalization · 🧭 Context · 🧠 Memory · 🔌 MCP · ⚡ Inference · ⚖️ Evals (end-to-end patterns)
- **Build** — 🛠️ Vibe Coding · 🎨 Greeting Cards (full-app & multi-agent capstones)

> 🐈 *Don't be surprised by the ginger cat strolling across the bottom of the
> screen — she's just here to keep things fun.*

## Global mechanics (everything except "Life of a Token")

1. **The ⚡ Go live bar.** Pick a provider (**Gemini**, **OpenAI**, or **Claude**)
   and paste an **API key**.
   - **No key?** Everything runs in **demo mode** with realistic pre-baked results.
   - **With a key?** "**Run for real**" buttons call the live model. Your key is
     stored **only in your browser** and sent **directly to the provider** — it
     never touches any server. Use the "get a key ↗" link (Gemini's free tier is
     the easiest start).
2. **The code is editable.** Where you see "**✎ editable**", change values in the
   code *or* in the controls on the right — they stay in sync. (It parses the
   important values; it doesn't run arbitrary Python.)
3. **Embeddings** steps (GenAI Lab Embeddings, RAG retrieval, Personalization
   match) need **Gemini or OpenAI** — Claude has no embeddings API.

**Navigation:** click the numbered step tabs, use **← Back / Next →**, or press
the **← / →** arrow keys.

---

## Suggested learning path

1. **[Life of a Token](docs/01-life-of-a-token.md)** — build the mental model (no key needed).
2. **[GenAI Lab](docs/02-genai-lab.md)** — learn the six foundations; add a key and run each one for real.
3. **Projects 1–4 (Core Application Patterns)** — [LLM Outputs](docs/03-llm-outputs.md) → [RAG](docs/04-rag.md) → [Tools](docs/05-tools.md) → [Personalization](docs/06-personalization.md).
4. **Projects 5–8 (Context, State, Protocol & Production Scale)** — [Context](docs/07-context.md) → [Memory](docs/08-memory.md) → [MCP](docs/09-mcp.md) → [Inference](docs/10-inference.md).
5. **Project 9 (Quality)** — [Evals](docs/11-evals.md): prove the system works before and after every change.

**Tips while you go:**
- Always try the **editable code / inputs** — change a value and re-run to see
  cause and effect.
- Compare **demo vs "for real"** to appreciate that these are genuine model
  behaviours, not canned tricks.

> **By the end you should understand**, end to end: how an LLM turns text into a
> prediction, how the six foundational skills combine into working features, and
> how context engineering, memory, MCP, and inference engineering turn those
> features into fast, scalable production systems.
