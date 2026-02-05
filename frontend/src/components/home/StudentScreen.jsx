import { useEffect, useMemo, useRef, useState } from 'react';
import { UploadCloud, FileText, X, Loader2 } from 'lucide-react';

import { useWorksStore } from '../../stores/worksStore';
import WorkCard from './works/WorkCard';

export default function StudentScreen() {
  const works = useWorksStore((s) => s.works);
  const isLoading = useWorksStore((s) => s.isLoading);
  const error = useWorksStore((s) => s.error);
  const success = useWorksStore((s) => s.success);
  const clearMessages = useWorksStore((s) => s.clearMessages);
  const fetchWorks = useWorksStore((s) => s.fetchWorks);
  const createWork = useWorksStore((s) => s.createWork);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  const fileInputRef = useRef(null);

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

  const fileLabel = file?.name || 'Click to upload or drag & drop';
  const fileHint = file
    ? `${Math.round(file.size / 1024)} KB`
    : 'TXT, PDF, DOC, DOCX (max 15 MB)';

  function onPickFile(f) {
    if (!f) return;
    setFile(f);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    clearMessages();

    if (!title.trim() || !subject.trim() || !file) return;

    const created = await createWork({
      title: title.trim(),
      subject: subject.trim(),
      description: description.trim() || '',
      file,
    });

    if (created) {
      setTitle('');
      setSubject('');
      setDescription('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-10'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h2 className='text-2xl font-semibold text-blue-950'>My Works</h2>
          <p className='mt-1 text-slate-600'>
            Upload your work files and track review status.
          </p>
        </div>

        <button
          type='button'
          onClick={() => {
            clearMessages();
            fetchWorks();
          }}
          className='rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm ring-1 ring-blue-100 hover:bg-blue-50'
        >
          Refresh
        </button>
      </div>

      {(error || success) && (
        <div className='mt-5 rounded-2xl bg-white p-4 shadow-md ring-1 ring-blue-50'>
          <div className='flex items-start justify-between gap-3'>
            <div className='text-sm'>
              {error ? (
                <p className='text-rose-600'>{error}</p>
              ) : (
                <p className='text-emerald-700'>{success}</p>
              )}
            </div>
            <button
              onClick={clearMessages}
              className='rounded-lg p-2 text-slate-500 hover:bg-slate-100'
              aria-label='Close'
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className='mt-6'>
        {isLoading && works.length === 0 ? (
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
              No works yet
            </h3>
            <p className='mt-1 text-slate-600'>
              Upload your first file using the form below.
            </p>
          </div>
        ) : (
          <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
            {orderedWorks.map((w) => (
              <WorkCard key={w.id} work={w} />
            ))}
          </div>
        )}
      </div>

      <div className='mt-10 rounded-2xl bg-white p-7 shadow-md'>
        <h3 className='text-lg font-semibold text-blue-950'>
          Upload a new work
        </h3>
        <p className='mt-1 text-sm text-slate-600'>
          Fill in details and attach a file. Title and subject are required.
        </p>

        <form
          onSubmit={handleSubmit}
          className='mt-6 grid gap-6 lg:grid-cols-2'
        >
          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium text-slate-700'>
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className='mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100'
                placeholder='e.g. Web Application Process Report'
              />
            </div>

            <div>
              <label className='text-sm font-medium text-slate-700'>
                Subject
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className='mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100'
                placeholder='e.g. E-Business'
              />
            </div>

            <div>
              <label className='text-sm font-medium text-slate-700'>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className='mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100'
                placeholder='Optional short description...'
              />
            </div>
          </div>

          <div className='flex flex-col'>
            <label className='text-sm font-medium text-slate-700'>File</label>

            <div
              role='button'
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ')
                  fileInputRef.current?.click();
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                onPickFile(f);
              }}
              className='mt-1 flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 p-6 text-center shadow-sm transition hover:bg-blue-50'
            >
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-700 ring-1 ring-blue-100'>
                <UploadCloud size={22} />
              </div>

              <div>
                <p className='text-sm font-semibold text-blue-950'>
                  {fileLabel}
                </p>
                <p className='mt-1 text-xs text-slate-600'>{fileHint}</p>
              </div>

              {file ? (
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className='rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
                >
                  Remove file
                </button>
              ) : (
                <p className='text-xs text-slate-500'>
                  Drag & drop your file here, or click to browse.
                </p>
              )}

              <input
                ref={fileInputRef}
                type='file'
                name='file'
                className='hidden'
                accept='.txt,.pdf,.doc,.docx'
                onChange={(e) => onPickFile(e.target.files?.[0])}
              />
            </div>

            <button
              type='submit'
              disabled={isLoading || !title.trim() || !subject.trim() || !file}
              className='mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isLoading ? (
                <>
                  <Loader2 className='animate-spin' size={18} />
                  Uploading...
                </>
              ) : (
                'Submit Work'
              )}
            </button>

            <p className='mt-2 text-xs text-slate-500'>
              Your work will start in{' '}
              <span className='font-medium'>Pending review</span>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}