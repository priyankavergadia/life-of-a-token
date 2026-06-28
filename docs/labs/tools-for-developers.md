# Project: Tools — For Developers

A multi-step tool-calling agent: two `@tool` functions (a mock sales DB + exact
margin math) and an `AgentExecutor` that chains them.

**Download:** [`project-tools.ipynb`](../../public/labs/project-tools.ipynb) ·
[`project-tools.py`](../../public/labs/project-tools.py)
**Live reference:** https://priyankavergadia.github.io/life-of-a-token/#/tools

---

## Run it — two ways

### ▶ Option A — Open in Google Colab (zero setup)
1. Open: https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/project-tools.ipynb
   (or click **🚀 Open in Colab** in the app's *For developers* panel).
2. Run the first cell (`%pip install …`) — Colab installs everything.
3. Set `PROVIDER` (any of Gemini / OpenAI / Anthropic — tool-calling works on all) and paste your key.
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
   pip install jupyterlab && jupyter lab project-tools.ipynb   # notebook
   python project-tools.py                                     # script
   ```
4. Set `PROVIDER` + paste your key (any provider works).

## Flow
1. **Setup** — `PROVIDER` + key.
2. **Forge tools** — `@tool`-decorated `query_sales_db(product_name)` and
   `calculate_profit_margin(revenue, cost)`. **The docstrings are the interface** —
   the model reads them to decide when/how to call each.
3. **Execute** — `create_tool_calling_agent(make_llm(0), toolkit, prompt)` wrapped
   in `AgentExecutor(..., verbose=True)`. The prompt includes a
   `{agent_scratchpad}` placeholder. Invoke with `{"input": question}`.

Expected chain for the sample question:
`query_sales_db("SuperWidget") → 12500`, then
`calculate_profit_margin(12500, 4500) → "64.00%"`.

## Why this design
- Offloading lookups + arithmetic to code guarantees **0% hallucination on
  numbers**.
- Good **docstrings** = good tool selection. Keep them explicit and action-oriented.

## Tweak / extend
- Add tools (`check_inventory`, `run_sql_query`, `get_exchange_rate`).
- Replace the dict with a real DB call; add error handling per tool.
- Swap to LangGraph's `create_react_agent` for more control / streaming.
- Inspect `verbose=True` output (or use callbacks) to log the tool trace.

## Gotchas
- The prompt **must** include `("placeholder", "{agent_scratchpad}")` for
  `create_tool_calling_agent`.
- Tool arg types in the signature/docstring guide the model — be precise.
