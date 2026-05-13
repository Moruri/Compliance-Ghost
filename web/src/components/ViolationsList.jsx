import { useMemo, useState, useEffect, useRef } from 'react';
import { ViolationCard } from './ViolationCard.jsx';
import { Icon } from './icons.jsx';

const SEVS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export function ViolationsList({ violations, highlightId, onClearHighlight }) {
  const [sev, setSev] = useState('ALL');
  const [reg, setReg] = useState('ALL');
  const refs = useRef({});

  const regulations = useMemo(
    () => Array.from(new Set(violations.map((v) => v.regulation))),
    [violations],
  );

  const filtered = useMemo(() => {
    return violations
      .filter((v) => sev === 'ALL' || v.severity === sev)
      .filter((v) => reg === 'ALL' || v.regulation === reg)
      .sort((a, b) => SEVS.indexOf(a.severity) - SEVS.indexOf(b.severity));
  }, [violations, sev, reg]);

  useEffect(() => {
    if (!highlightId) return;
    const el = refs.current[highlightId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const t = setTimeout(() => onClearHighlight?.(), 2400);
      return () => clearTimeout(t);
    }
  }, [highlightId, onClearHighlight]);

  return (
    <div className="gh-panel overflow-hidden">
      {/* GitHub Issues-style filter bar */}
      <div className="px-3 py-2 border-b border-gh-border bg-gh-canvas-inset/40 flex flex-wrap items-center gap-2">
        <Icon.Bug className="w-4 h-4 text-gh-fg-muted" />
        <span className="text-[13px] font-semibold text-gh-fg">
          {filtered.length} <span className="text-gh-fg-muted font-normal">open</span>
        </span>

        <div className="hidden md:block w-px h-5 bg-gh-border mx-1" />

        <FilterMenu
          label="Severity"
          value={sev}
          options={['ALL', ...SEVS]}
          onChange={setSev}
        />
        <FilterMenu
          label="Regulation"
          value={reg}
          options={['ALL', ...regulations]}
          onChange={setReg}
        />

        <span className="ml-auto text-xs text-gh-fg-muted">
          {violations.length} total
        </span>
      </div>

      <div className="divide-y divide-gh-border">
        {filtered.map((v) => (
          <div key={v.id} className="p-3 md:p-4">
            <ViolationCard
              v={v}
              highlighted={highlightId === v.id}
              ref={(el) => (refs.current[v.id] = el)}
            />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-6 py-10 text-center text-gh-fg-muted text-sm">
            No violations match the current filter.
          </div>
        )}
      </div>
    </div>
  );
}

function FilterMenu({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 h-7 px-2 text-xs text-gh-fg-muted hover:text-gh-fg"
      >
        {label}
        <span className="text-gh-fg-muted/60">·</span>
        <span className="text-gh-fg">{value}</span>
        <Icon.Chevron className="w-3 h-3 rotate-90" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 min-w-[160px] gh-panel shadow-elev">
            <div className="gh-section-header !py-1.5 !text-[11px]">
              Filter by {label.toLowerCase()}
            </div>
            <div className="py-1 max-h-64 overflow-y-auto">
              {options.map((o) => (
                <button
                  key={o}
                  onClick={() => { onChange(o); setOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 hover:bg-gh-subtle"
                >
                  <span className="w-3.5 h-3.5 inline-flex items-center justify-center">
                    {value === o && <Icon.Check className="w-3 h-3 text-gh-fg" />}
                  </span>
                  <span className={value === o ? 'text-gh-fg font-semibold' : 'text-gh-fg-muted'}>
                    {o}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
