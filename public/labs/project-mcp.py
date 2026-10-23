"""
Project: MCP (Model Context Protocol) — universal Resources, Tools & Prompts (LangChain)

Runnable script version of the notebook (project-mcp.ipynb).
Pick a provider + paste an API key in the SETUP section, then run top to bottom.
"""


# ## 0 · Setup — pick a provider and add your key
#
# These labs are **model-agnostic**: flip `PROVIDER` between `"gemini"`, `"openai"`,
# and `"anthropic"` and everything else stays the same.
#
# Get a free key:
# - Gemini: https://aistudio.google.com/apikey
# - OpenAI: https://platform.openai.com/api-keys
# - Anthropic: https://console.anthropic.com/settings/keys

# --- notebook setup cell: run these installs manually ---
# %pip install -q langchain langchain-core langchain-community langchain-classic langchain-google-genai langchain-openai langchain-anthropic faiss-cpu numpy requests

import os, getpass, json

PROVIDER = "gemini"   # "gemini" | "openai" | "anthropic"

_KEY_ENV = {"gemini": "GOOGLE_API_KEY", "openai": "OPENAI_API_KEY",
            "anthropic": "ANTHROPIC_API_KEY"}[PROVIDER]
if not os.environ.get(_KEY_ENV):
    os.environ[_KEY_ENV] = getpass.getpass(f"Paste your {PROVIDER} API key: ")

def make_llm(temperature=0.7, top_p=None, top_k=None, **kw):
    """Return a LangChain chat model for the chosen PROVIDER."""
    if PROVIDER == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        p = dict(model="gemini-flash-lite-latest", temperature=temperature)
        if top_p is not None: p["top_p"] = top_p
        if top_k is not None: p["top_k"] = top_k
        return ChatGoogleGenerativeAI(**p, **kw)
    if PROVIDER == "openai":
        from langchain_openai import ChatOpenAI
        p = dict(model="gpt-4o-mini", temperature=temperature)
        if top_p is not None: p["top_p"] = top_p
        return ChatOpenAI(**p, **kw)
    if PROVIDER == "anthropic":
        from langchain_anthropic import ChatAnthropic
        p = dict(model="claude-haiku-4-5-20251001", temperature=temperature)
        if top_p is not None: p["top_p"] = top_p
        if top_k is not None: p["top_k"] = top_k
        return ChatAnthropic(**p, **kw)
    raise ValueError("Unknown PROVIDER")


# # Project: Model Context Protocol (MCP) — the universal USB-C port for AI
#
# Instead of writing N x M custom integrations between every AI client and every tool/data
# source, **MCP** defines one open JSON-RPC protocol with three primitives:
# - **Resources** (`resources/read`) -> read-only context (policies, files, DB rows)
# - **Tools** (`tools/call`)         -> executable functions (orders, refunds, Slack)
# - **Prompts** (`prompts/get`)      -> reusable prompt templates


# ## 1 · Build a FastMCP-style Server with Resources, Tools, and Prompts
#
# Uses the official `mcp` SDK if installed, with a lightweight in-process JSON-RPC
# fallback so this notebook runs anywhere out of the box.

class MiniFastMCP:
    """Self-contained FastMCP-compatible server exposing resources, tools, and prompts."""
    def __init__(self, name: str):
        self.name = name
        self._resources, self._tools, self._prompts = {}, {}, {}

    def resource(self, uri: str):
        def deco(fn):
            self._resources[uri] = fn
            return fn
        return deco

    def tool(self):
        def deco(fn):
            self._tools[fn.__name__] = fn
            return fn
        return deco

    def prompt(self):
        def deco(fn):
            self._prompts[fn.__name__] = fn
            return fn
        return deco

    def handle_rpc(self, method: str, params: dict = None):
        params = params or {}
        print(f"  [MCP JSON-RPC ->] {method} {json.dumps(params)}")
        if method == "initialize":
            return {"server": self.name, "capabilities": ["resources", "tools", "prompts"]}
        if method == "resources/read":
            return {"uri": params["uri"], "text": self._resources[params["uri"]]()}
        if method == "tools/list":
            return {"tools": [{"name": k, "description": fn.__doc__} for k, fn in self._tools.items()]}
        if method == "tools/call":
            res = self._tools[params["name"]](**params.get("arguments", {}))
            return {"content": res}
        if method == "prompts/get":
            res = self._prompts[params["name"]](**params.get("arguments", {}))
            return {"prompt": res}
        raise ValueError(f"Unknown MCP method: {method}")

mcp = MiniFastMCP("AcmeSupportMCP")

ORDERS_DB = {
    "ORD-404": {"item": "Ergonomic Mechanical Keyboard", "amount_usd": 49, "days_ago": 10, "status": "delivered_damaged"},
    "ORD-777": {"item": "4K Studio Monitor", "amount_usd": 399, "days_ago": 45, "status": "delivered"},
}

@mcp.resource("policy://refunds")
def get_refund_policy() -> str:
    return "Refund Policy: Damaged orders within 30 days of delivery qualify for an instant 100% refund."

@mcp.tool()
def lookup_order(order_id: str) -> str:
    """Look up an order by order_id (e.g. ORD-404) in the Orders MCP server."""
    return json.dumps(ORDERS_DB.get(order_id.upper(), {"error": "not_found"}))

@mcp.tool()
def issue_refund(order_id: str, amount_usd: float) -> str:
    """Issue a refund in USD for an eligible order_id."""
    return json.dumps({"status": "REFUNDED", "order_id": order_id, "amount_usd": amount_usd, "tx_id": "RF-9021"})

@mcp.tool()
def post_slack_alert(channel: str, message: str) -> str:
    """Post a short confirmation alert to a Slack channel such as #support-ops."""
    return f"Posted to {channel}: {message}"

@mcp.prompt()
def triage_order_prompt(order_id: str) -> str:
    """Reusable MCP prompt template for damaged-order triage."""
    return f"Order {order_id} arrived damaged. Check the order, verify refund eligibility, issue the refund, and notify #support-ops."


# ## 2 · Discover capabilities via MCP JSON-RPC & run the agent

from langchain_core.tools import tool as lc_tool
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.agents import AgentExecutor, create_tool_calling_agent

print("1. Handshake & capability discovery:")
print("  <-", mcp.handle_rpc("initialize"))
policy_res = mcp.handle_rpc("resources/read", {"uri": "policy://refunds"})
discovered = mcp.handle_rpc("tools/list")["tools"]
print("  <- Discovered tools:", [t["name"] for t in discovered])

# Bind the discovered MCP tools for LangChain (each call routes over MCP JSON-RPC 'tools/call')
@lc_tool
def lookup_order_tool(order_id: str) -> str:
    """Look up an order by order_id (e.g. ORD-404) via the Orders MCP server."""
    return mcp.handle_rpc("tools/call", {"name": "lookup_order", "arguments": {"order_id": order_id}})["content"]

@lc_tool
def issue_refund_tool(order_id: str, amount_usd: float) -> str:
    """Issue a refund in USD for an eligible order_id via the Orders MCP server."""
    return mcp.handle_rpc("tools/call", {"name": "issue_refund", "arguments": {"order_id": order_id, "amount_usd": amount_usd}})["content"]

@lc_tool
def post_slack_alert_tool(channel: str, message: str) -> str:
    """Post a short confirmation alert to a Slack channel (e.g. #support-ops) via the Slack MCP server."""
    return mcp.handle_rpc("tools/call", {"name": "post_slack_alert", "arguments": {"channel": channel, "message": message}})["content"]

toolkit = [lookup_order_tool, issue_refund_tool, post_slack_alert_tool]

prompt = ChatPromptTemplate.from_messages([
    ("system", f"You are an operations agent connected via MCP.\nDiscovered Resource [policy://refunds]: {policy_res['text']}"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

agent = create_tool_calling_agent(make_llm(temperature=0), toolkit, prompt)
executor = AgentExecutor(agent=agent, tools=toolkit, verbose=True)

query = mcp.handle_rpc("prompts/get", {"name": "triage_order_prompt", "arguments": {"order_id": "ORD-404"}})["prompt"]
print("\n2. Agent execution over MCP:")
print(executor.invoke({"input": query})["output"])
