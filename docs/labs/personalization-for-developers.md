# Project: Personalization — For Developers

Combines embeddings (semantic product match), high-temperature generation, and
structured output (Pydantic) into a creative-but-parseable email payload.

**Download:** [`project-personalization.ipynb`](../../public/labs/project-personalization.ipynb) ·
[`project-personalization.py`](../../public/labs/project-personalization.py)
**Live reference:** https://priyankavergadia.github.io/life-of-a-token/#/personalization

---

## Run it — two ways

### ▶ Option A — Open in Google Colab (zero setup)
1. Open: https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/project-personalization.ipynb
   (or click **🚀 Open in Colab** in the app's *For developers* panel).
2. Run the first cell (`%pip install …`) — Colab installs everything.
3. Set `PROVIDER` to **`gemini`** or **`openai`** (embeddings required) and paste your key.
4. Run top to bottom.

### 💻 Option B — Local Python
1. Python 3.10+. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate          # Windows: .venv\Scripts\activate
   ```
2. Install the dependencies:
   ```bash
   pip install langchain langchain-core langchain-community langchain-google-genai langchain-openai langchain-anthropic faiss-cpu numpy
   ```
3. Run it as a **notebook** or a **script**:
   ```bash
   pip install jupyterlab && jupyter lab project-personalization.ipynb   # notebook
   python project-personalization.py                                     # script
   ```
4. Set `PROVIDER="gemini"` or `"openai"` + paste your key (Claude has no embeddings API).

## Flow
1. **Setup** — `PROVIDER` + key.
2. **Match** — `FAISS.from_texts(catalog, make_embeddings())`; `recommend(purchase, k)`
   returns the top-k related products by vector similarity.
3. **Generate** — a `MarketingEmail(BaseModel)` schema +
   `make_llm(temperature=0.8).with_structured_output(MarketingEmail)`. A
   `ChatPromptTemplate` feeds the purchase + recommendations; the result is printed
   with `email.model_dump_json(indent=2)`.

## Why this design
- **Temperature 0.8** for lively copy, but `with_structured_output` **traps** that
  creativity in valid JSON (subject, body, discount code, CTA) an email API can send.
- Recommendations are semantic, so a "tent" surfaces boots/jackets, not keyword
  matches.

## Tweak / extend
- Add a `customer_persona` field to the schema and prompt.
- Raise `k`, or filter the catalog by category before matching.
- Pipe `model_dump()` straight into SendGrid/Mailchimp.
- A/B test subject lines by generating N variants at higher temperature.

## Gotchas
- Embeddings require Gemini/OpenAI.
- If `with_structured_output` errors on a provider, fall back to a JSON-mode prompt
  + `json.loads`, or validate with `MarketingEmail.model_validate_json`.
