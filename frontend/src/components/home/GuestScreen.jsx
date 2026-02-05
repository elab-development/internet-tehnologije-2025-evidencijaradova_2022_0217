import { Link } from 'react-router-dom';
import { FileText, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function GuestScreen() {
  return (
    <div className='mx-auto max-w-6xl px-4 py-10'>
      <div className='grid gap-6 lg:grid-cols-2'>
        <div className='rounded-2xl bg-white p-7 shadow-md'>
          <h1 className='text-3xl font-semibold text-blue-900'>TrueWrite</h1>
          <p className='mt-2 text-slate-600'>
            A platform where students upload written works, and teachers review
            them with plagiarism checks and AI-based quality feedback.
          </p>

          <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
            <Link
              to='/login'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700'
            >
              Sign in <ArrowRight size={18} />
            </Link>

            <Link
              to='/register'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-5 py-2.5 font-medium text-blue-700 hover:bg-blue-50'
            >
              Create account
            </Link>
          </div>

          <p className='mt-5 text-sm text-slate-500'>
            Tip: New users are registered as{' '}
            <span className='font-medium'>students</span>.
          </p>
        </div>

        <div className='grid gap-6'>
          <div className='rounded-2xl bg-white p-6 shadow-md'>
            <div className='flex items-start gap-3'>
              <div className='rounded-xl bg-blue-50 p-3 text-blue-700'>
                <FileText size={22} />
              </div>
              <div>
                <h3 className='font-semibold text-blue-900'>
                  Upload & organize works
                </h3>
                <p className='mt-1 text-sm text-slate-600'>
                  Submit files (PDF/DOCX/TXT), track status, and keep everything
                  in one place.
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-2xl bg-white p-6 shadow-md'>
            <div className='flex items-start gap-3'>
              <div className='rounded-xl bg-blue-50 p-3 text-blue-700'>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className='font-semibold text-blue-900'>
                  Plagiarism reports
                </h3>
                <p className='mt-1 text-sm text-slate-600'>
                  Teachers can generate a plagiarism report per work and store
                  it for review.
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-2xl bg-white p-6 shadow-md'>
            <div className='flex items-start gap-3'>
              <div className='rounded-xl bg-blue-50 p-3 text-blue-700'>
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className='font-semibold text-blue-900'>
                  AI quality feedback
                </h3>
                <p className='mt-1 text-sm text-slate-600'>
                  Get a structured summary, quality assessment, and
                  recommendations for improvement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-8 rounded-2xl bg-blue-50 p-6'>
        <p className='text-sm text-blue-900'>
          You need an account to upload works or view reports. Please sign in or
          create one.
        </p>
      </div>
    </div>
  );
}