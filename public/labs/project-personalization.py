"""
Project: Personalization — embeddings + JSON (LangChain)

Runnable script version of the notebook (project-personalization.ipynb).
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


# # Project: Personalization — embeddings + creativity + strict JSON
#
# Find related products by meaning, write creative copy at high temperature, and
# lock it into a strict JSON payload an email API could send.
# (Needs embeddings -> use PROVIDER 'gemini' or 'openai'.)


# ## 1 · Match related products by meaning

from langchain_community.vectorstores import FAISS

catalog = [
    "Ultra-Light Waterproof Hiking Boots - $120",
    "Gore-Tex Rain Jacket with Hood - $85",
    "Solar-Powered Portable Phone Charger - $45",
    "Freeze-Dried Campfire Marshmallows - $5",
    "Heavy-Duty Stainless Steel Coffee Thermos - $25",
    "Ergonomic Office Chair - $250",
]
store = FAISS.from_texts(catalog, make_embeddings())

def recommend(purchase, k=2):
    return [d.page_content for d in store.as_retriever(search_kwargs={"k": k}).invoke(purchase)]

purchase = "4-Person Family Camping Tent"
recs = recommend(purchase)
print(recs)   # boots + rain jacket cluster near a tent; the office chair stays far away


# ## 2 · Generate creative copy locked into strict JSON

from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate

class MarketingEmail(BaseModel):
    subject_line: str       # catchy, include an emoji
    email_body: str         # enthusiastic, ~3 sentences
    discount_code: str      # random 6 uppercase letters
    call_to_action: str     # button text

writer = make_llm(temperature=0.8).with_structured_output(MarketingEmail)   # creative...
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an elite marketing copywriter."),
    ("human", "Recent purchase: {purchase}\nRecommended products: {recs}\nWrite a fun marketing email."),
])
email = (prompt | writer).invoke({"purchase": purchase, "recs": ", ".join(recs)})
print(email.model_dump_json(indent=2))   # ...but guaranteed valid JSON for SendGrid/Mailchimp
