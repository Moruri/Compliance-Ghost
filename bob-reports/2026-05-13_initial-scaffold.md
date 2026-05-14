# Session — Initial Compliance Ghost scaffold

**Date (UTC):** 2026-05-13
**Slug:** `initial-scaffold`

## Goal

Stand up the Compliance Ghost monorepo end-to-end:

- An Express backend that clones a GitHub repo, collects source files and
  hands them to a configurable Bob HTTP endpoint.
- A `BobClient` interface that posts `{ files, regulations, instructions }`
  and expects the structured JSON described in `server/src/lib/prompt.js`.
- A React/Vite/Tailwind frontend with a scan input, a live SSE progress
  screen and a results dashboard (React Flow data-flow graph, score rings,
  violations list with remediation code, PDF export).
- A bundled non-compliant sample app with all five baked-in violations.

## Context passed to Bob

_None yet — this session was scaffolding only._ Subsequent sessions will
pass the entire `sample-app/` directory plus the scan prompt and capture
Bob's structured JSON response here verbatim.

## What we kept

- The schema in `server/src/lib/prompt.js` is the single source of truth for
  Bob's output.
- The `BobClient` HTTP path is generic on purpose: any endpoint that accepts
  `{ instructions, files, regulations }` and returns conforming JSON drops
  straight in.
- A deterministic mock (`server/src/lib/mockData.js`) lets the demo run
  offline against the bundled `sample-app/` so the pitch never depends on
  network latency.

## What we discarded

- An earlier design that asked Bob for raw chat-style output and then
  parsed it: too brittle. Locked in strict JSON instead.

## Follow-ups

- Once a real Bob endpoint is available, replace `BOB_MOCK=true` with
  `BOB_API_URL=…` in `server/.env` and re-run.
- Capture the first live Bob response here as
  `bob-reports/<date>_first-live-scan.md`.
