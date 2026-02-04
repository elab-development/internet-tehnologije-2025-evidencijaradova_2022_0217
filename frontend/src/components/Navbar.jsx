import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Mail, User2, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

import logo from '../assets/logo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setOpen(false);
    navigate('/login');
  }

  return (
    <header className='sticky top-0 z-50 bg-blue-600 shadow-md'>
      <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3'>
        <Link to='/' className='flex items-center gap-2'>
          <img src={logo} alt='Logo' className='h-9 w-9 object-contain' />
          <span className='hidden text-lg font-semibold text-white sm:inline'>
            TrueWrite
          </span>
        </Link>

        <div className='hidden items-center gap-3 md:flex'>
          {!user ? (
            <>
              <NavLink
                to='/login'
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-white text-blue-600'
                      : 'text-white hover:bg-white/20'
                  }`
                }
              >
                Login
              </NavLink>
              <NavLink
                to='/register'
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-white text-blue-600'
                      : 'text-white hover:bg-white/20'
                  }`
                }
              >
                Register
              </NavLink>
            </>
          ) : (
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-3 rounded-xl bg-white/15 px-3 py-2'>
                <div className='flex h-9 w-9 items-center justify-center rounded-full bg-white text-blue-600'>
                  <User2 size={18} />
                </div>

                <div className='leading-tight'>
                  <div className='text-sm font-semibold text-white'>
                    {user.fullName}
                  </div>
                  <div className='flex items-center gap-1 text-xs text-blue-100'>
                    <Mail size={14} />
                    <span className='max-w-[220px] truncate'>{user.email}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className='inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50'
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className='inline-flex items-center justify-center rounded-lg p-2 text-white hover:bg-white/20 md:hidden'
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className='bg-blue-600 shadow-inner md:hidden'>
          <div className='mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3'>
            {!user ? (
              <>
                <Link
                  to='/login'
                  onClick={() => setOpen(false)}
                  className='rounded-lg px-3 py-2 font-medium text-white hover:bg-white/20'
                >
                  Login
                </Link>
                <Link
                  to='/register'
                  onClick={() => setOpen(false)}
                  className='rounded-lg px-3 py-2 font-medium text-white hover:bg-white/20'
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <div className='rounded-xl bg-white/15 p-3'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600'>
                      <User2 size={18} />
                    </div>
                    <div>
                      <div className='font-semibold text-white'>
                        {user.fullName}
                      </div>
                      <div className='flex items-center gap-1 text-sm text-blue-100'>
                        <Mail size={16} />
                        <span className='truncate'>{user.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className='inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 font-medium text-blue-600 hover:bg-blue-50'
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}