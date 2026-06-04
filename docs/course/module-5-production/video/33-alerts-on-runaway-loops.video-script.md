# Video script · Module 5 · Lesson 33 · Alerts on runaway loops

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 5 · Lesson 33 · Alerts on runaway loops
- **Duration:** ~4 min
- **Objective:** the viewer can define and count a runaway loop and wire alerts that fire on the
  right signals.
- **Segments:** screencast (editor + terminal), talking-head close.
- **Tag:** `course/lesson-33`.

## Block 2 — Pre-production

- `git checkout course/lesson-33`; deps installed.
- `production.ts` open at `runawayCount` + `checkAlerts`; test file open.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> A metric you have to remember to look at is a metric you will miss at 3am. We turn the metrics into
> alerts, with special attention to the runaway loop, the failure that costs the most and hides the
> longest.

**[Beat 2 · editor: runawayCount · 0:30]**
> Module 1 guaranteed the loop terminates. But terminating at the cap, unresolved, every time, is its
> own pathology: maximum cost, zero good output. That is a runaway loop. We count it explicitly:
> escalated and hit the hard cap. Distinct from a run that escalated early by convergence detection,
> which is the loop being efficient.

**[Beat 3 · editor: checkAlerts · 1:20]**
> Check-alerts compares the metrics to thresholds and returns what fired. Three signals: low
> convergence, runaway, cost. And watch how they interact. When convergence hits zero, there are no
> resolved runs, so cost-per-converged is infinity, and the cost alert fires too. The test asserts all
> three fire on a fully-runaway loop. That is correct: a runaway loop is not converging, running away,
> and infinitely expensive per good output. One pathology, three alarms, exactly the redundancy you
> want for the worst case.

**[Beat 4 · slide: two disciplines · 2:30]**
> Two disciplines keep alerts useful. Alert on rates over a window, not single runs, one escalation is
> normal, a rate is signal. And set thresholds with margin, the same judge noise from Module 4, alert
> when convergence drops clearly below normal, not on every wobble, or the team mutes the pager. And a
> muted pager catches nothing.

**[Beat 5 · talking-head · 3:15]**
> The anti-pattern: the dashboard nobody watches. Perfect metrics, no alert, and the 3am regression runs
> for six hours. A metric without an alert is a metric you will miss exactly when it matters. The runaway
> loop is the most expensive failure. Count it, alert on it, page on it.

## Block 4 — Post-production

- Beat 2: highlight `escalated && revisions >= maxRevisions`.
- Beat 3: highlight the three alert branches; zoom the all-three assertion.
- Beat 4: two-disciplines slide.
- Chapter markers at Beats 2, 3, 4.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** `production.ts` — `runawayCount` filter.
- **Beat 3:** `production.ts` — `checkAlerts`; terminal run pointing at the runaway test (3 alerts).
- **Beat 4:** rates-and-margin slide.

## Bonus footage — Optional: wire a LangSmith monitor/alert on convergence

> Optional. Requires a LangSmith account (operator task 09). Record ~75s.

**Pre-production:** LangSmith project with traced runs; a metric/monitor configured on the dashboard.

**VO (verbatim):**
> Optional. With tracing on, LangSmith aggregates your runs into charts. Build a monitor on convergence
> rate, or on escalations over a window, and set an alert threshold. Now the 3am regression pages you
> instead of hiding. The local check-alerts you just wrote is the same logic, and in LangSmith it runs on
> your real traffic continuously.

**Shot list:** open the LangSmith project; create a chart/monitor on outcome or a custom metric; set a
threshold + notification; show the alert config. Tie back to `checkAlerts` as the same logic on live data.
