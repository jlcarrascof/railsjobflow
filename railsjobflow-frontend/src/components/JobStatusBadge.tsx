import type { JobStatus } from '@/types';

const STATUS_STYLES: Record<JobStatus, string> = {
  pending:   'bg-blue-100 dark:bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/40',
  running:   'bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/40 animate-pulse',
  completed: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
  failed:    'bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/40',
};

const STATUS_ICONS: Record<JobStatus, string> = {
  pending:   '⏳',
  running:   '⚙️',
  completed: '✅',
  failed:    '❌',
};

export default function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${
        STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      <span>{STATUS_ICONS[status] || '❓'}</span>
      <span>{status}</span>
    </span>
  );
}
