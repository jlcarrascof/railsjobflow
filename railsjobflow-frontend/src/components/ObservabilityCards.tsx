import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Clock, Cog, CheckCircle2, XCircle } from 'lucide-react';

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
      label: t.dashboard.pending,
      value: stats.pending,
      icon: Clock,
      iconBg: 'bg-blue-500',
    },
    {
      label: t.dashboard.running,
      value: stats.running,
      icon: Cog,
      iconBg: 'bg-amber-500',
    },
    {
      label: t.dashboard.completed,
      value: stats.completed,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500',
    },
    {
      label: t.dashboard.failed,
      value: stats.failed,
      icon: XCircle,
      iconBg: 'bg-rose-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="flex items-center gap-3 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 shadow-xs transition-all duration-200"
          >
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${card.iconBg} text-white shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-none">
                {card.value}
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                {card.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
