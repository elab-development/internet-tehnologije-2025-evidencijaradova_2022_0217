import { useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw, Shield, User2, Mail, Save, X } from 'lucide-react';

import { useUsersStore } from '../../../stores/usersStore';
import { useAuthStore } from '../../../stores/authStore';

const ROLE_OPTIONS = ['student', 'teacher', 'admin'];

export default function UsersTab() {
  const me = useAuthStore((s) => s.user);

  const users = useUsersStore((s) => s.users);
  const isLoading = useUsersStore((s) => s.isLoading);
  const error = useUsersStore((s) => s.error);
  const success = useUsersStore((s) => s.success);
  const clearMessages = useUsersStore((s) => s.clearMessages);
  const fetchUsers = useUsersStore((s) => s.fetchUsers);
  const updateUserRole = useUsersStore((s) => s.updateUserRole);

  const [draft, setDraft] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const next = {};
    for (const u of users) next[u.id] = u.role;
    setDraft(next);
  }, [users]);

  const sortedUsers = useMemo(() => {
    const arr = [...users];
    if (me?.id) {
      arr.sort((a, b) => (a.id === me.id ? -1 : b.id === me.id ? 1 : 0));
    }
    return arr;
  }, [users, me?.id]);

  async function handleSave(userId) {
    clearMessages();
    const role = draft[userId];
    if (!role) return;
    await updateUserRole(userId, role);
  }

  return (
    <div className='rounded-2xl bg-white p-6 shadow-md'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h3 className='text-lg font-semibold text-blue-950'>Users</h3>
          <p className='mt-1 text-sm text-slate-600'>
            Update roles directly from the table.
          </p>
        </div>

        <button
          type='button'
          onClick={() => {
            clearMessages();
            fetchUsers();
          }}
          className='inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm ring-1 ring-blue-100 hover:bg-blue-50'
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {(error || success) && (
        <div className='mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-blue-50'>
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

      <div className='mt-5 hidden overflow-x-auto md:block'>
        <table className='w-full min-w-[760px] text-left text-sm'>
          <thead>
            <tr className='text-slate-600'>
              <th className='px-3 py-3 font-semibold'>User</th>
              <th className='px-3 py-3 font-semibold'>Email</th>
              <th className='px-3 py-3 font-semibold'>Role</th>
              <th className='px-3 py-3 font-semibold'>Actions</th>
            </tr>
          </thead>

          <tbody className='divide-y divide-slate-100'>
            {isLoading && users.length === 0 ? (
              <tr>
                <td colSpan={4} className='px-3 py-6'>
                  <div className='flex items-center gap-2 text-blue-700'>
                    <Loader2 className='animate-spin' size={18} />
                    <span className='text-sm font-medium'>
                      Loading users...
                    </span>
                  </div>
                </td>
              </tr>
            ) : sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className='px-3 py-6 text-slate-600'>
                  No users found.
                </td>
              </tr>
            ) : (
              sortedUsers.map((u) => {
                const isMe = me?.id === u.id;
                const roleDraft = draft[u.id] ?? u.role;
                const changed = roleDraft !== u.role;

                return (
                  <tr key={u.id} className='hover:bg-blue-50/30'>
                    <td className='px-3 py-4'>
                      <div className='flex items-center gap-2'>
                        <span className='inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100'>
                          <User2 size={18} />
                        </span>
                        <div className='leading-tight'>
                          <div className='font-semibold text-blue-950'>
                            {u.fullName}
                            {isMe ? (
                              <span className='ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800'>
                                you
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className='px-3 py-4 text-slate-700'>
                      <div className='flex items-center gap-2'>
                        <Mail size={16} className='text-slate-400' />
                        <span className='truncate'>{u.email}</span>
                      </div>
                    </td>

                    <td className='px-3 py-4'>
                      <div className='inline-flex items-center gap-2'>
                        <Shield size={16} className='text-blue-700' />
                        <select
                          value={roleDraft}
                          disabled={isMe}
                          onChange={(e) =>
                            setDraft((s) => ({ ...s, [u.id]: e.target.value }))
                          }
                          className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500'
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                      {isMe ? (
                        <p className='mt-1 text-xs text-slate-500'>
                          You can’t change your own role.
                        </p>
                      ) : null}
                    </td>

                    <td className='px-3 py-4'>
                      <button
                        type='button'
                        disabled={isMe || !changed || isLoading}
                        onClick={() => handleSave(u.id)}
                        className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
                      >
                        <Save size={16} />
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className='mt-5 grid gap-4 md:hidden'>
        {isLoading && users.length === 0 ? (
          <div className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-blue-50'>
            <div className='flex items-center gap-2 text-blue-700'>
              <Loader2 className='animate-spin' size={18} />
              <span className='text-sm font-medium'>Loading users...</span>
            </div>
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className='rounded-2xl bg-white p-5 text-slate-600 shadow-sm ring-1 ring-blue-50'>
            No users found.
          </div>
        ) : (
          sortedUsers.map((u) => {
            const isMe = me?.id === u.id;
            const roleDraft = draft[u.id] ?? u.role;
            const changed = roleDraft !== u.role;

            return (
              <div
                key={u.id}
                className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-blue-50'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <div className='font-semibold text-blue-950 truncate'>
                      {u.fullName}
                    </div>
                    <div className='mt-1 text-sm text-slate-600 truncate'>
                      {u.email}
                    </div>
                    {isMe ? (
                      <div className='mt-2 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800'>
                        you
                      </div>
                    ) : null}
                  </div>

                  <span className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100'>
                    <User2 size={18} />
                  </span>
                </div>

                <div className='mt-4 flex items-center gap-2'>
                  <Shield size={16} className='text-blue-700' />
                  <select
                    value={roleDraft}
                    disabled={isMe}
                    onChange={(e) =>
                      setDraft((s) => ({ ...s, [u.id]: e.target.value }))
                    }
                    className='w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500'
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type='button'
                  disabled={isMe || !changed || isLoading}
                  onClick={() => handleSave(u.id)}
                  className='mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  <Save size={16} />
                  Save role
                </button>

                {isMe ? (
                  <p className='mt-2 text-xs text-slate-500'>
                    You can’t change your own role.
                  </p>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}