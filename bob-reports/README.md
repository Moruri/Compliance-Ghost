# Bob Session Reports

This folder is the **required hackathon artifact** for Compliance Ghost.

Every Bob session used during development must be exported here as a separate
file so judges can audit how Bob was used.

## Naming convention

```
YYYY-MM-DD_<slug>.md
```

- `YYYY-MM-DD` — UTC date of the session
- `<slug>` — short kebab-case description (e.g. `bootstrap-bob-prompt`,
  `data-flow-schema`, `violation-detector-tuning`)

## What to include in each file

1. **Goal** — one paragraph: what were we asking Bob to do?
2. **Files / context passed to Bob** — list of files or repo state
3. **Prompt** — verbatim system + user messages
4. **Bob's response** — pasted verbatim (trim only obvious noise)
5. **What we kept** — what made it into the codebase
6. **What we discarded** — and why

## Index

A running log of sessions lives in [`SESSIONS.md`](./SESSIONS.md). Append a
one-line entry every time you export a new session.
