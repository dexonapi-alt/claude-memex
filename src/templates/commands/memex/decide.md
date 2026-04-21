---
description: Record a non-obvious decision in .claude/knowledge/decisions.md
---

The user wants to record a decision: $ARGUMENTS

## Step 1 — Read existing decisions

Read `.claude/knowledge/decisions.md` to see what's already captured and to avoid duplicates. If this decision supersedes an earlier one, note the old entry's ID — you'll cite it in Step 2.

## Step 2 — Draft the entry

If `$ARGUMENTS` is a thin phrase (e.g. just a title), ASK the user for context and trade-offs before drafting. Do not invent them.

Compute today's date (YYYY-MM-DD) and a kebab-case slug from a short title. Draft:

    ## <short title>

    - **Added:** <YYYY-MM-DD>
    - **ID:** <slug>
    - **Status:** accepted
    - **Context:** <what forced the choice>
    - **Decision:** <what we picked>
    - **Why:** <the rationale — this is the load-bearing part>
    - **Trade-offs:** <what we lose>
    - **Supersedes:** `<old-entry-id>` (only if overturning a prior decision)
    - **Related:** `<entry-id>, <entry-id>` (optional cross-references)

## Step 3 — Persist

Append the block to `.claude/knowledge/decisions.md` using your Edit tool.

If `.claude/knowledge/INDEX.md` enumerates decisions, add a line referencing the new entry.

## Step 4 — Verify + confirm

Read back `.claude/knowledge/decisions.md` so the fresh state is in your context. Tell the user: *"Recorded decision: `<title>` in `.claude/knowledge/decisions.md`."*

## Rules

- ALWAYS a repo-level entry. Never save to auto-memory.
- If the user's input is thin, ask clarifying questions rather than inventing details.
- Keep entries short — 6-10 lines is plenty. Long paragraphs belong elsewhere.
- If superseding, cite the ID explicitly so `memex-md graph` can render the chain.
