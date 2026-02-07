import { useMemo, useState } from 'react';
import { Users, FileText } from 'lucide-react';

import UsersTab from './admin/UsersTab';
import WorksTab from './admin/WorksTab';

export default function AdminScreen() {
  const [tab, setTab] = useState('users');

  const tabs = useMemo(
    () => [
      { key: 'users', label: 'Users', Icon: Users },
      { key: 'works', label: 'Works', Icon: FileText },
    ],
    [],
  );

  return (
    <div className='mx-auto max-w-6xl px-4 py-10'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h2 className='text-2xl font-semibold text-blue-950'>Admin</h2>
          <p className='mt-1 text-slate-600'>
            Manage users and review all submitted works.
          </p>
        </div>
      </div>

      <div className='mt-6 rounded-2xl bg-white p-2 shadow-md'>
        <div className='flex flex-wrap gap-2'>
          {tabs.map(({ key, label, Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type='button'
                onClick={() => setTab(key)}
                className={[
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-blue-700 hover:bg-blue-50',
                ].join(' ')}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className='mt-6'>
        {tab === 'users' ? <UsersTab /> : <WorksTab />}
      </div>
    </div>
  );
}