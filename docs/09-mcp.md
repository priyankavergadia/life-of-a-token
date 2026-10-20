# 9 · 🔌 Project: MCP (Model Context Protocol)

> Part of the [Learner's Walkthrough](../WALKTHROUGH.md) · ← [Memory](08-memory.md) · Next → [Inference Engineering](10-inference.md)

**Goal:** connect AI models to databases, policies, memory stores, and external tools
through one universal standard — **MCP (Model Context Protocol)**, the *"USB-C port
for AI."*

---

## Before you start
Add a key in the **⚡ Go live bar** (any provider works). Without a key you'll see
demos.

---

## The steps

### Overview
- **Read** the pipeline: Host / Client ⇄ MCP Protocol (JSON-RPC) ⇄ MCP Servers ⇄
  Databases & APIs.
- **Learn:** instead of writing $N \times M$ custom integrations between every AI
  client and every data source, MCP defines one open protocol so any client can plug
  into any server.

### The USB-C Port
- **Toggle** between **🔌 With MCP (N + M Universal Plug)** and **🍝 Before MCP
  (N × M Custom Glue)**.
- **Read** the three MCP primitives and how they unify every concept from this course:
  1. **📄 Resources (`resources/read`)** — read-only context streams (connects to
     *RAG*, *Context Engineering* & *Memory*).
  2. **🔧 Tools (`tools/call`)** — executable functions (connects to *Tools &
     Agents*).
  3. **💬 Prompts (`prompts/get`)** — reusable templates & workflows (connects to
     *Vibe Coding*).

### Live Handshake (✎ editable)
- **Click** the server buttons (**📦 orders-mcp**, **📜 policy-mcp**, **💬 slack-mcp**)
  to plug or unplug them at runtime.
- **Click "🔌 Discover & run via MCP for real."**
- **Inspect** the **MCP JSON-RPC Protocol Wire Trace**:
  - `→ tools/list` discovers whichever tools are currently plugged in.
  - `→ resources/read (policy://refunds)` fetches the live refund policy.
  - `→ tools/call` chains `lookup_order` → `issue_refund` → `post_slack_alert`.
- **Learn:** the agent code never imports a database or Slack SDK — it discovers
  capabilities dynamically over MCP and adapts gracefully when a server is unplugged.

### Recap
- **Read** how MCP completes your system architecture — setting up the final project
  (**Inference Engineering**) where you serve the whole stack fast and cheap at scale.

---

## ✅ Takeaway
Write an MCP server once (`@mcp.resource`, `@mcp.tool`, `@mcp.prompt`), and any
MCP-compatible AI client or agent can discover and use it at runtime.

> ← [Memory](08-memory.md) · Next → [Inference Engineering](10-inference.md)
