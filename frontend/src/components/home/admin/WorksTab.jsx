import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2,
  RefreshCw,
  X,
  FileText,
  Clock,
  ShieldAlert,
  Bot,
  GraduationCap,
  Link as LinkIcon,
} from 'lucide-react';

import { useWorksStore } from '../../../stores/worksStore';
import { useGradesStore } from '../../../stores/gradesStore';
import { usePlagiarismReportsStore } from '../../../stores/plagiarismReportStore';
import { useAIReportsStore } from '../../../stores/aiReportsStore';

import { formatDate, pct, statusPill } from '../../../utils/helpers';

export default function WorksTab() {
  const works = useWorksStore((s) => s.works);
  const isLoadingWorks = useWorksStore((s) => s.isLoading);
  const errorWorks = useWorksStore((s) => s.error);
  const successWorks = useWorksStore((s) => s.success);
  const clearWorksMessages = useWorksStore((s) => s.clearMessages);
  const fetchWorks = useWorksStore((s) => s.fetchWorks);

  const fetchGradeByWorkId = useGradesStore((s) => s.fetchGradeByWorkId);
  const fetchPlagiarismByWorkId = usePlagiarismReportsStore(
    (s) => s.fetchByWorkId,
  );
  const fetchAIByWorkId = useAIReportsStore((s) => s.fetchByWorkId);

  const [extra, setExtra] = useState(() => ({
    gradeByWorkId: {},
    plagiarismByWorkId: {},
    aiByWorkId: {},
    loadingByWorkId: {},
  }));

  useEffect(() => {
    fetchWorks();
  }, []);

  const orderedWorks = useMemo(() => {
    return [...works].sort((a, b) => {
      const da = new Date(a.submittedAt || a.createdAt || 0).getTime();
      const db = new Date(b.submittedAt || b.createdAt || 0).getTime();
      return db - da;
    });
  }, [works]);

  useEffect(() => {
    if (!orderedWorks.length) return;

    const firstBatch = orderedWorks.slice(0, 40);
    firstBatch.forEach((w) => {
      const workId = w.id;

      const already =
        extra.loadingByWorkId[workId] ||
        extra.gradeByWorkId[workId] !== undefined ||
        extra.plagiarismByWorkId[workId] !== undefined ||
        extra.aiByWorkId[workId] !== undefined;

      if (already) return;

      setExtra((prev) => ({
        ...prev,
        loadingByWorkId: { ...prev.loadingByWorkId, [workId]: true },
      }));

      Promise.all([
        fetchGradeByWorkId(workId),
        fetchPlagiarismByWorkId(workId),
        fetchAIByWorkId(workId),
      ])
        .then(([grade, plag, ai]) => {
          setExtra((prev) => ({
            gradeByWorkId: { ...prev.gradeByWorkId, [workId]: grade },
            plagiarismByWorkId: { ...prev.plagiarismByWorkId, [workId]: plag },
            aiByWorkId: { ...prev.aiByWorkId, [workId]: ai },
            loadingByWorkId: { ...prev.loadingByWorkId, [workId]: false },
          }));
        })
        .catch(() => {
          setExtra((prev) => ({
            gradeByWorkId: { ...prev.gradeByWorkId, [workId]: null },
            plagiarismByWorkId: { ...prev.plagiarismByWorkId, [workId]: null },
            aiByWorkId: { ...prev.aiByWorkId, [workId]: null },
            loadingByWorkId: { ...prev.loadingByWorkId, [workId]: false },
          }));
        });
    });
  }, [orderedWorks]);

  function renderStatus(status) {
    const { label, cls, Icon } = statusPill(status);
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ring-1 ${cls}`}
      >
        <Icon size={14} />
        {label}
      </span>
    );
  }

  return (
    <div className='rounded-2xl bg-white p-6 shadow-md'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h3 className='text-lg font-semibold text-blue-950'>Works</h3>
          <p className='mt-1 text-sm text-slate-600'>
            Overview of all works, grades, and reports.
          </p>
        </div>

        <button
          type='button'
          onClick={() => {
            clearWorksMessages();
            fetchWorks();
            setExtra({
              gradeByWorkId: {},
              plagiarismByWorkId: {},
              aiByWorkId: {},
              loadingByWorkId: {},
            });
          }}
          className='inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm ring-1 ring-blue-100 hover:bg-blue-50'
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {(errorWorks || successWorks) && (
        <div className='mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-blue-50'>
          <div className='flex items-start justify-between gap-3'>
            <div className='text-sm'>
              {errorWorks ? (
                <p className='text-rose-600'>{errorWorks}</p>
              ) : (
                <p className='text-emerald-700'>{successWorks}</p>
              )}
            </div>
            <button
              onClick={clearWorksMessages}
              className='rounded-lg p-2 text-slate-500 hover:bg-slate-100'
              aria-label='Close'
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className='mt-5'>
        {isLoadingWorks && works.length === 0 ? (
          <div className='rounded-2xl bg-white p-6 shadow-sm ring-1 ring-blue-50'>
            <div className='flex items-center gap-2 text-blue-700'>
              <Loader2 className='animate-spin' size={18} />
              <span className='text-sm font-medium'>Loading works...</span>
            </div>
          </div>
        ) : orderedWorks.length === 0 ? (
          <div className='rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-blue-50'>
            <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100'>
              <FileText size={22} />
            </div>
            <h3 className='mt-4 text-lg font-semibold text-blue-950'>
              No works found
            </h3>
            <p className='mt-1 text-slate-600'>
              Students haven’t uploaded anything yet.
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto rounded-2xl ring-1 ring-slate-200'>
            <table className='w-full min-w-[1100px] text-left text-sm'>
              <thead className='bg-blue-50'>
                <tr className='text-slate-700'>
                  <th className='px-4 py-3 font-semibold'>Work</th>
                  <th className='px-4 py-3 font-semibold'>Student</th>
                  <th className='px-4 py-3 font-semibold'>Status</th>
                  <th className='px-4 py-3 font-semibold'>Submitted</th>
                  <th className='px-4 py-3 font-semibold'>Grade</th>
                  <th className='px-4 py-3 font-semibold'>Plagiarism</th>
                  <th className='px-4 py-3 font-semibold'>AI</th>
                </tr>
              </thead>

              <tbody className='divide-y divide-slate-100 bg-white'>
                {orderedWorks.map((w) => {
                  const submitted = w.submittedAt || w.createdAt;

                  const grade = extra.gradeByWorkId[w.id] ?? null;
                  const plagiarism = extra.plagiarismByWorkId[w.id] ?? null;
                  const ai = extra.aiByWorkId[w.id] ?? null;
                  const rowLoading = !!extra.loadingByWorkId[w.id];

                  const gradeValue = grade?.gradeValue ?? null;
                  const gradedBy = grade?.teacher?.fullName || '';
                  const similarity = plagiarism
                    ? pct(plagiarism.similarityPercentage)
                    : null;
                  const aiScore = ai ? pct(ai.aiScore) : null;

                  return (
                    <tr key={w.id} className='hover:bg-blue-50/30'>
                      <td className='px-4 py-4'>
                        <Link
                          to={`/works/${w.id}`}
                          className='group inline-flex items-start gap-3'
                        >
                          <span className='mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100'>
                            <FileText size={18} />
                          </span>
                          <div className='min-w-0'>
                            <div className='truncate font-semibold text-blue-950 group-hover:underline'>
                              {w.title}
                            </div>
                            <div className='truncate text-xs text-slate-600'>
                              <span className='font-medium text-slate-700'>
                                Subject:
                              </span>{' '}
                              {w.subject}
                            </div>
                          </div>
                        </Link>
                      </td>

                      <td className='px-4 py-4'>
                        <div className='min-w-0'>
                          <div className='truncate font-medium text-slate-800'>
                            {w?.student?.fullName || 'Unknown'}
                          </div>
                          <div className='truncate text-xs text-slate-500'>
                            {w?.student?.email || ''}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className='px-4 py-4'>{renderStatus(w.status)}</td>

                      {/* Submitted */}
                      <td className='px-4 py-4 text-slate-700'>
                        {submitted ? (
                          <span className='inline-flex items-center gap-1'>
                            <Clock size={14} className='text-slate-400' />
                            {formatDate(submitted)}
                          </span>
                        ) : (
                          <span className='text-slate-400'>—</span>
                        )}
                      </td>

                      <td className='px-4 py-4'>
                        <div className='flex items-center gap-2'>
                          <GraduationCap size={16} className='text-blue-700' />
                          {rowLoading && grade === undefined ? (
                            <span className='inline-flex items-center gap-2 text-xs text-slate-500'>
                              <Loader2 className='animate-spin' size={14} />{' '}
                              Loading...
                            </span>
                          ) : grade ? (
                            <div className='text-xs'>
                              <div className='font-semibold text-slate-900'>
                                {gradeValue}
                              </div>
                              <div className='text-slate-500 truncate'>
                                {gradedBy ? `by ${gradedBy}` : ''}
                              </div>
                            </div>
                          ) : (
                            <span className='text-slate-500'>Not graded</span>
                          )}
                        </div>
                      </td>

                      <td className='px-4 py-4'>
                        <div className='flex items-center gap-2'>
                          <ShieldAlert size={16} className='text-blue-700' />
                          {rowLoading && plagiarism === undefined ? (
                            <span className='inline-flex items-center gap-2 text-xs text-slate-500'>
                              <Loader2 className='animate-spin' size={14} />{' '}
                              Loading...
                            </span>
                          ) : plagiarism ? (
                            <div className='flex items-center gap-2'>
                              <span className='text-sm font-semibold text-slate-900'>
                                {similarity ?? 0}%
                              </span>
                              {plagiarism.reportUrl ? (
                                <a
                                  href={plagiarism.reportUrl}
                                  target='_blank'
                                  rel='noreferrer'
                                  onClick={(e) => e.stopPropagation()}
                                  className='inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100 hover:bg-blue-50'
                                >
                                  <LinkIcon size={14} />
                                  Report
                                </a>
                              ) : null}
                            </div>
                          ) : (
                            <span className='text-slate-500'>
                              Not generated
                            </span>
                          )}
                        </div>
                      </td>

                      <td className='px-4 py-4'>
                        <div className='flex items-center gap-2'>
                          <Bot size={16} className='text-blue-700' />
                          {rowLoading && ai === undefined ? (
                            <span className='inline-flex items-center gap-2 text-xs text-slate-500'>
                              <Loader2 className='animate-spin' size={14} />{' '}
                              Loading...
                            </span>
                          ) : ai ? (
                            <span className='text-sm font-semibold text-slate-900'>
                              {aiScore ?? 0}
                            </span>
                          ) : (
                            <span className='text-slate-500'>
                              Not generated
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}