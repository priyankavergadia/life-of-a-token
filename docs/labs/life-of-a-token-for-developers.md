# Life of a Token — For Developers

The visualized transformer journey, reproduced in real code on a small open model
(GPT-2 via 🤗 `transformers`). Every step taught in the visual tab, runnable.

**Open in Colab:** https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/life-of-a-token.ipynb
**Download:** [`life-of-a-token.ipynb`](../../public/labs/life-of-a-token.ipynb) ·
[`life-of-a-token.py`](../../public/labs/life-of-a-token.py)
**Live reference:** https://priyankavergadia.github.io/life-of-a-token/#/token

---

## Prerequisites
- Python 3.10+ (or just click **Open in Colab**).
- Installs in the first cell:
  ```bash
  pip install transformers torch tiktoken numpy
  ```
- No API key needed — GPT-2 downloads from the Hugging Face hub.

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
