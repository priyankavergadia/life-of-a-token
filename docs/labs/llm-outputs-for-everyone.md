# Project: LLM Outputs — For Everyone (no coding needed)

How to make an AI return **trustworthy, structured data** instead of a chatty
paragraph — shown as a document-auditing pipeline: a picture goes in, a PASS/FAIL
decision comes out.

👉 **Open it:** https://priyankavergadia.github.io/life-of-a-token/#/llm-outputs

---

## Before you start
Add a free API key in the **⚡ Go live** bar (any provider works here). No key →
demo mode. See the [GenAI Lab guide](genai-lab-for-everyone.md#before-you-start-get-a-free-api-key)
for where to get one.

---

## Walk it
1. **Overview** — Read the pipeline: Identify → Extract to a schema → Validate →
   Decision gate.
2. **Schema** — See the strict list of fields the AI must fill (sender, weight,
   international?, tracking ID, confidence). *Lesson: forcing a fixed shape means
   the next system can trust the output.*
3. **Extract & Audit** — Upload a shipping label (or use the sample) and click
   **Audit**. The AI *reads* the image; plain rules *judge* it (e.g. over 50 kg →
   FAIL). *Lesson: let the AI read, but let code make the decision — so it's
   auditable and never made up.*

## ✅ What you'll understand
Why production AI returns **structured data + code-based rules**, not free-form
text — the difference between a demo and something you can put in a real workflow.

---

### Want the actual code?
See the **[developer guide](llm-outputs-for-developers.md)** and grab the
[`.ipynb`](../../public/labs/project-llm-outputs.ipynb) or
[`.py`](../../public/labs/project-llm-outputs.py).
