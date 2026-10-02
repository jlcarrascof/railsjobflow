import axios from 'axios';
import type { WorkflowJob, CreateJobPayload, ApiClient, CreateApiClientPayload, JobsListResponse } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Retrieve Bearer token from browser localStorage (persistent across reloads and tab switches)
function getToken(): string | null {
  return localStorage.getItem('railsjobflow_oauth_token') || sessionStorage.getItem('access_token');
}

export const apiClient = axios.create({ baseURL: API_URL });

// Interceptor: automatically attaches Bearer token to all outbound API requests
apiClient.interceptors.request.use(async (config) => {
  let token = getToken();
  if (!token) {
    try {
      token = await fetchOAuthToken();
    } catch {
      // Pass through if token fetch fails
    }
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Automatically re-authenticates and retries if 401 Unauthorized occurs
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await fetchOAuthToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (authError) {
        return Promise.reject(authError);
      }
    }
    return Promise.reject(error);
  }
);

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
  localStorage.setItem('railsjobflow_oauth_token', token);
  return token;
}

// Jobs API service endpoints
export const jobsApi = {
  list: (page: number = 1, perPage: number = 25) =>
    apiClient.get<JobsListResponse>('/api/v1/jobs', { params: { page, per_page: perPage } }),

  get: (id: string) => apiClient.get<WorkflowJob>(`/api/v1/jobs/${id}`),

  create: (data: CreateJobPayload) =>
    apiClient.post<WorkflowJob>('/api/v1/jobs', data, {
      headers: data.idempotency_key
        ? { 'X-Idempotency-Key': data.idempotency_key }
        : {},
    }),

  cancel: (id: string) => apiClient.patch<WorkflowJob>(`/api/v1/jobs/${id}/cancel`),

  retry: (id: string) => apiClient.post<WorkflowJob>(`/api/v1/jobs/${id}/retry`),

  health: () => apiClient.get('/api/v1/health'),
};

// ApiClients API service endpoints (OAuth2 clients + webhook configuration)
export const apiClientsApi = {
  list: () => apiClient.get<ApiClient[]>('/api/v1/api_clients'),

  create: (data: CreateApiClientPayload) =>
    apiClient.post<ApiClient>('/api/v1/api_clients', { api_client: data }),

  update: (id: string, data: Partial<CreateApiClientPayload>) =>
    apiClient.patch<ApiClient>(`/api/v1/api_clients/${id}`, { api_client: data }),
};
