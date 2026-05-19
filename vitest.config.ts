import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./tests/setup.ts"],
    // Headroom for any future test that opts into live LLM calls.
    testTimeout: 60_000,
  },
  resolve: {
    alias: {
      // Mirror the tsconfig `@/*` path alias.
      "@": new URL("./src/", import.meta.url).pathname,
      // `server-only` throws when imported outside an RSC bundle — stub it so
      // the agent modules can be exercised under vitest's Node environment.
      "server-only": new URL("./tests/stubs/empty.ts", import.meta.url).pathname,
    },
  },
});
