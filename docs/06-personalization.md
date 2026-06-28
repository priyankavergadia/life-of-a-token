# 6 · 📧 Project: Personalization

> Part of the [Learner's Walkthrough](../WALKTHROUGH.md) · ← [Tools](05-tools.md)

**Goal:** hyper-personalised marketing at scale — the finale that combines
**embeddings** (find related products), **high temperature** (creative copy), and
**structured output** (strict JSON an email API can send).

---

## Before you start
Add a key in the **⚡ Go live bar**. The Matchmaker step needs **embeddings**, so use
**Gemini** or **OpenAI** (Claude has no embeddings API). Without a key you'll see
demos.

---

## The steps

### Overview
- **Read** the pipeline: Match (embeddings) → Create (temp 0.8) → Lock to JSON →
  Auto-send.

### Matchmaker
- **Edit** what the customer bought (default: a camping tent).
- **Click "Match for real"** (needs Gemini/OpenAI).
- **See** vector math recommend related products (boots, rain jacket) while unrelated
  items (office chair) stay far away.
- **Learn:** recommendations by **meaning**, not keyword overlap.

### Generate
- **Edit** the purchase if you like; the recommendations carry over from Matchmaker.
- **Click "Generate for real (temp 0.8)."**
- **See** the *same output two ways:* a friendly marketing email **and** the strict
  **JSON payload** behind it (subject, body, discount code, CTA).
- **Learn:** high temperature makes it creative; the schema **traps** that creativity
  in a structure an automated email server (SendGrid/Mailchimp) can actually send.

### Recap
- **Read** how the same pattern powers cold-email SDRs, push notifications, and SEO
  content factories.

---

## ✅ Takeaway
You can have *both* creativity and reliability — creative copy locked inside a
predictable payload.

> ← [Tools](05-tools.md) · Back to the [index](../WALKTHROUGH.md)
