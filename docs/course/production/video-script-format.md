# Video-script format (course-wide convention)

Every lesson's video script is one file in its module's `video/` directory, named
`NN-<slug>.video-script.md` (the `video-script` in the name says what it is at a
glance). This document defines the **five blocks** every script contains, **in
this order**. The screen-recording shot list comes **last**, by design — you
write what the viewer hears first, then describe what they see.

Pace narration at ~140 wpm. On-screen text uses no em-dashes. `[cite: …]` marks
where an on-screen citation appears; it must match that lesson's `## References`.

---

## Block 1 — Header

- Lesson title, module, target duration (~4–8 min; Foundation lessons average
  ~5).
- The single learning objective ("after this lesson the viewer can …").
- Segment type: talking-head intro/outro, screencast, or both.
- The `course/lesson-NN` tag to record against (clean `git status`).

## Block 2 — Pre-production

Everything that must be true *before* the camera rolls:

- Repo checkout/tag, clean working tree, env vars set (or deliberately unset).
- Editor + terminal state, font sizes (editor ≥ 18 pt, terminal ≥ 16 pt),
  notifications off, window layout, browser tabs open.
- Any asset or B-roll to capture beforehand (diagrams, slides, title cards).
- Data/fixtures the demo depends on.

## Block 3 — Word-for-word VO (verbatim narration)

The complete narration, broken into **numbered beats** with rough timecodes.
Every beat names what is on screen at that moment so Block 5 can be derived from
it. This is read verbatim — it is the script of record.

## Block 4 — Post-production

- Cuts, lower-thirds / captions, callout annotations (zoom, highlight, arrow).
- Chapter markers, music bed, title/end cards.
- Export specs: 1080p (or 1440p) at 30 fps, H.264, ≤ 12 Mbps; loudness ~ −16 LUFS.

## Block 5 — Screen-recording description (LAST)

The explicit, ordered shot list, **synced to the Block 3 beat numbers**: exact
commands typed, cursor moves, files opened and scrolled, browser/Studio
interactions, and the **expected output** per beat. A different person should be
able to record the screen capture from this block alone.

---

## Optional steps → Bonus footage or commented code (required)

Every **optional** step a lesson mentions MUST be captured one of two ways — it
is never left as a dangling "you could also…":

1. **Bonus footage.** Add a `## Bonus footage — <optional step>` segment at the
   END of the relevant lesson's script (after Block 5), with its own short
   Pre-production / VO / Shot-list. It records as a separate clip the editor can
   append or publish as supplementary footage. The lesson body links to it
   ("*optional — see Bonus footage in this lesson's script*").

2. **Commented-out code.** If the optional step is code the learner may enable,
   ship it **commented out in the repo**, with a comment that names the optional
   step and where it is described, e.g.:

   ```ts
   // OPTIONAL (Lesson 06 · Bonus footage "Swap in a real chat model"):
   // uncomment to drive the loop with Claude instead of the canned writer.
   // const llmWriter: ReplyWriter = async ({ ticket, draft, critique }) => { … }
   ```

Pick (1) when the optional step is a thing to *do or show*; pick (2) when it is a
code path to *enable*. Many optional steps use both — commented code in the repo
*and* a bonus-footage clip that walks through enabling it.
