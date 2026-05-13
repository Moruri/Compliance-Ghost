import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cg.theme';

const ThemeContext = createContext({
  theme: 'dark',
  toggle: () => {},
  setTheme: () => {},
});

function readInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  // The pre-paint script in index.html has already set `.dark` on <html>
  // based on the stored value; mirror that as our initial state to avoid
  // a mismatch on first render.
  if (document.documentElement.classList.contains('dark')) return 'dark';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0d1117' : '#ffffff');
  }, [theme]);

  const toggle = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    [],
  );

  const value = useMemo(() => ({ theme, toggle, setTheme }), [theme, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Resolve a Primer color token (e.g. `border-muted`, `accent`) to a concrete
 * `rgb(...)` string for the current theme. Useful for SVG / Canvas / React Flow
 * props where CSS variables don't apply.
 */
export function useTokenColor(token) {
  const { theme } = useTheme();
  return useMemo(() => {
    if (typeof window === 'undefined') return '#000';
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue(`--gh-${token}`)
      .trim();
    return v ? `rgb(${v})` : '#000';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, token]);
}
