import * as fs from "node:fs";
import * as path from "node:path";
import { knowledgeDir, requireKnowledgeBase } from "../lib/paths";

interface Entry {
  file: string;
  title: string;
  added?: string;
}

export async function prune(args: string[]): Promise<void> {
  requireKnowledgeBase();

  const daysIdx = args.indexOf("--days");
  const days =
    daysIdx >= 0 && args[daysIdx + 1] ? Number(args[daysIdx + 1]) : 180;
  if (!Number.isFinite(days) || days <= 0) {
    console.error("--days must be a positive number");
    process.exit(1);
  }

  const cutoff = Date.now() - days * 86_400_000;
  const dir = knowledgeDir();
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "INDEX.md");

  const stale: Entry[] = [];

  for (const f of files) {
    const content = fs.readFileSync(path.join(dir, f), "utf8");
    const blocks = content.split(/^## /m).slice(1);
    for (const block of blocks) {
      const firstLine = block.split("\n", 1)[0].trim();
      const addedMatch = block.match(/\*\*Added:\*\*\s*(\d{4}-\d{2}-\d{2})/);
      if (!addedMatch) continue;
      const ts = Date.parse(addedMatch[1]);
      if (Number.isFinite(ts) && ts < cutoff) {
        stale.push({ file: f, title: firstLine, added: addedMatch[1] });
      }
    }
  }

  if (stale.length === 0) {
    console.log(`No entries older than ${days} days.`);
    return;
  }

  console.log(`Entries older than ${days} days (review for staleness):`);
  for (const s of stale) {
    console.log(`  ${s.file}  [${s.added}]  ${s.title}`);
  }
}
