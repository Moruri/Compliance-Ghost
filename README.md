# Compliance Ghost

> **Compliance Ghost uses IBM Bob's full-repository understanding to
> automatically trace where your users' data goes, map it against GDPR,
> HIPAA and PCI-DSS and tell you exactly what's broken — before a
> regulator does.**

A keyword scanner finds the string `email`. Bob follows the email through
six functions, watches it get serialised into an analytics payload, sees
that no consent gate fires before the third-party call and writes the
finding up with the file path, the line number, the broken snippet, the
GDPR article number and the corrected code.

That is the difference. And it is why this product cannot exist without
Bob's full repository context.

---

## What's in the box

```
.
├── server/        Express backend: clone, parse, BobClient, SSE progress
├── web/           React + Vite + Tailwind + React Flow dashboard
├── sample-app/    Intentionally non-compliant demo target
├── bob-reports/   Bob session exports (mandatory submission artifact)
└── README.md
```

## Quick start

```bash
# 1. Install everything
npm install
npm install -w server
npm install -w web

# 2. Configure the server (the example is preset to mock mode so the demo
#    works without a real Bob endpoint)
cp server/.env.example server/.env

# 3. Run both processes
npm run dev
```

Then open <http://localhost:5173>, type `demo` into the repo input and
hit **Scan repository**.

## The demo flow

1. Paste a GitHub URL — or type the literal word `demo` to scan the bundled
   `sample-app/` with no GitHub round trip.
2. Watch the live SSE progress screen tick through clone → parse → Bob
   identifying → tracing → matching → remediation.
3. The dashboard loads:
   - Three score rings (GDPR, HIPAA, PCI-DSS), animated 0 → final value.
   - Stat cards (total / critical / high / files / personal-data fields).
   - **A React Flow data-flow graph** with green entry nodes, blue
     processing, purple storage, red external — and red animated edges
     wherever a violation occurs. Click a node to see exactly which
     personal data passes through it. Click a red edge to jump to the
     violation card below.
   - A filterable violations list. Each card shows the severity badge,
     regulation tag, article, file path + line, the broken snippet
     verbatim, a plain-English explanation and a "View Fix" expandable
     section with Bob's exact remediation code.
   - **Export audit report (PDF)** — what a company hands to an auditor.

For the bundled sample app Bob will report:

| # | File | Regulation | Severity |
|---|------|------------|----------|
| 1 | `sample-app/src/auth.service.js` | GDPR | CRITICAL |
| 2 | `sample-app/src/patient.controller.js` | HIPAA | CRITICAL |
| 3 | `sample-app/src/payment.repository.js` | PCI-DSS | CRITICAL |
| 4 | `sample-app/src/error.middleware.js` | GDPR | HIGH |
| 5 | `sample-app/src/reset.service.js` | GDPR | HIGH |

End the demo with the line:

> _"This took 45 seconds. A manual audit takes 6 weeks and $50,000."_

## Wiring up a real Bob endpoint

The backend ships with a generic HTTP `BobClient`. Point it at any endpoint
that accepts a JSON `POST` with the body shape produced by
`server/src/lib/prompt.js#buildBobPrompt` and returns JSON conforming to
`SCAN_RESULT_SCHEMA` in the same file:

```env
# server/.env
BOB_API_URL=https://your-bob-endpoint.example.com/v1/analyze
BOB_API_KEY=…
BOB_MOCK=false
```

No other code changes are required.

## Bob report requirement

`bob-reports/` is **a mandatory hackathon submission artifact**. Every Bob
session used during development must be exported there. See
[`bob-reports/README.md`](./bob-reports/README.md) for the format and
[`bob-reports/SESSIONS.md`](./bob-reports/SESSIONS.md) for the index.

## License

MIT. See [`LICENSE`](./LICENSE).
