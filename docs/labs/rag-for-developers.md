# Project: RAG — For Developers

Strict retrieval-augmented generation: FAISS vector index → top-k retrieval →
answer constrained to context, with an explicit refusal. Plus the RAG-vs-fine-tuning
distinction with a dataset example.

**Download:** [`project-rag.ipynb`](../../public/labs/project-rag.ipynb) ·
[`project-rag.py`](../../public/labs/project-rag.py)
**Live reference:** https://priyankavergadia.github.io/life-of-a-token/#/rag

---

## Prerequisites
- Python 3.10+, **`PROVIDER="gemini"` or `"openai"`** (embeddings required).
- Install via the setup cell (LangChain + `faiss-cpu`).

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
