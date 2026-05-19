import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { requireEnv } from "@/lib/env";
import * as schema from "./schema";

/**
 * The Drizzle client over Neon's HTTP driver.
 *
 * Cached on `globalThis` so Next's dev HMR does not leak a new client on every
 * reload. `getDb()` throws only if it is actually called without
 * `STORAGE_DATABASE_URL` set — importing this module stays safe, so the agent
 * graph (which never touches the DB) is unaffected when the URL is absent.
 */
export type Db = NeonHttpDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { __wlfrDb?: Db };

export function getDb(): Db {
  if (globalForDb.__wlfrDb) {
    return globalForDb.__wlfrDb;
  }
  const sql = neon(requireEnv("STORAGE_DATABASE_URL"));
  globalForDb.__wlfrDb = drizzle(sql, { schema });
  return globalForDb.__wlfrDb;
}
