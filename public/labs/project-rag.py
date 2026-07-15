"""
Project: RAG — grounded retrieval + refusal (LangChain)

Runnable script version of the notebook (project-rag.ipynb).
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
# %pip install -q langchain langchain-core langchain-community langchain-google-genai langchain-openai langchain-anthropic faiss-cpu numpy

import os, getpass

PROVIDER = "gemini"   # "gemini" | "openai" | "anthropic"

_KEY_ENV = {"gemini": "GOOGLE_API_KEY", "openai": "OPENAI_API_KEY",
            "anthropic": "ANTHROPIC_API_KEY"}[PROVIDER]
if not os.environ.get(_KEY_ENV):
    os.environ[_KEY_ENV] = getpass.getpass(f"Paste your {PROVIDER} API key: ")

def make_llm(temperature=0.7, top_p=None, top_k=None, **kw):
    """Return a LangChain chat model for the chosen PROVIDER.
    top_k is supported by Gemini & Anthropic only (OpenAI's API has none)."""
    if PROVIDER == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        p = dict(model="gemini-flash-lite-latest", temperature=temperature)
        if top_p is not None: p["top_p"] = top_p
        if top_k is not None: p["top_k"] = top_k
        return ChatGoogleGenerativeAI(**p, **kw)
    if PROVIDER == "openai":
        from langchain_openai import ChatOpenAI
        p = dict(model="gpt-4o-mini", temperature=temperature)
        if top_p is not None: p["top_p"] = top_p        # OpenAI: no top_k
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


# # Project: RAG — grounded answers, or an honest refusal
#
# Index your documents, retrieve by meaning, and answer ONLY from what was found.
# (Needs embeddings -> use PROVIDER 'gemini' or 'openai'.)


# ## 1 · Ingest the knowledge base into a vector index

from langchain_community.vectorstores import FAISS

company_policies = [
    "Remote Work: up to 3 days/week; Tuesdays & Thursdays are in-office.",
    "Hardware: one laptop upgrade every 3 years; monitors via the IT portal.",
    "Travel: domestic economy; international over 6h may be premium economy.",
    "Security: 14-char passwords changed every 90 days; 2FA mandatory.",
]
vectorstore = FAISS.from_texts(company_policies, make_embeddings())
retriever = vectorstore.as_retriever(search_kwargs={"k": 2})


# ## 2 · Answer strictly from retrieved context (or refuse)

from langchain_core.prompts import ChatPromptTemplate

REFUSAL = "I do not have enough information to answer that based on company policy."
prompt = ChatPromptTemplate.from_messages([
    ("system",
     'You are an HR assistant. Answer using ONLY the provided context. '
     'If the answer is not in the context, reply exactly: "' + REFUSAL + '"\n'
     "Context:\n{context}"),
    ("human", "{question}"),
])

def ask(q):
    docs = retriever.invoke(q)
    context = "\n".join(d.page_content for d in docs)
    return (prompt | make_llm(temperature=0)).invoke({"context": context, "question": q}).content

for q in ["How often can I upgrade my laptop?",      # in-domain -> answered
          "What is the policy on maternity leave?"]:  # out-of-domain -> refused
    print(q, "\n  ->", ask(q), "\n")


# ## 3 · RAG vs Fine-tuning — knowledge vs behaviour
#
# **RAG changes what the model KNOWS** (facts) — instant, just edit the data above.
#
# **Fine-tuning changes how the model BEHAVES** (tone/style) — you train on
# thousands of examples and bake a new voice into the weights. You can't run a real
# fine-tune in this notebook, but here's the *shape* of the training data and the
# call you'd make (e.g. with the OpenAI fine-tuning API).

# A funny, cat-like personality, taught by ~thousands of example pairs:
finetune_dataset = [
    {"messages": [
        {"role": "user", "content": "Your order has shipped."},
        {"role": "assistant", "content": "Pounce! \U0001F4E6 it's on the prowl, meow~ \U0001F63A"}]},
    {"messages": [
        {"role": "user", "content": "The meeting is at 3pm."},
        {"role": "assistant", "content": "Psst \U0001F431 3pm — I'll be loafing nearby. \U0001F63C"}]},
    # ... ~5,000 more pairs ...
]

# Conceptually (do NOT run here — costs money + takes time):
# 1) upload finetune_dataset as JSONL
# 2) create a fine-tuning job -> get a new model id
# 3) make_llm() now points at that model and ALWAYS talks like a cat,
#    with no runtime instructions. RAG can add facts; only fine-tuning
#    changes the personality.
print(f"{len(finetune_dataset)} example pairs ready (real jobs use thousands).")
