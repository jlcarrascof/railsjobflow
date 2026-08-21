import axios from 'axios';
import type { WorkflowJob, CreateJobPayload } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Retrieve Bearer token from browser sessionStorage
function getToken(): string | null {
  return sessionStorage.getItem('access_token');
}

export const apiClient = axios.create({ baseURL: API_URL });

// Interceptor: automatically attaches Bearer token to all outbound API requests
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Obtain OAuth2 access token via client_credentials grant flow
export async function fetchOAuthToken(): Promise<string> {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: import.meta.env.VITE_OAUTH_CLIENT_ID || '',
    client_secret: import.meta.env.VITE_OAUTH_CLIENT_SECRET || '',
  });

  const response = await axios.post(`${API_URL}/oauth/token`, params);
  const token = response.data.access_token;
  sessionStorage.setItem('access_token', token);
  return token;
}

// Jobs API service endpoints
export const jobsApi = {
  list: () => apiClient.get<WorkflowJob[]>('/api/v1/jobs'),

  get: (id: string) => apiClient.get<WorkflowJob>(`/api/v1/jobs/${id}`),

  create: (data: CreateJobPayload) =>
    apiClient.post<WorkflowJob>('/api/v1/jobs', data, {
      headers: data.idempotency_key
        ? { 'X-Idempotency-Key': data.idempotency_key }
        : {},
    }),

  health: () => apiClient.get('/api/v1/health'),
};
