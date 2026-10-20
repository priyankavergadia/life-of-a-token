# Project: MCP (Model Context Protocol) — For Developers

Build a **FastMCP**-style server exposing **Resources**, **Tools**, and **Prompts**,
inspect the JSON-RPC protocol wire trace (`initialize` → `resources/read` →
`tools/list` → `tools/call`), and bridge discovered MCP capabilities into a
model-agnostic LangChain agent.

**Download:** [`project-mcp.ipynb`](../../public/labs/project-mcp.ipynb) ·
[`project-mcp.py`](../../public/labs/project-mcp.py)
**Live reference:** https://priyankavergadia.github.io/life-of-a-token/#/mcp

---

## Run it — two ways

### ▶ Option A — Open in Google Colab (zero setup)
1. Open: https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/project-mcp.ipynb
2. Run the first cell (`%pip install …`).
3. Set `PROVIDER` and paste your key.

### 💻 Option B — Local Python
```bash
python -m venv .venv && source .venv/bin/activate
pip install langchain langchain-core langchain-community langchain-classic langchain-google-genai langchain-openai langchain-anthropic faiss-cpu numpy requests
python project-mcp.py   # or: jupyter lab project-mcp.ipynb
```

## Flow
1. **Define the MCP Server** — registers a read-only resource
   (`@mcp.resource("policy://refunds")`) and three executable tools
   (`lookup_order`, `issue_refund`, `post_slack_alert`).
2. **JSON-RPC Handshake & Discovery** — executes `initialize`, `resources/read`, and
   `tools/list` over the MCP wire handler and prints every JSON-RPC request/response.
3. **Agent Execution over MCP** — binds the discovered MCP tools and policy resource
   into `create_tool_calling_agent`, chaining `lookup_order` → `issue_refund` →
   `post_slack_alert` through `tools/call`.

## Why this design
- **Decoupled capability servers:** The agent never imports database drivers or Slack
  SDKs directly. It discovers available tools (`tools/list`), reads context URIs
  (`resources/read`), and invokes actions (`tools/call`) over a uniform JSON-RPC
  boundary.
- **Self-contained + standard-compatible:** `MiniFastMCP` mirrors the official
  `mcp.server.fastmcp.FastMCP` decorator API (`@mcp.resource`, `@mcp.tool`,
  `@mcp.prompt`) so the notebook runs anywhere with zero external server processes.

## Tweak / extend
- Swap `MiniFastMCP` for `from mcp.server.fastmcp import FastMCP` (`pip install mcp`)
  and run the server over stdio or SSE.
- Connect your MCP server directly to Claude Desktop, Cursor, or Antigravity via
  `mcp_config.json`.
- Add a second MCP server (e.g. `inventory-mcp`) and merge `tools/list` from multiple
  servers into one agent toolkit.

## Gotchas
- **Tool docstrings and type hints are mandatory:** MCP generates the JSON Schema sent
  in `tools/list` directly from your Python function signature and docstring.
- Keep **Resources** side-effect-free (read-only context) and use **Tools** for any
  operation that mutates state or calls external APIs.
