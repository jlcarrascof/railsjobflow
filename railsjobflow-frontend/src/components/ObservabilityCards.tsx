import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Layers, Activity, CheckCircle2, XCircle } from 'lucide-react';

interface ObservabilityCardsProps {
  stats: {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
  };
}

export const ObservabilityCards: React.FC<ObservabilityCardsProps> = ({ stats }) => {
  const { t } = useLanguage();

  const cards = [
    {
      label: t.dashboard.totalJobs,
      value: stats.total,
      icon: Layers,
      color: 'text-blue-600 dark:text-blue-400',
      bgLight: 'bg-blue-50/50 dark:bg-blue-950/20',
      border: 'border-blue-200/60 dark:border-blue-900/40',
      glow: 'group-hover:border-blue-400 dark:group-hover:border-blue-600',
    },
    {
      label: t.dashboard.running,
      value: stats.running,
      icon: Activity,
      color: 'text-amber-500 dark:text-amber-400',
      bgLight: 'bg-amber-50/50 dark:bg-amber-950/20',
      border: 'border-amber-200/60 dark:border-amber-900/40',
      glow: 'group-hover:border-amber-400 dark:group-hover:border-amber-600',
    },
    {
      label: t.dashboard.completed,
      value: stats.completed,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgLight: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      border: 'border-emerald-200/60 dark:border-emerald-900/40',
      glow: 'group-hover:border-emerald-400 dark:group-hover:border-emerald-600',
    },
    {
      label: t.dashboard.failed,
      value: stats.failed,
      icon: XCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bgLight: 'bg-rose-50/50 dark:bg-rose-950/20',
      border: 'border-rose-200/60 dark:border-rose-900/40',
      glow: 'group-hover:border-rose-400 dark:group-hover:border-rose-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`group relative p-5 rounded-2xl bg-white dark:bg-gray-900 border ${card.border} ${card.glow} shadow-xs transition-all duration-200 overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl ${card.bgLight} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold tracking-tight ${card.color}`}>
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
