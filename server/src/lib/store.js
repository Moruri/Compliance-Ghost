// In-memory store for scans. Proof-of-concept only — single-process, no persistence.
// Each scan is keyed by id and holds status, progress events and final results.

const scans = new Map();

export function createScan({ id, repoUrl, regulations }) {
  const scan = {
    id,
    repoUrl,
    regulations,
    status: 'pending', // pending | running | done | error
    createdAt: Date.now(),
    finishedAt: null,
    events: [],
    listeners: new Set(),
    result: null,
    error: null,
  };
  scans.set(id, scan);
  return scan;
}

export function getScan(id) {
  return scans.get(id);
}

export function pushEvent(id, event) {
  const scan = scans.get(id);
  if (!scan) return;
  const payload = { ...event, ts: Date.now() };
  scan.events.push(payload);
  for (const listener of scan.listeners) {
    try {
      listener(payload);
    } catch {
      /* listener died; ignore */
    }
  }
}

export function subscribe(id, listener) {
  const scan = scans.get(id);
  if (!scan) return () => {};
  // Replay buffered events so a late-joining client doesn't miss anything.
  for (const e of scan.events) listener(e);
  scan.listeners.add(listener);
  return () => scan.listeners.delete(listener);
}

export function setResult(id, result) {
  const scan = scans.get(id);
  if (!scan) return;
  scan.result = result;
  scan.status = 'done';
  scan.finishedAt = Date.now();
}

export function setError(id, error) {
  const scan = scans.get(id);
  if (!scan) return;
  scan.error = error;
  scan.status = 'error';
  scan.finishedAt = Date.now();
}

export function setStatus(id, status) {
  const scan = scans.get(id);
  if (!scan) return;
  scan.status = status;
}
