import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Settings, ShieldCheck, Key, Globe, Gauge } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { t } = useLanguage();

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

      {/* Settings Grid */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs p-6 divide-y divide-gray-100 dark:divide-gray-800">
        {/* Backend API URL */}
        <div className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">{t.settingsView.apiUrl}</p>
              <p className="text-[11px] text-gray-400">Rails 8 Puma Server (REST API)</p>
            </div>
          </div>
          <code className="text-xs font-mono px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-700">
            http://localhost:3001
          </code>
        </div>

        {/* OAuth2 Client ID */}
        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Key className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">{t.settingsView.clientId}</p>
              <p className="text-[11px] text-gray-400">Doorkeeper OAuth2 Client Credentials Flow</p>
            </div>
          </div>
          <code className="text-xs font-mono px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-amber-600 dark:text-amber-400 border border-gray-200 dark:border-gray-700">
            test_client_id
          </code>
        </div>

        {/* Webhooks Secret */}
        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">{t.settingsView.webhookSecret}</p>
              <p className="text-[11px] text-gray-400">Signature verification on job completion (sha256)</p>
            </div>
          </div>
          <code className="text-xs font-mono px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-700">
            whsec_prod_994a...
          </code>
        </div>

        {/* Rate Limiting */}
        <div className="py-4 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
    </div>
  );
};
