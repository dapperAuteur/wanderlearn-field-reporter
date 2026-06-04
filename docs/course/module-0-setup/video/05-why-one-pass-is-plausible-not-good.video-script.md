# Video script · Module 0 · Lesson 5 · Why one pass is plausible, not good

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 0 · Lesson 5 · Why one pass is plausible, not good
- **Duration:** ~5 min
- **Objective:** the viewer can explain why a single call returns plausible-not-good
  output, name the "prompt-harder" anti-pattern, and state three verifiable checks.
- **Segments:** screencast (a scratch terminal/editor with the ticket + replies as
  text), talking-head bookends.
- **Tag:** `course/lesson-05`.

## Block 2 — Pre-production

- A markdown scratch file with the blender ticket and the two replies (weak, then
  strong), revealed progressively (fold/scroll).
- Slide: the "Prompt-harder" anti-pattern card.
- Slide: the three checks (acknowledge issue / next step / sign-off).
- Notifications OFF; editor ≥ 18 pt.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> A first draft from a language model is plausible, not good. The gap between the
> two is exactly the gap a human writer closes by re-reading and fixing what is
> weak. Let me make that gap concrete on a real support ticket.

**[Beat 2 · editor: the ticket · 0:25]**
> Here is the ticket. The blender arrived with a cracked jar, it will not seal, and
> the customer needs it for a catering job this weekend. Three real constraints.

**[Beat 3 · editor: the one-pass reply · 0:45]**
> Now ask a model, in one call, to write a friendly support reply. You get this. It
> is grammatical, warm, and useless. Read it against the ticket. It never names the
> cracked jar. It never acknowledges the weekend deadline. And worst of all, it
> tells the customer nothing about what happens next. No replacement, no timeline,
> no action. The model had no signal for what a good reply is, so it stopped at
> plausible.

**[Beat 4 · slide: next-token · 1:40]**
> This is not a weak model failing. Plausible is simply where next-token prediction
> ends. A model trained to continue text produces text that reads like a support
> reply, because that is the likely continuation. Nothing in that objective rewards
> resolving the problem, only sounding like a reply that might. Ungrounded models
> produce fluent text that is confidently incomplete. [cite: Ji et al., 2023]

**[Beat 5 · slide: Prompt-harder anti-pattern · 2:25]**
> So you are tempted to prompt harder. Be specific! Include a next step! Name this
> anti-pattern, because it will tempt you for your whole career. Prompt-harder
> conflates generation and judgment in one call, it has no measurable success
> signal, and it degrades as you add requirements, because each new clause competes
> for the model's attention. The fix is structural, not textual. A second step
> whose only job is to judge the first. [cite: Madaan et al., 2023]

**[Beat 6 · slide: three checks · 3:25]**
> What would good look like? Three checks you can verify by reading the text. One,
> does it name the specific issue, the cracked jar, the broken seal. Two, does it
> give a concrete next step, a replacement, a timeline. Three, does it close
> properly. Not "is it empathetic," which you cannot score, but checks you can.

**[Beat 7 · editor: the strong reply · 4:05]**
> Here is a reply that passes all three. It names the jar, promises a replacement
> with overnight delivery before the weekend, and signs off. The difference is not
> warmth or word count. It is whether the reply did the job. Those three checks are
> the seed of a critic.

**[Beat 8 · talking-head · 4:40]**
> One pass gives you plausible. Good needs a target the generator does not hold on
> its own, plus a second attempt. That is a loop, and a loop needs a thing that
> judges. Next lesson we turn these three checks into a stub critic and wire the
> cycle.

## Block 4 — Post-production

- Lower-third citations on Beats 4 and 5.
- On Beat 3, animate red strike-throughs as each missing element is named (no jar /
  no deadline / no next step).
- On Beat 7, animate green check-marks against the three checks as the strong reply
  satisfies each.
- Chapter markers at Beats 2, 4, 5, 6.
- Export 1080p/30, H.264, ~ −16 LUFS.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** scratch file open; the ticket text visible; cursor underlines
  "cracked jar," "won't seal," "this weekend."
- **Beat 3:** reveal the weak reply below the ticket; as VO names each gap, draw a
  red strike near the relevant absence (post-production annotation).
- **Beat 4:** cut to next-token slide.
- **Beat 5:** cut to the "Prompt-harder" anti-pattern card; citation lower-third.
- **Beat 6:** three-checks slide; reveal each check line as spoken.
- **Beat 7:** reveal the strong reply; green check-marks animate against the three
  checks.

(No optional steps in this lesson — no bonus footage.)
