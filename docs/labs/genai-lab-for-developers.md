# GenAI Lab — For Developers

Six foundational GenAI patterns in one runnable, model-agnostic LangChain
notebook.

**Download:** [`genai-lab.ipynb`](../../public/labs/genai-lab.ipynb) ·
[`genai-lab.py`](../../public/labs/genai-lab.py)
**Live reference:** https://priyankavergadia.github.io/life-of-a-token/#/genai-lab

---

## Run it — two ways

### ▶ Option A — Open in Google Colab (zero setup)
1. Open: https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/genai-lab.ipynb
   (or click **🚀 Open in Colab** in the app's *For developers* panel).
2. Run the first cell (`%pip install …`) — Colab installs everything for you.
3. In the setup cell, set `PROVIDER` (`"gemini" | "openai" | "anthropic"`) and
   paste your API key when prompted.
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
   pip install jupyterlab && jupyter lab genai-lab.ipynb   # notebook
   python genai-lab.py                                     # script
   ```
4. Set `PROVIDER` + paste your key. (Embeddings labs need **Gemini** or **OpenAI**.)

The setup defines two helpers used everywhere:
- `make_llm(temperature=…, top_p=…, top_k=…)` → a `ChatModel` for the chosen
  provider. `top_k` is passed only for Gemini/Anthropic (OpenAI has no `top_k`).
- `make_embeddings()` → an embeddings model (raises for Anthropic — no embeddings API).

## What each section shows
| Lab | Key API | What to notice |
|---|---|---|
| 1 · Toggle | `make_llm().invoke()` | Swap `PROVIDER`, re-run — call site is identical. |
| 2 · Temperature | `make_llm(temperature, top_p, top_k)` | temp 0 → identical across 3 runs; temp 1 → divergent. |
| 3 · Embeddings | `embed_documents()` + cosine | similar words score ~0.8+, unrelated ~0.1–0.2. |
| 4 · RAG | `ChatPromptTemplate` + context | without context it hallucinates; with it, grounded. |
| 5 · Agents | `create_tool_calling_agent`, `AgentExecutor(verbose=True)` | the model picks the tool and fills args. |
| 6 · Vision | `HumanMessage` with an `image_url` data URI | multimodal input, one message. |

## Things to tweak / experiment
- **Temperature lab:** sweep `temperature` 0 → 2; toggle `top_p`/`top_k`; try a
  factual prompt vs. a creative one.
- **Embeddings:** add multilingual words; print a full similarity matrix.
- **RAG:** swap the `context` string; try a question the context doesn't cover.
- **Agents:** add a second `@tool` and a multi-step question that needs both.
- **Vision:** point `IMAGE_PATH` at a chart or handwriting.

## Gotchas
- Embeddings labs require `PROVIDER="gemini"` or `"openai"`.
- Model IDs are pinned in `make_llm`/`make_embeddings` — update them as providers
  release new versions.
- `verbose=True` on `AgentExecutor` prints the reasoning/tool trace — turn off for
  production.

## Where to go next
- Wrap any lab in a function and expose it via FastAPI.
- See the four project notebooks (LLM Outputs, RAG, Tools, Personalization) for
  these foundations combined into end-to-end apps.
