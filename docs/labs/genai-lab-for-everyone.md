# GenAI Lab — For Everyone (no coding needed)

A guided, click-through tour of the six core skills behind modern AI. You don't
write any code — you read the code on the left, press buttons on the right, and
watch real AI models respond.

👉 **Open it:** https://priyankavergadia.github.io/life-of-a-token/#/genai-lab

---

## Before you start: get a free API key
To see *real* answers (not just demos) you need a key from **one** provider:

- **Google Gemini** (easiest free tier) — https://aistudio.google.com/apikey → sign in → **Create API key**
- **OpenAI (GPT)** — https://platform.openai.com/api-keys → **Create new secret key**
- **Anthropic (Claude)** — https://console.anthropic.com/settings/keys → **Create Key**

Paste the key into the **⚡ Go live** bar at the top. It stays **only in your
browser**. No key? Everything still runs in **demo mode**.

> Some labs (Embeddings) need **Gemini or OpenAI** — Claude has no embeddings API.

---

## Walk the six labs

**The Toggle** — Click between Gemini / OpenAI / Claude. Notice the line
`answer = llm.invoke(prompt)` never changes. *Lesson: you're never locked to one
AI vendor.*

**Temperature** — Drag the **Temperature**, **Top-P**, and **Top-K** dials, then
click **Run 3×**. At temperature 0 the three answers are identical; turn it up and
they go wild. *Lesson: these dials control how random/creative the AI is.*

**Embeddings** — Edit the list of words and click **Embed**. Watch related words
cluster together on the map. *Lesson: AI turns words into numbers that capture
meaning.*

**Context / RAG** — Type a question and some private facts, toggle **inject**, and
ask. Without facts it guesses; with facts it's correct. *Lesson: feeding the AI
the right context stops it from making things up.*

**Agents** — Give it a task and watch it **Think → Act (use a tool) → Observe →
Answer**. *Lesson: an agent doesn't just talk, it takes actions.*

**Vision** — Upload a photo and click **Analyze**. *Lesson: modern AI can "see"
images, not just read text.*

---

## ✅ What you'll understand
How AI models can be swapped freely, tuned for creativity, made to understand
meaning, grounded in your facts, given tools to act, and given eyes to see.

---

### Want to try the actual code?
Every lab here is also a downloadable, runnable notebook. See the
**[developer guide](genai-lab-for-developers.md)** and grab the
[`.ipynb`](../../public/labs/genai-lab.ipynb) or
[`.py`](../../public/labs/genai-lab.py).
