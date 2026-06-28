# Project: RAG — For Everyone (no coding needed)

How to build an AI "Oracle" that answers **only** from approved documents — and
honestly **refuses** anything else. Plus a clear look at **RAG vs fine-tuning**.

👉 **Open it:** https://priyankavergadia.github.io/life-of-a-token/#/rag

---

## Before you start
Add a key in the **⚡ Go live** bar. This project's search needs **Gemini** or
**OpenAI** (Claude has no embeddings). No key → demo mode.

---

## Walk it
1. **Overview** — Ingest docs → Embed + index → Retrieve → Answer or refuse.
2. **Knowledge** — Edit the policy list directly, or **upload your own `.txt`/`.md`**
   as the knowledge base. *Lesson: the AI searches by meaning, not keywords.*
3. **Retrieve + Answer** — Pick or type a question and click **Retrieve + answer**.
   In-scope questions are answered from the docs; out-of-scope and "jailbreak"
   questions are refused. *Lesson: grounding + a strict instruction beats a
   confident wrong answer.*
4. **RAG vs Fine-tune** — Toggle the two:
   - **RAG = new knowledge:** change a fact today → fresh answer instantly.
   - **Fine-tuning = new behaviour:** thousands of examples teach a new *personality*
     (here, a funny cat voice); compare the plain vs. fine-tuned reply.
   *Lesson: RAG changes what the AI knows; fine-tuning changes how it behaves.*

## ✅ What you'll understand
How to keep an AI honest and on-topic, and when to reach for RAG vs fine-tuning.

---

### Want the actual code?
See the **[developer guide](rag-for-developers.md)** and grab the
[`.ipynb`](../../public/labs/project-rag.ipynb) or
[`.py`](../../public/labs/project-rag.py).
