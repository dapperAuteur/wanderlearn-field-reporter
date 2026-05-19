import type { Config } from "drizzle-kit";
import { config as loadEnv } from "dotenv";

// drizzle-kit runs outside the Next.js runtime, so it only sees what `dotenv`
// loads. Load `.env.local` first (Next's machine-local convention), then `.env`.
loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

// Migrations run over the direct (unpooled) connection — DDL through a Neon
// transaction pooler is unreliable — and fall back to the pooled URL. The Neon
// Vercel-Marketplace integration injects both as STORAGE_-prefixed vars.
// `drizzle-kit generate` diffs the schema offline and never connects, so the
// `?? ""` keeps it runnable before a database has been provisioned.
export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.STORAGE_DATABASE_URL_UNPOOLED ??
      process.env.STORAGE_DATABASE_URL ??
      "",
  },
} satisfies Config;
