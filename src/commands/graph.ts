import * as fs from "node:fs";
import * as path from "node:path";
import { knowledgeDir, requireKnowledgeBase } from "../lib/paths";
import { slugify } from "../lib/fs-utils";

interface Entry {
  scope: string;
  id: string;
  title: string;
  added?: string;
  supersedes: string[];
  related: string[];
}

function parseIds(line: string): string[] {
  return line
    .replace(/`/g, "")
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseEntries(): Entry[] {
  const dir = knowledgeDir();
  const out: Entry[] = [];

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".md") || file === "INDEX.md") continue;
    const scope = file.replace(/\.md$/, "");
    const content = fs.readFileSync(path.join(dir, file), "utf8");
    const blocks = content.split(/^## /m).slice(1);

    for (const block of blocks) {
      const firstLine = block.split("\n", 1)[0].trim();
      const idMatch = block.match(/\*\*ID:\*\*\s*(\S+)/);
      const addedMatch = block.match(/\*\*Added:\*\*\s*(\d{4}-\d{2}-\d{2})/);
      const supersedesMatch = block.match(/\*\*Supersedes:\*\*\s*(.+)/i);
      const relatedMatch = block.match(/\*\*Related:\*\*\s*(.+)/i);

      out.push({
        scope,
        id: idMatch ? idMatch[1] : slugify(firstLine),
        title: firstLine,
        added: addedMatch?.[1],
        supersedes: supersedesMatch ? parseIds(supersedesMatch[1]) : [],
        related: relatedMatch ? parseIds(relatedMatch[1]) : [],
      });
    }
  }
  return out;
}

function groupByScope(entries: Entry[]): Record<string, Entry[]> {
  const out: Record<string, Entry[]> = {};
  for (const e of entries) {
    out[e.scope] ??= [];
    out[e.scope].push(e);
  }
  return out;
}

function printAscii(entries: Entry[]): void {
  const byId = new Map(entries.map((e) => [e.id, e] as const));
  const supersededBy = new Map<string, Entry[]>();
  for (const e of entries) {
    for (const oldId of e.supersedes) {
      const arr = supersededBy.get(oldId) ?? [];
      arr.push(e);
      supersededBy.set(oldId, arr);
    }
  }

  const grouped = groupByScope(entries);
  const scopes = Object.keys(grouped).sort();

  for (const scope of scopes) {
    const rows = grouped[scope];
    console.log(`\n${scope}.md`);
    for (const e of rows) {
      const age = e.added ? `  [${e.added}]` : "";
      console.log(`  [${e.id}]${age}  ${e.title}`);

      const supers = supersededBy.get(e.id) ?? [];
      for (const s of supers) {
        console.log(`    ↓ superseded by [${s.id}] in ${s.scope}.md`);
      }
      if (e.supersedes.length > 0) {
        for (const oldId of e.supersedes) {
          const target = byId.get(oldId);
          const note = target ? `"${target.title}"` : "(not found)";
          console.log(`    ↑ supersedes [${oldId}] ${note}`);
        }
      }
      if (e.related.length > 0) {
        console.log(`    ~ related: ${e.related.join(", ")}`);
      }
    }
  }

  const dangling: Array<{ entry: Entry; missing: string[] }> = [];
  for (const e of entries) {
    const missing = [...e.supersedes, ...e.related].filter(
      (id) => !byId.has(id)
    );
    if (missing.length > 0) dangling.push({ entry: e, missing });
  }
  if (dangling.length > 0) {
    console.log("\nDangling references (target id not found):");
    for (const d of dangling) {
      console.log(
        `  ${d.entry.scope}.md:[${d.entry.id}] -> ${d.missing.join(", ")}`
      );
    }
  }
}

function printMermaid(entries: Entry[]): void {
  const byId = new Map(entries.map((e) => [e.id, e] as const));
  console.log("```mermaid");
  console.log("graph TD");
  for (const e of entries) {
    const label = `${e.id}["${e.title.replace(/"/g, "'")}"]`;
    console.log(`  ${label}`);
    for (const oldId of e.supersedes) {
      if (byId.has(oldId)) console.log(`  ${oldId} --> ${e.id}`);
    }
    for (const relId of e.related) {
      if (byId.has(relId)) console.log(`  ${e.id} -.-> ${relId}`);
    }
  }
  console.log("```");
}

export async function graph(args: string[]): Promise<void> {
  requireKnowledgeBase();
  const entries = parseEntries();

  if (entries.length === 0) {
    console.log("Knowledge base is empty.");
    return;
  }

  if (args.includes("--mermaid")) {
    printMermaid(entries);
    return;
  }
  printAscii(entries);
}
