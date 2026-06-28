# Greeting Cards — For Developers

A 5-agent **Google ADK**-style pipeline with a self-correcting critique loop that
renders a Kawaii-marker SVG greeting card. Ships with a self-contained ADK *mock*
so it runs anywhere (no API key, no ADK install required).

**Open in Colab:** https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/greeting-card.ipynb
**Download:** [`greeting-card.ipynb`](../../public/labs/greeting-card.ipynb) ·
[`greeting-card.py`](../../public/labs/greeting-card.py)
**Live reference:** https://priyankavergadia.github.io/life-of-a-token/#/greeting-cards

---

## Run it — two ways

### ▶ Option A — Open in Google Colab (zero setup)
1. Click **Open in Colab** above.
2. Run the cells top to bottom. No API key needed (the ADK is mocked; doodles come
   from the public Quick, Draw! dataset on Google Cloud Storage).
3. The last cell renders the SVG inline.

### 💻 Option B — Local Python
1. Python 3.9+. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate          # Windows: .venv\Scripts\activate
   ```
2. Install the one dependency:
   ```bash
   pip install requests
   ```
3. Run it as a **notebook** or a **script**:
   ```bash
   pip install jupyterlab && jupyter lab greeting-card.ipynb   # notebook
   python greeting-card.py                                     # script → writes final_adk_card.svg
   ```

## The five agents
| Agent | Role | Job |
|---|---|---|
| **Connie** | Creative Director | Writes the text + picks exactly 6 on-persona doodle categories |
| **Archie** | Asset Librarian | Fetches vector strokes from the Quick, Draw! dataset (fails gracefully) |
| **Layla** | Layout Designer | Computes (x, y, scale) on a balanced grid, protecting the text safe-zone |
| **Chris** | Critique Agent | Rejects off-persona / unbalanced / overflowing designs; routes feedback |
| **Ren** | Render Agent | Fuses the payload into the final two-pass marker SVG |

## How the loop works
`Orchestrator.run()` keeps shared `state` and runs at most 6 cycles:
1. **Connie** brainstorms (re-runs if Chris sent her feedback) → **Archie** fetches assets.
2. **Layla** lays out the assets (re-runs if Chris sent layout feedback).
3. **Chris** evaluates the whole state and returns `{approved}` or
   `{approved: False, target, feedback}` — the orchestrator routes that feedback to
   `target` and loops again.
4. On approval, **Ren** renders `final_adk_card.svg`.

Chris’s checks (see `critique` cell): off-persona items (e.g. wine glass on a baby
card), not exactly 6 items, text longer than 12 chars, and any doodle overlapping
the central text zone.

## Tweak / extend
- Change `user_request` (try *“a goofy anniversary card for a gamer”*; a **baby**
  card deliberately triggers the loop).
- Edit Chris’s rules, or Layla’s coordinate grid.
- Add a 6th agent (e.g. a “Color Theorist”).
- **Go live:** replace the mock with the real ADK —
  `from google_adk.core import Agent, Orchestrator` + `VertexGeminiModel` — and let
  the LLM produce the text/categories/layout instead of the mock heuristics.

## Notes
- The doodle fetch hits a public GCS dataset over HTTPS; if a category 404s,
  `fetch_quickdraw_asset` returns `None` and the pipeline continues.
- Output is a real `.svg` (800×800) you can open in any browser.
