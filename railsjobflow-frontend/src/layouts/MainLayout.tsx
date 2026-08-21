import React from 'react';
import { Sidebar, type NavigationTab } from '@/components/Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/context/LanguageContext';

interface MainLayoutProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  currentTab,
  onTabChange,
  children,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans overflow-hidden transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} onTabChange={onTabChange} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between shrink-0 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-tight">
              {currentTab === 'dashboard' && t.nav.dashboard}
              {currentTab === 'create-job' && t.nav.createJob}
              {currentTab === 'sidekiq' && t.nav.sidekiq}
              {currentTab === 'settings' && t.nav.settings}
            </h2>
          </div>

          {/* Right Header Actions: Polling Indicator, Language & Theme Toggles */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{t.header.polling}</span>
            </div>

            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>

        {/* Dynamic Content Body (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50 dark:bg-gray-950/50">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
