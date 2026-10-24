import { useState, useEffect } from 'react';
import { getAuditLogs } from '../services/storage';
import type { AuditLog } from '../types';

export default function AuditLogView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    setLogs(getAuditLogs());
  }, []);

  const filtered = filter
    ? logs.filter(
        (l) =>
          l.action.toLowerCase().includes(filter.toLowerCase()) ||
          l.resource.toLowerCase().includes(filter.toLowerCase()) ||
          l.details.toLowerCase().includes(filter.toLowerCase()) ||
          l.userName.toLowerCase().includes(filter.toLowerCase())
      )
    : logs;

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN': return 'bg-green-500/20 text-green-300';
      case 'LOGOUT': return 'bg-gray-500/20 text-gray-300';
      case 'SAVE': return 'bg-blue-500/20 text-blue-300';
      case 'DELETE': return 'bg-red-500/20 text-red-300';
      case 'GDPR_CONSENT': return 'bg-yellow-500/20 text-yellow-300';
      case 'EXPORT': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-border/50 text-muted';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Registro de auditoría</h1>
        <span className="text-sm text-muted">{filtered.length} registros</span>
      </div>

      <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6 mb-6">
        <div className="border-l-3 border-warn pl-4 py-3 bg-notice-bg rounded-r-xl mb-4">
          <p className="text-sm text-muted">
            <strong className="text-ink">Cumplimiento RGPD:</strong> Todas las acciones del sistema se registran con fecha, usuario y detalles. Los datos se almacenan exclusivamente en este navegador.
          </p>
        </div>
        <input
          type="text"
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(0); }}
          placeholder="Filtrar por acción, recurso, usuario o detalle..."
          className="w-full px-4 py-3 bg-check-bg border border-border rounded-xl text-ink placeholder-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {paginated.length === 0 ? (
        <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-12 text-center">
          <p className="text-muted">No hay registros de auditoría</p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs text-muted font-medium">Fecha/Hora</th>
                  <th className="text-left py-3 px-4 text-xs text-muted font-medium">Usuario</th>
                  <th className="text-left py-3 px-4 text-xs text-muted font-medium">Acción</th>
                  <th className="text-left py-3 px-4 text-xs text-muted font-medium">Recurso</th>
                  <th className="text-left py-3 px-4 text-xs text-muted font-medium">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((log) => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-check-bg/50 transition-colors">
                    <td className="py-3 px-4 text-sm whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm">{log.userName}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted">{log.resource}</td>
                    <td className="py-3 px-4 text-sm text-muted max-w-xs truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-border">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="bg-check-bg border border-border px-4 py-2 rounded-lg text-sm hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-muted">
                Página {page + 1} de {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="bg-check-bg border border-border px-4 py-2 rounded-lg text-sm hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
