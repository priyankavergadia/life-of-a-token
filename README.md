# The Life of a Token 🪐

An interactive, visual walkthrough of how a large language model (like Claude) turns your words into an answer. Built for curious non-engineers — real mechanisms, plain language, no dumbing-down.

You type any prompt and click step-by-step through the transformer pipeline, following a token from raw text to a predicted next word. **Every visual recomputes from your actual words.**

## The journey
1. **Start** — the big picture
2. **Tokenize** — words shatter into tokens + IDs
3. **Embed** — tokens become number-vectors (with live bar charts)
4. **Meaning map** — those vectors plotted in 2D so you *see* related words cluster
5. **Position** — sine/cosine fingerprints give the model word order
6. **Attention** — the causal attention grid; switch between specialized heads
7. **Feed-forward** — neurons light up as each word "thinks"
8. **Stack ×N** — blocks repeated for depth
9. **Predict** — logits → softmax → the next-token probabilities

## Run it
```bash
npm install
npm run dev      # opens http://localhost:5173
```
Build a static version with `npm run build` (output in `dist/`).

## Navigation
- Click the numbered steps, or use the **← / →** arrow keys.
- Edit the input box and hit **Trace it** (or Enter), or click an example chip.

## How honest is the model?
The architecture and *shape* of every computation is real — tokenization into subwords, embeddings, sinusoidal positions, causal masked self-attention with multiple heads, a 4×-wide feed-forward MLP with a GELU nonlinearity, residual stacking, and softmax over a vocabulary. The **weights** are hand-built heuristics (see `src/engine.js`) chosen to be believable and to teach the right intuition — not trained parameters. The goal is understanding, not GPT-scale accuracy.

## Stack
React + Vite + Framer Motion. All logic lives in `src/engine.js`; visuals in `src/components.jsx`; narrative in `src/App.jsx`.
