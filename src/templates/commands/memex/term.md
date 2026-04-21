---
description: Record a domain term in .claude/knowledge/glossary.md
---

The user wants to record a glossary term: $ARGUMENTS

## Step 1 — Parse the input

Expected format: `<term>: <definition>` — for example `POS: the in-store point-of-sale flow`.

If `$ARGUMENTS` is just a term with no definition, ask the user for the one-line definition before proceeding. Do not invent definitions.

## Step 2 — Check for duplicates

Read `.claude/knowledge/glossary.md`. If the term already exists:
- If the existing definition is accurate, tell the user and stop.
- If the definition has drifted or should be refined, **update the existing entry** rather than creating a new one.

## Step 3 — Draft the entry

Compute today's date (YYYY-MM-DD). Draft:

    ## <term>

    - **Added:** <YYYY-MM-DD>
    - **Definition:** <plain-language one-liner — avoid nested jargon>
    - **Used in:** `<path/a>`, `<path/b>` (1-2 representative locations)
    - **Not to be confused with:** <term that sounds similar but means something different> (optional)

## Step 4 — Persist

Append to `.claude/knowledge/glossary.md`. Glossary entries are typically alphabetized — if the file has an alphabetical order, insert the new term at the correct position instead of blindly appending. Update `.claude/knowledge/INDEX.md` if it enumerates terms. Read back to confirm.

## Step 5 — Confirm to the user

Tell the user: *"Recorded term: `<term>` in `.claude/knowledge/glossary.md`."*

## Rules

- Definitions must be plain-language, ideally one line.
- Avoid defining a term with another project-specific term (unless that term is also in the glossary).
- Cite 1-2 real locations where the term appears so readers can see it in context.
- Never save to auto-memory.
