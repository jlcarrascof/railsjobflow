import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Cpu, 
  Settings, 
  LogOut, 
  Zap, 
  Activity,
  UserCheck
} from 'lucide-react';

export type NavigationTab = 'dashboard' | 'create-job' | 'sidekiq' | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: t.nav.dashboard,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'create-job' as NavigationTab,
      label: t.nav.createJob,
      icon: PlusCircle,
      badge: 'New',
    },
    {
      id: 'sidekiq' as NavigationTab,
      label: t.nav.sidekiq,
      icon: Cpu,
      badge: 'Redis',
    },
    {
      id: 'settings' as NavigationTab,
      label: t.nav.settings,
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-gray-900 dark:text-white">RailsJobFlow</span>
          </div>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium block">
            {t.nav.brandSubtitle}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              type="button"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Indicator Box */}
      <div className="px-4 py-3 mx-3 mb-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/70 dark:border-gray-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
              {t.nav.systemOnline}
            </span>
          </div>
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
        </div>
      </div>

      {/* User Profile & Logout Section */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between p-2 rounded-xl">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                {user?.email || 'admin@railsjobflow.io'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            type="button"
            title={t.nav.logout}
            className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
