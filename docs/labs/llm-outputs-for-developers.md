# Project: LLM Outputs — For Developers

Structured extraction (Pydantic + `with_structured_output`) from a document image,
then deterministic business rules — a typed, auditable PASS/FAIL pipeline.

**Download:** [`project-llm-outputs.ipynb`](../../public/labs/project-llm-outputs.ipynb) ·
[`project-llm-outputs.py`](../../public/labs/project-llm-outputs.py)
**Live reference:** https://priyankavergadia.github.io/life-of-a-token/#/llm-outputs

---

## Run it — two ways

### ▶ Option A — Open in Google Colab (zero setup)
1. Open: https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/project-llm-outputs.ipynb
   (or click **🚀 Open in Colab** in the app's *For developers* panel).
2. Run the first cell (`%pip install …`) — Colab installs everything.
3. Set `PROVIDER` to a **vision-capable** provider (Gemini, OpenAI, or Claude) and paste your key.
4. Upload a document image and point `IMAGE_PATH` at it, then run the rest.

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
   pip install jupyterlab && jupyter lab project-llm-outputs.ipynb   # notebook
   python project-llm-outputs.py                                     # script
   ```
4. Set `PROVIDER` + key (vision-capable) and set `IMAGE_PATH` to a local label/document image.

## Flow
1. **Setup** — `PROVIDER` + key (same helpers as the GenAI Lab notebook).
2. **Schema** — a `ShippingDocument(BaseModel)` with typed fields;
   `make_llm(temperature=0).with_structured_output(ShippingDocument)` forces the
   model to return exactly that shape.
3. **Extract** — send a `HumanMessage` with a text part + an `image_url` data URI;
   `structured_llm.invoke([message])` returns a validated `ShippingDocument`.
4. **Validate** — plain Python rules build an `issues` list → `status = "FAIL" if
   issues else "PASS"`.

## Why this design
- The **model reads**, **code judges** — business rules are deterministic and
  auditable; the verdict can never be hallucinated.
- Pydantic validation rejects malformed output before it reaches your rules.

## Tweak / extend
- Add fields (e.g. `declared_value: float`) and new rules.
- Swap the schema for invoices, passports, claims — same pipeline.
- Use `confidence_score` to route low-confidence docs to human review.
- Wrap `extract → validate` in a function and expose it via FastAPI; return the
  `ShippingDocument` plus the verdict as JSON.

## Gotchas
- Provider must support vision. Image is sent as a base64 data URI.
- Keep `temperature=0` for extraction (you want determinism, not creativity).
