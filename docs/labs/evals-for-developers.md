# Project: Evals — For Developers

Generate traces from the Project 2 HR bot, run **error analysis**, write deterministic
**code checks**, build a structured-output **LLM judge**, measure its **agreement with
human labels** (TPR/TNR), and wire a **CI gate** that blocks regressions.

**Download:** [`project-evals.ipynb`](../../public/labs/project-evals.ipynb) ·
[`project-evals.py`](../../public/labs/project-evals.py)
**Live reference:** https://priyankavergadia.github.io/life-of-a-token/#/evals

---

## Run it — two ways

### ▶ Option A — Open in Google Colab (zero setup)
1. Open: https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/project-evals.ipynb
2. Run the first cell (`%pip install …`).
3. Set `PROVIDER` (`"gemini"`, `"openai"`, or `"anthropic"`) and paste your key.

### 💻 Option B — Local Python
```bash
python -m venv .venv && source .venv/bin/activate
pip install langchain langchain-core langchain-google-genai langchain-openai langchain-anthropic pydantic
python project-evals.py   # or: jupyter lab project-evals.ipynb
```

## Flow
1. **Bot under test** — `run_bot("v1" | "v2")` answers a small `GOLDEN_SET` with two
   versions of the Project 2 system prompt. The whole handbook is passed as context,
   so it runs on every provider (no embeddings needed).
2. **Error analysis** — with `LABEL_INTERACTIVELY = True` you label each trace
   pass/fail plus a failure tag (`contradicts`, `out_of_scope`, `wordy`, `other`);
   a `Counter` prints the failure types biggest first. Set it to `False` to fill
   `HUMAN_LABELS` by hand.
3. **Code checks** — `check_length`, `check_numbers_grounded` (every standalone number
   must appear in the context) and `check_refusal_exact`.
4. **LLM judge** — `make_llm(temperature=0).with_structured_output(Verdict)` returns a
   pydantic `Verdict(verdict: "PASS" | "FAIL", critique: str)` for one failure mode:
   groundedness. `run_judge(t, with_example=True)` adds one labeled example.
5. **Validate the judge** — `agreement()` compares judge verdicts with your
   grounding labels and prints caught / missed / false alarms, TNR and TPR, with and
   without the example.
6. **CI gate** — `ci_gate(old, new)` asserts `MIN_PASS_RATE` and, with
   `BLOCK_ON_REGRESSION`, that no trace passing on v1 fails on v2.

## Why this design
- **Read before you test:** failure types come from real outputs, not a spec you
  imagined. They decide which checks and judges you write.
- **Cheapest check first:** deterministic checks are free and never flaky, so the
  judge only handles what rules can't.
- **Binary, single-purpose judge:** PASS/FAIL on one criterion is easier to label,
  agree on and measure than a 1–5 score covering everything.
- **Gate on regressions:** an average can rise while a case users depend on breaks.

## Tweak / extend
- Add a second judge (tone, or "answers the question that was asked").
- Split your labels into dev/test; tune the judge prompt on dev, report TPR/TNR on test.
- Move `ci_gate` into a `pytest` test and run it in GitHub Actions on every PR.
- Log real traffic and re-run error analysis weekly; new failure types become new checks.

## Gotchas
- **Labels are the ground truth:** if you skip labeling, the agreement numbers mean
  nothing. Label at least the whole golden set.
- **Model outputs vary:** your v1/v2 answers (and so the gate result) can differ from
  the in-app demo; that's expected. Keep `temperature=0` for repeatability.
- **Don't let the judge grade everything:** "wordy" is a code check's job; mixing
  criteria makes the judge's errors hard to diagnose.
