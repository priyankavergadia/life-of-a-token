"""
Project: Tools — a multi-step tool-using agent (LangChain)

Runnable script version of the notebook (project-tools.ipynb).
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
        p = dict(model="gemini-2.5-flash", temperature=temperature)
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
        return GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
    if PROVIDER == "openai":
        from langchain_openai import OpenAIEmbeddings
        return OpenAIEmbeddings(model="text-embedding-3-small")
    raise RuntimeError("Claude has no embeddings API. Set PROVIDER to 'gemini' or 'openai'.")


# # Project: Tools — a multi-step, tool-using agent
#
# Give the model real functions (a fake sales DB + exact margin math) and watch it
# chain them: fetch revenue first, then compute the margin. No hallucinated numbers.


# ## 1 · Forge the tools (the docstrings are what the model reads)

from langchain_core.tools import tool

SALES_DB = {"superwidget": 12500, "megagadget": 8400}

@tool
def query_sales_db(product_name: str) -> float:
    """Total Q3 revenue for a product. Use whenever you need how much money a product made."""
    return SALES_DB.get(product_name.lower().replace(" ", ""), 0)

@tool
def calculate_profit_margin(revenue: float, cost: float) -> str:
    """Exact profit-margin %. Use this instead of doing the math yourself."""
    return "0%" if revenue == 0 else f"{((revenue - cost) / revenue) * 100:.2f}%"

toolkit = [query_sales_db, calculate_profit_margin]


# ## 2 · Run the agent and watch it chain the tools

from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import create_tool_calling_agent, AgentExecutor

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an elite Data Analyst. Use your tools. Never guess math or database values."),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])
agent = create_tool_calling_agent(make_llm(temperature=0), toolkit, prompt)
executor = AgentExecutor(agent=agent, tools=toolkit, verbose=True)   # verbose -> see the chain

q = "What was our profit margin on the SuperWidget in Q3 if total manufacturing costs were $4,500?"
print(executor.invoke({"input": q})["output"])
# Expect: query_sales_db("SuperWidget") -> 12500, then calculate_profit_margin(12500, 4500) -> 64.00%
