import React, { useState, useMemo, useEffect } from 'react';
import type { WorkflowJob, JobStatus } from '@/types';
import JobStatusBadge from '@/components/JobStatusBadge';
import { Pagination } from '@/components/Pagination';
import { useLanguage } from '@/context/LanguageContext';
import { Search, Filter, KeyRound, Clock, AlertTriangle, Inbox } from 'lucide-react';

const PAGE_SIZE = 4; // 4 tasks per page as requested

interface JobsTableProps {
  jobs: WorkflowJob[];
}

export const JobsTable: React.FC<JobsTableProps> = ({ jobs }) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter jobs based on search query and status pill
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.idempotency_key && job.idempotency_key.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.error_message && job.error_message.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, selectedStatus]);

  // Reset to page 1 whenever filters or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  // Calculate pagination bounds
  const totalPages = Math.ceil(filteredJobs.length / PAGE_SIZE) || 1;
  const paginatedJobs = useMemo(() => {
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    return filteredJobs.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredJobs, currentPage]);

  const statusFilters: { id: string; label: string }[] = [
    { id: 'all', label: t.dashboard.filterAll },
    { id: 'pending', label: t.dashboard.filterPending },
    { id: 'running', label: t.dashboard.filterRunning },
    { id: 'completed', label: t.dashboard.filterCompleted },
    { id: 'failed', label: t.dashboard.filterFailed },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden transition-colors duration-200">
      {/* Table Top Controls: Title, Search, and Status Filter Badges */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>📋</span> {t.dashboard.tableTitle}
          </h3>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
            {filteredJobs.length} {t.dashboard.recordsCount}
          </span>
        </div>

        {/* Search Bar and Filter Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.header.searchPlaceholder}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-gray-400 mr-1 shrink-0 hidden sm:block" />
            {statusFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedStatus(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer select-none ${
                  selectedStatus === f.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 dark:bg-gray-800/40 border-b border-gray-200/80 dark:border-gray-800 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-5 py-3.5">{t.dashboard.colTitle}</th>
              <th className="px-5 py-3.5">{t.dashboard.colStatus}</th>
              <th className="px-5 py-3.5">{t.dashboard.colRetries}</th>
              <th className="px-5 py-3.5">{t.dashboard.colDuration}</th>
              <th className="px-5 py-3.5">{t.dashboard.colCreated}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {paginatedJobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-5 py-4 max-w-sm">
                  <p className="font-bold text-gray-900 dark:text-white text-xs tracking-tight">
                    {job.title}
                  </p>
                  {job.idempotency_key && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-mono mt-1 flex items-center gap-1.5 truncate">
                      <KeyRound className="w-3 h-3 shrink-0 text-amber-500/80" />
                      <span>{job.idempotency_key}</span>
                    </p>
                  )}
                  {job.error_message && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 font-mono bg-rose-50/80 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200/60 dark:border-rose-900/60 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{job.error_message}</span>
                    </p>
                  )}
                </td>

                <td className="px-5 py-4 whitespace-nowrap">
                  <JobStatusBadge status={job.status as JobStatus} />
                </td>

                <td className="px-5 py-4 whitespace-nowrap font-mono text-gray-600 dark:text-gray-400">
                  <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 font-semibold text-[11px]">
                    {job.retries} / {job.max_retries}
                  </span>
                </td>

                <td className="px-5 py-4 whitespace-nowrap font-mono text-gray-600 dark:text-gray-400">
                  {job.duration_ms !== null && job.duration_ms !== undefined ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{job.duration_ms} ms</span>
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600">—</span>
                  )}
                </td>

                <td className="px-5 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {new Date(job.created_at).toLocaleString(language === 'es' ? 'es-VE' : 'en-US', {
                    dateStyle: 'short',
                    timeStyle: 'medium',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <div className="p-12 text-center text-gray-400 dark:text-gray-500">
          <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
            {t.dashboard.emptyTitle}
          </p>
          <p className="text-xs max-w-sm mx-auto">
            {t.dashboard.emptySubtitle}
          </p>
        </div>
      )}

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredJobs.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
