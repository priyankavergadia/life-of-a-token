# Life of a Token — For Developers

The visualized transformer journey, reproduced in real code on a small open model
(GPT-2 via 🤗 `transformers`). Every step taught in the visual tab, runnable.

**Open in Colab:** https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/life-of-a-token.ipynb
**Download:** [`life-of-a-token.ipynb`](../../public/labs/life-of-a-token.ipynb) ·
[`life-of-a-token.py`](../../public/labs/life-of-a-token.py)
**Live reference:** https://priyankavergadia.github.io/life-of-a-token/#/token

---

## Run it — two ways

### ▶ Option A — Open in Google Colab (zero setup)
1. Open: https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/life-of-a-token.ipynb
   (or click **🚀 Open in Colab** in the app's *For developers* panel).
2. Run the first cell (`%pip install …`) — Colab installs everything for you.
3. **No API key needed** — GPT-2 downloads from the Hugging Face hub.
4. Set `TEXT` to your prompt and run the rest top to bottom.

### 💻 Option B — Local Python
1. Python 3.10+. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate          # Windows: .venv\Scripts\activate
   ```
2. Install the dependencies:
   ```bash
   pip install transformers torch tiktoken numpy
   ```
3. Run it as a **notebook** or a **script**:
   ```bash
   pip install jupyterlab && jupyter lab life-of-a-token.ipynb   # notebook
   python life-of-a-token.py                                     # script
   ```
4. No API key needed; set `TEXT` to inspect any prompt.

## What each step does (every cell is a small function)
| Step | Code | Shows |
|---|---|---|
| Load | `GPT2LMHeadModel.from_pretrained("gpt2", output_attentions=True, output_hidden_states=True)` | a fully inspectable transformer |
| 1 · Tokenize | `tokenize(text)` → ids + decoded pieces | sub-word tokens and their IDs |
| 2 · Embed | `model.transformer.wte(ids)` + `cosine()` | token vectors; similarity between tokens |
| 3 · Position | `model.transformer.wpe(positions)`; `token_emb + pos_emb` | order injected into the vectors |
| 4 · Attention | `out.attentions[layer][0, head]` | the attention matrix + causal mask |
| 5 · Stack | `out.hidden_states` | per-block representations; depth/drift |
| 6 · Predict | `softmax(out.logits[0,-1])` + `topk`; `model.generate(...)` | next-token probabilities + continuation |

## Try this
- Change `TEXT` and re-run — every table recomputes.
- Print a different layer/head attention matrix; compare early vs. deep layers.
- Compare `wte` cosine similarity for related vs. unrelated words.
- Switch the model id (e.g. `"distilgpt2"`) for a faster run.

## Notes
- GPT-2 is used because it's small and exposes embeddings, attention, and hidden
  states — the same mechanisms power larger models like Claude/GPT-4.
- This is for understanding internals; it is not an API-based generation lab (see
  the GenAI Lab notebook for that).
