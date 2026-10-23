# Project: Inference Engineering — For Developers

Build a complexity-aware **Model Router**, structure prompts for automatic **Prefix
KV Caching**, and benchmark **Time-To-First-Token (TTFT)** with `llm.stream()`.

**Download:** [`project-inference.ipynb`](../../public/labs/project-inference.ipynb) ·
[`project-inference.py`](../../public/labs/project-inference.py)
**Live reference:** https://priyankavergadia.github.io/life-of-a-token/#/inference

---

## Run it — two ways

### ▶ Option A — Open in Google Colab (zero setup)
1. Open: https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/project-inference.ipynb
2. Run the first cell (`%pip install …`).
3. Set `PROVIDER` (`"gemini"`, `"openai"`, or `"anthropic"`) and paste your key.

### 💻 Option B — Local Python
```bash
python -m venv .venv && source .venv/bin/activate
pip install langchain langchain-core langchain-community langchain-classic langchain-google-genai langchain-openai langchain-anthropic faiss-cpu numpy requests
python project-inference.py   # or: jupyter lab project-inference.ipynb
```

## Flow
1. **Setup** — `make_llm(tier="fast" | "frontier")` selects between the provider's
   low-latency mini/flash/haiku tier and its frontier tier.
2. **Model Router** — `score_complexity(query)` evaluates query complexity against
   `COMPLEXITY_THRESHOLD` and dispatches to the right tier, logging latency.
3. **Prefix KV Caching + Streaming** — places the immutable `STATIC_HANDBOOK_PREFIX`
   at the top of the message list (`SystemMessage`) and streams the response via
   `llm.stream(messages)`, recording both `TTFT` (first chunk timestamp) and
   `total_ms`.

## Why this design
- **Prefix-first prompt layout:** OpenAI, Anthropic, and Gemini cache KV states for
  matching prompt prefixes. Putting dynamic variables at the top invalidates the cache
  on every call; keeping static system/schema/handbook content first yields 75–90%
  input token discounts and lower prefill latency.
- **TTFT over total latency:** Users judge responsiveness by when they start reading
  (`TTFT`), not when the last paragraph finishes.

## Tweak / extend
- Replace the regex/length `score_complexity` heuristic with a tiny classifier or
  embedding router trained on your own prompt logs.
- Add **semantic caching** (embed incoming queries into FAISS and return cached
  answers when cosine similarity `> 0.96`).
- Log token usage metadata (`response.usage_metadata`) to verify cached input token
  counts on OpenAI, Anthropic, and Gemini.

## Gotchas
- **Don't break the static prefix:** Inserting a dynamic timestamp, random request ID,
  or user query *above* your static handbook/tool schemas invalidates the KV prefix
  cache from that token onward. Always append dynamic content at the end.
- Provider prefix caching typically requires a minimum prefix length (e.g., 1,024+
  tokens) to activate automatically.
