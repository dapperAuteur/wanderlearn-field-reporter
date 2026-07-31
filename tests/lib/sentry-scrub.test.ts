import { describe, expect, it } from "vitest";
import type { ErrorEvent } from "@sentry/nextjs";
import {
  DROPPED,
  MAX_TEXT_LEN,
  REDACTED,
  isSecretName,
  scrubEvent,
} from "@/lib/sentry-scrub";

/**
 * The scrubber is the privacy boundary between this agent and the error-monitoring vendor, so the
 * assertions run against `JSON.stringify(scrubbedEvent)`: that is the shape actually sent over the
 * wire, and it catches a secret that survived in a field the test author forgot to look at.
 *
 * Every test has a counter-assertion. Over-redaction is a real failure mode, not a safe default: a
 * report that redacts the route, the provider, the status code, and the OIDC `state` mismatch is a
 * report nobody can debug from, which is how monitoring gets switched off.
 *
 * FIXTURES ARE ASSEMBLED AT RUNTIME, never written as literals, so this file cannot trip a secret
 * scanner or be mistaken for a leaked credential.
 */

/**
 * Deterministic filler of a given length. Not random, so failures are reproducible. `seed` shifts
 * the sequence: every fixture in a test gets its own seed, so a `not.toContain` assertion can never
 * pass or fail because two unrelated fixtures happened to share a prefix.
 */
function body(length: number, seed = 3): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let index = 0; index < length; index += 1) {
    out += alphabet[(index * 7 + seed) % alphabet.length];
  }
  return out;
}

const SK = ["s", "k"].join("");
const KEYS = {
  anthropic: [SK, "ant", "api03", body(95)].join("-"),
  openai: [SK, "proj", body(48)].join("-"),
  openrouter: [SK, "or", "v1", body(64)].join("-"),
  cerebras: ["c" + SK, body(40)].join("-"),
  google: ["A", "I", "z", "a"].join("") + body(35),
  langsmith: ["lsv2", "pt", body(32)].join("_"),
  tavily: ["tvly", body(32)].join("-"),
  mailgun: ["key", body(32)].join("-"),
  jwt: [["ey", "J"].join("") + body(24), body(40, 5), body(43, 7)].join("."),
  bearerValue: body(48, 9),
};

function baseEvent(): ErrorEvent {
  return { type: undefined, event_id: body(32, 59) };
}

describe("sentry-scrub: provider credentials, matched by shape", () => {
  it("redacts unlabelled provider keys inside an exception value", () => {
    const event = baseEvent();
    event.exception = {
      values: [
        {
          type: "Error",
          value: [
            "401 from provider. request headers were",
            KEYS.anthropic,
            KEYS.openai,
            KEYS.openrouter,
            KEYS.cerebras,
            KEYS.google,
            KEYS.langsmith,
            KEYS.tavily,
            KEYS.mailgun,
            KEYS.jwt,
          ].join(" "),
        },
      ],
    };

    const json = JSON.stringify(scrubEvent(event));

    for (const [provider, key] of Object.entries(KEYS)) {
      if (provider === "bearerValue") continue;
      expect(json, `${provider} key survived`).not.toContain(key);
      // A partial leak is still a leak: assert no long prefix of the key survives either.
      expect(json, `${provider} key partially survived`).not.toContain(key.slice(0, 24));
    }
    expect(json).toContain(REDACTED);
    // Counter-assertion: the diagnosis survives the scrub.
    expect(json).toContain("401 from provider");
  });

  it("keeps the auth scheme but drops a bearer token", () => {
    const event = baseEvent();
    event.message = `fetch failed with authorization Bearer ${KEYS.bearerValue}`;

    const json = JSON.stringify(scrubEvent(event));

    expect(json).not.toContain(KEYS.bearerValue);
    expect(json).toContain(`Bearer ${REDACTED}`);
    expect(json).toContain("fetch failed");
  });

  it("drops credentials embedded in a connection URL but keeps the host", () => {
    const password = body(32, 11);
    const event = baseEvent();
    event.message = `connect ETIMEDOUT postgresql://neondb_owner:${password}@ep-cool-db.us-east-2.aws.neon.tech/neondb`;

    const json = JSON.stringify(scrubEvent(event));

    expect(json).not.toContain(password);
    expect(json).not.toContain("neondb_owner");
    // Counter-assertions: host and database still identify which connection failed.
    expect(json).toContain("ep-cool-db.us-east-2.aws.neon.tech");
    expect(json).toContain("ETIMEDOUT");
  });
});

describe("sentry-scrub: request URL and the separate query_string field", () => {
  it("scrubs query_string as a string, which is not a parseable URL", () => {
    const oidcCode = body(40, 13);
    const loginToken = body(48, 17);
    const event = baseEvent();
    event.request = {
      url: "https://field-reporter.witus.online/api/auth/witus/callback",
      query_string: `code=${oidcCode}&state=abc123def456&token=${loginToken}`,
    };

    const json = JSON.stringify(scrubEvent(event));

    expect(json).not.toContain(oidcCode);
    expect(json).not.toContain(loginToken);
    expect(json).toContain(`code=${REDACTED}`);
    expect(json).toContain(`token=${REDACTED}`);
    // Counter-assertion (and the reason segment matching matters): the OIDC `state` is a CSRF
    // correlator, not a bearer secret, and the callback route's whole failure mode is a mismatch.
    expect(json).toContain("state=abc123def456");
    expect(json).toContain("/api/auth/witus/callback");
  });

  it("scrubs query_string in its object shape", () => {
    const token = body(48, 19);
    const event = baseEvent();
    event.request = { query_string: { token, state: "xyz789", next: "/field-report" } };

    const json = JSON.stringify(scrubEvent(event));

    expect(json).not.toContain(token);
    expect(json).toContain("xyz789");
    expect(json).toContain("/field-report");
  });

  it("scrubs query_string in its array-of-pairs shape", () => {
    const token = body(48, 23);
    const event = baseEvent();
    event.request = {
      query_string: [
        ["token", token],
        ["state", "pair-state"],
      ],
    };

    const json = JSON.stringify(scrubEvent(event));

    expect(json).not.toContain(token);
    expect(json).toContain("pair-state");
  });

  it("masks a token in an auth path but never a report id with the same shape", () => {
    const token = body(43, 29);
    const reportId = body(36, 31);
    const event = baseEvent();
    event.request = { url: `https://example.test/api/auth/verify/${token}` };
    event.tags = { route: `/field-report/${reportId}` };

    const json = JSON.stringify(scrubEvent(event));

    expect(json).not.toContain(token);
    // Path context, not shape: the report id is the same shape and is how you find the failing run.
    expect(json).toContain(reportId);
  });

  it("drops cookies, auth headers, and the request env snapshot", () => {
    const event = baseEvent();
    event.request = {
      cookies: { wlfr_session: KEYS.jwt },
      env: { ANTHROPIC_API_KEY: KEYS.anthropic },
      headers: {
        authorization: `Bearer ${KEYS.bearerValue}`,
        cookie: `wlfr_session=${KEYS.jwt}`,
        "x-api-key": KEYS.tavily,
        "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      },
    };

    const scrubbed = scrubEvent(event);
    const json = JSON.stringify(scrubbed);

    expect(scrubbed.request?.cookies).toBeUndefined();
    expect(scrubbed.request?.env).toBeUndefined();
    expect(json).not.toContain(KEYS.jwt);
    expect(json).not.toContain(KEYS.bearerValue);
    expect(json).not.toContain(KEYS.tavily);
    expect(json).not.toContain("authorization");
    // Counter-assertion: the user agent is how you reproduce a client-only crash.
    expect(json).toContain("iPhone OS 17_0");
  });
});

describe("sentry-scrub: key-aware deep scrub", () => {
  it("spans underscores in screaming-snake env names", () => {
    const authSecret = body(44, 37);
    const event = baseEvent();
    event.extra = {
      LANGSMITH_API_KEY: KEYS.langsmith,
      NEXTAUTH_SECRET: authSecret,
      MAILGUN_API_KEY: KEYS.mailgun,
      LANGSMITH_PROJECT: "wanderlearn-field-reporter",
      FIELD_REPORTER_LLM_PROVIDER: "anthropic",
    };

    const json = JSON.stringify(scrubEvent(event));

    expect(json).not.toContain(KEYS.langsmith);
    expect(json).not.toContain(KEYS.mailgun);
    expect(json).not.toContain(authSecret);
    // Counter-assertions: non-secret env values are exactly what tells you which run this was.
    expect(json).toContain("wanderlearn-field-reporter");
    expect(json).toContain("anthropic");
  });

  it("reaches breadcrumbs, extra, tags, and contexts, and leaves contexts.trace alone", () => {
    const traceId = body(32, 41);
    const accessToken = body(40, 43);
    const sessionId = body(24, 47);
    const event = baseEvent();
    event.breadcrumbs = [
      {
        category: "http",
        message: `POST https://api.anthropic.com/v1/messages 429 with apiKey=${KEYS.anthropic}`,
        data: { status_code: 429, api_key: KEYS.anthropic, url: "https://api.anthropic.com" },
      },
    ];
    event.extra = { nested: { deeper: { accessToken, attempt: 2 } } };
    event.tags = { "session.id": sessionId, node: "critique" };
    event.contexts = {
      trace: { trace_id: traceId, span_id: body(16, 53), op: "http.server" },
      llm: { provider: "anthropic", apiKey: KEYS.anthropic, model: "claude-sonnet-4-6" },
    };

    const scrubbed = scrubEvent(event);
    const json = JSON.stringify(scrubbed);

    expect(json).not.toContain(KEYS.anthropic);
    expect(json).not.toContain(accessToken);
    expect(json).not.toContain(sessionId);
    // contexts.trace is exempt: it is the link between this error and its trace.
    expect(scrubbed.contexts?.trace?.trace_id).toBe(traceId);
    // Counter-assertions: the whole point of a breadcrumb is the 429 and the node it happened in.
    expect(json).toContain("429");
    expect(json).toContain("critique");
    expect(json).toContain("claude-sonnet-4-6");
    expect(json).toContain('"attempt":2');
  });

  it("matches per name segment, so lookalike names are not redacted", () => {
    const event = baseEvent();
    event.extra = {
      keyboardLayout: "qwerty",
      status_code: 500,
      code_review: "pending",
      authProvider: "witus",
      monkey: "patched",
      revisionNumber: 3,
      passing: false,
    };

    const json = JSON.stringify(scrubEvent(event));

    expect(json).toContain("qwerty");
    expect(json).toContain('"status_code":500');
    expect(json).toContain("pending");
    expect(json).toContain("witus");
    expect(json).toContain("patched");
    expect(json).toContain('"revisionNumber":3');
    expect(json).toContain('"passing":false');
    expect(json).not.toContain(REDACTED);
  });

  it("survives a circular context without recursing forever", () => {
    const event = baseEvent();
    const cycle: Record<string, unknown> = { node: "write" };
    cycle.self = cycle;
    event.extra = { cycle };

    const json = JSON.stringify(scrubEvent(event));

    expect(json).toContain("circular");
    expect(json).toContain("write");
  });
});

describe("sentry-scrub: prompts, model responses, and captures are dropped", () => {
  it("drops prompt and response fields wholesale, keeping their names", () => {
    const secretProse = "The union hall on Cesar Chavez was where the 1968 walkout began";
    const event = baseEvent();
    event.extra = {
      prompt: `Write a lesson about: ${secretProse}`,
      messages: [{ role: "system", content: secretProse }],
      completion: secretProse,
      transcript: secretProse,
      draft: { markdown: secretProse },
      latitude: 30.2672,
      longitude: -97.7431,
      // Triage metadata that must NOT be dropped.
      provider: "google",
      model: "gemini-2.5-flash",
      revisionNumber: 2,
      durationMs: 18432,
      reportId: "rep_01hx",
    };

    const json = JSON.stringify(scrubEvent(event));

    expect(json).not.toContain(secretProse);
    expect(json).not.toContain("30.2672");
    expect(json).not.toContain("-97.7431");
    expect(json).toContain(DROPPED);
    // The field NAMES survive, so the shape of the failure is still readable.
    expect(json).toContain("prompt");
    expect(json).toContain("messages");
    // Counter-assertions: everything needed to reproduce the run survives.
    expect(json).toContain("gemini-2.5-flash");
    expect(json).toContain("google");
    expect(json).toContain('"revisionNumber":2');
    expect(json).toContain('"durationMs":18432');
    expect(json).toContain("rep_01hx");
  });

  it("drops a raw string request body and deep-scrubs an object body", () => {
    const capture = "Standing at the trailhead, the ranger explained the 1910 burn";
    const stringBodyEvent = baseEvent();
    stringBodyEvent.request = { method: "POST", data: capture };

    const objectBodyEvent = baseEvent();
    objectBodyEvent.request = {
      method: "POST",
      data: { transcript: capture, llmProvider: "anthropic", photoCount: 4 },
    };

    const stringJson = JSON.stringify(scrubEvent(stringBodyEvent));
    const objectJson = JSON.stringify(scrubEvent(objectBodyEvent));

    expect(stringJson).not.toContain(capture);
    expect(objectJson).not.toContain(capture);
    // Counter-assertions: an object body keeps the keys a validation bug is diagnosed from.
    expect(objectJson).toContain("anthropic");
    expect(objectJson).toContain('"photoCount":4');
  });

  it("deletes stack-frame local variables, where a node's prompt actually lives", () => {
    const prompt = "You are drafting a lesson. Capture follows: the mill closed in 1974";
    const event = baseEvent();
    event.exception = {
      values: [
        {
          type: "OutputParserException",
          value: "Failed to parse rubric JSON",
          stacktrace: {
            frames: [
              {
                filename: "src/agent/nodes/critique.ts",
                function: "critique",
                lineno: 88,
                vars: { systemPrompt: prompt },
              },
            ],
          },
        },
      ],
    };

    const scrubbed = scrubEvent(event);
    const json = JSON.stringify(scrubbed);

    expect(json).not.toContain(prompt);
    expect(scrubbed.exception?.values?.[0]?.stacktrace?.frames?.[0]?.vars).toBeUndefined();
    // Counter-assertions: the frame itself is the reason we report at all.
    expect(json).toContain("src/agent/nodes/critique.ts");
    expect(json).toContain('"lineno":88');
  });

  it("caps free text so an entire model response cannot ride inside an error message", () => {
    const prose = "Rain fell on the quarry road and the guide kept talking. ";
    const event = baseEvent();
    event.exception = {
      values: [
        {
          type: "SyntaxError",
          value: `Unexpected token in model output: ${prose.repeat(200)}`,
        },
      ],
    };

    const scrubbed = scrubEvent(event);
    const value = scrubbed.exception?.values?.[0]?.value ?? "";

    expect(value.length).toBeLessThan(MAX_TEXT_LEN + 64);
    expect(value).toContain("truncated");
    // Counter-assertion: the first line, which names the bug, always survives the cap.
    expect(value.startsWith("Unexpected token in model output:")).toBe(true);
  });
});

describe("sentry-scrub: identity", () => {
  it("removes the operator email, IP, and username", () => {
    const event = baseEvent();
    event.user = {
      id: "operator",
      email: "bam@awews.com",
      ip_address: "203.0.113.42",
      username: "dapperAuteur",
    };

    const json = JSON.stringify(scrubEvent(event));

    expect(json).not.toContain("bam@awews.com");
    expect(json).not.toContain("203.0.113.42");
    expect(json).not.toContain("dapperAuteur");
    // Counter-assertion: the opaque id stays, so repeated crashes still group by actor.
    expect(json).toContain("operator");
  });
});

describe("isSecretName", () => {
  it("recognises credential names across separators and cases", () => {
    for (const name of [
      "api_key",
      "apiKey",
      "APIKEY",
      "x-api-key",
      "access_token",
      "LANGSMITH_API_KEY",
      "NEXTAUTH_SECRET",
      "authorization",
      "set-cookie",
      "wlfr_session",
      "auth_code",
      "code",
      "signature",
    ]) {
      expect(isSecretName(name), `${name} should be secret`).toBe(true);
    }
  });

  it("leaves lookalikes and load-bearing triage names alone", () => {
    for (const name of [
      "state",
      "status_code",
      "code_review",
      "keyboardLayout",
      "monkey",
      "authProvider",
      "sortOrder",
      "model",
      "provider",
      "revisionNumber",
      "route",
      "node",
      "durationMs",
    ]) {
      expect(isSecretName(name), `${name} should not be secret`).toBe(false);
    }
  });
});
