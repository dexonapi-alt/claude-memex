# claude-memex

An in-repo, self-updating knowledge base for [Claude Code](https://claude.com/claude-code) projects.

Claude Code's auto-memory lives in your home directory (`~/.claude/projects/...`), so it does not travel with the repo. This package fills that gap: it scaffolds a `.claude/knowledge/` directory in your project, installs a `knowledge-update` skill that tells Claude when and how to update it, and wires a post-edit hook as a gentle reminder.

Result: your project's architecture, decisions, patterns, gotchas, and glossary live in git. They survive PC restarts, travel with the repo, and are reviewable in PRs.

## Why this exists

Claude Code is excellent at working inside a single session but loses most of what it learned the moment the session ends. It has three persistence mechanisms, each with a real limitation:

| Mechanism | Where it lives | What it loses |
|---|---|---|
| Session transcripts (`--continue` / `--resume`) | `~/.claude/projects/<slug>/` | Per-machine. Per-directory. Grow unbounded; old sessions drift out of cache (5-min TTL), and auto-compaction blurs early detail. |
| Auto-memory (`MEMORY.md`) | `~/.claude/projects/<slug>/memory/` | Per-machine. A new laptop, a teammate, or CI starts cold. Not reviewable in PRs. |
| `CLAUDE.md` | Repo root | Travels with the repo ✓, but it's a single file for stable rules. Not built to accumulate dozens of evolving entries across architecture / decisions / patterns / gotchas / glossary. |

The gap: **no in-repo, scoped, self-updating knowledge base.** That's what this package adds.

### The cost of the gap (what you actually feel)

Without a durable, structured, in-repo memory:

- **Session N+1 re-derives what session N already figured out.** Claude re-reads the same files, re-greps for the same patterns, and re-asks you the same questions. Tokens and wall-clock time burned on rediscovery.
- **Decisions evaporate.** You told Claude last week *why* you chose SQLite over Postgres for local dev. This week it suggests Postgres again, because that context was in the transcript that got compacted.
- **Gotchas recur.** A footgun fixed in March bites again in April because the fix-and-why never left the commit message.
- **Teammates and other machines start cold.** Auto-memory is per-user per-home-dir. Your second laptop, your teammate, and your CI job have zero of the institutional memory your main laptop accumulated.
- **Context budget leaks.** When rules live only in conversation, auto-compaction decides what to keep. When rules live in `.claude/knowledge/`, *you* decide, and they load deterministically every session.

### What changes after installing `claude-memex`

| Before | After |
|---|---|
| "Remind me again why we don't use Postgres locally?" | `decisions.md` has the ADR entry. Claude reads it at session start. |
| Same bug, same non-obvious root cause, fixed twice | `gotchas.md` captured it the first time. Claude recognizes the symptom and goes straight to the fix. |
| New teammate spends a week learning the codebase conventions | They `git clone` and Claude already knows the patterns, boundaries, and domain terms. |
| Your second machine is a stranger | The repo is the source of truth. Any Claude Code instance, on any machine, loads the same context. |
| Post-refactor, Claude slowly rediscovers the new shape | `architecture.md` is updated *during* the refactor via the `knowledge-update` skill. Next session starts informed. |

### Efficiency impact

- **Faster first-useful-output per session.** Claude doesn't spend the first N tool calls re-exploring what `.claude/knowledge/` already tells it.
- **Smaller effective context.** One well-maintained 200-line `architecture.md` beats 4,000 lines of transcript Claude has to scroll through.
- **Survives compaction and the 5-min prompt-cache TTL.** Files on disk are loaded fresh every session, intact.
- **PR-reviewable memory.** A bad entry can be caught in code review, not after it derails a future session.
- **No vendor lock-in on context.** The knowledge is plain Markdown in your repo. If you switch tools or versions, it's still readable.

### When this is overkill

- Solo throwaway scripts or one-session spikes — `CLAUDE.md` alone is fine.
- Very small repos where the whole codebase fits comfortably in context every session.
- Projects where you don't use Claude Code across multiple sessions.

If you're running long-lived projects, working across multiple machines, collaborating with teammates, or simply tired of re-explaining the same context every Monday — this pays for itself within a week.

## Install

```bash
npm install --save-dev claude-memex
npx claude-memex init
```

Or globally:

```bash
npm install -g claude-memex
claude-memex init
```

## Commands

```
claude-memex init [--force]        Scaffold .claude/knowledge/ + skill + hook
claude-memex add <scope> "<title>" Append a new entry
claude-memex list [scope]          List entries
claude-memex search <query>        Grep across knowledge files
claude-memex validate              Check integrity
claude-memex prune [--days N]      Flag entries older than N days (default 180)
claude-memex help                  Show help
claude-memex version               Print version
```

## Scopes

| Scope | What belongs here |
|---|---|
| `architecture` | System shape, services, data flow |
| `decisions` | ADR-style choices and rationale |
| `patterns` | Reusable patterns seen 3+ times |
| `gotchas` | Footguns, past incidents |
| `glossary` | Domain terms |

## What `init` creates

```
.claude/
  knowledge/
    INDEX.md
    architecture.md
    decisions.md
    patterns.md
    gotchas.md
    glossary.md
  skills/
    knowledge-update/
      SKILL.md
  settings.json          # post-edit hook merged in
```

Commit the whole `.claude/` directory. Claude Code picks it up automatically on session start.

## Why not just use CLAUDE.md?

`CLAUDE.md` is fine for stable project rules. `claude-memex` is for evolving institutional memory — many entries per scope, structured so Claude knows exactly which file to update after different kinds of work.

## Requirements

- Node 18+
- Claude Code (any recent version)

## License

MIT
