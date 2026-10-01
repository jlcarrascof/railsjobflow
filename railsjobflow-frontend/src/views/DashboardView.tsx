import { useState } from 'react';
import { useJobs } from '@/hooks/useJobs';
import { MainLayout } from '@/layouts/MainLayout';
import { ObservabilityCards } from '@/components/ObservabilityCards';
import { JobsTable } from '@/components/JobsTable';
import { CreateJobView } from './CreateJobView';
import { SidekiqMetricsView } from './SidekiqMetricsView';
import { SettingsView } from './SettingsView';
import type { NavigationTab } from '@/components/Sidebar';

export default function DashboardView() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const { jobs, loading, error, refetch } = useJobs();

  // Calculate live observability metrics
  const stats = {
    total: jobs.length,
    pending: jobs.filter((j) => j.status === 'pending').length,
    running: jobs.filter((j) => j.status === 'running').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
    failed: jobs.filter((j) => j.status === 'failed').length,
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-8 transition-colors">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 font-medium text-sm">
          <span className="animate-spin text-blue-600 text-lg">⚙️</span>
          <span>Connecting to RailsJobFlow...</span>
        </div>
      </div>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-8 transition-colors">
        <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-md text-center shadow-lg">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">❌ Connection Error</p>
          <p className="text-red-500 dark:text-red-300 text-xs mb-4 font-mono">{error}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-xs"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <MainLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      {/* 1. Main Dashboard Overview Tab */}
      {currentTab === 'dashboard' && (
        <div>
          <ObservabilityCards stats={stats} />
          <JobsTable jobs={jobs} onRefetch={refetch} />
        </div>
      )}

      {/* 2. Dedicated Create Job Tab (Full Screen Workspace Takeover) */}
      {currentTab === 'create-job' && (
        <CreateJobView
          onJobCreated={() => {
            refetch();
            setCurrentTab('dashboard');
          }}
        />
      )}

      {/* 3. Sidekiq Queues & Metrics Tab */}
      {currentTab === 'sidekiq' && <SidekiqMetricsView stats={stats} />}

      {/* 4. System Settings Tab */}
      {currentTab === 'settings' && <SettingsView />}
    </MainLayout>
  );
}
