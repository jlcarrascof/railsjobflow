import { useState, useEffect, useCallback } from 'react';
import { apiClientsApi } from '@/api/client';
import type { ApiClient, CreateApiClientPayload } from '@/types';

export function useApiClients() {
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      const response = await apiClientsApi.list();
      setClients(response.data);
      setError(null);
    } catch (e: unknown) {
      const err = e as { message?: string; response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || err.message || 'Error fetching api clients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const createClient = useCallback(
    async (data: CreateApiClientPayload) => {
      await apiClientsApi.create(data);
      await fetchClients();
    },
    [fetchClients]
  );

  return { clients, loading, error, refetch: fetchClients, createClient };
}
