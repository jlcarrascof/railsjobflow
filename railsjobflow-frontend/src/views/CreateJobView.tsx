import React, { useState } from 'react';
import { jobsApi } from '@/api/client';
import { useLanguage } from '@/context/LanguageContext';
import { PlusCircle, Key, FileCode, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

interface CreateJobViewProps {
  onJobCreated: () => void;
}

export const CreateJobView: React.FC<CreateJobViewProps> = ({ onJobCreated }) => {
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [queuePriority, setQueuePriority] = useState('default');
  const [payloadText, setPayloadText] = useState('{\n  "source": "manual_dashboard",\n  "importance": "high"\n}');
  const [useIdempotency, setUseIdempotency] = useState(true);
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [copiedKey, setCopiedKey] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegenerateKey = () => {
    setIdempotencyKey(crypto.randomUUID());
    setCopiedKey(false);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(idempotencyKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let parsedPayload: Record<string, unknown> = {};
    try {
      parsedPayload = payloadText.trim() ? JSON.parse(payloadText) : {};
    } catch {
      setError(t.createJob.invalidJsonError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await jobsApi.create({
        title: title.trim(),
        payload: {
          ...parsedPayload,
          queue: queuePriority,
          submitted_at: new Date().toISOString(),
        },
        idempotency_key: useIdempotency ? idempotencyKey : undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onJobCreated();
      }, 1000);
    } catch (e: unknown) {
      const err = e as { message?: string; response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || err.message || 'Failed to dispatch job');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-2">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
            <PlusCircle className="w-5 h-5" />
          </span>
          <span>{t.createJob.pageTitle}</span>
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t.createJob.pageSubtitle}
        </p>
      </div>

      {/* Main Form Container */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs p-6 md:p-8 transition-colors">
        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{t.createJob.successNotice}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
              {t.createJob.titleLabel} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.createJob.titlePlaceholder}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            />
          </div>

          {/* Queue Priority Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
              {t.createJob.queueLabel}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'default', label: 'default', desc: 'Standard Priority' },
                { id: 'critical', label: 'critical', desc: 'High Priority (VIP)' },
                { id: 'low', label: 'low', desc: 'Batch Low Priority' },
              ].map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setQueuePriority(q.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer select-none ${
                    queuePriority === q.id
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <p className="font-mono text-xs font-bold">{q.label}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{q.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Payload JSON Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-blue-500" />
                <span>{t.createJob.payloadLabel}</span>
              </label>
              <span className="text-[10px] text-gray-400 font-mono">JSON format</span>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2">
              {t.createJob.payloadHelp}
            </p>
            <textarea
              rows={4}
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              className="w-full font-mono text-xs px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-900 text-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
            />
          </div>

          {/* Idempotency Protection Box */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useIdempotency}
                  onChange={(e) => setUseIdempotency(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.createJob.idempotencyLabel}</span>
                </span>
              </label>

              {useIdempotency && (
                <button
                  type="button"
                  onClick={handleRegenerateKey}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                >
                  🔄 Regenerate UUID
                </button>
              )}
            </div>

            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {t.createJob.idempotencyHelp}
            </p>

            {useIdempotency && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono text-xs">
                <span className="text-gray-400">UUIDv4:</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold truncate flex-1">
                  {idempotencyKey}
                </span>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-[11px] font-semibold text-gray-700 dark:text-gray-300 transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-600/25 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>⏳ {t.createJob.submittingBtn}</span>
            ) : (
              <span>⚡ {t.createJob.submitBtn}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
