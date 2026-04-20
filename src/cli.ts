import { init } from "./commands/init";
import { add } from "./commands/add";
import { list } from "./commands/list";
import { search } from "./commands/search";
import { validate } from "./commands/validate";
import { prune } from "./commands/prune";

const VERSION = "0.1.0";

const HELP = `claude-memex ${VERSION} — in-repo knowledge base for Claude Code

Usage:
  claude-memex <command> [args]

Commands:
  init [--force]               Scaffold .claude/knowledge/ + skill + hook
  add <scope> "<title>"        Append a new entry to a scope
  list [scope]                 List entries (optionally one scope)
  search <query>               Grep across all knowledge files
  validate                     Check knowledge base integrity
  prune [--days N]             Flag entries untouched for N days (default 180)
  help                         Show this message
  version                      Print version

Scopes:
  architecture, decisions, patterns, gotchas, glossary

Examples:
  claude-memex init
  claude-memex add decisions "chose SQLite over Postgres for local dev"
  claude-memex list patterns
  claude-memex search "auth"
`;

async function main(): Promise<void> {
  const [, , command, ...rest] = process.argv;

  switch (command) {
    case "init":
      await init(rest);
      break;
    case "add":
      await add(rest);
      break;
    case "list":
      await list(rest);
      break;
    case "search":
      await search(rest);
      break;
    case "validate":
      await validate(rest);
      break;
    case "prune":
      await prune(rest);
      break;
    case "version":
    case "--version":
    case "-v":
      console.log(VERSION);
      break;
    case undefined:
    case "help":
    case "--help":
    case "-h":
      console.log(HELP);
      break;
    default:
      console.error(`Unknown command: ${command}\n`);
      console.log(HELP);
      process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
