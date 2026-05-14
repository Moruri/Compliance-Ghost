import { useEffect, useState } from 'react';
import { ScanInput } from './components/ScanInput.jsx';
import { ScanProgress } from './components/ScanProgress.jsx';
import { Dashboard } from './components/Dashboard.jsx';
import { fetchScan, startScan, streamScanEvents } from './api.js';
import { BrandMark, Icon } from './components/icons.jsx';
import { useTheme } from './theme.jsx';

const VIEW = { INPUT: 'input', PROGRESS: 'progress', DASHBOARD: 'dashboard' };

export default function App() {
  const [view, setView] = useState(VIEW.INPUT);
  const [scanId, setScanId] = useState(null);
  const [events, setEvents] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [target, setTarget] = useState(null);

  useEffect(() => {
    if (!scanId) return undefined;
    setEvents([]);
    const close = streamScanEvents(scanId, {
      onEvent: (ev) => {
        setEvents((prev) => [...prev, ev]);
        if (ev.stage === 'error') setError(ev.message);
        if (ev.stage === 'done') {
          fetchScan(scanId).then((s) => {
            setResult(s.result);
            setView(VIEW.DASHBOARD);
          });
        }
      },
      onError: () => {},
    });
    return close;
  }, [scanId]);

  const onStart = async ({ repoUrl, regulations }) => {
    setError(null);
    setResult(null);
    try {
      const { id, target: t } = await startScan({ repoUrl, regulations });
      setScanId(id);
      setTarget(t ?? repoUrl);
      setView(VIEW.PROGRESS);
    } catch (err) {
      setError(err.message);
    }
  };

  const onReset = () => {
    setView(VIEW.INPUT);
    setScanId(null);
    setEvents([]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar view={view} target={target} onHome={onReset} />

      <RepoBar
        view={view}
        target={target}
        onReset={onReset}
        findingsCount={result?.violations?.length ?? 0}
      />

      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-8">
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
          {view === VIEW.INPUT && <ScanInput onStart={onStart} />}
          {view === VIEW.PROGRESS && <ScanProgress events={events} target={target} />}
          {view === VIEW.DASHBOARD && result && (
            <Dashboard result={result} target={target} onReset={onReset} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function TopBar({ view, target, onHome }) {
  return (
    <header className="border-b border-gh-border bg-gh-canvas/95 sticky top-0 z-40 backdrop-blur">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-14 flex items-center gap-4">
        <button onClick={onHome} className="flex items-center gap-2.5 group">
          <BrandMark size={28} />
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-[15px] tracking-tight">Compliance Ghost</span>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-1 ml-2 text-gh-fg-muted">
          <span className="text-gh-fg-muted/60">/</span>
          <span className="text-gh-fg text-sm font-medium">audit</span>
          {view !== 'input' && target && (
            <>
              <span className="text-gh-fg-muted/60">/</span>
              <span className="text-sm text-gh-fg font-mono">{target}</span>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function RepoBar({ view, target, onReset, findingsCount }) {
  const [active, setActive] = useState('audit');
  const isDashboard = view === 'dashboard';

  useEffect(() => {
    if (isDashboard) setActive('audit');
  }, [isDashboard]);

  const TABS = [
    { id: 'audit',    label: 'Audit',     icon: <Icon.Shield className="w-4 h-4" />,   anchor: 'cg-audit' },
    { id: 'flow',     label: 'Data flow', icon: <Icon.Graph className="w-4 h-4" />,    anchor: 'cg-data-flow' },
    { id: 'findings', label: 'Findings',  icon: <Icon.Bug className="w-4 h-4" />,      anchor: 'cg-findings' },
    { id: 'reports',  label: 'Reports',   icon: <Icon.Download className="w-4 h-4" />, anchor: 'cg-reports' },
  ];

  const goTo = (tab) => {
    if (!isDashboard) return;
    setActive(tab.id);
    const el = document.getElementById(tab.anchor);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="border-b border-gh-border bg-gh-canvas/95 backdrop-blur sticky top-14 z-30">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 flex items-end gap-4 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = isDashboard && active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => goTo(tab)}
              disabled={!isDashboard}
              aria-current={isActive ? 'page' : undefined}
              className={
                'flex items-center gap-2 px-3 py-2.5 -mb-px border-b-2 text-sm whitespace-nowrap transition-colors ' +
                (isActive
                  ? 'border-[#f78166] text-gh-fg font-semibold'
                  : 'border-transparent text-gh-fg-muted hover:text-gh-fg ') +
                (isDashboard ? 'cursor-pointer' : 'cursor-default opacity-70')
              }
            >
              <span className="text-gh-fg-muted">{tab.icon}</span>
              {tab.label}
              {tab.id === 'findings' && isDashboard && (
                <span className="gh-label border-gh-border bg-gh-subtle text-gh-fg-muted ml-1">
                  {findingsCount ?? 0}
                </span>
              )}
            </button>
          );
        })}

        <div className="ml-auto py-2 hidden md:flex items-center gap-2 text-xs text-gh-fg-muted">
          {target && view !== 'input' ? (
            <button onClick={onReset} className="gh-btn-default !h-7 !px-2.5 !text-xs">
              <Icon.X className="w-3.5 h-3.5" /> Close scan
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ErrorBanner({ message, onDismiss }) {
  return (
    <div className="mb-4 flex items-start gap-3 border border-gh-danger/40 bg-gh-danger/10 text-gh-fg px-3 py-2.5 rounded-md">
      <Icon.Alert className="w-4 h-4 mt-0.5 text-gh-danger flex-shrink-0" />
      <div className="flex-1 text-sm">{message}</div>
      <button onClick={onDismiss} className="text-gh-fg-muted hover:text-gh-fg">
        <Icon.X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';
  return (
    <button
      onClick={toggle}
      aria-label={label}
      title={label}
      className="gh-btn-default !h-7 !w-7 !px-0 relative overflow-hidden"
    >
      <span
        className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
        style={{ transform: isDark ? 'translateY(0)' : 'translateY(-120%)' }}
      >
        <Icon.Sun className="w-3.5 h-3.5 text-gh-attention" />
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
        style={{ transform: isDark ? 'translateY(120%)' : 'translateY(0)' }}
      >
        <Icon.Moon className="w-3.5 h-3.5 text-gh-cp-purple" />
      </span>
    </button>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gh-border mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 flex flex-wrap items-center justify-center gap-2 text-xs text-gh-fg-muted text-center">
        <div className="flex items-center gap-3">
          <BrandMark size={18} />
          <span>Compliance Ghost · powered by Bob semantic repo analysis</span>
        </div>
      </div>
    </footer>
  );
}
