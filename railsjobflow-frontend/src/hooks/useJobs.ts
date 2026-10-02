import { useState, useEffect, useCallback } from 'react';
import { jobsApi } from '@/api/client';
import type { WorkflowJob, JobsPagination, JobsStatusCounts } from '@/types';

// Polling interval: 3 seconds for real-time background status updates
const POLL_INTERVAL_MS = 3000;

const EMPTY_STATUS_COUNTS: JobsStatusCounts = {
  total: 0,
  pending: 0,
  running: 0,
  completed: 0,
  failed: 0,
};

export function useJobs(page: number = 1, perPage: number = 25) {
  const [jobs, setJobs] = useState<WorkflowJob[]>([]);
  const [pagination, setPagination] = useState<JobsPagination | null>(null);
  const [statusCounts, setStatusCounts] = useState<JobsStatusCounts>(EMPTY_STATUS_COUNTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await jobsApi.list(page, perPage);
      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
      setStatusCounts(response.data.status_counts);
      setError(null);
    } catch (e: unknown) {
      const err = e as { message?: string; response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || err.message || 'Error fetching jobs');
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => {
    fetchJobs();
    // Start background polling interval
    const interval = setInterval(fetchJobs, POLL_INTERVAL_MS);
    // Cleanup: clear polling interval on component unmount
    return () => clearInterval(interval);
  }, [fetchJobs]);

  return { jobs, pagination, statusCounts, loading, error, refetch: fetchJobs };
}
