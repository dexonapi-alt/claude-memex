import * as fs from "node:fs";
import * as path from "node:path";
import {
  VALID_SCOPES,
  knowledgeDir,
  requireKnowledgeBase,
} from "../lib/paths";

export async function validate(_args: string[]): Promise<void> {
  requireKnowledgeBase();

  const problems: string[] = [];
  const dir = knowledgeDir();

  const indexPath = path.join(dir, "INDEX.md");
  if (!fs.existsSync(indexPath)) {
    problems.push("Missing INDEX.md");
  }

  for (const scope of VALID_SCOPES) {
    const f = path.join(dir, `${scope}.md`);
    if (!fs.existsSync(f)) problems.push(`Missing ${scope}.md`);
  }

  const unknown = fs
    .readdirSync(dir)
    .filter(
      (f) =>
        f.endsWith(".md") &&
        f !== "INDEX.md" &&
        !(VALID_SCOPES as readonly string[]).includes(f.replace(/\.md$/, ""))
    );
  for (const u of unknown) problems.push(`Unexpected file: ${u}`);

  if (problems.length === 0) {
    console.log("Knowledge base OK.");
    return;
  }

  console.log("Issues:");
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
