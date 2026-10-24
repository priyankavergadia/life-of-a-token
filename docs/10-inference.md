# 10 · ⚡ Project: Inference Engineering

> Part of the [Learner's Walkthrough](../WALKTHROUGH.md) · ← [MCP](09-mcp.md)

**Goal:** take the complete AI system you've built and serve it **10× faster and 80%
cheaper** in production — using **Model Routing**, **Prefix KV Caching**, and **Token
Streaming**.

---

## Before you start
Add a key in the **⚡ Go live bar** (any provider works). Without a key you'll see
realistic demos. Left panel = code, right panel = live metrics & output.

---

## The steps

### Overview
- **Read** the pipeline: Route (tier) → KV Cache → Stream TTFT → Fast & Cheap.
- **Learn:** once your AI system has structured outputs, RAG, curated context,
  memory, and MCP connections, launching to 100,000 users brings three bottlenecks —
  cloud bills, latency, and throughput. Inference engineering solves them at the
  serving layer.

### Model Router (✎ editable)
- **Click** between the **Simple** and **Complex** sample queries, or type your own.
- **Drag** the `complexity_threshold` slider and watch the router flip between the
  **⚡ Fast Flash/Mini Model** (`~$0.20 / 1M tokens`) and the **🧠 Frontier Model**
  (`~$10.00 / 1M tokens`).
- **Click "Route & run for real."**
- **Learn:** 80% of production traffic (classification, fact extraction, simple tool
  routing) can run on a small model — cutting cost by up to 98% with zero quality
  drop.

### Cache & Stream (✎ editable)
- **Toggle** between **⚡ Warm KV Cache + Stream** and **🐢 Cold Prefix + Blocking**.
- **Click "Run & measure TTFT for real."**
- **Learn:**
  - **Prefix KV Caching:** remember **Keys** and **Values** from *Life of a Token*? By
    ordering your context layers from **most static** (system prompt + MCP tool
    schemas + reference handbook) at the top to **most dynamic** (recent memory window
    + live user question) at the bottom, providers reuse the KV matrices from GPU
    memory instead of recomputing them on every turn.
  - **Streaming:** shipping tokens as they are generated drops **Time-To-First-Token
    (TTFT)** from seconds to ~200 ms.

### Recap
- **Celebrate!** You've completed all 8 projects — from a single token inside a
  transformer to a fast, stateful, MCP-connected production AI system.

---

## ✅ Takeaway
Right-size the model per request, order context layers static-first so the KV cache
hits, and stream tokens so users never stare at a spinner.

> ← [MCP](09-mcp.md) · Next → [Evals](11-evals.md) · Back to the [index](../WALKTHROUGH.md)
