import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const CORPUS_DIR = process.env.PLAGIARISM_CORPUS_DIR
  ? path.resolve(process.env.PLAGIARISM_CORPUS_DIR)
  : path.join(ROOT, 'plagiarism_corpus');

const DOCS_DIR = path.join(CORPUS_DIR, 'documents');
const SOURCES_PATH = path.join(CORPUS_DIR, 'sources.json');

function normalizeText(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  const t = normalizeText(text);
  if (!t) return [];
  return t.split(' ').filter(Boolean);
}

// FNV-1a 32-bit hash
function fnv1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function shinglesHashSet(text, n = 5, cap = 50_000) {
  const words = tokenize(text);
  const set = new Set();
  if (words.length < n) return set;

  for (let i = 0; i <= words.length - n; i++) {
    const shingle = words.slice(i, i + n).join(' ');
    set.add(fnv1a(shingle));
    if (set.size >= cap) break;
  }
  return set;
}

function jaccardSimilarity(setA, setB) {
  if (!setA.size || !setB.size) return 0;
  const [small, big] = setA.size < setB.size ? [setA, setB] : [setB, setA];
  let intersection = 0;
  for (const v of small) if (big.has(v)) intersection++;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

async function loadSourcesMeta() {
  try {
    const raw = await fs.readFile(SOURCES_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed?.sources) ? parsed.sources : [];

    // map id -> {title,url}
    const map = new Map();
    for (const s of list) {
      if (s?.id) map.set(s.id, { title: s?.title || s.id, url: s?.url || '' });
    }
    return map;
  } catch {
    return new Map();
  }
}

async function listDocFiles() {
  const entries = await fs.readdir(DOCS_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.txt'))
    .map((e) => e.name);
}

/**
 * Lokalna provera plagijata nad corpus-om.
 *
 * Env:
 * - PLAGIARISM_SHINGLE_N (default 5)
 * - PLAGIARISM_TOP_K (default 5)
 */
export async function checkPlagiarismWithPlagiarismCheck(text) {
  const shingleN = Number(process.env.PLAGIARISM_SHINGLE_N || 5);
  const topK = Number(process.env.PLAGIARISM_TOP_K || 5);

  const workSet = shinglesHashSet(text, shingleN);
  if (workSet.size < 30) {
    return { similarityPercentage: 0, sources: [], reportUrl: '' };
  }

  // učitaj corpus fajlove
  let files;
  try {
    files = await listDocFiles();
  } catch {
    throw new Error(
      `Corpus not built. Run: npm run build:corpus (missing folder ${path.relative(
        ROOT,
        DOCS_DIR,
      )})`,
    );
  }

  if (!files.length) {
    return { similarityPercentage: 0, sources: [], reportUrl: '' };
  }

  const metaMap = await loadSourcesMeta();

  const scored = [];
  for (const file of files) {
    const id = file.replace(/\.txt$/i, '');
    const fullPath = path.join(DOCS_DIR, file);

    let sourceText = '';
    try {
      sourceText = await fs.readFile(fullPath, 'utf8');
    } catch {
      continue;
    }

    const sourceSet = shinglesHashSet(sourceText, shingleN);
    const sim = jaccardSimilarity(workSet, sourceSet);

    if (sim > 0) {
      const meta = metaMap.get(id) || { title: id, url: '' };
      scored.push({
        id,
        similarity: sim,
        label: meta.url || meta.title || id,
      });
    }
  }

  scored.sort((a, b) => b.similarity - a.similarity);

  const top = scored.slice(0, topK);
  const maxSim = top.length ? top[0].similarity : 0;

  const similarityPercentage = Math.round(maxSim * 10000) / 100;
  const sources = top.map((x) => x.label);

  const reportUrl = '';

  return { similarityPercentage, sources, reportUrl };
}