# 🎨 Vibe-Code a Greeting Card Studio — Prompt Pack (no coding!)

Build the multi-agent greeting-card generator **by describing it in plain English**
to an AI builder. No code required. Paste these prompts **one stage at a time** and
chat with the tool to refine.

**Pick a tool (free):**
- **Lovable** — https://lovable.dev — builds the whole web app from a chat. *(best for the full app)*
- **Google AI Studio** — https://aistudio.google.com — great for writing & testing each agent’s prompt with Gemini before you wire it together.

> 💡 Golden rule of vibe coding: **go one stage at a time.** Build → look → ask for the next thing. Don’t paste everything at once.

---

## Stage 0 — Scaffold the app
Paste this first:

> Build me a web app called **“Greeting Card Studio.”** A user types who the card is
> for (e.g. *“a 1-year-old’s birthday”*), clicks **“Make my card,”** and a hand-drawn
> greeting card appears. Behind the scenes, use a **team of 5 AI helpers** that
> brainstorm the words and doodles, arrange them, critique the design, and draw the
> final card. While it works, show a fun **“agents at work”** status. Keep the whole
> style playful and hand-drawn.

✅ You should get a simple page with an input box and a button.

---

## Stage 1 — Create the 5 agents (one prompt each)
Tell the tool: *“Set up these 5 AI helpers, each with its own job:”* then paste them.

1. **Connie — the Creative Director**
   > You are Connie, a witty creative director. Given the card request, write a short,
   > warm greeting that fits on a card (**keep it under 12 characters**), and choose
   > **exactly 6 simple doodle ideas** that match the person and occasion.

2. **Archie — the Asset Librarian**
   > You are Archie. For each of Connie’s 6 doodle ideas, get a simple line-drawing in
   > the **Google “Quick, Draw!”** style. If one isn’t available, skip it gracefully so
   > the rest still work.

3. **Layla — the Layout Designer**
   > You are Layla, a layout designer. Arrange the 6 doodles **around the edges** of an
   > 800×800 card in a balanced, symmetrical way, and **keep the middle clear** for the
   > greeting text.

4. **Chris — the Critique Agent**
   > You are Chris, a picky but fair art critic. Check the draft: Is it on-theme for the
   > person? Are there **exactly 6** items? Is the text **short enough** to fit? Is
   > **anything overlapping** the center text? If something’s wrong, say **who** should
   > fix it (Connie or Layla) and **how** — then have them redo it.

5. **Ren — the Render Agent**
   > You are Ren. Draw the final card in a **hand-drawn “marker” style**: soft pastel
   > fills with crisp dark outlines, hand-drawn letters, and scattered stars/confetti
   > around the edges. Make it downloadable.

✅ Ask the tool to “show me each helper and what it does.”

---

## Stage 2 — Add the critique loop (the magic)
> Add a **critique loop**: after Layla makes a draft, have **Chris** check it. If it’s
> not good (off-theme, too much text, or overlapping), send it **back to the right
> helper** to fix and try again — up to ~6 times — before showing me the final card.
> Show each attempt in the “agents at work” status so I can watch it self-correct.

✅ Ask for a *baby* card on purpose — watch Chris reject grown-up items and ask for toys.

---

## Stage 3 — Polish the look
> Make the card feel authentically hand-drawn: pastel marker bleeds under dark
> outlines, wobbly hand-drawn letters, a little bunting/banner under the text, and
> confetti (stars, dots, squiggles) only around the edges — never over the text.

✅ The card should look like a Pinterest doodle collage.

---

## Stage 4 — Run, then iterate by chatting
1. Type a request (e.g. *“a goofy anniversary card for a gamer”*) and generate.
2. Refine in plain English: *“make the text bigger,” “add more confetti,” “use cooler
   colors,” “try a different layout.”*
3. Add a **Download** button and a **Share** button if they aren’t there.

✅ **You’re done when** you’ve generated and downloaded your own card — built entirely
by prompting.

---

### Tips
- If a stage goes wrong, **undo / revert** and re-word the prompt — don’t pile fixes on top.
- Be specific about **persona** (“a baby,” “a gamer,” “a grandma”) — that’s what makes the agents shine.
- Want to test a single agent’s wording first? Paste its prompt into **Google AI Studio** with a sample request and tweak until you like the output, then bring it back to Lovable.
