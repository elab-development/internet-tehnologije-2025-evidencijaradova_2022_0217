import { BadgeCheck, Clock, Hourglass } from 'lucide-react';

export function formatDate(value) {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function statusPill(status) {
  const map = {
    pending_review: {
      label: 'Pending review',
      cls: 'bg-amber-100 text-amber-800 ring-amber-200',
      Icon: Hourglass,
    },
    in_review: {
      label: 'In review',
      cls: 'bg-sky-100 text-sky-800 ring-sky-200',
      Icon: Clock,
    },
    graded: {
      label: 'Graded',
      cls: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
      Icon: BadgeCheck,
    },
    rejected: {
      label: 'Rejected',
      cls: 'bg-rose-100 text-rose-800 ring-rose-200',
      Icon: BadgeCheck,
    },
  };

  return (
    map[status] || {
      label: status || 'Unknown',
      cls: 'bg-slate-100 text-slate-700 ring-slate-200',
      Icon: Clock,
    }
  );
}

export function pct(n) {
  if (n === null || n === undefined) return null;
  const x = Number(n);
  if (Number.isNaN(x)) return null;
  return Math.round(x * 10) / 10;
}