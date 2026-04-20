import * as fs from "node:fs";
import * as path from "node:path";
import {
  claudeDir,
  knowledgeDir,
  settingsPath,
  skillDir,
  templatesRoot,
} from "../lib/paths";
import { copyDir, readJson, writeJson } from "../lib/fs-utils";

interface HookEntry {
  matcher?: string;
  hooks: Array<{ type: string; command: string }>;
}

interface Settings {
  hooks?: {
    PostToolUse?: HookEntry[];
    SessionStart?: HookEntry[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

const POST_EDIT_HOOK_ID = "claude-memex-knowledge-update";

const POST_EDIT_COMMAND =
  "node -e \"console.log('[knowledge-update] " +
  POST_EDIT_HOOK_ID +
  ": consider updating .claude/knowledge/ if this change introduces a decision, pattern, or gotcha.')\"";

const SESSION_START_COMMAND = "npx --no-install claude-memex stale --brief";

export async function init(args: string[]): Promise<void> {
  const force = args.includes("--force");

  fs.mkdirSync(claudeDir(), { recursive: true });

  if (fs.existsSync(knowledgeDir()) && !force) {
    console.error(
      ".claude/knowledge/ already exists. Use --force to overwrite template files (existing content is preserved only for files not in templates)."
    );
    process.exit(1);
  }

  const templates = templatesRoot();
  if (!fs.existsSync(templates)) {
    console.error(
      "Template files missing from package install. Reinstall claude-memex."
    );
    process.exit(1);
  }

  copyDir(path.join(templates, "knowledge"), knowledgeDir());
  copyDir(path.join(templates, "skills", "knowledge-update"), skillDir());

  mergeHooks();

  console.log("Initialized claude-memex:");
  console.log("  .claude/knowledge/                scaffolded");
  console.log("  .claude/skills/knowledge-update/  installed");
  console.log("  .claude/settings.json             hooks registered:");
  console.log("    - PostToolUse  (knowledge-update reminder)");
  console.log("    - SessionStart (stale-entry flag)");
  console.log("");
  console.log("Next:");
  console.log("  1. git add .claude/ && commit");
  console.log("  2. Edit .claude/knowledge/INDEX.md to taste");
  console.log('  3. Try: claude-memex add decisions "your first decision"');
}

function mergeHooks(): void {
  const p = settingsPath();
  const existing = readJson<Settings>(p) ?? {};
  existing.hooks ??= {};

  // PostToolUse — knowledge-update reminder after edits
  existing.hooks.PostToolUse ??= [];
  if (
    !existing.hooks.PostToolUse.some((h) =>
      JSON.stringify(h).includes(POST_EDIT_HOOK_ID)
    )
  ) {
    existing.hooks.PostToolUse.push({
      matcher: "Edit|Write|MultiEdit",
      hooks: [{ type: "command", command: POST_EDIT_COMMAND }],
    });
  }

  // SessionStart — flag stale entries at session start
  existing.hooks.SessionStart ??= [];
  if (
    !existing.hooks.SessionStart.some((h) =>
      JSON.stringify(h).includes("claude-memex stale")
    )
  ) {
    existing.hooks.SessionStart.push({
      hooks: [{ type: "command", command: SESSION_START_COMMAND }],
    });
  }

  writeJson(p, existing);
}
