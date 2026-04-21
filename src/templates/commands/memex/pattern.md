---
description: Record a reusable code pattern in .claude/knowledge/patterns.md
---

The user wants to record a pattern: $ARGUMENTS

## Step 1 — Verify the pattern is real

A pattern worth recording appears in **3 or more places**. Use Grep to confirm (search for distinctive substrings from the shape).

If fewer than 3 occurrences exist, tell the user: *"Only found N occurrences. Patterns codify *repeated* shapes — premature patterns are worse than no pattern. Record anyway?"* Only proceed if the user says yes.

## Step 2 — Read existing patterns

Read `.claude/knowledge/patterns.md` to check for overlap with existing entries. If this extends an existing pattern, update that entry instead of creating a new one.

## Step 3 — Draft the entry

Compute today's date (YYYY-MM-DD) and a kebab-case slug. Draft:

    ## <short title>

    - **Added:** <YYYY-MM-DD>
    - **ID:** <slug>
    - **Where used:** `<path/a.ts>`, `<path/b.ts>`, `<path/c.ts>`
    - **Shape:** <short description of the repeating structure — a sentence or two, not a paragraph>
    - **When to use:** <the trigger that tells you this is the right shape>
    - **When NOT to use:** <anti-pattern signals — when a different approach is better>

## Step 4 — Persist

Append to `.claude/knowledge/patterns.md`, update `.claude/knowledge/INDEX.md` if it enumerates patterns, and read back to confirm.

## Step 5 — Confirm to the user

Tell the user: *"Recorded pattern: `<title>` in `.claude/knowledge/patterns.md` (seen in N places)."*

## Rules

- Confirm 3+ occurrences before recording.
- Name the pattern with a short, memorable title (something you'd say aloud in a code review).
- Document when NOT to use it — this is what separates a pattern from an anti-pattern.
- Never save to auto-memory.
