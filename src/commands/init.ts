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
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

const HOOK_ID = "claude-memex-knowledge-update";

const HOOK_COMMAND =
  "node -e \"console.log('[knowledge-update] " + HOOK_ID +
  ": consider updating .claude/knowledge/ if this change introduces a decision, pattern, or gotcha.')\"";

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

  mergeHook();

  console.log("Initialized claude-memex:");
  console.log("  .claude/knowledge/       scaffolded");
  console.log("  .claude/skills/knowledge-update/  installed");
  console.log("  .claude/settings.json    post-edit hook registered");
  console.log("");
  console.log("Next:");
  console.log("  1. git add .claude/ && commit");
  console.log("  2. Edit .claude/knowledge/INDEX.md to taste");
  console.log('  3. Try: claude-memex add decisions "your first decision"');
}

function mergeHook(): void {
  const p = settingsPath();
  const existing = readJson<Settings>(p) ?? {};
  existing.hooks ??= {};
  existing.hooks.PostToolUse ??= [];

  const already = existing.hooks.PostToolUse.some((h) =>
    JSON.stringify(h).includes(HOOK_ID)
  );
  if (already) return;

  const entry: HookEntry = {
    matcher: "Edit|Write|MultiEdit",
    hooks: [{ type: "command", command: HOOK_COMMAND }],
  };
  existing.hooks.PostToolUse.push(entry);

  writeJson(p, existing);
}
