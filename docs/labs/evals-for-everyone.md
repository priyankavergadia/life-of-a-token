# Project: Evals — For Everyone (no coding needed)

How AI teams find out whether their app **actually works**: read what it did, write
simple checks, use another AI as a judge, check the judge, and stop bad changes from
shipping.

👉 **Open it:** https://priyankavergadia.github.io/life-of-a-token/#/evals

---

## Before you start
Everything works in demo mode. To run the AI judge for real, add a free API key in the
**⚡ Go live** bar (any provider works here).

---

## Walk it
1. **Overview** — Read the pipeline: Read traces → Code checks → LLM judge → Trust it?
   → CI gate.
2. **Read traces** — Mark each of the 8 answers from the HR bot 👍 or 👎 and pick why.
   *Lesson: reading real answers shows you which mistakes actually happen, and how
   often.*
3. **Code checks** — Drag the **max_words** slider. *Lesson: simple rules catch
   rambling and made-up numbers, but not an answer that says the opposite of the
   policy.*
4. **LLM judge** — Switch between **Criterion only** and **+ one labeled example**.
   *Lesson: an AI can grade another AI if you ask it one clear yes/no question.*
5. **Trust the judge** — Read the 2×2 grid. *Lesson: check the judge against people
   before you rely on it.*
6. **CI gate** — Drag **min_pass_rate** and switch the regression rule. *Lesson: a new
   version can score higher overall and still break something that used to work.*
7. **Your turn** — Try the same steps on an AI app you use or build.

## ✅ What you'll understand
Why "it looked fine when I tried it" isn't enough, and how a few small, repeatable
checks tell you whether an AI change made things better or worse.

---

### Want the actual code?
See the **[developer guide](evals-for-developers.md)** and grab the
[`.ipynb`](../../public/labs/project-evals.ipynb) or
[`.py`](../../public/labs/project-evals.py).
