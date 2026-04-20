import * as fs from "node:fs";
import * as path from "node:path";
import { runClaudePrompt } from "../lib/exec";
import { knowledgeDir, requireKnowledgeBase } from "../lib/paths";

const MAX_KB_CHARS = 120_000;

function readAllKnowledge(): string {
  const dir = knowledgeDir();
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort();
  const parts: string[] = [];
  let total = 0;
  for (const f of files) {
    const content = fs.readFileSync(path.join(dir, f), "utf8");
    const block = `\n===== ${f} =====\n${content}\n`;
    if (total + block.length > MAX_KB_CHARS) {
      parts.push(`\n[... remaining files omitted, knowledge base exceeds ${MAX_KB_CHARS} chars]`);
      break;
    }
    parts.push(block);
    total += block.length;
  }
  return parts.join("");
}

function buildPrompt(question: string, kb: string): string {
  return `You are answering a question about a software project using ONLY the knowledge base files provided below. The files live at .claude/knowledge/ and are maintained by the claude-memex tool.

Rules:
- Cite the source file and entry title when you answer, e.g. "(decisions.md: Chose SQLite over Postgres)".
- If the knowledge base does not contain the answer, say so plainly. Do not speculate or pull from general knowledge.
- Keep the answer tight. No preamble, no summary, no restating the question.

=== KNOWLEDGE BASE ===
${kb}
=== END KNOWLEDGE BASE ===

QUESTION: ${question}
`;
}

export async function ask(args: string[]): Promise<void> {
  requireKnowledgeBase();

  const question = args.join(" ").trim();
  if (!question) {
    console.error('Usage: claude-memex ask "<question>"');
    process.exit(1);
  }

  const kb = readAllKnowledge();
  if (!kb.trim()) {
    console.error("Knowledge base is empty. Add entries with `claude-memex add`.");
    process.exit(1);
  }

  const prompt = buildPrompt(question, kb);

  try {
    await runClaudePrompt(prompt);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
  console.log("");
}
