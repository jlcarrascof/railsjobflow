import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useApiClients } from '@/hooks/useApiClients';
import { Settings, ShieldCheck, Key, Globe, Gauge, Plus, Webhook } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { t } = useLanguage();
  const { clients, loading, error, createClient } = useApiClients();
  const [name, setName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    setCreateError(null);
    try {
      await createClient({ name: name.trim(), webhook_url: webhookUrl.trim() || undefined });
      setName('');
      setWebhookUrl('');
    } catch {
      setCreateError(t.settingsView.createClientError);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-2 space-y-6">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            <Settings className="w-5 h-5" />
          </span>
          <span>{t.settingsView.title}</span>
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t.settingsView.subtitle}
        </p>
      </div>

      {/* System Info Grid (static infrastructure facts) */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs p-6 divide-y divide-gray-100 dark:divide-gray-800">
        <div className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">{t.settingsView.apiUrl}</p>
              <p className="text-[11px] text-gray-400">Rails 8 Puma Server (REST API)</p>
            </div>
          </div>
          <code className="text-xs font-mono px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-700">
            {import.meta.env.VITE_API_URL || 'http://localhost:3000'}
          </code>
        </div>

        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Gauge className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">{t.settingsView.rateLimit}</p>
              <p className="text-[11px] text-gray-400">{t.settingsView.rateLimitDesc}</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            Active Protection
          </span>
        </div>
      </div>

      {/* Registered API Clients (real backend data) */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs p-6">
        <h3 className="text-xs font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">
          {t.settingsView.clientsTitle}
        </h3>
        <p className="text-[11px] text-gray-400 mb-4">{t.settingsView.clientsSubtitle}</p>

        {loading && (
          <p className="text-xs text-gray-400">{t.settingsView.loadingClients}</p>
        )}

        {error && (
          <p className="text-xs text-rose-500">{error}</p>
        )}

        {!loading && !error && clients.length === 0 && (
          <p className="text-xs text-gray-400">{t.settingsView.noClients}</p>
        )}

        {!loading && clients.length > 0 && (
          <div className="space-y-3">
            {clients.map((client) => (
              <div
                key={client.id}
                className="p-4 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40"
              >
                <p className="text-xs font-bold text-gray-900 dark:text-white mb-2">{client.name}</p>

                <div className="flex items-center gap-2 mb-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-[11px] text-gray-400">{t.settingsView.apiKeyLabel}:</span>
                  <code className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-amber-600 dark:text-amber-400 truncate">
                    {client.api_key}
                  </code>
                </div>

                <div className="flex items-center gap-2">
                  <Webhook className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-[11px] text-gray-400">{t.settingsView.webhookUrlLabel}:</span>
                  {client.webhook_url ? (
                    <code className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 truncate">
                      {client.webhook_url}
                    </code>
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">{t.settingsView.noWebhook}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create API Client Form */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs p-6">
        <h3 className="text-xs font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          {t.settingsView.createClientTitle}
        </h3>

        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">
              {t.settingsView.nameLabel}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.settingsView.namePlaceholder}
              required
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">
              {t.settingsView.webhookUrlLabel}
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder={t.settingsView.webhookUrlPlaceholder}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isCreating || !name.trim()}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {isCreating ? t.settingsView.creatingClientBtn : t.settingsView.createClientBtn}
          </button>

          {createError && (
            <p className="text-rose-500 text-[11px]">{createError}</p>
          )}
        </form>
      </div>
    </div>
  );
};
