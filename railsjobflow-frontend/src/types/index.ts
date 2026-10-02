export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface WorkflowJob {
  id: string;
  title: string;
  status: JobStatus;
  payload: Record<string, unknown>;
  retries: number;
  max_retries: number;
  idempotency_key: string | null;
  duration_ms: number | null;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
}

export interface CreateJobPayload {
  title: string;
  payload: Record<string, unknown>;
  idempotency_key?: string;
}

export interface ApiClient {
  id: string;
  name: string;
  api_key: string;
  webhook_url: string | null;
  webhook_secret: string | null;
}

export interface CreateApiClientPayload {
  name: string;
  webhook_url?: string;
}

export interface JobsPagination {
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
}

export interface JobsStatusCounts {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
}

export interface JobsListResponse {
  jobs: WorkflowJob[];
  pagination: JobsPagination;
  status_counts: JobsStatusCounts;
}
