import { useEffect, useState } from 'react';
import { fetchOAuthToken } from '@/api/client';
import DashboardView from '@/views/DashboardView';

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Automatically fetch OAuth2 Bearer token on app startup
    fetchOAuthToken()
      .then(() => setReady(true))
      .catch((e: unknown) => {
        const err = e as { message?: string; response?: { data?: { error?: string } } };
        setError('No se pudo conectar con la API de OAuth2: ' + (err.response?.data?.error || err.message));
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center shadow-xs">
          <p className="text-red-700 font-semibold mb-2">🔒 Error de Autenticación OAuth2</p>
          <p className="text-red-600 text-xs mb-4">{error}</p>
          <p className="text-xs text-gray-500">
            Asegúrate de que el servidor de Rails esté encendido en <code className="bg-red-100 px-1 py-0.5 rounded text-red-800 font-mono">http://localhost:3001</code>.
          </p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-gray-600 font-medium text-sm">
          <span className="animate-spin text-blue-600 text-xl">⚡</span>
          <span>Autenticando cliente OAuth2 y conectando con el backend...</span>
        </div>
      </div>
    );
  }

  return <DashboardView />;
}
