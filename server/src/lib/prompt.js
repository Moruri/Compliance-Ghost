// The contract we ask Bob to fulfil. We send a system instruction + a JSON
// payload of files; Bob must return a JSON object matching SCAN_RESULT_SCHEMA.
// This file is the single source of truth — both the real HTTP client and the
// mock generator key off it.

export function buildScanResultSchema(regulations = ['GDPR', 'HIPAA', 'PCI-DSS']) {
  const scoresBlock = regulations
    .map((reg, i) => `    ${JSON.stringify(reg)}: number${i === 0 ? '                      // 0-100 (higher = better)' : ''}`)
    .join(',\n');
  return `{
  "summary": {
    "language": string,                  // primary language detected
    "filesAnalyzed": number,
    "personalDataFieldsFound": number,
    "totalViolations": number,
    "headline": string                   // one-sentence elevator pitch of the findings
  },
  "scores": {
${scoresBlock}
  },
  "personalData": [
    {
      "id": string,                      // stable slug, e.g. "user.email"
      "label": string,                   // human-friendly, e.g. "User email"
      "category": "PII" | "PHI" | "PCI" | "Behavioral" | "Credential" | "Other",
      "locations": [
        { "file": string, "line": number, "snippet": string }
      ]
    }
  ],
  "dataFlow": {
    "nodes": [
      {
        "id": string,
        "label": string,
        "kind": "entry" | "processing" | "storage" | "external",
        "file": string | null,
        "line": number | null,
        "carries": string[]              // ids from personalData[]
      }
    ],
    "edges": [
      {
        "id": string,
        "source": string,                // node id
        "target": string,                // node id
        "label": string,
        "violation": boolean             // true if this edge is part of a violation
      }
    ]
  },
  "violations": [
    {
      "id": string,
      "regulation": ${regulations.map((r) => JSON.stringify(r)).join(' | ')},
      "article": string,                 // e.g. "Article 28" or "164.312(a)(1)"
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "title": string,
      "file": string,
      "line": number,
      "snippet": string,                 // the problematic code, verbatim
      "explanation": string,             // plain English: what is wrong and why
      "remediation": {
        "summary": string,
        "code": string                   // the suggested fix as a code block
      },
      "dataFlowEdgeId": string | null    // optional link into dataFlow.edges[]
    }
  ]
}`;
}

export function buildBobPrompt({ files, regulations }) {
  const regs = regulations.join(', ');
  const instructions = `
You are Bob, IBM's full-repository code analyst, acting as a compliance auditor.

You will receive every source file in a repository. Your task is to:

1. Identify every piece of personal data the code touches (PII, PHI, payment
   data, credentials, behavioral identifiers) — not just by field name, but by
   tracing how values flow.
2. Build a data-flow map of where each piece of data enters, gets transformed,
   gets stored and gets transmitted externally.
3. Compare what the code actually does against ${regs} and produce concrete
   violations with file paths, line numbers, the problematic snippet verbatim,
   plain-English explanations and remediation code.
4. Score ONLY the regulation(s) the caller selected (${regs}). Do not include
   scores for any other regulation. Score each from 0 to 100 (higher = more
   compliant). Be honest: a single CRITICAL violation should drop the score
   below 50.
5. Report ONLY violations for the selected regulation(s). Ignore findings
   that would belong to a regulation the caller did not select.

Return ONLY a single JSON object that conforms exactly to this schema (no
prose, no markdown fences, no comments):

${buildScanResultSchema(regulations)}

Guidelines:
- Use stable, lowercase-kebab ids.
- "snippet" must be copied verbatim from the file at the given line.
- For dataFlow.edges, set "violation": true whenever the edge crosses a system
  boundary in a way that triggers one of the violations[] entries; reference
  the violation via dataFlowEdgeId.
- Prefer fewer, accurate violations to many speculative ones.
- If a file is irrelevant, ignore it. Do not invent code.
`.trim();

  return { instructions, files, regulations };
}
