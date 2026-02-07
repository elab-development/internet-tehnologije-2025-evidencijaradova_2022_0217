import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Clock,
  User2,
  Mail,
  Loader2,
  ShieldAlert,
  Bot,
  Link as LinkIcon,
  Save,
  RefreshCw,
  PlayCircle,
  Star,
  MessageSquare,
  X,
  Pencil,
  CheckCircle2,
} from 'lucide-react';

import { useAuthStore } from '../stores/authStore';
import { useWorksStore } from '../stores/worksStore';
import { usePlagiarismReportsStore } from '../stores/plagiarismReportStore';
import { useAIReportsStore } from '../stores/aiReportsStore';
import { useGradesStore } from '../stores/gradesStore';

import { formatDate, pct, statusPill } from '../utils/helpers';

export default function WorkDetails() {
  const { id } = useParams();

  const me = useAuthStore((s) => s.user);

  const work = useWorksStore((s) => s.work);
  const isLoadingWork = useWorksStore((s) => s.isLoading);
  const errorWork = useWorksStore((s) => s.error);
  const fetchWorkById = useWorksStore((s) => s.fetchWorkById);
  const updateWork = useWorksStore((s) => s.updateWork);

  const plagReport = usePlagiarismReportsStore((s) => s.report);
  const plagWarn = usePlagiarismReportsStore((s) => s.warning);
  const plagLoading = usePlagiarismReportsStore((s) => s.isLoading);
  const plagError = usePlagiarismReportsStore((s) => s.error);
  const plagClear = usePlagiarismReportsStore((s) => s.clear);
  const plagFetch = usePlagiarismReportsStore((s) => s.fetchByWorkId);
  const plagCreate = usePlagiarismReportsStore((s) => s.createReport);

  const aiReport = useAIReportsStore((s) => s.report);
  const aiWarn = useAIReportsStore((s) => s.warning);
  const aiLoading = useAIReportsStore((s) => s.isLoading);
  const aiError = useAIReportsStore((s) => s.error);
  const aiClear = useAIReportsStore((s) => s.clear);
  const aiFetch = useAIReportsStore((s) => s.fetchByWorkId);
  const aiCreate = useAIReportsStore((s) => s.createReport);

  const grade = useGradesStore((s) => s.grade);
  const gradeLoading = useGradesStore((s) => s.isLoading);
  const gradeError = useGradesStore((s) => s.error);
  const gradeSuccess = useGradesStore((s) => s.success);
  const gradeClearMessages = useGradesStore((s) => s.clearMessages);
  const fetchGradeByWorkId = useGradesStore((s) => s.fetchGradeByWorkId);
  const createGrade = useGradesStore((s) => s.createGrade);
  const updateGrade = useGradesStore((s) => s.updateGrade);
  const deleteGrade = useGradesStore((s) => s.deleteGrade);

  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const [gradeValue, setGradeValue] = useState(8);
  const [comment, setComment] = useState('');

  const submitted = work?.submittedAt || work?.createdAt;
  const pill = statusPill(work?.status);

  const isStudent = me?.role === 'student';
  const isTeacher = me?.role === 'teacher';

  const isOwnerStudent =
    isStudent && work?.studentId && me?.id === work.studentId;
  const canEdit = isOwnerStudent && work?.status === 'pending_review';

  useEffect(() => {
    fetchWorkById(id);
    plagClear();
    aiClear();
    gradeClearMessages();
  }, [id]);

  useEffect(() => {
    if (!work?.id) return;
    setEditTitle(work.title || '');
    setEditSubject(work.subject || '');
    setEditDescription(work.description || '');
    plagFetch(work.id);
    aiFetch(work.id);
    fetchGradeByWorkId(work.id);
  }, [work?.id]);

  useEffect(() => {
    if (!grade) return;
    if (typeof grade.gradeValue === 'number') setGradeValue(grade.gradeValue);
    setComment(grade.comment || '');
  }, [grade]);

  const studentName = work?.student?.fullName || 'Unknown student';
  const studentEmail = work?.student?.email || '';

  const similarity = plagReport ? pct(plagReport.similarityPercentage) : null;
  const aiScore = aiReport ? pct(aiReport.aiScore) : null;

  const fileUrl = work?.fileUrl || '';

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!canEdit) return;

    const payload = {
      title: editTitle.trim(),
      subject: editSubject.trim(),
      description: editDescription.trim() || null,
    };

    await updateWork(work.id, payload);
    fetchWorkById(work.id);
  }

  async function handleGeneratePlagiarism() {
    if (!work?.id) return;
    await plagCreate(work.id);
    await plagFetch(work.id);
  }

  async function handleGenerateAI() {
    try {
      if (!work?.id) return;
      await aiCreate(work.id);
      await aiFetch(work.id);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleSubmitGrade(e) {
    e.preventDefault();
    gradeClearMessages();
    if (!work?.id) return;

    const payload = {
      workId: work.id,
      gradeValue: Number(gradeValue),
      comment: comment.trim() || undefined,
    };

    if (grade?.id) {
      await updateGrade(grade.id, {
        gradeValue: Number(gradeValue),
        comment: comment.trim() || null,
      });
    } else {
      await createGrade(payload);
    }

    await fetchGradeByWorkId(work.id);
  }

  async function handleDeleteGrade() {
    if (!grade?.id) return;
    gradeClearMessages();
    await deleteGrade(grade.id);
    await fetchGradeByWorkId(work.id);
  }

  const headerRight = useMemo(() => {
    if (!work) return null;

    return (
      <div className='flex flex-wrap items-center gap-2'>
        <button
          type='button'
          onClick={() => {
            fetchWorkById(work.id);
            plagFetch(work.id);
            aiFetch(work.id);
            fetchGradeByWorkId(work.id);
          }}
          className='inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm ring-1 ring-blue-100 hover:bg-blue-50'
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
    );
  }, [work, fetchWorkById, plagFetch, aiFetch, fetchGradeByWorkId]);

  if (isLoadingWork && !work) {
    return (
      <div className='mx-auto max-w-6xl px-4 py-10'>
        <div className='rounded-2xl bg-white p-6 shadow-md'>
          <div className='flex items-center gap-2 text-blue-700'>
            <Loader2 className='animate-spin' size={18} />
            <span className='text-sm font-medium'>Loading work...</span>
          </div>
        </div>
      </div>
    );
  }

  if (errorWork && !work) {
    return (
      <div className='mx-auto max-w-6xl px-4 py-10'>
        <div className='rounded-2xl bg-white p-6 shadow-md'>
          <p className='text-sm text-rose-600'>{errorWork}</p>
          <Link
            to='/'
            className='mt-4 inline-flex items-center gap-2 text-blue-700 hover:underline'
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-10'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <Link
            to='/'
            className='inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-blue-700 shadow-sm ring-1 ring-blue-100 hover:bg-blue-50'
          >
            <ArrowLeft size={16} />
            Back
          </Link>

          <div>
            <h2 className='text-2xl font-semibold text-blue-950'>
              Work Details
            </h2>
            <p className='mt-1 text-slate-600'>
              Review status, reports and grading.
            </p>
          </div>
        </div>

        {headerRight}
      </div>

      <div className='mt-6 rounded-2xl bg-white p-7 shadow-md'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='flex items-start gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100'>
              <FileText size={22} />
            </div>

            <div className='min-w-0'>
              <div className='flex flex-wrap items-center gap-2'>
                <h3 className='max-w-140 truncate text-xl font-semibold text-blue-950'>
                  {work?.title}
                </h3>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ring-1 ${pill.cls}`}
                >
                  <pill.Icon size={14} />
                  {pill.label}
                </span>
              </div>

              <div className='mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600'>
                <span>
                  <span className='font-medium text-slate-700'>Subject:</span>{' '}
                  {work?.subject}
                </span>

                {submitted ? (
                  <span className='inline-flex items-center gap-1'>
                    <Clock size={14} />
                    {formatDate(submitted)}
                  </span>
                ) : null}

                {fileUrl ? (
                  <a
                    href={fileUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100/60'
                  >
                    <LinkIcon size={16} />
                    Open file
                  </a>
                ) : null}
              </div>

              <div className='mt-3 flex flex-wrap items-center gap-2 text-sm'>
                <span className='inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-slate-700 ring-1 ring-slate-200'>
                  <User2 size={16} />
                  <span className='truncate'>{studentName}</span>
                  {studentEmail ? (
                    <span className='hidden items-center gap-1 text-slate-500 sm:inline-flex'>
                      • <Mail size={14} /> {studentEmail}
                    </span>
                  ) : null}
                </span>
              </div>
            </div>
          </div>

          {canEdit ? (
            <div className='inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200'>
              <Pencil size={16} />
              You can edit this work (pending review).
            </div>
          ) : null}
        </div>

        {work?.description ? (
          <div className='mt-5 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200'>
            <p className='text-sm text-slate-700'>{work.description}</p>
          </div>
        ) : (
          <p className='mt-5 text-sm text-slate-500'>
            No description provided.
          </p>
        )}
      </div>

      <div className='mt-6 grid gap-5 lg:grid-cols-2'>
        <div className='rounded-2xl bg-white p-7 shadow-md'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <div className='flex items-center gap-2 text-lg font-semibold text-blue-950'>
                <ShieldAlert size={18} className='text-blue-700' />
                Plagiarism Report
              </div>
              <p className='mt-1 text-sm text-slate-600'>
                Similarity percentage + external report link (if available).
              </p>
            </div>

            {isTeacher ? (
              <button
                type='button'
                onClick={handleGeneratePlagiarism}
                disabled={plagLoading}
                className='inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {plagLoading ? (
                  <Loader2 className='animate-spin' size={16} />
                ) : (
                  <PlayCircle size={16} />
                )}
                Generate
              </button>
            ) : null}
          </div>

          {plagError ? (
            <div className='mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-100'>
              {plagError}
            </div>
          ) : null}

          {plagWarn ? (
            <div className='mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200'>
              {plagWarn}
            </div>
          ) : null}

          <div className='mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200'>
            {plagReport ? (
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div className='text-sm text-slate-700'>
                  Similarity:{' '}
                  <span className='font-semibold text-slate-900'>
                    {similarity ?? 0}%
                  </span>
                </div>

                {plagReport.reportUrl ? (
                  <a
                    href={plagReport.reportUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-blue-700 ring-1 ring-blue-100 hover:bg-blue-50'
                  >
                    <LinkIcon size={16} />
                    Open report
                  </a>
                ) : (
                  <span className='text-sm text-slate-500'>No report link</span>
                )}
              </div>
            ) : (
              <p className='text-sm text-slate-500'>Not generated yet.</p>
            )}
          </div>
        </div>

        <div className='rounded-2xl bg-white p-7 shadow-md'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <div className='flex items-center gap-2 text-lg font-semibold text-blue-950'>
                <Bot size={18} className='text-blue-700' />
                AI Report
              </div>
              <p className='mt-1 text-sm text-slate-600'>
                Summary + quality assessment + recommendations (if available).
              </p>
            </div>

            {isTeacher ? (
              <button
                type='button'
                onClick={handleGenerateAI}
                disabled={aiLoading}
                className='inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {aiLoading ? (
                  <Loader2 className='animate-spin' size={16} />
                ) : (
                  <PlayCircle size={16} />
                )}
                Generate
              </button>
            ) : null}
          </div>

          {aiError ? (
            <div className='mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-100'>
              {aiError}
            </div>
          ) : null}

          {aiWarn ? (
            <div className='mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200'>
              {aiWarn}
            </div>
          ) : null}

          <div className='mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200'>
            {aiReport ? (
              <div className='space-y-3'>
                <div className='flex items-center justify-between gap-3'>
                  <div className='text-sm text-slate-700'>
                    Score:{' '}
                    <span className='font-semibold text-slate-900'>
                      {aiScore ?? 0}
                    </span>
                  </div>

                  <span className='inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 ring-1 ring-emerald-100'>
                    <CheckCircle2 size={16} />
                    Generated
                  </span>
                </div>

                {aiReport.summary ? (
                  <div>
                    <div className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                      Summary
                    </div>
                    <p className='mt-1 text-sm text-slate-700'>
                      {aiReport.summary}
                    </p>
                  </div>
                ) : null}

                {aiReport.qualityAssesment ? (
                  <div>
                    <div className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                      Quality assessment
                    </div>
                    <p className='mt-1 text-sm text-slate-700'>
                      {aiReport.qualityAssesment}
                    </p>
                  </div>
                ) : null}

                {aiReport.reccomendations ? (
                  <div>
                    <div className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                      Recommendations
                    </div>
                    <p className='mt-1 text-sm text-slate-700'>
                      {aiReport.reccomendations}
                    </p>
                  </div>
                ) : null}

                {!aiReport.summary &&
                !aiReport.qualityAssesment &&
                !aiReport.reccomendations ? (
                  <p className='text-sm text-slate-500'>
                    AI report exists but has no text fields.
                  </p>
                ) : null}
              </div>
            ) : (
              <p className='text-sm text-slate-500'>Not generated yet.</p>
            )}
          </div>
        </div>
      </div>

      {isStudent ? (
        <div className='mt-6 rounded-2xl bg-white p-7 shadow-md'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <h3 className='text-lg font-semibold text-blue-950'>Edit Work</h3>
              <p className='mt-1 text-sm text-slate-600'>
                You can edit only your own work while it is{' '}
                <span className='font-medium'>Pending review</span>.
              </p>
            </div>

            {!canEdit ? (
              <div className='inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 ring-1 ring-slate-200'>
                <X size={16} />
                Editing disabled
              </div>
            ) : null}
          </div>

          <form
            onSubmit={handleSaveEdit}
            className='mt-6 grid gap-6 lg:grid-cols-2'
          >
            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-slate-700'>
                  Title
                </label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={!canEdit}
                  className='mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50'
                />
              </div>

              <div>
                <label className='text-sm font-medium text-slate-700'>
                  Subject
                </label>
                <input
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  disabled={!canEdit}
                  className='mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50'
                />
              </div>

              <div>
                <label className='text-sm font-medium text-slate-700'>
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={!canEdit}
                  rows={5}
                  className='mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50'
                  placeholder='Optional...'
                />
              </div>
            </div>

            <div className='flex flex-col justify-between'>
              <div className='rounded-2xl bg-blue-50/40 p-5 ring-1 ring-blue-100'>
                <p className='text-sm font-semibold text-blue-950'>
                  File updates
                </p>
                <p className='mt-1 text-sm text-slate-600'>
                  Your backend update route currently accepts JSON only (no new
                  file upload). If you want file replace, we’ll add a multipart
                  update endpoint.
                </p>
              </div>

              <button
                type='submit'
                disabled={
                  !canEdit ||
                  isLoadingWork ||
                  !editTitle.trim() ||
                  !editSubject.trim()
                }
                className='mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isLoadingWork ? (
                  <Loader2 className='animate-spin' size={18} />
                ) : (
                  <Save size={18} />
                )}
                Save changes
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {isTeacher ? (
        <div className='mt-6 rounded-2xl bg-white p-7 shadow-md'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <h3 className='text-lg font-semibold text-blue-950'>
                Grade Work
              </h3>
              <p className='mt-1 text-sm text-slate-600'>
                Create or update a grade for this work. Only one grade per work.
              </p>
            </div>

            {grade?.id ? (
              <div className='inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800 ring-1 ring-emerald-100'>
                <Star size={16} />
                Grade exists
              </div>
            ) : (
              <div className='inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 ring-1 ring-slate-200'>
                <MessageSquare size={16} />
                Not graded yet
              </div>
            )}
          </div>

          {gradeError || gradeSuccess ? (
            <div className='mt-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-blue-50'>
              <div className='flex items-start justify-between gap-3'>
                <div className='text-sm'>
                  {gradeError ? (
                    <p className='text-rose-600'>{gradeError}</p>
                  ) : (
                    <p className='text-emerald-700'>{gradeSuccess}</p>
                  )}
                </div>
                <button
                  onClick={gradeClearMessages}
                  className='rounded-lg p-2 text-slate-500 hover:bg-slate-100'
                  aria-label='Close'
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : null}

          <form
            onSubmit={handleSubmitGrade}
            className='mt-6 grid gap-6 lg:grid-cols-2'
          >
            <div>
              <label className='text-sm font-medium text-slate-700'>
                Grade (1–10)
              </label>
              <input
                type='number'
                min={1}
                max={10}
                value={gradeValue}
                onChange={(e) => setGradeValue(e.target.value)}
                className='mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100'
              />
              <p className='mt-2 text-xs text-slate-500'>
                Teacher can update only their own grade (backend rule).
              </p>
            </div>

            <div>
              <label className='text-sm font-medium text-slate-700'>
                Comment (optional)
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className='mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100'
                placeholder='Feedback for the student...'
              />
            </div>

            <div className='flex flex-wrap gap-3 lg:col-span-2'>
              <button
                type='submit'
                disabled={gradeLoading}
                className='inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {gradeLoading ? (
                  <Loader2 className='animate-spin' size={18} />
                ) : (
                  <Save size={18} />
                )}
                {grade?.id ? 'Update grade' : 'Create grade'}
              </button>

              {grade?.id ? (
                <button
                  type='button'
                  onClick={handleDeleteGrade}
                  disabled={gradeLoading}
                  className='inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-medium text-rose-700 shadow-sm ring-1 ring-rose-100 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  <X size={18} />
                  Delete grade
                </button>
              ) : null}
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}