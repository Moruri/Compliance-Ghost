import { config } from '../config.js';
import { buildBobPrompt } from './prompt.js';
import { generateMockResult } from './mockData.js';

// BobClient is intentionally generic: it POSTs the prompt+files payload to a
// configurable HTTP endpoint and expects the structured JSON described in
// prompt.js. Swap BOB_API_URL when the real endpoint is available.
export class BobClient {
  constructor({ apiUrl, apiKey, mock } = {}) {
    this.apiUrl = apiUrl ?? config.bob.apiUrl;
    this.apiKey = apiKey ?? config.bob.apiKey;
    this.mock = mock ?? config.bob.mock;
  }

  async analyze({ files, regulations, onProgress }) {
    if (this.mock || !this.apiUrl) {
      return this.#mockAnalyze({ files, regulations, onProgress });
    }
    return this.#httpAnalyze({ files, regulations, onProgress });
  }

  async #httpAnalyze({ files, regulations, onProgress }) {
    const body = buildBobPrompt({ files, regulations });
    onProgress?.({ stage: 'bob.request', message: `Sending ${files.length} files to Bob…` });

    const headers = { 'content-type': 'application/json' };
    if (this.apiKey) headers.authorization = `Bearer ${this.apiKey}`;

    const res = await fetch(this.apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Bob endpoint returned ${res.status}: ${text.slice(0, 500)}`);
    }

    const raw = await res.text();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      // Be forgiving: Bob may wrap JSON in a chat-style response.
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Bob response was not JSON-parseable');
      parsed = JSON.parse(match[0]);
    }
    onProgress?.({ stage: 'bob.response', message: 'Bob returned a structured analysis.' });
    return parsed;
  }

  async #mockAnalyze({ files, regulations, onProgress }) {
    // Cheap, deterministic and tuned to recognise the bundled demo app.
    // We still report progress in a way that matches the real flow, so the
    // frontend animation looks identical in mock and real modes.
    const steps = [
      { stage: 'bob.indexing', message: `Bob is indexing ${files.length} files…`, delay: 600 },
      { stage: 'bob.identifying', message: 'Identifying personal data fields…', delay: 700 },
      { stage: 'bob.tracing', message: 'Tracing data flows across files…', delay: 900 },
      { stage: 'bob.matching', message: 'Matching flows against regulatory rules…', delay: 700 },
      { stage: 'bob.fixes', message: 'Generating remediation code…', delay: 500 },
    ];
    for (const s of steps) {
      onProgress?.({ stage: s.stage, message: s.message });
      await new Promise((r) => setTimeout(r, s.delay));
    }
    return generateMockResult({ files, regulations });
  }
}

export const bob = new BobClient();
