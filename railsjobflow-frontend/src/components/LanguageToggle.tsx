import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      title={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer select-none
                 bg-gray-100 hover:bg-gray-200 text-gray-700 
                 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border dark:border-gray-700/60 shadow-2xs"
    >
      <span className="text-sm">{language === 'en' ? '🇺🇸' : '🇪🇸'}</span>
      <span>{language.toUpperCase()}</span>
    </button>
  );
};
