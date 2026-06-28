# Life of a Token — For Everyone (no coding needed)

The theory, visualized: what actually happens inside an AI when it reads your
words. No API key, no code.

👉 **Open it:** https://priyankavergadia.github.io/life-of-a-token/#/token

---

## Walk it
1. Type a prompt in the box at the top (or pick a `try:` chip) and click **Trace it**.
   Every visual recomputes from *your* words.
2. Step through the 9 stages (step tabs, **Back/Next**, or **← / →** keys):
   **Start → Tokenize → Embed → Meaning map → Position → Attention →
   Feed-forward → Stack ×N → Predict.**
3. On **Meaning map**, hover the dots (close = similar meaning). On **Attention**,
   switch heads and notice the blank triangle (the causal mask).

## ✅ What you'll understand
How an AI turns words into numbers, lets them interact through attention, and
predicts the next word one token at a time — no magic, no lookup.

---

### Want to see it in real code?
See the **[developer guide](life-of-a-token-for-developers.md)** — it reproduces
every step on a real model (GPT-2). Open it in
[Google Colab](https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/life-of-a-token.ipynb)
or download the [`.ipynb`](../../public/labs/life-of-a-token.ipynb) /
[`.py`](../../public/labs/life-of-a-token.py).
