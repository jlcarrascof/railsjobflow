import { useState } from 'react';
import { jobsApi } from '@/api/client';

interface Props {
  onCreated: () => void;
}

export default function CreateJobForm({ onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [useIdempotency, setUseIdempotency] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await jobsApi.create({
        title: title.trim(),
        payload: { submitted_at: new Date().toISOString() },
        // Native crypto.randomUUID() generates a UUID v4 in browser without extra dependencies
        idempotency_key: useIdempotency ? crypto.randomUUID() : undefined,
      });
      setTitle('');
      onCreated();
    } catch (e: unknown) {
      const err = e as { message?: string; response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || err.message || 'Failed to create job');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-xl p-5 mb-8 bg-white shadow-xs">
      <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span>➕</span> Crear Nuevo Trabajo
      </h2>
      <div className="flex gap-3 mb-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Procesar Reporte de Ventas"
          required
          className="flex-1 border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
        >
          {submitting ? 'Creando...' : 'Crear Job'}
        </button>
      </div>
      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={useIdempotency}
          onChange={(e) => setUseIdempotency(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span>Usar clave de idempotencia única (evita procesamiento duplicado en reintentos de red)</span>
      </label>
      {error && (
        <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          ❌ {error}
        </div>
      )}
    </form>
  );
}
