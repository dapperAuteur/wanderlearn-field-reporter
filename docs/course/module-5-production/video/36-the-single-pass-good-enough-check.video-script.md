# Video script · Module 5 · Lesson 36 · The "single-pass good enough?" check

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 5 · Lesson 36 · The "single-pass good enough?" check before looping at all
- **Duration:** ~4 min
- **Objective:** the viewer can make "should this even loop?" a measured gate, not a default.
- **Segments:** screencast (editor + terminal), talking-head close.
- **Tag:** `course/lesson-36`.

## Block 2 — Pre-production

- `git checkout course/lesson-36`; deps installed.
- `production.ts` open at `singlePassGoodEnough`; test file open.
- Slide: a gate in front of the loop.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> The cheapest reflection loop is the one you do not run. After five modules of building loops, this
> lesson asks the question that can delete the whole apparatus for a given task: is a single pass already
> good enough?

**[Beat 2 · slide: the default that costs · 0:30]**
> It is easy to reach for a loop because you have one and it is sophisticated. But for many inputs a single
> well-prompted pass already clears the rubric, and on those, the write-critique-revise cycle is pure
> overhead: extra latency, extra calls, identical result. The discipline is to check first whether you need
> to loop at all.

**[Beat 3 · editor + terminal: singlePassGoodEnough · 1:10]**
> The check is one comparison against your existing eval. Run the single-shot baseline; if its pass rate
> already meets the bar, ship single-shot and skip the loop. The test shows both outcomes. With a weak
> single-shot writer the check says loop, zero percent. With a strong single-shot writer it says don't loop,
> the single pass already passes nine of ten, so the loop would add cost for no gain.

**[Beat 4 · slide: a gate before the graph · 2:10]**
> In production this is a gate in front of the loop, decided per task and re-checked as models improve.
> Measure single-shot quality on a representative dataset, you already have the eval. If it clears the
> threshold with margin, ship single-shot. If not, loop, and use the rest of Module 5 to keep it honest.
> This is the production form of Module 4's pairwise lesson: pairwise told you whether the loop beats single
> shot, this gate acts on that answer by not running the loop when the margin is zero. As models get better,
> single-shot quality rises, so re-run the check, do not assume yesterday's answer.

**[Beat 5 · talking-head · 3:15]**
> The anti-pattern: looping by default, running the loop on every input because you built one. On easy
> inputs that is pure overhead. The intellectually honest move, the one that marks engineering judgment over
> pattern-collecting, is to make not looping a first-class, measured option. The best reflection loop for a
> task is sometimes no reflection loop.

## Block 4 — Post-production

- Beat 3: zoom the two assertions (weak → loop; strong → don't loop).
- Beat 4: gate-before-the-graph diagram.
- Chapter markers at Beats 2, 3, 4.

## Block 5 — Screen-recording description (shot list)

- **Beat 3:** `production.ts` `singlePassGoodEnough`; terminal run pointing at the single-pass block
  (weak false, strong true).
- **Beat 4:** gate diagram (single-shot check → loop or ship).

(No optional steps in this lesson — no bonus footage.)
