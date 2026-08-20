#!/usr/bin/env node
/**
 * Refreshes the vendored SDK build output from a local checkout of
 * XfeaturesAthenaeumSDK.
 *
 * The SDK is a separate private repository, and npm publishing is deliberately
 * disabled, so there is no registry to install it from. A git dependency would
 * need a cross-repository token in CI, which turns every build into a
 * credential problem. Vendoring the *build output* avoids that: no source is
 * duplicated, the SDK repository stays the single source of truth, and the
 * commit it came from is recorded in vendor/PROVENANCE.json.
 *
 *   node scripts/sync-sdk.mjs [path-to-sdk-checkout]
 */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync, readdirSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sdkRoot = resolve(process.argv[2] ?? join(ROOT, "..", "XfeaturesAthenaeumSDK"));

if (!existsSync(join(sdkRoot, "packages", "athenaeum-sdk"))) {
  console.error(`No SDK checkout at ${sdkRoot}.`);
  console.error("Clone XfeaturesGroup/XfeaturesAthenaeumSDK beside this repository, or pass its path.");
  process.exit(1);
}

const commit = execFileSync("git", ["-C", sdkRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();

for (const pkg of ["athenaeum-types", "athenaeum-sdk"]) {
  const from = join(sdkRoot, "packages", pkg);
  const to = join(ROOT, "vendor", pkg);
  if (!existsSync(join(from, "dist"))) {
    console.error(`${pkg} is not built. Run its build in the SDK checkout first.`);
    process.exit(1);
  }
  rmSync(to, { recursive: true, force: true });
  mkdirSync(to, { recursive: true });
  cpSync(join(from, "dist"), join(to, "dist"), { recursive: true });
  // Tests and source maps are not part of what a consumer needs.
  for (const file of readdirSync(join(to, "dist"))) {
    if (file.includes(".test.") || file.endsWith(".map")) unlinkSync(join(to, "dist", file));
  }
  const manifest = JSON.parse(readFileSync(join(from, "package.json"), "utf8"));
  if (pkg === "athenaeum-sdk") manifest.dependencies = { "@xfeatures/athenaeum-types": "file:../athenaeum-types" };
  writeFileSync(join(to, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`  ${pkg}: synced`);
}

writeFileSync(
  join(ROOT, "vendor", "PROVENANCE.json"),
  `${JSON.stringify({
    generated: true,
    doNotEdit: "Build output copied from the SDK repository. Regenerate with 'npm run sync:sdk'; never hand-edit.",
    source: "https://github.com/XfeaturesGroup/XfeaturesAthenaeumSDK",
    commit,
    packages: ["@xfeatures/athenaeum-types", "@xfeatures/athenaeum-sdk"]
  }, null, 2)}\n`
);
console.log(`vendor/PROVENANCE.json -> ${commit}`);
