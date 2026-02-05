import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  User2,
  ShieldAlert,
  Bot,
  Link as LinkIcon,
} from 'lucide-react';
import { formatDate, pct, statusPill } from '../../../utils/helpers';

export default function WorkTeacherCard({ work, plagiarism, ai }) {
  const submitted = work.submittedAt || work.createdAt;
  const { label, cls, Icon } = statusPill(work.status);

  const studentName = work?.student?.fullName || 'Unknown student';
  const studentEmail = work?.student?.email || '';

  const similarity = plagiarism ? pct(plagiarism.similarityPercentage) : null;
  const aiScore = ai ? pct(ai.aiScore) : null;

  return (
    <Link
      to={`/works/${work.id}`}
      className='group block rounded-2xl bg-white p-5 shadow-md ring-1 ring-transparent transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-blue-100'
    >
      <div className='flex items-start gap-4'>
        <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100'>
          <FileText size={22} />
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <h3 className='truncate text-base font-semibold text-blue-950'>
              {work.title}
            </h3>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ring-1 ${cls}`}
            >
              <Icon size={14} />
              {label}
            </span>
          </div>

          <div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600'>
            <span className='truncate'>
              <span className='font-medium text-slate-700'>Subject:</span>{' '}
              {work.subject}
            </span>

            {submitted ? (
              <span className='inline-flex items-center gap-1'>
                <Clock size={14} />
                {formatDate(submitted)}
              </span>
            ) : null}
          </div>

          <div className='mt-3 flex flex-wrap items-center gap-2 text-sm'>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-slate-700 ring-1 ring-slate-200'>
              <User2 size={16} />
              <span className='truncate'>{studentName}</span>
              {studentEmail ? (
                <span className='hidden text-slate-500 sm:inline'>
                  • {studentEmail}
                </span>
              ) : null}
            </span>
          </div>

          <div className='mt-4 grid gap-2 sm:grid-cols-2'>
            <div className='rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2 text-sm font-semibold text-slate-800'>
                  <ShieldAlert size={16} className='text-blue-700' />
                  Plagiarism
                </div>

                {plagiarism?.reportUrl ? (
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

              <div className='mt-2 text-sm text-slate-600'>
                {plagiarism ? (
                  <>
                    Similarity:{' '}
                    <span className='font-semibold text-slate-900'>
                      {similarity ?? 0}%
                    </span>
                  </>
                ) : (
                  <span className='text-slate-500'>Not generated yet</span>
                )}
              </div>
            </div>

            <div className='rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2 text-sm font-semibold text-slate-800'>
                  <Bot size={16} className='text-blue-700' />
                  AI Report
                </div>
              </div>

              <div className='mt-2 text-sm text-slate-600'>
                {ai ? (
                  <>
                    Score:{' '}
                    <span className='font-semibold text-slate-900'>
                      {aiScore ?? 0}
                    </span>
                  </>
                ) : (
                  <span className='text-slate-500'>Not generated yet</span>
                )}
              </div>
            </div>
          </div>

          {work.description ? (
            <p className='mt-3 line-clamp-2 text-sm text-slate-600'>
              {work.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className='mt-4 text-sm font-medium text-blue-700 opacity-90 group-hover:opacity-100'>
        Open details →
      </div>
    </Link>
  );
}