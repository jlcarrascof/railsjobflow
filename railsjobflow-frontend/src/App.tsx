import React, { useEffect, useState } from 'react';
import { fetchOAuthToken } from '@/api/client';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { LoginView } from '@/views/LoginView';
import DashboardView from '@/views/DashboardView';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Automatically fetch OAuth2 Bearer token on app startup
    fetchOAuthToken()
      .then(() => setReady(true))
      .catch((e: unknown) => {
        const err = e as { message?: string; response?: { data?: { error?: string } } };
        setError(err.response?.data?.error || err.message || 'Error connecting to OAuth2');
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-8 transition-colors">
        <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-md text-center shadow-lg">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2 flex items-center justify-center gap-1.5">
            <span>🔒</span> {t.auth.authErrorTitle}
          </p>
          <p className="text-red-500 dark:text-red-300 text-xs mb-4 font-mono">{error}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            {t.auth.authErrorHelp}
          </p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setReady(false);
              fetchOAuthToken()
                .then(() => setReady(true))
                .catch((e: unknown) => {
                  const err = e as { message?: string; response?: { data?: { error?: string } } };
                  setError(err.response?.data?.error || err.message || 'Error connecting to OAuth2');
                });
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-all cursor-pointer shadow-xs"
          >
            🔄 {t.auth.retryBtn}
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-8 transition-colors">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 font-medium text-sm">
          <span className="animate-spin text-blue-600 text-xl">⚡</span>
          <span>{t.auth.authenticatingOAuth}</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated yet, display LoginView
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // If authenticated, display the Dashboard
  return <DashboardView />;
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
