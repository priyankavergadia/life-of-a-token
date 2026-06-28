"""
Project: LLM Outputs — structured output + vision (LangChain)

Runnable script version of the notebook (project-llm-outputs.ipynb).
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


# # Project: LLM Outputs — structured output + vision auditing
#
# Force the model to return strict, typed data, then judge it with plain Python.
# A document image goes in; a PASS/FAIL decision comes out.


# ## 1 · Define the schema (the guardrail)

from typing import Optional
from pydantic import BaseModel, Field

class ShippingDocument(BaseModel):
    sender_name: str
    weight_kg: float = Field(description="weight in kg; if pounds, convert at 1lb=0.45kg")
    is_international: bool
    tracking_id: Optional[str] = None
    confidence_score: float = Field(description="OCR confidence 0.0-1.0")

# with_structured_output forces the model to fill exactly these fields.
structured_llm = make_llm(temperature=0).with_structured_output(ShippingDocument)


# ## 2 · Extract fields from a document image

import base64
from langchain_core.messages import HumanMessage

IMAGE_PATH = "shipping_label.png"   # <-- a local label/document image
with open(IMAGE_PATH, "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

message = HumanMessage(content=[
    {"type": "text", "text": "Extract the shipping document fields from this image."},
    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}},
])
data = structured_llm.invoke([message])
print(data)


# ## 3 · Validate with deterministic business rules

issues = []
if data.weight_kg > 50.0:
    issues.append("Weight exceeds the 50 kg limit for standard ground.")
if data.is_international and not data.tracking_id:
    issues.append("International shipments require a Tracking ID.")

status = "FAIL" if issues else "PASS"
print(status, issues)
# The model READS; Python JUDGES -> the verdict is auditable, never hallucinated.
