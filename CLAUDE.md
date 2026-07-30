@AGENTS.md

# Wanderlearn Field Reporter

A LangGraph (LangChain JS) agent that turns a raw Wanderlearn capture — location
transcript, GPS, photo references — into a publishable lesson draft. The agent
researches the location, drafts an objectives-first outline, writes a cited
script, then self-critiques against a rubric and revises until the draft passes
or hits a max revision count. It is **shared infrastructure** in the WitUS
ecosystem and a sibling of Wanderlearn (the 360° place-based course product).

This repo is also a **portfolio piece** for LangChain hiring managers — the
reflection / self-critique loop and the `docs/lessons/` curriculum are meant to
be read by outside engineers. Keep the code legible.

---

## ⚠️ Ecosystem repo identity (don't confuse these)

This repo (`wanderlearn-field-reporter`, under `claude/lang-chain/`) is the
LangGraph **lesson-drafting agent**. It is **not** the Wanderlearn product app
(`gemini/wanderlearn/`), which owns the 360° captures, the course library, and
the public Wanderlearn site. This repo only drafts lessons *from* captures; the
operator reviews each draft and publishes it into Wanderlearn manually.

---

## Branding — read before any UI change

Ecosystem branding is canonical at `gemini/witus/public/brand/` (README +
`footer-recipe.md`). This app uses the **`sky` accent** — Wanderlearn's ecosystem
accent per `gemini/witus/lib/products.ts` — on a slate surface. The ecosystem
footer (`src/components/site-footer.tsx`) carries the verbatim **Rise Wellness**
non-affiliation disclaimer; it must stay **byte-identical** — never paraphrase
it. Favicons are the WitUS brand package, variant `01-orbit`, copied into
`public/brand/witus/` and wired via `metadata.icons` in `src/app/layout.tsx`.

---

## Project specifics

- **Stack:** Next.js 16 (app router, `src/`), TypeScript strict, Tailwind v4,
  shadcn/ui, `@langchain/langgraph`, Drizzle ORM on `@neondatabase/serverless`,
  Vitest. Node 20+.
- **LLM:** dual-provider via the factory in `src/agent/llm.ts` — Claude Sonnet 4.6
  (`@langchain/anthropic`) or Gemini 2.5 Flash (`@langchain/google-genai`), chosen
  per run (`state.llmProvider`, set from the capture form) so draft quality can
  be compared across providers.
- **The agent** is a cyclic reflection graph: research → outline → write →
  critique → (revise | done). The rubric in `src/agent/rubric.ts` is the single
  source of truth — the critique node scores against it; edit the rubric there,
  never in node code. `MAX_REVISIONS` (default 3) is exported from
  `src/agent/graph.ts`. Agent nodes are pure, fail-soft functions of state.
- **LangSmith** tracing is on by default but the app must still run if
  `LANGSMITH_API_KEY` is missing.
- **The `webSearch` tool** (Day 3) may never be called more than 5 times per
  agent run — enforced as a node-level guard, never a prompt instruction.
- **Auth** is single-user email-link sign-in (hand-rolled, not NextAuth). The
  gate is deliberately narrow: read-only report views stay public so portfolio
  visitors can browse, and only the cost-incurring paths (the capture form and
  `POST /api/field-report/generate`) require sign-in. The allow-list lives in
  `isPublic()` inside `src/proxy.ts`; the authoritative checks (`requireUser` /
  `requireApiUser`) live in `src/lib/auth/dal.ts` — proxy alone is never the
  boundary. Only `ADMIN_EMAIL` may sign in; the link is sent via the Mailgun
  HTTP API; the session is a jose-signed JWT cookie.
- **The sign-in form doubles as a waitlist.** Non-admin emails are denied
  access and offered the `waitlist_signups` table (`src/lib/waitlist.ts`,
  migration `0003`) — capturing early interest for when this becomes a paid
  product. The denied state is intentional; the previous account-enumeration
  screen was theater (the admin address is public on the portfolio).
- **Build plan:** the PRD is `plans/PRD-3-wanderlearn-field-reporter.md`; the
  approved Day-1 plan is `~/.claude/plans/add-plans-dir-to-elegant-cascade.md`.

### Day status

- **Day 1:** scaffold + linear graph skeleton with a stub critique. Done.
- **Day 2:** real critique node + cyclic write→critique edge + `MAX_REVISIONS`
  termination + `tests/agent/termination.test.ts`. Done.
- **Day 3:** the `webSearch`, `cloudinaryMetadata`, and
  `existingWanderlearnCourses` tools, wired into the research node. Done.
  `webSearch` calls the Tavily REST API directly — no `@langchain/community`
  (its 1.x release has an `ERESOLVE` peer conflict with `@langchain/core` 1.x)
  and no SDK. The ≤5-calls-per-run cap is a node-level guard in `research`.
- **Day 4:** the operator UI + API surface — `/api/field-report/*`
  routes, the `/field-report` list, the `/field-report/new` capture form, and
  the side-by-side revision viewer at `/field-report/:id`. `/generate` runs the
  agent synchronously and persists the report; nodes stay pure — DB writes live
  in `src/lib/reports.ts`, called from the route. Done.
- **Day 5:** dual-provider LLM — Anthropic (Claude Sonnet 4.6) or Google
  (Gemini 2.5 Flash), switchable per run from the capture form — plus LangSmith
  run-id capture. Done. (Flash, not Pro: Pro is not on the Gemini free tier.)
- **Day 6:** the four `docs/lessons/` curriculum files — code-along lessons on
  reflection loops, rubrics, LangSmith evals, and termination, each on a
  distinct domain, APA 7 cited. Done.
- **Day 7:** polish — `react-markdown` rendering of lesson drafts and the final
  lesson in the report viewer — and ship. The 7-day build plan is complete; the
  agent is deployed and the repo is the portfolio piece. Done.
- **Post-launch:** error monitoring via Better Stack, which ingests the
  `@sentry/nextjs` SDK (so the config files and env var names are the Sentry
  ones, only the DSN is Better Stack's). Inert until `SENTRY_DSN` /
  `NEXT_PUBLIC_SENTRY_DSN` are set (`plans/user-tasks/12-*`). Errors only, no
  tracing (LangSmith owns run observability) and no replay. `beforeSend` runs
  `src/lib/sentry-scrub.ts`: provider keys are matched **by shape** because a
  failing LLM SDK leaks them unlabelled, and **prompts, model responses, and
  capture transcripts are dropped rather than redacted** since they are user
  content and no crash is fixed by reading them. Changing that file means
  updating `tests/lib/sentry-scrub.test.ts`, which asserts on the serialised
  event and counter-asserts against over-redaction. Done.
- **Post-launch:** email-link auth — `src/proxy.ts` gates the whole app,
  single-user magic-link sign-in (jose JWT session, single-use token, Mailgun
  HTTP API). Adds the `login_tokens` table (migration `0002`). Needs the auth
  env vars from `plans/user-tasks/05-provision-auth-mailgun.md`. Done.

---

<!-- BEGIN:witus-shared-rules v1 -->
<!-- MANAGED BLOCK — do not edit by hand. Source: gemini/witus/docs/shared-rules.md.
     Update the source, then run `node scripts/sync-claude-rules.mjs` in the witus repo. -->

## ⚠️ Ecosystem identity (shared note — don't confuse repos)

Full ecosystem identity + the canonical product index live in `gemini/witus/CLAUDE.md` and
`gemini/witus/lib/products.ts`. Each repo states *which* product it is in its own hand-owned line
above this managed block; don't infer another app's URLs, routes, IDs, env names, or DB schema —
confirm against that app's own code.

The site **brandanthonymcdonald.com** (BAM's personal portfolio) lives in `claude/bam-landing-page/`
— **NOT** `projects/bam-portfolio/` (the retired legacy static site). Target `bam-landing-page`.

## Operator-task rule — capture user actions in `./plans/user-tasks/`

When Claude proposes work that needs BAM to do something outside the editor (account signup, API
key, DNS change, vendor dashboard, env-var rotation, secret generation, PR review/merge, etc.),
Claude MUST create a `./plans/user-tasks/NN-slug.md` file in this repo. **No exceptions for "small"
steps.** Required sections: **Scope tag** · **What + why** (with explicit *what this blocks* detail
and any hard deadline) · **Steps** · **What Claude will use** · **How to mark done** · **Related**.
Keep `./plans/user-tasks/00-descriptions.md` updated with columns `# | Title | Scope | Blocks |
Status` — the `Blocks` column is the one BAM scans. Ecosystem-wide tasks (Keap, IRL events, retros,
cross-product decisions) live in the canonical witus queue at `gemini/witus/plans/user-tasks/`;
repo-local tasks live here. Read the witus queue at session start before dependent work. Full rule:
`gemini/witus/CLAUDE.md` §"Operator-task rule".

## Branch hygiene — BAM merges, between sessions by default

**Half 1.** Branch → commit → push → stop. Claude does not run `git checkout main && git merge`.
Never `--force` to shared branches. Before every commit run `git branch --show-current`; if it is
`main`/`master`, branch first (`feat/ fix/ chore/ docs/`). After push, hand back the branch name +
summary and stop.

**Half 2.** BAM merges pushed branches via the GitHub UI between sessions. Mid-session, after a
push, BAM may merge in a separate window and the local checkout silently fast-forwards to `main` —
so re-check `git branch --show-current` before **every** commit, not just at branch creation, or you
risk landing follow-up commits directly on `main`.

**Half 3.** Keep branches small (one concern each). When a session produces multiple branches,
consolidate them into one `bundle/<slug>-YYYY-MM-DD` via `git merge --no-ff` (preserves per-concern
history — no squash), resolve conflicts during bundling, run `tsc + lint + build` against the
bundle, push, and file ONE `./plans/user-tasks/NN-merge-bundle-<slug>.md`. BAM does one merge, not N.

**Commit often.** Commit at every working checkpoint — a passing build, a finished sub-step, a green
test — not just at the end. A usage-limit cutoff, a dropped connection, or a crashed session must
never lose more than the last few minutes of work. Small frequent commits on the feature branch keep
the branch un-merged (Half 1 still holds) and give BAM clean per-step history to drill into.

A checked-in `.githooks/pre-commit` guard refuses commits made directly on `main`/`master`. Activate
once per clone: `git config core.hooksPath .githooks`. Full rule: `gemini/witus/CLAUDE.md`
§"Branch-hygiene rule".

## Docs-sync rule — a change isn't done until its docs are current

When a change adds, alters, or removes a user-visible feature/route/scope, update the affected docs
**in the same branch**: README (feature list, env examples, scripts), in-app help/tutorial content,
`ROADMAP.md` **and** any public roadmap page, API/OpenAPI docs, and STYLE_GUIDE/CONTRIBUTING when a
convention changed. State which docs you touched in the handoff. Never leave an aspirational ✅ on a
roadmap — downgrade it with a one-line reason. If a doc update is genuinely out of scope, file it as
a `./plans/` task rather than skipping silently. A Stop hook in `.claude/settings.json` gates on
this: if the session diff changed feature/route files but touched no docs, it blocks once and asks
you to update-or-defer. Schema-only migrations, refactors, perf, and dev-tooling changes don't
trigger it.

## Plans convention

All implementation plans live in `./plans/` as `NN-description-of-plan.md` (two-digit prefix,
kebab-case, next available number, don't skip). Sub-queues: `./plans/user-tasks/NN-slug.md`
(operator tasks), `./plans/bugs/`, `./plans/future/`. (`plans/` is typically gitignored.)

## Citation rule

Anything publishable, teachable, or partner-facing (curriculum, teaching-oriented help articles,
white papers, grant/sponsor/partner writing) uses APA 7 in-line citations with a `## References`
section. Code docs, internal notes, and `plans/user-tasks/*` are out of scope. Full rule:
`gemini/witus/CLAUDE.md` §"Citation rule".

## Authoritative-values rule — never assert guessed external values

When a value is owned by an external system (DNS/registrar, a host like Vercel, a third-party API,
or another ecosystem app's URLs/routes/IDs/env/schema), read it from the authoritative source; don't
hardcode a guessed default and present it as correct. If you must ship a fallback, label it as a
fallback in both UI copy and a code comment. Verify by behavior (does the flow work?), not by
exact-match against a guess. When unsure, flag or ask — never assert. Full rule:
`gemini/witus/CLAUDE.md` §"Authoritative-values rule".

## Coding conventions

UI/UX/DX conventions (a11y, component patterns, TypeScript, microcopy, git-commit vocabulary, the
default Neon+Drizzle+pnpm+Vitest stack) are consolidated in `gemini/witus/docs/shared-ui-ux-dx.md`.
Read it before writing UI or API code. Two repos are grandfathered on Supabase+Jest and documented
there as exceptions.

<!-- END:witus-shared-rules v1 -->
