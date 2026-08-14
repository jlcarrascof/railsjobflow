import { useJobs } from '@/hooks/useJobs';
import JobStatusBadge from '@/components/JobStatusBadge';
import CreateJobForm from '@/components/CreateJobForm';

export default function DashboardView() {
  const { jobs, loading, error, refetch } = useJobs();

  // Observability metrics calculated in real-time on frontend
  const stats = {
    total: jobs.length,
    pending: jobs.filter((j) => j.status === 'pending').length,
    running: jobs.filter((j) => j.status === 'running').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
    failed: jobs.filter((j) => j.status === 'failed').length,
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-gray-500 font-medium text-sm">
          <span className="animate-spin text-blue-600 text-lg">⚙️</span> Conectando con RailsJobFlow...
        </div>
      </div>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center shadow-xs">
          <p className="text-red-700 font-semibold mb-2">❌ Error de Conexión</p>
          <p className="text-red-600 text-xs mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
          >
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-16">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-2xs">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">RailsJobFlow</h1>
              <p className="text-xs text-gray-500">Asynchronous Job Processing System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-medium text-gray-500">Polling cada 3s</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 pt-8">
        {/* Observability Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Jobs', value: stats.total, color: 'text-gray-900', border: 'border-gray-200' },
            { label: 'En Ejecución', value: stats.running, color: 'text-blue-600', border: 'border-blue-200' },
            { label: 'Completados', value: stats.completed, color: 'text-emerald-600', border: 'border-emerald-200' },
            { label: 'Fallidos', value: stats.failed, color: 'text-rose-600', border: 'border-rose-200' },
          ].map(({ label, value, color, border }) => (
            <div key={label} className={`bg-white border ${border} rounded-xl p-5 shadow-xs text-center`}>
              <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
              <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {/* Create Job Form Component */}
        <CreateJobForm onCreated={refetch} />

        {/* Jobs List Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
            <h2 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
              <span>📋</span> Lista de Trabajos Registrados
            </h2>
            <span className="text-xs text-gray-400 font-mono">{jobs.length} registros</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Título & Detalles</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5">Reintentos</th>
                  <th className="px-5 py-3.5">Duración</th>
                  <th className="px-5 py-3.5">Fecha Creación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{job.title}</p>
                      {job.idempotency_key && (
                        <p className="text-xs text-gray-400 font-mono mt-0.5 truncate max-w-xs">
                          🔑 {job.idempotency_key}
                        </p>
                      )}
                      {job.error_message && (
                        <p className="text-xs text-rose-600 mt-1 font-mono bg-rose-50 p-1.5 rounded-md border border-rose-100">
                          ⚠️ {job.error_message}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-gray-600">
                      {job.retries} / {job.max_retries}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-gray-600">
                      {job.duration_ms !== null && job.duration_ms !== undefined ? (
                        <span className="font-semibold text-gray-800">{job.duration_ms} ms</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500">
                      {new Date(job.created_at).toLocaleString('es-VE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {jobs.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <span className="text-3xl block mb-2">📥</span>
              <p className="text-sm font-medium">No hay trabajos registrados todavía.</p>
              <p className="text-xs text-gray-400 mt-1">Crea el primer trabajo usando el formulario de arriba.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
