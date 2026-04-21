---
description: Record a system-shape fact in .claude/knowledge/architecture.md
---

The user wants to record an architectural note: $ARGUMENTS

## Step 1 — Understand the shape

Read `.claude/knowledge/architecture.md` to see what's already documented.

If the note describes a new service / module / data flow, use Glob or Grep to verify the files/modules exist and understand the boundary before drafting.

## Step 2 — Draft the entry

**Prefer a diagram-as-text (ASCII or Mermaid) + 3 bullets over paragraphs.** Long prose is where architecture docs go to die.

Compute today's date (YYYY-MM-DD) and a kebab-case slug. Draft:

    ## <short title>

    - **Added:** <YYYY-MM-DD>
    - **ID:** <slug>
    - **Where:** `<file paths / module boundaries>`
    - **Shape:** <compact description; if relational, include a small diagram below>
    - **Boundary:** <what this component does NOT do — just as important as what it does>
    - **Invariants:** <optional: rules that must hold for this component to work>

Example of an ASCII diagram that belongs inside the entry:

    ```
    client → api/routes/* → cache.withCache() → Postgres
                                 ↓ miss
                              Redis (5 min TTL)
    ```

## Step 3 — Persist

Append to `.claude/knowledge/architecture.md` via Edit tool. Update `.claude/knowledge/INDEX.md` if it enumerates architecture entries. Read back to confirm.

## Step 4 — Confirm to the user

Tell the user: *"Recorded architecture note: `<title>` in `.claude/knowledge/architecture.md`."*

## Rules

- Compact over verbose. A tight diagram beats a paragraph.
- Describe the **boundary** — what the component explicitly does NOT do.
- If the architecture is already documented, update the existing entry instead of duplicating.
- Never save to auto-memory.
