import { useState } from 'react';
import { ScoreRing } from './ScoreRing.jsx';
import { StatCards } from './StatCards.jsx';
import { DataFlowGraph } from './DataFlowGraph.jsx';
import { ViolationsList } from './ViolationsList.jsx';
import { ExportButton } from './ExportButton.jsx';
import { Icon } from './icons.jsx';

export function Dashboard({ result, target, onReset }) {
  const [highlightId, setHighlightId] = useState(null);

  const scoreEntries = Object.entries(result.scores ?? {});
  const violationsByReg = (reg) =>
    (result.violations ?? []).filter((v) => v.regulation === reg).length;

  const hasFails = Object.values(result.scores ?? {}).some((s) => s < 75);
  const status = result.violations.length === 0
    ? { icon: <Icon.CheckCircle className="w-4 h-4" />, label: 'Passing', tone: 'text-gh-success border-gh-success/40 bg-gh-success/10' }
    : hasFails
    ? { icon: <Icon.Alert className="w-4 h-4" />, label: 'Failing', tone: 'text-gh-danger border-gh-danger/40 bg-gh-danger/10' }
    : { icon: <Icon.Alert className="w-4 h-4" />, label: 'At risk', tone: 'text-gh-attention border-gh-attention/40 bg-gh-attention/10' };

  return (
    <div className="space-y-6">
      {/* GitHub repo-page style header */}
      <div id="cg-audit" className="scroll-mt-28 flex flex-wrap items-start gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Icon.Repo className="w-5 h-5 text-gh-fg-muted shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-semibold tracking-tight truncate">
                {target}
              </h1>
              <span className={'gh-label border ' + status.tone}>
                {status.icon}
                {status.label}
              </span>
              <span className="gh-label border-gh-border text-gh-fg-muted">
                <Icon.Sparkle className="w-3 h-3 text-gh-cp-purple" /> Bob
              </span>
            </div>
            <div className="text-sm text-gh-fg-muted mt-1">
              {result.summary?.headline}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={onReset} className="gh-btn-default">
            <Icon.ArrowRight className="w-3.5 h-3.5 rotate-180" />
            New scan
          </button>
          <ExportButton result={result} target={target} />
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scoreEntries.map(([reg, score]) => (
          <ScoreRing
            key={reg}
            regulation={reg}
            score={score}
            violations={violationsByReg(reg)}
          />
        ))}
      </div>

      <StatCards result={result} />

      <div id="cg-data-flow" className="scroll-mt-28">
        <DataFlowGraph result={result} onSelectViolation={(id) => setHighlightId(id)} />
      </div>

      <section id="cg-findings" className="scroll-mt-28">
        <ViolationsList
          violations={result.violations}
          highlightId={highlightId}
          onClearHighlight={() => setHighlightId(null)}
        />
      </section>

      <div id="cg-reports" className="scroll-mt-28">
        <BobBriefing result={result} />
      </div>
    </div>
  );
}

function BobBriefing({ result }) {
  return (
    <div className="gh-panel">
      <div className="gh-section-header">
        <div className="flex items-center gap-2">
          <Icon.Sparkle className="w-3.5 h-3.5 text-gh-cp-purple animate-sparkle" />
          <span className="text-gh-fg font-semibold text-sm">Bob&rsquo;s briefing</span>
        </div>
        <span className="font-mono">analysis #1</span>
      </div>
      <div className="px-4 py-3 text-sm text-gh-fg leading-relaxed">
        Bob reasoned over <strong className="text-gh-fg">{result.summary?.filesAnalyzed ?? '—'}</strong> source files
        (primary language: <strong className="text-gh-fg">{result.summary?.language ?? '—'}</strong>) and identified{' '}
        <strong className="text-gh-fg">
          {result.summary?.personalDataFieldsFound ?? result.personalData?.length ?? 0}
        </strong>{' '}
        distinct personal-data field(s) moving through the system. The graph above shows
        every path that data takes; <span className="text-gh-danger">red edges</span> are paths
        that violate one of the selected regulations.
      </div>
      {result._meta?.truncated && (
        <div className="border-t border-gh-border px-4 py-2.5 bg-gh-attention/5 text-[12px] text-gh-attention flex items-center gap-2">
          <Icon.Alert className="w-3.5 h-3.5" />
          The repository exceeded the per-scan size limit and was truncated. Re-run with larger
          MAX_FILES / MAX_BYTES env vars on the server for a full audit.
        </div>
      )}
    </div>
  );
}
