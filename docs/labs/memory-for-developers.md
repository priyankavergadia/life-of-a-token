# Project: Memory — For Developers

Implement bounded **Short-Term Memory** (sliding window + LLM rolling summary) and
cross-session **Long-Term Memory** (Pydantic structured fact extraction + profile
recall).

**Download:** [`project-memory.ipynb`](../../public/labs/project-memory.ipynb) ·
[`project-memory.py`](../../public/labs/project-memory.py)
**Live reference:** https://priyankavergadia.github.io/life-of-a-token/#/memory

---

## Run it — two ways

### ▶ Option A — Open in Google Colab (zero setup)
1. Open: https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/project-memory.ipynb
2. Run the first cell (`%pip install …`).
3. Set `PROVIDER` and paste your key.

### 💻 Option B — Local Python
```bash
python -m venv .venv && source .venv/bin/activate
pip install langchain langchain-core langchain-community langchain-classic langchain-google-genai langchain-openai langchain-anthropic faiss-cpu numpy requests
python project-memory.py   # or: jupyter lab project-memory.ipynb
```

## Flow
1. **Short-Term Memory (`build_short_term_messages`)** — splits conversation history
   at `window_size`; summarizes `history[:-window_size]` into a compact
   `SystemMessage` and keeps `history[-window_size:]` verbatim.
2. **Long-Term Fact Extraction** — uses `with_structured_output(MemoryPatch)` to pull
   durable `{key, value}` facts from a Session 1 message and store them in
   `LONG_TERM_DB[user_id]`.
3. **Cross-Session Recall** — starts Session 2 with an empty message list, injects
   the recalled profile facts, and compares the personalized output against a
   stateless call.

## Why this design
- **Hybrid short-term state:** Keeping the last `window_size` turns verbatim preserves
  conversational tone and immediate references ("it", "that table"), while the rolling
  summary prevents token usage from growing linearly (`O(N)`) over long chats.
- **Structured fact extraction on write:** Instead of stuffing raw past transcripts
  into future sessions, extracting typed `{key, value}` pairs via Pydantic keeps
  long-term memory compact, inspectable, and easy to update or delete.

## Tweak / extend
- Persist `LONG_TERM_DB` to SQLite, Postgres, or Redis keyed by `user_id`.
- Embed extracted facts into FAISS so only memories semantically relevant to the
  current question are recalled.
- Add a `confidence` or `updated_at` timestamp field to `MemoryFact` so newer facts
  cleanly overwrite contradicted older ones.

## Gotchas
- **Summarization drift:** Summarizing a summary repeatedly can lose specific
  identifiers (like exact error codes or IDs). Keep pinned facts in the structured
  long-term store rather than relying solely on rolling prose summaries.
- Always give users a way to inspect and clear stored profile facts.
