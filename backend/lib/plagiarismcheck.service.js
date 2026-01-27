import axios from 'axios';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getClient() {
  const baseURL =
    process.env.PLAGIARISM_API_BASE || 'https://plagiarismcheck.org/api/v1';
  const token = process.env.PLAGIARISM_API_TOKEN;

  if (!token) {
    throw new Error('Missing PLAGIARISM_API_TOKEN in .env');
  }

  return axios.create({
    baseURL,
    headers: {
      'X-API-TOKEN': token, // docs zahtevaju X-API-TOKEN :contentReference[oaicite:1]{index=1}
    },
    timeout: 60_000,
  });
}

/**
 * 1) POST /text (language=en, text=...)
 * 2) poll GET /text/:id dok state ne bude CHECKED
 * 3) GET report
 */
export async function checkPlagiarismWithPlagiarismCheck(text) {
  const client = getClient();

  // 1) submit text
  const submitRes = await client.post(
    '/text',
    new URLSearchParams({
      language: 'en', // docs: trenutno samo en :contentReference[oaicite:2]{index=2}
      text,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );

  const textId = submitRes?.data?.data?.text?.id;
  if (!textId) {
    throw new Error('Plagiarism API: Missing text id in response');
  }

  // 2) poll status (state: 2/3 queued, 5 checked, 4 failed) :contentReference[oaicite:3]{index=3}
  let state = null;
  const maxTries = 20; // ~ 20 * 3s = 60s
  for (let i = 0; i < maxTries; i++) {
    const statusRes = await client.get(`/text/${textId}`);
    state = statusRes?.data?.data?.state ?? statusRes?.data?.data?.text?.state;

    if (state === 5) break; // checked
    if (state === 4)
      throw new Error('Plagiarism API: check failed (STATE_FAILED)');
    await sleep(3000);
  }

  if (state !== 5) {
    throw new Error('Plagiarism API: timeout waiting for report');
  }

  // 3) get report
  // Docs pominju "Get the Report" po text id-u; endpoint je u njihovom swagger-u,
  // ali najčešće je /report/:id ili /text/:id/report.
  // Najsigurnije: probaj oba, jer swagger može varirati po planu.
  let reportRes;
  try {
    reportRes = await client.get(`/report/${textId}`);
  } catch {
    reportRes = await client.get(`/text/${textId}/report`);
  }

  const report = reportRes?.data?.data ?? reportRes?.data;

  // Normalizacija (zavisi od formata report-a)
  // Njihov report sadrži nodes/sources i procente :contentReference[oaicite:4]{index=4}
  const similarityPercentage =
    Number(
      report?.general_percent ?? report?.percent ?? report?.similarity ?? 0,
    ) || 0;

  const sourcesRaw = report?.sources || report?.data?.sources || [];
  const sources = Array.isArray(sourcesRaw)
    ? sourcesRaw.map((s) => s?.url || s?.source || s).filter(Boolean)
    : [];

  const reportUrl = report?.report_url || report?.url || '';

  return { similarityPercentage, sources, reportUrl };
}
