import axios from 'axios';
import * as pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import path from 'path';

function getExtFromUrl(url) {
  try {
    const clean = url.split('?')[0];
    return path.extname(clean).toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Skine fajl sa URL-a i vrati Buffer
 */
async function downloadFileAsBuffer(url) {
  const resp = await axios.get(url, { responseType: 'arraybuffer' });
  const contentType = resp.headers?.['content-type'] || '';
  const buffer = Buffer.from(resp.data);
  return { buffer, contentType };
}

/**
 * Ekstrakcija teksta iz fajla (txt/pdf/docx).
 */
export async function extractTextFromWorkFile(fileUrl) {
  const { buffer, contentType } = await downloadFileAsBuffer(fileUrl);

  const ext = getExtFromUrl(fileUrl);

  // TXT
  if (ext === '.txt' || contentType.includes('text/plain')) {
    return buffer.toString('utf-8');
  }

  // PDF
  if (ext === '.pdf' || contentType.includes('application/pdf')) {
    const parsed = await pdfParse(buffer);
    return (parsed.text || '').trim();
  }

  // DOCX
  if (
    ext === '.docx' ||
    contentType.includes(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
  ) {
    const res = await mammoth.extractRawText({ buffer });
    return (res.value || '').trim();
  }

  // DOC
  if (ext === '.doc' || contentType.includes('application/msword')) {
    throw new Error(
      'Unsupported file type for text extraction (.doc). Use .docx or .pdf or .txt',
    );
  }

  throw new Error(
    `Unsupported file type for text extraction (${ext || contentType || 'unknown'})`,
  );
}
