# Vibe Coding — For Developers

A developer's playbook for the **Vibe Code Your Business Idea**
assignment: how to go from a plan to a live, deployed app — fast,
without over-building.

👉 **In-app guide:** https://priyankavergadia.github.io/life-of-a-token/#/vibe-coding

> This section is the assignment itself (Plan & Design → Build & Ship). There's no
> single notebook to download — instead, this is how to *execute* it well.

---

## 0 · Set up your stack
- Pick a build surface: **Codex, Claude, Gemini**, or a no/low-code host
  (Vercel, Replit, Bubble, Glide). Drive whichever you choose with your Master Prompt.
- Decide the runtime up front: framework, database, auth provider. Keep it boring
  and well-supported so the AI has lots of training data to lean on.
- Create the repo + a deploy target on **day one** so "ship" is never a surprise.

## 1 · Prompt Development (Part 1 — Plan & Design)
Turn the plan into a **staged** prompt pack, not one giant prompt.
- Fill in the **Master Prompt** (app name, problem, users, MVP features, data
  model, auth, screens) and end it with the product-owner instructions
  ("explain, check in each stage, surface options").
- Break the build into **stages** and write a prompt per stage:
  1. **Scaffold** — project skeleton, routing, empty screens, a styling baseline.
  2. **Auth** — sign-up/login, sessions, roles/permissions.
  3. **Data + features** — schema/migrations, CRUD, the 3–4 core features.
  4. **Polish** — error states, empty states, loading, responsiveness.
- Define **edge cases** ("what if the user submits empty / huge / malformed
  input?") and a **test list** to run after each stage.

**Deliverables (Part 1):** Project Brief, Product Spec (data model, screens, auth,
integrations), Build Prompt Pack (Master Prompt + ≥3 stage prompts showing
iteration), Risk & Test Plan (3 failure points, 5 test cases, 1 contingency).

## 2 · Project Creation (Part 2 — Build & Ship)
- **Build in the staged order above.** Run your test list after each stage; don't
  start the next stage on a red test.
- **Real auth & data:** a working signup→login→use flow against an isolated
  database. Persisted data is what separates a demo from a prototype.
- **Polish for real users:** handle errors, validate inputs, add empty/loading
  states, check mobile. "Done" = you'd happily show a stranger.
- **Use AI for the boring parts:** generate **seed/test data** and draft the
  **1-page user guide** (inputs, outputs, getting started).
- **Deploy continuously** so the live URL always reflects `main`.

## 3 · Map your work to the rubric (100 pts)
| Area | Pts | Dev focus |
|---|---|---|
| Plan | 30 | Crisp problem, complete spec, **staged** prompts with edge-case thinking |
| Build | 35 | All MVP features work · full auth + persistent DB · error handling, clean UI |
| Present | 30 | Confident **live** demo on real data · responsible AI · clear narrative · honest reflection |
| Peer | 5 | Thoughtful, specific peer feedback |

## Best practices & gotchas
- **Scope ruthlessly** — 3–4 core features. Everything else → "add later".
- **Don't one-shot it.** Stage prompts; review and test between stages.
- **Real data early** — it exposes bugs a happy-path demo hides.
- **Write the user guide as you build**, not the night before.
- **Demo live, never pre-recorded.** Have a fallback account + seeded data ready.
- Common failure: building too much → you run out of time to polish and ship.

---

### See also
- The non-technical version: [vibe-coding-for-everyone.md](vibe-coding-for-everyone.md)
- The foundations these build on: [GenAI Lab](genai-lab-for-developers.md) ·
  [LLM Outputs](llm-outputs-for-developers.md) · [RAG](rag-for-developers.md) ·
  [Tools](tools-for-developers.md) · [Personalization](personalization-for-developers.md)
