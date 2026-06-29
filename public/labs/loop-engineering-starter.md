# Loop Engineering — Hands-On Project: **The Daily Triage Loop**

> Learn loop engineering by *building one*. You'll take a simple, low-risk use
> case and run it through **every** loop-engineering primitive — from a manual
> command to a scheduled, self-verifying, human-gated loop.
>
> Inspired by Cobus Greyling's *Loop Engineering*:
> https://cobusgreyling.github.io/loop-engineering/#interactive

---

## The project (the use case)

**Daily Triage Loop** — every morning, an agent scans *your* repo (new issues,
failing CI, commits since yesterday, fresh `TODO`/`FIXME`s), and posts a short
**prioritized briefing** so you start the day knowing what needs attention.

- **Why this one:** it's the lowest-risk pattern in the playbook — it *reports*,
  it doesn't change code — so you can learn the whole anatomy safely.
- **The golden rule:** start **report-only**. The loop earns write access later.

**Done-for-the-day =** a single briefing exists, it's accurate, it doesn't repeat
yesterday's items, and nothing was posted/changed without your approval.

You'll need: a git repo, a coding agent (Claude Code / Codex / similar), and a
way to schedule (cron, your agent's `/loop`, or CI).

---

## The exercise — do these in order

Each step teaches one primitive. Don't skip — the point is to feel each piece.

### Step 1 · Define the loop (scope)
- **Do:** write ONE sentence describing the loop's single job, plus its
  done-for-the-day criteria. (Use the template below.)
- **Teaches:** a loop does *one* thing; ambiguity is how loops go rogue.
- ✅ **Checkpoint:** you can say, in one line, what the loop does and when it stops.

### Step 2 · Schedule the trigger (Scheduling)
- **Do:** pick a trigger and wire it: cron `0 9 * * 1-5`, your agent's `/loop 1d`,
  or a scheduled CI job. Run it once manually to confirm it fires.
- **Teaches:** loops are *designed once, run continuously* — not re-prompted.
- ✅ **Checkpoint:** the loop starts on its own, with no one typing a prompt.

### Step 3 · Write the Triage step (discovery)
- **Do:** define exactly what to scan and how to rank it (see the triage prompt).
- **Teaches:** loops **discover their own work** instead of being told what to do.
- ✅ **Checkpoint:** a run prints a ranked list of candidate items.

### Step 4 · Add State (durable memory)
- **Do:** create `STATE.md`. After each run, record the timestamp + the IDs you
  already reported. On the next run, skip anything already seen.
- **Teaches:** memory lives **outside the model**, so the loop is consistent and
  doesn't repeat itself.
- ✅ **Checkpoint:** running twice in a row does **not** re-report the same items.

### Step 5 · Package a Skill (reusable intent)
- **Do:** move the triage prompt into a reusable skill file (`triage.md`) your
  agent can invoke by name.
- **Teaches:** intents are reusable building blocks, not one-off prompts.
- ✅ **Checkpoint:** you can run the triage by referencing the skill, not pasting text.

### Step 6 · Implement — report-only
- **Do:** have the loop produce a `briefing-YYYY-MM-DD.md` (use the format below).
  **No** code changes, **no** posting yet.
- **Teaches:** the **report-only phase** — observe behavior before granting power.
- ✅ **Checkpoint:** a dated briefing file is generated each run.

### Step 7 · Verify (maker/checker with a sub-agent)
- **Do:** add a second pass (a sub-agent) that checks the briefing: are the items
  real? any duplicates of `STATE.md`? is the priority sane? Reject if not.
- **Teaches:** **sub-agents** + avoiding "verifier theater" (a checker that always
  passes).
- ✅ **Checkpoint:** a deliberately wrong/duplicate item gets caught and dropped.

### Step 8 · Connect + Human gate (Connectors + safety)
- **Do:** post the verified briefing via an MCP connector (Slack message / PR
  comment) **behind your approval**. Add guardrails: least-privilege token, a
  path denylist, a daily token budget.
- **Teaches:** **Connectors** and the **human gate** — the loop proposes, you dispose.
- ✅ **Checkpoint:** nothing leaves the loop without your explicit ok.

### Step 9 · Run a week, then graduate (Worktrees + escalation)
- **Do:** run report-only for ~5 days and read the logs. Then add **one** write
  action — e.g. auto-label new issues — performed in an isolated **git worktree**
  and still gated by your review.
- **Teaches:** **worktrees** (parallel, collision-free runs) and **staged
  escalation** from read-only → gated writes.
- ✅ **Checkpoint:** the loop now *acts*, safely, and you'd trust it unattended for
  its one job.

---

## Templates (copy & fill)

### `loop.md` — the loop definition
```md
# Loop: Daily Triage
Job (one sentence): Scan this repo each weekday morning and post a prioritized
briefing of what needs attention. REPORT-ONLY.
Trigger: cron "0 9 * * 1-5"
Inputs: open issues, failing CI runs, commits since last run, new TODO/FIXME
Output: briefing-<date>.md  (then posted to #eng-triage after human approval)
Done-for-the-day: one accurate, de-duplicated briefing exists; nothing posted
  without approval.
Guardrails: read-only token; never edit code; max 50k tokens/run; human gate on post.
```

### `STATE.md` — durable memory
```md
# Loop State — Daily Triage
last_run: 2026-01-01T09:00:00Z
reported_ids:
  - issue#142
  - ci#run-8891
  - todo:src/app.py:88
notes: |
  Anything the next run should know (open threads, deferred items).
```

### `triage.md` — the reusable skill / prompt
```md
You are a repo triage agent. Discover work, don't wait to be told.
1. List: open issues, failing CI checks, commits since {last_run}, new TODO/FIXME.
2. Drop anything already in STATE.md > reported_ids.
3. Score each item: severity (1-5) x freshness. Keep the top 5.
4. Output the briefing in the format below. Do NOT modify any code or post anything.
5. Append the new item IDs + timestamp to STATE.md.
```

### `briefing-<date>.md` — the output format
```md
# 🗞 Daily Triage — {date}
**Top priorities**
1. [{severity}] {title} — {one-line why} ({link})
...
**New since yesterday:** {n} issues, {n} CI failures, {n} TODOs
**Needs a human decision:** {anything ambiguous}
```

### Verifier prompt (maker/checker)
```md
You are a skeptical reviewer. Given this briefing + STATE.md, reject it if:
- any item is a duplicate of reported_ids,
- any link/ID can't be confirmed,
- the priority ordering is obviously wrong.
Return APPROVE or REJECT with reasons. Default to REJECT if unsure.
```

### Human-gate checklist (before any write/post)
- [ ] I read the briefing and it's accurate.
- [ ] The action is within the allowed scope (no code edits in report-only).
- [ ] Token/spawn budget not exceeded.
- [ ] Approved → post / label. Otherwise → leave a note in STATE.md and stop.

---

## Stretch goals
- Swap the use case: **PR Babysitter** (nudge stale PRs) or **CI Sweeper** (classify
  failing checks) — same 9 steps, higher cadence.
- Add a `loop-audit` style readiness check that scores your repo L0–L3 before you
  let the loop write anything.
- Emit structured JSON run logs and chart token spend per run.

**You've learned loop engineering when** you can take *any* repetitive task and
express it as: schedule → triage → state → implement → verify → connect → human
gate — starting report-only and escalating behind gates.
