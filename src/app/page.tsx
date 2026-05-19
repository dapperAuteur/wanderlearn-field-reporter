export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
        WitUS ecosystem · Wanderlearn
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Wanderlearn Field Reporter
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        A LangGraph agent that turns a raw Wanderlearn capture — location
        transcript, GPS, and photo references — into a publishable lesson draft
        through a research, write, and self-critique reflection loop.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Day 1 scaffold: the agent graph runs end to end as a linear pipeline
        (research → outline → write → critique → image prompts). The reflection
        loop and the operator UI arrive in later days.
      </p>
    </main>
  );
}
