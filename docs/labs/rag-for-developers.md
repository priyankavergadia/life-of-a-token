# Project: RAG — For Developers

Strict retrieval-augmented generation: FAISS vector index → top-k retrieval →
answer constrained to context, with an explicit refusal. Plus the RAG-vs-fine-tuning
distinction with a dataset example.

**Download:** [`project-rag.ipynb`](../../public/labs/project-rag.ipynb) ·
[`project-rag.py`](../../public/labs/project-rag.py)
**Live reference:** https://priyankavergadia.github.io/life-of-a-token/#/rag

---

## Run it — two ways

### ▶ Option A — Open in Google Colab (zero setup)
1. Open: https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/project-rag.ipynb
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
   pip install jupyterlab && jupyter lab project-rag.ipynb   # notebook
   python project-rag.py                                     # script
   ```
4. Set `PROVIDER="gemini"` or `"openai"` + paste your key (Claude has no embeddings API).

## Flow
1. **Setup** — `PROVIDER` + key; `make_embeddings()` helper.
2. **Ingest** — `FAISS.from_texts(company_policies, make_embeddings())`;
   `retriever = vectorstore.as_retriever(search_kwargs={"k": 2})`.
3. **Answer-or-refuse** — a `ChatPromptTemplate` whose system message says *answer
   only from context, else reply exactly `REFUSAL`*. `ask(q)` retrieves, joins the
   docs into `{context}`, and runs `prompt | make_llm(temperature=0)`.
4. **RAG vs fine-tuning** — a markdown + code cell showing the JSONL-style
   `finetune_dataset` (cat-tone pairs) and, in comments, the upload→train→swap
   workflow. (Not executed — fine-tuning costs money/time.)

## Why this design
- **Retrieval** keeps the prompt small and grounded; **the strict system prompt**
  enforces refusal on out-of-domain / jailbreak inputs.
- `temperature=0` for repeatable, faithful answers.

## Tweak / extend
- Replace `company_policies` with chunked real docs (`PyPDFLoader` +
  `RecursiveCharacterTextSplitter`).
- Raise `k`; add metadata filters; persist the index (`vectorstore.save_local`).
- Log retrieved chunks + scores for evaluation.
- For behaviour changes (tone, format, guardrails) → fine-tune; for fresh facts →
  RAG. Often both.

## Gotchas
- Anthropic has **no embeddings API** — use Gemini/OpenAI for the index.
- Keep the refusal string identical in the prompt and any post-check.
