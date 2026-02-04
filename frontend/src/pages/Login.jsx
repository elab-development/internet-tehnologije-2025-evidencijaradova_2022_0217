import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError || s.clearMessages);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectTo = location.state?.from || '/';

  useEffect(() => {
    clearError();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    clearError();

    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch {}
  }

  return (
    <div className='mx-auto mt-12 w-full max-w-md'>
      <div className='rounded-2xl bg-white p-6 shadow-md'>
        <h1 className='text-2xl font-semibold text-blue-900'>Sign in</h1>
        <p className='mt-1 text-sm text-slate-600'>
          Access your works, grades, and reports.
        </p>

        {error && (
          <div className='mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
          <label className='block'>
            <span className='mb-1 block text-sm font-medium text-slate-700'>
              Email
            </span>
            <div className='flex items-center gap-2 rounded-lg border px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200'>
              <Mail size={18} className='text-slate-400' />
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full outline-none'
                placeholder='Email address'
                autoComplete='email'
                required
              />
            </div>
          </label>

          <label className='block'>
            <span className='mb-1 block text-sm font-medium text-slate-700'>
              Password
            </span>
            <div className='flex items-center gap-2 rounded-lg border px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200'>
              <Lock size={18} className='text-slate-400' />
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full outline-none'
                placeholder='Password'
                autoComplete='current-password'
                required
              />
            </div>
          </label>

          <button
            disabled={isLoading}
            className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-70'
          >
            <LogIn size={18} />
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className='mt-5 text-center text-sm text-slate-600'>
          Don’t have an account?{' '}
          <Link
            to='/register'
            className='font-medium text-blue-700 hover:underline'
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}