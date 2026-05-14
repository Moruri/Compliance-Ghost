import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './icons.jsx';

const STAGES = [
  { id: 'clone',           label: 'Clone repository' },
  { id: 'parse',           label: 'Parse source files' },
  { id: 'bob.indexing',    label: 'Bob — index codebase' },
  { id: 'bob.identifying', label: 'Bob — identify personal data' },
  { id: 'bob.tracing',     label: 'Bob — trace data flows' },
  { id: 'bob.matching',    label: 'Bob — match against regulations' },
  { id: 'bob.fixes',       label: 'Bob — draft remediation' },
  { id: 'done',            label: 'Audit complete' },
];

const fmtTime = (ms) => {
  const d = new Date(ms);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};

const fmtElapsed = (ms) => {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
};

export function ScanProgress({ events, target }) {
  const stageMap = useMemo(() => {
    const map = new Map();
    for (const e of events) map.set(e.stage, e);
    if (map.has('parse.done')) map.set('parse', map.get('parse.done'));
    return map;
  }, [events]);

  const startedAt = events[0]?.ts ?? Date.now();
  const isDone = stageMap.has('done');
  const lastIdx = STAGES.reduce((acc, s, i) => (stageMap.has(s.id) ? i : acc), -1);
  const activeIdx = isDone ? STAGES.length - 1 : lastIdx + 1;

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (isDone) return undefined;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [isDone]);

  const elapsed = (isDone ? events[events.length - 1].ts : now) - startedAt;
  const pct = Math.min(100, Math.round(((isDone ? STAGES.length : lastIdx + 1) / STAGES.length) * 100));

  const logRef = useRef(null);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [events.length]);

  return (
    <div className="grid lg:grid-cols-[260px,1fr] gap-6">
      {/* Left rail — like GitHub Actions job list */}
      <aside className="lg:sticky lg:top-[140px] self-start">
        <div className="gh-panel">
          <div className="gh-section-header">
            <span className="text-gh-fg font-semibold">Jobs</span>
            <span className="font-mono">{stageMap.has('done') ? 'completed' : 'in progress'}</span>
          </div>
          <div className="py-1">
            {STAGES.map((s, i) => {
              const done = isDone || i < activeIdx;
              const active = !isDone && i === activeIdx;
              return (
                <div key={s.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                  <StatusGlyph done={done} active={active} />
                  <span className={done || active ? 'text-gh-fg' : 'text-gh-fg-muted'}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="gh-panel mt-4">
          <div className="gh-section-header">
            <span className="text-gh-fg font-semibold">Run summary</span>
          </div>
          <div className="px-3 py-3 text-sm space-y-2">
            <Row k="Target" v={<span className="font-mono">{target ?? '—'}</span>} />
            <Row k="Started" v={<span className="font-mono">{fmtTime(startedAt)}</span>} />
            <Row k="Elapsed" v={<span className="font-mono">{fmtElapsed(elapsed)}</span>} />
            <Row k="Status" v={isDone ? <span className="text-gh-success">success</span> : <span className="text-gh-accent">running</span>} />
          </div>
        </div>
      </aside>

      {/* Main — Actions-style log stream */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-xs text-gh-fg-muted flex items-center gap-2">
              <Icon.Sparkle className="w-3.5 h-3.5 text-gh-cp-purple animate-sparkle" />
              Bob run
            </div>
            <h1 className="text-xl font-semibold tracking-tight mt-1">
              Auditing <span className="font-mono text-gh-fg-muted">{target ?? 'repository'}</span>
            </h1>
          </div>
          <span className="gh-label border-gh-border bg-gh-subtle text-gh-fg-muted">
            <Icon.Spinner className="w-3 h-3 text-gh-accent" /> run #1
          </span>
        </div>

        {/* Progress bar */}
        <div className="gh-panel overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gh-border">
            <div className="text-xs text-gh-fg-muted font-mono">
              {pct}% complete · step {Math.min(STAGES.length, activeIdx + 1)} of {STAGES.length}
            </div>
            <div className="text-xs text-gh-fg-muted font-mono">{fmtElapsed(elapsed)}</div>
          </div>
          <div className="h-1 bg-gh-canvas-inset">
            <div
              className="h-full bg-gh-accent transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Log */}
          <div
            ref={logRef}
            className="bg-gh-canvas-inset font-mono text-[12.5px] leading-[1.6] px-4 py-3 max-h-[460px] overflow-y-auto"
          >
            {events.length === 0 && (
              <div className="text-gh-fg-muted">Waiting for runner&hellip;</div>
            )}
            {events.map((e, idx) => (
              <LogLine key={idx} event={e} startedAt={startedAt} />
            ))}
            {!isDone && (
              <div className="flex items-center gap-2 mt-1 text-gh-fg-muted">
                <span className="text-gh-fg-muted/60">{String(events.length + 1).padStart(3, '0')}</span>
                <Icon.Spinner className="w-3 h-3 text-gh-accent" />
                <span className="gh-caret">Bob is thinking</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusGlyph({ done, active }) {
  if (done) return <Icon.CheckCircle className="w-4 h-4 text-gh-success" />;
  if (active) return <Icon.Spinner className="w-4 h-4 text-gh-accent" />;
  return <Icon.Dot className="w-4 h-4 text-gh-fg-subtle" />;
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gh-fg-muted">{k}</span>
      <span className="text-right truncate">{v}</span>
    </div>
  );
}

function LogLine({ event, startedAt }) {
  const tone =
    event.stage === 'error' ? 'text-gh-danger' :
    event.stage === 'done'  ? 'text-gh-success' :
    'text-gh-fg';
  const prefix =
    event.stage === 'error' ? '✗' :
    event.stage === 'done'  ? '✓' :
    '·';
  return (
    <div className="flex items-start gap-3 group">
      <span className="text-gh-fg-muted/60 select-none w-10 text-right tabular-nums">
        +{fmtElapsed((event.ts ?? 0) - startedAt)}
      </span>
      <span className="text-gh-fg-muted/50 select-none">{prefix}</span>
      <span className={tone}>
        <span className="text-gh-fg-muted">[{event.stage}]</span> {event.message}
      </span>
    </div>
  );
}
