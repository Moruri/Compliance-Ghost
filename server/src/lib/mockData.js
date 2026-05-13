// Deterministic mock that the BobClient falls back to when no real Bob
// endpoint is configured. The mock walks the actual files we just collected
// and tries to find the five baked-in violations from the bundled sample app.
// For files it doesn't recognise it falls back to a plausible "clean repo"
// shape so any GitHub URL will still produce something to demo.

const isCommentLine = (line) => {
  const trimmed = line.trim();
  return trimmed === '' || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*');
};

const findLine = (content, regex) => {
  if (!content) return null;
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (isCommentLine(lines[i])) continue;
    if (regex.test(lines[i])) return { line: i + 1, snippet: lines[i].trim() };
  }
  return null;
};

const fileByName = (files, suffix) =>
  files.find((f) => f.path.toLowerCase().endsWith(suffix.toLowerCase()));

const CLEAN_SCORE = { GDPR: 92, HIPAA: 94, 'PCI-DSS': 96 };

// Detectors look for the exact patterns we baked into sample-app/. Each
// returns null (no match) or a violation object plus the data-flow edge id
// it should be wired to.
const DETECTORS = [
  {
    id: 'gdpr-email-to-segment',
    detect(files) {
      const file = fileByName(files, 'auth.service.js');
      if (!file) return null;
      const hit = findLine(file.content, /analytics\.identify\s*\(/);
      if (!hit) return null;
      return {
        violation: {
          id: 'gdpr-email-to-segment',
          regulation: 'GDPR',
          article: 'Article 7 & Article 28',
          severity: 'CRITICAL',
          title: 'User email shipped to Segment without consent check',
          file: file.path,
          line: hit.line,
          snippet: hit.snippet,
          explanation:
            'User email is being forwarded to Segment (a third-party data processor) ' +
            'inside the registration handler with no consent gate. GDPR Article 7 ' +
            'requires explicit consent before sharing personal data with processors, ' +
            'and Article 28 requires a Data Processing Agreement to be in place.',
          remediation: {
            summary: 'Gate the analytics.identify call behind a consent check.',
            code:
              "if (user.consent?.analytics) {\n" +
              "  analytics.identify(user.id, { email: user.email });\n" +
              "} else {\n" +
              "  // Send only a pseudonymous id when consent has not been granted.\n" +
              "  analytics.identify(user.id);\n" +
              "}",
          },
          dataFlowEdgeId: 'edge-register-to-segment',
        },
        edge: {
          id: 'edge-register-to-segment',
          source: 'node-register',
          target: 'node-segment',
          label: 'email (no consent)',
          violation: true,
        },
        nodes: [
          { id: 'node-register', label: 'POST /auth/register', kind: 'entry', file: file.path, line: hit.line, carries: ['user.email'] },
          { id: 'node-segment', label: 'Segment.identify()', kind: 'external', file: file.path, line: hit.line, carries: ['user.email'] },
        ],
      };
    },
  },
  {
    id: 'hipaa-diagnosis-log',
    detect(files) {
      const file = fileByName(files, 'patient.controller.js');
      if (!file) return null;
      const hit = findLine(file.content, /console\.log\s*\([^)]*diagnosis/i);
      if (!hit) return null;
      return {
        violation: {
          id: 'hipaa-diagnosis-log',
          regulation: 'HIPAA',
          article: '45 CFR 164.312(b)',
          severity: 'CRITICAL',
          title: 'Patient diagnosis written to application logs',
          file: file.path,
          line: hit.line,
          snippet: hit.snippet,
          explanation:
            'Protected Health Information (the patient diagnosis) is being printed ' +
            'to console.log, which means it ends up in stdout, container logs, and ' +
            'almost certainly your log aggregator. HIPAA 45 CFR 164.312(b) requires ' +
            'audit controls and prohibits PHI from leaking into general-purpose logs.',
          remediation: {
            summary: 'Replace the log with an audit-only entry that omits PHI.',
            code:
              "auditLogger.record({\n" +
              "  actor: req.user.id,\n" +
              "  action: 'patient.read',\n" +
              "  patientId: patient.id,\n" +
              "  // Never include diagnosis / notes / identifiers in the log body.\n" +
              "});",
          },
          dataFlowEdgeId: 'edge-patient-to-logs',
        },
        edge: {
          id: 'edge-patient-to-logs',
          source: 'node-patient-read',
          target: 'node-stdout',
          label: 'diagnosis (PHI)',
          violation: true,
        },
        nodes: [
          { id: 'node-patient-read', label: 'GET /patients/:id', kind: 'entry', file: file.path, line: hit.line, carries: ['patient.diagnosis'] },
          { id: 'node-stdout', label: 'console.log → stdout', kind: 'external', file: file.path, line: hit.line, carries: ['patient.diagnosis'] },
        ],
      };
    },
  },
  {
    id: 'pci-card-stored',
    detect(files) {
      const file = fileByName(files, 'payment.repository.js');
      if (!file) return null;
      const hit = findLine(file.content, /card_?number\s*[:=]/i);
      if (!hit) return null;
      return {
        violation: {
          id: 'pci-card-stored',
          regulation: 'PCI-DSS',
          article: 'Requirement 3.4',
          severity: 'CRITICAL',
          title: 'Full PAN persisted to the transactions table',
          file: file.path,
          line: hit.line,
          snippet: hit.snippet,
          explanation:
            'The full Primary Account Number is being written into the transactions ' +
            'row. PCI-DSS Requirement 3.4 mandates that the PAN is rendered ' +
            'unreadable wherever it is stored — truncation, tokenization, or strong ' +
            'cryptography. Storing the full number is a critical violation.',
          remediation: {
            summary: 'Tokenize the PAN and persist only the last four digits.',
            code:
              "const token = await psp.tokenize(card.number);\n" +
              "await db.transactions.insert({\n" +
              "  user_id,\n" +
              "  card_last4: card.number.slice(-4),\n" +
              "  card_token: token,\n" +
              "  // Never store: card.number, card.cvv, card.full_track\n" +
              "});",
          },
          dataFlowEdgeId: 'edge-payment-to-db',
        },
        edge: {
          id: 'edge-payment-to-db',
          source: 'node-checkout',
          target: 'node-transactions-table',
          label: 'full PAN',
          violation: true,
        },
        nodes: [
          { id: 'node-checkout', label: 'POST /checkout', kind: 'entry', file: file.path, line: hit.line, carries: ['card.number', 'card.cvv'] },
          { id: 'node-transactions-table', label: 'transactions table', kind: 'storage', file: file.path, line: hit.line, carries: ['card.number'] },
        ],
      };
    },
  },
  {
    id: 'gdpr-ip-in-error-tracker',
    detect(files) {
      const file = fileByName(files, 'error.middleware.js');
      if (!file) return null;
      const hit =
        findLine(file.content, /req\.ip/) ??
        findLine(file.content, /captureException\s*\(/);
      if (!hit) return null;
      return {
        violation: {
          id: 'gdpr-ip-in-error-tracker',
          regulation: 'GDPR',
          article: 'Article 5(1)(c) — data minimisation',
          severity: 'HIGH',
          title: 'Raw IP address forwarded to error tracker',
          file: file.path,
          line: hit.line,
          snippet: hit.snippet,
          explanation:
            'The error middleware attaches `req.ip` to the exception context that is ' +
            'forwarded to Sentry. IP addresses are personal data under GDPR and ' +
            'including them in third-party error reports without a lawful basis or ' +
            'minimisation step breaches Article 5(1)(c).',
          remediation: {
            summary: 'Hash or truncate the IP before sending it to the error tracker.',
            code:
              "import { createHash } from 'crypto';\n" +
              "const ipHash = createHash('sha256').update(req.ip + IP_SALT).digest('hex').slice(0, 16);\n" +
              "Sentry.captureException(err, { tags: { ip_hash: ipHash } });",
          },
          dataFlowEdgeId: 'edge-error-to-sentry',
        },
        edge: {
          id: 'edge-error-to-sentry',
          source: 'node-error-mw',
          target: 'node-sentry',
          label: 'req.ip',
          violation: true,
        },
        nodes: [
          { id: 'node-error-mw', label: 'errorHandler middleware', kind: 'processing', file: file.path, line: hit.line, carries: ['user.ip'] },
          { id: 'node-sentry', label: 'Sentry.captureException', kind: 'external', file: file.path, line: hit.line, carries: ['user.ip'] },
        ],
      };
    },
  },
  {
    id: 'gdpr-plaintext-reset-token',
    detect(files) {
      const file = fileByName(files, 'reset.service.js');
      if (!file) return null;
      const hit = findLine(file.content, /reset_?token\s*[:=]/i);
      if (!hit) return null;
      return {
        violation: {
          id: 'gdpr-plaintext-reset-token',
          regulation: 'GDPR',
          article: 'Article 32 — security of processing',
          severity: 'HIGH',
          title: 'Password reset token stored in plaintext',
          file: file.path,
          line: hit.line,
          snippet: hit.snippet,
          explanation:
            'Password reset tokens are credential-equivalents: anyone with the value ' +
            'can take over the account. GDPR Article 32 requires appropriate ' +
            'technical measures; storing the token verbatim means a database read ' +
            'is enough to hijack any user account.',
          remediation: {
            summary: 'Persist only a hash of the token; compare hashes on verification.',
            code:
              "import { createHash, randomBytes } from 'crypto';\n" +
              "const token = randomBytes(32).toString('hex');\n" +
              "const tokenHash = createHash('sha256').update(token).digest('hex');\n" +
              "await db.users.update(userId, { reset_token_hash: tokenHash, reset_expires: in1h() });\n" +
              "return token; // hand the plain token to the user; never persist it.",
          },
          dataFlowEdgeId: 'edge-reset-to-db',
        },
        edge: {
          id: 'edge-reset-to-db',
          source: 'node-reset',
          target: 'node-users-table',
          label: 'reset_token (plaintext)',
          violation: true,
        },
        nodes: [
          { id: 'node-reset', label: 'POST /auth/reset', kind: 'entry', file: file.path, line: hit.line, carries: ['reset.token'] },
          { id: 'node-users-table', label: 'users table', kind: 'storage', file: file.path, line: hit.line, carries: ['reset.token'] },
        ],
      };
    },
  },
];

function buildPersonalData(violations) {
  const map = new Map();
  const add = (id, label, category) => {
    if (!map.has(id)) map.set(id, { id, label, category, locations: [] });
    return map.get(id);
  };
  for (const v of violations) {
    if (/email/i.test(v.snippet)) add('user.email', 'User email', 'PII').locations.push({ file: v.file, line: v.line, snippet: v.snippet });
    if (/diagnosis/i.test(v.snippet)) add('patient.diagnosis', 'Patient diagnosis', 'PHI').locations.push({ file: v.file, line: v.line, snippet: v.snippet });
    if (/card/i.test(v.snippet)) add('card.number', 'Credit card PAN', 'PCI').locations.push({ file: v.file, line: v.line, snippet: v.snippet });
    if (/ip/i.test(v.snippet) || /Sentry|captureException/.test(v.snippet)) add('user.ip', 'User IP address', 'PII').locations.push({ file: v.file, line: v.line, snippet: v.snippet });
    if (/reset/i.test(v.snippet) || /token/i.test(v.snippet)) add('reset.token', 'Password reset token', 'Credential').locations.push({ file: v.file, line: v.line, snippet: v.snippet });
  }
  return Array.from(map.values());
}

function scoreFor(regulation, violations) {
  const weights = { CRITICAL: 35, HIGH: 18, MEDIUM: 8, LOW: 3 };
  const subset = violations.filter((v) => v.regulation === regulation);
  if (subset.length === 0) return CLEAN_SCORE[regulation] ?? 95;
  const penalty = subset.reduce((sum, v) => sum + (weights[v.severity] ?? 5), 0);
  return Math.max(0, 100 - penalty);
}

function buildBaselineGraph() {
  return {
    nodes: [
      { id: 'node-app', label: 'Application core', kind: 'processing', file: null, line: null, carries: [] },
      { id: 'node-db', label: 'Primary database', kind: 'storage', file: null, line: null, carries: [] },
    ],
    edges: [
      { id: 'edge-app-db', source: 'node-app', target: 'node-db', label: 'persisted state', violation: false },
    ],
  };
}

export function generateMockResult({ files, regulations }) {
  const matched = DETECTORS.map((d) => d.detect(files)).filter(Boolean);

  const violations = matched
    .map((m) => m.violation)
    .filter((v) => regulations.includes(v.regulation));

  const nodes = new Map();
  const edges = [];
  if (violations.length === 0) {
    const baseline = buildBaselineGraph();
    baseline.nodes.forEach((n) => nodes.set(n.id, n));
    edges.push(...baseline.edges);
  } else {
    for (const m of matched) {
      if (!regulations.includes(m.violation.regulation)) continue;
      for (const n of m.nodes) {
        const existing = nodes.get(n.id);
        if (existing) {
          existing.carries = Array.from(new Set([...(existing.carries ?? []), ...(n.carries ?? [])]));
        } else {
          nodes.set(n.id, { ...n });
        }
      }
      edges.push(m.edge);
    }
    // Drop a couple of processing nodes to make the graph feel like a system.
    if (!nodes.has('node-app')) {
      nodes.set('node-app', { id: 'node-app', label: 'Application core', kind: 'processing', file: null, line: null, carries: [] });
    }
  }

  const personalData = buildPersonalData(violations);

  const result = {
    summary: {
      language: detectLanguage(files),
      filesAnalyzed: files.length,
      personalDataFieldsFound: personalData.length,
      totalViolations: violations.length,
      headline:
        violations.length === 0
          ? 'No regulatory violations detected in the scanned source files.'
          : `${violations.length} regulatory violation(s) detected across ${new Set(violations.map((v) => v.file)).size} file(s).`,
    },
    scores: {
      GDPR: scoreFor('GDPR', violations),
      HIPAA: scoreFor('HIPAA', violations),
      'PCI-DSS': scoreFor('PCI-DSS', violations),
    },
    personalData,
    dataFlow: {
      nodes: Array.from(nodes.values()),
      edges,
    },
    violations,
  };

  return result;
}

function detectLanguage(files) {
  const counts = {};
  for (const f of files) {
    const ext = f.path.slice(f.path.lastIndexOf('.') + 1).toLowerCase();
    counts[ext] = (counts[ext] ?? 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!top) return 'Unknown';
  return ({ js: 'JavaScript', ts: 'TypeScript', jsx: 'JavaScript (React)', tsx: 'TypeScript (React)', py: 'Python', go: 'Go', rs: 'Rust', java: 'Java', rb: 'Ruby' }[top[0]]) ?? top[0].toUpperCase();
}
