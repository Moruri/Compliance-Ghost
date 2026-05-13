// Thin API client. Backend is mounted under /api via the Vite proxy in dev.

export async function startScan({ repoUrl, regulations }) {
  const res = await fetch('/api/scan', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ repoUrl, regulations }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Scan failed to start (${res.status})`);
  }
  return res.json();
}

export async function fetchScan(id) {
  const res = await fetch(`/api/scan/${id}`);
  if (!res.ok) throw new Error('Scan not found');
  return res.json();
}

export function streamScanEvents(id, { onEvent, onError, onClose } = {}) {
  const source = new EventSource(`/api/scan/${id}/events`);
  const stages = [
    'clone', 'parse', 'parse.done',
    'bob.indexing', 'bob.identifying', 'bob.tracing', 'bob.matching', 'bob.fixes',
    'bob.request', 'bob.response',
    'done', 'error',
  ];
  for (const stage of stages) {
    source.addEventListener(stage, (e) => {
      try {
        const data = JSON.parse(e.data);
        onEvent?.(data);
      } catch (err) {
        onError?.(err);
      }
    });
  }
  source.onerror = (err) => {
    onError?.(err);
    source.close();
    onClose?.();
  };
  return () => source.close();
}
