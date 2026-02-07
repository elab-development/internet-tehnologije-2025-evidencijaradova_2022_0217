import { prisma } from '../prismaClient.js';
import { extractTextFromWorkFile } from '../lib/extractText.js';
import { generateAIReportFromText } from '../lib/aiReport.service.js';

/**
 * ============================================
 * CREATE AI REPORT
 * ============================================
 * Naziv: Create AI Report
 * Metoda: POST
 * Ruta: /api/ai-reports
 *
 * Opis:
 * Teacher pokreće AI analizu rada (fileUrl -> text -> AI service).
 * Upisuje jedan AIReport po Work-u.
 *
 * Telo zahteva:
 * - workId (string)
 *
 * Odgovor:
 * - 201 Created + { report }
 * - 409 Conflict ako već postoji
 */
export async function createAIReport(req, res) {
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

    const existing = await prisma.aIReport.findUnique({ where: { workId } });
    if (existing) {
      return res.status(409).json({ message: 'AI report already exists' });
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

    if (!text || text.trim().length < 80) {
      return res.status(400).json({ message: 'Not enough text to analyze' });
    }

    let ai;
    try {
      ai = await generateAIReportFromText(text);
    } catch (e) {
      const msg = e?.response?.data?.error?.message || e?.message || '';
      console.log(e);
      ai = {
        aiScore: 0,
        summary: '',
        reccomendations: '',
        warning: `AI service unavailable: ${msg}`,
      };
    }

    const report = await prisma.aIReport.create({
      data: {
        workId,
        aiScore: ai.aiScore,
        summary: ai.summary || null,
        reccomendations: ai.reccomendations || null,
      },
    });

    return res.status(201).json({
      report,
      warning: ai.warning ?? null,
    });
  } catch (err) {
    if (err?.code === 'P2002') {
      return res.status(409).json({ message: 'AI report already exists' });
    }
    console.log(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * ============================================
 * GET AI REPORT BY WORK ID
 * ============================================
 * Naziv: Get AI Report By Work
 * Metoda: GET
 * Ruta: /api/ai-reports/by-work/:workId
 *
 * Opis:
 * Vraća AI report za prosleđeni workId.
 *
 * Pravila pristupa:
 * - student: samo za svoj work
 * - teacher/admin: za sve
 *
 * Odgovor:
 * - 200 OK + { report }
 */
export async function getAIReportByWorkId(req, res) {
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

    const report = await prisma.aIReport.findUnique({
      where: { workId },
    });

    return res.json({ report });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}