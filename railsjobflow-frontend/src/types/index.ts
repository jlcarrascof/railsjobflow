export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface WorkflowJob {
  id: string;
  title: string;
  status: JobStatus;
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
