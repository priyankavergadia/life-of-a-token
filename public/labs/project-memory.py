"""
Project: Memory — short-term rolling window + long-term fact store (LangChain)

Runnable script version of the notebook (project-memory.ipynb).
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

import os, getpass

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


# # Project: Memory — short-term conversation state & long-term user profile
#
# Every LLM call is stateless by default. Production memory uses two layers:
# 1. **Short-Term Memory**: keep the last `k` turns verbatim + fold older turns into a summary.
# 2. **Long-Term Memory**: extract durable facts (`with_structured_output`) into a persistent store across sessions.


# ## 1 · Short-Term Memory — sliding window + rolling summary

from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

llm = make_llm(temperature=0)
HISTORY = [
    ("Hi! I'm Maya, a backend lead at FinStack.", "Nice to meet you, Maya!"),
    ("We build payment APIs in Python and FastAPI.", "FastAPI is great for typed async services."),
    ("Our database is PostgreSQL 16 on Cloud SQL.", "Got it — Postgres 16 on Cloud SQL."),
    ("I'm strictly vegetarian, by the way.", "Noted! Vegetarian options only."),
    ("We are preparing for a SOC2 audit next month.", "SOC2 requires strict audit logging."),
]

def build_short_term_messages(history, window_size=2):
    old_turns = history[:-window_size]
    recent_turns = history[-window_size:]
    messages = []
    if old_turns:
        transcript = "\n".join(f"User: {u}\nAI: {a}" for u, a in old_turns)
        summary = llm.invoke(f"Summarize key user & project facts in 1 sentence:\n{transcript}").content
        messages.append(SystemMessage(content=f"Conversation summary so far: {summary}"))
    for u, a in recent_turns:
        messages.extend([HumanMessage(content=u), AIMessage(content=a)])
    return messages

stm = build_short_term_messages(HISTORY, window_size=2)
for m in stm:
    print(f"[{m.type.upper()}] {m.content}")


# ## 2 · Long-Term Memory — extract facts in Session 1, recall in Session 2

from typing import List
from pydantic import BaseModel, Field

class MemoryFact(BaseModel):
    key: str = Field(description="short attribute name, e.g. 'name', 'role', 'diet', 'stack'")
    value: str = Field(description="concise value to remember across sessions")

class MemoryPatch(BaseModel):
    facts: List[MemoryFact]

extractor = make_llm(temperature=0).with_structured_output(MemoryPatch)
LONG_TERM_DB = {}   # user_id -> {key: value}

# --- Session 1 (Monday) ---
user_msg = "Hi, I'm Maya! I'm a vegetarian backend engineer building microservices in FastAPI."
patch = extractor.invoke(f"Extract durable profile facts from this message:\n{user_msg}")
LONG_TERM_DB["maya"] = {f.key: f.value for f in patch.facts}
print("\nSaved to LONG_TERM_DB['maya']:", LONG_TERM_DB["maya"])

# --- Session 2 (Friday — brand new chat, zero history) ---
question = "Suggest a quick working lunch and a weekend coding project for me."

print("\n❌ WITHOUT Long-Term Memory (amnesia):")
print("  ", llm.invoke(question).content)

profile_str = "; ".join(f"{k}: {v}" for k, v in LONG_TERM_DB["maya"].items())
print("\n✅ WITH Long-Term Memory Recalled:")
print("  ", llm.invoke([
    SystemMessage(content=f"Personalize your answer using these known user facts: {profile_str}"),
    HumanMessage(content=question),
]).content)
