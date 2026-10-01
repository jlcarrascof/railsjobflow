import { useState } from 'react';
import type { WorkflowJob, JobStatus } from '@/types';
import JobStatusBadge from '@/components/JobStatusBadge';
import { jobsApi } from '@/api/client';
import { useLanguage } from '@/context/LanguageContext';
import { X, KeyRound, Clock, AlertTriangle, CheckCircle2, Circle, Loader2, XCircle, Ban } from 'lucide-react';

interface JobDetailModalProps {
  job: WorkflowJob | null;
  onClose: () => void;
  onCancelled?: () => void;
}

const TIMELINE_ICONS: Record<string, React.ElementType> = {
  created: Circle,
  started: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
};

export function JobDetailModal({ job, onClose, onCancelled }: JobDetailModalProps) {
  const { t, language } = useLanguage();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (!job) return null;

  const handleCancel = async () => {
    setIsCancelling(true);
    setCancelError(null);
    try {
      await jobsApi.cancel(job.id);
      onCancelled?.();
      onClose();
    } catch {
      setCancelError(t.jobDetail.cancelError);
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString(language === 'es' ? 'es-VE' : 'en-US', {
          dateStyle: 'medium',
          timeStyle: 'medium',
        })
      : t.jobDetail.notReached;

  const timelineSteps: { key: string; label: string; value: string | null; iconKey: string }[] = [
    { key: 'created', label: t.jobDetail.createdAt, value: job.created_at, iconKey: 'created' },
    { key: 'started', label: t.jobDetail.startedAt, value: job.started_at, iconKey: 'started' },
    {
      key: 'completed',
      label: job.status === 'failed' ? t.jobDetail.failedAt : t.jobDetail.completedAt,
      value: job.status === 'failed' ? job.failed_at : job.completed_at,
      iconKey: job.status === 'failed' ? 'failed' : 'completed',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white tracking-tight">
              {t.jobDetail.title}
            </h3>
            <p className="text-xs text-gray-900 dark:text-white font-bold mt-1">{job.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
            aria-label={t.jobDetail.closeBtn}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* Status + quick stats */}
          <div className="flex flex-wrap items-center gap-2">
            <JobStatusBadge status={job.status as JobStatus} />
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 font-mono font-semibold text-gray-600 dark:text-gray-400">
              {t.jobDetail.retriesLabel}: {job.retries} / {job.max_retries}
            </span>
            {job.duration_ms !== null && job.duration_ms !== undefined && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {t.jobDetail.durationLabel}: {job.duration_ms} ms
              </span>
            )}
          </div>

          {job.idempotency_key && (
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-mono text-[11px]">
              <KeyRound className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
              <span>{t.jobDetail.idempotencyKey}:</span>
              <span className="text-gray-700 dark:text-gray-300">{job.idempotency_key}</span>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5">
              {t.jobDetail.timelineTitle}
            </h4>
            <ol className="space-y-3 border-l-2 border-gray-200 dark:border-gray-800 pl-4">
              {timelineSteps.map((step) => {
                const Icon = TIMELINE_ICONS[step.iconKey];
                const reached = Boolean(step.value);
                return (
                  <li key={step.key} className="relative">
                    <Icon
                      className={`w-3.5 h-3.5 absolute -left-[21px] top-0.5 ${
                        reached ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-gray-700'
                      }`}
                    />
                    <p className={`font-semibold ${reached ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                      {step.label}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 font-mono text-[11px]">
                      {formatDate(step.value)}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Error message */}
          {job.error_message && (
            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-wider text-rose-500 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t.jobDetail.errorTitle}
              </h4>
              <p className="font-mono bg-rose-50/80 dark:bg-rose-950/40 p-3 rounded-lg border border-rose-200/60 dark:border-rose-900/60 text-rose-600 dark:text-rose-400">
                {job.error_message}
              </p>
            </div>
          )}

          {/* Payload */}
          <div>
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              {t.jobDetail.payloadTitle}
            </h4>
            <pre className="font-mono bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
              {Object.keys(job.payload || {}).length > 0
                ? JSON.stringify(job.payload, null, 2)
                : t.jobDetail.noPayload}
            </pre>
          </div>

          {/* Actions */}
          {(job.status === 'pending' || job.status === 'running') && (
            <div>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCancelling || job.status === 'running'}
                title={job.status === 'running' ? t.jobDetail.cancelOnlyPending : undefined}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                {isCancelling ? t.jobDetail.cancellingBtn : t.jobDetail.cancelBtn}
              </button>
              {job.status === 'running' && (
                <p className="text-gray-400 dark:text-gray-500 text-[11px] mt-2 text-center">
                  {t.jobDetail.cancelOnlyPending}
                </p>
              )}
              {cancelError && (
                <p className="text-rose-500 text-[11px] mt-2 text-center">{cancelError}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
