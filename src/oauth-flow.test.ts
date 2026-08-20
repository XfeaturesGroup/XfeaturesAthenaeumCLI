import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

/**
 * The PKCE primitives are covered in pkce.test.ts. What those tests cannot see
 * is whether the flow actually *uses* them correctly -- a correct S256 helper
 * is worth nothing if the authorize request asks for `plain`, and a public
 * client that quietly sends a client_secret is no longer a public client.
 *
 * Driving `loginWithAccount` directly would mean opening a browser and binding
 * a socket, so these read the source instead. That is the same approach the
 * Worker's own security tests take for structural invariants.
 */
// These run from dist/ after compilation, so the source sits one level up.
// Resolved rather than hardcoded so it works whichever directory it runs from.
const CANDIDATES = [
  join(import.meta.dirname, "..", "src", "oauth-flow.ts"),
  join(import.meta.dirname, "oauth-flow.ts"),
];
const SOURCE = (() => {
  for (const candidate of CANDIDATES) {
    try {
      return readFileSync(candidate, "utf8");
    } catch {
      continue;
    }
  }
  throw new Error(`Could not locate oauth-flow.ts. Looked in: ${CANDIDATES.join(", ")}`);
})();

test("the authorize request asks for S256, never plain", () => {
  assert.match(SOURCE, /code_challenge_method"?,\s*"S256"/);
  assert.doesNotMatch(SOURCE, /"plain"/);
});

test("the authorize request sends a code_challenge and a state", () => {
  assert.match(SOURCE, /set\("code_challenge",/);
  assert.match(SOURCE, /set\("state",/);
});

test("a state mismatch aborts the login instead of continuing", () => {
  assert.match(SOURCE, /callback\.state !== state/);
  assert.match(SOURCE, /throw new Error\(/);
});

test("the token exchange sends the verifier and no client_secret", () => {
  // The verifier is what authenticates this exchange; a secret would mean the
  // application is confidential, which a distributed CLI cannot be.
  assert.match(SOURCE, /code_verifier:/);
  const withoutComments = SOURCE.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  assert.doesNotMatch(withoutComments, /client_secret/);
});

test("the redirect target is loopback, not a hosted page", () => {
  // A hosted redirect would hand the authorization code to a page this client
  // does not control.
  assert.doesNotMatch(SOURCE, /redirectUri\s*=\s*"https?:\/\/(?!127\.0\.0\.1|localhost)/);
});
