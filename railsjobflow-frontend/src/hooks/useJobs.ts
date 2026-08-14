import { useState, useEffect, useCallback } from 'react';
import { jobsApi } from '@/api/client';
import type { WorkflowJob } from '@/types';

// Polling interval: 3 seconds for real-time background status updates
const POLL_INTERVAL_MS = 3000;

export function useJobs() {
  const [jobs, setJobs] = useState<WorkflowJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await jobsApi.list();
      setJobs(response.data);
      setError(null);
    } catch (e: unknown) {
      const err = e as { message?: string; response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || err.message || 'Error fetching jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    // Start background polling interval
    const interval = setInterval(fetchJobs, POLL_INTERVAL_MS);
    // Cleanup: clear polling interval on component unmount
    return () => clearInterval(interval);
  }, [fetchJobs]);

  return { jobs, loading, error, refetch: fetchJobs };
}
