import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User2, UserPlus } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function Register() {
  const navigate = useNavigate();

  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError || s.clearMessages);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  useEffect(() => {
    clearError();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    clearError();

    if (password.length < 6) return;
    if (password !== confirm) return;

    try {
      await register({ fullName, email, password });
      navigate('/', { replace: true });
    } catch {}
  }

  const passwordTooShort = password.length > 0 && password.length < 6;
  const mismatch = confirm.length > 0 && password !== confirm;

  return (
    <div className='mx-auto mt-12 w-full max-w-md'>
      <div className='rounded-2xl bg-white p-6 shadow-md'>
        <h1 className='text-2xl font-semibold text-blue-900'>Create account</h1>
        <p className='mt-1 text-sm text-slate-600'>
          New users are registered as students by default.
        </p>

        {error && (
          <div className='mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
          <label className='block'>
            <span className='mb-1 block text-sm font-medium text-slate-700'>
              Full name
            </span>
            <div className='flex items-center gap-2 rounded-lg border px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200'>
              <User2 size={18} className='text-slate-400' />
              <input
                type='text'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className='w-full outline-none'
                placeholder='First Last'
                autoComplete='name'
                required
              />
            </div>
          </label>

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
                placeholder='At least 6 characters'
                autoComplete='new-password'
                required
              />
            </div>
            {passwordTooShort && (
              <p className='mt-1 text-xs text-red-600'>
                Password must be at least 6 characters long.
              </p>
            )}
          </label>

          <label className='block'>
            <span className='mb-1 block text-sm font-medium text-slate-700'>
              Confirm password
            </span>
            <div className='flex items-center gap-2 rounded-lg border px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200'>
              <Lock size={18} className='text-slate-400' />
              <input
                type='password'
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className='w-full outline-none'
                placeholder='Repeat password'
                autoComplete='new-password'
                required
              />
            </div>
            {mismatch && (
              <p className='mt-1 text-xs text-red-600'>
                Passwords do not match.
              </p>
            )}
          </label>

          <button
            disabled={isLoading || passwordTooShort || mismatch}
            className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-70'
          >
            <UserPlus size={18} />
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className='mt-5 text-center text-sm text-slate-600'>
          Already have an account?{' '}
          <Link
            to='/login'
            className='font-medium text-blue-700 hover:underline'
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}