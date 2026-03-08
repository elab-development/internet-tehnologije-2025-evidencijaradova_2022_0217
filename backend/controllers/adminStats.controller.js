import { prisma } from '../prismaClient.js';

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d, days) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function formatYYYYMMDD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function bucketIndex(value, step, max) {
  if (!Number.isFinite(value)) return null;
  const v = Math.max(0, Math.min(max, value));
  return Math.min(Math.floor(v / step), Math.floor(max / step) - 1);
}

/**
 * ============================================
 * GET ADMIN STATS (DASHBOARD)
 * ============================================
 * Naziv: Get Admin Stats
 * Metoda: GET
 * Ruta: /api/admin/stats
 *
 * Opis:
 * Vraća KPI-je i podatke za chartove (admin-only):
 * - users: total + po rolama
 * - works: total + po statusima
 * - submissionsByDay (last 14d)
 * - worksBySubject (top 10)
 * - grades: avg + distribution (1-10)
 * - aiScores: avg + distribution (0-100, buckets of 10)
 * - plagiarism: avg + distribution (0-100, buckets of 10)
 */
export async function getAdminStats(req, res) {
  try {
    // period za line chart
    const DAYS = 14;
    const today = startOfDay(new Date());
    const from = addDays(today, -(DAYS - 1)); // uključivo

    const [
      usersTotal,
      usersByRole,
      worksTotal,
      worksByStatus,
      worksBySubject,
      worksInRange,
      gradesAgg,
      gradesRaw,
      aiRaw,
      plagiarismRaw,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.groupBy({
        by: ['role'],
        _count: { _all: true },
      }),

      prisma.work.count(),

      prisma.work.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),

      prisma.work.groupBy({
        by: ['subject'],
        _count: { subject: true },
        orderBy: { _count: { subject: 'desc' } },
        take: 10,
      }),

      prisma.work.findMany({
        where: { submittedAt: { gte: from, lt: addDays(today, 1) } },
        select: { submittedAt: true },
      }),

      prisma.grade.aggregate({
        _avg: { gradeValue: true },
        _count: { _all: true },
      }),

      prisma.grade.findMany({
        select: { gradeValue: true },
      }),

      prisma.aIReport.findMany({
        select: { aiScore: true, createdAt: true },
      }),

      prisma.plagiarismReport.findMany({
        select: { similarityPercentage: true, createdAt: true },
      }),
    ]);

    // usersByRole -> map
    const usersRoles = { student: 0, teacher: 0, admin: 0 };
    for (const r of usersByRole) {
      usersRoles[r.role] = r._count._all;
    }

    // worksByStatus -> map
    const worksStatuses = {
      pending_review: 0,
      in_review: 0,
      graded: 0,
      rejected: 0,
    };
    for (const s of worksByStatus) {
      worksStatuses[s.status] = s._count._all;
    }

    // submissionsByDay last 14d
    const countsByDay = new Map();
    for (let i = 0; i < DAYS; i++) {
      const d = addDays(from, i);
      countsByDay.set(formatYYYYMMDD(d), 0);
    }
    for (const w of worksInRange) {
      const key = formatYYYYMMDD(startOfDay(w.submittedAt));
      if (countsByDay.has(key)) countsByDay.set(key, countsByDay.get(key) + 1);
    }
    const submissionsByDay = Array.from(countsByDay.entries()).map(
      ([date, count]) => ({ date, count }),
    );

    // worksBySubject -> chart friendly
    const worksBySubjectChart = worksBySubject.map((x) => ({
      subject: x.subject,
      count: x._count.subject,
    }));

    // grades distribution 1-10
    const gradeDistribution = Array.from({ length: 10 }, (_, i) => ({
      grade: i + 1,
      count: 0,
    }));
    for (const g of gradesRaw) {
      const v = g.gradeValue;
      if (Number.isInteger(v) && v >= 1 && v <= 10) {
        gradeDistribution[v - 1].count += 1;
      }
    }

    const grades = {
      totalGradedWorks: gradesAgg._count._all,
      avgGrade: Number(gradesAgg._avg.gradeValue ?? 0),
      distribution: gradeDistribution,
    };

    // AI score avg + buckets (0-100 step 10)
    let aiSum = 0;
    let aiCount = 0;
    const aiBuckets = Array.from({ length: 10 }, (_, i) => ({
      range: `${i * 10}-${i * 10 + 9}`,
      count: 0,
    }));
    for (const r of aiRaw) {
      const v = Number(r.aiScore);
      if (!Number.isFinite(v)) continue;
      aiSum += v;
      aiCount += 1;
      const idx = bucketIndex(v, 10, 100);
      if (idx !== null) aiBuckets[idx].count += 1;
    }
    const ai = {
      totalAIReports: aiCount,
      avgAiScore: aiCount ? aiSum / aiCount : 0,
      distribution: aiBuckets,
    };

    // Plagiarism avg + buckets (0-100 step 10)
    let plSum = 0;
    let plCount = 0;
    const plBuckets = Array.from({ length: 10 }, (_, i) => ({
      range: `${i * 10}-${i * 10 + 9}`,
      count: 0,
    }));
    for (const r of plagiarismRaw) {
      const v = Number(r.similarityPercentage);
      if (!Number.isFinite(v)) continue;
      plSum += v;
      plCount += 1;
      const idx = bucketIndex(v, 10, 100);
      if (idx !== null) plBuckets[idx].count += 1;
    }
    const plagiarism = {
      totalPlagiarismReports: plCount,
      avgSimilarity: plCount ? plSum / plCount : 0,
      distribution: plBuckets,
    };

    return res.json({
      kpis: {
        usersTotal,
        worksTotal,
        usersByRole: usersRoles,
        worksByStatus: worksStatuses,
      },
      charts: {
        submissionsByDay,
        worksBySubject: worksBySubjectChart,
        gradeDistribution: grades.distribution,
        aiScoreDistribution: ai.distribution,
        plagiarismDistribution: plagiarism.distribution,
      },
      aggregates: {
        grades,
        ai,
        plagiarism,
      },
      range: {
        from: from.toISOString(),
        to: addDays(today, 1).toISOString(),
        days: DAYS,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Server error' });
  }
}