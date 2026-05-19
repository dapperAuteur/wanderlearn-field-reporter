import type { Config } from "drizzle-kit";
import { config as loadEnv } from "dotenv";

// drizzle-kit runs outside the Next.js runtime, so it only sees what `dotenv`
// loads. Load `.env.local` first (Next's machine-local convention), then `.env`.
loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

// `drizzle-kit generate` (Day 1) diffs the schema offline and never connects.
// `migrate` / `push` require a real DATABASE_URL; the `?? ""` keeps `generate`
// runnable before a Neon database has been provisioned.
export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
} satisfies Config;
