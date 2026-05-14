import { useState } from 'react';
import { Icon } from './icons.jsx';

const REGULATIONS = [
  { id: 'GDPR',    name: 'GDPR',    color: '#2f81f7', blurb: 'EU personal data, consent, processing' },
  { id: 'HIPAA',   name: 'HIPAA',   color: '#a371f7', blurb: 'US healthcare PHI & audit controls' },
  { id: 'PCI-DSS', name: 'PCI-DSS', color: '#d29922', blurb: 'Payment card data security standard' },
];

const SUGGESTIONS = [
  { label: 'Scan the bundled demo app', value: 'demo' },
  { label: 'expressjs/express', value: 'https://github.com/expressjs/express' },
  { label: 'nestjs/nest', value: 'https://github.com/nestjs/nest' },
  { label: 'medplum/medplum', value: 'https://github.com/medplum/medplum' },
];

export function ScanInput({ onStart }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [picked, setPicked] = useState(REGULATIONS.map((r) => r.id));
  const [busy, setBusy] = useState(false);

  const toggle = (id) =>
    setPicked((p) => (p.includes(id) ? p.filter((r) => r !== id) : [...p, id]));

  const submit = async (e) => {
    e.preventDefault();
    if (!repoUrl || !picked.length || busy) return;
    setBusy(true);
    try {
      await onStart({ repoUrl, regulations: picked });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr,340px] gap-6">
      <section className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
          Ask Bob to audit a repository for{' '}
          <span className="copilot-grad-text">regulatory compliance</span>
          <span className="text-gh-fg-muted">.</span>
        </h1>
        <p className="mt-3 text-gh-fg-muted text-sm max-w-2xl leading-relaxed">
          Bob reads every file at once and traces how personal data flows through the
          codebase &mdash; the same analysis an auditor would do, in 45 seconds.
        </p>

        {/* Copilot Chat-style command bar */}
        <form onSubmit={submit} className="mt-5">
          <div className="gh-panel overflow-hidden focus-within:border-gh-accent focus-within:shadow-focus transition">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gh-border bg-gh-canvas-inset/50">
              <Icon.Sparkle className="w-3.5 h-3.5 text-gh-cp-purple" />
              <span className="text-xs text-gh-fg-muted">
                Ask Bob &mdash; paste a public GitHub URL, or type{' '}
                <code className="font-mono text-gh-fg">demo</code>
              </span>
            </div>

            <div className="flex items-center gap-2 p-3">
              <span className="text-gh-fg-muted font-mono select-none">$</span>
              <input
                autoFocus
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onPaste={(e) => {
                  // Collapse multi-line / wrapped pastes into a single token.
                  const text = e.clipboardData.getData('text');
                  if (text && /\s/.test(text.trim())) {
                    e.preventDefault();
                    setRepoUrl(text.replace(/\s+/g, ' ').trim());
                  }
                }}
                placeholder="https://github.com/owner/repo   ·   owner/repo   ·   demo"
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                className="flex-1 bg-transparent outline-none font-mono text-sm leading-relaxed text-gh-fg placeholder:text-gh-fg-subtle"
              />
              {repoUrl && (
                <button
                  type="button"
                  onClick={() => setRepoUrl('')}
                  aria-label="Clear input"
                  className="text-gh-fg-muted hover:text-gh-fg"
                >
                  <Icon.X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-t border-gh-border bg-gh-canvas-inset/40">
              <div className="flex flex-wrap items-center gap-1.5">
                {REGULATIONS.map((r) => {
                  const on = picked.includes(r.id);
                  return (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => toggle(r.id)}
                      className={
                        'inline-flex items-center gap-1.5 h-6 px-2 rounded-full border text-[11px] font-medium transition ' +
                        (on
                          ? 'bg-gh-subtle border-gh-border text-gh-fg'
                          : 'bg-transparent border-gh-border-muted text-gh-fg-muted hover:text-gh-fg')
                      }
                    >
                      <span
                        className={'w-1.5 h-1.5 rounded-full ' + (on ? '' : 'bg-gh-fg-subtle')}
                        style={on ? { background: r.color } : undefined}
                      />
                      {r.name}
                      {on && <Icon.Check className="w-2.5 h-2.5" />}
                    </button>
                  );
                })}
              </div>
              <button
                type="submit"
                disabled={!repoUrl || picked.length === 0 || busy}
                className="gh-btn-primary ml-auto !h-7 !px-3 !text-xs disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <Icon.Spinner className="w-3.5 h-3.5" /> Starting
                  </>
                ) : (
                  <>
                    Run audit <Icon.Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Suggestion chips, like Copilot Chat does */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gh-fg-muted">Try:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setRepoUrl(s.value)}
                className="inline-flex items-center gap-1.5 h-6 px-2 rounded-full bg-gh-overlay border border-gh-border text-gh-fg-muted hover:text-gh-fg hover:border-gh-fg-muted transition"
              >
                <Icon.Sparkle className="w-3 h-3 text-gh-cp-purple" />
                {s.label}
              </button>
            ))}
          </div>
        </form>

        {/* What Bob does — file-tree-ish list, very GitHub */}
        <div className="mt-8 gh-panel">
          <div className="gh-section-header">
            <div className="flex items-center gap-2">
              <Icon.Sparkle className="w-3.5 h-3.5 text-gh-cp-purple" />
              <span className="text-gh-fg font-semibold">What Bob does that linters can&rsquo;t</span>
            </div>
            <span className="font-mono">3 steps</span>
          </div>
          <div className="divide-y divide-gh-border">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex items-start gap-3 px-4 py-3">
                <div className="w-6 h-6 rounded-full bg-gh-subtle border border-gh-border flex items-center justify-center text-[11px] font-mono text-gh-fg-muted shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gh-fg">{s.title}</div>
                  <div className="text-sm text-gh-fg-muted mt-0.5 leading-relaxed">{s.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right rail — GitHub repo-page style "About" panel */}
      <aside className="space-y-4 lg:sticky lg:top-[140px] self-start">
        <div className="gh-panel">
          <div className="gh-section-header">
            <span className="text-gh-fg font-semibold">About</span>
          </div>
          <div className="px-4 py-3 space-y-3">
            <p className="text-sm text-gh-fg-muted leading-relaxed">
              Compliance Ghost uses Bob&rsquo;s full repository understanding to find every
              GDPR / HIPAA / PCI-DSS violation in source &mdash; before a regulator does.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="gh-label border-gh-border bg-gh-subtle text-gh-fg-muted">compliance</span>
              <span className="gh-label border-gh-border bg-gh-subtle text-gh-fg-muted">gdpr</span>
              <span className="gh-label border-gh-border bg-gh-subtle text-gh-fg-muted">hipaa</span>
              <span className="gh-label border-gh-border bg-gh-subtle text-gh-fg-muted">pci-dss</span>
              <span className="gh-label border-gh-border bg-gh-subtle text-gh-fg-muted">static-analysis</span>
            </div>
          </div>
        </div>

        <div className="gh-panel">
          <div className="gh-section-header">
            <span className="text-gh-fg font-semibold">Outputs</span>
          </div>
          <ul className="px-4 py-3 space-y-2 text-sm">
            {OUTPUTS.map((o) => (
              <li key={o} className="flex items-start gap-2 text-gh-fg">
                <Icon.Check className="w-3.5 h-3.5 text-gh-success mt-1 shrink-0" />
                {o}
              </li>
            ))}
          </ul>
        </div>

        <div className="gh-panel">
          <div className="gh-section-header">
            <span className="text-gh-fg font-semibold">Privacy</span>
          </div>
          <p className="px-4 py-3 text-sm text-gh-fg-muted leading-relaxed">
            Source files are sent to Bob for the duration of a scan only. Nothing is
            persisted; the working tree is deleted after analysis.
          </p>
        </div>
      </aside>
    </div>
  );
}

const STEPS = [
  {
    title: 'Identifies personal data by context, not field name',
    body: 'Bob recognises that `u.contact_string` is an email when it flows into a mailer, even though the name says nothing about it.',
  },
  {
    title: 'Traces data across files, functions and APIs',
    body: 'Follows values through renames, transformations, queue hops and third-party calls — the analysis a linter cannot do.',
  },
  {
    title: 'Maps each flow against the regulation',
    body: 'Returns the file, the line, the broken code verbatim, the article number and the corrected code.',
  },
];

const OUTPUTS = [
  'Per-regulation compliance score (0–100)',
  'Interactive data-flow graph of every personal-data field',
  'Violations with file, line, snippet and Bob’s fix',
  'Exportable PDF audit report',
];
