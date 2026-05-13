import { useEffect, useState } from 'react';

const colorFor = (score) => {
  if (score >= 75) return { stroke: 'rgb(var(--gh-success))',   text: 'text-gh-success',   label: 'Passing' };
  if (score >= 50) return { stroke: 'rgb(var(--gh-attention))', text: 'text-gh-attention', label: 'At risk' };
  return                  { stroke: 'rgb(var(--gh-danger))',    text: 'text-gh-danger',    label: 'Failing' };
};

const statusPillClass = (score) => {
  if (score >= 75) return 'border-gh-success/40 bg-gh-success/10';
  if (score >= 50) return 'border-gh-attention/40 bg-gh-attention/10';
  return 'border-gh-danger/40 bg-gh-danger/10';
};

export function ScoreRing({ regulation, score, violations, size = 120 }) {
  const target = Math.max(0, Math.min(100, Math.round(score)));
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - start) / 700);
      setShown(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const c = colorFor(target);
  const r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - shown / 100);

  return (
    <div className="gh-panel p-4 flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="rgb(var(--gh-border))" strokeWidth="8" fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={c.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.15s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-2xl font-semibold tabular-nums ${c.text}`}>{shown}</div>
          <div className="text-[10px] uppercase tracking-wider text-gh-fg-muted">/ 100</div>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-gh-fg">{regulation}</div>
          <span className={'gh-label border ' + statusPillClass(target) + ' ' + c.text}>
            {c.label}
          </span>
        </div>
        <div className="text-[12.5px] text-gh-fg-muted mt-1">
          {violations} {violations === 1 ? 'violation' : 'violations'} detected
        </div>
        <div className="text-[11px] text-gh-fg-muted mt-2 font-mono">
          {regulationArticle(regulation)}
        </div>
      </div>
    </div>
  );
}

function regulationArticle(reg) {
  return {
    GDPR: 'EU 2016/679',
    HIPAA: '45 CFR Part 164',
    'PCI-DSS': 'v4.0',
  }[reg] ?? '';
}
