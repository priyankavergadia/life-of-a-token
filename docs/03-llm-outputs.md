# 3 · 🛡️ Project: LLM Outputs

> Part of the [Learner's Walkthrough](../WALKTHROUGH.md) · ← [GenAI Lab](02-genai-lab.md) · Next → [RAG](04-rag.md)

**Goal:** stop "chatting" with a model and instead force it to return **strict,
trustworthy data** a downstream system can rely on — demonstrated with a
document-auditing pipeline (structured output + vision).

---

## Before you start
Use the **⚡ Go live bar** to add a key for the "**Run for real**" buttons (any
provider works here). Without a key you'll see realistic demos. Left panel = code,
right panel = result.

---

## The steps

### Overview
- **Read** the pipeline: Identify → Extract to schema → Validate → Decision gate.
- **Learn:** a picture goes in, a **PASS/FAIL decision** comes out — no human typing.

### Schema
- **Read** the `ShippingDocument` schema (sender, weight, is_international,
  tracking_id, confidence).
- **Learn:** instead of a chatty paragraph, the model is **forced** to fill in
  exactly these fields, so the next system (a database, an API) can trust them.

### Extract & Audit
- **Upload** a shipping-label / document image (or use the sample).
- **Click "Audit for real."** The model reads the image into the schema; then
  **plain Python rules** decide PASS/FAIL (e.g. weight > 50 kg fails; international
  with no tracking ID fails).
- **Learn:** the model does the **reading**; deterministic code does the
  **judging** — so the verdict is auditable and never hallucinated.

### Recap
- **Read** what you built; the same pipeline works for invoices, passports, and
  insurance claims.

---

## ✅ Takeaway
Schema-enforced output + code-based rules = AI you can put in a production decision
path.

> ← [GenAI Lab](02-genai-lab.md) · Next → [RAG](04-rag.md)
