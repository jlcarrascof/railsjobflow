import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Cpu, Server, CheckCircle2, ArrowUpRight, Layers } from 'lucide-react';

interface SidekiqMetricsViewProps {
  stats: {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
  };
}

export const SidekiqMetricsView: React.FC<SidekiqMetricsViewProps> = ({ stats }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto py-2 space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              <Cpu className="w-5 h-5" />
            </span>
            <span>{t.sidekiqView.title}</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t.sidekiqView.subtitle}
          </p>
        </div>

        <a
          href="http://localhost:3001/sidekiq"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <span>{t.sidekiqView.openWebUiBtn}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Redis Connection Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <span className="text-xs text-gray-400 font-medium">Redis Infrastructure</span>
          <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 flex items-center gap-2">
            <Server className="w-4 h-4 text-rose-500" />
            <span>localhost:6379</span>
          </p>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-2 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Connected & Healthy</span>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <span className="text-xs text-gray-400 font-medium">Active Worker Pool</span>
          <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-500" />
            <span>WorkflowWorker (x5 Threads)</span>
          </p>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-2 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-semibold">
            <span>Concurrency: 5</span>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <span className="text-xs text-gray-400 font-medium">Queue Load</span>
          <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>{stats.pending + stats.running} In Queue</span>
          </p>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-2 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 text-[10px] font-semibold">
            <span>Latency: &lt; 5ms</span>
          </span>
        </div>
      </div>
    </div>
  );
};
