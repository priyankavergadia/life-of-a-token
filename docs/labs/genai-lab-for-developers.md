# GenAI Lab — For Developers

Six foundational GenAI patterns in one runnable, model-agnostic LangChain
notebook.

**Download:** [`genai-lab.ipynb`](../../public/labs/genai-lab.ipynb) ·
[`genai-lab.py`](../../public/labs/genai-lab.py)
**Live reference:** https://priyankavergadia.github.io/life-of-a-token/#/genai-lab

---

## Prerequisites
- Python 3.10+
- An API key for at least one of: Google Gemini, OpenAI, Anthropic.
- Install (the notebook's first cell does this for you):
  ```bash
  pip install langchain langchain-core langchain-community \
      langchain-google-genai langchain-openai langchain-anthropic faiss-cpu numpy
  ```

## Run it
1. Open `genai-lab.ipynb` in Jupyter / VS Code / Colab (or run `genai-lab.py`).
2. **Setup cell:** set `PROVIDER` (`"gemini" | "openai" | "anthropic"`) and paste
   your key when prompted (stored in an env var for the session).
3. Run top to bottom.

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
