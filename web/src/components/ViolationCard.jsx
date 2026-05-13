import { useState, forwardRef } from 'react';
import { Icon } from './icons.jsx';

const SEV = {
  CRITICAL: { dotClass: 'bg-gh-danger',    bg: 'bg-gh-danger/15',    border: 'border-gh-danger/40',    text: 'text-gh-danger' },
  HIGH:     { dotClass: 'bg-gh-attention', bg: 'bg-gh-attention/15', border: 'border-gh-attention/40', text: 'text-gh-attention' },
  MEDIUM:   { dotClass: 'bg-gh-accent',    bg: 'bg-gh-accent/15',    border: 'border-gh-accent/40',    text: 'text-gh-accent' },
  LOW:      { dotClass: 'bg-gh-fg-muted',  bg: 'bg-gh-subtle',       border: 'border-gh-border',       text: 'text-gh-fg-muted' },
};

const REG = {
  GDPR:      'border-gh-accent/40 text-gh-accent bg-gh-accent/10',
  HIPAA:     'border-gh-done/40 text-gh-done bg-gh-done/10',
  'PCI-DSS': 'border-gh-attention/40 text-gh-attention bg-gh-attention/10',
};

export const ViolationCard = forwardRef(function ViolationCard({ v, highlighted }, ref) {
  const [open, setOpen] = useState(highlighted ?? false);
  const s = SEV[v.severity] ?? SEV.LOW;

  return (
    <div
      ref={ref}
      id={`violation-${v.id}`}
      className={
        'gh-panel transition ' +
        (highlighted ? 'ring-2 ring-gh-accent/50' : '')
      }
    >
      {/* Header strip — file path on the right, like a code review */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gh-border bg-gh-canvas-inset/50">
        <span className={'w-1.5 h-1.5 rounded-full ' + s.dotClass} />
        <span className={'gh-label border ' + s.border + ' ' + s.bg + ' ' + s.text}>
          {v.severity}
        </span>
        <span className={'gh-label border ' + (REG[v.regulation] ?? 'border-gh-border bg-gh-subtle text-gh-fg-muted')}>
          {v.regulation}
        </span>
        <span className="gh-label border-gh-border bg-gh-subtle text-gh-fg-muted">
          {v.article}
        </span>
        <span className="ml-auto text-[12px] text-gh-fg-muted font-mono truncate">
          {v.file}:{v.line}
        </span>
      </div>

      <div className="px-4 py-4">
        <h3 className="text-[15px] font-semibold tracking-tight text-gh-fg">{v.title}</h3>

        {/* Diff-style snippet — single red `-` line */}
        <div className="mt-3 gh-code !p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gh-border bg-gh-subtle/30 text-[11px] text-gh-fg-muted font-mono">
            <Icon.Bug className="w-3 h-3" /> {v.file}
            <span className="ml-auto">line {v.line}</span>
          </div>
          <div className="font-mono text-[12.5px] leading-[1.6]">
            <div className="flex items-start gap-3 px-3 py-2 gh-diff-del">
              <span className="text-gh-danger select-none w-3 shrink-0">-</span>
              <span className="text-gh-fg-muted/70 select-none w-8 text-right tabular-nums shrink-0">{v.line}</span>
              <span className="text-gh-fg whitespace-pre">{v.snippet}</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[13px] text-gh-fg leading-relaxed">{v.explanation}</p>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => setOpen((o) => !o)}
            className="gh-btn-default !h-7 !px-2.5 !text-xs"
          >
            <Icon.Chevron className="w-3 h-3" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: '0.15s' }} />
            {open ? 'Hide fix' : 'View fix'}
          </button>
          <span className="text-[11px] text-gh-fg-muted">
            <Icon.Sparkle className="inline w-3 h-3 text-gh-cp-purple mr-1" />
            Drafted by Bob
          </span>
        </div>

        {open && (
          <div className="mt-3 border-t border-gh-border pt-4">
            <div className="text-[11px] uppercase tracking-wider text-gh-fg-muted flex items-center gap-1.5">
              <Icon.Sparkle className="w-3 h-3 text-gh-cp-purple" /> Suggested change
            </div>
            <p className="text-[13px] text-gh-fg mt-2">{v.remediation.summary}</p>

            <div className="mt-3 gh-code !p-0 overflow-hidden border-gh-success/30">
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gh-border bg-gh-success/10 text-[11px] text-gh-success font-mono">
                <Icon.Check className="w-3 h-3" /> remediation.diff
                <span className="ml-auto text-gh-fg-muted">apply manually</span>
              </div>
              <div className="font-mono text-[12.5px] leading-[1.6]">
                {v.remediation.code.split('\n').map((line, i) => (
                  <div key={i} className="flex items-start gap-3 px-3 py-0.5 gh-diff-add">
                    <span className="text-gh-success select-none w-3 shrink-0">+</span>
                    <span className="text-gh-fg-muted/70 select-none w-8 text-right tabular-nums shrink-0">{i + 1}</span>
                    <span className="text-gh-fg whitespace-pre">{line || ' '}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
