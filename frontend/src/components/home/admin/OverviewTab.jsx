import { useEffect, useMemo } from 'react';
import {
  Loader2,
  RefreshCw,
  Users,
  FileText,
  ShieldAlert,
  Bot,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';

import { useAdminStatsStore } from '../../../stores/adminStatsStore';

function Card({ icon: Icon, title, value, sub }) {
  return (
    <div className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-blue-50'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <div className='text-sm font-medium text-slate-600'>{title}</div>
          <div className='mt-1 text-2xl font-semibold text-blue-950'>
            {value}
          </div>
          {sub ? (
            <div className='mt-1 text-xs text-slate-500'>{sub}</div>
          ) : null}
        </div>
        <span className='inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100'>
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}

function ChartShell({ title, desc, children }) {
  return (
    <div className='rounded-2xl bg-white p-6 shadow-md'>
      <div>
        <h3 className='text-lg font-semibold text-blue-950'>{title}</h3>
        {desc ? <p className='mt-1 text-sm text-slate-600'>{desc}</p> : null}
      </div>
      <div className='mt-4 h-72'>{children}</div>
    </div>
  );
}

function NiceTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className='rounded-xl bg-white px-3 py-2 text-xs shadow-md ring-1 ring-slate-200'>
      <div className='font-semibold text-slate-900'>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className='mt-1 text-slate-700'>
          <span className='font-medium'>{p.name}:</span> {p.value}
        </div>
      ))}
    </div>
  );
}

export default function OverviewTab() {
  const stats = useAdminStatsStore((s) => s.stats);
  const isLoading = useAdminStatsStore((s) => s.isLoading);
  const error = useAdminStatsStore((s) => s.error);
  const success = useAdminStatsStore((s) => s.success);
  const clearMessages = useAdminStatsStore((s) => s.clearMessages);
  const fetchStats = useAdminStatsStore((s) => s.fetchStats);

  useEffect(() => {
    fetchStats();
  }, []);

  const kpis = stats?.kpis;
  const charts = stats?.charts;
  const aggregates = stats?.aggregates;

  const usersByRoleText = useMemo(() => {
    if (!kpis?.usersByRole) return '';
    const { student = 0, teacher = 0, admin = 0 } = kpis.usersByRole;
    return `students: ${student} • teachers: ${teacher} • admins: ${admin}`;
  }, [kpis?.usersByRole]);

  const worksByStatusText = useMemo(() => {
    if (!kpis?.worksByStatus) return '';
    const s = kpis.worksByStatus;
    return `pending: ${s.pending_review || 0} • in review: ${s.in_review || 0} • graded: ${s.graded || 0} • rejected: ${s.rejected || 0}`;
  }, [kpis?.worksByStatus]);

  const avgGrade = Number(aggregates?.grades?.avgGrade || 0).toFixed(2);
  const avgAi = Number(aggregates?.ai?.avgAiScore || 0).toFixed(2);
  const avgPlag = Number(aggregates?.plagiarism?.avgSimilarity || 0).toFixed(2);

  return (
    <div className='rounded-2xl bg-white p-6 shadow-md'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h3 className='text-lg font-semibold text-blue-950'>Overview</h3>
          <p className='mt-1 text-sm text-slate-600'>
            Platform KPIs and analytics for administrators.
          </p>
        </div>

        <button
          type='button'
          onClick={() => {
            clearMessages();
            fetchStats();
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

      {/* Loading state */}
      {isLoading && !stats ? (
        <div className='mt-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-blue-50'>
          <div className='flex items-center gap-2 text-blue-700'>
            <Loader2 className='animate-spin' size={18} />
            <span className='text-sm font-medium'>Loading overview...</span>
          </div>
        </div>
      ) : !stats ? (
        <div className='mt-5 rounded-2xl bg-white p-6 text-slate-600 shadow-sm ring-1 ring-blue-50'>
          No stats available.
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className='mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card
              icon={Users}
              title='Users'
              value={kpis?.usersTotal ?? 0}
              sub={usersByRoleText}
            />
            <Card
              icon={FileText}
              title='Works'
              value={kpis?.worksTotal ?? 0}
              sub={worksByStatusText}
            />
            <Card
              icon={ShieldAlert}
              title='Avg plagiarism'
              value={`${avgPlag}%`}
              sub={`reports: ${aggregates?.plagiarism?.totalPlagiarismReports ?? 0}`}
            />
            <Card
              icon={Bot}
              title='Avg AI score'
              value={`${avgAi}%`}
              sub={`reports: ${aggregates?.ai?.totalAIReports ?? 0} • avg grade: ${avgGrade}`}
            />
          </div>

          {/* Charts */}
          <div className='mt-6 grid gap-6 lg:grid-cols-2'>
            <ChartShell
              title='Submissions (last 14 days)'
              desc='Daily number of submitted works.'
            >
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart
                  data={charts?.submissionsByDay || []}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip content={<NiceTooltip />} />
                  <Line
                    type='monotone'
                    dataKey='count'
                    name='Submissions'
                    stroke='#2563eb'
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartShell>

            <ChartShell
              title='Top subjects'
              desc='Most common subjects by submitted works.'
            >
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={charts?.worksBySubject || []}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='subject'
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-15}
                    height={60}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip content={<NiceTooltip />} />
                  <Bar
                    dataKey='count'
                    name='Works'
                    fill='#2563eb'
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartShell>

            <ChartShell
              title='Grade distribution'
              desc='How many works got each grade (1–10).'
            >
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={charts?.gradeDistribution || []}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='grade' tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip content={<NiceTooltip />} />
                  <Bar
                    dataKey='count'
                    name='Count'
                    fill='#0ea5e9'
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartShell>

            <ChartShell
              title='AI score distribution'
              desc='AI scores grouped by ranges (0–100).'
            >
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={charts?.aiScoreDistribution || []}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='range'
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-15}
                    height={60}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip content={<NiceTooltip />} />
                  <Bar
                    dataKey='count'
                    name='Count'
                    fill='#22c55e'
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartShell>

            <ChartShell
              title='Plagiarism distribution'
              desc='Similarity grouped by ranges (0–100).'
            >
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={charts?.plagiarismDistribution || []}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='range'
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-15}
                    height={60}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip content={<NiceTooltip />} />
                  <Bar
                    dataKey='count'
                    name='Count'
                    fill='#f97316'
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartShell>
          </div>
        </>
      )}
    </div>
  );
}