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

---

## How the app is organised

Two groups of tabs at the top:

- **Learn** — 🔤 Life of a Token (theory) · 🧪 GenAI Lab (foundations)
- **Projects** — 🛡️ LLM Outputs · 📚 RAG · 🤖 Tools · 📧 Personalization (end-to-end builds)

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
3. **Projects, in order** — [LLM Outputs](docs/03-llm-outputs.md) → [RAG](docs/04-rag.md) → [Tools](docs/05-tools.md) → [Personalization](docs/06-personalization.md) — to see the foundations assembled into real applications.

**Tips while you go:**
- Always try the **editable code / inputs** — change a value and re-run to see
  cause and effect.
- Compare **demo vs "for real"** to appreciate that these are genuine model
  behaviours, not canned tricks.

> **By the end you should understand**, end to end: how an LLM turns text into a
> prediction, and how the six foundational skills combine into the kinds of AI
> systems companies actually ship.
