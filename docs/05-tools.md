# 5 · 🤖 Project: Tools

> Part of the [Learner's Walkthrough](../WALKTHROUGH.md) · ← [RAG](04-rag.md) · Next → [Personalization](06-personalization.md)

**Goal:** build a "digital worker" that answers a real business question by
**chaining tools** — because LLMs are great at language but terrible at math and
can't see your database.

---

## Before you start
Add a key in the **⚡ Go live bar** for the "**Run the agent for real**" button
(any provider). Without a key you'll see a demo trace.

---

## The steps

### Overview
- **Read** the loop: Question → Pick a tool → Run it → Chain + answer.

### Forge tools
- **Read** the two tools and their **docstrings**: `query_sales_db(product_name)`
  and `calculate_profit_margin(revenue, cost)`.
- **Learn:** the model doesn't read your Python — it reads the **description** to
  decide *when* to use each tool. Good docstrings = good agents. Offloading math and
  lookups to code guarantees **0% hallucination on numbers.**

### Execute (✎ editable)
- **Edit** the executive's question (default asks for SuperWidget profit margin given
  a $4,500 cost).
- **Click "Run the agent for real."**
- **Watch the trace:** the agent realises it must `query_sales_db` *first* to get
  revenue, then feed that into `calculate_profit_margin` *second* — multi-step
  reasoning, no human in the loop.
- **Learn:** the agent decides the order of operations itself.

### Recap
- **Read** how adding tools (`run_sql_query`, `restart_server`, `get_exchange_rate`)
  turns this same loop into text-to-SQL bots, DevOps remediation, and live auditors.

---

## ✅ Takeaway
Tools turn a text generator into something that can *act* and *chain steps* reliably.

> ← [RAG](04-rag.md) · Next → [Personalization](06-personalization.md)
