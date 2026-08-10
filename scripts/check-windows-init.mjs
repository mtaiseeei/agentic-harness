#!/usr/bin/env node

import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { toGitBashPath } from "../plugins/harness/scripts/git-bash-path.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const harnessCommand = path.join(repoRoot, "plugins/harness/scripts/harness.mjs");
const args = process.argv.slice(2);
const requireWindows = args.includes("--require-windows");

if (args.some((argument) => argument !== "--require-windows")) {
  console.error("Usage: node scripts/check-windows-init.mjs [--require-windows]");
  process.exit(2);
}

let passed = 0;
let failed = 0;

function check(name, run) {
  try {
    run();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

function sha(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

const root = fs.mkdtempSync(path.join(os.tmpdir(), "Agentic Harness Windows 日本語 ; $(literal) "));
try {
  console.log(`OS=${process.platform} arch=${process.arch} node=${process.version}`);

  check("runner requirement", () => {
    if (requireWindows) assert.equal(process.platform, "win32", "Windowsネイティブrunnerではありません");
  });

  check("Windows paths cross the Git Bash boundary without shell evaluation", () => {
    assert.equal(
      toGitBashPath("C:\\Users\\Taisei\\Agentic Harness 日本語", "win32"),
      "/c/Users/Taisei/Agentic Harness 日本語",
    );
    assert.equal(
      toGitBashPath("d:/Work/repo; $(touch NOT_EVALUATED)", "win32"),
      "/d/Work/repo; $(touch NOT_EVALUATED)",
    );
    assert.equal(
      toGitBashPath("\\\\server\\共有\\Harness folder", "win32"),
      "//server/共有/Harness folder",
    );
    assert.equal(toGitBashPath("\\\\?\\C:\\long path\\repo", "win32"), "/c/long path/repo");
    assert.equal(
      toGitBashPath("\\\\?\\UNC\\server\\共有\\repo", "win32"),
      "//server/共有/repo",
    );
    assert.equal(toGitBashPath("/tmp/unchanged", "darwin"), "/tmp/unchanged");
    assert.throws(() => toGitBashPath("relative\\repo", "win32"), /absolute Windows drive or UNC/);
    assert.throws(() => toGitBashPath("\\\\.\\PIPE\\danger", "win32"), /device path/);
    assert.throws(() => toGitBashPath("\\\\?\\GLOBALROOT\\danger", "win32"), /device path/);
  });

  check("git repository setup", () => {
    const result = spawnSync("git", ["init", "-q"], { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr || result.error?.message);
  });

  let firstDigests;
  check("init accepts a writable path with spaces, Japanese text, and shell metacharacters", () => {
    fs.writeFileSync(path.join(root, "OWNER.md"), "owner content\n");
    const result = spawnSync(process.execPath, [harnessCommand, "init", "--root", root], {
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr || result.error?.message);
    assert.match(result.stdout, /Initialization complete/);
    assert.equal(fs.readFileSync(path.join(root, "OWNER.md"), "utf8"), "owner content\n");
    for (const relative of [
      "AGENTS.md",
      "CLAUDE.md",
      ".harness/config.toml",
      ".harness/.gitignore",
      "docs/sprints/state.md",
    ]) {
      assert.equal(fs.statSync(path.join(root, relative)).isFile(), true, relative);
    }
    firstDigests = Object.fromEntries([
      "AGENTS.md",
      "CLAUDE.md",
      ".harness/config.toml",
      ".harness/.gitignore",
      "docs/sprints/state.md",
      "OWNER.md",
    ].map((relative) => [relative, sha(path.join(root, relative))]));
  });

  check("check reports ready without writing", () => {
    const before = fs.readdirSync(root, { recursive: true }).sort();
    const result = spawnSync(process.execPath, [harnessCommand, "check", "--root", root], {
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr || result.error?.message);
    assert.match(result.stdout, /Harness check: ready/);
    assert.deepEqual(fs.readdirSync(root, { recursive: true }).sort(), before);
  });

  check("second init is idempotent", () => {
    const result = spawnSync(process.execPath, [harnessCommand, "init", "--root", root], {
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr || result.error?.message);
    for (const [relative, digest] of Object.entries(firstDigests)) {
      assert.equal(sha(path.join(root, relative)), digest, `${relative} changed`);
    }
    for (const relative of ["package.json", "package-lock.json", "node_modules"]) {
      assert.equal(fs.existsSync(path.join(root, relative)), false, `${relative} was created`);
    }
  });
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

console.log(`WINDOWS_INIT_PASS=${passed} FAIL=${failed} OS=${process.platform}`);
process.exitCode = failed === 0 ? 0 : 1;
