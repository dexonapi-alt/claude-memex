# memex-md

> **Give Claude Code a memory that lives in your repo — not your home folder.**

**English** | [Español](README.es.md) | [Português (Brasil)](README.pt-BR.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [Русский](README.ru.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)

<p align="center">
  <img src="./assets/memex-md-banner.png" alt="memex-md — your knowledge has been retained. Now Claude Code already knows it next time." />
</p>

### 🛠 Built with

[![CI](https://github.com/dexonapi-alt/memex-md/actions/workflows/ci.yml/badge.svg)](https://github.com/dexonapi-alt/memex-md/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A518-339933?style=flat-square&logo=node.js&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=flat-square&logo=npm&logoColor=white)
![Zero deps](https://img.shields.io/badge/runtime_deps-0-success?style=flat-square)
![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
<!-- ![npm version](https://img.shields.io/npm/v/memex-md?style=flat-square) — uncomment after publishing -->

---

## ✍️ What you'll actually type

memex-md is **four slash commands** inside Claude Code. That's the whole daily interface.

memex-md is **eight slash commands** inside Claude Code, split into capture (what you learned) and plans (what you're about to do).

**Capture**

| You type | memex-md does |
|---|---|
| `/memex:preference "we use Conventional Commits"` | Saves it to `CLAUDE.md` so every future Claude session loads it. |
| `/memex:fix "users logged out after 15 min"` | Reads your git diff, drafts a `gotchas.md` entry (symptom / root cause / fix / prevention). |
| `/memex:decide "chose React Query over SWR"` | Writes a decision to `decisions.md` with context / why / trade-offs. |
| `/memex:pattern "server-component fetch with Suspense"` | Grep-confirms 3+ uses, writes to `patterns.md` with where used / when NOT to use. |
| `/memex:arch "Redis cache layer between API and Postgres"` | Writes to `architecture.md` with shape (diagram) / boundary. |
| `/memex:term "POS: the in-store checkout flow"` | Writes to `glossary.md` (deduplicates, alphabetises). |

**Plans**

| You type | memex-md does |
|---|---|
| `/memex:plan "add rate limiting to /api/auth/*"` | Reads your knowledge base, scans the repo, writes a full design plan to `.claude/plans/<date>-<slug>.md`. |
| `/memex:apply-plan <slug>` | Executes that plan step-by-step, captures new learnings into the KB, then `git mv`s the plan to `.claude/plans/applied/`. |

### Why slash commands instead of asking Claude normally?

Because *normally* is the problem. *Normally* Claude saves the fix to its local auto-memory that no teammate ever sees. *Normally* you re-explain the project every Monday. *Normally* the plan lives in your head and dies with the branch.

`/memex:` is a **contract**: everything under this namespace lands in git, is reviewable in PRs, is shared with teammates, and is re-read by Claude at the start of every session.

Four keystrokes of discipline instead of 400 words of reminders — and the discipline is enforced by the tool, not by you remembering.

## 🤔 The problem it solves

Every time you start a new Claude Code session, Claude forgets most of what it learned before. You end up re-explaining the same things:

- ❌ *"We use SQLite locally because Postgres was too heavy on dev laptops."*
- ❌ *"Don't touch `auth/legacy.ts` — it's still used by the mobile app."*
- ❌ *"Last time you fixed this bug, the root cause was the cache, not the API."*

Claude **does** have a memory feature — but it's stored in your home folder (`~/.claude/...`). It doesn't travel with the repo. Teammates, other machines, and CI all start cold.

## ✨ What memex-md installs

One command sets up a complete knowledge layer inside your repo:

```bash
npx memex-md init
```

That creates:

```
.claude/
  knowledge/                       ← team-shared institutional memory
    INDEX.md
    architecture.md     ← what the project looks like
    decisions.md        ← why we chose X over Y
    patterns.md         ← code patterns we reuse
    gotchas.md          ← footguns, past bugs
    glossary.md         ← our jargon
  plans/                           ← design artifacts before implementation
    INDEX.md
  commands/memex/                  ← the 4 slash commands above
    preference.md
    fix.md
    plan.md
    apply-plan.md
  skills/knowledge-update/         ← tells Claude when to update the KB
  hooks/pre-commit                 ← gentle reminder on sensitive file changes
  settings.json                    ← PostToolUse + SessionStart hooks
CLAUDE.md                          ← bootstrapped so Claude auto-loads the KB
.github/PULL_REQUEST_TEMPLATE.md   ← PR checklist for knowledge updates
```

Commit it. Claude reads the whole thing at every session start.

## 🚀 Quick start

```bash
# In any repo where you use Claude Code:
npm install --save-dev memex-md
npx memex-md init

# Commit the new files
git add .claude/ .github/ CLAUDE.md
git commit -m "Add memex-md"
```

**Restart Claude Code** so slash commands load. Type `/memex:` — autocomplete shows all four commands. That's it. You're done with setup; everything else happens through slash commands during normal work.

Your first real use might look like:

```
You:  /memex:preference "we use Conventional Commits"
You:  /memex:plan "migrate auth from JWT to session cookies"
      (review the plan file Claude wrote to .claude/plans/)
You:  /memex:apply-plan migrate-auth-from-jwt-to-session-cookies
```

## 📅 An example day with memex-md

Monday morning, you open a repo you haven't touched in a month.

**Without memex-md:** You spend 15 minutes re-explaining the architecture to Claude. It doesn't remember the SQLite decision, so it suggests Postgres. You mention the auth rewrite that never merged — Claude needs the full backstory. By the time you're actually coding, it's 10 AM.

**With memex-md:** Claude loaded `.claude/knowledge/` at session start. It already knows the SQLite call, the auth rewrite, and the repo's testing patterns. You're coding by 9:05.

You fix a bug: users get logged out after 15 minutes. The root cause turned out to be a Redis TTL mismatch, not the auth logic you first suspected.

```
You:  /memex:fix "users logged out after 15 min"
```

Claude reads your diff, drafts a gotcha with symptom / root cause / fix / prevention, saves it to `.claude/knowledge/gotchas.md`. Next time anyone on the team (or you, three months from now) hits *"users logged out after X minutes"*, that's the first thing they find.

Later you pick up a bigger task: rate limiting.

```
You:  /memex:plan "add rate limiting to /api/auth/* endpoints"
```

Claude reads your knowledge base, greps for the existing auth middleware, and writes `.claude/plans/2026-04-20-add-rate-limiting.md`:

- Affected files (middleware + four route handlers)
- Dependencies (needs `express-rate-limit`)
- Migrations (none)
- Risks (affects login — test with real load)
- Implementation order (5 steps)

You review the plan, tweak step 3, commit the plan file.

```
You:  /memex:apply-plan 2026-04-20-add-rate-limiting
```

Claude walks the steps. After step 3 it hits a quirk: the existing auth middleware sets `user.id` only *after* the JWT is validated, which is *after* the rate limiter runs. That's worth recording. On completion, the plan's `Status:` is flipped to `implemented (2026-04-20)` and there's a new entry in `gotchas.md` about the JWT timing.

You `git diff`, review both code changes and KB entries, commit, push. Your teammate clones tomorrow and picks up with the same context — same decisions, same patterns, same gotchas. No catch-up meeting.

## 🧰 Under the hood — the CLI

The slash commands cover the daily interface. The `memex-md` CLI backs them and exposes a few extra power-user tools for scripting, CI, and one-off maintenance.

**Setup**

| Command | What it does |
|---|---|
| `memex-md init [--auto] [--force]` | Set up `.claude/` + `CLAUDE.md` + `.github/PULL_REQUEST_TEMPLATE.md`. `--auto` also registers a `Stop` hook for auto-drafting after each Claude response. `--force` refreshes templates over an existing install. |

**Authored entries**

| Command | What it does |
|---|---|
| `memex-md preference "<text>"` | Append a project-level preference to CLAUDE.md's `## Preferences`. Powers `/memex:preference`. |
| `memex-md add <scope> "<title>"` | Create an entry skeleton in a scope file (manual fill-in). |

**Query & audit**

| Command | What it does |
|---|---|
| `memex-md list [scope]` | Show entries per scope. |
| `memex-md search <query>` | Grep across all knowledge files. |
| `memex-md ask [--scope <s,s>] "<question>"` | Ask Claude a question answered strictly from the knowledge base, with source citations. |
| `memex-md graph [--mermaid]` | Show supersedes / related relationships. ASCII tree or Mermaid diagram. |
| `memex-md validate` | Structural check of the knowledge base. |
| `memex-md stale [--days N] [--brief]` | List entries older than N days (default 180). Powers the `SessionStart` hook. |
| `memex-md prune [--days N]` | Alias of `stale`. |

**Claude-driven capture**

| Command | What it does |
|---|---|
| `memex-md draft [--staged\|--working\|--commit <sha>] [--write] [--auto]` | Ask Claude to propose knowledge entries from a git diff. `--write` applies them; `--auto` is the non-fatal mode used by the `Stop` hook. |
| `memex-md promote [--list\|--dry-run\|--all]` | Migrate repo-level facts already captured in Claude's machine memory into `.claude/knowledge/`. |

**CI / enforcement**

| Command | What it does |
|---|---|
| `memex-md check [--base <ref>\|--staged] [--patterns <glob,glob>] [--strict]` | Fail if sensitive files changed without a knowledge update. Use in GitHub Actions or as a pre-commit hook. |

## 🤖 Automation, explained

Memory that relies on discipline is memory that decays. `memex-md` closes the gap four different ways — so you never have to remember to maintain it:

### `draft` — propose entries from a diff
```bash
# From your last commit
npx memex-md draft

# From staged changes, and write the proposed entries into the files
npx memex-md draft --staged --write
```
Reads the diff, asks Claude to identify anything worth recording (new decisions, patterns, gotchas), and either prints the proposals or appends them directly to the right scope file. Turns *"I should remember this"* into a one-command reflex.

### `ask` — semantic search without embeddings
```bash
npx memex-md ask "why did we pick SQLite locally?"

# For larger knowledge bases, narrow to specific scopes:
npx memex-md ask --scope decisions,gotchas "why did we pick SQLite locally?"
```
Loads every `.md` in `.claude/knowledge/` (or only the scopes you name) and asks Claude — scoped strictly to the knowledge base, with source citations. No vector DB, no index to maintain. Claude does the semantic matching.

`--scope` is how the tool scales: when your knowledge base grows past a few hundred entries, load only the scopes a question actually needs.

### SessionStart hook — stale-check on every session
Registered automatically by `init`. On every Claude Code session start, prints one line flagging entries older than 180 days:
```
[memex-md] 3 knowledge entries older than 180 days — review for staleness: decisions.md:"Chose SQLite...", gotchas.md:"..."
```
Quiet when nothing is stale. Gives you a nudge, not a wall of text.

### `check` — CI-style validation
```bash
# In GitHub Actions or pre-push hook:
npx memex-md check --base origin/main...HEAD --strict

# Or against staged changes (for pre-commit use):
npx memex-md check --staged
```
Fails the check when someone lands a migration / auth / schema / config change without updating the knowledge base. Pattern list is overridable via `--patterns`. Exits `1` when `--strict` is set or when `CI=true`.

### Stop hook — auto-draft after every Claude response (opt-in via `--auto`)

Run `memex-md init --auto` (or `--auto --force` on an existing install) to register a `Stop` hook in `.claude/settings.json`. At the end of every Claude response, the hook runs `memex-md draft --working --auto`, which:

1. Reads the uncommitted working diff (silently — no noise if empty).
2. Asks Claude (`claude -p`) whether any knowledge entries are warranted.
3. If Claude returns `NO_ENTRIES_NEEDED`: silent no-op.
4. If Claude proposes entries: writes them to `.claude/knowledge/<scope>.md` and prints one stderr line: *"wrote N entries — review with `git diff .claude/knowledge/`"*.
5. **Never aborts the hook chain**: missing `claude` binary, git errors, timeouts all degrade to silent returns so the Claude Code session loop is never broken.

You review entries via `git diff .claude/knowledge/` and `git commit` (accept) or `git checkout --` (discard). Turn off by removing the `Stop` entry from `.claude/settings.json`.

### Pre-commit hook + PR template (installed by `init`)
`init` also scaffolds:

- `.claude/hooks/pre-commit` — a tiny shell script that runs `check --staged` and prints a reminder when sensitive files change without a knowledge update. **Does not block commits** — enforcement belongs in CI. Activate per clone:
  ```bash
  git config core.hooksPath .claude/hooks
  ```
- `.github/PULL_REQUEST_TEMPLATE.md` — a checklist prompting contributors to record decisions / patterns / gotchas introduced by the PR (or explicitly mark N/A). GitHub auto-applies it to new PRs.

Both are regular files in your repo — review and customise them like any other template.

### `graph` — supersedes & related links between entries
Entries can reference each other with two optional bullets:

```md
## Moved to Postgres for local dev

- **Added:** 2026-07-15
- **Supersedes:** `chose-sqlite-over-postgres-for-local-dev`
- **Related:** `dev-environment-parity`
- Migration scripts require Postgres features. Local SQLite is no longer worth
  the parity gap.
```

`memex-md graph` walks those links and prints an ASCII view of the chains — who supersedes whom, who relates to whom, and any dangling references (ids that don't resolve). Pass `--mermaid` to emit a `graph TD` block you can paste into a GitHub Markdown comment and have it render.

This gives you a lightweight intelligence layer without pulling in a graph DB: plain Markdown conventions, walked at query time.

## 🧭 The `/memex:` contract (how slash commands stay reliable)

The four commands at the top of this README are more than shortcuts. They enforce three guarantees the tool cannot deliver any other way:

### 1. Everything under `/memex:` lands in git
Claude's default auto-memory (`~/.claude/...`) is per-user, per-machine, per-OS-install. Your teammate, your other laptop, and CI all start cold. Every `/memex:*` command writes to a file inside the repo (`CLAUDE.md`, `.claude/knowledge/*`, `.claude/plans/*`) — so the knowledge ships with the code.

### 2. Claude re-reads fresh state after every command
memex-md's `CLAUDE.md` block includes an explicit *re-read rule*: after any `/memex:*` slash command or `memex-md` CLI invocation, the disk state has changed, and Claude must re-read the affected `INDEX.md` + scope/plan file before its next substantive response. **The disk is the source of truth** — not what Claude remembers writing a moment ago.

### 3. Durability for teams
Slash command templates live at `.claude/commands/memex/*.md` in your repo. Every teammate who clones gets the same four commands on their first Claude Code session. No shared config server, no per-user setup, no "did you install the extension?" — it's code, not configuration.

### The routing rule
memex-md's `CLAUDE.md` block also instructs Claude: **if the preference is about the user (shell habit, editor, timezone), it goes to auto-memory; if it's about the project (convention, decision, pattern, gotcha, domain term), it goes in git via memex-md.** The `/memex:preference` command applies this rule automatically. If you invoke it with a clearly-personal preference, Claude will flag it and offer to save to auto-memory instead.

## 🗂 Scopes

Each scope is one Markdown file. You don't need all of them — use whichever fits what you just learned.

| Scope | Use it when... |
|---|---|
| 🏗 **architecture** | You added or changed a service, module, or data flow |
| 🎯 **decisions** | You picked X over Y for a non-obvious reason |
| 🔁 **patterns** | You noticed the same shape of code 3+ times |
| ⚠️ **gotchas** | You fixed a bug with a weird root cause |
| 📖 **glossary** | You used a term only your team would know |

<!-- 📸 SCREENSHOT: the .claude/ folder open in an editor -->

## 🧠 Why this exists (the longer version)

Claude Code already has three ways to remember things. Each one has a real limitation:

| Memory type | Where it lives | What it loses |
|---|---|---|
| 💬 **Chat history** (`claude --continue`) | `~/.claude/projects/<slug>/` | It's just your past conversation. Old details fade as new messages push them out of context. |
| 🧩 **Auto-memory** | `~/.claude/projects/<slug>/memory/` | Lives on **one machine**. Teammates, CI, and your other laptop start with nothing. Not reviewable in PRs. |
| 📄 **`CLAUDE.md`** | In your repo | Travels with the code ✅ — but it's a single file built for stable rules, not a growing archive of dozens of decisions, patterns, and gotchas. |

`memex-md` fills the gap: an **in-repo**, **scoped**, **self-updating** knowledge base. Git-tracked. PR-reviewable. The same on every machine.

### What actually changes

| Before | After |
|---|---|
| *"Why don't we use Postgres locally?"* | It's in `decisions.md`. Claude already knows. |
| The same tricky bug gets fixed twice | It's in `gotchas.md` with the root cause. |
| New teammate takes a week to ramp up | They `git clone`; Claude already knows the conventions. |
| Your second laptop feels like a stranger | The repo is the source of truth, on every machine. |
| After a big refactor, Claude slowly re-learns the shape | `architecture.md` was updated *during* the refactor. |

### Why this makes Claude Code faster

- **Less re-exploration.** Claude spends fewer tool calls re-reading files it already learned.
- **Smaller effective context.** A focused 200-line `architecture.md` beats 4,000 lines of stale chat history.
- **Survives forgetting.** Files on disk are loaded fresh every session — they don't get compacted away.
- **Reviewable.** Bad entries get caught in PR review, not after they derail a future session.

## 🛑 When *not* to use this

- You're writing a throwaway script or a one-off spike — `CLAUDE.md` alone is enough.
- Your whole codebase fits comfortably in Claude's context every time.
- You don't use Claude Code across multiple sessions or machines.

Otherwise: this probably pays for itself within the first week.

## 📦 Requirements

- **Node.js** 18 or newer
- **Claude Code** — [install it here](https://claude.com/claude-code)
- `draft` and `ask` require the `claude` CLI on your `PATH` (or set `CLAUDE_MEMEX_CLAUDE_BIN`)
- `check` requires `git` and is intended to run inside a git repo (including CI)

## 🤝 Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, PR guidelines, translation workflow, and how to report bugs. Participation in this project is governed by our [Code of Conduct](CODE_OF_CONDUCT.md).

TL;DR:

1. Keep each PR focused on one feature or fix.
2. Run `npm run build` before pushing.
3. If your change introduces a new pattern or decision, add an entry to your own `.claude/knowledge/` — we eat our own dogfood.

## 📄 License

MIT — see [LICENSE](LICENSE).

---

<sub>Named after the **memex** — Vannevar Bush's 1945 idea of a personal device that would store all your books, records, and communications so they could be instantly recalled. This is your project's memex.</sub>
