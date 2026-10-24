# 11 · ⚖️ Project: Evals

> Part of the [Learner's Walkthrough](../WALKTHROUGH.md) · ← [Inference](10-inference.md)

**Goal:** stop guessing whether your AI works. Evaluate the HR policy bot from
**Project 2 (RAG)** with the full eval loop: **error analysis → code checks → an LLM
judge → validating the judge → a CI gate**.

---

## Before you start
Every step works in demo mode. Add a key in the **⚡ Go live bar** (any provider) to
run the LLM judge for real. Left panel = code, right panel = the traces and results.

---

## The steps

### Overview
- **Read** the pipeline: Read traces → Code checks → LLM judge → Trust it? → CI gate.
- **Learn:** LLM apps fail *quietly*: a wrong answer still reads fluently. "I tried a
  few prompts and it looked fine" is a vibe check, not a test.

### Read traces (error analysis)
- **Label** each of the 8 logged answers 👍 pass or 👎 fail, and pick *why* for the
  failures.
- **Click "compare with expert labels"** to see where you and a domain expert
  disagree.
- **Learn:** read real outputs *before* writing tests. Your notes group into a few
  **failure types**; counting them tells you what to fix and test first. Your labels
  are reused in the *Trust the judge* step.

### Code checks (✎ editable)
- **Drag** `max_words` and watch which traces flip.
- **Learn:** cheap, deterministic checks (length, numbers that must come from the
  policy, exact refusal wording) catch 3 of the 4 failures for free. They **miss**
  the answer that says the *opposite* of the policy, because a regex can't read
  meaning.

### LLM judge
- **Toggle** between **Criterion only** and **+ one labeled example**, then (with a
  key) **Run the judge for real**.
- **Learn:** keep a judge narrow: **one failure mode** (grounded in the policy), a
  **binary PASS/FAIL** (easier to agree on than 1–5), and a **critique** you can read.

### Trust the judge
- **Read** the 2×2 grid: judge verdict vs human label.
- **Add / remove the labeled example** and watch the two scores change.
- **Learn:** a judge is a model too. Measure how many **real failures it catches** and
  how many **good answers it lets through** before you trust it on traffic you'll
  never read.

### CI gate (✎ editable)
- **Drag** `min_pass_rate` and flip **Block on any regression**.
- **Learn:** prompt v2 raises the pass rate but now refuses the laptop question that
  v1 answered correctly. Gate on **regressions**, not just the average.

### Your turn
- **Do the exercise:** run the same loop on one of your own projects (steps listed in
  the app and in the notebook).

---

## ✅ Takeaway
Look at your data first, let code checks catch what rules can, use one validated judge
per remaining failure type, and gate every change on regressions.

> ← [Inference](10-inference.md) · Back to the [index](../WALKTHROUGH.md)
