# 8 · 🧠 Project: Memory

> Part of the [Learner's Walkthrough](../WALKTHROUGH.md) · ← [Context Engineering](07-context.md) · Next → [MCP](09-mcp.md)

**Goal:** cure the "amnesiac genius" by building both layers of production AI memory:
**Short-Term Memory** (sliding window + rolling summary inside a chat) and **Long-Term
Memory** (extracting durable user facts into a persistent store across sessions).

---

## Before you start
Add a key in the **⚡ Go live bar** (any provider works). Without a key you'll see
demos.

---

## The steps

### Overview
- **Read** the pipeline: Chat turn → Short-term window → Extract facts → Long-term
  recall.
- **Learn:** every LLM call is stateless (`output = f(input)`). Memory is the state
  layer you wrap around the model so users never have to repeat themselves.

### Short-Term (✎ editable)
- **Drag** the `window_size` slider from `1` to `6`.
- **Watch** how older turns fold into a compact **55-token Rolling Summary** while the
  most recent turns stay **verbatim** in the sliding window.
- **Learn:** appending raw chat history forever explodes your context budget; a
  rolling summary + sliding window keeps token usage flat even in a 100-turn
  conversation.

### Long-Term (✎ editable)
- **Edit** what the user says in **Session 1 (Monday)** (default: Maya, a vegetarian
  backend engineer using FastAPI).
- **Edit** the question in **Session 2 (Friday — brand-new chat, zero history)**.
- **Click "🧠 Extract facts & test Session 2 for real."**
- **Compare:**
  - **Without Memory** → the model wakes up with amnesia and suggests a turkey
    sandwich and a beginner HTML page.
  - **With Long-Term Memory** → structured output extracts `{name, role, diet}` on
    Monday, saves them to `memory_db`, and injects them on Friday to recommend a
    vegetarian lunch and a FastAPI project.

### Recap
- **Read** how short-term and long-term memory work together — and how the next
  project (**MCP**) connects memory, tools, and context sources through one standard.

---

## ✅ Takeaway
Keep in-session history bounded with a sliding window + summary, and persist cross-session
knowledge by extracting structured facts on write and recalling them on read.

> ← [Context Engineering](07-context.md) · Next → [MCP](09-mcp.md)
