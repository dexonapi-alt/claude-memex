const { describe, test, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { runCli, git, makeTempRepo, makeInitedRepo, cleanup } = require("./helpers");

describe("init --auto", () => {
  const dirs = [];
  after(() => dirs.forEach(cleanup));

  test("default init does NOT register a Stop hook", () => {
    const dir = makeTempRepo();
    dirs.push(dir);
    runCli(["init"], dir);
    const s = JSON.parse(
      fs.readFileSync(path.join(dir, ".claude/settings.json"), "utf8")
    );
    assert.ok(
      !s.hooks.Stop || s.hooks.Stop.length === 0,
      "default init should not register a Stop hook"
    );
  });

  test("init --auto registers a Stop hook that runs draft --working --auto", () => {
    const dir = makeTempRepo();
    dirs.push(dir);
    const r = runCli(["init", "--auto"], dir);
    assert.equal(r.exitCode, 0, r.stderr);
    assert.match(r.stdout, /Stop\s+\(auto-draft on every response\)/);

    const s = JSON.parse(
      fs.readFileSync(path.join(dir, ".claude/settings.json"), "utf8")
    );
    assert.ok(Array.isArray(s.hooks.Stop));
    assert.equal(s.hooks.Stop.length, 1);
    const cmd = s.hooks.Stop[0].hooks[0].command;
    assert.match(cmd, /memex-md draft --working --auto/);
  });

  test("init --auto is idempotent — rerunning does not duplicate the Stop hook", () => {
    const dir = makeTempRepo();
    dirs.push(dir);
    runCli(["init", "--auto"], dir);
    runCli(["init", "--auto", "--force"], dir);
    const s = JSON.parse(
      fs.readFileSync(path.join(dir, ".claude/settings.json"), "utf8")
    );
    assert.equal(s.hooks.Stop.length, 1);
  });
});

describe("draft --auto", () => {
  const dirs = [];
  after(() => dirs.forEach(cleanup));

  test("empty diff is a silent no-op (exit 0, no stdout/stderr)", () => {
    const dir = makeInitedRepo();
    dirs.push(dir);
    git(["add", "."], dir);
    git(["commit", "-q", "-m", "scaffold"], dir);

    // No working diff → should exit 0 with no output
    const r = runCli(["draft", "--working", "--auto"], dir);
    assert.equal(r.exitCode, 0);
    assert.equal(r.stdout.trim(), "");
    assert.equal(r.stderr.trim(), "");
  });

  test("missing claude binary in --auto is silent, exits 0 (does not break Stop hook)", () => {
    const dir = makeInitedRepo();
    dirs.push(dir);
    // Commit a tracked file, then modify it so `git diff HEAD` produces output.
    const p = path.join(dir, "foo.js");
    fs.writeFileSync(p, "export const x = 1;");
    git(["add", "."], dir);
    git(["commit", "-q", "-m", "scaffold"], dir);
    fs.writeFileSync(p, "export const x = 2;");

    const r = runCli(["draft", "--working", "--auto"], dir, {
      CLAUDE_MEMEX_CLAUDE_BIN: "/nonexistent/claude",
    });
    // --auto → never exits non-zero even when claude is missing
    assert.equal(r.exitCode, 0);
    // No user-visible noise
    assert.equal(r.stderr.trim(), "");
  });

  test("without --auto and no diff prints the usage hint", () => {
    const dir = makeInitedRepo();
    dirs.push(dir);
    git(["add", "."], dir);
    git(["commit", "-q", "-m", "scaffold"], dir);

    const r = runCli(["draft", "--working"], dir);
    assert.equal(r.exitCode, 0);
    assert.match(r.stdout, /No diff found/);
  });

  test("without --auto and missing claude prints a visible error with exit 1", () => {
    const dir = makeInitedRepo();
    dirs.push(dir);
    const p = path.join(dir, "foo.js");
    fs.writeFileSync(p, "export const x = 1;");
    git(["add", "."], dir);
    git(["commit", "-q", "-m", "scaffold"], dir);
    fs.writeFileSync(p, "export const x = 2;");

    const r = runCli(["draft", "--working"], dir, {
      CLAUDE_MEMEX_CLAUDE_BIN: "/nonexistent/claude",
    });
    assert.equal(r.exitCode, 1);
    assert.match(r.stderr, /Claude Code CLI not found/);
  });
});
