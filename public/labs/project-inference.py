"""
Project: Inference Engineering — routing, KV prefix caching & streaming (LangChain)

Runnable script version of the notebook (project-inference.ipynb).
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

import os, getpass, time

PROVIDER = "gemini"   # "gemini" | "openai" | "anthropic"

_KEY_ENV = {"gemini": "GOOGLE_API_KEY", "openai": "OPENAI_API_KEY",
            "anthropic": "ANTHROPIC_API_KEY"}[PROVIDER]
if not os.environ.get(_KEY_ENV):
    os.environ[_KEY_ENV] = getpass.getpass(f"Paste your {PROVIDER} API key: ")

def make_llm(temperature=0.7, top_p=None, top_k=None, tier="fast", **kw):
    """Return a LangChain chat model for the chosen PROVIDER and tier ('fast' or 'frontier')."""
    if PROVIDER == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        model = "gemini-flash-lite-latest" if tier == "fast" else "gemini-2.5-pro"
        p = dict(model=model, temperature=temperature)
        if top_p is not None: p["top_p"] = top_p
        if top_k is not None: p["top_k"] = top_k
        return ChatGoogleGenerativeAI(**p, **kw)
    if PROVIDER == "openai":
        from langchain_openai import ChatOpenAI
        model = "gpt-4o-mini" if tier == "fast" else "gpt-4o"
        p = dict(model=model, temperature=temperature)
        if top_p is not None: p["top_p"] = top_p
        return ChatOpenAI(**p, **kw)
    if PROVIDER == "anthropic":
        from langchain_anthropic import ChatAnthropic
        model = "claude-haiku-4-5-20251001" if tier == "fast" else "claude-sonnet-4-20250514"
        p = dict(model=model, temperature=temperature)
        if top_p is not None: p["top_p"] = top_p
        if top_k is not None: p["top_k"] = top_k
        return ChatAnthropic(**p, **kw)
    raise ValueError("Unknown PROVIDER")


# # Project: Inference Engineering — speed, cost & TTFT at scale
#
# Once your AI feature works, production brings three new bottlenecks: cloud cost,
# latency, and throughput. We solve them with **Model Routing**, **Prefix KV Caching**,
# and **Token Streaming**.


# ## 1 · Model Router — right-size the model for every request

import re

COMPLEXITY_THRESHOLD = 0.5

def score_complexity(query: str) -> float:
    """Lightweight complexity scorer (0.0 = trivial -> 1.0 = deep reasoning)."""
    words = len(query.split())
    hard_markers = bool(re.search(r"compare|architect|trade-off|design|analyze|multi-step|prove", query, re.I))
    return round(min(0.95, max(0.10, (words / 30) * 0.5 + (0.45 if hard_markers else 0.05))), 2)

def route_and_invoke(query: str):
    score = score_complexity(query)
    tier = "frontier" if score >= COMPLEXITY_THRESHOLD else "fast"
    # Note: in free-tier demos we fall back to fast if frontier quota isn't enabled
    llm = make_llm(temperature=0.1, tier="fast")
    t0 = time.perf_counter()
    reply = llm.invoke(query).content
    ms = round((time.perf_counter() - t0) * 1000)
    print(f"[{tier.upper():8s} | score={score:.2f} | {ms}ms] {query[:55]}...")
    print(f"  -> {reply.strip()}\n")

route_and_invoke("Classify this support ticket as BILLING or TECH: 'I was charged twice on my May invoice.'")
route_and_invoke("Compare active-active vs active-passive multi-region failover for a ledger with RPO=0.")


# ## 2 · Prefix KV Caching + Streaming — slash Time-To-First-Token (TTFT)
#
# **Golden rule:** put static tokens (system instructions, schemas, reference handbook)
# at the **very beginning** of the prompt and dynamic user input at the **end**.
# Providers automatically cache the KV matrices of matching prefixes.

from langchain_core.messages import SystemMessage, HumanMessage

STATIC_HANDBOOK_PREFIX = (
    "You are an Acme Corp policy assistant. Use this handbook:\n"
    "- Standard refunds take 5 business days.\n"
    "- Enterprise annual plans include a 30-day money-back guarantee and 99.95% uptime SLA.\n"
    "- Hardware upgrades happen every 3 years via the IT portal.\n"
) * 8   # repeated to simulate a large static prefix

question = "How many business days do standard refunds take, and what do Enterprise plans include?"
messages = [SystemMessage(content=STATIC_HANDBOOK_PREFIX), HumanMessage(content=question)]

llm = make_llm(temperature=0)
t0 = time.perf_counter()
first_token_ms = None
print("Streaming response: ", end="", flush=True)
for chunk in llm.stream(messages):
    if chunk.content and first_token_ms is None:
        first_token_ms = round((time.perf_counter() - t0) * 1000)
    print(chunk.content, end="", flush=True)
total_ms = round((time.perf_counter() - t0) * 1000)
print(f"\n\nTTFT (first token): {first_token_ms} ms | Total generation: {total_ms} ms")
