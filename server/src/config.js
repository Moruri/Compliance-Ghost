import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bool = (v, fallback = false) => {
  if (v === undefined || v === null || v === '') return fallback;
  return /^(1|true|yes|on)$/i.test(String(v));
};

const num = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const config = {
  port: num(process.env.PORT, 4000),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  scanWorkspace: path.resolve(__dirname, '..', '.scans'),
  bob: {
    apiUrl: process.env.BOB_API_URL || '',
    apiKey: process.env.BOB_API_KEY || '',
    mock: bool(process.env.BOB_MOCK, !process.env.BOB_API_URL),
  },
  limits: {
    maxFiles: num(process.env.MAX_FILES, 400),
    maxBytes: num(process.env.MAX_BYTES, 2_000_000),
  },
};
