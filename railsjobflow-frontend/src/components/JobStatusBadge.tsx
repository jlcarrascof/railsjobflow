import type { JobStatus } from '@/types';

const STATUS_STYLES: Record<JobStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  running:   'bg-blue-100 text-blue-800 border-blue-200 animate-pulse',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  failed:    'bg-rose-100 text-rose-800 border-rose-200',
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
