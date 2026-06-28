# Project: Tools — For Developers

A multi-step tool-calling agent: two `@tool` functions (a mock sales DB + exact
margin math) and an `AgentExecutor` that chains them.

**Download:** [`project-tools.ipynb`](../../public/labs/project-tools.ipynb) ·
[`project-tools.py`](../../public/labs/project-tools.py)
**Live reference:** https://priyankavergadia.github.io/life-of-a-token/#/tools

---

## Prerequisites
- Python 3.10+, an API key for any provider (tool-calling supported on all three).
- Install via the setup cell.

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
