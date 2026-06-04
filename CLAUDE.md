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

The site **brandanthonymcdonald.com** (BAM's personal portfolio) lives in
`/Users/bam/Code_NOiCloud/ai-builds/claude/bam-landing-page/` — **NOT**
`bam-portfolio`. A stray directory at
`/Users/bam/Code_NOiCloud/projects/bam-portfolio/` exists from a prior misplaced
`Write` call; it is not a real repo. When asked to work on the
brandanthonymcdonald.com codebase, target `bam-landing-page`.

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

## Operator-task rule

Anytime work requires BAM to do something **outside the editor** — API key
generation, account signup, env-var setup, DNS, vendor dashboard configuration,
PR review/merge — create a task file under `./plans/user-tasks/`. No exceptions
for "small" steps. The index `./plans/user-tasks/00-descriptions.md` is the queue
BAM scans at session start; its table uses the columns
`# | Title | Scope | Blocks | Status`. Ecosystem-wide tasks live in the canonical
witus queue at `gemini/witus/plans/user-tasks/`. Full rule: `gemini/witus/CLAUDE.md`.

---

## Branch-hygiene rule

In force across every ecosystem repo. **Half 1** — Claude branches → commits →
pushes → stops; BAM merges. Never `git checkout main && git merge`, never
`git push --force`. Re-run `git branch --show-current` before *every* commit.
**Half 2** — BAM merges pushed branches between sessions; assume prior branches
are already merged into `main` at session start, and watch for the silent
fast-forward trap mid-session. **Half 3** — one concern per branch; consolidate
multiple branches into one `bundle/<slug>-YYYY-MM-DD` with `git merge --no-ff`
before handoff. Full rule: `gemini/witus/CLAUDE.md`.

---

## Citation rule

The `docs/lessons/` curriculum (Day 6) is teachable content — it uses **APA 7
in-line citations** (`(Author, Year)`) with a `## References` section per file.
The rule covers all curriculum / professional / business writing ecosystem-wide.
It does **not** apply to code comments, READMEs, `plans/user-tasks/*`, or
engineering notes. Full rule: `gemini/witus/CLAUDE.md`.

---

## Documentation-currency rule

User-facing docs must not drift from the app. **Any change to app behavior — a new
or changed route, a change to the auth/public surface (`isPublic()` in
`src/proxy.ts`), the capture/generate/review flow, providers, env vars, or the
`/admin` surface — must update the user docs in the same PR.** The two user docs
are the in-app onboarding page [`src/app/help/page.tsx`](src/app/help/page.tsx)
(written for visitors, lesson-creators, and operators — no dev knowledge assumed)
and the `README.md` (the engineering reference). When you touch `src/app/**` routes
or `src/proxy.ts`, re-read `/help` and the README and reconcile them before
committing. New top-level user-facing routes should also be linked from `/help`.

(This is an advisory rule enforced in review, not a hook. If drift becomes a
recurring problem, add a pre-commit check that flags PRs touching `src/app/**`
without touching `src/app/help/` or `README.md`.)

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
- **Post-launch:** email-link auth — `src/proxy.ts` gates the whole app,
  single-user magic-link sign-in (jose JWT session, single-use token, Mailgun
  HTTP API). Adds the `login_tokens` table (migration `0002`). Needs the auth
  env vars from `plans/user-tasks/05-provision-auth-mailgun.md`. Done.

---

## Plans convention

All implementation plans live in `./plans/` as markdown named `NN-description-of-plan.md` — two-digit numeric prefix, kebab-case slug, next available number, don't skip. Sub-queues: `./plans/user-tasks/NN-slug.md` (operator tasks), `./plans/bugs/`, `./plans/future/`. (`plans/` is typically gitignored — local working notes.) Full rule: `gemini/witus/CLAUDE.md` §"Plans convention".
