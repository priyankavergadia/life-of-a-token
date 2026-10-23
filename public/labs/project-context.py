"""
Project: Context Engineering — budgeting, ranking & beating Lost-in-the-Middle (LangChain)

Runnable script version of the notebook (project-context.ipynb).
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


def make_embeddings():
    """Embeddings model. Claude has no embeddings API -> use gemini or openai."""
    if PROVIDER == "gemini":
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        return GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    if PROVIDER == "openai":
        from langchain_openai import OpenAIEmbeddings
        return OpenAIEmbeddings(model="text-embedding-3-small")
    raise RuntimeError("Claude has no embeddings API. Set PROVIDER to 'gemini' or 'openai'.")


# # Project: Context Engineering — curate, budget, and rank the context window
#
# Prompt engineering is *how you phrase a question*. **Context engineering** is
# curating *everything the model sees* when it answers — filtering stale drafts,
# enforcing a strict token budget, and placing high-signal facts where attention is strongest.


# ## 1 · Candidate chunks (with real-world noise and an outdated 2021 draft)

CANDIDATES = [
    {"src": "policy_2026.md",    "status": "active",   "tokens": 95,  "score": 0.94,
     "text": "2026 Enterprise Policy: Annual Enterprise plans include a 30-day full refund window and 99.95% uptime SLA."},
    {"src": "billing_faq.md",    "status": "active",   "tokens": 85,  "score": 0.82,
     "text": "Billing FAQ: Refund requests must be submitted by the workspace admin via Settings -> Billing."},
    {"src": "sla_credits.md",    "status": "active",   "tokens": 110, "score": 0.61,
     "text": "SLA Credits: If monthly uptime drops below 99.95%, customers receive a 10% service credit on next renewal."},
    {"src": "draft_2021_old.txt","status": "archived", "tokens": 140, "score": 0.44,
     "text": "[ARCHIVED 2021 DRAFT - DO NOT USE]: Enterprise plans are strictly non-refundable after 7 days."},
    {"src": "slack_random.txt",  "status": "noise",    "tokens": 160, "score": 0.19,
     "text": "#random Slack thread: Anyone know if the espresso machine on floor 4 is fixed yet? Happy Friday!"},
]


# ## 2 · Pack the context window under a strict token budget

def pack_context(candidates, max_budget=260, relevance_cutoff=0.55, filter_archived=True):
    """Filter by relevance & active status, sort highest-signal first, and cap at max_budget tokens."""
    ranked = sorted(candidates, key=lambda c: c["score"], reverse=True)
    packed, used_tokens = [], 0
    for c in ranked:
        if filter_archived and c["status"] == "archived":
            continue
        if c["score"] < relevance_cutoff:
            continue
        if used_tokens + c["tokens"] <= max_budget:
            packed.append(c)
            used_tokens += c["tokens"]
    return packed, used_tokens

packed, used = pack_context(CANDIDATES, max_budget=260, relevance_cutoff=0.55)
print(f"Packed {len(packed)}/{len(CANDIDATES)} chunks ({used} tokens vs {sum(c['tokens'] for c in CANDIDATES)} raw tokens):")
for c in packed:
    print(f"  ✓ {c['src']} (score={c['score']}, {c['tokens']} tok)")


# ## 3 · Compare Stuffed Window vs. Engineered Context

from langchain_core.prompts import ChatPromptTemplate

question = "What is the refund window for annual Enterprise plans, and how do I request one?"
llm = make_llm(temperature=0)
prompt = ChatPromptTemplate.from_messages([
    ("system", "Answer concisely using the provided context:\n{context}"),
    ("human", "{question}"),
])

stuffed_text = "\n\n".join(c["text"] for c in reversed(CANDIDATES))
engineered_text = "\n\n".join(c["text"] for c in packed)

print("\n❌ STUFFED WINDOW (590 tokens, includes archived 2021 draft):")
print("  ", (prompt | llm).invoke({"context": stuffed_text, "question": question}).content)

print("\n✅ ENGINEERED CONTEXT (180 tokens, ranked & pruned):")
print("  ", (prompt | llm).invoke({"context": engineered_text, "question": question}).content)
