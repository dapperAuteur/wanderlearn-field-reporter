import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

/**
 * Wrap with the error-monitoring build plugin (Better Stack ingests the `@sentry/nextjs` format).
 *
 * Safe with no monitoring env set: without `SENTRY_AUTH_TOKEN` it simply skips source-map upload, so
 * you get minified stack traces and a successful build, and the runtime SDK stays inert without a
 * DSN. `org` / `project` / the auth token come from env so nothing secret is committed here.
 *
 * `webpack.treeshake.removeDebugLogging` replaces the deprecated top-level `disableLogger`. This
 * repo builds with Turbopack (the Next 16 default), where webpack-specific options no-op; the flag
 * is set so it is already correct if the build ever moves to `next build --webpack`.
 */
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
