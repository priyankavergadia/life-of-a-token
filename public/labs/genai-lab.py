"""
GenAI Lab — the six foundations (LangChain)

Runnable script version of the notebook (genai-lab.ipynb).
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


# # GenAI Lab — the six foundations
#
# Run each section below. With a key, you get real model output; the comments tell
# you what to look for.


# ## Lab 1 · The Toggle — one line, any vendor

llm = make_llm(temperature=0.7)
print(llm.invoke("In one sentence, what is an API?").content)
# Now change PROVIDER at the top and re-run — your app code never changes.


# ## Lab 2 · Temperature, Top-P, Top-K — the randomness dials

prompt = "Write a 5-word tagline for a futuristic coffee shop."

print("temperature 0.0 — deterministic (same every run):")
cold = make_llm(temperature=0.0)
for _ in range(3):
    print("  ", cold.invoke(prompt).content)

print("\ntemperature 1.0 + top_p/top_k — creative (varies every run):")
hot = make_llm(temperature=1.0, top_p=0.95, top_k=40)
for _ in range(3):
    print("  ", hot.invoke(prompt).content)


# ## Lab 3 · Embeddings — words become numbers with meaning

import numpy as np

emb = make_embeddings()
words = ["Cat", "Feline", "Stock Market", "Investment"]
vectors = emb.embed_documents(words)

def cosine(a, b):
    a, b = np.array(a), np.array(b)
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))

print("Cat <-> Feline       ", round(cosine(vectors[0], vectors[1]), 3))   # ~0.8+
print("Cat <-> Stock Market ", round(cosine(vectors[0], vectors[2]), 3))   # low


# ## Lab 4 · Context / RAG — stop the model guessing

from langchain_core.prompts import ChatPromptTemplate

question = "What is the guest Wi-Fi password for Acme Corp?"

print("WITHOUT context (it guesses / hallucinates):")
print("  ", make_llm(temperature=0.3).invoke(question).content)

context = "Acme Corp IT Policy: guest network 'Acme_Guest', password 'P@ssw0rd2026!'."
rag_prompt = ChatPromptTemplate.from_messages([
    ("system", "Answer using ONLY this context. If unknown, say so.\nContext: {context}"),
    ("human", "{question}"),
])
chain = rag_prompt | make_llm(temperature=0)
print("\nWITH context (RAG — grounded):")
print("  ", chain.invoke({"context": context, "question": question}).content)


# ## Lab 5 · Agents — let the model call a tool

from langchain_core.tools import tool
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import create_tool_calling_agent, AgentExecutor

@tool
def calculate_shipping_cost(weight_kg: float, destination: str) -> str:
    """Calculate shipping cost from a package weight (kg) and destination city."""
    return f"Shipping to {destination}: ${10.0 + weight_kg * 2.5:.2f}"

tools = [calculate_shipping_cost]
agent_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant. Use tools when they help."),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])
agent = create_tool_calling_agent(make_llm(temperature=0), tools, agent_prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
print(executor.invoke({"input": "How much to ship a 5 kg box to Paris?"})["output"])


# ## Lab 6 · Vision — give the model eyes

import base64
from langchain_core.messages import HumanMessage

IMAGE_PATH = "your_image.png"   # <-- point this at a local image file
with open(IMAGE_PATH, "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

message = HumanMessage(content=[
    {"type": "text", "text": "Describe what is in this image in 2-3 sentences."},
    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}},
])
print(make_llm(temperature=0).invoke([message]).content)
