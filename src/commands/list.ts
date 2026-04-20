import * as fs from "node:fs";
import * as path from "node:path";
import {
  isScope,
  knowledgeDir,
  knowledgeFile,
  requireKnowledgeBase,
  VALID_SCOPES,
} from "../lib/paths";

export async function list(args: string[]): Promise<void> {
  requireKnowledgeBase();

  const [scope] = args;
  let files: string[];

  if (scope) {
    if (!isScope(scope)) {
      console.error(`Invalid scope: ${scope}`);
      console.error(`Valid: ${VALID_SCOPES.join(", ")}`);
      process.exit(1);
    }
    files = [knowledgeFile(scope)];
  } else {
    files = fs
      .readdirSync(knowledgeDir())
      .filter((f) => f.endsWith(".md") && f !== "INDEX.md")
      .map((f) => path.join(knowledgeDir(), f));
  }

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const name = path.basename(file);
    const content = fs.readFileSync(file, "utf8");
    const headings = content
      .split("\n")
      .filter((l) => l.startsWith("## "))
      .map((l) => l.slice(3).trim());

    console.log(`\n${name} (${headings.length} ${headings.length === 1 ? "entry" : "entries"})`);
    if (headings.length === 0) {
      console.log("  (empty)");
      continue;
    }
    for (const h of headings) console.log(`  - ${h}`);
  }
  console.log("");
}
