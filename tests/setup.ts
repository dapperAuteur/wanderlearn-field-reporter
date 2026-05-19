// Vitest setup — load local env so any test that opts into live services can
// read its keys. The Day-1 critique test mocks the LLM and needs none of this.
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });
