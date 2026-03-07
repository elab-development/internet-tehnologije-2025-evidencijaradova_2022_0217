import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const CORPUS_DIR = path.join(ROOT, 'plagiarism_corpus');
const DOCS_DIR = path.join(CORPUS_DIR, 'documents');
const SOURCES_PATH = path.join(CORPUS_DIR, 'sources.json');

function normalizeText(input) {
  return String(input || '')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripWikipediaHtml(html) {
  // - izbaci script/style/nav/footer
  // - izbaci sve tagove
  // - dekoduje par osnovnih entiteta
  let s = String(html || '');

  s = s.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  s = s.replace(/<nav[\s\S]*?<\/nav>/gi, ' ');
  s = s.replace(/<footer[\s\S]*?<\/footer>/gi, ' ');
  s = s.replace(/<header[\s\S]*?<\/header>/gi, ' ');

  // makni tabele, infobox, reference sekcije često su šum
  s = s.replace(/<table[\s\S]*?<\/table>/gi, ' ');
  s = s.replace(/<sup[\s\S]*?<\/sup>/gi, ' ');

  // skini sve HTML tagove
  s = s.replace(/<\/?[^>]+>/g, ' ');

  // osnovni HTML entiteti
  s = s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // očisti whitespace
  s = s.replace(/\s+/g, ' ').trim();

  // da bude čitljivije, ubaci “pasuse” po tačkama (opciono)
  s = s.replace(/\. /g, '.\n');

  return s;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'LocalPlagiarismChecker/1.0 (educational project; contact: example@example.com)',
    },
  });
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} for ${url}`);
  }
  return await res.text();
}

async function main() {
  await fs.mkdir(DOCS_DIR, { recursive: true });

  const sourcesRaw = await fs.readFile(SOURCES_PATH, 'utf8');
  const { sources } = JSON.parse(sourcesRaw);

  if (!Array.isArray(sources) || sources.length === 0) {
    throw new Error('sources.json must contain { "sources": [ ... ] }');
  }

  let ok = 0;
  let fail = 0;

  for (const src of sources) {
    const id = src?.id;
    const url = src?.url;
    const type = src?.type || 'text';

    if (!id || !url) {
      console.log('Skipping invalid source:', src);
      fail++;
      continue;
    }

    const outPath = path.join(DOCS_DIR, `${id}.txt`);

    try {
      console.log(`Downloading: ${id} (${type})`);
      const raw = await fetchText(url);

      let text = raw;
      if (type === 'wikipedia') {
        text = stripWikipediaHtml(raw);
      } else {
        text = normalizeText(raw);
      }

      // minimalna zaštita da ne snimi “prazno”
      if (!text || text.length < 500) {
        throw new Error('Extracted text too short');
      }

      await fs.writeFile(outPath, text, 'utf8');
      ok++;
      console.log(
        `Saved -> ${path.relative(ROOT, outPath)} (${text.length} chars)`,
      );
    } catch (e) {
      fail++;
      console.log(`FAILED: ${id} -> ${e.message}`);
    }
  }

  console.log(`\nDone. OK=${ok}, FAIL=${fail}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});