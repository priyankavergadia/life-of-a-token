# Project: Context Engineering — For Developers

Build a deterministic context packer that scores, filters, deduplicates, and caps
retrieved chunks to a strict token budget — curing the *"Lost in the Middle"* failure
mode.

**Download:** [`project-context.ipynb`](../../public/labs/project-context.ipynb) ·
[`project-context.py`](../../public/labs/project-context.py)
**Live reference:** https://priyankavergadia.github.io/life-of-a-token/#/context

---

## Run it — two ways

### ▶ Option A — Open in Google Colab (zero setup)
1. Open: https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/project-context.ipynb
2. Run the first cell (`%pip install …`).
3. Set `PROVIDER` and paste your key.

### 💻 Option B — Local Python
```bash
python -m venv .venv && source .venv/bin/activate
pip install langchain langchain-core langchain-community langchain-classic langchain-google-genai langchain-openai langchain-anthropic faiss-cpu numpy requests
python project-context.py   # or: jupyter lab project-context.ipynb
```

## Flow
1. **Candidate Pool** — defines 5 candidate chunks with metadata (`status`, `tokens`,
   `score`), including an archived 2021 policy draft and irrelevant Slack chatter.
2. **Token Budget Packer (`pack_context`)** — drops archived chunks and anything below
   `relevance_cutoff`, orders highest-signal chunks first, and packs greedily up to
   `max_budget` tokens.
3. **A/B Comparison** — invokes the LLM on both the unranked stuffed window (590
   tokens) and the engineered context (180 tokens) to show how pruning resolves
   contradictions and cuts token spend by 70%.

## Why this design
- **Relevance floor + metadata filter:** Vector similarity alone often retrieves
  outdated drafts that share vocabulary with the user's question. Combining a minimum
  score (`relevance_cutoff`) with metadata status (`filter_archived=True`) blocks
  stale documents before they can contradict active policy.
- **Explicit token budget:** Capping context to `max_budget` keeps latency and cost
  predictable regardless of how many documents exist in the corpus.

## Tweak / extend
- Replace pre-computed scores with live cosine similarity from `make_embeddings()` or
  a cross-encoder re-ranker.
- Experiment with **sandwich ordering** (highest-signal chunks at the very top and
  very bottom of the context block) to combat the *Lost in the Middle* effect on longer
  contexts.
- Add an LLM map-reduce compression step for chunks that exceed the remaining budget.

## Gotchas
- **Token counting:** Character length is only a rough proxy (~4 chars/token). In
  production, count tokens with `tiktoken` or the provider's `count_tokens` API before
  packing.
- Don't set `relevance_cutoff` so high that valid multi-hop evidence gets dropped —
  log dropped chunks during evaluation.
