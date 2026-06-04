# Video script · Module 0 · Lesson 2 · Getting set up (TypeScript)

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 0 · Lesson 2 · Getting set up (TypeScript)
- **Duration:** ~4 min
- **Objective:** the viewer runs the reflection loop and its test locally, offline.
- **Segments:** screencast throughout, brief talking-head cold open.
- **Tag:** `course/lesson-02` (clean `git status`).

## Block 2 — Pre-production

- `git checkout course/lesson-02`; working tree clean.
- Terminal ≥ 16 pt, editor ≥ 18 pt, dark high-contrast theme, notifications OFF.
- Node 20+ installed (`node --version` ready to show).
- Layout: editor left (file tree visible), terminal right.
- Dependencies NOT yet installed (so `npm install` is shown live), OR pre-warm the
  npm cache and note the install is trimmed in the edit.
- No `.env.local` present (we demonstrate the no-key path).

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> In this lesson the reflection loop runs on your machine. No API key, no Docker,
> no server. Just Node and this repo.

**[Beat 2 · terminal: node --version · 0:12]**
> Confirm Node 20 or newer. That, plus a clone of the repo, is the entire
> prerequisite. The first runnable lesson uses a deterministic stub critic and a
> canned writer, so nothing here calls a model or the network.

**[Beat 3 · terminal: npm install · 0:30]**
> Install dependencies once.

**[Beat 4 · terminal: npx tsx examples/support-reply-loop/run.ts · 0:45]**
> Now run the loop. Watch this. Revision one is a generic reply. Revision two names
> the cracked jar, promises a replacement, signs off, and the critic flips to
> passed. That is a reflection loop converging, and we built it without a single
> API call.

**[Beat 5 · terminal: npm run test -- tests/course/module-0-loop.test.ts · 1:20]**
> The same thing as a hard signal. This test asserts the loop converges and that it
> terminates at the revision cap instead of spinning forever. Four passing tests.
> This is the success signal you will rebuild yourself in this module's lab.

**[Beat 6 · editor: examples/support-reply-loop/graph.ts · 1:55]**
> Here is what you just ran. A write node, a critique node, a conditional edge, and
> a max-revisions cap. The whole pattern fits on one screen. We read it line by
> line in Lesson 6; for now, just confirm it is real code you can open.

**[Beat 7 · terminal: git tag --list 'course/*' · 2:35]**
> Every lesson is pinned to a git tag. Checkout `course/lesson-06` and you get the
> exact repo state that lesson describes. `git switch -` takes you back.

**[Beat 8 · talking-head · 3:05]**
> One note on Docker, because it trips people up. Some LangGraph tutorials use
> `langgraph up`, which builds a Docker image. This course never does. If you have
> fought Docker Desktop on an older Mac, you can forget it exists for this course.

**[Beat 9 · talking-head · 3:35]**
> That is setup. The barrier to entry is Node and a clone. Next, the same picture
> for Python learners. See you there.

## Block 4 — Post-production

- Callout zoom on the `PASSED` line (Beat 4) and the "4 passed" line (Beat 5).
- Highlight the four box-drawing of nodes in `graph.ts` (Beat 6).
- Chapter markers at Beats 3, 4, 5, 7, 8.
- Export 1080p/30, H.264, ~ −16 LUFS.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** type `node --version`; show `v20.x` (or higher).
- **Beat 3:** type `npm install`; let it complete (trim the wait in post).
- **Beat 4:** type `npx tsx examples/support-reply-loop/run.ts`; the output shows
  "Revision 1", "Revision 2", then "Final critique: PASSED" and three `[x]` checks.
  Cursor-highlight the PASSED line.
- **Beat 5:** type `npm run test -- tests/course/module-0-loop.test.ts`; show
  "Test Files 1 passed (1) / Tests 4 passed (4)". Zoom the summary.
- **Beat 6:** open `examples/support-reply-loop/graph.ts`; scroll from the
  `Annotation.Root` block down to the `StateGraph` builder; do not narrate
  internals, just orient.
- **Beat 7:** type `git tag --list 'course/*'`; then `git checkout course/lesson-06`,
  then `git switch -`.

## Bonus footage — Optional: wire a LangSmith key (not needed until Module 3)

> Optional step from the lesson body. Record as a separate ~60s clip.

**Pre-production:** `.env.example` present; a real (or dummy-format) `LANGSMITH_API_KEY` ready off-camera.

**VO (verbatim):**
> Optional, and you do not need this until Module 3. If you want tracing set up now,
> copy `.env.example` to `.env.local` and add your LangSmith key. The loop runs
> fine without it. The app is built to fail soft when the key is absent, and Module
> 3 relies on exactly that property. [cite: LangChain, n.d.-b]

**Shot list:** `cp .env.example .env.local`; open `.env.local`; add
`LANGSMITH_API_KEY=...`; re-run `npx tsx examples/support-reply-loop/run.ts` to
show it still runs (no behavioral change yet). Lower-third citation on the
"fail soft" sentence.
