# Security policy

## Reporting a vulnerability

Please do **not** open a public issue. Report privately through GitHub's
[private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
on this repository, or contact the maintainers directly.

## In scope here

This is a public OAuth client that handles a person's access token. The
credential-handling surface is what matters:

- **The PKCE flow**: anything that lets an authorization code be redeemed by
  something other than this process — a downgrade to `plain`, a predictable or
  reused `code_verifier`, a missing or unchecked `state`, a redirect that is not
  loopback, or a verifier that leaves the process before the token exchange
- **Token storage**: the stored credential's location and permissions, anything
  that writes a token to a log, a shell history, an error message or a
  world-readable file
- **Token transmission**: a token attached to a request bound for anywhere other
  than the configured Athenaeum host
- **Command handling**: argument parsing that could cause a different operation
  to run than the one typed, or a file path that reads something unintended

## Not in scope

- **Server-side authorization.** This CLI holds no permissions. What your token
  may read is decided by
  [Athenaeum](https://github.com/XfeaturesGroup/XfeaturesAthenaeum) from its own
  database, on every call. "I edited the CLI and got data I should not have" is
  a server finding; report it there.
- **The absence of a publish command.** Deliberate: no transport exposes one.
- **The `client_id` in the source.** A `client_id` names an application and does
  not authenticate it (RFC 6749 §2.2). This is a public client and holds no
  secret by design.

## The SDK dependency

This CLI depends on
[`@xfeaturesgroup/athenaeum`](https://www.npmjs.com/package/@xfeaturesgroup/athenaeum)
as an ordinary npm package. A problem in that code belongs in the
[SDK repository](https://github.com/XfeaturesGroup/XfeaturesAthenaeumSDK), not
here -- fixing it in this repository would mean forking it.
