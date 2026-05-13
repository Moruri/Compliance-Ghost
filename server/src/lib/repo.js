import fs from 'node:fs/promises';
import fssync from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { simpleGit } from 'simple-git';

// File extensions we consider "source code" worth handing to Bob.
const SOURCE_EXTS = new Set([
  '.js', '.jsx', '.mjs', '.cjs',
  '.ts', '.tsx',
  '.py', '.rb', '.go', '.rs', '.java', '.kt', '.swift',
  '.php', '.cs', '.scala', '.sql',
  '.json', '.yml', '.yaml', '.env.example',
]);

// Directories we never want to read.
const SKIP_DIRS = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', 'out', 'coverage',
  '.cache', '.turbo', '.vercel', '.pnpm-store', 'venv', '__pycache__',
  'vendor', '.gradle', '.idea', '.vscode',
]);

// Treat anything larger than this as not-really-source (minified bundles etc).
const PER_FILE_BYTE_LIMIT = 200_000;

// Anything a human is likely to paste into "Ask Bob" should resolve to a
// GitHub repo. Accepted forms:
//   demo | sample | local:<path>                       → bundled sample app
//   https://github.com/owner/repo                      → canonical
//   http://github.com/owner/repo/tree/main/foo         → strip path tail
//   github.com/owner/repo, www.github.com/owner/repo   → no protocol
//   git@github.com:owner/repo(.git)                    → SSH
//   owner/repo                                         → shorthand
// Whitespace, trailing slashes, .git suffixes, ?query and #hash are stripped.
export function parseRepoInput(rawUrl) {
  if (typeof rawUrl !== 'string') return null;
  // Collapse any whitespace (incl. newlines from paste) into a single space.
  let s = rawUrl
    .replace(/[​-‍﻿]/g, '') // zero-width chars from copy-paste
    .replace(/\s+/g, ' ')
    .trim();
  if (!s) return null;

  // If the user pasted with surrounding text, take the longest URL-ish token.
  if (s.includes(' ')) {
    const tokens = s.split(' ');
    const urlLike = tokens.find((t) => /github\.com|^[\w.-]+\/[\w.-]+$/i.test(t));
    if (urlLike) s = urlLike;
  }

  // Bundled demo / local paths
  if (/^(demo|sample|local:sample-app|local:\.?\/?sample-app\/?)$/i.test(s)) {
    return { kind: 'local', label: 'sample-app', localPath: 'sample-app' };
  }
  const localMatch = s.match(/^local:(.+)$/i);
  if (localMatch) {
    return { kind: 'local', label: localMatch[1], localPath: localMatch[1] };
  }

  // SSH form: git@github.com:owner/repo[.git]
  const sshMatch = s.match(/^git@github\.com:([^/\s]+)\/([^/\s]+?)(?:\.git)?$/i);
  if (sshMatch) return makeGithub(sshMatch[1], sshMatch[2]);

  // Strip protocol, www, query, hash, .git suffix, trailing slash.
  let path = s
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '');
  path = path.split('?')[0].split('#')[0];
  path = path.replace(/\.git$/i, '').replace(/\/+$/, '');

  // github.com/owner/repo[/anything else]  → pick first two segments
  const ghMatch = path.match(/^github\.com\/([^/\s]+)\/([^/\s]+)/i);
  if (ghMatch) return makeGithub(ghMatch[1], ghMatch[2]);

  // Plain "owner/repo" shorthand (no host)
  const shortMatch = path.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (shortMatch) return makeGithub(shortMatch[1], shortMatch[2]);

  return null;
}

function makeGithub(owner, repo) {
  const cleanRepo = repo.replace(/\.git$/i, '');
  return {
    kind: 'github',
    owner,
    repo: cleanRepo,
    label: `${owner}/${cleanRepo}`,
    cloneUrl: `https://github.com/${owner}/${cleanRepo}.git`,
  };
}

// Back-compat alias for older imports.
export const parseGitHubUrl = parseRepoInput;

export async function cloneRepo({ cloneUrl, workspace, scanId }) {
  await fs.mkdir(workspace, { recursive: true });
  const dest = path.join(workspace, scanId);
  // Defensive: nuke any pre-existing dir with the same id.
  await fs.rm(dest, { recursive: true, force: true });
  const git = simpleGit();
  await git.clone(cloneUrl, dest, ['--depth', '1', '--single-branch']);
  return dest;
}

export async function cleanupRepo(dir) {
  if (!dir) return;
  await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
}

export async function collectSourceFiles(rootDir, { maxFiles, maxBytes }) {
  const files = [];
  let totalBytes = 0;
  let truncated = false;

  async function walk(dir) {
    if (truncated) return;
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (truncated) return;
      if (entry.name.startsWith('.') && entry.name !== '.env.example') {
        // Skip hidden dotfiles & dotdirs except .env.example (a useful compliance signal).
        if (entry.isDirectory()) continue;
      }
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        await walk(full);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const isSource = SOURCE_EXTS.has(ext) || entry.name === 'Dockerfile' || entry.name === '.env.example';
        if (!isSource) continue;
        let stat;
        try {
          stat = await fs.stat(full);
        } catch {
          continue;
        }
        if (stat.size > PER_FILE_BYTE_LIMIT) continue;
        if (files.length >= maxFiles || totalBytes + stat.size > maxBytes) {
          truncated = true;
          return;
        }
        let content;
        try {
          content = await fs.readFile(full, 'utf8');
        } catch {
          continue;
        }
        const relPath = path.relative(rootDir, full).split(path.sep).join('/');
        files.push({ path: relPath, content, bytes: stat.size });
        totalBytes += stat.size;
      }
    }
  }

  await walk(rootDir);
  return { files, totalBytes, truncated };
}

export function defaultWorkspace() {
  return path.join(os.tmpdir(), 'compliance-ghost-scans');
}

export function ensureSync(dir) {
  if (!fssync.existsSync(dir)) fssync.mkdirSync(dir, { recursive: true });
}
