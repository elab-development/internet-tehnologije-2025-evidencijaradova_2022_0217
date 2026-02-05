import { useEffect } from 'react';

import { useAuthStore } from '../stores/authStore';

import GuestScreen from '../components/home/GuestScreen';
import StudentScreen from '../components/home/StudentScreen';
import TeacherScreen from '../components/home/TeacherScreen';
import AdminScreen from '../components/home/AdminScreen';

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const me = useAuthStore((s) => s.me);

  useEffect(() => {
    me().catch(() => {});
  }, []);

  if (isLoading) {
    return (
      <div className='mx-auto max-w-6xl px-4 py-10'>
        <div className='rounded-2xl bg-white p-6 shadow-md'>
          <div className='h-4 w-44 animate-pulse rounded bg-slate-200' />
          <div className='mt-4 h-3 w-full animate-pulse rounded bg-slate-100' />
          <div className='mt-2 h-3 w-5/6 animate-pulse rounded bg-slate-100' />
        </div>
      </div>
    );
  }

  if (!user) return <GuestScreen />;

  if (user.role === 'student') return <StudentScreen />;
  if (user.role === 'teacher') return <TeacherScreen />;
  if (user.role === 'admin') return <AdminScreen />;

  return <GuestScreen />;
}