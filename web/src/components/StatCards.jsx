import { Icon } from './icons.jsx';

export function StatCards({ result }) {
  const total = result.violations.length;
  const crit = result.violations.filter((v) => v.severity === 'CRITICAL').length;
  const high = result.violations.filter((v) => v.severity === 'HIGH').length;
  const files = new Set(result.violations.map((v) => v.file)).size;
  const personal = result.personalData?.length ?? 0;

  const cards = [
    { label: 'Violations',          value: total,    icon: <Icon.Bug className="w-3.5 h-3.5" />,         tone: 'text-gh-fg' },
    { label: 'Critical',            value: crit,     icon: <Icon.Alert className="w-3.5 h-3.5" />,       tone: 'text-gh-danger' },
    { label: 'High',                value: high,     icon: <Icon.Alert className="w-3.5 h-3.5" />,       tone: 'text-gh-attention' },
    { label: 'Files affected',      value: files,    icon: <Icon.Repo className="w-3.5 h-3.5" />,        tone: 'text-gh-accent' },
    { label: 'Personal-data fields',value: personal, icon: <Icon.Shield className="w-3.5 h-3.5" />,      tone: 'text-gh-done' },
  ];

  return (
    <div className="gh-panel overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-gh-border">
        {cards.map((c, i) => (
          <div key={c.label} className={'px-4 py-3 ' + (i >= 2 ? 'border-t md:border-t-0 border-gh-border' : '')}>
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gh-fg-muted">
              <span className={c.tone}>{c.icon}</span>
              {c.label}
            </div>
            <div className={`mt-1.5 text-2xl font-semibold tabular-nums ${c.tone}`}>
              {c.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
