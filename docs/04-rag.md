# 4 · 📚 Project: RAG

> Part of the [Learner's Walkthrough](../WALKTHROUGH.md) · ← [LLM Outputs](03-llm-outputs.md) · Next → [Tools](05-tools.md)

**Goal:** build an "Oracle" that answers **only** from approved documents and
**refuses** everything else — the cure for confident hallucination. This project
also contrasts RAG with fine-tuning.

---

## Before you start
Add a key in the **⚡ Go live bar**. Retrieval needs **embeddings**, so use
**Gemini** or **OpenAI** (Claude has no embeddings API). Without a key you'll see
demos.

---

## The steps

### Overview
- **Read** the pipeline: Ingest docs → Embed + index → Retrieve → Answer or refuse.
- **Learn:** the biggest enterprise risk is *confident wrong answers*; this design
  answers strictly from your text.

### Knowledge (✎ editable + uploadable)
- **Edit** the policy list directly (one item per line), **or** click
  "**upload .txt/.md**" to load your own document as the knowledge base.
- **Learn:** each item becomes a vector in a search index; your change flows live
  into the next step. Search is by **meaning**, not keywords.

### Retrieve + Answer
- **Pick** a sample question *or* type your own.
- **Click "Retrieve + answer for real"** (needs Gemini/OpenAI).
- **Watch:** vector search pulls the top-2 matching policies, and the model answers
  using *only* those — and **refuses** out-of-bounds or jailbreak questions.
- **Learn:** retrieval + a strict system instruction = grounded answers, or an
  honest "I don't know."

### RAG vs Fine-tune (interactive)
- **Toggle** the two buttons — they demonstrate two *different* jobs:
  - **📚 RAG · new knowledge:** a fact changes *today* → RAG reads the updated doc
    and answers fresh, instantly. Click "Answer with RAG for real."
  - **🧬 Fine-tuning · new behaviour:** browse a sample of ~5,000 **tone-training
    pairs** teaching a funny, cat-like voice, then compare the **base** answer vs
    the **fine-tuned** answer to the same question. Click "Hear the tone change for
    real."
- **Learn the distinction:**
  - **RAG changes what the model KNOWS** (facts) — instant, just edit data.
  - **Fine-tuning changes how the model BEHAVES** (tone/style/format) — slow and
    costly, baked into the weights.
  - Real systems often use **both**.

### Recap
- **Read** the recap; the same pattern scales to Confluence, contracts, or clinical
  guidelines.

---

## ✅ Takeaway
RAG grounds answers in your data and refuses the rest; reach for fine-tuning only
when you need to change *behaviour*, not facts.

> ← [LLM Outputs](03-llm-outputs.md) · Next → [Tools](05-tools.md)
