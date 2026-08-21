import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={theme === 'dark' ? t.header.themeLight : t.header.themeDark}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer select-none
                 bg-gray-100 hover:bg-gray-200 text-gray-700 
                 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border dark:border-gray-700/60 shadow-2xs"
    >
      <span className="text-sm">{theme === 'dark' ? '☀️' : '🌙'}</span>
      <span className="hidden sm:inline">
        {theme === 'dark' ? t.header.themeLight : t.header.themeDark}
      </span>
    </button>
  );
};
