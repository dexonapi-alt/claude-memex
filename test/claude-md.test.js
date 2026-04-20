const { describe, test, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { runCli, makeTempRepo, cleanup } = require("./helpers");

const START = "<!-- memex-md:start -->";
const END = "<!-- memex-md:end -->";

describe("init bootstraps CLAUDE.md", () => {
  const dirs = [];
  after(() => dirs.forEach(cleanup));

  test("creates CLAUDE.md if missing", () => {
    const dir = makeTempRepo();
    dirs.push(dir);
    const r = runCli(["init"], dir);
    assert.equal(r.exitCode, 0, r.stderr);
    assert.match(r.stdout, /CLAUDE\.md\s+created/);

    const p = path.join(dir, "CLAUDE.md");
    assert.ok(fs.existsSync(p));
    const content = fs.readFileSync(p, "utf8");
    assert.ok(content.includes(START));
    assert.ok(content.includes(END));
    assert.match(content, /Project knowledge base/);
  });

  test("appends block to existing CLAUDE.md without a block", () => {
    const dir = makeTempRepo();
    dirs.push(dir);
    const p = path.join(dir, "CLAUDE.md");
    fs.writeFileSync(p, "# My project\n\nSome existing rules.\n");

    const r = runCli(["init"], dir);
    assert.equal(r.exitCode, 0, r.stderr);
    assert.match(r.stdout, /CLAUDE\.md\s+appended block/);

    const content = fs.readFileSync(p, "utf8");
    assert.ok(content.startsWith("# My project"), "preserves existing content");
    assert.ok(content.includes(START));
    assert.ok(content.includes(END));
    assert.ok(content.includes("Some existing rules."));
  });

  test("is idempotent — second init leaves CLAUDE.md unchanged", () => {
    const dir = makeTempRepo();
    dirs.push(dir);
    runCli(["init"], dir);
    const p = path.join(dir, "CLAUDE.md");
    const first = fs.readFileSync(p, "utf8");

    const r = runCli(["init", "--force"], dir);
    assert.equal(r.exitCode, 0, r.stderr);
    assert.match(r.stdout, /CLAUDE\.md\s+(updated block|already has block)/);

    const second = fs.readFileSync(p, "utf8");
    // Block count should remain exactly 1 (no duplication)
    const startCount = (second.match(new RegExp(START, "g")) || []).length;
    const endCount = (second.match(new RegExp(END, "g")) || []).length;
    assert.equal(startCount, 1);
    assert.equal(endCount, 1);
    assert.equal(
      first.length,
      second.length,
      "--force on identical block should not change file size"
    );
  });

  test("--force updates the block in place when content drifts", () => {
    const dir = makeTempRepo();
    dirs.push(dir);
    const p = path.join(dir, "CLAUDE.md");
    // Simulate an older version of the block
    fs.writeFileSync(
      p,
      `# Project\n\n${START}\nOLD CONTENT\n${END}\n\nOther stuff.\n`
    );

    const r = runCli(["init", "--force"], dir);
    assert.equal(r.exitCode, 0, r.stderr);

    const content = fs.readFileSync(p, "utf8");
    assert.ok(!content.includes("OLD CONTENT"), "old block content is replaced");
    assert.match(content, /Project knowledge base/);
    assert.ok(content.includes("Other stuff."), "text outside block preserved");
  });
});
