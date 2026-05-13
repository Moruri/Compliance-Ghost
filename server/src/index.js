import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { ensureSync } from './lib/repo.js';
import { scanRouter } from './routes/scan.js';

ensureSync(config.scanWorkspace);

const app = express();
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    bob: {
      mode: config.bob.mock ? 'mock' : 'http',
      hasUrl: Boolean(config.bob.apiUrl),
    },
  });
});

app.use('/api', scanRouter);

app.use((err, _req, res, _next) => {
  console.error('[server] unhandled error:', err);
  res.status(500).json({ error: err.message ?? 'Internal Server Error' });
});

app.listen(config.port, () => {
  console.log(`\nCompliance Ghost server listening on http://localhost:${config.port}`);
  console.log(`Bob mode: ${config.bob.mock ? 'MOCK (no live LLM call)' : `HTTP → ${config.bob.apiUrl}`}\n`);
});
