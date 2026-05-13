import { Router } from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import { nanoid } from 'nanoid';
import { config } from '../config.js';
import {
  parseRepoInput,
  cloneRepo,
  cleanupRepo,
  collectSourceFiles,
} from '../lib/repo.js';
import {
  createScan,
  getScan,
  pushEvent,
  subscribe,
  setResult,
  setError,
  setStatus,
} from '../lib/store.js';
import { bob } from '../lib/bobClient.js';

const ALLOWED_REGULATIONS = ['GDPR', 'HIPAA', 'PCI-DSS'];

export const scanRouter = Router();

scanRouter.post('/scan', async (req, res) => {
  const { repoUrl, regulations } = req.body ?? {};
  const parsed = parseRepoInput(repoUrl);
  if (!parsed) {
    return res.status(400).json({ error: 'Provide a GitHub URL (https://github.com/owner/repo) or use "demo" to scan the bundled sample app.' });
  }
  const regs = Array.isArray(regulations) && regulations.length
    ? regulations.filter((r) => ALLOWED_REGULATIONS.includes(r))
    : ALLOWED_REGULATIONS;
  if (regs.length === 0) {
    return res.status(400).json({ error: 'Select at least one supported regulation.' });
  }

  const id = nanoid(10);
  createScan({ id, repoUrl: parsed.cloneUrl ?? parsed.label, regulations: regs });

  runScan(id, parsed, regs).catch((err) => {
    pushEvent(id, { stage: 'error', message: err.message ?? String(err) });
    setError(id, err.message ?? String(err));
  });

  res.json({ id, target: parsed.label, kind: parsed.kind, regulations: regs });
});

scanRouter.get('/scan/:id', (req, res) => {
  const scan = getScan(req.params.id);
  if (!scan) return res.status(404).json({ error: 'Scan not found.' });
  res.json({
    id: scan.id,
    repoUrl: scan.repoUrl,
    regulations: scan.regulations,
    status: scan.status,
    createdAt: scan.createdAt,
    finishedAt: scan.finishedAt,
    result: scan.result,
    error: scan.error,
  });
});

scanRouter.get('/scan/:id/events', (req, res) => {
  const scan = getScan(req.params.id);
  if (!scan) return res.status(404).end();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const send = (event) => {
    res.write(`event: ${event.stage}\n`);
    res.write(`data: ${JSON.stringify(event)}\n\n`);
    if (event.stage === 'done' || event.stage === 'error') {
      res.end();
    }
  };

  const unsubscribe = subscribe(scan.id, send);
  req.on('close', () => unsubscribe());
});

async function runScan(id, parsed, regulations) {
  setStatus(id, 'running');

  let repoDir;
  let isLocal = false;
  if (parsed.kind === 'local') {
    isLocal = true;
    const projectRoot = path.resolve(process.cwd(), '..');
    const candidate = path.resolve(projectRoot, parsed.localPath);
    try {
      const stat = await fs.stat(candidate);
      if (!stat.isDirectory()) throw new Error('not a directory');
      repoDir = candidate;
    } catch {
      // Fallback: walk up looking for the directory (useful when the server
      // is started from the repo root rather than server/).
      const alt = path.resolve(process.cwd(), parsed.localPath);
      try {
        await fs.stat(alt);
        repoDir = alt;
      } catch {
        throw new Error(`Local path "${parsed.localPath}" was not found.`);
      }
    }
    pushEvent(id, { stage: 'clone', message: `Reading bundled sample (${parsed.label})…` });
  } else {
    pushEvent(id, { stage: 'clone', message: `Cloning ${parsed.owner}/${parsed.repo}…` });
    try {
      repoDir = await cloneRepo({
        cloneUrl: parsed.cloneUrl,
        workspace: config.scanWorkspace,
        scanId: id,
      });
    } catch (err) {
      throw new Error(`Failed to clone repository: ${err.message ?? err}`);
    }
  }

  pushEvent(id, { stage: 'parse', message: 'Reading source files…' });
  const { files, totalBytes, truncated } = await collectSourceFiles(repoDir, config.limits);
  pushEvent(id, {
    stage: 'parse.done',
    message: `${files.length} file(s) parsed (${(totalBytes / 1024).toFixed(1)} KB)${truncated ? ' — truncated to fit limits' : ''}.`,
    files: files.length,
    bytes: totalBytes,
    truncated,
  });

  if (files.length === 0) {
    if (!isLocal) await cleanupRepo(repoDir);
    throw new Error('No source files were found in the repository.');
  }

  const result = await bob.analyze({
    files,
    regulations,
    onProgress: (event) => pushEvent(id, event),
  });

  setResult(id, { ...result, _meta: { regulations, filesAnalyzed: files.length, truncated, target: parsed.label } });
  pushEvent(id, { stage: 'done', message: 'Scan complete.' });

  // Never delete the local sample-app from disk.
  if (!isLocal) await cleanupRepo(repoDir);
}
