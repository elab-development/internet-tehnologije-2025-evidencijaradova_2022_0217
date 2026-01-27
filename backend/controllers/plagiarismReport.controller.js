import { prisma } from '../prismaClient.js';
import { extractTextFromWorkFile } from '../lib/extractText.js';
import { checkPlagiarismWithPlagiarismCheck } from '../lib/plagiarismcheck.service.js';

/**
 * ============================================
 * CREATE PLAGIARISM REPORT
 * ============================================
 * Naziv: Create Plagiarism Report
 * Metoda: POST
 * Ruta: /api/plagiarism-reports
 *
 * Opis:
 * Teacher pokreće proveru plagijarizma za određeni Work.
 * Sistem:
 * 1) učita Work (uzima fileUrl)
 * 2) preuzme fajl i izvuče tekst (pdf/docx/txt)
 * 3) pozove eksterni servis
 * 4) sačuva rezultat u PlagiarismReport
 *
 * Telo zahteva (req.body):
 * - workId (string)
 *
 * Odgovor:
 * - 201 Created + { report }
 * - 409 Conflict ako report već postoji
 */
export async function createPlagiarismReport(req, res) {
  try {
    const { workId } = req.body;

    if (!workId) {
      return res.status(400).json({ message: 'workId is required' });
    }

    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: { id: true, fileUrl: true },
    });

    if (!work) return res.status(404).json({ message: 'Work not found' });

    const existing = await prisma.plagiarismReport.findUnique({
      where: { workId },
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: 'Plagiarism report already exists' });
    }

    let text;
    try {
      text = await extractTextFromWorkFile(work.fileUrl);
    } catch (e) {
      return res.status(400).json({
        message: 'Failed to extract text from file',
        detail: e?.message || 'Unknown extraction error',
      });
    }

    if (!text || text.trim().length < 20) {
      return res.status(400).json({
        message: 'Not enough text to check plagiarism',
      });
    }

    const result = await checkPlagiarismWithPlagiarismCheck(text);
    const similarity = Number(
      result.similarityPercentage ?? result.similarity ?? 0,
    );
    const sources = Array.isArray(result.sources) ? result.sources : [];
    const reportUrl = String(result.reportUrl ?? result.report_url ?? '');

    const report = await prisma.plagiarismReport.create({
      data: {
        workId,
        similarityPercentage: similarity,
        sources,
        reportUrl,
      },
    });

    return res.status(201).json({ report });
  } catch (err) {
    if (err?.code === 'P2002') {
      return res
        .status(409)
        .json({ message: 'Plagiarism report already exists' });
    }
    console.log(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * ============================================
 * GET PLAGIARISM REPORT BY WORK ID
 * ============================================
 * Naziv: Get Plagiarism Report By Work
 * Metoda: GET
 * Ruta: /api/plagiarism-reports/by-work/:workId
 *
 * Opis:
 * Vraća plagiarism report za prosleđeni workId.
 *
 * Pravila pristupa:
 * - student: može da vidi report samo za svoj Work
 * - teacher/admin: mogu da vide za sve Work-ove
 *
 * Odgovor:
 * - 200 OK + { report }
 */
export async function getPlagiarismReportByWorkId(req, res) {
  try {
    const { workId } = req.params;

    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: { id: true, studentId: true },
    });

    if (!work) return res.status(404).json({ message: 'Work not found' });

    if (req.user.role === 'student' && work.studentId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const report = await prisma.plagiarismReport.findUnique({
      where: { workId },
    });

    return res.json({ report });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}
