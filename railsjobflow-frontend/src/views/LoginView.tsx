import React, { useState } from 'react';
import { useAuth, DEMO_USER } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';

export const LoginView: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid credentials.');
      }
    } catch {
      setError('An error occurred while signing in.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginAsDemo();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-radial from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
      {/* Top bar with Theme and Language controls */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
            ⚡
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white">RailsJobFlow</span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
              Enterprise
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-xl p-8 transition-all">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
                {t.auth.welcomeTitle}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.auth.welcomeSubtitle}
              </p>
            </div>

            {/* Pre-loaded Demo Account Helper */}
            <div className="mb-6 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <span>💡</span> {t.auth.demoAccountBanner}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-200/60 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200">
                  Pre-configured
                </span>
              </div>
              <div className="text-[11px] font-mono text-gray-600 dark:text-gray-300 space-y-0.5 mb-2.5">
                <p>Email: <span className="text-blue-600 dark:text-blue-400 font-semibold">{DEMO_USER.email}</span></p>
                <p>Pass: <span className="text-gray-400 dark:text-gray-500">••••••••</span></p>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                ⚡ {t.auth.demoQuickFillBtn}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300">
                ❌ {error}
              </div>
            )}

            {/* Standard Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {t.auth.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@railsjobflow.io"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {t.auth.passwordLabel}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? t.auth.signingIn : t.auth.signInBtn}
              </button>
            </form>
          </div>

          {/* Footer Note */}
          <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-6 font-mono">
            Rails 8 API + Sidekiq + Doorkeeper OAuth2 + React
          </p>
        </div>
      </main>
    </div>
  );
};
