import { useEffect, useMemo, useState } from 'react';
import { Loader2, X, FileText } from 'lucide-react';

import { useWorksStore } from '../../stores/worksStore';
import { usePlagiarismReportsStore } from '../../stores/plagiarismReportStore';
import { useAIReportsStore } from '../../stores/aiReportsStore';

import WorkTeacherCard from './works/WorkTeacherCard';

export default function TeacherScreen() {
  const works = useWorksStore((s) => s.works);
  const isLoadingWorks = useWorksStore((s) => s.isLoading);
  const errorWorks = useWorksStore((s) => s.error);
  const successWorks = useWorksStore((s) => s.success);
  const clearWorksMessages = useWorksStore((s) => s.clearMessages);
  const fetchWorks = useWorksStore((s) => s.fetchWorks);

  const fetchPlagiarismByWorkId = usePlagiarismReportsStore(
    (s) => s.fetchByWorkId,
  );
  const fetchAIByWorkId = useAIReportsStore((s) => s.fetchByWorkId);

  const [reports, setReports] = useState(() => ({
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

    const firstBatch = orderedWorks.slice(0, 24);

    firstBatch.forEach((w) => {
      const workId = w.id;

      setReports((prev) => {
        const already =
          prev.plagiarismByWorkId[workId] !== undefined ||
          prev.aiByWorkId[workId] !== undefined ||
          prev.loadingByWorkId[workId];

        if (already) return prev;

        return {
          ...prev,
          loadingByWorkId: { ...prev.loadingByWorkId, [workId]: true },
        };
      });

      Promise.all([fetchPlagiarismByWorkId(workId), fetchAIByWorkId(workId)])
        .then(([plag, ai]) => {
          setReports((prev) => ({
            plagiarismByWorkId: { ...prev.plagiarismByWorkId, [workId]: plag },
            aiByWorkId: { ...prev.aiByWorkId, [workId]: ai },
            loadingByWorkId: { ...prev.loadingByWorkId, [workId]: false },
          }));
        })
        .catch(() => {
          setReports((prev) => ({
            plagiarismByWorkId: { ...prev.plagiarismByWorkId, [workId]: null },
            aiByWorkId: { ...prev.aiByWorkId, [workId]: null },
            loadingByWorkId: { ...prev.loadingByWorkId, [workId]: false },
          }));
        });
    });
  }, [orderedWorks, fetchPlagiarismByWorkId, fetchAIByWorkId]);

  return (
    <div className='mx-auto max-w-6xl px-4 py-10'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h2 className='text-2xl font-semibold text-blue-950'>All Works</h2>
          <p className='mt-1 text-slate-600'>
            Review submitted works and see plagiarism + AI report status.
          </p>
        </div>

        <button
          type='button'
          onClick={() => {
            clearWorksMessages();
            fetchWorks();
            setReports({
              plagiarismByWorkId: {},
              aiByWorkId: {},
              loadingByWorkId: {},
            });
          }}
          className='rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm ring-1 ring-blue-100 hover:bg-blue-50'
        >
          Refresh
        </button>
      </div>

      {(errorWorks || successWorks) && (
        <div className='mt-5 rounded-2xl bg-white p-4 shadow-md ring-1 ring-blue-50'>
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

      <div className='mt-6'>
        {isLoadingWorks && works.length === 0 ? (
          <div className='rounded-2xl bg-white p-6 shadow-md'>
            <div className='flex items-center gap-2 text-blue-700'>
              <Loader2 className='animate-spin' size={18} />
              <span className='text-sm font-medium'>Loading works...</span>
            </div>
          </div>
        ) : orderedWorks.length === 0 ? (
          <div className='rounded-2xl bg-white p-8 text-center shadow-md'>
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
          <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
            {orderedWorks.map((w) => (
              <WorkTeacherCard
                key={w.id}
                work={w}
                plagiarism={reports.plagiarismByWorkId[w.id] ?? null}
                ai={reports.aiByWorkId[w.id] ?? null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}