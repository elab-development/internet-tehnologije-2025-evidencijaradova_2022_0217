import { Link } from 'react-router-dom';
import { FileText, Clock } from 'lucide-react';
import { formatDate, statusPill } from '../../../utils/helpers';

export default function WorkCard({ work }) {
  const submitted = work.submittedAt || work.createdAt;
  const { label, cls, Icon } = statusPill(work.status);

  const gradeValue = work?.grade?.gradeValue ?? work?.gradeValue ?? null;

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

            {work.status === 'graded' && gradeValue !== null ? (
              <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100'>
                Grade: {gradeValue}
              </span>
            ) : null}
          </div>

          {work.description ? (
            <p className='mt-3 line-clamp-2 text-sm text-slate-600'>
              {work.description}
            </p>
          ) : (
            <p className='mt-3 text-sm text-slate-400'>
              No description provided.
            </p>
          )}
        </div>
      </div>

      <div className='mt-4 text-sm font-medium text-blue-700 opacity-90 group-hover:opacity-100'>
        Open details →
      </div>
    </Link>
  );
}